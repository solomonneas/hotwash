# Roadmap

Hotwash today is an interactive IR playbook builder with a runtime: parse
Markdown or Mermaid into a flowchart, persist playbooks, run them step by
step, and generate new ones with AI. The next phase turns that runtime into
something other tools and AI agents can drive.

The two pillars below are intended to land in parallel; they are independent
in implementation but reinforce each other in production (Wazuh fires an
alert, the MCP server lets an agent walk a SOC analyst through the matching
playbook).

## Pillar 1: hotwash-mcp

A Model Context Protocol server that exposes the playbook engine to MCP
clients (Claude Code, OpenClaw, Codex CLI, Cursor, Hermes, etc.).

Lives at `mcp/` in this repo and ships as `hotwash-mcp` on npm.

### Tools to expose

| Tool | Purpose |
|------|---------|
| `list_playbooks` | Browse the library, filter by tag/category |
| `get_playbook` | Fetch full graph (nodes, edges, metadata) |
| `start_run` | Begin an execution with optional context (alert payload, IOC, ticket id) |
| `advance_step` | Mark a step done, attach evidence, branch on a decision |
| `attach_artifact` | Upload a file or text blob to the current step |
| `query_run` | Get current run state (active step, history, decisions taken) |
| `cancel_run` | Abandon a run with a reason |

### Open design questions

- **Transport.** stdio for local-launched servers; HTTP+SSE for hosted. Likely both.
- **Auth.** Per-run bearer token issued by the API on `start_run`? Or reuse the existing `X-API-Key`?
- **AI generation.** Expose `draft_playbook(prompt)` as a tool, or keep generation UI-only? Leaning toward exposing it.
- **Read vs. write split.** Some clients (OpenClaw subagents) should get read-only by default; needs a tool-allowlist convention.

### Done means

- `npx hotwash-mcp` starts a server pointed at a Hotwash API URL
- Claude Code config snippet and OpenClaw skill stub in the README
- Round-trip integration test: list -> start -> advance -> query

## Pillar 2: Wazuh alert ingestion

Turn an inbound Wazuh alert into a Hotwash run. Wazuh is already a configurable
tool in the integrations panel (credentials only); this adds the ingestion path.

### Components

- `POST /api/ingest/wazuh` webhook endpoint accepting Wazuh's integration JSON
- A mapping table: `(rule.id | rule.groups | agent.name pattern) -> playbook_id`
- Three trigger modes per mapping: `auto` (start the run), `suggest` (queue a notification), `off`
- Cooldown + fingerprint dedup so an alert storm cannot spawn duplicate runs
- Alert payload becomes `start_run` context, available to step instructions and SOAR action templates

### Open design questions

- **Push vs. pull.** Webhook from a Wazuh integration script is simplest. Polling the Wazuh API is a fallback for environments where outbound webhooks are blocked.
- **Mapping storage.** New table, or a `triggers` field on the playbook record?
- **Auth on the webhook.** HMAC over a shared secret per-mapping? IP allowlist?

### Done means

- A demo where firing a synthetic Wazuh alert triggers a run visible in the executions UI within seconds
- One real mapping shipped as a seed (the existing Python CVE playbook is a natural candidate)
- Docs for wiring up Wazuh's integration block

## Supporting work (lands as the pillars need it)

- **Connector interface.** SOAR Execute nodes are template strings today. Define a connector contract so they can become live calls. Start with one connector (AdGuard, n8n webhook, or generic HTTP) and use that to shape the contract.
- **CLI.** `hotwash run <playbook>` driven by the same engine as the UI. Useful as a Wazuh action target and as a fallback when the web UI is not available.
- **ATT&CK mapping.** The `ATTACKMappingPanel.tsx` exists; finish wiring techniques to nodes and surface them in run reports.
- **Storage migration tooling.** Already in place for the rebrand; reusable when the playbook schema next changes.

## Beyond

These are not scheduled, just parking-lot ideas worth keeping visible.

- Real-time multi-user runs (websocket transport, audit log)
- Connector marketplace (plug-in npm packages, similar shape to MCP servers)
- STIX / MISP / IACD export formats so playbooks travel between tools
- Dry-run mode: replay a synthetic alert through a playbook end-to-end without side effects
- Metrics dashboard (MTTD, MTTR, step duration distributions per playbook)
- Playbook versioning with git-style diffs
- Import recipes for NIST SP 800-61, CISA, and MITRE D3FEND library content

## Status legend

When work starts on an item, link the PR or issue inline next to the bullet.
The roadmap is the source of truth for "what's next" and a hint, not a
contract; pull requests that ignore the order but improve the product are
welcome.
