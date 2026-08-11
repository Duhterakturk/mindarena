from tests.helpers import register_user, auth_headers


def test_register_creates_user_and_returns_tokens(client):
    resp = register_user(client, email="new@example.com")
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["user"]["email"] == "new@example.com"
    assert data["user"]["role"] == "student"
    assert "access_token" in data
    assert "refresh_token" in data


def test_register_duplicate_email_fails(client):
    register_user(client, email="dup@example.com")
    resp = register_user(client, email="dup@example.com")
    assert resp.status_code == 409


def test_register_invalid_role_fails(client):
    resp = register_user(client, email="bad-role@example.com", role="admin")
    assert resp.status_code == 400


def test_login_success(client):
    register_user(client, email="login@example.com", password="Secret123")
    resp = client.post(
        "/api/auth/login", json={"email": "login@example.com", "password": "Secret123"}
    )
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()


def test_login_wrong_password_fails(client):
    register_user(client, email="login2@example.com", password="Secret123")
    resp = client.post(
        "/api/auth/login", json={"email": "login2@example.com", "password": "wrong"}
    )
    assert resp.status_code == 401


def test_me_requires_auth(client):
    resp = client.get("/api/auth/me")
    assert resp.status_code == 401


def test_me_returns_current_user(client, student):
    resp = client.get("/api/auth/me", headers=auth_headers(student["token"]))
    assert resp.status_code == 200
    assert resp.get_json()["email"] == "student@example.com"
