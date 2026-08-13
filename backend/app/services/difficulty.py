from app.models import Score, Game

DIFFICULTY_ORDER = ["easy", "medium", "hard"]
UNLOCK_THRESHOLD = 5  # bir sonraki kademeyi açmak için gereken tamamlama sayısı


def compute_unlocked_difficulties(user_id: str, game_slug: str) -> dict:
    """Kullanıcının bir oyundaki zorluk kademesi ilerlemesini hesaplar.
    "easy" her zaman açıktır. Bir kademe, bir önceki kademede en az
    UNLOCK_THRESHOLD tamamlanmış (completed=True) skor olduğunda açılır —
    bu sayede ayrı bir "ilerleme" tablosu gerekmeden mevcut Score
    geçmişinden hesaplanabilir."""
    game = Game.query.filter_by(slug=game_slug).first()
    if not game:
        return None

    counts = {level: 0 for level in DIFFICULTY_ORDER}
    scores = Score.query.filter_by(user_id=user_id, game_id=game.id, completed=True).all()
    for s in scores:
        if s.difficulty in counts:
            counts[s.difficulty] += 1

    unlocked = {}
    for i, level in enumerate(DIFFICULTY_ORDER):
        if i == 0:
            unlocked[level] = True
        else:
            previous = DIFFICULTY_ORDER[i - 1]
            unlocked[level] = counts[previous] >= UNLOCK_THRESHOLD

    return {
        "game_slug": game_slug,
        "unlocked": unlocked,
        "progress": counts,
        "threshold": UNLOCK_THRESHOLD,
    }
