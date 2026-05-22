"""Tests for integration action request schemas."""

from __future__ import annotations

import pytest
from pydantic import ValidationError

from api.integrations.schemas import (
    AddObservableRequest,
    CreateAlertRequest,
    CreateCaseRequest,
)


def test_create_case_minimal():
    req = CreateCaseRequest(title="t", description="d")
    assert req.severity == 2
    assert req.tlp == 2
    assert req.pap == 2
    assert req.tags == []


def test_create_case_rejects_extra_fields():
    with pytest.raises(ValidationError):
        CreateCaseRequest(title="t", description="d", evil="x")


def test_create_case_severity_bounds():
    with pytest.raises(ValidationError):
        CreateCaseRequest(title="t", description="d", severity=5)
    with pytest.raises(ValidationError):
        CreateCaseRequest(title="t", description="d", severity=0)


def test_create_case_title_required():
    with pytest.raises(ValidationError):
        CreateCaseRequest(description="d")
    with pytest.raises(ValidationError):
        CreateCaseRequest(title="", description="d")


def test_create_alert_requires_source_ref():
    with pytest.raises(ValidationError):
        CreateAlertRequest(type="t", source="s", title="x", description="y")
    req = CreateAlertRequest(
        type="t", source="s", source_ref="r", title="x", description="y"
    )
    assert req.source_ref == "r"
    assert req.observables == []


def test_create_alert_observable_shape():
    req = CreateAlertRequest(
        type="t",
        source="s",
        source_ref="r",
        title="x",
        description="y",
        observables=[{"dataType": "ip", "data": "1.2.3.4"}],
    )
    assert req.observables == [{"dataType": "ip", "data": "1.2.3.4"}]


def test_add_observable_minimal():
    req = AddObservableRequest(case_id="~1", data_type="ip", data="1.2.3.4")
    assert req.tlp == 2
    assert req.ioc is False


def test_add_observable_rejects_empty_data():
    with pytest.raises(ValidationError):
        AddObservableRequest(case_id="~1", data_type="ip", data="")
