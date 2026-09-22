from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import Assignment, Classroom, Game, User, UserRole
from app.services.assignments import DIFFICULTY_LABELS, assignment_payload, board, completed_count

assignments_bp = Blueprint("assignments", __name__, url_prefix="/api")


def _teacher_classroom(classroom_id):
    teacher = db.session.get(User, get_jwt_identity())
    if not teacher or teacher.role != UserRole.TEACHER:
        return None, (jsonify({"error": "Bu uç nokta yalnızca öğretmen rolü içindir"}), 403)
    classroom = db.session.get(Classroom, classroom_id)
    if not classroom or classroom.teacher_id != teacher.id:
        return None, (jsonify({"error": "Bu sınıf size ait değil"}), 403)
    return classroom, None


def _latest(classroom_id):
    return (
        Assignment.query.filter_by(classroom_id=classroom_id)
        .order_by(Assignment.created_at.desc(), Assignment.id.desc())
        .first()
    )


@assignments_bp.post("/classrooms/<int:classroom_id>/assignment")
@jwt_required()
def create_assignment(classroom_id):
    classroom, error = _teacher_classroom(classroom_id)
    if error:
        return error

    data = request.get_json(force=True) or {}
    slug = (data.get("slug") or "").strip()
    difficulty = (data.get("difficulty") or "").strip()
    try:
        target_count = int(data.get("target_count"))
    except (TypeError, ValueError):
        target_count = 0

    game = Game.query.filter_by(slug=slug, is_active=True).first()
    if not game:
        return jsonify({"error": "Oyun bulunamadı"}), 404
    if difficulty not in DIFFICULTY_LABELS:
        return jsonify({"error": "Geçersiz zorluk"}), 400
    if target_count < 1 or target_count > 10:
        return jsonify({"error": "Hedef 1 ile 10 arasında olmalıdır"}), 400

    assignment = Assignment(
        classroom_id=classroom.id,
        game_id=game.id,
        difficulty=difficulty,
        target_count=target_count,
    )
    db.session.add(assignment)
    db.session.commit()
    return jsonify(board(assignment)), 201


@assignments_bp.get("/classrooms/<int:classroom_id>/assignment")
@jwt_required()
def current_assignment(classroom_id):
    _, error = _teacher_classroom(classroom_id)
    if error:
        return error
    assignment = _latest(classroom_id)
    if assignment is None:
        return jsonify({"assignment": None, "finished": [], "pending_count": 0, "class_total": 0, "sentence": ""})
    return jsonify(board(assignment))


@assignments_bp.get("/assignments/mine")
@jwt_required()
def my_assignment():
    student = db.session.get(User, get_jwt_identity())
    if not student or student.role != UserRole.STUDENT:
        return jsonify({"error": "Bu uç nokta yalnızca öğrenci rolü içindir"}), 403
    if not student.classroom_id:
        return jsonify({"assignment": None})
    assignment = _latest(student.classroom_id)
    if assignment is None:
        return jsonify({"assignment": None})
    done = completed_count(assignment, student.id)
    payload = assignment_payload(assignment, done)
    payload["finished"] = done >= assignment.target_count
    return jsonify({"assignment": payload})
