import uuid
from datetime import datetime

from app.extensions import db


class UserItem(db.Model):
    __tablename__ = "user_items"
    __table_args__ = (db.UniqueConstraint("user_id", "item_id", name="uq_user_item"),)

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    item_id = db.Column(db.String(64), nullable=False)
    equipped = db.Column(db.Boolean, nullable=False, default=False, server_default="0")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
