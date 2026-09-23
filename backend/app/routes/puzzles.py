import json
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required, verify_jwt_in_request

from app.extensions import db, limiter
from app.models import Game, PuzzleAttempt, User, UserRole
from app.services.cell_hint import HintError, pick_hint
from app.services.difficulty import compute_unlocked_difficulties
from app.services.grading import GradeError, accepts
from app.services.issuer import IssueError, issue

_HINT_KEYS = {"kind", "row", "col", "value", "axis", "index", "round", "note", "label", "name", "cells", "shape", "color"}

puzzles_bp = Blueprint("puzzles", __name__, url_prefix="/api/puzzles")


@puzzles_bp.post("")
@limiter.limit("30 per minute")
def open_puzzle():
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    difficulty = data.get("difficulty") or "easy"
    if difficulty not in ("easy", "medium", "hard"):
        return jsonify({"error": "Zorluk geçersiz"}), 400

    game = _find_game(data)
    if game is None:
        return jsonify({"error": "Oyun bulunamadı"}), 404
    if not _difficulty_allowed(user_id, game.slug, difficulty):
        return jsonify({"error": "Bu zorluk henüz açık değil"}), 403

    try:
        public, proof = issue(game.slug, difficulty)
    except IssueError as exc:
        return jsonify({"error": str(exc)}), 503

    attempt = PuzzleAttempt(
        user_id=user_id,
        game_id=game.id,
        difficulty=difficulty,
        public_json=json.dumps(public),
        proof_json=json.dumps(proof),
        started_at=datetime.utcnow(),
    )
    db.session.add(attempt)
    db.session.commit()
    return jsonify(_payload(attempt)), 201


@puzzles_bp.get("/<string:attempt_id>")
def read_puzzle(attempt_id):
    verify_jwt_in_request(optional=True)
    attempt = db.session.get(PuzzleAttempt, attempt_id)
    if attempt is None or attempt.consumed_at is not None:
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    if not _can_see(attempt):
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    return jsonify(_payload(attempt))


@puzzles_bp.post("/<string:attempt_id>/check")
def check_puzzle(attempt_id):
    verify_jwt_in_request(optional=True)
    attempt = db.session.get(PuzzleAttempt, attempt_id)
    if attempt is None or attempt.consumed_at is not None:
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    if not _can_see(attempt):
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    answer = (request.get_json(silent=True) or {}).get("answer")
    try:
        correct = accepts(attempt.game.slug, attempt.difficulty, attempt.proof_puzzle, answer)
    except GradeError:
        correct = False
    return jsonify({"correct": correct})


@puzzles_bp.post("/<string:attempt_id>/cell")
@limiter.limit("20 per minute")
def reveal_cell(attempt_id):
    verify_jwt_in_request(optional=True)
    attempt = db.session.get(PuzzleAttempt, attempt_id)
    if attempt is None or attempt.consumed_at is not None:
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    if not _can_see(attempt):
        return jsonify({"error": "Bulmaca bulunamadı"}), 404
    if attempt.hint_json:
        return jsonify({
            "error": "Bu bulmacada ipucu zaten kullanıldı",
            "hint": json.loads(attempt.hint_json),
        }), 409
    focus = (request.get_json(silent=True) or {}).get("round")
    try:
        hint = pick_hint(attempt.game.slug, attempt.public_puzzle, attempt.proof_puzzle, focus)
    except HintError as exc:
        return jsonify({"error": str(exc)}), 400
    hint = {key: value for key, value in hint.items() if key in _HINT_KEYS}
    attempt.hint_json = json.dumps(hint)
    db.session.commit()
    return jsonify({"hint": hint})


def _find_game(data):
    if data.get("game_id") is not None:
        return db.session.get(Game, data.get("game_id"))
    slug = data.get("slug")
    if not slug:
        return None
    return Game.query.filter_by(slug=slug).first()


def _difficulty_allowed(user_id, slug, difficulty):
    if difficulty == "easy":
        return True
    if not user_id:
        return False
    user = db.session.get(User, user_id)
    if user and user.role == UserRole.TEACHER:
        return True
    progress = compute_unlocked_difficulties(user_id, slug)
    return bool(progress and progress["unlocked"].get(difficulty))


def _can_see(attempt):
    verify_jwt_in_request(optional=True)
    user_id = get_jwt_identity()
    if attempt.user_id is None:
        return user_id is None
    return attempt.user_id == user_id


def _payload(attempt):
    return {
        "id": attempt.id,
        "game_id": attempt.game_id,
        "slug": attempt.game.slug,
        "difficulty": attempt.difficulty,
        "puzzle": attempt.public_puzzle,
        "hint": json.loads(attempt.hint_json) if attempt.hint_json else None,
        "started_at": attempt.started_at.isoformat() if attempt.started_at else None,
    }
