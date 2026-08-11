from tests.helpers import auth_headers


def test_link_child_by_email(client, student, parent):
    resp = client.post(
        "/api/users/children/link",
        json={"email": "student@example.com"},
        headers=auth_headers(parent["token"]),
    )
    assert resp.status_code == 200
    assert resp.get_json()["parent_id"] == parent["user"]["id"]

    resp_children = client.get("/api/users/children", headers=auth_headers(parent["token"]))
    assert len(resp_children.get_json()) == 1


def test_link_child_unknown_email_fails(client, parent):
    resp = client.post(
        "/api/users/children/link",
        json={"email": "nobody@example.com"},
        headers=auth_headers(parent["token"]),
    )
    assert resp.status_code == 404


def test_link_child_requires_parent_role(client, student):
    resp = client.post(
        "/api/users/children/link",
        json={"email": "student@example.com"},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 403


def test_children_endpoint_requires_parent_role(client, student):
    resp = client.get("/api/users/children", headers=auth_headers(student["token"]))
    assert resp.status_code == 403


def test_parent_cannot_view_unlinked_child_progress(client, student, parent):
    resp = client.get(
        f"/api/progress/child/{student['user']['id']}",
        headers=auth_headers(parent["token"]),
    )
    assert resp.status_code == 403


def test_parent_can_view_linked_child_progress(client, student, parent):
    client.post(
        "/api/users/children/link",
        json={"email": "student@example.com"},
        headers=auth_headers(parent["token"]),
    )
    client.post(
        "/api/scores",
        json={"game_id": 1, "points": 250, "completed": True},
        headers=auth_headers(student["token"]),
    )
    resp = client.get(
        f"/api/progress/child/{student['user']['id']}",
        headers=auth_headers(parent["token"]),
    )
    assert resp.status_code == 200
    assert resp.get_json()["total_points"] == 250
