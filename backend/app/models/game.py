from app.extensions import db

# 19 akıl oyunu. `slug` frontend registry ile eşleşir ve skorların anahtarıdır;
# görünen adlar marka adlarından kaçınır, mekaniği tarif eder.
GAME_CATALOG = [
    {"slug": "kakuro", "name_tr": "Çapraz Toplam", "name_en": "Cross Sums", "min_grade_level": 4},
    {"slug": "sudoku", "name_tr": "Rakam Yerleştirme", "name_en": "Number Place", "min_grade_level": 3},
    {"slug": "bolgesel-sudoku", "name_tr": "Bölgeli Rakam", "name_en": "Region Digits", "min_grade_level": 4},
    {"slug": "apartman", "name_tr": "Apartman", "name_en": "Building Heights", "min_grade_level": 3},
    {"slug": "cit", "name_tr": "Çit", "name_en": "Fence Loop", "min_grade_level": 4},
    {"slug": "amiral-batti", "name_tr": "Gizli Gemiler", "name_en": "Hidden Ships", "min_grade_level": 3},
    {"slug": "sihirli-piramit", "name_tr": "Sihirli Piramit", "name_en": "Number Path", "min_grade_level": 2},
    {"slug": "patika", "name_tr": "Patika", "name_en": "Number Trail", "min_grade_level": 2},
    {"slug": "abc-baglama", "name_tr": "Harf Bağlama", "name_en": "Letter Links", "min_grade_level": 2},
    {"slug": "islem-karesi", "name_tr": "İşlem Karesi", "name_en": "Operation Grid", "min_grade_level": 4},
    {"slug": "kendoku", "name_tr": "İşlem Kafesi", "name_en": "Operation Cages", "min_grade_level": 4},
    {"slug": "yildiz-savaslari", "name_tr": "Yıldız Yerleşimi", "name_en": "Star Places", "min_grade_level": 3},
    {"slug": "kare-karalamaca", "name_tr": "Kare Karalamaca", "name_en": "Square Shading", "min_grade_level": 3},
    {"slug": "carpmaca", "name_tr": "Çarpmaca", "name_en": "Multiplication Grid", "min_grade_level": 2},
    {"slug": "futoshiki", "name_tr": "Büyük Küçük", "name_en": "Greater or Less", "min_grade_level": 3},
    {"slug": "pentominolar", "name_tr": "Beşli Parça", "name_en": "Five Squares", "min_grade_level": 3},
    {"slug": "metaforms", "name_tr": "Mini Mantık", "name_en": "Mini Logic", "min_grade_level": 2},
    {"slug": "numbers", "name_tr": "Yıldızlı Sayılar", "name_en": "Starred Numbers", "min_grade_level": 2},
    {"slug": "colours", "name_tr": "Renkli Şekiller", "name_en": "Colored Shapes", "min_grade_level": 2},
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
