from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.extensions import db
from app.models import User, UserRole

users_bp = Blueprint("users", __name__, url_prefix="/api/users")


@users_bp.get("/children")
@jwt_required()
def my_children():
    user = db.session.get(User, get_jwt_identity())
    if not user or user.role != UserRole.PARENT:
        return jsonify({"error": "Bu uç nokta yalnızca veli rolü içindir"}), 403

    children = User.query.filter_by(parent_id=user.id).all()
    return jsonify([c.to_dict() for c in children])


@users_bp.post("/children/link")
@jwt_required()
def link_child():
    parent = db.session.get(User, get_jwt_identity())
    if not parent or parent.role != UserRole.PARENT:
        return jsonify({"error": "Bu uç nokta yalnızca veli rolü içindir"}), 403

    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return jsonify({"error": "email zorunludur"}), 400

    child = User.query.filter_by(email=email).first()
    if not child or child.role != UserRole.STUDENT:
        return jsonify({"error": "Bu e-posta ile kayıtlı bir öğrenci bulunamadı"}), 404
    if child.parent_id is not None and child.parent_id != parent.id:
        return jsonify({"error": "Bu öğrenci zaten başka bir veliye bağlı"}), 409

    child.parent_id = parent.id
    db.session.commit()
    return jsonify(child.to_dict())
