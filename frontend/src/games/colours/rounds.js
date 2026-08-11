import { shuffle } from "../common/latinSquare";

// Stroop tipi tur listesi: kelime farklı bir mürekkep renginde gösterilir,
// öğrenci kelimenin anlamını değil, YAZI RENGİNİ seçmelidir.
const COLORS = {
  Kırmızı: "#dc2626",
  Mavi: "#2563eb",
  Yeşil: "#16a34a",
  Sarı: "#ca8a04",
};

// Türkçe büyük harfe çevirme (İ/I, ı/I) yerel ayardan bağımsız olsun diye sabit eşleme.
const WORD_TEXT = {
  Kırmızı: "KIRMIZI",
  Mavi: "MAVİ",
  Yeşil: "YEŞİL",
  Sarı: "SARI",
};

const COLOR_NAMES = Object.keys(COLORS);

function generateRounds(count = 6) {
  const rounds = [];
  for (let i = 0; i < count; i++) {
    const [wordColor, inkColor] = shuffle(COLOR_NAMES).slice(0, 2);
    rounds.push({ word: WORD_TEXT[wordColor], ink: inkColor });
  }
  return rounds;
}

export { COLORS, generateRounds };
