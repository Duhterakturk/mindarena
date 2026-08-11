from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from app.models import Badge, UserBadge

badges_bp = Blueprint("badges", __name__, url_prefix="/api/badges")


@badges_bp.get("")
def list_badges():
    badges = Badge.query.order_by(Badge.id).all()
    return jsonify([b.to_dict() for b in badges])


@badges_bp.get("/me")
@jwt_required()
def my_badges():
    user_id = get_jwt_identity()
    earned = (
        UserBadge.query.filter_by(user_id=user_id)
        .order_by(UserBadge.earned_at.desc())
        .all()
    )
    return jsonify([ub.to_dict() for ub in earned])
