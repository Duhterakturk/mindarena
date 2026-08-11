from tests.helpers import auth_headers


def test_submit_score_requires_auth(client):
    resp = client.post("/api/scores", json={"game_id": 1, "points": 100, "completed": True})
    assert resp.status_code == 401


def test_submit_score_creates_record(client, student):
    resp = client.post(
        "/api/scores",
        json={"game_id": 1, "points": 500, "duration_seconds": 60, "difficulty": "easy", "completed": True},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["score"]["points"] == 500
    assert data["score"]["game_id"] == 1
    assert isinstance(data["new_badges"], list)


def test_submit_score_unknown_game_returns_404(client, student):
    resp = client.post(
        "/api/scores",
        json={"game_id": 9999, "points": 100, "completed": True},
        headers=auth_headers(student["token"]),
    )
    assert resp.status_code == 404


def test_my_scores_filters_by_user(client, student, parent):
    client.post(
        "/api/scores",
        json={"game_id": 1, "points": 100, "completed": True},
        headers=auth_headers(student["token"]),
    )
    resp = client.get("/api/scores/me", headers=auth_headers(student["token"]))
    assert resp.status_code == 200
    assert len(resp.get_json()) == 1

    resp_parent = client.get("/api/scores/me", headers=auth_headers(parent["token"]))
    assert resp_parent.get_json() == []


def test_leaderboard_only_includes_completed(client, student):
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    auth = auth_headers(student["token"])
    client.post("/api/scores", json={"game_id": sudoku_id, "points": 300, "completed": True}, headers=auth)
    client.post("/api/scores", json={"game_id": sudoku_id, "points": 999, "completed": False}, headers=auth)

    resp = client.get("/api/scores/leaderboard/sudoku")
    assert resp.status_code == 200
    points = [s["points"] for s in resp.get_json()]
    assert points == [300]
