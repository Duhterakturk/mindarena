from flask import Blueprint, jsonify

from app.models import Game

games_bp = Blueprint("games", __name__, url_prefix="/api/games")


@games_bp.get("")
def list_games():
    games = Game.query.filter_by(is_active=True).order_by(Game.name_tr).all()
    return jsonify([g.to_dict() for g in games])


@games_bp.get("/<string:slug>")
def get_game(slug):
    game = Game.query.filter_by(slug=slug).first()
    if not game:
        return jsonify({"error": "Oyun bulunamadı"}), 404
    return jsonify(game.to_dict())
