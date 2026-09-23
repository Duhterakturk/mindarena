"""Üretim WSGI giriş noktası. Kullanım: gunicorn -w 1 -b 0.0.0.0:5000 wsgi:app"""
import threading

from app import create_app

app = create_app("production")


def _prepare_database():
    try:
        from flask_migrate import upgrade
        from seed import seed_badges, seed_games

        with app.app_context():
            upgrade()
            seed_games()
            seed_badges()
    except Exception:
        app.logger.exception("Veritabanı hazırlanamadı")


def _warm_puzzles():
    try:
        from app.services.issuer import warm_shelf

        warm_shelf()
    except Exception:
        app.logger.exception("Bulmaca rafı hazırlanamadı")


threading.Thread(target=_prepare_database, daemon=True).start()
threading.Thread(target=_warm_puzzles, daemon=True).start()
