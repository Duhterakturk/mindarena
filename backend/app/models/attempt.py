import json
import uuid
from datetime import datetime

from app.extensions import db


class PuzzleAttempt(db.Model):
    __tablename__ = "puzzle_attempts"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True, index=True)
    game_id = db.Column(db.Integer, db.ForeignKey("games.id"), nullable=False, index=True)
    difficulty = db.Column(db.String(16), nullable=False)
    public_json = db.Column(db.Text, nullable=False)
    proof_json = db.Column(db.Text, nullable=False)
    started_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    consumed_at = db.Column(db.DateTime, nullable=True)

    game = db.relationship("Game")

    @property
    def public_puzzle(self):
        return json.loads(self.public_json)

    @property
    def proof_puzzle(self):
        return json.loads(self.proof_json)
