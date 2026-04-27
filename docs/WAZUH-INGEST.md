# Wazuh Ingest

## Overview

Wazuh's integration block POSTs alerts to Hotwash. Hotwash matches each
alert against a mapping table and either auto-starts a run, queues a
suggestion for review, or logs the receipt only.

## Configuring Wazuh

Add an `<integration>` block to `/var/ossec/etc/ossec.conf`:

```xml
<ossec_config>
  <integration>
    <name>hotwash</name>
    <hook_url>https://hotwash.example/api/ingest/wazuh</hook_url>
    <level>7</level>
    <alert_format>json</alert_format>
  </integration>
</ossec_config>
```

The integration script must send `X-Hotwash-Mapping-Id` and
`X-Hotwash-Signature` headers. Template for
`/var/ossec/integrations/custom-hotwash.py`:

```python
#!/usr/bin/env python3
import hashlib, hmac, json, sys, urllib.request

ALERT_FILE, _, HOOK_URL = sys.argv[1], sys.argv[2], sys.argv[3]
MAPPING_ID = "1"
SECRET = b"replace-with-mapping-secret"

with open(ALERT_FILE, "rb") as f:
    body = f.read()
sig = hmac.new(SECRET, body, hashlib.sha256).hexdigest()
req = urllib.request.Request(HOOK_URL, data=body, method="POST", headers={
    "Content-Type": "application/json",
    "X-Hotwash-Mapping-Id": MAPPING_ID,
    "X-Hotwash-Signature": "sha256=" + sig,
})
urllib.request.urlopen(req, timeout=10).read()
```

## Creating a mapping

```bash
curl -X POST https://hotwash.example/api/ingest/mappings \
  -H "X-API-Key: $HOTWASH_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wazuh CVE level 10",
    "playbook_id": 1,
    "mode": "suggest",
    "rule_id_pattern": "23505",
    "rule_groups_pattern": "vulnerability-detector",
    "agent_name_pattern": null,
    "cooldown_seconds": 300,
    "hmac_secret": "replace-with-mapping-secret"
  }'
```

Patterns are CSV-of-exacts (case-insensitive). `null` or empty means wildcard.
Highest specificity wins, ties broken by oldest `created_at` then smallest `id`.

## Payload shape

Hotwash reads the nested `rule.{id, level, description, groups}` and
`agent.{id, name}` fields, which is what Wazuh's `<integration>` block
POSTs natively. Pattern matching is keyed on those nested values. The
Wazuh management API and tools like `wazuh-mcp` return a flattened
envelope (`rule_id`, `agent_id`, `rule_groups` at top level) for query
results; if you smoke-test from those, translate to the nested shape
first or no mapping will match.

## Trigger modes

- `auto`: starts an `Execution` immediately. Alert exposed at
  `context.wazuh_alert`. Returns `201` with `execution_id`.
- `suggest`: queues an `IngestSuggestion` for human review. Returns `200`
  with `suggestion_id`.

  **Listing pending suggestions:**

  ```bash
  # All pending (default)
  curl -H "X-API-Key: $HOTWASH_API_KEY" \
    https://hotwash.example/api/ingest/suggestions

  # Filter by state and mapping
  curl -H "X-API-Key: $HOTWASH_API_KEY" \
    "https://hotwash.example/api/ingest/suggestions?state=pending&mapping_id=3"

  # Full detail for one suggestion (includes parsed alert_payload, mapping ref, playbook_title)
  curl -H "X-API-Key: $HOTWASH_API_KEY" \
    https://hotwash.example/api/ingest/suggestions/42
  ```

  **Accepting a suggestion** (creates an Execution, idempotent):

  ```bash
  curl -X POST -H "X-API-Key: $HOTWASH_API_KEY" \
    https://hotwash.example/api/ingest/suggestions/42/accept
  # Returns: {"execution_id": 17, "already_accepted": false}
  # Re-accept returns the same execution_id with "already_accepted": true
  ```

  **Dismissing a suggestion** (anchors cooldown, optional reason):

  ```bash
  curl -X POST -H "X-API-Key: $HOTWASH_API_KEY" \
    -H "Content-Type: application/json" \
    -d '{"reason": "noise - known scanner activity"}' \
    https://hotwash.example/api/ingest/suggestions/42/dismiss
  ```

- `off`: logs the receipt only. Returns `200` with `status: ignored`.

## HMAC scheme

- Headers: `X-Hotwash-Mapping-Id: <int>`, `X-Hotwash-Signature: sha256=<64-hex>`.
- Signing input: raw request body bytes.
- Comparison: constant-time (`hmac.compare_digest`).
- Bare 64-hex without the `sha256=` prefix is accepted too.

```bash
printf '%s' "$BODY" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}'
```

Body cap is 256 KB (`413` over). `X-Hotwash-Mapping-Id` is required (`400`
if missing). Bad signature, unknown mapping, or disabled mapping all
return `401` with the same opaque message.

## Cooldown

Fingerprint is `sha256(mapping_id:rule_id:agent_id)`. Default window is
`300s`, set per mapping via `cooldown_seconds`, rotatable via PATCH. The
suppression log doubles as the cooldown anchor: `dispatched_auto`,
`dispatched_suggest`, `cooldown`, and `suggestion_dismissed` rows count.
`no_match` and `mode_off` do not, so flipping a mapping on does not silently
swallow the next alert.

Dismissing a suggestion writes a `suggestion_dismissed` row to the suppression
log, anchoring the cooldown window for that fingerprint. This prevents the same
alert fingerprint from immediately re-queueing after a dismiss - useful for
confirmed noise where you want the cooldown clock to start from the review
decision rather than the original ingest time.

## Suggestion lifecycle

Suggestions move through three states:

- `pending` - created on ingest, awaiting a review decision.
- `accepted` - a human (or an authorized agent) called POST /accept. An
  Execution was created with the original alert in `context.wazuh_alert`,
  identical to what `mode=auto` would have produced. The suggestion's
  `accepted_execution_id` field links it to that run.
- `dismissed` - a human called POST /dismiss. No Execution is created.
  The cooldown is anchored via the suppression log so the fingerprint
  does not immediately re-queue.

**State transitions:**

```
pending --[POST /accept]--> accepted   (creates Execution)
pending --[POST /dismiss]--> dismissed (anchors cooldown)
```

Neither transition is reversible. There is no path from `accepted` or
`dismissed` back to `pending`.

**Idempotency:** POST /accept is safe to call more than once. If the
suggestion is already accepted, the response returns the existing
`execution_id` plus `"already_accepted": true` with a `200` status. No
duplicate Execution is created.

**Error responses (409):** The accept endpoint returns `409 Conflict` in
four situations:

| Scenario | Message |
|----------|---------|
| Already accepted | `suggestion already accepted` |
| Already dismissed | `suggestion already dismissed` |
| Concurrent modification during accept | `concurrent modification - retry` |
| Underlying playbook deleted after suggestion was queued | `inconsistent state - playbook unavailable` |

Dismiss does not produce 409; calling dismiss on an already-dismissed
suggestion is a no-op returning `200`.

## Reviewing via MCP

Two MCP tools are available for suggestion review when using hotwash-mcp
0.2.0 or later.

**`hotwash_list_suggestions`** - read-only. Mirrors the GET
`/api/ingest/suggestions` filters:

- `state` - `pending`, `accepted`, or `dismissed` (default: `pending`)
- `mapping_id` - restrict to one mapping
- `limit` - cap result count

Use case: an LLM agent scanning the pending queue to triage alerts before a
human review session. Because this tool is read-only it carries no confirm
gate.

**`hotwash_accept_suggestion`** - write. Requires `confirm: true` in the
call. Returns the resulting `execution_id` so the caller can immediately
chain to `hotwash_query_run` to inspect the started playbook run. Example
prompt to pass to a model with MCP support:

> Review the pending suggestion queue and accept the highest-priority CVE
> alert. Then query the resulting run and summarize which playbook step is
> first.

**Why dismiss is not exposed via MCP:** Dismissal permanently suppresses an
alert fingerprint for the cooldown window and anchors the suppression log.
A model acting on a queue could swallow legitimate noise without the context
a human reviewer brings. Accept is exposed because its worst outcome is a
playbook run that a human can cancel; dismiss has no safe undo within the
cooldown window. Dismiss remains a human-only action via the REST API.

## Known limitations

The cooldown check is read-modify-write and not atomic across workers: two
requests with the same fingerprint that race `is_in_cooldown` can both
dispatch. Hotwash ships as single-process uvicorn, which keeps the race
window narrow. Multi-worker deployments need a unique constraint on the
suppression log keyed by fingerprint plus a time bucket; tracked as a
follow-up.
