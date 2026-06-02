"""Shared playbook link hardening tests."""

from __future__ import annotations

import json
import uuid


def test_shared_playbook_rejects_invalid_token_shape(client, temp_db):
    resp = client.get("/api/shared/not-a-valid-token")
    assert resp.status_code == 404


def test_shared_playbook_accepts_uuid_token(client, temp_db):
    from api.orm_models import Playbook

    token = str(uuid.uuid4())
    with temp_db() as session:
        playbook = Playbook(
            title="Shared IR",
            description=None,
            category="Incident Response",
            content_markdown="# Shared IR",
            graph_json=json.dumps({"nodes": [], "edges": []}),
            share_token=token,
        )
        session.add(playbook)
        session.commit()

    resp = client.get(f"/api/shared/{token}")
    assert resp.status_code == 200
    assert resp.json()["title"] == "Shared IR"
