from app.extensions import db
from app.models import User


def balance_of(user_id):
    if not user_id:
        return None
    user = db.session.get(User, user_id)
    return None if user is None else int(user.hint_balance or 0)


def spend(user):
    if int(user.hint_balance or 0) < 1:
        return False
    user.hint_balance = int(user.hint_balance) - 1
    return True


def earn_once(attempt):
    """One extra hint the first time this puzzle is solved. Later checks do not add another."""
    if not attempt.user_id:
        return None
    user = db.session.get(User, attempt.user_id)
    if user is None:
        return None
    if not attempt.hint_earned:
        attempt.hint_earned = True
        user.hint_balance = int(user.hint_balance or 0) + 1
    return int(user.hint_balance)
