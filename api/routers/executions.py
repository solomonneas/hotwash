"""
Executions Router

REST + WebSocket endpoints for running incident playbooks step by step.
"""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Query,
    UploadFile,
    WebSocket,
    WebSocketDisconnect,
    status,
)
from sqlalchemy import desc
from sqlalchemy.orm import Session

from api.auth import get_api_key
from api.database import get_db, SessionLocal
from api.orm_models import Execution, ExecutionEvent, Playbook
from api.schemas import (
    ExecutionCreate,
    ExecutionDetail,
    ExecutionStep,
    ExecutionStepUpdate,
    ExecutionSummary,
    ExecutionUpdate,
    TimelineEventOut,
)
from api.services.executions import (
    TERMINAL_EXECUTION_STATUSES,
    broadcaster,
    build_steps_from_playbook,
    find_step,
    load_steps,
    now_iso,
    serialize_steps,
    step_progress,
)

logger = logging.getLogger(__name__)

EVIDENCE_ROOT = Path(__file__).resolve().parent.parent / "data" / "evidence"
MAX_EVIDENCE_BYTES = 25 * 1024 * 1024  # 25 MB

VALID_EXECUTION_STATUSES = {"active", "paused", "completed", "abandoned"}
VALID_STEP_STATUSES = {"not_started", "in_progress", "completed", "skipped", "blocked"}

router = APIRouter(dependencies=[Depends(get_api_key)])

# Websocket route registered without auth so the existing client can connect;
# tighten with per-run tokens when the roadmap's auth design lands.
ws_router = APIRouter()


def _ensure_execution(db: Session, execution_id: int) -> Execution:
    execution = db.query(Execution).filter(Execution.id == execution_id).first()
    if not execution:
        raise HTTPException(status_code=404, detail="Execution not found")
    return execution


def _summary(execution: Execution, steps: List[Dict[str, Any]]) -> ExecutionSummary:
    total, completed = step_progress(steps)
    playbook_title = execution.playbook.title if execution.playbook else None
    return ExecutionSummary(
        id=execution.id,
        playbook_id=execution.playbook_id,
        playbook_title=playbook_title,
        incident_title=execution.incident_title,
        incident_id=execution.incident_id,
        status=execution.status,
        started_by=execution.started_by,
        started_at=execution.started_at,
        completed_at=execution.completed_at,
        steps_total=total,
        steps_completed=completed,
    )


def _record_event(
    db: Session,
    execution: Execution,
    event_type: str,
    description: str,
    actor: Optional[str] = None,
) -> ExecutionEvent:
    event = ExecutionEvent(
        execution_id=execution.id,
        event_type=event_type,
        actor=actor,
        description=description,
    )
    db.add(event)
    db.flush()
    return event


async def _broadcast(execution_id: int, event_type: str, data: Optional[Dict[str, Any]] = None) -> None:
    payload = {"type": event_type, "timestamp": now_iso()}
    if data:
        payload["data"] = data
    await broadcaster.broadcast(execution_id, payload)


@router.post("/executions", response_model=ExecutionSummary, status_code=status.HTTP_201_CREATED)
async def create_execution(payload: ExecutionCreate, db: Session = Depends(get_db)):
    playbook = db.query(Playbook).filter(Playbook.id == payload.playbook_id, Playbook.is_deleted.is_(False)).first()
    if not playbook:
        raise HTTPException(status_code=404, detail="Playbook not found")

    steps = build_steps_from_playbook(playbook)

    execution = Execution(
        playbook_id=playbook.id,
        incident_title=payload.incident_title.strip(),
        incident_id=payload.incident_id,
        started_by=payload.started_by,
        status="active",
        steps_json=serialize_steps(steps),
        context_json=json.dumps(payload.context) if payload.context is not None else None,
    )
    db.add(execution)
    db.flush()

    _record_event(
        db,
        execution,
        event_type="execution_started",
        description=f"Execution started for playbook '{playbook.title}'",
        actor=payload.started_by,
    )
    db.commit()
    db.refresh(execution)

    summary = _summary(execution, steps)
    await _broadcast(execution.id, "execution_started", {"execution_id": execution.id})
    return summary


@router.get("/executions", response_model=List[ExecutionSummary])
def list_executions(
    db: Session = Depends(get_db),
    status_filter: Optional[str] = Query(default=None, alias="status"),
    playbook_id: Optional[int] = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
):
    query = db.query(Execution)
    if status_filter:
        query = query.filter(Execution.status == status_filter)
    if playbook_id is not None:
        query = query.filter(Execution.playbook_id == playbook_id)
    executions = query.order_by(desc(Execution.started_at)).limit(limit).all()
    return [_summary(execution, load_steps(execution)) for execution in executions]


@router.get("/executions/{execution_id}", response_model=ExecutionDetail)
def get_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = _ensure_execution(db, execution_id)
    steps = load_steps(execution)
    return ExecutionDetail(
        execution=_summary(execution, steps),
        steps=[ExecutionStep(**step) for step in steps],
        playbook_title=execution.playbook.title if execution.playbook else None,
    )


@router.patch("/executions/{execution_id}", response_model=ExecutionSummary)
async def update_execution(
    execution_id: int,
    payload: ExecutionUpdate,
    db: Session = Depends(get_db),
):
    execution = _ensure_execution(db, execution_id)

    if payload.status is not None:
        if payload.status not in VALID_EXECUTION_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid status: {payload.status}")
        execution.status = payload.status
        if payload.status in TERMINAL_EXECUTION_STATUSES and execution.completed_at is None:
            execution.completed_at = datetime.now(timezone.utc)
        event_map = {
            "paused": ("execution_paused", "Execution paused"),
            "active": ("execution_resumed", "Execution resumed"),
            "completed": ("execution_completed", "Execution completed"),
            "abandoned": ("execution_abandoned", "Execution abandoned"),
        }
        event_type, description = event_map.get(payload.status, ("execution_updated", f"Status changed to {payload.status}"))
        _record_event(db, execution, event_type=event_type, description=description)

    if payload.notes is not None:
        execution.notes = payload.notes
        _record_event(db, execution, event_type="notes_updated", description="Execution notes updated")

    db.commit()
    db.refresh(execution)
    steps = load_steps(execution)
    summary = _summary(execution, steps)
    await _broadcast(execution.id, "execution_updated", {"status": execution.status})
    return summary


@router.delete("/executions/{execution_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_execution(execution_id: int, db: Session = Depends(get_db)):
    execution = _ensure_execution(db, execution_id)
    db.delete(execution)
    db.commit()
    return None


@router.patch("/executions/{execution_id}/steps/{node_id}", response_model=ExecutionDetail)
async def update_step(
    execution_id: int,
    node_id: str,
    payload: ExecutionStepUpdate,
    db: Session = Depends(get_db),
):
    execution = _ensure_execution(db, execution_id)
    steps = load_steps(execution)
    step = find_step(steps, node_id)
    if step is None:
        raise HTTPException(status_code=404, detail="Step not found")

    now = datetime.now(timezone.utc).isoformat()
    events_to_emit: List[tuple[str, str]] = []

    if payload.status is not None:
        if payload.status not in VALID_STEP_STATUSES:
            raise HTTPException(status_code=400, detail=f"Invalid step status: {payload.status}")
        previous = step.get("status")
        step["status"] = payload.status
        if payload.status == "in_progress" and not step.get("started_at"):
            step["started_at"] = now
            events_to_emit.append(("step_started", f"Step '{step.get('node_label')}' started"))
        if payload.status in {"completed", "skipped"} and previous != payload.status:
            step["completed_at"] = now
            label = "completed" if payload.status == "completed" else "skipped"
            events_to_emit.append(("step_completed", f"Step '{step.get('node_label')}' {label}"))

    if payload.assignee is not None:
        step["assignee"] = payload.assignee or None
        events_to_emit.append(("assignee_changed", f"Assignee set to {payload.assignee or 'unassigned'} for '{step.get('node_label')}'"))

    if payload.notes:
        existing_notes = list(step.get("notes") or [])
        existing_notes.append(payload.notes)
        step["notes"] = existing_notes
        events_to_emit.append(("note_added", f"Note added to '{step.get('node_label')}'"))

    if payload.decision_taken is not None:
        step["decision_taken"] = payload.decision_taken
        events_to_emit.append(("decision_taken", f"Decision '{payload.decision_taken}' on '{step.get('node_label')}'"))

    execution.steps_json = serialize_steps(steps)
    for event_type, description in events_to_emit:
        _record_event(db, execution, event_type=event_type, description=description)

    db.commit()
    db.refresh(execution)
    steps = load_steps(execution)

    detail = ExecutionDetail(
        execution=_summary(execution, steps),
        steps=[ExecutionStep(**s) for s in steps],
        playbook_title=execution.playbook.title if execution.playbook else None,
    )
    await _broadcast(execution.id, "step_updated", {"node_id": node_id})
    return detail


@router.post("/executions/{execution_id}/steps/{node_id}/evidence", response_model=ExecutionStep)
async def upload_evidence(
    execution_id: int,
    node_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    execution = _ensure_execution(db, execution_id)
    steps = load_steps(execution)
    step = find_step(steps, node_id)
    if step is None:
        raise HTTPException(status_code=404, detail="Step not found")

    body = await file.read()
    if len(body) > MAX_EVIDENCE_BYTES:
        raise HTTPException(status_code=413, detail="Evidence file exceeds size limit")

    target_dir = EVIDENCE_ROOT / str(execution.id) / node_id
    target_dir.mkdir(parents=True, exist_ok=True)
    safe_name = Path(file.filename or "evidence.bin").name
    target_path = target_dir / safe_name
    target_path.write_bytes(body)

    uploaded_at = datetime.now(timezone.utc).isoformat()
    evidence_list = list(step.get("evidence") or [])
    evidence_list.append({
        "filename": safe_name,
        "size": len(body),
        "uploaded_at": uploaded_at,
    })
    step["evidence"] = evidence_list

    execution.steps_json = serialize_steps(steps)
    _record_event(
        db,
        execution,
        event_type="evidence_attached",
        description=f"Evidence '{safe_name}' attached to '{step.get('node_label')}'",
    )
    db.commit()
    await _broadcast(execution.id, "evidence_attached", {"node_id": node_id, "filename": safe_name})
    return ExecutionStep(**step)


@router.get("/executions/{execution_id}/timeline", response_model=List[TimelineEventOut])
def get_timeline(execution_id: int, db: Session = Depends(get_db)):
    execution = _ensure_execution(db, execution_id)
    events = (
        db.query(ExecutionEvent)
        .filter(ExecutionEvent.execution_id == execution.id)
        .order_by(desc(ExecutionEvent.timestamp))
        .all()
    )
    return [
        TimelineEventOut(
            timestamp=event.timestamp,
            event_type=event.event_type,
            actor=event.actor,
            description=event.description,
        )
        for event in events
    ]


@ws_router.websocket("/executions/{execution_id}/live")
async def execution_socket(websocket: WebSocket, execution_id: int):
    db = SessionLocal()
    try:
        exists = db.query(Execution.id).filter(Execution.id == execution_id).first()
    finally:
        db.close()
    if not exists:
        await websocket.close(code=4404)
        return

    await broadcaster.connect(execution_id, websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        await broadcaster.disconnect(execution_id, websocket)
