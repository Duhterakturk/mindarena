from app.extensions import db

# 19 akıl oyunu. `slug` frontend registry ile eşleşir ve skorların anahtarıdır;
# görünen adlar marka adlarından kaçınır, mekaniği tarif eder.
GAME_CATALOG = [
    {"slug": "kakuro", "name_tr": "Çapraz Toplam", "name_en": "Cross Sums", "min_grade_level": 4},
    {"slug": "sudoku", "name_tr": "Rakam Karesi", "name_en": "Number Place", "min_grade_level": 3},
    {"slug": "bolgesel-sudoku", "name_tr": "Bölge Karesi", "name_en": "Region Grid", "min_grade_level": 4},
    {"slug": "apartman", "name_tr": "Apartman", "name_en": "Building Heights", "min_grade_level": 3},
    {"slug": "cit", "name_tr": "Çit", "name_en": "Fence Loop", "min_grade_level": 4},
    {"slug": "amiral-batti", "name_tr": "Gizli Filo", "name_en": "Fleet Clues", "min_grade_level": 3},
    {"slug": "sihirli-piramit", "name_tr": "Sihirli Piramit", "name_en": "Number Pyramid", "min_grade_level": 2},
    {"slug": "patika", "name_tr": "Patika", "name_en": "Number Trail", "min_grade_level": 2},
    {"slug": "abc-baglama", "name_tr": "Harf Yolu", "name_en": "Letter Paths", "min_grade_level": 2},
    {"slug": "islem-karesi", "name_tr": "İşlem Karesi", "name_en": "Sum-Product Grid", "min_grade_level": 4},
    {"slug": "kendoku", "name_tr": "Dört İşlem", "name_en": "Mixed Cages", "min_grade_level": 4},
    {"slug": "yildiz-savaslari", "name_tr": "Yıldız Dizilimi", "name_en": "Star Placement", "min_grade_level": 3},
    {"slug": "kare-karalamaca", "name_tr": "Kare Karalamaca", "name_en": "Shade Grid", "min_grade_level": 3},
    {"slug": "carpmaca", "name_tr": "Çarpmaca", "name_en": "Times Table", "min_grade_level": 2},
    {"slug": "futoshiki", "name_tr": "Büyük Küçük", "name_en": "Inequality Grid", "min_grade_level": 3},
    {"slug": "pentominolar", "name_tr": "Beşli Şekil", "name_en": "Five-Square", "min_grade_level": 3},
    {"slug": "metaforms", "name_tr": "Aykırı Şekil", "name_en": "Odd Shape", "min_grade_level": 2},
    {"slug": "numbers", "name_tr": "Sırayla Say", "name_en": "Count Up", "min_grade_level": 2},
    {"slug": "colours", "name_tr": "Yazı Rengi", "name_en": "Ink Color", "min_grade_level": 2},
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
