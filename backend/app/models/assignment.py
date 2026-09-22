from datetime import datetime

from app.extensions import db


class Assignment(db.Model):
    __tablename__ = "assignments"

    id = db.Column(db.Integer, primary_key=True)
    classroom_id = db.Column(db.Integer, db.ForeignKey("classrooms.id"), nullable=False, index=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False)
    difficulty = db.Column(db.String(16), nullable=False)
    target_count = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    classroom = db.relationship("Classroom", backref=db.backref("assignments", lazy="dynamic"))
    game = db.relationship("Game")
