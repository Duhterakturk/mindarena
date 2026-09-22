import json
import uuid
from datetime import datetime

from app.extensions import db

EXAM_SIZE = 3
EXAM_LIMIT_SECONDS = 15 * 60


class Exam(db.Model):
    __tablename__ = "exams"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    game_ids = db.Column(db.Text, nullable=False)
    started_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    finished_at = db.Column(db.DateTime, nullable=True)
    limit_seconds = db.Column(db.Integer, nullable=False, default=EXAM_LIMIT_SECONDS)

    def game_id_list(self):
        return json.loads(self.game_ids)
