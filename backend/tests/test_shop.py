from app.models import User
from app.services.character import crossed, rank_for, stage_for
from app.services.shop import CATALOG, ShopError, purchase


def _channel(hex_color, index):
    value = int(hex_color[1 + index * 2:3 + index * 2], 16) / 255
    return value / 12.92 if value <= 0.04045 else ((value + 0.055) / 1.055) ** 2.4


def _ratio(cell, ink):
    def lum(color):
        r, g, b = (_channel(color, 0), _channel(color, 1), _channel(color, 2))
        return 0.2126 * r + 0.7152 * g + 0.0722 * b
    lighter, darker = sorted((lum(cell), lum(ink)), reverse=True)
    return (lighter + 0.05) / (darker + 0.05)


def test_theme_ink_stays_readable_on_the_cell():
    for item in CATALOG:
        if "cell" not in item["preview"]:
            continue
        assert _ratio(item["preview"]["cell"], item["preview"]["ink"]) >= 4.5


def test_stage_and_rank_follow_solved_counts():
    assert stage_for(0) == "egg"
    assert stage_for(9) == "egg"
    assert stage_for(10) == "chick"
    assert stage_for(49) == "chick"
    assert stage_for(50) == "young"
    assert stage_for(150) == "wise"
    assert stage_for(400) == "legend"
    assert rank_for(4) is None
    assert rank_for(5) == "apprentice"
    assert rank_for(20) == "journeyman"
    assert rank_for(50) == "master"
    assert rank_for(100) == "grandmaster"
    assert crossed(9, 10, (("chick", 10), ("young", 50))) == "chick"
    assert crossed(10, 11, (("chick", 10),)) is None


def test_purchase_rejects_a_short_balance(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        user = db_user(user_id)
        user.star_balance = 10
        try:
            purchase(user, "theme-forest")
            raised = False
        except ShopError as exc:
            raised = exc.status == 402
        assert raised
        assert user.star_balance == 10


def test_the_same_item_cannot_be_bought_twice(app, student):
    user_id = student["user"]["id"]
    with app.app_context():
        user = db_user(user_id)
        user.star_balance = 80
        purchase(user, "theme-sea")
        try:
            purchase(user, "theme-sea")
            raised = False
        except ShopError as exc:
            raised = exc.status == 409
        assert raised
        assert user.star_balance == 50


def db_user(user_id):
    from app.extensions import db

    return db.session.get(User, user_id)
