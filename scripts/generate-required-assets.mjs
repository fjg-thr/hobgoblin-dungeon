import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const force = process.argv.includes("--force");
const sampleRate = 44100;

const rgba = (r, g, b, a = 255) => [r, g, b, a];
const clamp = (value, min = -1, max = 1) => Math.max(min, Math.min(max, value));
const sine = (frequency, time) => Math.sin(Math.PI * 2 * frequency * time);
const triangleWave = (frequency, time) => (2 / Math.PI) * Math.asin(sine(frequency, time));

let generated = 0;
let skipped = 0;
let seed = 0x4d3c2b1a;

const random = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 0xffffffff;
};

const absolutePath = (relativePath) => resolve(root, relativePath);

const ensureParent = (path) => mkdirSync(dirname(path), { recursive: true });

const createCanvas = (width, height, fill = rgba(0, 0, 0, 0)) => {
  const pixels = new Uint8Array(width * height * 4);
  for (let index = 0; index < pixels.length; index += 4) {
    pixels[index] = fill[0];
    pixels[index + 1] = fill[1];
    pixels[index + 2] = fill[2];
    pixels[index + 3] = fill[3];
  }
  return { width, height, pixels };
};

const blendPixel = (canvas, x, y, color) => {
  const px = Math.round(x);
  const py = Math.round(y);
  if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height) {
    return;
  }

  const offset = (py * canvas.width + px) * 4;
  const alpha = color[3] / 255;
  const inverse = 1 - alpha;
  canvas.pixels[offset] = Math.round(color[0] * alpha + canvas.pixels[offset] * inverse);
  canvas.pixels[offset + 1] = Math.round(color[1] * alpha + canvas.pixels[offset + 1] * inverse);
  canvas.pixels[offset + 2] = Math.round(color[2] * alpha + canvas.pixels[offset + 2] * inverse);
  canvas.pixels[offset + 3] = Math.min(255, Math.round(color[3] + canvas.pixels[offset + 3] * inverse));
};

const rect = (canvas, x, y, width, height, color, ox = 0, oy = 0) => {
  for (let py = y; py < y + height; py += 1) {
    for (let px = x; px < x + width; px += 1) {
      blendPixel(canvas, ox + px, oy + py, color);
    }
  }
};

const line = (canvas, x1, y1, x2, y2, color, ox = 0, oy = 0, thickness = 1) => {
  const startX = Math.round(x1);
  const startY = Math.round(y1);
  const endX = Math.round(x2);
  const endY = Math.round(y2);
  const dx = Math.abs(endX - startX);
  const sx = startX < endX ? 1 : -1;
  const dy = -Math.abs(endY - startY);
  const sy = startY < endY ? 1 : -1;
  let err = dx + dy;
  let x = startX;
  let y = startY;

  while (true) {
    for (let ty = 0; ty < thickness; ty += 1) {
      for (let tx = 0; tx < thickness; tx += 1) {
        blendPixel(canvas, ox + x + tx, oy + y + ty, color);
      }
    }
    if (x === endX && y === endY) {
      break;
    }
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
};

const polygon = (canvas, points, color, ox = 0, oy = 0) => {
  const minY = Math.floor(Math.min(...points.map((point) => point[1])));
  const maxY = Math.ceil(Math.max(...points.map((point) => point[1])));

  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let i = 0; i < points.length; i += 1) {
      const [x1, y1] = points[i];
      const [x2, y2] = points[(i + 1) % points.length];
      if ((y1 <= y && y2 > y) || (y2 <= y && y1 > y)) {
        intersections.push(x1 + ((y - y1) * (x2 - x1)) / (y2 - y1));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let i = 0; i < intersections.length; i += 2) {
      const start = Math.ceil(intersections[i]);
      const end = Math.floor(intersections[i + 1]);
      for (let x = start; x <= end; x += 1) {
        blendPixel(canvas, ox + x, oy + y, color);
      }
    }
  }
};

const ellipse = (canvas, cx, cy, rx, ry, color, ox = 0, oy = 0, fill = true) => {
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      const distance = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if ((fill && distance <= 1) || (!fill && distance > 0.72 && distance < 1.18)) {
        blendPixel(canvas, ox + cx + x, oy + cy + y, color);
      }
    }
  }
};

const diamond = (canvas, cx, cy, rx, ry, fill, outline, ox = 0, oy = 0) => {
  for (let y = -ry; y <= ry; y += 1) {
    const span = Math.floor(rx * (1 - Math.abs(y) / ry));
    for (let x = -span; x <= span; x += 1) {
      const edge = Math.abs(x) / rx + Math.abs(y) / ry;
      blendPixel(canvas, ox + cx + x, oy + cy + y, edge > 0.84 ? outline : fill);
    }
  }
};

const drawPanel = (canvas, x, y, width, height, accent, ox = 0, oy = 0) => {
  rect(canvas, x + 8, y + 8, width - 16, height - 16, rgba(18, 14, 13, 230), ox, oy);
  rect(canvas, x + 12, y + 12, width - 24, height - 24, rgba(55, 39, 31, 235), ox, oy);
  rect(canvas, x + 16, y + 16, width - 32, height - 32, rgba(10, 9, 10, 240), ox, oy);
  line(canvas, x + 8, y + 8, x + width - 9, y + 8, accent, ox, oy, 3);
  line(canvas, x + 8, y + height - 10, x + width - 9, y + height - 10, rgba(75, 41, 27), ox, oy, 3);
  line(canvas, x + 8, y + 8, x + 8, y + height - 9, rgba(123, 78, 45), ox, oy, 3);
  line(canvas, x + width - 10, y + 8, x + width - 10, y + height - 9, rgba(34, 20, 18), ox, oy, 3);
};

const drawActorFrame = (canvas, x, y, palette, frameIndex, row) => {
  const bob = frameIndex % 5 === 0 ? 1 : frameIndex % 2 === 0 ? 0 : -1;
  ellipse(canvas, 32, 53, 16, 5, rgba(0, 0, 0, 90), x, y);
  ellipse(canvas, 32, 33 + bob, 13, 16, palette.body, x, y);
  ellipse(canvas, 32, 18 + bob, 10, 10, palette.face, x, y);
  polygon(canvas, [[18, 31 + bob], [5, 23 + bob], [17, 42 + bob]], palette.wing, x, y);
  polygon(canvas, [[46, 31 + bob], [59, 23 + bob], [47, 42 + bob]], palette.wing, x, y);
  rect(canvas, 26, 27 + bob, 12, 10, palette.chest, x, y);
  line(canvas, 22, 46 + bob, 15 + (frameIndex % 3), 58, palette.leg, x, y, 3);
  line(canvas, 42, 46 + bob, 49 - (frameIndex % 3), 58, palette.leg, x, y, 3);
  line(canvas, 17, 20 + bob, 10, 12 + row, palette.horn, x, y, 2);
  line(canvas, 47, 20 + bob, 54, 12 + row, palette.horn, x, y, 2);
  rect(canvas, 28, 17 + bob, 3, 3, rgba(255, 224, 132), x, y);
  rect(canvas, 35, 17 + bob, 3, 3, rgba(255, 224, 132), x, y);
};

const actorPalette = {
  hero: {
    body: rgba(62, 92, 61),
    face: rgba(92, 135, 82),
    chest: rgba(64, 39, 43),
    wing: rgba(42, 49, 46, 230),
    leg: rgba(35, 53, 37),
    horn: rgba(190, 157, 98)
  },
  goblin: {
    body: rgba(73, 104, 54),
    face: rgba(115, 145, 70),
    chest: rgba(62, 42, 31),
    wing: rgba(43, 52, 39, 210),
    leg: rgba(50, 69, 36),
    horn: rgba(142, 119, 78)
  },
  brute: {
    body: rgba(96, 67, 50),
    face: rgba(131, 88, 60),
    chest: rgba(76, 46, 37),
    wing: rgba(47, 38, 36, 220),
    leg: rgba(73, 47, 38),
    horn: rgba(180, 149, 96)
  }
};

const drawActorSheet = (kind) => {
  const canvas = createCanvas(640, 256);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      drawActorFrame(canvas, col * 64, row * 64, actorPalette[kind], col, row);
    }
  }
  return canvas;
};

const drawDeathSheet = () => {
  const canvas = createCanvas(512, 192);
  [actorPalette.hero, actorPalette.goblin, actorPalette.brute].forEach((palette, row) => {
    for (let col = 0; col < 8; col += 1) {
      const x = col * 64;
      const y = row * 64;
      const alpha = Math.max(40, 230 - col * 27);
      ellipse(canvas, 32, 50, 18 + col * 2, 6, rgba(20, 10, 8, alpha), x, y);
      for (let i = 0; i < 5; i += 1) {
        rect(canvas, 18 + i * 6 + col, 38 - i - col, 4, 4, [...palette.body.slice(0, 3), alpha], x, y);
      }
    }
  });
  return canvas;
};

const drawProjectileSheet = () => {
  const canvas = createCanvas(256, 64);
  for (let col = 0; col < 8; col += 1) {
    const x = col * 32;
    ellipse(canvas, 16, 16, 11, 5, rgba(116, 255, 205, 100 + col * 10), x, 0);
    line(canvas, 6, 17, 25, 12 + (col % 3), rgba(203, 255, 199), x, 0, 2);
    line(canvas, 7, 21, 21, 18, rgba(52, 174, 137), x, 0, 2);

    for (let i = 0; i < 8; i += 1) {
      const angle = (Math.PI * 2 * i) / 8 + col * 0.22;
      line(canvas, 16, 48, 16 + Math.cos(angle) * (4 + col), 48 + Math.sin(angle) * (4 + col), rgba(255, 232, 129, 210 - col * 12), x, 0);
    }
  }
  return canvas;
};

const drawEffectSheet = (rows, colorA, colorB) => {
  const canvas = createCanvas(512, rows * 64);
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const x = col * 64;
      const y = row * 64;
      const radius = 8 + col * 3;
      ellipse(canvas, 32, 32, radius, Math.max(5, radius * 0.65), row % 2 === 0 ? colorA : colorB, x, y, false);
      for (let i = 0; i < 8; i += 1) {
        const angle = (Math.PI * 2 * i) / 8 + col * 0.25;
        line(canvas, 32, 32, 32 + Math.cos(angle) * radius, 32 + Math.sin(angle) * radius, colorB, x, y);
      }
    }
  }
  return canvas;
};

const drawPowerupSheet = () => {
  const canvas = createCanvas(256, 128);
  const colors = [rgba(92, 246, 153), rgba(100, 177, 255), rgba(240, 217, 122), rgba(255, 89, 84)];
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 8; col += 1) {
      const x = col * 32;
      const y = row * 32;
      diamond(canvas, 16, 16, 9, 11, colors[row], rgba(24, 22, 20), x, y);
      ellipse(canvas, 16, 16, 12 + (col % 3), 12 + (col % 3), [...colors[row].slice(0, 3), 75], x, y, false);
    }
  }
  return canvas;
};

const drawAmmoSheet = () => {
  const canvas = createCanvas(256, 32);
  for (let col = 0; col < 8; col += 1) {
    const x = col * 32;
    rect(canvas, 10, 11 + (col % 2), 12, 8, rgba(105, 48, 35), x);
    line(canvas, 10, 11 + (col % 2), 22, 19 + (col % 2), rgba(255, 171, 83), x, 0, 2);
    rect(canvas, 14, 7, 5, 5, rgba(255, 225, 111), x);
  }
  return canvas;
};

const drawTile = (kind) => {
  const canvas = createCanvas(96, 64);
  const floorColor = kind.includes("mossy") ? rgba(55, 72, 48) : kind.includes("cracked") ? rgba(80, 75, 65) : rgba(66, 65, 59);
  const outline = kind.includes("chasm") ? rgba(16, 12, 18) : rgba(34, 33, 30);

  if (kind.includes("chasm")) {
    diamond(canvas, 48, 32, 42, 22, rgba(8, 6, 10), rgba(50, 38, 56));
    return canvas;
  }

  diamond(canvas, 48, 32, 42, 22, floorColor, outline);
  if (kind.includes("cracked")) {
    line(canvas, 36, 27, 45, 33, rgba(27, 26, 24));
    line(canvas, 45, 33, 57, 29, rgba(27, 26, 24));
  }
  if (kind.includes("mossy")) {
    rect(canvas, 30, 31, 12, 3, rgba(70, 116, 58, 170));
    rect(canvas, 54, 24, 9, 3, rgba(76, 128, 62, 170));
  }
  if (kind.includes("wall")) {
    polygon(canvas, [[18, 24], [48, 7], [79, 24], [48, 39]], rgba(77, 73, 65));
    polygon(canvas, [[18, 24], [48, 39], [48, 58], [18, 42]], rgba(43, 43, 39));
    polygon(canvas, [[79, 24], [48, 39], [48, 58], [79, 42]], rgba(31, 33, 31));
  }
  if (kind.includes("bridge")) {
    for (let i = 0; i < 5; i += 1) {
      line(canvas, 21 + i * 11, 25 - i, 36 + i * 11, 42 - i, rgba(116, 70, 39), 0, 0, 3);
    }
  }
  if (kind.includes("stairs")) {
    for (let i = 0; i < 5; i += 1) {
      rect(canvas, 34 + i * 3, 22 + i * 5, 28, 3, rgba(33, 31, 34));
    }
  }
  return canvas;
};

const drawProp = (kind) => {
  const canvas = createCanvas(64, 64);
  if (kind.includes("torch") || kind.includes("candle")) {
    rect(canvas, 29, 30, 6, 22, rgba(92, 54, 31));
    ellipse(canvas, 32, 26, 6, 10, rgba(255, 171, 56, 220));
    ellipse(canvas, 32, 25, 3, 6, rgba(255, 244, 137, 240));
    return canvas;
  }
  if (kind.includes("treasure")) {
    rect(canvas, 19, 35, 26, 14, rgba(105, 60, 31));
    rect(canvas, 22, 30, 20, 8, rgba(163, 113, 45));
    rect(canvas, 30, 32, 4, 15, rgba(245, 204, 85));
    return canvas;
  }
  if (kind.includes("banner")) {
    rect(canvas, 30, 12, 4, 42, rgba(66, 41, 29));
    polygon(canvas, [[34, 16], [51, 20], [48, 43], [34, 39]], rgba(129, 24, 33));
    return canvas;
  }
  if (kind.includes("rubble") || kind.includes("bone")) {
    for (let i = 0; i < 9; i += 1) {
      ellipse(canvas, 18 + ((i * 7) % 28), 38 + ((i * 5) % 13), 5, 3, kind.includes("bone") ? rgba(173, 159, 130) : rgba(70, 68, 62));
    }
    return canvas;
  }
  rect(canvas, 27, 20, 10, 34, rgba(77, 52, 34));
  ellipse(canvas, 32, 18, 9, 5, rgba(93, 64, 40));
  return canvas;
};

const drawUiStatic = (kind) => {
  const width = kind === "start_over_button" ? 240 : kind.includes("panel") ? 224 : 96;
  const height = kind === "start_over_button" ? 72 : kind.includes("panel") ? 58 : 96;
  const canvas = createCanvas(width, height);
  if (kind.includes("heart")) {
    ellipse(canvas, 41, 39, 15, 14, rgba(205, 38, 58));
    ellipse(canvas, 55, 39, 15, 14, rgba(231, 54, 72));
    polygon(canvas, [[27, 45], [69, 45], [48, 72]], rgba(202, 26, 55));
    return canvas;
  }
  drawPanel(canvas, 0, 0, width, height, rgba(206, 147, 70));
  return canvas;
};

const drawTitleSheet = (text, frameWidth, frameHeight, frames) => {
  const canvas = createCanvas(frameWidth * frames, frameHeight);
  for (let col = 0; col < frames; col += 1) {
    const ox = col * frameWidth;
    drawPanel(canvas, Math.floor(frameWidth * 0.1), Math.floor(frameHeight * 0.18), Math.floor(frameWidth * 0.8), Math.floor(frameHeight * 0.52), col % 2 === 0 ? rgba(214, 74, 65) : rgba(235, 178, 88), ox);
    for (let i = 0; i < text.length; i += 1) {
      const x = Math.floor(frameWidth * 0.2) + i * Math.floor(frameWidth * 0.022);
      const y = Math.floor(frameHeight * 0.42) + (i % 2);
      rect(canvas, x, y, Math.max(6, Math.floor(frameWidth * 0.012)), Math.max(16, Math.floor(frameHeight * 0.08)), rgba(255, 226, 137), ox);
    }
  }
  return canvas;
};

const drawOpenGraph = () => {
  const canvas = createCanvas(1360, 752, rgba(8, 8, 10, 255));
  for (let i = 0; i < 80; i += 1) {
    diamond(canvas, 60 + (i % 17) * 78, 120 + Math.floor(i / 17) * 92, 40, 22, rgba(33, 34, 31), rgba(13, 13, 14));
  }
  drawPanel(canvas, 130, 100, 1100, 420, rgba(203, 54, 62));
  drawActorFrame(canvas, 615, 250, actorPalette.hero, 0, 0);
  ellipse(canvas, 680, 380, 145, 32, rgba(0, 0, 0, 95));
  for (let i = 0; i < 24; i += 1) {
    rect(canvas, 240 + i * 38, 560 + (i % 2) * 8, 24, 64, rgba(231, 190, 95));
  }
  return canvas;
};

const makeCrcTable = () => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c >>> 0;
  }
  return table;
};

const crcTable = makeCrcTable();

const crc32 = (buffer) => {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const chunk = (type, data) => {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
};

const encodePng = (canvas) => {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(canvas.width, 0);
  header.writeUInt32BE(canvas.height, 4);
  header[8] = 8;
  header[9] = 6;
  header[10] = 0;
  header[11] = 0;
  header[12] = 0;

  const raw = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const rowStart = y * (canvas.width * 4 + 1);
    raw[rowStart] = 0;
    Buffer.from(canvas.pixels.subarray(y * canvas.width * 4, (y + 1) * canvas.width * 4)).copy(raw, rowStart + 1);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", header),
    chunk("IDAT", deflateSync(raw)),
    chunk("IEND", Buffer.alloc(0))
  ]);
};

const writePng = (relativePath, canvas) => {
  const path = absolutePath(relativePath);
  if (!force && existsSync(path)) {
    skipped += 1;
    return;
  }
  ensureParent(path);
  writeFileSync(path, encodePng(canvas));
  generated += 1;
};

const envelope = (time, duration, attack = 0.008, release = 0.08) => {
  const attackGain = Math.min(1, time / attack);
  const releaseGain = Math.min(1, (duration - time) / release);
  return Math.max(0, Math.min(attackGain, releaseGain));
};

const writeWav = (relativePath, duration, render) => {
  const path = absolutePath(relativePath);
  if (!force && existsSync(path)) {
    skipped += 1;
    return;
  }

  const sampleCount = Math.floor(sampleRate * duration);
  const data = Buffer.alloc(sampleCount * 2);
  for (let i = 0; i < sampleCount; i += 1) {
    const time = i / sampleRate;
    const value = clamp(render(time, duration, i) * 0.85);
    data.writeInt16LE(Math.round(value * 32767), i * 2);
  }

  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + data.length, 4);
  header.write("WAVE", 8);
  header.write("fmt ", 12);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(sampleRate, 24);
  header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(data.length, 40);

  ensureParent(path);
  writeFileSync(path, Buffer.concat([header, data]));
  generated += 1;
};

const imageAssets = [
  ["public/assets/characters/hobgoblin-sprite-sheet.png", () => drawActorSheet("hero")],
  ["public/assets/characters/goblin-sprite-sheet.png", () => drawActorSheet("goblin")],
  ["public/assets/characters/brute-sprite-sheet.png", () => drawActorSheet("brute")],
  ["public/assets/characters/actor-deaths-sprite-sheet.png", drawDeathSheet],
  ["public/assets/effects/staff-bolt-sprite-sheet.png", drawProjectileSheet],
  ["public/assets/effects/torch-flame-loop.png", () => drawEffectSheet(1, rgba(255, 135, 50, 190), rgba(255, 226, 114, 220))],
  ["public/assets/effects/candle-flame-loop.png", () => drawEffectSheet(1, rgba(255, 173, 67, 170), rgba(255, 241, 150, 220))],
  ["public/assets/effects/haste-sparkle-sprite-sheet.png", () => drawEffectSheet(1, rgba(105, 190, 255, 155), rgba(255, 230, 115, 230))],
  ["public/assets/effects/blast-sprite-sheet.png", () => drawEffectSheet(1, rgba(255, 86, 73, 165), rgba(255, 215, 105, 230))],
  ["public/assets/effects/combat-juice-sprite-sheet.png", () => drawEffectSheet(2, rgba(255, 234, 151, 220), rgba(190, 44, 44, 190))],
  ["public/assets/effects/pickup-intent-effects-sprite-sheet.png", () => drawEffectSheet(3, rgba(120, 210, 255, 160), rgba(255, 224, 96, 230))],
  ["public/assets/effects/powerups-sprite-sheet.png", drawPowerupSheet],
  ["public/assets/effects/ammo-pickup-sprite-sheet.png", drawAmmoSheet],
  ["public/assets/effects/shadow_blob.png", () => {
    const canvas = createCanvas(64, 32);
    ellipse(canvas, 32, 16, 26, 9, rgba(0, 0, 0, 115));
    return canvas;
  }],
  ["public/assets/effects/torch_glow.png", () => {
    const canvas = createCanvas(96, 96);
    for (let r = 38; r > 0; r -= 3) {
      ellipse(canvas, 48, 48, r, r, rgba(255, 132, 52, Math.max(8, 80 - r * 2)));
    }
    return canvas;
  }],
  ["public/assets/effects/dust_particle.png", () => {
    const canvas = createCanvas(16, 16);
    ellipse(canvas, 8, 8, 5, 4, rgba(166, 133, 88, 180));
    return canvas;
  }],
  ["public/assets/ui/start-title-sprite-sheet.png", () => drawTitleSheet("HOBGOBLIN DUNGEON", 640, 320, 4)],
  ["public/assets/ui/game-over-sprite-sheet.png", () => drawTitleSheet("GAME OVER", 560, 260, 4)],
  ["public/assets/ui/life-meter-sprite-sheet.png", () => drawTitleSheet("LIFE", 640, 240, 4)],
  ["public/assets/ui/hud-panels-sprite-sheet.png", () => drawTitleSheet("HUD", 224, 58, 8)],
  ["public/assets/ui/life-heart-burst.png", () => drawEffectSheet(1, rgba(255, 82, 100, 190), rgba(255, 219, 150, 230))],
  ["public/assets/ui/life-heart-shimmer-sprite-sheet.png", () => drawTitleSheet("HEART", 64, 64, 4)],
  ["public/assets/ui/small_dark_panel.png", () => drawUiStatic("panel")],
  ["public/assets/ui/debug_label_bg.png", () => drawUiStatic("panel")],
  ["public/assets/ui/keyboard_hint_panel.png", () => drawUiStatic("panel")],
  ["public/assets/ui/life_meter_frame_empty.png", () => drawUiStatic("panel")],
  ["public/assets/ui/life-heart.png", () => drawUiStatic("heart")],
  ["public/assets/ui/game_over_panel.png", () => drawUiStatic("panel")],
  ["public/assets/ui/start_over_button.png", () => drawUiStatic("start_over_button")],
  ["public/opengraph-image.png", drawOpenGraph]
];

[
  "stone_floor",
  "cracked_floor",
  "mossy_floor",
  "dark_wall",
  "vertical_wall",
  "corner_wall",
  "low_dark_wall",
  "low_vertical_wall",
  "low_corner_wall",
  "low_wall_north",
  "low_wall_south",
  "low_wall_east",
  "low_wall_west",
  "low_corner_ne",
  "low_corner_nw",
  "low_corner_se",
  "low_corner_sw",
  "stairs_down",
  "chasm_edge",
  "wooden_bridge"
].forEach((name) => {
  imageAssets.push([`public/assets/tiles/${name}.png`, () => drawTile(name)]);
});

["torch", "bone_pile", "small_treasure", "red_banner", "rubble", "wooden_post", "small_candle"].forEach((name) => {
  imageAssets.push([`public/assets/tiles/${name}.png`, () => drawProp(name)]);
});

imageAssets.forEach(([relativePath, draw]) => writePng(relativePath, draw()));

const audioAssets = [
  ["staff_shot", 0.18, (time, duration) => triangleWave(420 + 920 * (1 - time / duration), time) * envelope(time, duration, 0.004, 0.12)],
  ["projectile_hit", 0.16, (time, duration) => (random() * 2 - 1) * envelope(time, duration, 0.001, 0.05) * 0.25 + sine(110 - time * 120, time) * envelope(time, duration, 0.002, 0.12) * 0.45],
  ["enemy_hit", 0.17, (time, duration) => triangleWave(180 - time * 190, time) * envelope(time, duration, 0.003, 0.12) * 0.45],
  ["enemy_down", 0.36, (time, duration) => triangleWave(170 - time * 260, time) * envelope(time, duration, 0.006, 0.24) * 0.5],
  ["player_hurt", 0.28, (time, duration) => sine(130 + 35 * Math.sin(time * 30), time) * envelope(time, duration, 0.002, 0.2) * 0.55],
  ["pickup", 0.22, (time, duration) => sine(560 + time * 880, time) * envelope(time, duration, 0.006, 0.12) * 0.35],
  ["powerup", 0.46, (time, duration) => sine([460, 620, 820, 1080][Math.min(3, Math.floor((time / duration) * 4))], time) * envelope(time, duration, 0.008, 0.18) * 0.4],
  ["heart_pickup", 0.34, (time, duration) => (sine(520 + time * 640, time) + sine(260 + time * 260, time)) * envelope(time, duration, 0.01, 0.2) * 0.3],
  ["ammo_pickup", 0.2, (time, duration) => triangleWave(240 + time * 520, time) * envelope(time, duration, 0.003, 0.09) * 0.4],
  ["game_over", 0.78, (time, duration) => (triangleWave(220 - time * 170, time) + sine(64 - time * 24, time)) * envelope(time, duration, 0.02, 0.42) * 0.35],
  ["start", 0.42, (time, duration) => (sine(220 + time * 180, time) + sine(330 + time * 260, time)) * envelope(time, duration, 0.01, 0.22) * 0.28],
  ["ui_toggle", 0.11, (time, duration) => triangleWave(760 - time * 1100, time) * envelope(time, duration, 0.001, 0.055) * 0.38],
  ["blast", 0.58, (time, duration) => (sine(96 - time * 90, time) * 0.62 + sine(680 + time * 620, time) * 0.12 + (random() * 2 - 1) * 0.1) * envelope(time, duration, 0.004, 0.36)],
  ["dungeon_ambience", 12, (time, duration) => (sine(55, time) * 0.38 + sine(82.5, time) * 0.22 + (random() * 2 - 1) * 0.018) * Math.sin((Math.PI * time) / duration) ** 0.35 * 0.42],
  ["retro_dungeon_theme", 16, (time) => {
    const notes = [110, 130.81, 146.83, 164.81, 146.83, 130.81, 98, 87.31];
    const note = notes[Math.floor(time * 2) % notes.length];
    const lead = Math.sign(sine(note, time)) * 0.18;
    const bass = triangleWave(note / 2, time) * 0.22;
    const pulse = Math.floor(time * 8) % 2 === 0 ? 0.08 : 0;
    return lead + bass + (random() * 2 - 1) * pulse;
  }]
];

audioAssets.forEach(([name, duration, render]) => writeWav(`public/assets/audio/${name}.wav`, duration, render));

console.log(`Required asset generation complete: ${generated} generated, ${skipped} already present.`);
