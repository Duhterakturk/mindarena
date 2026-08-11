from tests.helpers import auth_headers


def test_progress_me_aggregates_completed_scores(client, student):
    auth = auth_headers(student["token"])
    client.post("/api/scores", json={"game_id": 1, "points": 500, "completed": True}, headers=auth)
    client.post("/api/scores", json={"game_id": 2, "points": 700, "completed": True}, headers=auth)
    client.post("/api/scores", json={"game_id": 1, "points": 999, "completed": False}, headers=auth)

    resp = client.get("/api/progress/me", headers=auth)
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["total_attempts"] == 3
    assert data["total_completed"] == 2
    assert data["total_points"] == 1200
    assert data["distinct_games_completed"] == 2


def test_progress_export_returns_xlsx(client, student):
    auth = auth_headers(student["token"])
    client.post("/api/scores", json={"game_id": 1, "points": 500, "completed": True}, headers=auth)

    resp = client.get("/api/progress/export", headers=auth)
    assert resp.status_code == 200
    assert resp.headers["Content-Type"] == (
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    assert resp.data[:2] == b"PK"  # xlsx dosyaları zip (PK) imzasıyla başlar
