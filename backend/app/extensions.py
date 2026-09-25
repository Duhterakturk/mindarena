from flask import jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(key_func=get_remote_address)


def _jwt_unauthorized(message):
    return jsonify({"error": message}), 401


@jwt.expired_token_loader
def _expired_token(_header, _payload):
    return _jwt_unauthorized("Oturum süresi doldu")


@jwt.invalid_token_loader
def _invalid_token(_reason):
    return _jwt_unauthorized("Geçersiz oturum")


@jwt.unauthorized_loader
def _missing_token(_reason):
    return _jwt_unauthorized("Giriş gerekli")
