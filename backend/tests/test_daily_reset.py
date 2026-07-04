"""Daily Reset backend tests — pytest, hits public URL via /api."""
import os
import uuid
import pytest
import requests
from dotenv import load_dotenv
from pathlib import Path

load_dotenv(Path(__file__).resolve().parents[2] / "frontend" / ".env")
BASE = os.environ["EXPO_PUBLIC_BACKEND_URL"].rstrip("/")
API = f"{BASE}/api"


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def _base_payload(**overrides):
    payload = {
        "energy_score": 3,
        "focus_score": 3,
        "stress_score": 3,
        "sleep_score": 3,
        "movement_type": "camminata leggera",
        "body_feeling": "neutro",
        "nutrition_status": "ok",
        "cravings_level": "bassi",
        "caffeine_use": "moderata",
        "natural_light": "sì, buona",
        "routine_done": "sì",
        "improvement_area": "energia",
        "available_time": "10 minuti",
    }
    payload.update(overrides)
    return payload


# -- Health --
def test_root(client):
    r = client.get(f"{API}/")
    assert r.status_code == 200
    assert r.json().get("status") == "ok"


# -- Reset create + generation fields --
def test_create_reset_full_fields(client):
    r = client.post(f"{API}/resets", json=_base_payload())
    assert r.status_code == 200, r.text
    data = r.json()
    for k in ["id", "created_at", "generated_pattern", "generated_summary",
              "generated_worked", "generated_friction", "generated_adjustment",
              "generated_micro_action", "generated_avoidance"]:
        assert k in data and data[k], f"missing {k}"
    assert "_id" not in data


# -- Rule-based logic --
def test_pattern_recupero_insufficiente(client):
    p = _base_payload(sleep_score=1, stress_score=5)
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 200
    assert r.json()["generated_pattern"] == "Recupero insufficiente"


def test_pattern_buona_base(client):
    p = _base_payload(energy_score=5, stress_score=1, sleep_score=5, focus_score=4)
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 200
    assert r.json()["generated_pattern"] == "Buona base da mantenere"


def test_pattern_alimentazione_disordinata_nutrition(client):
    p = _base_payload(nutrition_status="molto irregolare",
                      sleep_score=3, stress_score=3, energy_score=3, focus_score=3)
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 200
    assert r.json()["generated_pattern"] == "Alimentazione disordinata"


def test_pattern_alimentazione_disordinata_cravings(client):
    p = _base_payload(cravings_level="alti",
                      sleep_score=3, stress_score=3, energy_score=3, focus_score=3)
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 200
    assert r.json()["generated_pattern"] == "Alimentazione disordinata"


# -- List / Get --
def test_list_resets_sorted_desc(client):
    # Create two
    a = client.post(f"{API}/resets", json=_base_payload()).json()
    b = client.post(f"{API}/resets", json=_base_payload()).json()
    r = client.get(f"{API}/resets")
    assert r.status_code == 200
    lst = r.json()
    assert isinstance(lst, list) and len(lst) >= 2
    assert "_id" not in lst[0]
    cats = [d["created_at"] for d in lst]
    assert cats == sorted(cats, reverse=True)
    ids = [d["id"] for d in lst]
    assert a["id"] in ids and b["id"] in ids


def test_get_reset_by_id(client):
    created = client.post(f"{API}/resets", json=_base_payload()).json()
    r = client.get(f"{API}/resets/{created['id']}")
    assert r.status_code == 200
    assert r.json()["id"] == created["id"]


def test_get_reset_404(client):
    r = client.get(f"{API}/resets/{uuid.uuid4()}")
    assert r.status_code == 404


# -- Validation --
def test_validation_missing_field(client):
    p = _base_payload()
    p.pop("energy_score")
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 422


def test_validation_out_of_range(client):
    p = _base_payload(energy_score=9)
    r = client.post(f"{API}/resets", json=p)
    assert r.status_code == 422


# -- Email leads --
def test_email_lead_valid_and_idempotent(client):
    email = f"TEST_user_{uuid.uuid4().hex[:8]}@example.com"
    r1 = client.post(f"{API}/email-leads", json={"email": email})
    assert r1.status_code == 200, r1.text
    d1 = r1.json()
    assert d1["email"] == email.lower()
    # Repeat with upper-case — must return same id
    r2 = client.post(f"{API}/email-leads", json={"email": email.upper()})
    assert r2.status_code == 200
    assert r2.json()["id"] == d1["id"]


def test_email_lead_invalid(client):
    r = client.post(f"{API}/email-leads", json={"email": "not-an-email"})
    assert r.status_code == 422
