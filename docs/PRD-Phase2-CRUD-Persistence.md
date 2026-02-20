# PRD: Phase 2 - Playbook Management (CRUD + Persistence)

**Project:** Playbook Forge
**Phase:** 2 of 6
**Priority:** P0 (Foundation - everything depends on this)
**Estimated Effort:** Medium (2-3 build sessions)

---

## Problem Statement

Playbook Forge is currently a demo. Playbooks are hardcoded TypeScript files in `web/src/data/`. Users cannot create, save, edit, or delete playbooks. The backend has a single `/api/parse` endpoint and an empty `playbooks.py` router. Without persistence, every other planned feature (export, SOAR integration, execution tracking) is blocked.

## Goal

Make Playbook Forge a real tool. Users create, save, edit, organize, and search playbooks through a proper CRUD interface backed by a SQLite database.

## Current State

- **Backend:** FastAPI with `/api/parse` (markdown/mermaid to graph). No database. No CRUD routes. `api/routers/playbooks.py` is an empty placeholder.
- **Frontend:** 5 visual variants, FlowCanvas (React Flow), MarkdownRenderer, PlaybookInput, GuidedTour. Playbook data loaded from `web/src/data/index.ts`. 11,798 lines of TS/TSX total.
- **Data Models:** `api/models.py` has `PlaybookNode`, `PlaybookEdge`, `PlaybookGraph`, `ParseRequest/Response`. No database models.

## Requirements

### 2.1 Backend: Database Layer

**Sub-agent assignment:** Codex (GPT 5.3) - structured schema work

| Task | Description |
|------|-------------|
| 2.1.1 | Create `api/database.py` with SQLAlchemy + SQLite setup. DB file at `api/data/playbooks.db`. |
| 2.1.2 | Define ORM models: `Playbook` (id, title, description, category, content_markdown, graph_json, created_at, updated_at, is_deleted), `Tag` (id, name), `PlaybookTag` (playbook_id, tag_id) |
| 2.1.3 | Create `api/seed.py` that reads existing demo playbooks from `api/playbooks/` directory and inserts them on first run |
| 2.1.4 | Add Alembic for migrations (initial migration from schema) |

### 2.2 Backend: CRUD API Routes

**Sub-agent assignment:** Codex (GPT 5.3) - structured endpoint work

| Task | Description |
|------|-------------|
| 2.2.1 | `POST /api/playbooks` - Create playbook. Accepts `{title, description, category, content_markdown, tags[]}`. Auto-parses markdown to graph_json via existing parser. Returns full playbook with ID. |
| 2.2.2 | `GET /api/playbooks` - List playbooks with filters. Query params: `category`, `tag`, `search` (full-text across title + content), `sort` (created, updated, title), `order` (asc/desc). Returns list without full content (summary view). |
| 2.2.3 | `GET /api/playbooks/{id}` - Get single playbook with full content, graph_json, and tags. |
| 2.2.4 | `PUT /api/playbooks/{id}` - Update playbook. Re-parses markdown on content change. Stores previous version before overwriting (see 2.3). |
| 2.2.5 | `DELETE /api/playbooks/{id}` - Soft delete (set is_deleted=true). |
| 2.2.6 | `POST /api/playbooks/{id}/duplicate` - Clone a playbook with new ID and "(Copy)" appended to title. |
| 2.2.7 | Register new router in `api/main.py`. Add CORS for local dev. |

### 2.3 Backend: Version History

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 2.3.1 | Add `PlaybookVersion` table (id, playbook_id, version_number, content_markdown, graph_json, created_at, change_summary) |
| 2.3.2 | `GET /api/playbooks/{id}/versions` - List version history |
| 2.3.3 | `GET /api/playbooks/{id}/versions/{version}` - Get specific version |
| 2.3.4 | On every `PUT`, auto-create version entry with previous state before applying update |

### 2.4 Frontend: Editor Page

**Sub-agent assignment:** Codex (GPT 5.3) with Opus review for UX decisions

| Task | Description |
|------|-------------|
| 2.4.1 | Create `web/src/pages/EditorPage.tsx` - Split-pane layout: markdown editor (left), live flowchart preview (right). Use CodeMirror or Monaco for the editor. |
| 2.4.2 | Live preview: debounce markdown changes (300ms), call parser, render flowchart in real-time. Use the existing client-side parser first, fall back to API. |
| 2.4.3 | Metadata panel: title, description, category dropdown (Vulnerability Remediation, Incident Response, Threat Hunting, Custom), tag input with autocomplete from existing tags. |
| 2.4.4 | Save button: `POST` for new, `PUT` for existing. Show save status indicator. |
| 2.4.5 | Route: `#/editor` (new) and `#/editor/:id` (edit existing). |

### 2.5 Frontend: Library Rewrite

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 2.5.1 | Replace hardcoded `web/src/data/` imports with API calls to `GET /api/playbooks`. |
| 2.5.2 | Add search bar, category filter chips, tag filter. |
| 2.5.3 | Playbook cards: title, category badge, tag pills, last updated, node count. Click to view, edit button, delete button (with confirmation modal). |
| 2.5.4 | "New Playbook" button that routes to `#/editor`. |
| 2.5.5 | Fallback: if API is unreachable, load demo data from a bundled JSON file (offline-first for portfolio demos). |

### 2.6 Frontend: API Client

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 2.6.1 | Create `web/src/api/client.ts` - typed API client using fetch. Base URL from env var `VITE_API_URL` (default `http://localhost:8000`). |
| 2.6.2 | Functions: `listPlaybooks()`, `getPlaybook(id)`, `createPlaybook(data)`, `updatePlaybook(id, data)`, `deletePlaybook(id)`, `duplicatePlaybook(id)`, `getVersions(id)`. |
| 2.6.3 | Error handling: toast notifications for API errors, loading states. |

## Non-Goals (Phase 2)

- No user auth (single-user tool for now)
- No collaborative editing
- No export formats (Phase 3)
- No SOAR integration (Phase 4)
- No AI generation (Phase 6)

## Technical Decisions

- **SQLite** over Postgres: single-file, zero-config, perfect for a portfolio tool that deploys anywhere
- **SQLAlchemy** ORM: standard Python, Alembic migrations, async support if needed later
- **Client-side parser preferred** for live preview (zero latency). API parser as validation/fallback.
- **Soft deletes** over hard deletes: safer, supports undo
- **CodeMirror 6** for editor: lighter than Monaco, markdown mode, better mobile support

## Success Criteria

1. User can create a new playbook from scratch, see live flowchart preview, and save it
2. User can browse saved playbooks, search by title/tag, filter by category
3. User can edit existing playbooks with changes persisted
4. User can delete playbooks (soft delete)
5. Version history shows previous states of any playbook
6. Demo playbooks auto-seed on first API launch
7. Frontend works offline with bundled demo data when API is down

## Dependencies

- Phase 1 (parser + viewer) - DONE
- No external dependencies beyond existing stack

## Deployment Notes

- SQLite DB file should be in `.gitignore` (not committed)
- Seed script runs on first launch (checks if DB is empty)
- PM2 config needs update for backend process
