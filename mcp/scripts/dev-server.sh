#!/usr/bin/env bash
# Local dev runner for the Hotwash API. Exports the same HOTWASH_API_KEY
# that hotwash-mcp is configured with so the two stay in sync.
#
# Usage:
#   bash mcp/scripts/dev-server.sh                # foreground
#   HOTWASH_PORT=8001 bash mcp/scripts/dev-server.sh   # custom port

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$REPO_ROOT"

HOTWASH_API_KEY="${HOTWASH_API_KEY:-hotwash-dev}"
HOTWASH_PORT="${HOTWASH_PORT:-8000}"

export HOTWASH_API_KEY

echo "Starting Hotwash API on http://127.0.0.1:${HOTWASH_PORT}"
echo "  HOTWASH_API_KEY=${HOTWASH_API_KEY}"
echo "  Match this key in the hotwash-mcp env if you change it."
echo

exec python3 -m uvicorn api.main:app --host 127.0.0.1 --port "$HOTWASH_PORT" --reload
