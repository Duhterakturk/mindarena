import os
from datetime import timedelta


def _normalize_database_url(url):
    """Render/Heroku tarzı sağlayıcılar `postgres://` şemasıyla bağlantı
    dizesi verir; SQLAlchemy 1.4+ bu şemayı kabul etmiyor ve `psycopg` (v3)
    sürücüsünü açıkça istiyor. İkisini de `postgresql+psycopg://` şemasına
    dönüştürür, zaten doğru şemayla gelen dizeleri değiştirmeden bırakır."""
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]
    if url.startswith("postgresql://") and "+psycopg" not in url.split("://", 1)[0]:
        url = "postgresql+psycopg://" + url[len("postgresql://"):]
    return url


class Config:
    # `or` kullanılır çünkü .env dosyasında boş bırakılan bir değişken
    # (SECRET_KEY=) os.environ'da boş string olarak ayarlanır — bu,
    # .get(key, default) ile varsayılanı tetiklemez, sessizce boş bir
    # gizli anahtar kullanılmasına yol açardı.
    SECRET_KEY = os.environ.get("SECRET_KEY") or "dev-secret-change-me"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY") or "dev-jwt-secret-change-me"
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)
    JWT_REFRESH_TOKEN_EXPIRES = timedelta(days=30)

    SQLALCHEMY_DATABASE_URI = _normalize_database_url(
        os.environ.get(
            "DATABASE_URL",
            "postgresql+psycopg://mindarena:mindarena@localhost:5432/mindarena",
        )
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    # Render'ın ücretsiz Postgres katmanı boşta kalan bağlantıları
    # kapatabiliyor; pool_pre_ping her kullanımdan önce bağlantıyı test
    # ederek "server closed the connection unexpectedly" hatalarını önler.
    SQLALCHEMY_ENGINE_OPTIONS = {"pool_pre_ping": True}

    CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",")


class DevelopmentConfig(Config):
    DEBUG = True


class ProductionConfig(Config):
    DEBUG = False


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = os.environ.get(
        "TEST_DATABASE_URL", "sqlite:///:memory:"
    )
    RATELIMIT_ENABLED = False


config_by_name = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": TestingConfig,
}
