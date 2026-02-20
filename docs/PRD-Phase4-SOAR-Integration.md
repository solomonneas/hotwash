# PRD: Phase 4 - SOAR Integration (S³ Stack)

**Project:** Playbook Forge
**Phase:** 4 of 6
**Priority:** P0 (Core differentiator - this is what makes the tool unique)
**Estimated Effort:** High (3-4 build sessions)
**Depends on:** Phase 2 (CRUD), Phase 3 (Export for template generation)

---

## Problem Statement

Plenty of flowchart tools exist. None of them wire directly into SOC tooling. Playbook Forge's README promises SOAR integration but the code doesn't deliver it. The S³ Stack (Wazuh, TheHive, Cortex, MISP) is Solomon's core portfolio differentiator. Connecting Playbook Forge to these tools transforms it from "another flowchart app" into "an IR orchestration layer."

## Goal

Wire Playbook Forge into TheHive, Cortex, Wazuh, and MISP so playbooks become executable workflows, not just documentation. Playbook steps map to real SOAR actions, and playbooks can be triggered by real alerts.

## Current State

- SOAR actions mentioned in README are templates only (no code behind them)
- No API integrations to any external SOC tools
- No configuration for external tool endpoints/credentials

## Requirements

### 4.1 Integration Configuration

**Sub-agent assignment:** Codex (GPT 5.3) - API client scaffolding

| Task | Description |
|------|-------------|
| 4.1.1 | Create `api/integrations/config.py` - Configuration model for external tool connections: `{tool_name, base_url, api_key, enabled, verify_ssl}`. Store in SQLite `integrations` table. |
| 4.1.2 | `GET /api/integrations` - List configured integrations with connection status (connected/disconnected/error). |
| 4.1.3 | `PUT /api/integrations/{tool}` - Update connection settings. Test connection on save. |
| 4.1.4 | `GET /api/integrations/{tool}/status` - Health check (ping the tool's API). |
| 4.1.5 | Frontend settings page: form for each integration (TheHive, Cortex, Wazuh, MISP) with URL, API key, test button, status indicator. |

### 4.2 TheHive Integration

**Sub-agent assignment:** Codex (GPT 5.3) for API client, Opus review for mapping logic

| Task | Description |
|------|-------------|
| 4.2.1 | Create `api/integrations/thehive.py` - TheHive4py client wrapper. Auth with API key. |
| 4.2.2 | **Export as Case Template:** Convert playbook to TheHive case template JSON. Phases -> task groups, Steps -> tasks with descriptions, Decision nodes -> task descriptions with conditional instructions. `POST /api/playbooks/{id}/export?format=thehive` |
| 4.2.3 | **Import from TheHive:** `POST /api/integrations/thehive/import` - Pull case templates from TheHive, convert to playbook graph. Each task group becomes a Phase, tasks become Steps. |
| 4.2.4 | **Link to Cases:** Associate a playbook with TheHive case template ID. When viewing a playbook step, show "Open in TheHive" link to the corresponding task. |
| 4.2.5 | **Push Template:** `POST /api/integrations/thehive/push/{id}` - Create or update case template in TheHive directly from playbook. |

### 4.3 Cortex Integration

**Sub-agent assignment:** Codex (GPT 5.3) for API client, Opus for UX

| Task | Description |
|------|-------------|
| 4.3.1 | Create `api/integrations/cortex.py` - Cortex API client. List available analyzers and responders. |
| 4.3.2 | **Analyzer Mapping:** On "Execute" nodes, add a dropdown to select a Cortex analyzer (e.g., VirusTotal_GetReport, Abuse_Finder, MISP_2_1). Store mapping in node metadata. |
| 4.3.3 | **Responder Mapping:** On "Execute" nodes, add dropdown for Cortex responders (e.g., Mailer_1_0, TheHive_Webhooks). Store mapping in node metadata. |
| 4.3.4 | **Status Display:** When viewing a playbook with Cortex mappings, show analyzer/responder status badges (available, disabled, error) next to mapped Execute nodes. |
| 4.3.5 | **Trigger Analysis:** `POST /api/integrations/cortex/run` - Trigger a Cortex analyzer from a playbook step. Requires observable data (IP, hash, domain) as input. Show results inline. |

### 4.4 Wazuh Integration

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 4.4.1 | Create `api/integrations/wazuh.py` - Wazuh API client (auth with user/pass, JWT token management). |
| 4.4.2 | **Rule Linking:** Add `wazuh_rule_ids` field to playbook metadata. "This playbook is triggered by Wazuh rules 100200, 100201, 100205." UI: searchable rule picker that queries Wazuh API for available rules. |
| 4.4.3 | **Alert Context:** `GET /api/integrations/wazuh/alerts?rule_id=X` - Fetch recent alerts matching linked rules. Show alongside playbook as context panel: "These are the alerts that triggered this playbook." |
| 4.4.4 | **Auto-Suggest:** `GET /api/integrations/wazuh/suggest?rule_id=X` - Given a Wazuh alert, suggest which playbooks are relevant based on linked rule IDs. |
| 4.4.5 | **Active Response Export:** `POST /api/playbooks/{id}/export?format=wazuh_ar` - Generate Wazuh active response configuration XML for automated steps in the playbook. |

### 4.5 MISP Integration

**Sub-agent assignment:** Codex (GPT 5.3)

| Task | Description |
|------|-------------|
| 4.5.1 | Create `api/integrations/misp.py` - PyMISP client wrapper. |
| 4.5.2 | **Event Type Linking:** Associate playbooks with MISP event categories/types. "This playbook handles ransomware events." |
| 4.5.3 | **IOC Context:** When viewing a playbook linked to a MISP event type, auto-populate a context panel with recent matching MISP events and their IOCs (IPs, hashes, domains). |
| 4.5.4 | **Galaxy Tag Import:** `GET /api/integrations/misp/galaxies` - Pull MISP galaxy clusters and offer them as playbook tags (e.g., "mitre-attack:T1566", "threat-actor:APT29"). |
| 4.5.5 | **Event-to-Playbook:** `POST /api/integrations/misp/generate` - Given a MISP event ID, auto-generate a response playbook skeleton based on the event's attributes and tags. |

### 4.6 Frontend: Integration Dashboard

**Sub-agent assignment:** Codex (GPT 5.3) for components, Opus for layout review

| Task | Description |
|------|-------------|
| 4.6.1 | Integration status dashboard: card per tool showing connection status, last sync, number of linked playbooks. |
| 4.6.2 | Playbook editor: "Integrations" tab showing linked TheHive templates, Cortex analyzers, Wazuh rules, MISP events. |
| 4.6.3 | Node context menu: right-click an Execute node to map it to a Cortex analyzer/responder. |
| 4.6.4 | Alert sidebar: when viewing a playbook, optional sidebar showing related Wazuh alerts and MISP IOCs. |

## Non-Goals (Phase 4)

- No fully automated incident response (user must trigger actions manually)
- No webhook receivers (Wazuh/TheHive pushing to Playbook Forge)
- No multi-tenant support
- No credential vault (API keys stored in SQLite, fine for portfolio tool)

## Technical Decisions

- **All integrations are optional.** App works fine without any configured. Features gracefully degrade.
- **API keys in SQLite** is acceptable for a portfolio/demo tool. Production would use a secrets manager.
- **TheHive4py** for TheHive, **PyMISP** for MISP, **requests** for Cortex and Wazuh (simpler clients).
- **Connection pooling** not needed at portfolio scale. Simple request-per-call.
- **Mock mode:** Each integration should have a mock/demo mode that returns realistic fake data when no real instance is configured. This is critical for portfolio demos.

## Success Criteria

1. All four integrations configurable from the UI
2. Playbook exports to TheHive case template format (validates against TheHive schema)
3. Execute nodes can be mapped to Cortex analyzers with status display
4. Playbooks link to Wazuh rules with alert context panel
5. MISP galaxy tags importable as playbook tags
6. Everything degrades gracefully when tools aren't configured
7. Mock mode produces convincing demo data for portfolio presentations

## Deployment Notes

- Add `thehive4py`, `pymisp` to `requirements.txt`
- Mock mode should be the default (no external dependencies for demo)
- Document required API permissions for each integration
