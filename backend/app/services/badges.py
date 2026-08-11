from app.extensions import db
from app.models import Badge, UserBadge, Score


def _meets_criteria(criteria_type: str, criteria_value: int, stats: dict) -> bool:
    if criteria_type == "total_completed":
        return stats["total_completed"] >= criteria_value
    if criteria_type == "distinct_games_completed":
        return stats["distinct_games_completed"] >= criteria_value
    if criteria_type == "single_score_at_least":
        return stats["max_points"] >= criteria_value
    if criteria_type == "fastest_completion_under":
        return stats["fastest_seconds"] is not None and stats["fastest_seconds"] < criteria_value
    return False


def check_and_award_badges(user_id: str) -> list[Badge]:
    """Kullanıcının tamamlanmış skorlarını kataloğa karşı değerlendirir ve
    henüz kazanılmamış rozetleri kaydeder. Yeni kazanılan rozetleri döner."""
    completed_scores = Score.query.filter_by(user_id=user_id, completed=True).all()

    total_completed = len(completed_scores)
    distinct_games_completed = len({s.game_id for s in completed_scores})
    max_points = max((s.points for s in completed_scores), default=0)
    durations = [s.duration_seconds for s in completed_scores if s.duration_seconds is not None]
    fastest_seconds = min(durations) if durations else None

    stats = {
        "total_completed": total_completed,
        "distinct_games_completed": distinct_games_completed,
        "max_points": max_points,
        "fastest_seconds": fastest_seconds,
    }

    already_earned_ids = {
        ub.badge_id for ub in UserBadge.query.filter_by(user_id=user_id).all()
    }

    newly_earned = []
    for badge in Badge.query.all():
        if badge.id in already_earned_ids:
            continue
        if _meets_criteria(badge.criteria_type, badge.criteria_value, stats):
            user_badge = UserBadge(user_id=user_id, badge_id=badge.id)
            db.session.add(user_badge)
            newly_earned.append(badge)

    if newly_earned:
        db.session.commit()

    return newly_earned
