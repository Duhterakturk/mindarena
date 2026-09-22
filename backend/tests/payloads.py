import json
from copy import deepcopy
from datetime import datetime, timedelta
from pathlib import Path
from unittest.mock import patch

from app.extensions import db
from app.models import PuzzleAttempt
from app.models.game import GAME_CATALOG

_ROUNDS = json.loads(Path(__file__).with_name("fixtures").joinpath("rounds.json").read_text(encoding="utf-8"))
_CLOCK = datetime(2030, 1, 1, 12, 0, 0)


def reference(game_id):
    slug = GAME_CATALOG[game_id - 1]["slug"]
    sample = deepcopy(_ROUNDS[slug])
    return sample["puzzle"], sample["answer"]


def post_score(client, headers, game_id, app, duration=60, answer="solved"):
    opened = client.post(
        "/api/puzzles",
        json={"game_id": game_id, "difficulty": "easy"},
        headers=headers,
    )
    assert opened.status_code == 201, opened.get_json()
    attempt_id = opened.get_json()["id"]
    with app.app_context():
        row = db.session.get(PuzzleAttempt, attempt_id)
        row.started_at = _CLOCK - timedelta(seconds=duration)
        db.session.commit()

    body = {"attempt_id": attempt_id, "duration_seconds": 1, "points": 9999}
    if answer == "solved":
        slug = GAME_CATALOG[game_id - 1]["slug"]
        body["answer"] = deepcopy(_ROUNDS[slug]["answer"])
    elif answer is not None:
        body["answer"] = answer

    with patch("app.routes.scores.datetime") as clock:
        clock.utcnow.return_value = _CLOCK
        return client.post("/api/scores", json=body, headers=headers)
