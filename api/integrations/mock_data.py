"""
Mock/demo data generators for integration status checks.
"""

import random
from datetime import datetime, timezone


def get_mock_thehive_status() -> dict:
    return {
        "status": "connected",
        "version": "5.2.8",
        "stats": {
            "open_cases": random.randint(12, 45),
            "closed_cases": random.randint(200, 500),
            "open_alerts": random.randint(5, 30),
            "total_observables": random.randint(1500, 5000),
        },
        "message": "Mock mode — no real TheHive instance connected",
    }


def get_mock_cortex_status() -> dict:
    return {
        "status": "connected",
        "version": "3.1.7",
        "stats": {
            "analyzers_enabled": random.randint(15, 35),
            "analyzers_total": 42,
            "responders_enabled": random.randint(5, 12),
            "responders_total": 18,
            "jobs_last_24h": random.randint(50, 200),
        },
        "message": "Mock mode — no real Cortex instance connected",
    }


def get_mock_wazuh_status() -> dict:
    return {
        "status": "connected",
        "version": "4.7.2",
        "stats": {
            "active_agents": random.randint(25, 150),
            "total_agents": random.randint(150, 300),
            "rules_loaded": random.randint(2000, 4000),
            "alerts_today": random.randint(100, 1500),
            "vulnerabilities_detected": random.randint(50, 400),
        },
        "message": "Mock mode — no real Wazuh instance connected",
    }


def get_mock_misp_status() -> dict:
    return {
        "status": "connected",
        "version": "2.4.176",
        "stats": {
            "events": random.randint(500, 2000),
            "attributes": random.randint(10000, 50000),
            "galaxies": random.randint(30, 80),
            "ioc_count": random.randint(5000, 25000),
            "feeds_enabled": random.randint(8, 20),
        },
        "message": "Mock mode — no real MISP instance connected",
    }


MOCK_HANDLERS = {
    "thehive": get_mock_thehive_status,
    "cortex": get_mock_cortex_status,
    "wazuh": get_mock_wazuh_status,
    "misp": get_mock_misp_status,
}
