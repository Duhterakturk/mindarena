# MindArena

2. sınıftan itibaren akıl oyunlarıyla TaZOf sınavına hazırlık platformu. Bu depo,
[docs/PROJECT_SPEC.md](docs/PROJECT_SPEC.md) içindeki teknik gereksinimlerin ilk
çalışan iskeletini içerir.

## Klasör Yapısı

```
mindarena/
  backend/    Flask REST API (JWT auth, PostgreSQL)
  frontend/   React + Vite + Tailwind SPA
  docs/       Proje dokümantasyonu
  docker-compose.yml   Yerel PostgreSQL
```

## Gereksinimler (bu makinede kurulu durum)

- Python 3.14 — kurulu
- Node.js 24 LTS + npm — winget ile kuruldu (`OpenJS.NodeJS.LTS`)
- PostgreSQL 16 — winget ile kuruldu (`PostgreSQL.PostgreSQL.16`), ancak Windows
  servisi olarak değil; veri dizini `C:\Users\ADM\mindarena-pgdata` altında ve
  sunucu elle başlatılıyor (aşağıya bakın). `docker-compose.yml` de alternatif
  olarak duruyor, Docker kurulursa `docker compose up -d` ile kullanılabilir.

## PostgreSQL'i Başlatma / Durdurma

Sunucuyu başlat:

```bash
"C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" -D "C:\Users\ADM\mindarena-pgdata" -l "C:\Users\ADM\mindarena-pgdata\logfile.txt" start
```

Durdur:

```bash
"C:\Program Files\PostgreSQL\16\bin\pg_ctl.exe" -D "C:\Users\ADM\mindarena-pgdata" stop
```

`mindarena` rolü ve veritabanı zaten oluşturuldu (kullanıcı: `mindarena`, şifre:
`mindarena`, superuser `postgres` şifresi: `postgres` — yalnızca yerel geliştirme
içindir, üretimde değiştirin).

## Backend Kurulumu

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

> Not: `psycopg2-binary` yerine `psycopg[binary]` (psycopg3) kullanılıyor çünkü
> Python 3.14 için psycopg2 önceden derlenmiş paketi henüz yok. Bağlantı
> dizesi şeması buna göre `postgresql+psycopg://...`.

Veritabanı tablolarını oluştur ve oyun kataloğunu yükle (PostgreSQL çalışırken):

```bash
flask db upgrade
python seed.py
```

(Migration dosyaları zaten `migrations/versions/` altında mevcut; şema
değişikliği yapıldığında `flask db migrate -m "..."` ile yeni migration
üretilir.)

Sunucuyu başlat:

```bash
python run.py
```

API `http://localhost:5000/api` altında çalışır. Sağlık kontrolü: `GET /api/health`.

## Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

Uygulama `http://localhost:5173` adresinde açılır ve `/api` istekleri Vite proxy
üzerinden backend'e (`http://localhost:5000`) yönlendirilir.

## Doğrulanan Akış

Uçtan uca doğrulanan akışlar: kayıt ol → giriş yap → oyun listesini gör → bir
oyunu çöz → skoru kaydet → rozet kazan (uygunsa) → skor/rozet
PostgreSQL'de görünür; veli hesabı bir öğrenciyi e-postayla bağlar ve
ilerlemesini görür; öğretmen hesabı tüm öğrencilerin özetini görür; ilerleme
Excel olarak indirilebilir. **19 oyun modülünün tamamı** tarayıcıda tek tek
doğrulandı (render + rastgele üretim + çözüm kontrolü + skor kaydı).
`npm run build`, backend `pytest` (29 test) ve frontend `vitest` (13 test)
hatasız tamamlanıyor.

## Testleri Çalıştırma

```bash
# Backend (venv aktifken, backend/ dizininde)
pip install -r requirements-dev.txt
pytest

# Frontend (frontend/ dizininde)
npm test
```

Backend testleri SQLite in-memory veritabanı kullanır (PostgreSQL'e gerek
yoktur) ve rate limiting testlerde otomatik devre dışıdır
(`TestingConfig.RATELIMIT_ENABLED = False`). Frontend testleri, bulmaca
üretici fonksiyonlarının (Latin kare, Sudoku, Kakuro, Amiral Battı, Yıldız
Savaşları, Pentominolar) yüzlerce rastgele denemede geçerlilik/bağlantılılık
kısıtlarını koruduğunu doğrular.

## Mimari Notlar

- **Kullanıcı rolleri:** `student`, `parent`, `teacher` — `backend/app/models/user.py`
- **Oyun kataloğu:** 19 modül `backend/app/models/game.py` içindeki `GAME_CATALOG`'da
  tanımlı; `python seed.py` ile veritabanına yüklenir.
- **Modüler oyun motoru (frontend):** Her oyun `frontend/src/games/<slug>/` altında
  kendi klasöründe yaşar ve `frontend/src/games/registry.js` üzerinden lazy-load
  edilir. **19 oyunun tamamı** uçtan uca (playable + skor kaydı) implemente edildi:
  - Grid doldurma (`games/common/GridFillGame.jsx` paylaşılan bileşeni): Bölgesel
    Sudoku, İşlem Karesi, Kendoku, Futoshiki. Sudoku, Kakuro, Apartman ve Çarpmaca
    kendi bileşenlerinde benzer bir düzen kullanır (kenar ipucu satırları/sütunları
    gerektirdiğinden).
  - Hücre işaretleme (`games/common/ToggleGridGame.jsx` paylaşılan bileşeni):
    Amiral Battı, Yıldız Savaşları, Patika, ABC Bağlama, Pentominolar, Kare
    Karalamaca.
  - Özel mekanikler: Çit (kenar tabanlı slitherlink), Sihirli Piramit (toplama
    piramidi), Numbers (sıralı tıklama), Colours (Stroop testi), Metaforms
    (farklı olanı bulma).
- **Bulmaca üretici (`games/common/latinSquare.js`):** 8 oyun (Sudoku, Kakuro,
  Bölgesel Sudoku, Apartman, Futoshiki, İşlem Karesi, Kendoku, Çarpmaca) artık
  her oynanışta gerçek zamanlı rastgele üretilen, geçerliliği doğrulanmış bir
  çözümden türetiliyor:
  - `generateSudokuSolution()` — band/stack karıştırma + rakam yeniden
    etiketleme ile geçerli bir 9x9 Sudoku çözümü (Kolay/Orta/Zor zorluk
    seviyeleri, "Yeni Bulmaca" butonu).
  - `generateLatinSquare(n)` — satır/sütun permütasyonu + yeniden etiketlemeyle
    n×n Latin kare (Apartman, Futoshiki, İşlem Karesi, Kendoku bu çözümden
    kenar ipuçlarını/kafes hedeflerini dinamik hesaplar).
  - `relabelGrid(base, n)` — yalnızca rakam yeniden etiketleme (Bölgesel
    Sudoku'nun düzensiz bölgeleri sabit kaldığından satır/sütun permütasyonu
    güvenli değildir; bölge geçerliliğini koruyan tek dönüşüm budur).
  - Kakuro, kasıtlı olarak `generateLatinSquare` KULLANMAZ: 1-4 aralığında bir
    Latin kare her satır/sütunu her zaman 10'a topladığından ipuçları bilgi
    vermez hale gelirdi. Bunun yerine `kakuro/puzzles.js` içindeki
    `generateKakuroSolution()` ret örneklemesiyle (rejection sampling) 1-9
    aralığından ayrık satır/sütun değerleri üretir.
  - Kalan 11 oyun da (Amiral Battı, Yıldız Savaşları, Çit, Patika, ABC Bağlama,
    Pentominolar, Kare Karalamaca, Sihirli Piramit, Metaforms, Numbers,
    Colours) artık her oynanışta gerçek zamanlı üretiliyor — her biri kendi
    `puzzles.js`/`rounds.js` dosyasında, gerçek bir "constraint solver" yerine
    **geçerliliği yapısal olarak garanti eden** üretim teknikleri kullanır:
    - Amiral Battı: retry-tabanlı rastgele gemi yerleştirme (çakışma/komşuluk
      kontrolüyle, ret örneklemesi).
    - Yıldız Savaşları: rastgele permütasyon + bitişiklik reddi (ret
      örneklemesi).
    - Çit: rastgele bir dikdörtgen alt-bölge seçilip sınırı döngü olarak
      kullanılır (bir dikdörtgenin sınırı her zaman geçerli basit bir
      döngüdür).
    - Patika / ABC Bağlama: rastgele öz-kaçınan yürüyüş (self-avoiding random
      walk, backtracking ile).
    - Pentominolar: 12 standart pentominodan rastgele seçim + rastgele
      döndürme/yansıtma.
    - Kare Karalamaca: rastgele hücre deseni + koşu uzunluğu (run-length)
      ipucu hesaplama (`ToggleGridGame` artık çok parçalı nonogram ipuçlarını
      da destekliyor).
    - Sihirli Piramit / Numbers / Colours / Metaforms: doğrudan rastgele
      değer/permütasyon üretimi (kısıt gerektirmeyen oyunlar).
  - Tüm üretici mantığı, Node üzerinde çalıştırılan tek seferlik doğrulama
    betikleriyle yüzlerce-binlerce rastgele denemeyle test edildi (satır/
    sütun/kutu/bölge/kafes/gemi-komşuluğu/yıldız-bitişikliği/pentomino
    bağlantılılığı geçerliliği) ve ardından her 19 oyun tarayıcıda React
    fiber'ından gerçek zamanlı çözüm çıkarılıp otomatik doldurularak uçtan
    uca doğrulandı.
- **Çoklu dil:** `react-i18next`, `frontend/src/i18n/locales/{tr,en}.json`.
- **Kimlik doğrulama:** JWT access/refresh token, `localStorage`'da saklanır,
  `frontend/src/context/AuthContext.jsx` üzerinden yönetilir.
- **Rozet/başarı sistemi:** `backend/app/models/badge.py` (`Badge`, `UserBadge`,
  7 rozetlik `BADGE_CATALOG`) + `backend/app/services/badges.py`
  (`check_and_award_badges`). Her `POST /api/scores` çağrısından sonra otomatik
  değerlendirilir; yeni kazanılan rozetler yanıtta (`new_badges`) döner.
  Kriter tipleri: toplam tamamlanan oyun, farklı oyun türü sayısı, tekil skor
  eşiği, en hızlı tamamlama süresi. Frontend'de `Dashboard` sayfasındaki
  `BadgeGrid` bileşeni kazanılan/kilitli rozetleri gösterir
  (`GET /api/badges`, `GET /api/badges/me`).
- **İlerleme raporları:** `GET /api/progress/me` (özet istatistik + oyun bazlı
  en iyi skor + son 20 skorluk zaman çizelgesi), `GET /api/progress/export`
  (openpyxl ile üretilen `.xlsx` indirme). Frontend'de `ProgressSummary`
  bileşeni (stat kartları + hafif bir SVG/CSS bar grafiği, harici grafik
  kütüphanesi kullanılmadı) `Dashboard`, `ParentPanel` ve gerektiğinde başka
  sayfalarda yeniden kullanılabilir.
- **Öğretmen/veli panelleri:**
  - Veli: `POST /api/users/children/link` ile e-posta üzerinden mevcut bir
    öğrenci hesabını kendine bağlar (`User.parent_id`); `GET
    /api/users/children` ve `GET /api/progress/child/<id>` (sahiplik
    doğrulamalı) ile çocuğun ilerlemesini görür. Frontend: `pages/ParentPanel.jsx`.
  - Öğretmen: `GET /api/progress/students` tüm öğrencilerin özet istatistiğini
    döner. Frontend: `pages/TeacherPanel.jsx` (puana göre sıralı tablo).
  - Rol bazlı erişim hem backend'de (403 kontrolü) hem frontend'de
    (`ProtectedRoute`'un `role` prop'u) uygulanır; her ikisi de test edildi
    (öğrenci hesabıyla `/teacher`'a erişim → "Bu sayfaya erişim yetkiniz yok").

## Üretim Dağıtımı

```bash
cd backend
pip install -r requirements.txt
# .env içinde SECRET_KEY ve JWT_SECRET_KEY güçlü rastgele değerlerle
# ayarlanmalı, aksi halde uygulama başlamayı reddeder:
python -c "import secrets; print(secrets.token_hex(32))"
FLASK_ENV=production gunicorn -w 4 -b 0.0.0.0:5000 wsgi:app
```

Frontend için `npm run build` ile `frontend/dist/` altında statik dosyalar
üretilir; bunlar herhangi bir statik dosya sunucusu (nginx, Caddy, vb.)
arkasından, backend'e `/api` proxy'siyle birlikte servis edilmelidir.

## Güvenlik Sertleştirmesi ve Bilinen Sınırlamalar

Bu geçişte yapılanlar:
- Parola için minimum 8 karakter zorunluluğu ve e-posta format doğrulaması
  (`backend/app/routes/auth.py`).
- `/api/auth/login` ve `/api/auth/register` için Flask-Limiter ile
  brute-force koruması (dakikada 10 istek).
- Üretim modunda zayıf varsayılan `SECRET_KEY`/`JWT_SECRET_KEY` ile
  başlatmayı engelleyen bir koruma (`app/__init__.py`); `.env`'de boş
  bırakılan değişkenlerin sessizce zayıf varsayılana düşmesi de ayrıca ele
  alındı (`os.environ.get(x) or default`, `.get(x, default)` değil).
- Tüm SQL erişimi SQLAlchemy ORM üzerinden (parametreli sorgular) — SQL
  injection yüzeyi yok. React varsayılan olarak JSX çıktısını kaçışlar
  (escape) ve `dangerouslySetInnerHTML` hiçbir yerde kullanılmıyor — XSS
  yüzeyi yok. Şifreler `werkzeug.security` ile hash'leniyor.
- `LegacyAPIWarning` üreten tüm `Model.query.get(...)` çağrıları
  `db.session.get(Model, id)`'ye taşındı (SQLAlchemy 2.0 uyumluluğu).

Bilinen sınırlamalar (bir sonraki geçiş için):
- **Öğretmen paneli sınıf/okul ile sınırlı değil**: herhangi bir `teacher`
  hesabı platformdaki *tüm* öğrencileri görebilir (Classroom/enrollment
  modeli yok). Gerçek bir okul dağıtımı için önce sınıf ataması eklenmeli.
- **npm audit**: `esbuild` (yalnızca `npm run dev` sırasında, üretim
  build'ini etkilemiyor) ve `react-router-dom` (v6→v7 majör sürüm gerektiren
  bir açık yönlendirme CVE'si) için düzeltmeler mevcut ama bu geçişte
  uygulanmadı — v7'ye geçiş, kapsamlı regresyon testi gerektirecek riskli bir
  majör sürüm atlaması olduğundan bilinçli olarak ertelendi.
- **Rate limiting depolama**: Flask-Limiter varsayılan bellek-içi (in-memory)
  depolamayı kullanıyor; bu tek işlemli (`gunicorn -w 1`) dağıtımlar için
  yeterlidir ama çok worker'lı üretimde paylaşılan durum için Redis gibi bir
  backend gerekir.
- **E-posta doğrulama veya şifre sıfırlama akışı yok.**
- **9 oyun için üretici hâlâ kısıt-doğrulama yapmıyor gibi görünse de**
  (Amiral Battı, Yıldız Savaşları, Çit, Patika, ABC Bağlama, Pentominolar,
  Kare Karalamaca, Sihirli Piramit, Numbers/Colours/Metaforms) — bunlar
  yapısal olarak her zaman geçerli tek bir örnek üretir (bkz. yukarıdaki
  "Bulmaca üretici" notları); gerçek bir "birden fazla geçerli çözüm garantisi
  + tekillik" çözücüsü değildir.
- CI/CD boru hattı (GitHub Actions vb.) henüz kurulmadı.

## Sırada Ne Var

1. Sınıf/okul modeli ekleyip öğretmen panelini buna göre kısıtlamak.
2. `react-router-dom` v7'ye kontrollü bir geçiş (regresyon testleriyle).
3. Rol panellerine gerçek zamanlı bildirim (yeni rozet kazanıldığında
   oyun içi toast) ve daha zengin raporlama (PDF export, tarih aralığı
   filtreleme).
4. CI/CD boru hattı (her push'ta `pytest` + `vitest` + `npm run build`).
