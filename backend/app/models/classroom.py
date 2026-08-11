import secrets
import string

from datetime import datetime

from app.extensions import db


def _generate_join_code() -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(6))


class Classroom(db.Model):
    __tablename__ = "classrooms"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(128), nullable=False)
    teacher_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    join_code = db.Column(db.String(8), unique=True, nullable=False, default=_generate_join_code)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # `foreign_keys` zorunlu: users<->classrooms arasında iki FK var
    # (Classroom.teacher_id -> users.id ve User.classroom_id -> classrooms.id),
    # bu da belirtilmezse SQLAlchemy'nin hangisini kullanacağını çözememesine
    # (AmbiguousForeignKeysError) yol açar.
    students = db.relationship(
        "User", foreign_keys="User.classroom_id", backref="classroom", lazy="dynamic"
    )

    def to_dict(self, include_join_code: bool = False) -> dict:
        data = {
            "id": self.id,
            "name": self.name,
            "teacher_id": self.teacher_id,
            "student_count": self.students.count(),
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_join_code:
            data["join_code"] = self.join_code
        return data
