from urllib.parse import quote

from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_get_activities():
    resp = client.get("/activities")
    assert resp.status_code == 200
    data = resp.json()
    assert "Chess Club" in data


def test_signup_and_unregister():
    activity = quote("Chess Club", safe="")
    email = "tester@example.com"

    # Ensure a clean starting state for this email
    resp = client.get("/activities")
    assert resp.status_code == 200
    participants = resp.json()["Chess Club"]["participants"]
    if email in participants:
        resp = client.delete(f"/activities/{activity}/participants/{quote(email, safe='')}")
        assert resp.status_code == 200

    # Sign up
    resp = client.post(f"/activities/{activity}/signup?email={quote(email, safe='')}")
    assert resp.status_code == 200
    assert "Signed up" in resp.json().get("message", "")

    # Verify participant added
    resp = client.get("/activities")
    participants = resp.json()["Chess Club"]["participants"]
    assert email in participants

    # Unregister
    resp = client.delete(f"/activities/{activity}/participants/{quote(email, safe='')}")
    assert resp.status_code == 200
    assert "Unregistered" in resp.json().get("message", "")

    # Verify removed
    resp = client.get("/activities")
    participants = resp.json()["Chess Club"]["participants"]
    assert email not in participants


def test_delete_nonexistent():
    activity = quote("Chess Club", safe="")
    email = "no-such-user@example.com"
    resp = client.delete(f"/activities/{activity}/participants/{quote(email, safe='')}")
    assert resp.status_code == 404
