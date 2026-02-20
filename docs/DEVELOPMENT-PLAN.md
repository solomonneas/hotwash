# Playbook Forge - Development Plan

## Overview

Six-phase build from demo to production IR orchestration tool. Each phase has a detailed PRD in this directory.

## Phase Summary

| Phase | Name | Effort | Agent Model | PRD |
|-------|------|--------|-------------|-----|
| 1 | Parser + Viewer | **DONE** | - | - |
| 2 | CRUD + Persistence | Medium (2-3 sessions) | Codex (GPT 5.3) | [PRD-Phase2](PRD-Phase2-CRUD-Persistence.md) |
| 3 | Export + Sharing | Low (1-2 sessions) | Codex (GPT 5.3) | [PRD-Phase3](PRD-Phase3-Export-Sharing.md) |
| 4 | SOAR Integration | High (3-4 sessions) | Codex + Opus review | [PRD-Phase4](PRD-Phase4-SOAR-Integration.md) |
| 5 | Execution Tracking | High (3-4 sessions) | Codex + Opus review | [PRD-Phase5](PRD-Phase5-Execution-Tracking.md) |
| 6 | AI Authoring + MCP | Medium (2-3 sessions) | Opus + Codex | [PRD-Phase6](PRD-Phase6-AI-Authoring.md) |

## Dependency Graph

```
Phase 1 (DONE)
    └── Phase 2 (CRUD)
         ├── Phase 3 (Export)
         │    └── Phase 4 (SOAR) ←── also needs Phase 2
         │         └── Phase 5 (Execution) ←── also needs Phase 2
         └── Phase 6 (AI) ←── enhanced by Phase 4 (SOAR context)
```

**Critical path:** 1 → 2 → 3 → 4 → 5
**Parallel opportunity:** Phase 6 can start after Phase 2, before Phase 4/5

## Sub-Agent Assignment Strategy

### Codex (GPT 5.3) handles:
- All SQLAlchemy models, migrations, CRUD routes
- API client scaffolding (TheHive, Cortex, Wazuh, MISP wrappers)
- Frontend components (editor, library rewrite, execution view)
- WebSocket implementation
- Export format generators
- MCP server implementation

### Opus handles:
- PRD writing (done)
- Prompt engineering for AI generation (Phase 6)
- UX review on complex flows (editor, execution mode)
- After-action report template design
- Integration architecture decisions
- Polish passes before merge

### Haiku handles:
- File scanning during builds
- Bulk find/replace operations
- Boilerplate generation from templates

## Task Count Per Phase

| Phase | Backend Tasks | Frontend Tasks | Total |
|-------|--------------|----------------|-------|
| 2 | 15 | 10 | 25 |
| 3 | 9 | 8 | 17 |
| 4 | 20 | 4 | 24 |
| 5 | 12 | 10 | 22 |
| 6 | 16 | 7 | 23 |
| **Total** | **72** | **39** | **111** |

## Build Order (Recommended)

### Sprint 1: Phase 2 (Foundation)
1. Backend: database + models + seed (2.1)
2. Backend: CRUD routes (2.2)
3. Backend: version history (2.3)
4. Frontend: API client (2.6)
5. Frontend: library rewrite (2.5)
6. Frontend: editor page (2.4)
7. Integration test: create → edit → list → delete flow

### Sprint 2: Phase 3 (Quick Win)
1. Backend: export endpoints (3.1)
2. Backend: PDF generation (3.2)
3. Backend: share links (3.3)
4. Frontend: export UI (3.4)
5. Frontend: share + print (3.5)

### Sprint 3: Phase 4 (Differentiator)
1. Integration config system (4.1)
2. TheHive integration (4.2)
3. Cortex integration (4.3)
4. Wazuh integration (4.4)
5. MISP integration (4.5)
6. Integration dashboard UI (4.6)
7. Mock mode for all integrations

### Sprint 4: Phase 5 (Production Feature)
1. Execution data model (5.1)
2. Execution API (5.2)
3. WebSocket real-time (5.3)
4. Execution mode UI (5.4)
5. After-action reports (5.5)
6. Multi-analyst indicators (5.6)

### Sprint 5: Phase 6 (AI Layer)
1. AI generation engine + prompts (6.1)
2. Improvement suggestions (6.2)
3. ATT&CK mapping (6.3)
4. Context-aware generation (6.4)
5. AI UI components (6.5)
6. MCP server (6.6)

## Current Codebase Stats

- **Frontend:** ~11,800 lines TypeScript/TSX
- **Backend:** FastAPI with 1 real endpoint (`/api/parse`)
- **5 variants** (themes), 5 custom node types, React Flow canvas
- **5 demo playbooks** hardcoded in `web/src/data/`
- **No database, no persistence, no CRUD**
