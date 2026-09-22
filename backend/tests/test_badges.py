from tests.helpers import auth_headers
from tests.payloads import post_score
from app.services.badges import check_and_award_badges


def test_first_score_awards_ilk_adim_badge(client, student, app):
    resp = post_score(client, auth_headers(student["token"]), 1, app, duration=500)
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "ilk-adim" in slugs


def test_badge_not_awarded_twice(client, student, app):
    auth = auth_headers(student["token"])
    post_score(client, auth, 1, app, duration=900)
    resp = post_score(client, auth, 2, app, duration=900)
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "ilk-adim" not in slugs


def test_perfect_score_and_speed_badges(client, student, app):
    resp = post_score(client, auth_headers(student["token"]), 1, app, duration=10)
    slugs = {b["slug"] for b in resp.get_json()["new_badges"]}
    assert "mukemmel-skor" in slugs
    assert "hiz-ustasi" in slugs


def test_incomplete_score_awards_no_badges(client, student, app):
    resp = post_score(client, auth_headers(student["token"]), 1, app, answer=None)
    assert resp.get_json()["new_badges"] == []


def test_distinct_games_completed_badge(client, student, app):
    auth = auth_headers(student["token"])
    for game_id in range(1, 6):
        post_score(client, auth, game_id, app, duration=900)
    with app.app_context():
        earned = check_and_award_badges(student["user"]["id"])
    assert earned == []

    resp = client.get("/api/badges/me", headers=auth)
    slugs = {b["slug"] for b in resp.get_json()}
    assert "cesitli-oyuncu" in slugs
