import os

from flask import Flask, jsonify

from app.config import config_by_name
from app.extensions import db, migrate, jwt, cors, limiter


INSECURE_DEFAULTS = {"dev-secret-change-me", "dev-jwt-secret-change-me"}


def create_app(config_name=None):
    config_name = config_name or os.environ.get("FLASK_ENV", "development")

    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    if config_name == "production" and (
        app.config["SECRET_KEY"] in INSECURE_DEFAULTS
        or app.config["JWT_SECRET_KEY"] in INSECURE_DEFAULTS
    ):
        raise RuntimeError(
            "Üretimde SECRET_KEY ve JWT_SECRET_KEY ortam değişkenleri güçlü, "
            "rastgele değerlerle ayarlanmalıdır (bkz. .env.example)."
        )

    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}})
    limiter.init_app(app)

    from app.routes import register_routes

    register_routes(app)

    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok"})

    return app
