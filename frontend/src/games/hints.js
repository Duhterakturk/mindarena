// Canlı bulmacanın cevabını vermez. Yalnızca nasıl düşünüleceğini söyler.
export const HINTS = {
  kakuro: {
    tr: { hint: "Önce iki karelik küçük toplamları dene. 3 yalnızca 1 ve 2 olabilir.", example: "Üstte 4 yazıyorsa ve iki kare varsa, oraya 1 ile 3 gelir. Aynı rakam tekrar etmez." },
    en: { hint: "Start with short runs. A sum of 3 in two cells can only be 1 and 2.", example: "A 4 over two cells is 1 and 3, in either order." },
  },
  sudoku: {
    tr: { hint: "Bir satırda eksik tek rakam varsa onu yaz. Sonra kutuya bak.", example: "Satırda 1’den 8’e kadar doluysa boş kare 9’dur." },
    en: { hint: "If a row is missing one digit, write it. Then check the box.", example: "A row with 1 through 8 already filled must end with 9." },
  },
  "bolgesel-sudoku": {
    tr: { hint: "Renkli bölgeyi bir satır gibi düşün. 1, 2, 3, 4 her bölgede bir kez durur.", example: "Bölgede 1, 2 ve 4 varsa boş yere 3 gelir." },
    en: { hint: "Treat each colored region like a row. 1 through 4 appear once.", example: "A region that already has 1, 2 and 4 needs a 3." },
  },
  apartman: {
    tr: { hint: "Kenarda 4 yazıyorsa binalar o yönde küçükten büyüğe dizilir.", example: "Solda 4 görünen bir satır 1, 2, 3, 4 sırasıdır." },
    en: { hint: "A 4 on the edge means the buildings rise in order from that side.", example: "A left clue of 4 means the row is 1, 2, 3, 4." },
  },
  cit: {
    tr: { hint: "3, o karenin üç kenarında çizgi olduğunu söyler. Çizgi sonunda tek bir halka olmalı.", example: "Köşedeki 2, iki dış kenarın çizileceğini haber verir." },
    en: { hint: "A 3 means three sides of that cell are on the loop. The line closes once.", example: "A 2 in a corner often uses the two outer edges." },
  },
  "amiral-batti": {
    tr: { hint: "0 yazan satıra gemi koyma. Gemiler birbirine değmez, çapraz da değmez.", example: "Satırda 1 yazıyorsa o satırda tek bir gemi karesi vardır." },
    en: { hint: "A row marked 0 is empty. Ships never touch, not even diagonally.", example: "A row marked 1 holds exactly one ship cell." },
  },
  "sihirli-piramit": {
    tr: { hint: "Üstteki taş, altındaki iki taşın toplamıdır. Eksik olanı çıkarma ile bul.", example: "Üstte 7, solda 3 varsa sağdaki taş 4’tür." },
    en: { hint: "Each stone is the sum of the two stones under it.", example: "A 7 sitting on a 3 needs a 4 beside it." },
  },
  patika: {
    tr: { hint: "1’den başla, sıradaki sayıya yalnız sağa, sola, yukarı veya aşağı git.", example: "1 ile 2 yan yanaysa aralarına düz bir çizgi çek." },
    en: { hint: "Start at 1. Move only up, down, left or right to the next number.", example: "If 1 and 2 are neighbors, draw the straight step between them." },
  },
  "abc-baglama": {
    tr: { hint: "Aynı harfi birbirine bağla. Çizgiler kesişmesin ve kendi üzerine binmesin.", example: "İki A köşedeyse, önce boş bir koridor seç, sonra çiz." },
    en: { hint: "Join matching letters. Paths do not cross or overlap.", example: "When two A’s sit in corners, pick an empty corridor first." },
  },
  "islem-karesi": {
    tr: { hint: "Küçük kafesten başla. Toplam ya da çarpım, rakamları tek tek denemeden önce daraltır.", example: "İki karede çarpım 6 ise çift 1 ve 6 ya da 2 ve 3’tür." },
    en: { hint: "Start with the smallest cage. The sum or product cuts the choices.", example: "A product of 6 in two cells is 1×6 or 2×3." },
  },
  kendoku: {
    tr: { hint: "Çıkarma ve bölmede sıra serbesttir. 2− olan iki kare, aralarında 2 fark olan bir çifttir.", example: "3− yazan iki kare 1 ve 4, ya da 2 ve 5 olabilir." },
    en: { hint: "Subtraction and division ignore order. A cage of 2− is a pair two apart.", example: "A 3− cage can be 1 and 4, or 2 and 5." },
  },
  "yildiz-savaslari": {
    tr: { hint: "Bir yıldıza komşu sekiz kareye başka yıldız koyma. Her satırda bir tane durur.", example: "Köşeye yıldız koyunca yanındaki satır ve sütun o köşeye yaklaşamaz." },
    en: { hint: "A star blocks all eight neighbors. Each row holds one star.", example: "A corner star pushes the next star away from that row and column." },
  },
  "kare-karalamaca": {
    tr: { hint: "Satırdaki sayılar boyalı grupların uzunluğudur. Aralarında en az bir boş kare vardır.", example: "5 karelik satırda 5 yazıyorsa satırın tamamı boyalıdır." },
    en: { hint: "The numbers are the lengths of shaded groups, with a gap between them.", example: "A 5 in a row of five cells means the whole row is shaded." },
  },
  carpmaca: {
    tr: { hint: "Satırdaki sayı ile sütundaki sayıyı çarp. Tabloyu ezberlemen gerekmez, tek tek çarp.", example: "Satır 3, sütun 4 ise hücre 12’dir." },
    en: { hint: "Multiply the row heading by the column heading.", example: "Row 3 and column 4 make 12." },
  },
  futoshiki: {
    tr: { hint: "Küçük ağız küçük sayıyı gösterir. Önce işarete komşu iki kareyi doldur.", example: "1 < boş ise boş kare 1 olamaz. En az 2’dir." },
    en: { hint: "The small end of the sign points at the smaller number.", example: "If 1 < blank, the blank cannot be 1." },
  },
  pentominolar: {
    tr: { hint: "Önce çerçeveye tam oturan köşe parçasını yerleştir. Parçayı döndürmeyi unutma.", example: "Artı şekli ortaya yakın durur; köşeye sığmaz." },
    en: { hint: "Place the piece that fits a corner first. Rotate it if you need to.", example: "The plus shape sits near the middle. It does not fit a corner." },
  },
  metaforms: {
    tr: { hint: "Renge değil, şeklin kendisine bak. Dördü aynı, biri farklıdır.", example: "Dört üçgen ve bir kare varsa kare aykırı olandır." },
    en: { hint: "Ignore the color. Four shapes match and one does not.", example: "Four triangles and one square means the square is the odd one." },
  },
  numbers: {
    tr: { hint: "1’i bul, sonra 2, sonra 3. Ekranda sırayı gözünle takip et.", example: "1 sol üstteyse bakışını oradan sağa ve aşağı kaydır." },
    en: { hint: "Find 1, then 2, then 3. Let your eyes follow the order.", example: "If 1 is in the top left, scan right and down from there." },
  },
  colours: {
    tr: { hint: "Kelimeyi okuma. Mürekkebin rengine bas.", example: "Mavi yazıyla KIRMIZI yazıyorsa mavi düğmeye bas." },
    en: { hint: "Do not read the word. Press the ink color.", example: "If RED is written in blue ink, press blue." },
  },
};

export function hintFor(slug, language) {
  const row = HINTS[slug];
  if (!row) return null;
  return language === "en" ? row.en : row.tr;
}
