import json
import random
from datetime import datetime

from app.extensions import db
from app.models import Game, Score
from app.models.exam import EXAM_LIMIT_SECONDS, EXAM_SIZE, Exam


def open_exam(user):
    current = (
        Exam.query.filter_by(user_id=user.id, finished_at=None)
        .order_by(Exam.started_at.desc())
        .first()
    )
    if current:
        return current

    grade = user.grade_level if user.grade_level else 12
    pool = [g for g in Game.query.filter_by(is_active=True).all() if g.min_grade_level <= grade]
    if len(pool) < EXAM_SIZE:
        pool = Game.query.filter_by(is_active=True).all()
    chosen = random.sample(pool, EXAM_SIZE)
    exam = Exam(
        user_id=user.id,
        game_ids=json.dumps([g.id for g in chosen]),
        started_at=datetime.utcnow(),
        limit_seconds=EXAM_LIMIT_SECONDS,
    )
    db.session.add(exam)
    db.session.commit()
    return exam


def latest_exam(user):
    return Exam.query.filter_by(user_id=user.id).order_by(Exam.started_at.desc()).first()


def exam_payload(exam):
    if exam is None:
        return None
    games = {g.id: g for g in Game.query.filter(Game.id.in_(exam.game_id_list())).all()}
    rows = []
    total = 0
    done = 0
    for game_id in exam.game_id_list():
        game = games.get(game_id)
        score = (
            Score.query.filter(
                Score.user_id == exam.user_id,
                Score.game_id == game_id,
                Score.completed.is_(True),
                Score.created_at >= exam.started_at,
            )
            .order_by(Score.created_at.asc())
            .first()
        )
        if score:
            done += 1
            total += score.points
        rows.append(
            {
                "id": game_id,
                "slug": game.slug if game else None,
                "name_tr": game.name_tr if game else None,
                "name_en": game.name_en if game else None,
                "done": score is not None,
                "points": score.points if score else None,
            }
        )

    elapsed = max(0, int((datetime.utcnow() - exam.started_at).total_seconds()))
    if done == len(rows) and exam.finished_at is None:
        exam.finished_at = datetime.utcnow()
        db.session.commit()
        elapsed = max(0, int((exam.finished_at - exam.started_at).total_seconds()))

    return {
        "id": exam.id,
        "started_at": exam.started_at.isoformat() if exam.started_at else None,
        "finished_at": exam.finished_at.isoformat() if exam.finished_at else None,
        "limit_seconds": exam.limit_seconds,
        "elapsed_seconds": elapsed,
        "on_time": elapsed <= exam.limit_seconds if exam.finished_at else None,
        "total_points": total,
        "games": rows,
    }
