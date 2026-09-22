from tests.helpers import auth_headers


def test_parent_role_cannot_register(client):
    resp = client.post(
        "/api/auth/register",
        json={
            "email": "veli@example.com",
            "password": "Test1234",
            "full_name": "Veli",
            "role": "parent",
        },
    )
    assert resp.status_code == 400


def test_change_password_rejects_wrong_current(client, student):
    resp = client.post(
        "/api/auth/password",
        json={"current_password": "yanlis", "new_password": "YeniSifre1"},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 400


def test_change_password_then_login(client, student):
    resp = client.post(
        "/api/auth/password",
        json={"current_password": "Test1234", "new_password": "YeniSifre1"},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 200

    login = client.post(
        "/api/auth/login",
        json={"email": "student@example.com", "password": "YeniSifre1"},
    )
    assert login.status_code == 200


def test_forgot_unknown_email_stays_quiet(client, app):
    resp = client.post("/api/auth/forgot", json={"email": "yok@example.com"})
    assert resp.status_code == 200
    assert app.config.get("LAST_RESET_TOKEN") is None


def test_reset_link_sets_a_new_password(client, student, app):
    asked = client.post("/api/auth/forgot", json={"email": "student@example.com"})
    assert asked.status_code == 200
    token = app.config["LAST_RESET_TOKEN"]

    reset = client.post(
        "/api/auth/reset",
        json={"token": token, "password": "YeniSifre1"},
    )
    assert reset.status_code == 200

    again = client.post(
        "/api/auth/reset",
        json={"token": token, "password": "BaskaSifre1"},
    )
    assert again.status_code == 400

    login = client.post(
        "/api/auth/login",
        json={"email": "student@example.com", "password": "YeniSifre1"},
    )
    assert login.status_code == 200
