"""Unit tests for TheHiveClient (mocked HTTP)."""

from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
import requests

from api.integrations.clients.thehive import TheHiveClient, TheHiveError


def _mock_response(status_code: int = 200, json_body: dict | list | None = None, text: str = ""):
    resp = MagicMock(spec=requests.Response)
    resp.status_code = status_code
    resp.ok = 200 <= status_code < 300
    resp.json.return_value = json_body if json_body is not None else {}
    resp.text = text or (str(json_body) if json_body else "")
    return resp


def test_client_constructs_with_base_url_and_key():
    client = TheHiveClient(base_url="http://example:9000", api_key="abc123")
    assert client.base_url == "http://example:9000"
    assert client.api_key == "abc123"
    assert client.verify_ssl is True
    assert client.timeout == 10.0


def test_client_strips_trailing_slash_from_base_url():
    client = TheHiveClient(base_url="http://example:9000/", api_key="abc123")
    assert client.base_url == "http://example:9000"


def test_thehive_error_carries_status_and_details():
    err = TheHiveError("nope", status_code=401, details={"type": "AuthenticationError"})
    assert err.status_code == 401
    assert err.details == {"type": "AuthenticationError"}
    assert "nope" in str(err)
