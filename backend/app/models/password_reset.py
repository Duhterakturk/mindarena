import hashlib
import uuid
from datetime import datetime, timedelta

from app.extensions import db

RESET_HOURS = 1


def hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


class PasswordReset(db.Model):
    __tablename__ = "password_resets"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    token_hash = db.Column(db.String(64), nullable=False, unique=True, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def is_open(self, now=None) -> bool:
        now = now or datetime.utcnow()
        return self.used_at is None and self.expires_at > now


def fresh_expiry() -> datetime:
    return datetime.utcnow() + timedelta(hours=RESET_HOURS)
