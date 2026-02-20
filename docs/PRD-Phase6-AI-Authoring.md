# PRD: Phase 6 - AI-Assisted Authoring + MCP Server

**Project:** Playbook Forge
**Phase:** 6 of 6
**Priority:** P2 (Enhancement - builds on solid foundation)
**Estimated Effort:** Medium (2-3 build sessions)
**Depends on:** Phase 2 (CRUD), Phase 4 (SOAR for ATT&CK mapping)

---

## Problem Statement

Writing good playbooks is hard. Security teams either copy generic templates or spend hours crafting custom ones. AI can generate contextually relevant playbooks from threat descriptions, auto-map steps to MITRE ATT&CK, and suggest improvements to existing playbooks. An MCP server makes the playbook library accessible to AI assistants.

## Goal

Add AI-powered playbook generation, improvement suggestions, and ATT&CK mapping. Expose the playbook library as an MCP server for AI assistant integration.

## Requirements

### 6.1 Backend: AI Generation Engine

**Sub-agent assignment:** Opus (prompt engineering + architecture), Codex for implementation

| Task | Description |
|------|-------------|
| 6.1.1 | Create `api/ai/generator.py` - Playbook generation from natural language. Input: threat description string. Output: structured Markdown playbook. Uses configurable LLM backend (OpenAI API, Ollama, or Anthropic). |
| 6.1.2 | `POST /api/ai/generate` - Body: `{description, category?, mitre_techniques?[], complexity?}`. Returns generated playbook markdown + parsed graph. Does NOT auto-save (user reviews first). |
| 6.1.3 | System prompt engineering: output must follow the exact Markdown format the parser expects (Phase/Step/Decision/Execute syntax). Include NIST IR framework alignment. |
| 6.1.4 | Create `api/ai/config.py` - LLM provider config (model, endpoint, API key). Default to Ollama for zero-cost local generation. |

### 6.2 Backend: AI Improvement Suggestions

**Sub-agent assignment:** Opus for prompt design, Codex for implementation

| Task | Description |
|------|-------------|
| 6.2.1 | `POST /api/ai/improve` - Body: `{playbook_id}`. Analyzes existing playbook and returns structured suggestions: missing phases, weak decision criteria, missing evidence collection steps, missing communication steps, NIST alignment gaps. |
| 6.2.2 | `POST /api/ai/expand-step` - Body: `{playbook_id, node_id, context?}`. Expands a single step into detailed sub-steps. E.g., "Isolate host" becomes 5 specific actions with commands. |
| 6.2.3 | Suggestions returned as structured JSON, not free text. Each suggestion: `{type, target_node_id?, description, suggested_content, priority}`. |

### 6.3 Backend: MITRE ATT&CK Mapping

**Sub-agent assignment:** Codex (GPT 5.3) - structured data work

| Task | Description |
|------|-------------|
| 6.3.1 | Bundle MITRE ATT&CK Enterprise matrix as local JSON (techniques, tactics, sub-techniques). Update script to pull latest from MITRE STIX data. |
| 6.3.2 | `POST /api/ai/map-attack` - Body: `{playbook_id}`. AI analyzes playbook content and suggests ATT&CK technique mappings for each step. Returns: `[{node_id, technique_id, technique_name, tactic, confidence}]`. |
| 6.3.3 | `GET /api/attack/techniques` - Search/browse ATT&CK techniques. Query params: tactic, search term. For manual mapping UI. |
| 6.3.4 | Add `attack_mappings` field to playbook metadata. Store confirmed technique mappings per node. |
| 6.3.5 | Frontend: ATT&CK badges on mapped nodes. Click to see technique details. Manual override to confirm/reject AI suggestions. |

### 6.4 Backend: AI Playbook from Context

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 6.4.1 | `POST /api/ai/generate-from-alert` - Body: `{wazuh_alert_json}`. Generate playbook tailored to the specific alert (requires Phase 4 Wazuh integration). |
| 6.4.2 | `POST /api/ai/generate-from-event` - Body: `{misp_event_id}`. Pull MISP event details and generate a response playbook from its attributes and tags (requires Phase 4 MISP integration). |
| 6.4.3 | `POST /api/ai/generate-from-techniques` - Body: `{technique_ids[]}`. Generate a detection + response playbook covering the specified ATT&CK techniques. |

### 6.5 Frontend: AI Features

**Sub-agent assignment:** Codex (GPT 5.3) for components, Opus for UX review

| Task | Description |
|------|-------------|
| 6.5.1 | "Generate Playbook" page: text area for threat description, optional technique selector, category picker, complexity slider (basic/intermediate/advanced). Generate button shows loading state, then presents playbook in editor for review before saving. |
| 6.5.2 | "Improve" button on existing playbook: shows suggestions panel with accept/reject per suggestion. Accept inserts the suggestion into the playbook. |
| 6.5.3 | "Map to ATT&CK" button: shows mapping suggestions overlay on flowchart. Each suggestion is a badge on the relevant node. Click to confirm or dismiss. |
| 6.5.4 | Natural language edit bar: text input at top of editor. "Add a notification step after containment" -> AI generates the step and inserts it at the right position in the graph. |
| 6.5.5 | AI settings: provider selector (Ollama/OpenAI/Anthropic), model picker, temperature slider. |

### 6.6 MCP Server

**Sub-agent assignment:** Opus (architecture), Codex for implementation

| Task | Description |
|------|-------------|
| 6.6.1 | Create `api/mcp/server.py` - MCP server exposing Playbook Forge as tools and resources. Use the MCP Python SDK. |
| 6.6.2 | **Tools:** `create_playbook(title, content_markdown, category, tags)`, `list_playbooks(category?, search?)`, `get_playbook(id)`, `suggest_steps(playbook_id, context)`, `map_to_attack(playbook_id)`, `generate_playbook(description, category?, complexity?)` |
| 6.6.3 | **Resources:** `playbook://{id}` (single playbook as Markdown), `playbook://library` (index of all playbooks), `playbook://{id}/graph` (graph JSON), `execution://{id}` (execution status) |
| 6.6.4 | MCP server runs as subprocess or separate process alongside the main API. Document configuration for Claude Desktop, OpenClaw, and other MCP clients. |
| 6.6.5 | Add MCP server to PM2 ecosystem config. |

## Non-Goals (Phase 6)

- No fine-tuning custom models (use general-purpose LLMs with good prompts)
- No autonomous playbook execution (AI suggests, human decides)
- No training on internal incident data (privacy concern, out of scope)

## Technical Decisions

- **Ollama default** for AI features: zero-cost, runs on our RTX Ada 2000, no API keys needed. qwen2.5:14b for generation, nomic-embed-text for similarity search.
- **Structured output** from LLM: use JSON mode or constrained output. Parse and validate before presenting to user.
- **MCP Python SDK** (official Anthropic): latest stable version. Stdio transport for local, SSE for remote.
- **ATT&CK data bundled locally**: no runtime dependency on MITRE servers. Update script for periodic refresh.
- **AI features are opt-in**: app works fully without any LLM configured. AI buttons hidden when no provider is set up.

## Success Criteria

1. Generate a coherent, parser-compatible playbook from a 1-2 sentence threat description
2. Improvement suggestions are specific and actionable (not generic "add more detail")
3. ATT&CK mappings are reasonable (>70% accuracy on common techniques)
4. MCP server works with Claude Desktop and OpenClaw
5. Natural language editing correctly inserts/modifies steps in the graph
6. All AI features work with local Ollama (no cloud dependency required)
7. Non-AI users see no degradation (features hidden when unconfigured)

## Deployment Notes

- Ollama must be running for local AI features. Document model pull commands.
- MCP server needs its own port or stdio config
- ATT&CK JSON bundle: ~15MB, include in repo or download on first run
- Rate limiting on AI endpoints to prevent abuse in shared deployments
