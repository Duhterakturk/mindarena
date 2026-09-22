from tests.helpers import auth_headers
from tests.payloads import post_score


def test_exam_requires_login(client):
    assert client.post("/api/exams").status_code == 401
    assert client.get("/api/exams/current").status_code == 401


def test_exam_picks_three_games_and_counts_only_new_scores(client, student, app):
    started = client.post("/api/exams", headers=auth_headers(student["token"]))
    assert started.status_code == 201
    exam = started.get_json()["exam"]
    assert len(exam["games"]) == 3
    assert len({game["id"] for game in exam["games"]}) == 3

    again = client.post("/api/exams", headers=auth_headers(student["token"]))
    assert again.get_json()["exam"]["id"] == exam["id"]

    first = exam["games"][0]["id"]
    post_score(client, auth_headers(student["token"]), first, app, duration=400)
    current = client.get("/api/exams/current", headers=auth_headers(student["token"])).get_json()["exam"]
    done = [game for game in current["games"] if game["done"]]
    assert len(done) == 1
    assert done[0]["points"] >= 100
    assert current["finished_at"] is None


def test_pdf_download_starts_with_a_pdf_header(client, student):
    resp = client.get("/api/progress/export.pdf", headers=auth_headers(student["token"]))
    assert resp.status_code == 200
    assert resp.data.startswith(b"%PDF")
