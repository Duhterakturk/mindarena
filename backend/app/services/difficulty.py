from app.extensions import db
from app.models import Score, Game

DIFFICULTY_ORDER = ["easy", "medium", "hard"]
UNLOCK_THRESHOLD = 5  # bir sonraki kademeyi açmak için gereken tamamlama sayısı


def _counts():
    return {level: 0 for level in DIFFICULTY_ORDER}


def _unlocked(counts):
    opened = {}
    for index, level in enumerate(DIFFICULTY_ORDER):
        if index == 0:
            opened[level] = True
        else:
            previous = DIFFICULTY_ORDER[index - 1]
            opened[level] = counts[previous] >= UNLOCK_THRESHOLD
    return opened


def compute_unlocked_difficulties(user_id: str, game_slug: str) -> dict:
    """Kullanıcının bir oyundaki zorluk kademesi ilerlemesini hesaplar.
    "easy" her zaman açıktır. Bir kademe, bir önceki kademede en az
    UNLOCK_THRESHOLD tamamlanmış (completed=True) skor olduğunda açılır —
    bu sayede ayrı bir "ilerleme" tablosu gerekmeden mevcut Score
    geçmişinden hesaplanabilir."""
    game = Game.query.filter_by(slug=game_slug).first()
    if not game:
        return None

    counts = _counts()
    scores = Score.query.filter_by(user_id=user_id, game_id=game.id, completed=True).all()
    for row in scores:
        if row.difficulty in counts:
            counts[row.difficulty] += 1

    return {
        "game_slug": game_slug,
        "unlocked": _unlocked(counts),
        "progress": counts,
        "threshold": UNLOCK_THRESHOLD,
    }


def compute_all_unlocked(user_id: str) -> dict:
    """Bütün oyunların kademe ilerlemesi, tek sorguda."""
    games = Game.query.order_by(Game.id).all()
    counts = {game.id: _counts() for game in games}
    rows = (
        db.session.query(Score.game_id, Score.difficulty, db.func.count())
        .filter(Score.user_id == user_id, Score.completed.is_(True))
        .group_by(Score.game_id, Score.difficulty)
        .all()
    )
    for game_id, difficulty, total in rows:
        bucket = counts.get(game_id)
        if bucket is not None and difficulty in bucket:
            bucket[difficulty] = int(total)

    return {
        "threshold": UNLOCK_THRESHOLD,
        "games": {
            game.slug: {"unlocked": _unlocked(counts[game.id]), "progress": counts[game.id]}
            for game in games
        },
    }
