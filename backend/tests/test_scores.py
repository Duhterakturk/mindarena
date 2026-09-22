from tests.helpers import auth_headers
from tests.payloads import post_score


def test_submit_score_requires_auth(client):
    resp = client.post("/api/scores", json={"attempt_id": "missing"})
    assert resp.status_code == 401


def test_submit_score_creates_record(client, student, app):
    auth = auth_headers(student["token"])
    resp = post_score(client, auth, 1, app, duration=500)
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["score"]["points"] == 500
    assert data["score"]["duration_seconds"] == 500
    assert data["score"]["game_id"] == 1
    assert isinstance(data["new_badges"], list)


def test_submit_score_unknown_attempt_returns_404(client, student):
    resp = client.post(
        "/api/scores",
        json={"attempt_id": "missing", "answer": {}},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 404


def test_my_scores_filters_by_user(client, student, parent, app):
    auth = auth_headers(student["token"])
    post_score(client, auth, 1, app, duration=900)
    resp = client.get("/api/scores/me", headers=auth)
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1

    resp_parent = client.get("/api/scores/me", headers=auth_headers(parent["token"]))
    assert resp_parent.get_json() == []


def test_leaderboard_only_includes_completed(client, student, app):
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    auth = auth_headers(student["token"])
    post_score(client, auth, sudoku_id, app, duration=700)
    post_score(client, auth, sudoku_id, app, answer=None)

    resp = client.get("/api/scores/leaderboard/sudoku")
    assert resp.status_code == 200
    rows = resp.get_json()
    assert [s["points"] for s in rows] == [300]
    assert rows[0]["display_name"] == "Test"
    assert "user_id" not in rows[0]


def test_same_attempt_cannot_score_twice(client, student, app):
    auth = auth_headers(student["token"])
    opened = client.post("/api/puzzles", json={"game_id": 1, "difficulty": "easy"}, headers=auth)
    attempt_id = opened.get_json()["id"]
    first = client.post("/api/scores", json={"attempt_id": attempt_id}, headers=auth)
    second = client.post("/api/scores", json={"attempt_id": attempt_id}, headers=auth)
    assert first.status_code == 201
    assert first.get_json()["score"]["completed"] is False
    assert second.status_code == 409
