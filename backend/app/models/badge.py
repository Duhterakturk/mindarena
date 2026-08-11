from datetime import datetime

from app.extensions import db

# Rozet kataloğu. `criteria_type` + `criteria_value`, check_and_award_badges()
# tarafından kullanıcının skor geçmişine karşı değerlendirilir.
BADGE_CATALOG = [
    {
        "slug": "ilk-adim",
        "name_tr": "İlk Adım",
        "name_en": "First Step",
        "description_tr": "İlk oyununu tamamla",
        "description_en": "Complete your first game",
        "icon": "🥇",
        "criteria_type": "total_completed",
        "criteria_value": 1,
    },
    {
        "slug": "bes-oyun",
        "name_tr": "5 Oyun Tamamlandı",
        "name_en": "5 Games Completed",
        "description_tr": "Toplam 5 oyun tamamla",
        "description_en": "Complete a total of 5 games",
        "icon": "🎮",
        "criteria_type": "total_completed",
        "criteria_value": 5,
    },
    {
        "slug": "yirmi-oyun",
        "name_tr": "20 Oyun Tamamlandı",
        "name_en": "20 Games Completed",
        "description_tr": "Toplam 20 oyun tamamla",
        "description_en": "Complete a total of 20 games",
        "icon": "🏆",
        "criteria_type": "total_completed",
        "criteria_value": 20,
    },
    {
        "slug": "cesitli-oyuncu",
        "name_tr": "Çeşitli Oyuncu",
        "name_en": "Versatile Player",
        "description_tr": "5 farklı oyun türünü tamamla",
        "description_en": "Complete 5 different game types",
        "icon": "🧩",
        "criteria_type": "distinct_games_completed",
        "criteria_value": 5,
    },
    {
        "slug": "tum-oyunlar",
        "name_tr": "Tüm Oyunlar",
        "name_en": "All Games",
        "description_tr": "Kataloğdaki her oyun türünden en az birini tamamla",
        "description_en": "Complete at least one of every game type in the catalog",
        "icon": "🌟",
        "criteria_type": "distinct_games_completed",
        "criteria_value": 19,
    },
    {
        "slug": "mukemmel-skor",
        "name_tr": "Mükemmel Skor",
        "name_en": "Perfect Score",
        "description_tr": "Tek bir oyunda 900 veya üzeri puan al",
        "description_en": "Score 900 or more points in a single game",
        "icon": "💯",
        "criteria_type": "single_score_at_least",
        "criteria_value": 900,
    },
    {
        "slug": "hiz-ustasi",
        "name_tr": "Hız Ustası",
        "name_en": "Speed Master",
        "description_tr": "Bir oyunu 30 saniyeden kısa sürede tamamla",
        "description_en": "Complete a game in under 30 seconds",
        "icon": "⚡",
        "criteria_type": "fastest_completion_under",
        "criteria_value": 30,
    },
]


class Badge(db.Model):
    __tablename__ = "badges"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name_tr = db.Column(db.String(128), nullable=False)
    name_en = db.Column(db.String(128), nullable=False)
    description_tr = db.Column(db.String(255), nullable=False)
    description_en = db.Column(db.String(255), nullable=False)
    icon = db.Column(db.String(16), nullable=False)
    criteria_type = db.Column(db.String(64), nullable=False)
    criteria_value = db.Column(db.Integer, nullable=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "name_tr": self.name_tr,
            "name_en": self.name_en,
            "description_tr": self.description_tr,
            "description_en": self.description_en,
            "icon": self.icon,
        }


class UserBadge(db.Model):
    __tablename__ = "user_badges"
    __table_args__ = (db.UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),)

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    badge_id = db.Column(db.Integer, db.ForeignKey("badges.id"), nullable=False, index=True)
    earned_at = db.Column(db.DateTime, default=datetime.utcnow)

    badge = db.relationship("Badge")

    def to_dict(self) -> dict:
        return {
            **self.badge.to_dict(),
            "earned_at": self.earned_at.isoformat() if self.earned_at else None,
        }
