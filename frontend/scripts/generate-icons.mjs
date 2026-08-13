// PWA/Android app icon üretici. Harici bir görüntü kütüphanesi (sharp/canvas)
// kullanmadan, ham piksel arabelleğinden elle geçerli bir PNG dosyası yazar
// (yalnızca Node'un yerleşik `zlib`'i ile). Marka rengi ve "M" harfi,
// `tailwind.config.js` içindeki `brand-500` (#2461f7) ile birebir eşleşir.
//
// Çalıştırma: node scripts/generate-icons.mjs

import { deflateSync } from "node:zlib";
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "icons");
mkdirSync(outDir, { recursive: true });

const BRAND = [0x24, 0x61, 0xf7]; // #2461f7 (brand-500)
const WHITE = [0xff, 0xff, 0xff];

// 5x7 nokta matrisli "M" glifi.
const M_GLYPH = [
  [1, 0, 0, 0, 1],
  [1, 1, 0, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 1, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
  [1, 0, 0, 0, 1],
];

function crc32(buf) {
  let c;
  const table = crc32.table || (crc32.table = (() => {
    const t = new Uint32Array(256);
    for (let n = 0; n < 256; n++) {
      c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[n] = c >>> 0;
    }
    return t;
  })());
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function encodePNG(width, height, rgbaPixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = chunk("IHDR", ihdrData);

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filtre yok
    rgbaPixels.copy(raw, y * (stride + 1) + 1, y * stride, y * stride + stride);
  }
  const idat = chunk("IDAT", deflateSync(raw, { level: 9 }));
  const iend = chunk("IEND", Buffer.alloc(0));
  return Buffer.concat([signature, ihdr, idat, iend]);
}

function drawIcon({ size, glyphScale, background, foreground, cornerRadius = 0 }) {
  const pixels = Buffer.alloc(size * size * 4);
  const inCircleOrSquare = (x, y) => {
    if (!cornerRadius) return true;
    const r = cornerRadius;
    const nx = x < r ? r - x : x > size - r - 1 ? x - (size - r - 1) : -1;
    const ny = y < r ? r - y : y > size - r - 1 ? y - (size - r - 1) : -1;
    if (nx < 0 || ny < 0) return true;
    return nx * nx + ny * ny <= r * r;
  };

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const visible = inCircleOrSquare(x, y);
      const [r, g, b] = visible ? background : [0, 0, 0];
      pixels[idx] = r;
      pixels[idx + 1] = g;
      pixels[idx + 2] = b;
      pixels[idx + 3] = visible ? 255 : 0;
    }
  }

  const cols = M_GLYPH[0].length;
  const rows = M_GLYPH.length;
  const block = Math.round((size * glyphScale) / rows);
  const glyphW = block * cols;
  const glyphH = block * rows;
  const startX = Math.round((size - glyphW) / 2);
  const startY = Math.round((size - glyphH) / 2);

  for (let gy = 0; gy < rows; gy++) {
    for (let gx = 0; gx < cols; gx++) {
      if (!M_GLYPH[gy][gx]) continue;
      for (let py = 0; py < block; py++) {
        for (let px = 0; px < block; px++) {
          const x = startX + gx * block + px;
          const y = startY + gy * block + py;
          if (x < 0 || y < 0 || x >= size || y >= size) continue;
          const idx = (y * size + x) * 4;
          pixels[idx] = foreground[0];
          pixels[idx + 1] = foreground[1];
          pixels[idx + 2] = foreground[2];
          pixels[idx + 3] = 255;
        }
      }
    }
  }

  return encodePNG(size, size, pixels);
}

// "any" amaçlı simgeler: köşeleri hafif yuvarlatılmış, glif büyük.
for (const size of [192, 512]) {
  const png = drawIcon({
    size,
    glyphScale: 0.62,
    background: BRAND,
    foreground: WHITE,
    cornerRadius: Math.round(size * 0.18),
  });
  writeFileSync(path.join(outDir, `icon-${size}.png`), png);
}

// "maskable" simge: Android'in güvenli alan kırpması için glif küçük ve
// ortalanmış, arka plan tam kare (kırpılacağı için köşe yuvarlatma yok).
const maskable = drawIcon({
  size: 512,
  glyphScale: 0.42,
  background: BRAND,
  foreground: WHITE,
  cornerRadius: 0,
});
writeFileSync(path.join(outDir, "icon-maskable-512.png"), maskable);

console.log("İkonlar üretildi:", outDir);
