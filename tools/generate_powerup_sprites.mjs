import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = resolve(root, "public/assets/effects");
const frame = 32;
const framesPerRow = 8;
const width = frame * framesPerRow;
const height = frame * 3;
const pixels = new Uint8Array(width * height * 4);

const rgba = (r, g, b, a = 255) => [r, g, b, a];

function blendPixel(x, y, color) {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const offset = (y * width + x) * 4;
  const alpha = color[3] / 255;
  const inv = 1 - alpha;
  pixels[offset] = Math.round(color[0] * alpha + pixels[offset] * inv);
  pixels[offset + 1] = Math.round(color[1] * alpha + pixels[offset + 1] * inv);
  pixels[offset + 2] = Math.round(color[2] * alpha + pixels[offset + 2] * inv);
  pixels[offset + 3] = Math.min(255, Math.round(color[3] + pixels[offset + 3] * inv));
}

function setPixel(x, y, color, ox, oy, scale = 1) {
  for (let sy = 0; sy < scale; sy += 1) {
    for (let sx = 0; sx < scale; sx += 1) {
      blendPixel(ox + x + sx, oy + y + sy, color);
    }
  }
}

function rect(x, y, w, h, color, ox, oy) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      blendPixel(ox + px, oy + py, color);
    }
  }
}

function line(x1, y1, x2, y2, color, ox, oy) {
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;
  let x = x1;
  let y = y1;
  while (true) {
    blendPixel(ox + x, oy + y, color);
    if (x === x2 && y === y2) break;
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
}

function ellipse(cx, cy, rx, ry, color, ox, oy) {
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      const edge = (x * x) / (rx * rx) + (y * y) / (ry * ry);
      if (edge > 0.8 && edge < 1.18) blendPixel(ox + cx + x, oy + cy + y, color);
    }
  }
}

function diamond(cx, cy, r, fill, outline, ox, oy) {
  for (let y = -r; y <= r; y += 1) {
    const span = r - Math.abs(y);
    for (let x = -span; x <= span; x += 1) {
      const color = Math.abs(x) + Math.abs(y) >= r - 1 ? outline : fill;
      blendPixel(ox + cx + x, oy + cy + y, color);
    }
  }
}

function sparkRing(frameIndex, color, ox, oy) {
  const phase = frameIndex % framesPerRow;
  const sparks = [
    [16, 4 + (phase % 2)],
    [25 - (phase % 3), 10],
    [25, 22 - (phase % 2)],
    [16, 28 - (phase % 2)],
    [7 + (phase % 3), 22],
    [6, 10 + (phase % 2)]
  ];
  sparks.forEach(([x, y], index) => {
    if ((frameIndex + index) % 3 !== 0) setPixel(x, y, color, ox, oy);
  });
}

function quickshot(frameIndex, ox, oy) {
  ellipse(16, 17, 10, 9, rgba(68, 220, 142, 64 + (frameIndex % 3) * 18), ox, oy);
  diamond(16, 17 + (frameIndex % 2), 7, rgba(86, 245, 164), rgba(22, 65, 43), ox, oy);
  line(11, 19, 20, 10, rgba(221, 255, 177), ox, oy);
  line(20, 10, 17, 17, rgba(221, 255, 177), ox, oy);
  line(17, 17, 23, 17, rgba(221, 255, 177), ox, oy);
  line(10, 20, 18, 12, rgba(43, 118, 66), ox, oy);
  line(16, 18, 22, 18, rgba(43, 118, 66), ox, oy);
  sparkRing(frameIndex, rgba(150, 255, 190, 210), ox, oy);
}

function haste(frameIndex, ox, oy) {
  const bob = [2, 3, 6].includes(frameIndex) ? -1 : 0;
  ellipse(16, 17 + bob, 9, 9, rgba(70, 130, 255, 80), ox, oy);
  rect(12, 19 + bob, 8, 5, rgba(30, 52, 74), ox, oy);
  line(12, 21 + bob, 18, 12 + bob, rgba(30, 52, 74), ox, oy);
  line(18, 12 + bob, 22, 18 + bob, rgba(30, 52, 74), ox, oy);
  line(15, 14 + bob, 24, 8 + bob, rgba(124, 191, 255), ox, oy);
  line(16, 15 + bob, 28, 12 + bob, rgba(124, 191, 255), ox, oy);
  line(14, 15 + bob, 24, 9 + bob, rgba(236, 222, 130), ox, oy);
  rect(10, 23 + bob, 11, 2, rgba(244, 205, 99), ox, oy);
  line(6 + (frameIndex % 3), 14, 10 + (frameIndex % 3), 14, rgba(110, 190, 255, 180), ox, oy);
  line(5 + ((frameIndex + 1) % 4), 18, 11 + ((frameIndex + 1) % 4), 18, rgba(110, 190, 255, 160), ox, oy);
}

function ward(frameIndex, ox, oy) {
  const pulse = frameIndex % 4;
  ellipse(16, 16, 11 + Math.floor(pulse / 2), 11 + Math.floor(pulse / 2), rgba(154, 105, 255, 58), ox, oy);
  line(16, 7, 24, 11, rgba(82, 55, 113), ox, oy);
  line(24, 11, 22, 21, rgba(82, 55, 113), ox, oy);
  line(22, 21, 16, 27, rgba(82, 55, 113), ox, oy);
  line(16, 27, 10, 21, rgba(82, 55, 113), ox, oy);
  line(10, 21, 8, 11, rgba(82, 55, 113), ox, oy);
  line(8, 11, 16, 7, rgba(82, 55, 113), ox, oy);
  diamond(16, 17, 8, rgba(156, 90, 225), rgba(30, 23, 46), ox, oy);
  diamond(16, 17, 4, rgba(255, 197, 91), rgba(98, 58, 128), ox, oy);
  setPixel(15, 16, rgba(255, 244, 176), ox, oy, 2);
  sparkRing(frameIndex + 2, rgba(207, 165, 255, 190), ox, oy);
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return ~crc >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function pngEncode() {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanlines = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    scanlines[rowStart] = 0;
    scanlines.set(pixels.subarray(y * width * 4, (y + 1) * width * 4), rowStart + 1);
  }
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

const rows = [
  { name: "quickshot", draw: quickshot },
  { name: "haste", draw: haste },
  { name: "ward", draw: ward }
];

rows.forEach((row, rowIndex) => {
  for (let col = 0; col < framesPerRow; col += 1) {
    row.draw(col, col * frame, rowIndex * frame);
  }
});

mkdirSync(outDir, { recursive: true });
writeFileSync(resolve(outDir, "powerups-sprite-sheet.png"), pngEncode());

const frameRects = {};
const animations = {};
rows.forEach((row, rowIndex) => {
  animations[`powerup-${row.name}`] = { frames: [], frameRate: 10, repeat: -1 };
  for (let col = 0; col < framesPerRow; col += 1) {
    const key = `${row.name}_${col.toString().padStart(2, "0")}`;
    frameRects[key] = { x: col * frame, y: rowIndex * frame, w: frame, h: frame };
    animations[`powerup-${row.name}`].frames.push(key);
  }
});

writeFileSync(
  resolve(outDir, "powerups-sprite-sheet.json"),
  `${JSON.stringify(
    {
      image: "/assets/effects/powerups-sprite-sheet.png",
      frameWidth: frame,
      frameHeight: frame,
      types: rows.map((row) => row.name),
      frames: frameRects,
      animations,
      notes: "Simple local pixel-art power-up spritesheet: quickshot, haste, and ward rows."
    },
    null,
    2
  )}\n`
);
