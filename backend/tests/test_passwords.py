from tests.helpers import auth_headers, register_user


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


def _class_with_student(client, teacher, student):
    classroom = client.post(
        "/api/classrooms", json={"name": "3-A"}, headers=auth_headers(teacher["token"])
    ).get_json()
    client.post(
        "/api/classrooms/join",
        json={"join_code": classroom["join_code"]},
        headers=auth_headers(student["token"]),
    )
    return classroom


def test_teacher_sets_a_password_the_student_can_use(client, teacher, student):
    classroom = _class_with_student(client, teacher, student)
    resp = client.post(
        f"/api/classrooms/{classroom['id']}/students/{student['user']['id']}/password",
        json={"password": "Elma1234"},
        headers=auth_headers(teacher["token"]),
    )
    assert resp.status_code == 200
    assert "password" not in resp.get_json()

    login = client.post(
        "/api/auth/login",
        json={"email": "student@example.com", "password": "Elma1234"},
    )
    assert login.status_code == 200


def test_teacher_cannot_set_a_password_outside_their_class(client, teacher, student):
    other = register_user(client, email="other-teacher@example.com", role="teacher").get_json()
    classroom = client.post(
        "/api/classrooms",
        json={"name": "4-B"},
        headers=auth_headers(other["access_token"]),
    ).get_json()
    client.post(
        "/api/classrooms/join",
        json={"join_code": classroom["join_code"]},
        headers=auth_headers(student["token"]),
    )
    resp = client.post(
        f"/api/classrooms/{classroom['id']}/students/{student['user']['id']}/password",
        json={"password": "Elma1234"},
        headers=auth_headers(teacher["token"]),
    )
    assert resp.status_code == 403


def test_student_cannot_set_a_classmate_password(client, teacher, student):
    classroom = _class_with_student(client, teacher, student)
    resp = client.post(
        f"/api/classrooms/{classroom['id']}/students/{student['user']['id']}/password",
        json={"password": "Elma1234"},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 403
