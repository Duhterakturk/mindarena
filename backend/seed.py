"""Oyun ve rozet kataloğunu veritabanına yükler. Kullanım: python seed.py"""
from app import create_app
from app.extensions import db
from app.models import Game, GAME_CATALOG, Badge, BADGE_CATALOG


def seed_games():
    for entry in GAME_CATALOG:
        game = Game.query.filter_by(slug=entry["slug"]).first()
        if not game:
            db.session.add(Game(**entry))
            continue
        game.name_tr = entry["name_tr"]
        game.name_en = entry["name_en"]
        game.min_grade_level = entry.get("min_grade_level", game.min_grade_level)
    db.session.commit()
    print(f"{len(GAME_CATALOG)} oyun kontrol edildi/güncellendi.")


def seed_badges():
    for entry in BADGE_CATALOG:
        if not Badge.query.filter_by(slug=entry["slug"]).first():
            db.session.add(Badge(**entry))
    db.session.commit()
    print(f"{len(BADGE_CATALOG)} rozet kontrol edildi/eklendi.")


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_games()
        seed_badges()
