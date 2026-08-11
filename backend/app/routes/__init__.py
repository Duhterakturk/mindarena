from app.routes.auth import auth_bp
from app.routes.games import games_bp
from app.routes.scores import scores_bp
from app.routes.users import users_bp
from app.routes.badges import badges_bp
from app.routes.progress import progress_bp
from app.routes.classrooms import classrooms_bp


def register_routes(app):
    app.register_blueprint(auth_bp)
    app.register_blueprint(games_bp)
    app.register_blueprint(scores_bp)
    app.register_blueprint(users_bp)
    app.register_blueprint(badges_bp)
    app.register_blueprint(progress_bp)
    app.register_blueprint(classrooms_bp)
