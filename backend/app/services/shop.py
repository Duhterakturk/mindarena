"""Dükkân kataloğu. Ürünler yalnızca görünümü değiştirir."""

from app.extensions import db
from app.models.shop import UserItem
from app.models.star import StarLedger


class ShopError(Exception):
    def __init__(self, message, status):
        super().__init__(message)
        self.status = status


# Kontrast: açık zeminde koyu yazı, koyu zeminde açık yazı. Hepsi 4.5:1 üstü.
CATALOG = [
    {"id": "theme-space", "type": "theme", "slot": "theme", "name_tr": "Uzay", "name_en": "Space", "price": 30, "preview": {"cell": "#1b2436", "ink": "#f4efe6", "line": "#8ea0c0", "room": "#121826"}},
    {"id": "theme-forest", "type": "theme", "slot": "theme", "name_tr": "Orman", "name_en": "Forest", "price": 30, "preview": {"cell": "#e7f3e4", "ink": "#14241a", "line": "#3d6b4f", "room": "#d5ead0"}},
    {"id": "theme-sea", "type": "theme", "slot": "theme", "name_tr": "Deniz", "name_en": "Sea", "price": 30, "preview": {"cell": "#e4f2f8", "ink": "#0c2433", "line": "#2f6f8f", "room": "#d3e8f2"}},
    {"id": "theme-candy", "type": "theme", "slot": "theme", "name_tr": "Kutup Işıkları", "name_en": "Northern Lights", "price": 40, "preview": {"cell": "#10241f", "ink": "#e7fff4", "line": "#7dcea0", "room": "#0c1c18"}},
    {"id": "theme-night", "type": "theme", "slot": "theme", "name_tr": "Gece", "name_en": "Night", "price": 40, "preview": {"cell": "#16141c", "ink": "#f6f1e8", "line": "#a89880", "room": "#0e0c12"}},
    {"id": "bg-dawn", "type": "background", "slot": "background", "name_tr": "Şafak", "name_en": "Dawn", "price": 20, "preview": {"cell": "#fff7ed", "ink": "#3b1d0a", "line": "#c2410c", "room": "#fde7d2"}},
    {"id": "bg-meadow", "type": "background", "slot": "background", "name_tr": "Çayır", "name_en": "Meadow", "price": 20, "preview": {"cell": "#f7fee7", "ink": "#14240c", "line": "#3f6212", "room": "#e5f6d8"}},
    {"id": "bg-ink", "type": "background", "slot": "background", "name_tr": "Mürekkep", "name_en": "Ink", "price": 20, "preview": {"cell": "#14161f", "ink": "#f4efe6", "line": "#a78bfa", "room": "#1a1c28"}},
    {"id": "hat-red", "type": "accessory", "slot": "hat", "name_tr": "Kırmızı şapka", "name_en": "Red hat", "price": 15, "preview": {"color": "#dc2626"}},
    {"id": "hat-wizard", "type": "accessory", "slot": "hat", "name_tr": "Büyücü şapkası", "name_en": "Wizard hat", "price": 25, "preview": {"color": "#4c1d95"}},
    {"id": "glasses-round", "type": "accessory", "slot": "glasses", "name_tr": "Yuvarlak gözlük", "name_en": "Round glasses", "price": 15, "preview": {"color": "#1e293b"}},
    {"id": "glasses-sun", "type": "accessory", "slot": "glasses", "name_tr": "Güneş gözlüğü", "name_en": "Sunglasses", "price": 20, "preview": {"color": "#0f172a"}},
    {"id": "scarf-red", "type": "accessory", "slot": "scarf", "name_tr": "Kırmızı atkı", "name_en": "Red scarf", "price": 15, "preview": {"color": "#b91c1c"}},
    {"id": "scarf-stripe", "type": "accessory", "slot": "scarf", "name_tr": "Çizgili atkı", "name_en": "Striped scarf", "price": 20, "preview": {"color": "#0369a1"}},
    {"id": "cape-red", "type": "accessory", "slot": "cape", "name_tr": "Kırmızı pelerin", "name_en": "Red cape", "price": 25, "preview": {"color": "#991b1b"}},
    {"id": "cape-blue", "type": "accessory", "slot": "cape", "name_tr": "Mavi pelerin", "name_en": "Blue cape", "price": 25, "preview": {"color": "#1d4ed8"}},
    {"id": "crown-gold", "type": "accessory", "slot": "crown", "name_tr": "Altın taç", "name_en": "Gold crown", "price": 50, "preview": {"color": "#ca8a04"}},
    {"id": "crown-silver", "type": "accessory", "slot": "crown", "name_tr": "Gümüş taç", "name_en": "Silver crown", "price": 40, "preview": {"color": "#94a3b8"}},
]

_BY_ID = {item["id"]: item for item in CATALOG}


def item_by_id(item_id):
    return _BY_ID.get(item_id)


def public_item(item):
    return {
        "id": item["id"],
        "type": item["type"],
        "slot": item["slot"],
        "name_tr": item["name_tr"],
        "name_en": item["name_en"],
        "price": item["price"],
        "preview": item["preview"],
    }


def owned_rows(user_id):
    return UserItem.query.filter_by(user_id=user_id).all()


def purchase(user, item_id):
    item = item_by_id(item_id)
    if item is None:
        raise ShopError("Ürün bulunamadı", 404)
    if UserItem.query.filter_by(user_id=user.id, item_id=item_id).first():
        raise ShopError("Bu ürün zaten alınmış", 409)
    if int(user.star_balance or 0) < item["price"]:
        raise ShopError("Yıldız bakiyesi yetmiyor", 402)
    user.star_balance = int(user.star_balance or 0) - item["price"]
    db.session.add(StarLedger(
        user_id=user.id,
        amount=-item["price"],
        reason="purchase",
        attempt_id=None,
    ))
    row = UserItem(user_id=user.id, item_id=item_id, equipped=True)
    for other in UserItem.query.filter_by(user_id=user.id, equipped=True).all():
        other_item = item_by_id(other.item_id)
        if other_item and other_item["slot"] == item["slot"]:
            other.equipped = False
    db.session.add(row)
    db.session.flush()
    return row


def equip(user, item_id):
    row = UserItem.query.filter_by(user_id=user.id, item_id=item_id).first()
    if row is None:
        raise ShopError("Bu ürün sende yok", 404)
    item = item_by_id(item_id)
    if row.equipped:
        row.equipped = False
        return row
    for other in UserItem.query.filter_by(user_id=user.id, equipped=True).all():
        other_item = item_by_id(other.item_id)
        if other_item and item and other_item["slot"] == item["slot"]:
            other.equipped = False
    row.equipped = True
    return row
