from app.models import Score, User

DIFFICULTY_LABELS = {"easy": "Kolay", "medium": "Orta", "hard": "Zor"}


def completed_count(assignment, user_id):
    return Score.query.filter(
        Score.user_id == user_id,
        Score.game_id == assignment.game_id,
        Score.difficulty == assignment.difficulty,
        Score.completed.is_(True),
        Score.created_at >= assignment.created_at,
    ).count()


def assignment_payload(assignment, done_count=None):
    game = assignment.game
    return {
        "id": assignment.id,
        "classroom_id": assignment.classroom_id,
        "classroom_name": assignment.classroom.name,
        "game_id": assignment.game_id,
        "slug": game.slug,
        "name_tr": game.name_tr,
        "name_en": game.name_en,
        "difficulty": assignment.difficulty,
        "difficulty_label": DIFFICULTY_LABELS.get(assignment.difficulty, assignment.difficulty),
        "target_count": assignment.target_count,
        "done_count": done_count,
        "created_at": assignment.created_at.isoformat() if assignment.created_at else None,
    }


def board(assignments):
    if not isinstance(assignments, list):
        assignments = [assignments]
    classroom = assignments[0].classroom
    students = classroom.students.order_by(User.full_name).all()
    finished = []
    total = 0
    for student in students:
        counts = [completed_count(item, student.id) for item in assignments]
        total += sum(counts)
        if all(count >= item.target_count for count, item in zip(counts, assignments)):
            finished.append({"full_name": student.full_name, "count": sum(counts)})
    finished.sort(key=lambda row: row["full_name"])
    pending = len(students) - len(finished)
    sentence = (
        f"{classroom.name} bu hafta {total} bulmacayı tamamladı. "
        f"Ödevi süren {pending} kişi kaldı."
    )
    payloads = [assignment_payload(item) for item in assignments]
    return {
        "assignment": payloads[0],
        "assignments": payloads,
        "finished": finished,
        "pending_count": pending,
        "class_total": total,
        "sentence": sentence,
    }
