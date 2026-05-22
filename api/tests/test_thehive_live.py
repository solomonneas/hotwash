"""Opt-in live smoke test against a real TheHive instance.

Set HOTWASH_LIVE_THEHIVE_URL and HOTWASH_LIVE_THEHIVE_API_KEY, then:
    pytest api/tests/test_thehive_live.py -m live -v -s

Leftover cases/alerts are tagged 'hotwash-live-test' for manual cleanup.
"""

from __future__ import annotations

import os
import time
import uuid

import pytest

from api.integrations.clients.thehive import TheHiveClient, TheHiveError

LIVE_URL = os.environ.get("HOTWASH_LIVE_THEHIVE_URL")
LIVE_KEY = os.environ.get("HOTWASH_LIVE_THEHIVE_API_KEY")
SKIP_REASON = "HOTWASH_LIVE_THEHIVE_URL / HOTWASH_LIVE_THEHIVE_API_KEY not set"

pytestmark = [
    pytest.mark.live,
    pytest.mark.skipif(not (LIVE_URL and LIVE_KEY), reason=SKIP_REASON),
]


@pytest.fixture(scope="module")
def live_client():
    return TheHiveClient(base_url=LIVE_URL, api_key=LIVE_KEY, timeout=15.0)


@pytest.fixture(scope="module")
def ready_client(live_client):
    """Wait up to 60s for TheHive to be reachable (Cassandra startup tax)."""
    deadline = time.time() + 60
    last_exc: Exception | None = None
    while time.time() < deadline:
        try:
            live_client.status()
            return live_client
        except TheHiveError as exc:
            last_exc = exc
            time.sleep(3)
    raise AssertionError(f"TheHive never became ready: {last_exc}")


def test_status_returns_version(ready_client):
    result = ready_client.status()
    assert result["status"] == "connected"
    assert result["version"]
    print(f"\n[live] TheHive version: {result['version']}, user: {result['user']}")


def test_create_case_then_add_observable(ready_client):
    suffix = uuid.uuid4().hex[:8]
    case = ready_client.create_case(
        title=f"[hotwash-live-test] case {suffix}",
        description="Created by hotwash live smoke test.",
        severity=1,
        tags=["hotwash-live-test"],
    )
    assert case["_id"]
    print(f"\n[live] created case {case.get('number')} ({case['_id']})")

    obs = ready_client.add_observable(
        case_id=case["_id"],
        data_type="ip",
        data="198.51.100.42",
        message="test indicator",
        tags=["hotwash-live-test"],
    )
    assert obs["_id"]


def test_create_alert_with_observables(ready_client):
    suffix = uuid.uuid4().hex[:8]
    alert = ready_client.create_alert(
        type="vulnerability",
        source="hotwash-live-test",
        source_ref=f"smoke-{suffix}",
        title=f"[hotwash-live-test] alert {suffix}",
        description="Created by hotwash live smoke test.",
        severity=1,
        observables=[
            {"dataType": "ip", "data": "203.0.113.5"},
            {"dataType": "domain", "data": "example.invalid"},
        ],
        tags=["hotwash-live-test"],
    )
    assert alert["_id"]
    print(f"\n[live] created alert {alert['_id']} sourceRef=smoke-{suffix}")
