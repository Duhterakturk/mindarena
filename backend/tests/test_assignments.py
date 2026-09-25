from datetime import datetime, timedelta

from app.extensions import db
from app.models import Game, Score
from tests.helpers import auth_headers, register_user


def _classroom(client, teacher, name="3-A"):
    return client.post(
        "/api/classrooms",
        json={"name": name},
        headers=auth_headers(teacher["token"]),
    ).get_json()


def _join(client, student, classroom):
    client.post(
        "/api/classrooms/join",
        json={"join_code": classroom["join_code"]},
        headers=auth_headers(student["token"]),
    )


def _assign(client, teacher, classroom, **overrides):
    payload = {"slug": "cit", "difficulty": "easy", "target_count": 2, **overrides}
    return client.post(
        f"/api/classrooms/{classroom['id']}/assignment",
        json=payload,
        headers=auth_headers(teacher["token"]),
    )


def _score(app, user_id, slug, difficulty="easy", completed=True, when=None):
    with app.app_context():
        game = Game.query.filter_by(slug=slug).one()
        row = Score(
            user_id=user_id,
            game_id=game.id,
            points=100,
            difficulty=difficulty,
            completed=completed,
            created_at=when or datetime.utcnow(),
        )
        db.session.add(row)
        db.session.commit()


def test_student_cannot_assign_homework(client, teacher, student):
    classroom = _classroom(client, teacher)
    resp = _assign(client, student, classroom)
    assert resp.status_code == 403


def test_teacher_cannot_assign_to_another_class(client, teacher):
    other = register_user(client, email="other-teacher@example.com", role="teacher").get_json()
    classroom = _classroom(client, {"token": other["access_token"]})
    resp = _assign(client, teacher, classroom)
    assert resp.status_code == 403


def test_homework_counts_only_matching_completed_scores_after_it_starts(client, teacher, student, app):
    classroom = _classroom(client, teacher)
    _join(client, student, classroom)
    _score(app, student["user"]["id"], "cit", when=datetime.utcnow() - timedelta(days=2))
    _score(app, student["user"]["id"], "sudoku")
    _score(app, student["user"]["id"], "cit", difficulty="hard")
    _score(app, student["user"]["id"], "cit", completed=False)

    created = _assign(client, teacher, classroom)
    assert created.status_code == 201
    _score(app, student["user"]["id"], "cit")

    mine = client.get("/api/assignments/mine", headers=auth_headers(student["token"]))
    body = mine.get_json()["assignment"]
    assert body["done_count"] == 1
    assert body["finished"] is False
    assert body["name_tr"] == "Çit"

    board = client.get(
        f"/api/classrooms/{classroom['id']}/assignment",
        headers=auth_headers(teacher["token"]),
    ).get_json()
    assert board["finished"] == []
    assert board["pending_count"] == 1
    assert board["class_total"] == 1
    assert "süren 1 kişi" in board["sentence"]

    _score(app, student["user"]["id"], "cit")
    board = client.get(
        f"/api/classrooms/{classroom['id']}/assignment",
        headers=auth_headers(teacher["token"]),
    ).get_json()
    assert [row["full_name"] for row in board["finished"]] == ["Test User"]
    assert board["pending_count"] == 0
    assert board["class_total"] == 2
    assert board["sentence"] == "3-A bu hafta 2 bulmacayı tamamladı. Ödevi süren 0 kişi kaldı."


def test_one_drop_can_include_several_games(client, teacher, student, app):
    classroom = _classroom(client, teacher)
    _join(client, student, classroom)
    created = _assign(client, teacher, classroom, slugs=["cit", "sudoku"], target_count=1)
    assert created.status_code == 201
    names = [item["name_tr"] for item in created.get_json()["assignments"]]
    assert names == ["Çit", "Sudoku"]

    _score(app, student["user"]["id"], "cit")
    mine = client.get("/api/assignments/mine", headers=auth_headers(student["token"])).get_json()
    assert mine["finished"] is False
    assert [item["finished"] for item in mine["assignments"]] == [True, False]

    _score(app, student["user"]["id"], "sudoku")
    board = client.get(
        f"/api/classrooms/{classroom['id']}/assignment",
        headers=auth_headers(teacher["token"]),
    ).get_json()
    assert board["pending_count"] == 0
    assert board["class_total"] == 2


def test_board_does_not_name_students_who_are_still_short(client, teacher, student, app):
    classroom = _classroom(client, teacher)
    _join(client, student, classroom)
    other = register_user(client, email="late@example.com", full_name="Geç Kalan", role="student").get_json()
    _join(client, {"token": other["access_token"], "user": other["user"]}, classroom)
    _assign(client, teacher, classroom, target_count=1)
    _score(app, student["user"]["id"], "cit")

    board = client.get(
        f"/api/classrooms/{classroom['id']}/assignment",
        headers=auth_headers(teacher["token"]),
    ).get_json()
    assert [row["full_name"] for row in board["finished"]] == ["Test User"]
    assert "Geç Kalan" not in board["sentence"]
    assert board["pending_count"] == 1
