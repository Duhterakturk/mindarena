from tests.helpers import auth_headers
from app.services.badges import check_and_award_badges


def test_first_score_awards_ilk_adim_badge(client, student):
    resp = client.post(
        "/api/scores",
        json={"game_id": 1, "points": 500, "completed": True},
        headers=auth_headers(student["token"]),
    )
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "ilk-adim" in slugs


def test_badge_not_awarded_twice(client, student):
    auth = auth_headers(student["token"])
    client.post("/api/scores", json={"game_id": 1, "points": 100, "completed": True}, headers=auth)
    resp = client.post("/api/scores", json={"game_id": 2, "points": 100, "completed": True}, headers=auth)
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "ilk-adim" not in slugs


def test_perfect_score_and_speed_badges(client, student):
    resp = client.post(
        "/api/scores",
        json={"game_id": 1, "points": 950, "duration_seconds": 10, "completed": True},
        headers=auth_headers(student["token"]),
    )
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "mukemmel-skor" in slugs
    assert "hiz-ustasi" in slugs


def test_incomplete_score_awards_no_badges(client, student):
    resp = client.post(
        "/api/scores",
        json={"game_id": 1, "points": 950, "completed": False},
        headers=auth_headers(student["token"]),
    )
    assert resp.get_json()["new_badges"] == []


def test_distinct_games_completed_badge(client, student, app):
    auth = auth_headers(student["token"])
    for game_id in range(1, 6):
        client.post(
            "/api/scores",
            json={"game_id": game_id, "points": 100, "completed": True},
            headers=auth,
        )
    with app.app_context():
        earned = check_and_award_badges(student["user"]["id"])
    # Should already have been awarded during the loop; a re-check awards nothing new.
    assert earned == []

    resp = client.get("/api/badges/me", headers=auth)
    slugs = {b["slug"] for b in resp.get_json()}
    assert "cesitli-oyuncu" in slugs
