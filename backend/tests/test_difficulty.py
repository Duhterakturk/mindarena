from app.models.game import GAME_CATALOG
from tests.helpers import auth_headers
from tests.payloads import post_score


def test_teacher_can_open_a_locked_difficulty(client, teacher, student):
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    blocked = client.post(
        "/api/puzzles",
        json={"game_id": sudoku_id, "difficulty": "medium"},
        headers=auth_headers(student["token"]),
    )
    assert blocked.status_code == 403
    opened = client.post(
        "/api/puzzles",
        json={"game_id": sudoku_id, "difficulty": "medium"},
        headers=auth_headers(teacher["token"]),
    )
    assert opened.status_code == 201
    assert opened.get_json()["difficulty"] == "medium"


def test_easy_always_unlocked(client, student):
    resp = client.get("/api/progress/unlocked/sudoku", headers=auth_headers(student["token"]))
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["unlocked"]["easy"] is True
    assert data["unlocked"]["medium"] is False
    assert data["unlocked"]["hard"] is False
    assert data["progress"]["easy"] == 0


def test_medium_unlocks_after_threshold_easy_completions(client, student, app):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]

    for _ in range(4):
        post_score(client, auth, sudoku_id, app, duration=900)
    resp = client.get("/api/progress/unlocked/sudoku", headers=auth)
    assert resp.get_json()["unlocked"]["medium"] is False

    post_score(client, auth, sudoku_id, app, duration=900)
    resp2 = client.get("/api/progress/unlocked/sudoku", headers=auth)
    data = resp2.get_json()
    assert data["progress"]["easy"] == 5
    assert data["unlocked"]["medium"] is True
    assert data["unlocked"]["hard"] is False


def test_incomplete_scores_do_not_count(client, student, app):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    for _ in range(5):
        post_score(client, auth, sudoku_id, app, answer=None)
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


def test_unlocked_all_returns_every_game_in_one_payload(client, student, app):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    for _ in range(5):
        post_score(client, auth, sudoku_id, app, duration=900)

    resp = client.get("/api/progress/unlocked-all", headers=auth)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["threshold"] == 5
    assert set(data["games"]) == {entry["slug"] for entry in GAME_CATALOG}
    sudoku = data["games"]["sudoku"]
    assert sudoku["progress"]["easy"] == 5
    assert sudoku["unlocked"]["easy"] is True
    assert sudoku["unlocked"]["medium"] is True
    assert sudoku["unlocked"]["hard"] is False
    assert data["games"]["kakuro"]["progress"]["easy"] == 0
    assert data["games"]["kakuro"]["unlocked"]["medium"] is False


def test_unlocked_all_requires_auth(client):
    assert client.get("/api/progress/unlocked-all").status_code == 401


def test_locked_difficulty_is_not_issued(client, student):
    auth = auth_headers(student["token"])
    sudoku_id = client.get("/api/games/sudoku").get_json()["id"]
    resp = client.post("/api/puzzles", json={"game_id": sudoku_id, "difficulty": "hard"}, headers=auth)
    assert resp.status_code == 403
