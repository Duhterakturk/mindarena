from datetime import datetime, timedelta

from app.extensions import db
from app.models import Game, PersonalBest, PuzzleAttempt, StarLedger, User
from app.services.stars import award, target_seconds


def _attempt(user_id, difficulty, hint):
    game = Game.query.filter_by(slug="kakuro").one()
    row = PuzzleAttempt(
        user_id=user_id,
        game_id=game.id,
        difficulty=difficulty,
        public_json="{}",
        proof_json="{}",
        started_at=datetime.utcnow() - timedelta(seconds=10),
        hint_json='[{"kind":"fill"}]' if hint else None,
    )
    db.session.add(row)
    db.session.flush()
    return row


def test_star_formula_covers_every_combination(app, student):
    user_id = student["user"]["id"]
    expected = 0
    with app.app_context():
        for difficulty, multiplier in (("easy", 1), ("medium", 2), ("hard", 3)):
            target = target_seconds("kakuro", difficulty)
            for hint in (False, True):
                for fast in (False, True):
                    duration = target - 30 if fast else target + 30
                    summary = award(_attempt(user_id, difficulty, hint), duration)
                    base = ["solve"]
                    if not hint:
                        base.append("no_hint")
                    if fast:
                        base.append("fast")
                    assert summary["pieces"] == [part for part in base for _ in range(multiplier)]
                    expected += summary["earned"]
                    if summary["new_record"]:
                        expected += 2
        db.session.commit()
        user = db.session.get(User, user_id)
        ledger = sum(row.amount for row in StarLedger.query.filter_by(user_id=user_id))
        assert user.star_balance == expected
        assert ledger == expected


def test_the_same_attempt_awards_stars_once(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        attempt = _attempt(user_id, "easy", False)
        first = award(attempt, 30)
        second = award(attempt, 30)
        db.session.commit()
        user = db.session.get(User, user_id)
        assert second["earned"] == first["earned"]
        assert user.star_balance == first["earned"]
        assert StarLedger.query.filter_by(attempt_id=attempt.id, reason="solve").count() == 1


def test_a_faster_solve_updates_the_record(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        award(_attempt(user_id, "easy", False), 200)
        summary = award(_attempt(user_id, "easy", False), 50)
        db.session.commit()
        assert summary["new_record"] is True
        assert summary["previous_seconds"] == 200
        assert summary["improved_by"] == 150
        best = PersonalBest.query.filter_by(user_id=user_id, game_slug="kakuro", difficulty="easy").one()
        assert best.best_seconds == 50
        assert StarLedger.query.filter_by(user_id=user_id, reason="record").one().amount == 2
