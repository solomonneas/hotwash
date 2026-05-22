"""Shared pytest fixtures for the API test suite."""

from __future__ import annotations

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


@pytest.fixture
def api_key(monkeypatch):
    """Force a known API key for tests instead of the auto-generated one."""
    from api import auth

    monkeypatch.setenv("HOTWASH_API_KEY", "test-api-key-123")
    monkeypatch.setattr(auth, "_API_KEY", None)
    auth.initialize_api_key()
    return "test-api-key-123"


@pytest.fixture
def temp_db(monkeypatch, tmp_path):
    """Fresh SQLite DB per test, with the integrations table seeded."""
    from api import crypto, database
    from api.orm_models import Base
    from api.integrations.config import DEFAULT_INTEGRATIONS, Integration

    db_file = tmp_path / "test.db"
    test_engine = create_engine(
        f"sqlite:///{db_file}",
        connect_args={"check_same_thread": False},
        echo=False,
    )
    TestSessionLocal = sessionmaker(
        bind=test_engine, autocommit=False, autoflush=False
    )

    monkeypatch.setattr(database, "engine", test_engine)
    monkeypatch.setattr(database, "SessionLocal", TestSessionLocal)

    monkeypatch.setenv("HOTWASH_KEY_PATH", str(tmp_path / "encryption.key"))
    monkeypatch.setattr(crypto, "_CIPHER", None)

    Base.metadata.create_all(bind=test_engine)

    with TestSessionLocal() as session:
        for item in DEFAULT_INTEGRATIONS:
            session.add(
                Integration(
                    tool_name=item["tool_name"],
                    display_name=item["display_name"],
                    mock_mode=True,
                    enabled=False,
                    verify_ssl=True,
                    last_status="unchecked",
                )
            )
        session.commit()

    yield TestSessionLocal


@pytest.fixture
def configured_thehive(temp_db):
    """Mark the seeded TheHive integration as enabled, non-mock, with a fake API key."""
    from api.crypto import encrypt_secret
    from api.integrations.config import Integration

    with temp_db() as session:
        integ = session.query(Integration).filter_by(tool_name="thehive").first()
        integ.base_url = "http://thehive.test:9000"
        integ.api_key = encrypt_secret("fake-key-xxx")
        integ.enabled = True
        integ.mock_mode = False
        session.commit()
    return "fake-key-xxx"


@pytest.fixture
def client(api_key, temp_db):
    """FastAPI TestClient wired to the temp DB."""
    from api.main import app

    return TestClient(app)
