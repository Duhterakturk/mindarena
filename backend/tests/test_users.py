from tests.helpers import auth_headers


def test_linking_a_child_by_email_is_closed(client, student):
    resp = client.post(
        "/api/users/children/link",
        json={"email": "student@example.com"},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 403


def test_children_list_is_closed(client, student):
    resp = client.get("/api/users/children", headers=auth_headers(student["token"]))
    assert resp.status_code == 403


def test_child_progress_is_closed(client, student):
    resp = client.get(
        f"/api/progress/child/{student['user']['id']}",
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 403
