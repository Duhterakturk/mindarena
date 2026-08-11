import enum
import uuid
from datetime import datetime

from werkzeug.security import generate_password_hash, check_password_hash

from app.extensions import db


class UserRole(str, enum.Enum):
    STUDENT = "student"
    PARENT = "parent"
    TEACHER = "teacher"


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    full_name = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    grade_level = db.Column(db.Integer, nullable=True)

    parent_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=True)
    children = db.relationship(
        "User", backref=db.backref("parent", remote_side=[id]), lazy="dynamic"
    )

    classroom_id = db.Column(db.Integer, db.ForeignKey("classrooms.id"), nullable=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    scores = db.relationship("Score", backref="user", lazy="dynamic")

    def set_password(self, password: str) -> None:
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        return check_password_hash(self.password_hash, password)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "full_name": self.full_name,
            "role": self.role.value,
            "grade_level": self.grade_level,
            "parent_id": self.parent_id,
            "classroom_id": self.classroom_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
