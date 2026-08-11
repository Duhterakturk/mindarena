import pytest

from app import create_app
from app.extensions import db as _db
from app.models import Game, GAME_CATALOG, Badge, BADGE_CATALOG
from tests.helpers import register_user


@pytest.fixture()
def app():
    application = create_app("testing")
    with application.app_context():
        _db.create_all()
        for entry in GAME_CATALOG:
            _db.session.add(Game(**entry))
        for entry in BADGE_CATALOG:
            _db.session.add(Badge(**entry))
        _db.session.commit()
        yield application
        _db.session.remove()
        _db.drop_all()


@pytest.fixture()
def client(app):
    return app.test_client()


@pytest.fixture()
def student(client):
    resp = register_user(client, email="student@example.com", role="student", grade_level=3)
    data = resp.get_json()
    return {"user": data["user"], "token": data["access_token"]}


@pytest.fixture()
def parent(client):
    resp = register_user(client, email="parent@example.com", role="parent")
    data = resp.get_json()
    return {"user": data["user"], "token": data["access_token"]}


@pytest.fixture()
def teacher(client):
    resp = register_user(client, email="teacher@example.com", role="teacher")
    data = resp.get_json()
    return {"user": data["user"], "token": data["access_token"]}
