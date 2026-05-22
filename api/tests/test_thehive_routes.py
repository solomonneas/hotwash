"""Tests for /api/integrations/thehive/* routes."""

from __future__ import annotations

from unittest.mock import patch

from api.integrations.clients.thehive import TheHiveError


def test_test_endpoint_mock_mode_uses_mock_data(client, temp_db, api_key):
    resp = client.post(
        "/api/integrations/thehive/test", headers={"X-API-Key": api_key}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["mock_mode"] is True
    assert body["result"]["status"] == "connected"


def test_test_endpoint_live_mode_calls_thehive_client(client, configured_thehive, api_key):
    fake_status = {
        "status": "connected",
        "version": "5.4.0",
        "user": "admin@thehive.local",
        "stats": {},
    }
    with patch("api.routers.integrations.validate_integration_url", return_value=None), \
         patch("api.routers.integrations.TheHiveClient") as MockClient:
        MockClient.return_value.status.return_value = fake_status
        resp = client.post(
            "/api/integrations/thehive/test",
            headers={"X-API-Key": api_key},
        )
    assert resp.status_code == 200
    body = resp.json()
    assert body["mock_mode"] is False
    assert body["result"] == fake_status
    MockClient.assert_called_once()


def test_test_endpoint_live_mode_maps_thehive_error_to_502(client, configured_thehive, api_key):
    with patch("api.routers.integrations.validate_integration_url", return_value=None), \
         patch("api.routers.integrations.TheHiveClient") as MockClient:
        MockClient.return_value.status.side_effect = TheHiveError(
            "Invalid API key for TheHive", status_code=401, details={}
        )
        resp = client.post(
            "/api/integrations/thehive/test",
            headers={"X-API-Key": api_key},
        )
    assert resp.status_code == 502
    detail = resp.json()["detail"]
    assert "Invalid API key" in detail["message"]
    assert detail["upstream_status"] == 401


def test_test_endpoint_rejects_without_api_key(client):
    resp = client.post("/api/integrations/thehive/test")
    assert resp.status_code in (401, 403)
