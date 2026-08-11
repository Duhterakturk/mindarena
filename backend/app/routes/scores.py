from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Score, Game
from app.services.badges import check_and_award_badges

scores_bp = Blueprint("scores", __name__, url_prefix="/api/scores")


@scores_bp.post("")
@jwt_required()
def submit_score():
    user_id = get_jwt_identity()
    data = request.get_json(force=True) or {}

    game = db.session.get(Game, data.get("game_id"))
    if not game:
        return jsonify({"error": "Oyun bulunamadı"}), 404

    score = Score(
        user_id=user_id,
        game_id=game.id,
        points=int(data.get("points", 0)),
        duration_seconds=data.get("duration_seconds"),
        difficulty=data.get("difficulty"),
        completed=bool(data.get("completed", False)),
    )
    db.session.add(score)
    db.session.commit()

    new_badges = check_and_award_badges(user_id) if score.completed else []

    return jsonify({
        "score": score.to_dict(),
        "new_badges": [b.to_dict() for b in new_badges],
    }), 201


@scores_bp.get("/me")
@jwt_required()
def my_scores():
    user_id = get_jwt_identity()
    game_slug = request.args.get("game")

    query = Score.query.filter_by(user_id=user_id)
    if game_slug:
        game = Game.query.filter_by(slug=game_slug).first()
        if not game:
            return jsonify({"error": "Oyun bulunamadı"}), 404
        query = query.filter_by(game_id=game.id)

    scores = query.order_by(Score.created_at.desc()).limit(100).all()
    return jsonify([s.to_dict() for s in scores])


@scores_bp.get("/leaderboard/<string:game_slug>")
def leaderboard(game_slug):
    game = Game.query.filter_by(slug=game_slug).first()
    if not game:
        return jsonify({"error": "Oyun bulunamadı"}), 404

    top_scores = (
        Score.query.filter_by(game_id=game.id, completed=True)
        .order_by(Score.points.desc())
        .limit(20)
        .all()
    )
    return jsonify([s.to_dict() for s in top_scores])
