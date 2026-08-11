import re

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    create_access_token,
    create_refresh_token,
    jwt_required,
    get_jwt_identity,
)

from app.extensions import db, limiter
from app.models import User, UserRole

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
MIN_PASSWORD_LENGTH = 8


@auth_bp.post("/register")
@limiter.limit("10 per minute")
def register():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    full_name = (data.get("full_name") or "").strip()
    role = data.get("role", UserRole.STUDENT.value)
    grade_level = data.get("grade_level")

    if not email or not password or not full_name:
        return jsonify({"error": "email, password ve full_name zorunludur"}), 400

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Geçersiz e-posta adresi"}), 400

    if len(password) < MIN_PASSWORD_LENGTH:
        return jsonify({"error": f"Şifre en az {MIN_PASSWORD_LENGTH} karakter olmalıdır"}), 400

    if role not in [r.value for r in UserRole]:
        return jsonify({"error": "Geçersiz rol"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Bu e-posta zaten kayıtlı"}), 409

    user = User(email=email, full_name=full_name, role=UserRole(role), grade_level=grade_level)
    user.set_password(password)
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(
        {"user": user.to_dict(), "access_token": access_token, "refresh_token": refresh_token}
    ), 201


@auth_bp.post("/login")
@limiter.limit("10 per minute")
def login():
    data = request.get_json(force=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "E-posta veya şifre hatalı"}), 401

    access_token = create_access_token(identity=user.id)
    refresh_token = create_refresh_token(identity=user.id)
    return jsonify(
        {"user": user.to_dict(), "access_token": access_token, "refresh_token": refresh_token}
    )


@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    access_token = create_access_token(identity=identity)
    return jsonify({"access_token": access_token})


@auth_bp.get("/me")
@jwt_required()
def me():
    user = db.session.get(User, get_jwt_identity())
    if not user:
        return jsonify({"error": "Kullanıcı bulunamadı"}), 404
    return jsonify(user.to_dict())
