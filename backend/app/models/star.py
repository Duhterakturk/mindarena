import uuid
from datetime import datetime

from app.extensions import db


class StarLedger(db.Model):
    __tablename__ = "star_ledger"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    amount = db.Column(db.Integer, nullable=False)
    reason = db.Column(db.String(16), nullable=False)
    attempt_id = db.Column(db.String(36), db.ForeignKey("puzzle_attempts.id"), nullable=True, index=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)


class PersonalBest(db.Model):
    __tablename__ = "personal_bests"
    __table_args__ = (db.UniqueConstraint("user_id", "game_slug", "difficulty", name="uq_personal_best"),)

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    game_slug = db.Column(db.String(64), nullable=False)
    difficulty = db.Column(db.String(16), nullable=False)
    best_seconds = db.Column(db.Integer, nullable=False)
    achieved_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
