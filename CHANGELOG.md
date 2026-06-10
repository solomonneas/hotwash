# Changelog

All notable changes to Hotwash. The `hotwash-mcp` npm package keeps its own
version line (`mcp-v*` tags); entries here cover the whole repo.

## Unreleased

### Added
- TheHive integration: live `create_case`, `create_alert`, and
  `add_observable` SOAR actions with a structured client, Pydantic request
  schemas, and an opt-in live smoke test (`-m live`).
- Wazuh ingest hardening: route-aware forwarder template that serves
  multiple mappings from one integration script.
- GitHub Actions CI running the full `scripts/verify` gate.
- Web test suite: vitest coverage for the client-side markdown parser,
  wired into `scripts/verify`.
- `scripts/verify`: single verification entrypoint for all components.

### Changed
- Backend dependencies repinned (FastAPI 0.136, Pydantic 2.13, pytest 9)
  and installed via a repo venv; the verify gate prefers `.venv` python.
- Web bundle split into app + react + react-flow chunks (main chunk
  617 kB -> 321 kB).
- README quickstart, badges, roadmap prose, and Makefile targets brought
  back in line with the actual tree and ports.

### Fixed
- SSRF guard now blocks IPv6 private, loopback, and link-local targets.
- `case_id` values are validated and URL-encoded to block path injection.
- TheHive `status` reads the top-level version field of TheHive 5.4.
- MCP server strips draft-07 `$schema` from `tools/list` for Anthropic
  client compatibility.

### Removed
- Tracked runtime SQLite database (`api/data/playbooks.db`) removed from
  the repo and scrubbed from history; the API seeds itself on startup.
- Stale `web/public/index.html` duplicate.

## v0.2.2 and earlier

Tagged before this changelog existed. See the git history of the tags
`v0.2.0` through `v0.2.2` and `mcp-v0.3.0`.
