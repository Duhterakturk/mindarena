from datetime import datetime, timedelta
from io import BytesIO

from pypdf import PdfReader

from app.extensions import db
from app.models import Certificate, Game, Score, User
from app.models.game import GAME_CATALOG
from app.services.certificates import award_new, render_pdf
from tests.helpers import auth_headers, register_user


def _score(user_id, slug, when=None):
    game = Game.query.filter_by(slug=slug).one()
    db.session.add(Score(
        user_id=user_id,
        game_id=game.id,
        points=100,
        duration_seconds=30,
        difficulty="easy",
        completed=True,
        created_at=when or datetime.utcnow(),
    ))


def test_thresholds_create_a_certificate_once(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        for _ in range(10):
            _score(user_id, "kakuro")
        db.session.commit()
        first = award_new(user_id)
        db.session.commit()
        assert [row.kind for row in first] == ["puzzles-10"]
        assert award_new(user_id) == []

        for index, entry in enumerate(GAME_CATALOG):
            if entry["slug"] == "kakuro":
                continue
            _score(user_id, entry["slug"], datetime.utcnow() - timedelta(days=index + 1))
        for _ in range(50):
            _score(user_id, "sudoku")
        db.session.commit()
        kinds = {row.kind for row in award_new(user_id)}
        assert "puzzles-50" in kinds
        assert "master" in kinds
        assert "all-games" in kinds
        assert "days-7" in kinds


def test_only_the_owner_and_class_teacher_can_download(app, client, student, teacher):
    user_id = student["user"]["id"]
    with app.app_context():
        for _ in range(10):
            _score(user_id, "kakuro")
        db.session.commit()
        award_new(user_id)
        db.session.commit()
        cert_id = Certificate.query.filter_by(user_id=user_id).one().id

    classroom = client.post("/api/classrooms", json={"name": "3-A"}, headers=auth_headers(teacher["token"])).get_json()
    client.post("/api/classrooms/join", json={"join_code": classroom["join_code"]}, headers=auth_headers(student["token"]))
    other = register_user(client, email="other@example.com", role="student").get_json()
    outsider = register_user(client, email="outsider@example.com", role="teacher").get_json()

    owner = client.get(f"/api/certificates/{cert_id}/pdf", headers=auth_headers(student["token"]))
    teach = client.get(f"/api/certificates/{cert_id}/pdf", headers=auth_headers(teacher["token"]))
    stranger = client.get(f"/api/certificates/{cert_id}/pdf", headers=auth_headers(other["access_token"]))
    other_teacher = client.get(f"/api/certificates/{cert_id}/pdf", headers=auth_headers(outsider["access_token"]))
    assert owner.status_code == 200
    assert teach.status_code == 200
    assert stranger.status_code == 403
    assert other_teacher.status_code == 403


def test_pdf_prints_turkish_letters(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        user = db.session.get(User, user_id)
        user.full_name = "İpek şığlı"
        for _ in range(10):
            _score(user_id, "kakuro")
        db.session.commit()
        row = award_new(user_id)[0]
        db.session.commit()
        payload = render_pdf(user, row).getvalue()
        text = "\n".join(page.extract_text() or "" for page in PdfReader(BytesIO(payload)).pages)
        for letter in ("ş", "ğ", "ı", "İ"):
            assert letter in text
