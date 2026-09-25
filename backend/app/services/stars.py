from datetime import datetime

from app.extensions import db
from app.models.star import PersonalBest, StarLedger

MULTIPLIER = {"easy": 1, "medium": 2, "hard": 3}

# Hedef süre saniye. Altında bitirmek "hızlı" yıldızı verir.
_DEFAULT = {"easy": 120, "medium": 180, "hard": 300}
_SLOWER = {"easy": 180, "medium": 300, "hard": 480}
TARGETS = {
    slug: dict(times)
    for slug, times in {
        "kakuro": _SLOWER,
        "sudoku": _SLOWER,
        "bolgesel-sudoku": _DEFAULT,
        "apartman": _DEFAULT,
        "cit": _SLOWER,
        "amiral-batti": _DEFAULT,
        "sihirli-piramit": _DEFAULT,
        "patika": _SLOWER,
        "abc-baglama": _DEFAULT,
        "islem-karesi": _DEFAULT,
        "kendoku": _SLOWER,
        "yildiz-savaslari": _DEFAULT,
        "kare-karalamaca": _DEFAULT,
        "carpmaca": _DEFAULT,
        "futoshiki": _DEFAULT,
        "pentominolar": _SLOWER,
        "metaforms": _SLOWER,
        "numbers": _DEFAULT,
        "colours": _SLOWER,
    }.items()
}


def target_seconds(slug, difficulty):
    table = TARGETS.get(slug) or _DEFAULT
    return table.get(difficulty, _DEFAULT["medium"])


def _hint_used(attempt):
    raw = attempt.hint_json or ""
    return bool(raw) and raw not in ("null", "[]")


def breakdown(attempt, seconds):
    difficulty = attempt.difficulty if attempt.difficulty in MULTIPLIER else "easy"
    multiplier = MULTIPLIER[difficulty]
    parts = ["solve"]
    if not _hint_used(attempt):
        parts.append("no_hint")
    if seconds < target_seconds(attempt.game.slug, difficulty):
        parts.append("fast")
    pieces = [part for part in parts for _ in range(multiplier)]
    return {"earned": len(pieces), "pieces": pieces, "multiplier": multiplier}


def award(attempt, seconds):
    """Yıldızı bir kez yazar. Dönüş kutlama kartının okuduğu özet."""
    summary = breakdown(attempt, seconds)
    summary.update(new_record=False, previous_seconds=None, improved_by=None, star_balance=None)
    if not attempt.user_id:
        return summary
    from app.models import User
    user = db.session.get(User, attempt.user_id)
    if user is None:
        return summary

    already = StarLedger.query.filter_by(attempt_id=attempt.id, reason="solve").first()
    if already is None:
        _credit(user, summary["earned"], "solve", attempt.id)
    best = PersonalBest.query.filter_by(
        user_id=user.id, game_slug=attempt.game.slug, difficulty=attempt.difficulty
    ).first()
    record_already = StarLedger.query.filter_by(attempt_id=attempt.id, reason="record").first()
    if best is None:
        db.session.add(PersonalBest(
            user_id=user.id,
            game_slug=attempt.game.slug,
            difficulty=attempt.difficulty,
            best_seconds=seconds,
            achieved_at=datetime.utcnow(),
        ))
    elif seconds < best.best_seconds and record_already is None:
        previous = best.best_seconds
        best.best_seconds = seconds
        best.achieved_at = datetime.utcnow()
        _credit(user, 2, "record", attempt.id)
        summary["new_record"] = True
        summary["previous_seconds"] = previous
        summary["improved_by"] = previous - seconds
    summary["star_balance"] = int(user.star_balance or 0)
    return summary


def _credit(user, amount, reason, attempt_id):
    if amount <= 0:
        return
    user.star_balance = int(user.star_balance or 0) + amount
    user.stars_earned_total = int(user.stars_earned_total or 0) + amount
    db.session.add(StarLedger(
        user_id=user.id,
        amount=amount,
        reason=reason,
        attempt_id=attempt_id,
        created_at=datetime.utcnow(),
    ))
