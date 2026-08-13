from tests.helpers import auth_headers


def test_easy_always_unlocked(client, student):
    resp = client.get("/api/progress/unlocked/sudoku", headers=auth_headers(student["token"]))
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["unlocked"]["easy"] is True
    assert data["unlocked"]["medium"] is False
    assert data["unlocked"]["hard"] is False
    assert data["progress"]["easy"] == 0


def test_medium_unlocks_after_threshold_easy_completions(client, student):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]

    for _ in range(4):
        client.post(
            "/api/scores",
            json={"game_id": sudoku_id, "points": 100, "difficulty": "easy", "completed": True},
            headers=auth,
        )
    resp = client.get("/api/progress/unlocked/sudoku", headers=auth)
    assert resp.get_json()["unlocked"]["medium"] is False

    client.post(
        "/api/scores",
        json={"game_id": sudoku_id, "points": 100, "difficulty": "easy", "completed": True},
        headers=auth,
    )
    resp2 = client.get("/api/progress/unlocked/sudoku", headers=auth)
    data = resp2.get_json()
    assert data["progress"]["easy"] == 5
    assert data["unlocked"]["medium"] is True
    assert data["unlocked"]["hard"] is False


def test_incomplete_scores_do_not_count(client, student):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    for _ in range(5):
        client.post(
            "/api/scores",
            json={"game_id": sudoku_id, "points": 100, "difficulty": "easy", "completed": False},
            headers=auth,
        )
    resp = client.get("/api/progress/unlocked/sudoku", headers=auth)
    data = resp.get_json()
    assert data["progress"]["easy"] == 0
    assert data["unlocked"]["medium"] is False


def test_unknown_game_returns_404(client, student):
    resp = client.get("/api/progress/unlocked/does-not-exist", headers=auth_headers(student["token"]))
    assert resp.status_code == 404


def test_unlocked_endpoint_requires_auth(client):
    resp = client.get("/api/progress/unlocked/sudoku")
    assert resp.status_code == 401
