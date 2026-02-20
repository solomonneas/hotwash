# PRD: Phase 5 - Execution Tracking

**Project:** Playbook Forge
**Phase:** 5 of 6
**Priority:** P1 (Production feature - transforms tool into IR runbook)
**Estimated Effort:** High (3-4 build sessions)
**Depends on:** Phase 2 (CRUD), Phase 4 (SOAR for real action tracking)

---

## Problem Statement

Playbooks are currently static documents. During an actual incident, analysts need to track progress through the playbook: which steps are done, who's handling what, what was found at each step, and how long things took. Without execution tracking, Playbook Forge is a reference tool, not an operational tool.

## Goal

Add "live execution" mode where analysts can step through a playbook during an incident, tracking status, assignments, timestamps, notes, and evidence per step. Generate after-action reports automatically. Support multiple concurrent executions and real-time multi-analyst collaboration.

## Requirements

### 5.1 Backend: Execution Data Model

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 5.1.1 | Create `Execution` table: id, playbook_id, incident_title, incident_id (optional, for TheHive linking), status (active/paused/completed/abandoned), started_at, completed_at, started_by, notes. |
| 5.1.2 | Create `ExecutionStep` table: id, execution_id, node_id (maps to playbook graph node), status (not_started/in_progress/completed/skipped/blocked), assignee, started_at, completed_at, notes, decision_taken (for Decision nodes: which branch). |
| 5.1.3 | Create `StepEvidence` table: id, step_id, file_name, file_path, mime_type, uploaded_at, description. File storage in `api/data/evidence/{execution_id}/`. |
| 5.1.4 | Create `ExecutionEvent` table: id, execution_id, event_type (step_started, step_completed, note_added, assignee_changed, evidence_attached), node_id, actor, timestamp, details_json. This is the audit trail. |

### 5.2 Backend: Execution API

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 5.2.1 | `POST /api/executions` - Start new execution from a playbook. Creates execution + all ExecutionStep records (one per node) initialized to not_started. Body: `{playbook_id, incident_title, incident_id?}`. |
| 5.2.2 | `GET /api/executions` - List executions with filters: status, playbook_id, date range. |
| 5.2.3 | `GET /api/executions/{id}` - Full execution state: all steps with statuses, assignees, timestamps, notes. |
| 5.2.4 | `PATCH /api/executions/{id}/steps/{node_id}` - Update step: status, assignee, notes, decision_taken. Auto-records timestamp on status transitions. Creates ExecutionEvent. |
| 5.2.5 | `POST /api/executions/{id}/steps/{node_id}/evidence` - Upload evidence file for a step. Multipart form data. |
| 5.2.6 | `PATCH /api/executions/{id}` - Update execution status (pause, complete, abandon). Completing auto-sets completed_at. |
| 5.2.7 | `GET /api/executions/{id}/timeline` - Chronological list of all ExecutionEvents. |
| 5.2.8 | `GET /api/executions/{id}/report` - Auto-generated after-action report (see 5.5). |

### 5.3 Backend: WebSocket Real-Time Updates

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 5.3.1 | Add WebSocket endpoint: `ws /api/executions/{id}/live`. Broadcasts step status changes, assignee changes, new notes, new evidence to all connected clients. |
| 5.3.2 | Use FastAPI WebSocket with connection manager (track connected clients per execution). |
| 5.3.3 | Message format: `{event_type, node_id, data, actor, timestamp}`. Matches ExecutionEvent schema. |
| 5.3.4 | Heartbeat ping/pong to detect disconnected clients. |

### 5.4 Frontend: Execution Mode

**Sub-agent assignment:** Codex (GPT 5.3) for components, Opus review for UX flow

| Task | Description |
|------|-------------|
| 5.4.1 | "Start Execution" button on playbook view. Opens modal: incident title, optional incident ID. Creates execution and enters execution mode. |
| 5.4.2 | **Execution View:** Same flowchart canvas but with execution overlay. Each node shows status badge (color-coded: grey=not started, blue=in progress, green=completed, yellow=skipped, red=blocked). |
| 5.4.3 | **Step Panel:** Click a node to open side panel showing: status dropdown, assignee field, notes textarea (append-only, timestamped entries), evidence upload zone, decision selector (for Decision nodes). |
| 5.4.4 | **Progress Bar:** Top of page showing completion percentage (completed steps / total steps). |
| 5.4.5 | **Active Execution List:** Page showing all active and recent executions. Cards with: playbook name, incident title, progress bar, started time, analyst count. |
| 5.4.6 | **Timeline View:** Vertical timeline of all execution events in chronological order. Filter by event type. |
| 5.4.7 | **Route:** `#/execute/:executionId` for active execution view. `#/executions` for list. |

### 5.5 After-Action Report Generation

**Sub-agent assignment:** Opus (creative/judgment) for template design, Codex for implementation

| Task | Description |
|------|-------------|
| 5.5.1 | Auto-generate report from execution data. Sections: Executive Summary (incident title, duration, outcome), Timeline (chronological events), Step Details (each step with status, assignee, notes, evidence list, duration), Metrics (total time, mean time per step, bottleneck identification), Recommendations (placeholder for analyst input). |
| 5.5.2 | Export report as PDF (reuse Phase 3 PDF infrastructure). |
| 5.5.3 | Export report as Markdown. |
| 5.5.4 | Dashboard metrics: average execution time per playbook, most-used playbooks, common bottleneck steps across executions. |

### 5.6 Frontend: Multi-Analyst Indicators

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 5.6.1 | Show connected analysts as avatars/initials in the execution header (like Google Docs presence). |
| 5.6.2 | Show who's currently viewing/editing each step (highlight node border with analyst's color). |
| 5.6.3 | Real-time updates via WebSocket: when another analyst changes a step status, the flowchart updates instantly without refresh. |
| 5.6.4 | Optimistic UI: update locally on action, reconcile with server response. Conflict resolution: last-write-wins with notification. |

## Non-Goals (Phase 5)

- No automated step execution (Cortex triggers are Phase 4, but manual trigger only)
- No SLA/timer enforcement (just tracking)
- No mobile-optimized view (desktop focus)
- No integration with ticketing systems beyond TheHive

## Technical Decisions

- **WebSocket** over SSE: bidirectional communication needed for presence indicators
- **Append-only notes** per step: simpler than collaborative editing, maintains audit trail
- **File evidence stored locally** (`api/data/evidence/`): no cloud storage for portfolio tool
- **ExecutionEvent** table is the source of truth for timeline. Step statuses are derived/cached.
- **No user authentication**: analysts identified by name string, not login. Sufficient for portfolio demo. Production would need real auth.

## Success Criteria

1. Analyst can start an execution, step through nodes, mark completion
2. Notes and evidence attach to individual steps
3. Decision nodes record which branch was taken
4. Multiple browser tabs show real-time updates (WebSocket)
5. After-action report generates automatically with accurate timeline
6. Execution list shows all active and completed executions
7. Progress is visually clear on the flowchart (color-coded nodes)

## Deployment Notes

- WebSocket needs proper proxy config if behind nginx/Caddy
- Evidence uploads: set reasonable file size limit (50MB per file)
- Consider SQLite WAL mode for concurrent reads during execution
