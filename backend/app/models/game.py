from app.extensions import db

# Kayıtlı 18 akıl oyunu modülü. `slug` frontend'deki games/registry.js ile eşleşir.
GAME_CATALOG = [
    {"slug": "kakuro", "name_tr": "Kakuro", "name_en": "Kakuro"},
    {"slug": "sudoku", "name_tr": "Sudoku", "name_en": "Sudoku"},
    {"slug": "bolgesel-sudoku", "name_tr": "Bölgesel Sudoku", "name_en": "Jigsaw Sudoku"},
    {"slug": "apartman", "name_tr": "Apartman", "name_en": "Skyscrapers"},
    {"slug": "cit", "name_tr": "Çit", "name_en": "Slitherlink"},
    {"slug": "amiral-batti", "name_tr": "Amiral Battı", "name_en": "Battleships"},
    {"slug": "sihirli-piramit", "name_tr": "Sihirli Piramit", "name_en": "Magic Pyramid"},
    {"slug": "patika", "name_tr": "Patika", "name_en": "Pathfinder"},
    {"slug": "abc-baglama", "name_tr": "ABC Bağlama", "name_en": "ABC Connect"},
    {"slug": "islem-karesi", "name_tr": "İşlem Karesi", "name_en": "Calcudoku Grid"},
    {"slug": "kendoku", "name_tr": "Kendoku", "name_en": "Kendoku"},
    {"slug": "yildiz-savaslari", "name_tr": "Yıldız Savaşları", "name_en": "Star Battle"},
    {"slug": "kare-karalamaca", "name_tr": "Kare Karalamaca", "name_en": "Square Scribble"},
    {"slug": "carpmaca", "name_tr": "Çarpmaca", "name_en": "Multiplico"},
    {"slug": "futoshiki", "name_tr": "Futoshiki", "name_en": "Futoshiki"},
    {"slug": "pentominolar", "name_tr": "Pentominolar", "name_en": "Pentominoes"},
    {"slug": "metaforms", "name_tr": "Metaforms", "name_en": "Metaforms"},
    {"slug": "numbers", "name_tr": "Numbers", "name_en": "Numbers"},
    {"slug": "colours", "name_tr": "Colours", "name_en": "Colours"},
]


class Game(db.Model):
    __tablename__ = "games"

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(64), unique=True, nullable=False, index=True)
    name_tr = db.Column(db.String(128), nullable=False)
    name_en = db.Column(db.String(128), nullable=False)
    min_grade_level = db.Column(db.Integer, nullable=False, default=2)
    is_active = db.Column(db.Boolean, default=True)

    scores = db.relationship("Score", backref="game", lazy="dynamic")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "slug": self.slug,
            "name_tr": self.name_tr,
            "name_en": self.name_en,
            "min_grade_level": self.min_grade_level,
            "is_active": self.is_active,
        }
