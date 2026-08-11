from datetime import datetime

from app.extensions import db


class Score(db.Model):
    __tablename__ = "scores"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False, index=True)

    points = db.Column(db.Integer, nullable=False, default=0)
    duration_seconds = db.Column(db.Integer, nullable=True)
    difficulty = db.Column(db.String(32), nullable=True)
    completed = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "game_id": self.game_id,
            "points": self.points,
            "duration_seconds": self.duration_seconds,
            "difficulty": self.difficulty,
            "completed": self.completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
