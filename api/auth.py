"""API key authentication helpers."""

from __future__ import annotations

import logging
import secrets
import uuid
from typing import Optional

from fastapi import Header, HTTPException, status

from api._compat import getenv_compat

logger = logging.getLogger(__name__)

_API_KEY: Optional[str] = None


def initialize_api_key() -> str:
    global _API_KEY
    if _API_KEY:
        return _API_KEY

    configured = getenv_compat("HOTWASH_API_KEY", "PLAYBOOK_FORGE_API_KEY")
    if configured:
        _API_KEY = configured
    else:
        _API_KEY = str(uuid.uuid4())
        # Never log the generated key itself: debug-level logging would write
        # the live credential to logs. Real deployments must set HOTWASH_API_KEY.
        logger.warning(
            "No HOTWASH_API_KEY configured, generated an ephemeral API key. "
            "Authenticated routes are unreachable until HOTWASH_API_KEY is set."
        )

    return _API_KEY


def is_valid_api_key(provided_key: str | None) -> bool:
    expected_key = initialize_api_key()
    return secrets.compare_digest(provided_key or "", expected_key or "")


def get_api_key(x_api_key: str | None = Header(default=None, alias="X-API-Key")) -> str:
    provided_key = x_api_key or ""
    if not is_valid_api_key(provided_key):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing API key",
        )
    return provided_key
