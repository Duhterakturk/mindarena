import uuid
from datetime import datetime

from app.extensions import db


class Certificate(db.Model):
    __tablename__ = "certificates"
    __table_args__ = (db.UniqueConstraint("user_id", "kind", name="uq_certificate_kind"),)

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    kind = db.Column(db.String(32), nullable=False)
    earned_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    verify_code = db.Column(db.String(12), nullable=False, unique=True)

    def to_dict(self):
        return {
            "id": self.id,
            "kind": self.kind,
            "earned_at": self.earned_at.isoformat() if self.earned_at else None,
            "verify_code": self.verify_code,
        }
