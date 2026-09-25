"""Skor yazıldıktan sonra aşama ve unvan duyurusu. Skor satırı oturumda olmalı."""

from app.models import Game, Score
from app.services.character import STAGES, RANKS, crossed, stage_for


def _completed_count(user_id, game_id=None):
    query = Score.query.filter_by(user_id=user_id, completed=True)
    if game_id is not None:
        query = query.filter_by(game_id=game_id)
    return query.count()


def notice_for(user_id, game_slug):
    game = Game.query.filter_by(slug=game_slug).first()
    total = _completed_count(user_id)
    game_count = _completed_count(user_id, game.id) if game else 0
    stage_key = crossed(total - 1, total, STAGES)
    rank_key = crossed(game_count - 1, game_count, RANKS)
    return {
        "solved": total,
        "stage": stage_for(total),
        "stage_up": stage_key,
        "new_title": {"game_slug": game_slug, "rank": rank_key} if rank_key else None,
    }
