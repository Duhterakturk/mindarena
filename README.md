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
`npm run build`, backend `pytest` (39 test) ve frontend `vitest` (13 test)
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
  - Kakuro, kasıtlı olarak `generateLatinSquare` KULLANMAZ (küçük sabit
    aralıklı bir Latin kare ipuçlarını bilgisiz hale getirirdi). Bunun yerine
    `kakuro/puzzles.js` içindeki `generateKakuroSolution(n)`, tam bir 9×9
    Latin kareden (`generateLatinSquare(9)`) rastgele `n` satır/sütunluk bir
    alt küme alır — zaten satır/sütun içi ayrık olan bir kareden alt küme
    almak matematiksel olarak ayrıklığı korur, bu yüzden n büyüdükçe (zorluk
    arttıkça) ret örneklemesinin (rejection sampling) yaşadığı yüksek
    başarısızlık oranı sorunu ortadan kalkar (n=6'da ret örneklemesiyle %85,
    n=8'de %100 başarısızlık gözlemlenmişti; alt küme yaklaşımıyla n=4/6/8/9
    için 0 başarısızlık).
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
  - Öğretmen: `POST /api/classrooms` ile sınıf oluşturur (katılım kodu döner),
    `GET /api/progress/students` **yalnızca kendi sınıflarındaki**
    öğrencilerin özet istatistiğini döner (bkz. aşağıdaki "Sınıf Modeli"
    notu). Frontend: `pages/TeacherPanel.jsx` (sınıf seçici + puana göre
    sıralı tablo).
  - Rol bazlı erişim hem backend'de (403 kontrolü) hem frontend'de
    (`ProtectedRoute`'un `role` prop'u) uygulanır; her ikisi de test edildi
    (öğrenci hesabıyla `/teacher`'a erişim → "Bu sayfaya erişim yetkiniz yok").

## Zorluk Kademesi ve Kilit Sistemi

**19 oyunun tamamı** artık Kolay/Orta/Zor olmak üzere 3 zorluk kademesine
sahip; her kademe, aynı prosedürel üreticinin farklı parametrelerle (ızgara
boyutu, verilen ipucu sayısı, tur/şekil sayısı vb.) çağrılmasıyla elde edilir
— sabit bir soru bankası yerine **sonsuz, kendi kendini yenileyen** bir
üretim modeli kullanılır.

- **Kilit mekaniği** (`backend/app/services/difficulty.py`,
  `compute_unlocked_difficulties`): bir sonraki kademe, mevcut kademede en az
  `UNLOCK_THRESHOLD` (5) tamamlanmış (`Score.completed = True`) bulmaca
  gerektirir. Yeni bir veritabanı tablosu eklenmedi — ilerleme, mevcut
  `Score` tablosundan anlık hesaplanır. Uç nokta: `GET
  /api/progress/unlocked/<game_slug>`.
- **Frontend:** `components/games/DifficultyPicker.jsx` paylaşılan bileşeni
  (kilit ikonu + ilerleme tooltip'i ile) tüm 19 oyunda kullanılır
  (`frontend/src/api/difficulty.js`).
- **Izgara boyutu değişimi ve render güvenliği:** Zorluk değişince bazı
  oyunlarda ızgara boyutu da değişir (ör. Kakuro Kolay 4×4 → Zor 8×8). Bu,
  React'te ciddi bir tuzağa yol açar: `puzzle`/`game` state'i değiştiğinde
  `board` (veya `hEdges`/`vEdges`) state'ini yalnızca bir `useEffect` ile
  sıfırlamak yetmez — efekt, commit SONRASI çalıştığından, React önce YENİ
  (büyük) `puzzle` ile ESKİ (küçük) `board`'u birlikte render eder ve
  `board[r][c]` erişimi `undefined` döndürüp uygulamayı çökertir. React'in
  "state'i render sırasında ayarla" deseniyle (`if (puzzle !==
  renderedPuzzle) { setRenderedPuzzle(puzzle); setBoard(...); }`) bu
  SONRAKİ render'ı düzeltir, ama MEVCUT render'ın JSX'i hâlâ eski `board`'u
  kullanmaya çalışıp yine çöker. Kalıcı çözüm: bu render'da kullanılacak
  güvenli değeri ayrı bir yerel değişkende (`displayBoard`) tutup hem JSX'te
  hem olay işleyicilerinde (`handleCellChange`, `checkSolution`) `board`
  yerine onu kullanmak — bkz. `games/kakuro/Kakuro.jsx`,
  `games/common/GridFillGame.jsx`, `games/carpmaca/Carpmaca.jsx`,
  `games/sihirli-piramit/SihirliPiramit.jsx`, `games/cit/Cit.jsx`. Bu hata
  yalnızca canlı tarayıcı testinde (Node seviyesi üretici testleri React'in
  render döngüsünü tetiklemediğinden) yakalandı ve düzeltmeler tüm zorluk
  geçişleri (büyüyen ve küçülen yönde) tarayıcıda doğrulandı.

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
- **npm audit**: `esbuild`'in geliştirme sunucusuna özgü bir açığı kalıyor
  (`npm run dev` sırasında, üretim build'ini etkilemiyor); düzeltmesi Vite 8'e
  majör bir geçiş gerektiriyor. `react-router-dom` CVE'si v7.18.2'ye
  yükseltilerek zaten çözüldü (bkz. aşağıdaki not).
- PDF export yok, yalnızca Excel (`.xlsx`); PDF için ek bir kütüphane
  (ör. `reportlab` veya HTML→PDF) gerekir.

## Sınıf Modeli ve İkinci Sertleştirme Geçişi

İlk teslimattan sonra kullanıcının "eksiksiz devam et" talebiyle şu ek işler
tamamlandı:

- **Sınıf (Classroom) modeli** (`backend/app/models/classroom.py`):
  öğretmenler `POST /api/classrooms` ile bir sınıf ve rastgele 6 haneli bir
  katılım kodu oluşturur; öğrenciler `POST /api/classrooms/join` ile bu kodla
  katılır. `GET /api/progress/students` artık **yalnızca o öğretmenin
  sınıflarındaki öğrencileri** döner — önceki geçişte tüm `teacher`
  hesaplarının platformdaki her öğrenciyi görebilmesi gerçek bir gizlilik
  açığıydı, bu geçişte kapatıldı. `TeacherPanel.jsx` sınıf oluşturma/seçme
  arayüzü kazandı, `Dashboard.jsx`'e öğrenciler için "Sınıfa Katıl" bileşeni
  eklendi (`ClassroomJoin.jsx`).
  - Geliştirme sırasında `Classroom.students` ilişkisinde SQLAlchemy
    `AmbiguousForeignKeysError` hatası bulundu ve düzeltildi (`users` ve
    `classrooms` tabloları arasında iki farklı FK olduğundan
    `foreign_keys="User.classroom_id"` açıkça belirtilmesi gerekiyordu) — bu
    hata yeni yazılan `test_classrooms.py` testleri sayesinde hemen
    yakalandı.
  - Artık kullanılmayan/gizlilik açısından tutarsız hale gelen
    `GET /api/users/students` (sınıf kısıtlaması olmadan tüm öğrencileri
    listeleyen eski uç nokta) tamamen kaldırıldı.
- **`react-router-dom` v6 → v7.18.2 yükseltmesi**: CVE GHSA-wrjc-x8rr-h8h6
  (açık yönlendirme) çözüldü. Yükseltme öncesi kod tabanındaki kullanım
  taranıp yalnızca `BrowserRouter`/`Routes`/`Route`/`Link`/`Navigate`/
  `useNavigate`/`useParams` (v7'de değişmeyen "declarative mode" API'leri)
  kullanıldığı doğrulandı; ardından temiz bir git klonunda `pytest` +
  `vitest` + `npm run build` ve tarayıcıda tüm rotaların (ana sayfa, oyun
  listesi/detayı, giriş/kayıt, korumalı yönlendirme, çıkış) manuel regresyon
  testi yapıldı.
- **CI/CD**: `.github/workflows/ci.yml` her push/PR'da backend `pytest`'i ve
  frontend `vitest` + `npm run build`'i çalıştırır. Bu depo `git init` ile
  yerel olarak sürüm kontrolüne alındı ve ilk commit yapıldı; workflow'un
  fiilen GitHub Actions üzerinde çalışması için depo bir GitHub uzak
  sunucusuna push edilmelidir (bu geçişte push YAPILMADI — kullanıcı onayı
  gerektirir).
- **Rozet toast bildirimi**: `api/games.js`'deki `submitScore()`, backend'in
  döndürdüğü `new_badges` doluysa bir `window` `CustomEvent`
  (`mindarena:badges-earned`) yayınlar; `App.jsx`'e tek sefer mount edilen
  `BadgeToastHost.jsx` bunu dinleyip sağ altta 5 saniyelik bir toast
  gösterir. Bu tasarım sayesinde **19 oyun bileşeninin hiçbiri
  değiştirilmeden** rozet bildirimi eklendi — tarayıcıda Numbers oyunuyla
  uçtan uca doğrulandı (üç rozet aynı anda tetiklendi ve gösterildi).
- **İlerleme raporunda tarih aralığı filtreleme**: `GET /api/progress/me` ve
  `GET /api/progress/export`, `start_date`/`end_date` (YYYY-MM-DD) query
  parametrelerini kabul eder. `ProgressSummary.jsx`'e başlangıç/bitiş tarih
  seçiciler eklendi.
  - Bunu geliştirirken tarayıcıda gerçek bir **yarış durumu (race condition)**
    bulundu: art arda hızlı tarih değişikliklerinde eski bir isteğin geç
    gelen yanıtı, daha yeni bir isteğin sonucunun üzerine yazabiliyordu.
    `useEffect`'e bir `cancelled` bayrağıyla temizleme (cleanup) fonksiyonu
    eklenerek düzeltildi ve tekrar tarayıcıda doğrulandı.
- Tüm bu değişiklikler sonrası **39 backend testi** (29 → 37 → 39, sınıf ve
  tarih aralığı testleri eklendi) ve **13 frontend testi** hâlâ hatasız
  geçiyor.

## Sırada Ne Var

1. Bu depoyu bir GitHub uzak sunucusuna push edip CI/CD workflow'unun
   fiilen çalıştığını doğrulamak (kullanıcı onayı gerektirir).
2. `esbuild`/Vite 8 yükseltmesi (yalnızca dev sunucusu açığı, düşük öncelik).
3. E-posta doğrulama ve şifre sıfırlama akışı.
4. PDF export (şu an yalnızca Excel).
