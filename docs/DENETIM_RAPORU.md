# MindArena denetim raporu

Tarih: 24 Eylül 2026. Kod değiştirilmedi. Katalogda 19 oyun var (`backend/app/models/game.py`, satır 3–24); “20 oyun” diye ayrı bir slug yok. Üretim ve puanlama bu 19 slug üzerinden yapıldı.

| Alan | Durum | Bulgu sayısı |
| --- | --- | --- |
| Frontend test | ❌ | 1 |
| Frontend build | ✅ | 0 |
| Backend test | ✅ | 0 |
| Bulmaca üretim süresi | ✅ | 0 |
| Çözümün sunucuda kabulü | ❌ | 3 |
| Güvenlik | ⚠️ | 3 |
| Hata yönetimi | ⚠️ | 2 |
| Veritabanı | ⚠️ | 2 |
| Çeviri | ⚠️ | 1 |
| Mobil / erişilebilirlik | ⚠️ | 3 |
| Ölü kod | ⚠️ | 1 |

## Komut özeti

### 1. Frontend `npm test` (vitest)

20 dosya, 51 test. 50 geçti, 1 kaldı. Süre 10,24 s (testlerin kendi süresi 31,58 s). `npm warn Unknown env config "devdir"` bir npm ortam uyarısı; test hatası değil.

Geçmeyen: `src/games/amiral-batti/puzzles.test.js` → `Amiral Battı fleet generator > places the expected number of ship cells with no two ships touching, for every difficulty`. Hata: `Tek çözüm Gizli Filo üretilemedi` (`puzzles.js:79`). Test her zorlukta 8 kez `generate()` çağırıyor (`puzzles.test.js:10`). Üretici 25 denemede tek çözümlü filo bulamazsa fırlatıyor (`puzzles.js:67`).

### 2. Frontend `npm run build`

Hata yok. Vite 188 modülü 5,32 s’de derledi. Aynı `devdir` npm uyarısı var; Vite uyarısı yok.

| Dosya | Boyut | gzip |
| --- | --- | --- |
| `dist/assets/index-BiZN5cwn.js` | 363,23 kB | 118,05 kB |
| `dist/assets/index-Be640Ncv.css` | 28,19 kB | 6,20 kB |
| `dist/index.html` | 1,49 kB | 0,63 kB |

En büyük oyun parçaları: Metaforms 10,36 kB, Pentominolar 7,15 kB, Colours 6,35 kB.

### 3. Backend `pytest`

79 geçti, 0 kaldı, 21,66 s. 520 uyarı var; özeti veritabanı bulgusunda.

### 4. Üretim (`npx vite-node scripts/open-puzzle.mjs`)

19 oyun × easy/medium/hard × 3 = 171 bulmaca. Hata: 0. 3000 ms ve üstü: 0. Düz `node` extension’sız import yüzünden açılmıyor; üretim yolu `vite-node`.

İlk `sudoku easy` 1394 ms; bu çağrı `vite-node` sürecinin açılışını da içeriyor. Sonrakiler çok daha kısa.

| Oyun | easy max ms | medium max ms | hard max ms |
| --- | ---: | ---: | ---: |
| sudoku | 1394 | 4 | 10 |
| kakuro | 3 | 10 | 372 |
| bolgesel-sudoku | 1 | 1 | 0 |
| apartman | 1 | 1 | 0 |
| cit | 16 | 37 | 576 |
| amiral-batti | 3 | 12 | 92 |
| sihirli-piramit | 1 | 1 | 1 |
| patika | 9 | 74 | 166 |
| abc-baglama | 1 | 1 | 1 |
| islem-karesi | 1 | 1 | 2 |
| kendoku | 2 | 2 | 18 |
| yildiz-savaslari | 1 | 1 | 3 |
| kare-karalamaca | 1 | 0 | 1 |
| carpmaca | 1 | 0 | 0 |
| futoshiki | 2 | 2 | 6 |
| pentominolar | 2 | 6 | 11 |
| metaforms | 114 | 85 | 297 |
| numbers | 17 | 35 | 217 |
| colours | 8 | 5 | 5 |

### 5. `accepts(slug, difficulty, proof, proof.solution)`

171 çözümün 155’i geçti, 16’sı kaldı.

| Oyun | Sonuç |
| --- | --- |
| kakuro easy/medium/hard (9/9) | `GradeError: Izgara boyutu uyuşmuyor` |
| kendoku medium ve hard (6/6) | `GradeError: Bulmaca çok belirsiz` |
| cit hard (1/3) | `GradeError: Bulmaca çok belirsiz` |
| diğerleri | geçti |

Kakuro’da oyunun gerçekten gönderdiği iç ızgara ayrıca denendi (`proof.solution` kenar çerçevesi atılarak). 8 geçti, 1 hard `Bulmaca çok belirsiz` dedi. Çit çözümü oyunun gönderdiği biçimde (`horizontal` / `vertical`). Ayrıntı aşağıdaki bulgularda.

## Bulgular

### [KRİTİK] İşlem Kafesi orta ve zor çözümü skor yazamıyor

- Dosya: `backend/app/services/grading.py:16` ve `:935`
- Sorun: Üretilen medium ve hard çözümler Latin ve kafes kurallarını geçiyor, sonra tekillik taraması 200.000 düğümde kesilip `Bulmaca çok belirsiz` fırlatıyor. Doğru tahta da skor olarak reddedilir. Üç medium ve üç hard örneğin hepsi böyle bitti. Boyutlar `CAGE_SIZE` içinde medium 5, hard 6 (`grading.py:227`).
- Nasıl doğrulandı: `open-puzzle` çıktısındaki `proof.solution`, `accepts("kendoku", ...)` ile çağrıldı.
- Önerilen çözüm: Tekillik sayımı kafesleri doldururken budamalı ve düğüm sınırına gelince “yanlış cevap” ile “sayılamadı”yı ayırmalı. Sayılamayan doğru çözümü reddetmemeli.

### [ÖNEMLİ] Çapraz Toplam çözümü puanlayıcıyla aynı biçimde değil

- Dosya: `frontend/src/games/kakuro/puzzles.js:60` ve `backend/app/services/grading.py:294`
- Sorun: `proof.solution` ipucu çerçevesiyle birlikte `(n+1) × (n+1)`. Puanlayıcı easy 4, medium 6, hard 8 bekliyor (`grading.py:214`). İstenen `proof.solution` girişi 9 örneğin 9’unda `Izgara boyutu uyuşmuyor` verdi. Ekrandaki oyun çerçeveyi kesip iç ızgarayı yolluyor (`Kakuro.jsx:101`). O iç ızgarayla 8 örnek geçti; bir hard yine `Bulmaca çok belirsiz` dedi (`grading.py:16`, sayaç `_count_kakuro`).
- Nasıl doğrulandı: 171 kayıtlı üretim dosyası üzerinde `accepts`; kakuro için ikinci geçişte `solution[1:]` satır ve sütunları atıldı.
- Önerilen çözüm: Saklanan çözüm ile oyuncunun gönderdiği ızgara aynı boyutta olmalı. Hard tekillik sayımı bütçeyi aşarsa bunu “cevap yanlış” saymamalı.

### [ÖNEMLİ] Çit zor seviyesinde tekillik sayımı bütçeyi aşıyor

- Dosya: `backend/app/services/grading.py:450` ve `:527`
- Sorun: Bu turda üç hard Çit bulmacasının biri, doğru `proof.solution` ile `Bulmaca çok belirsiz` verdi. Sayım 400.000 düğümde kesiliyor (`_count_fences`). Çözüm biçimi oyuncunun gönderdiğiyle aynı: `{ horizontal, vertical }` (`open-puzzle.mjs:54`, `Cit.jsx:91`). Easy ve medium üçer örnek geçti. Hard boyut 6 (`grading.py:215`).
- Nasıl doğrulandı: `accepts("cit", "hard", proof, proof.solution)`.
- Önerilen çözüm: Çit sayımını ipuçlarıyla daha erken budamak. Bütçe dolunca doğru çözümü reddetmemek.

### [ÖNEMLİ] Gizli Gemiler üreticisi ara sıra bulmaca çıkaramıyor

- Dosya: `frontend/src/games/amiral-batti/puzzles.js:67`
- Sorun: `generate()` 25 denemede tek çözümlü filo bulamazsa `Tek çözüm Gizli Filo üretilemedi` fırlatıyor. Vitest bunu bu turda yakaladı. Aynı anda 9 üretim çağrısı (easy/medium/hard × 3) hata vermeden bitti; yani her açılışta olmuyor, deneme payı yetmediğinde oluyor.
- Nasıl doğrulandı: `npm test` ve `vite-node` üretim tablosu.
- Önerilen çözüm: Deneme sayısını veya süreyi yükseltmek; olmazsa daha küçük bir filoya düşmek. Oyuncuya ham istisna metni gösterilmemeli.

### [ÖNEMLİ] JWT yedeği kaynakta; üretim kontrolü yalnız iki dizeyi reddeder

- Dosya: `backend/app/config.py:22` ve `backend/app/__init__.py:18`
- Sorun: `SECRET_KEY` ve `JWT_SECRET_KEY` ortamda boşsa `dev-secret-change-me` ve `dev-jwt-secret-change-me` kullanılır. Üretim yalnızca bu iki dizeyi görünce açılışı durdurur (`__init__.py:9`). Başka zayıf bir değer reddedilmez. Test süreci bu 24 baytlık yedek anahtarla JWT ürettiği için pytest `InsecureKeyLengthWarning` verdi (HMAC için önerilen en az 32 bayt).
- Nasıl doğrulandı: `config.py` ve `create_app` okundu. `pytest` uyarı özeti. `git ls-files` `.env` göstermedi; `.gitignore` satır 6 ve 14 `backend/.env` ile `frontend/.env` dosyalarını dışlıyor.
- Önerilen çözüm: Üretimde anahtar yoksa veya 32 bayttan kısaysa açılış durmalı. Test yapılandırması da uzun bir anahtar kullanmalı.

### [DÜŞÜK] Giriş yapmamış herkes, kimliği bilinen misafir bulmacasını okuyabilir

- Dosya: `backend/app/routes/puzzles.py:152`
- Sorun: `user_id` boş olan denemeyi, yine giriş yapmamış herhangi bir istek görebilir. Girişli kullanıcı başkasının denemesini göremez (`:154`). Kimlik UUID olduğu için tahmin zordur.
- Nasıl doğrulandı: `_can_see` okundu.
- Önerilen çözüm: Misafir denemesini açan oturuma bağlamak, ya da misafir bulmacasını kısa sürede kapatmak.

### [DÜŞÜK] E-posta token’ı tek kullanımlık; hatırlatma kelimesiyle sıfırlama süresiz

- Dosya: `backend/app/models/password_reset.py:7` ve `backend/app/routes/auth.py:176`
- Sorun: E-posta token’ı SHA-256 ile durur, 1 saatte dolar, `used_at` dolunca kapanır (`password_reset.py:24`, `auth.py:214`). Ayrı `POST /recover` yolu token kullanmaz: e-posta ve hatırlatma kelimesi yeter. Kelime en az 3 karakter (`backend/app/services/reminder.py:1`), uç 5 istek/dakika ile sınırlı. Kısa kelime denenebilir.
- Nasıl doğrulandı: `PasswordReset.is_open`, `reset_password` ve `recover_password` okundu.
- Önerilen çözüm: Hatırlatma yoluna da kilit ve daha uzun bir alt sınır eklemek. Token tarafı bu haliyle süreli ve tek kullanımlık.

Şifreler `generate_password_hash` ile duruyor (`user.py:40`). Skor süresi istemciden gelmiyor; sunucu `started_at` ile ölçüyor ve 3 saatte kesiyor (`scores.py:15` ve `:33`). Boş cevap 0 puan (`scores.py:34`). Aynı deneme ikinci kez yazılmıyor (`:29`). Çözüm cevapta yok; istemciye giden gövde yalnız `public_puzzle` (`puzzles.py:184`). Doğru cevabı ilk saniyede yollamak yaklaşık 1000 puan verir (`grading.py:29`); bu istemci saati hilesi değil. Öğretmen paneli `/teacher` ve `/board/:slug` yalnız `role="teacher"` (`App.jsx:53` ve `:61`). Sınıf, ödev, liderlik ve öğrenci özeti öğretmen ve kendi sınıfı ile sınırlı (`classrooms.py:14`, `assignments.py:16`, `scores.py:91`, `progress.py:217` ve `:226`). CORS `/api/*` için `CORS_ORIGINS`, varsayılan `http://localhost:5173` (`config.py:39`, `__init__.py:30`).

### [ÖNEMLİ] Oyun listesi, sunucu kapalıyken “Backend” diyor

- Dosya: `frontend/src/i18n/locales/tr.json:52` ve `frontend/src/pages/Games.jsx:26`
- Sorun: Liste hatası kullanıcıya “Oyunlar yüklenemedi. Backend çalışıyor mu?” yazar. İngilizcesi de aynı teknik soruyu sorar (`en.json:52`). 8 saniye sonra ayrı, sade bir uyandırma cümlesi var (`tr.json:53`, `Games.jsx:45`).
- Nasıl doğrulandı: `Games.jsx` ve iki locale dosyası okundu.
- Önerilen çözüm: Hata metnini “Oyunlar şu an açılamadı” gibi bırakmak; sunucu adını yazmamak.

Bulmaca açılamazsa oyun `play.unavailable` gösterir: “Bulmaca şu an açılamadı. Biraz sonra yeniden gelebilir.” (`useIssuedPuzzle.jsx:24` ve `:46`, `tr.json:79`). Yavaş açılışta “Sunucu uyanıyor…” (`tr.json:78`). Skor reddi ekranda genel `play.rejected` olur; `GradeError` metni basılmaz (`Sudoku.jsx:104`). API yine de 400 gövdesinde puanlayıcı cümlesini döner (`scores.py:47`).

### [DÜŞÜK] Mini Mantık, birden fazla çözümde geliştirici cümlesi basıyor

- Dosya: `frontend/src/games/metaforms/Metaforms.jsx:322`
- Sorun: `solutions.length !== 1` iken oyuncu “Geliştirici uyarısı: bu bulmacanın N çözümü var.” görür. Bu hem teknik bir sızıntı hem çevrilmemiş metin.
- Nasıl doğrulandı: `Metaforms.jsx` okundu. Bu turdaki 9 Mini Mantık üretimi puanlamadan geçti; cümlenin canlıda çıkıp çıkmadığı oynanarak bakılmadı.
- Önerilen çözüm: Oyuncuya genel bir “bu bulmaca açılamadı” demek ve ayrıntıyı yalnızca geliştirme konsoluna yazmak.

### [DÜŞÜK] `users.classroom_id` indekssiz

- Dosya: `backend/app/models/user.py:32` ve `backend/migrations/versions/2c73720e9861_add_classrooms_and_user_classroom_id.py:35`
- Sorun: Sütun ve yabancı anahtar var, indeks yok. Öğrenci listesi ve liderlik bu sütunu süzüyor (`progress.py:234`, `scores.py:106`). `assignment.classroom_id`, `attempt.user_id`, `score.user_id`, `score.game_id`, `game.slug` indekslidir. Skor tablosunda `game_slug` sütunu yok; slug `games` üzerindedir.
- Nasıl doğrulandı: model ve migration dosyaları okundu. Veritabanına `alembic check` uygulanmadı. Eklenen sütunlar (`reminder_hash`, `hint_balance`, `batch_id`, deneme, sınav, sıfırlama) kendi migration dosyalarında duruyor; modelden sapma görülmedi.
- Önerilen çözüm: `users.classroom_id` için indeks migration’ı. Canlı şema için bir kez `alembic heads` karşılaştırması.

### [DÜŞÜK] `datetime.utcnow` testlerde yüzlerce uyarı üretiyor

- Dosya: `backend/app/routes/puzzles.py:47` (örnek; aynı çağrı `scores.py:16`, `scores.py:56`, `assignments.py:78`, `exams.py` servisinde `:27` ve `:72`)
- Sorun: pytest 79 testi geçirdi ve 520 uyarı yazdı. Büyük kısım `datetime.utcnow` kaldırılacağı için, bir kısım 24 baytlık JWT anahtarı, bir kısım da `classrooms`/`users` yabancı anahtar döngüsünde SQLite DROP sırası.
- Nasıl doğrulandı: `pytest -q --tb=line` çıktısı.
- Önerilen çözüm: Yeni kayıtlarda `datetime.now(datetime.UTC)` kullanmak. JWT maddesi yukarıdaki anahtar bulgusuyla aynı.

### [ÖNEMLİ] Locale anahtarları aynı; ekrandaki metnin çoğu dosyada sabit

- Dosya: `frontend/src/pages/Games.jsx:36`, `frontend/src/pages/TeacherPanel.jsx:179`, `frontend/src/components/classroom/ClassHomework.jsx:70`, `frontend/src/pages/Exam.jsx:61`, `frontend/src/components/games/HintBar.jsx:14`
- Sorun: `tr.json` ve `en.json` 123’er anahtar, fark yok. Dil değişince çevrilmeyen sabit metinler kalıyor. Örnekler: “Karışık deneme”, “Öğretmen Paneli”, “Bu haftanın ödevi”, “Ödevi bırak”, “Deneme yüklenemedi”, HintBar’daki Türkçe/İngilizce ikili cümleler, veli notunun tamamı (`TeacherPanel.jsx:112` ve `:190`).
- Nasıl doğrulandı: iki JSON’un anahtar kümeleri karşılaştırıldı; `src` içinde Türkçe harf taraması yapıldı.
- Önerilen çözüm: Oyuncu ve öğretmen arayüzünü `t(...)` altına almak. `hints.js` zaten `tr`/`en` çiftleri taşıyor; o dosya bu maddenin dışında.

### [DÜŞÜK] ŞÜPHE: Patika 360 px genişlikte taşıyor

- Dosya: `frontend/src/games/patika/puzzles.js:4` ve `frontend/src/games/patika/Patika.jsx:112`
- Sorun: Izgara easy 8, medium 9, hard 10. Hücre 2,1 rem, ara iz 0,65 rem. 16 px kökte easy yaklaşık 342 px, hard yaklaşık 430 px. Sayfa `px-4` ile 360 px ekranda içerik yaklaşık 328 px. Sarmalayıcıda `overflow-x-auto` yok. Tarayıcıda ölçülmedi.
- Nasıl doğrulandı: boyut sabiti ve ızgara stilinin hesabı. `play-scale` 768 px altında yakınlaştırma yapmıyor (`index.css:79`).
- Önerilen çözüm: ızgarayı `max-w-full overflow-x-auto` içine almak ya da dar ekranda rem’i küçültmek.

### [DÜŞÜK] ŞÜPHE: Rakam Yerleştirme 360 px sınırında

- Dosya: `frontend/src/games/sudoku/Sudoku.jsx:120`
- Sorun: 9 × `w-9` (36 px) = 324 px, dış çerçeve ile yaklaşık 328 px. Yatay kaydırma sınıfı yok. Diğer geniş ızgaraların çoğunda `overflow-x-auto` var (Kakuro `:139`, Apartman `:123`, Çit `:135`, `GridFillGame.jsx:142`, `ToggleGridGame.jsx:182`). Tarayıcıda ölçülmedi.
- Nasıl doğrulandı: Tailwind sınıfları okundu.
- Önerilen çözüm: Dar ekranda hücreyi küçültmek veya ızgarayı yatay kaydırmaya almak.

Beşli Parça hücresi `w-10` / `2.5rem` (`Pentominolar.jsx:221`). Parça sayısına göre sütun değişiyor; hard’da 360 px’i aşması mümkün, ölçülmedi. Mini Mantık 3×3 `h-14 w-14` ve yan tepsi `w-11`; satır yaklaşık 280 px, sığıyor (`Metaforms.jsx:264`).

### [DÜŞÜK] Mini Mantık sürüklemesi touch olayı kullanmıyor; Patika’da parmak sürüklemesi belirsiz

- Dosya: `frontend/src/games/metaforms/Metaforms.jsx:114` ve `frontend/src/games/patika/Patika.jsx:130`
- Sorun: Mini Mantık `draggable` ve `onDragStart` kullanıyor, `touch` veya `pointer` dinleyicisi yok. Yerleştirme yine `onClick` ile var (`:117` ve `:284`), yani dokunup seçmek mümkün; sürükleme jestinin telefonda çalıştığı bu incelemede görülmedi. Renkli Şekiller ve Beşli Parça tıklama ile koyuyor (`Colours.jsx:207`, `Pentominolar.jsx:233`); bu ikisi touch olayına ihtiyaç duymuyor. Patika `onPointerDown` / `onPointerEnter` / `onPointerUp` kullanıyor ve `setPointerCapture` yok (`Patika.jsx:112` üzerinde `touch-none`). Parmakla sürüklerken `pointerenter`nin gelip gelmediği cihazda denenmedi.
- Nasıl doğrulandı: dört oyunun olay bağları okundu. Telefon veya emülatör açılmadı.
- Önerilen çözüm: Mini Mantık’ta tıklama yolu kalsın. Patika’da sürüklemeyi `setPointerCapture` ile aynı işaretçiye bağlamak.

### [DÜŞÜK] `api/users.js` hiçbir yerden import edilmiyor

- Dosya: `frontend/src/api/users.js:3`
- Sorun: `fetchChildren` ve `linkChild` yalnız bu dosyada. Arayüzden çağrı yok. Karşılıkları `GET/POST /api/users/children` her zaman 403 (`backend/app/routes/users.py:9`).
- Nasıl doğrulandı: `frontend/src` import taraması ve `api/users` araması. Başka kaynak dosyası referanssız çıkmadı. Fonksiyon düzeyinde tam bir “hiç çağrılmayanlar” taraması yapılmadı.
- Önerilen çözüm: Kapalı veli uçları ve bu istemci dosyası birlikte kaldırılabilir, ya da dosya bilinçli olarak duruyorsa bir yorumla bırakılabilir.
