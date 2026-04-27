import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const characterOut = resolve(root, "public/assets/characters");
const effectsOut = resolve(root, "public/assets/effects");

const rgba = (r, g, b, a = 255) => [r, g, b, a];

function createCanvas(width, height) {
  return { width, height, pixels: new Uint8Array(width * height * 4) };
}

function blendPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.width || y >= canvas.height) return;
  const offset = (y * canvas.width + x) * 4;
  const alpha = color[3] / 255;
  const inv = 1 - alpha;
  canvas.pixels[offset] = Math.round(color[0] * alpha + canvas.pixels[offset] * inv);
  canvas.pixels[offset + 1] = Math.round(color[1] * alpha + canvas.pixels[offset + 1] * inv);
  canvas.pixels[offset + 2] = Math.round(color[2] * alpha + canvas.pixels[offset + 2] * inv);
  canvas.pixels[offset + 3] = Math.min(255, Math.round(color[3] + canvas.pixels[offset + 3] * inv));
}

function rect(canvas, x, y, w, h, color, ox = 0, oy = 0) {
  for (let py = y; py < y + h; py += 1) {
    for (let px = x; px < x + w; px += 1) {
      blendPixel(canvas, ox + px, oy + py, color);
    }
  }
}

function ellipse(canvas, cx, cy, rx, ry, color, ox = 0, oy = 0) {
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) {
        blendPixel(canvas, ox + cx + x, oy + cy + y, color);
      }
    }
  }
}

function line(canvas, x1, y1, x2, y2, color, ox = 0, oy = 0, thickness = 1) {
  const dx = Math.abs(x2 - x1);
  const sx = x1 < x2 ? 1 : -1;
  const dy = -Math.abs(y2 - y1);
  const sy = y1 < y2 ? 1 : -1;
  let err = dx + dy;
  let x = x1;
  let y = y1;
  while (true) {
    rect(canvas, x, y, thickness, thickness, color, ox, oy);
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

function triangle(canvas, points, color, ox = 0, oy = 0) {
  const [a, b, c] = points;
  const minX = Math.floor(Math.min(a[0], b[0], c[0]));
  const maxX = Math.ceil(Math.max(a[0], b[0], c[0]));
  const minY = Math.floor(Math.min(a[1], b[1], c[1]));
  const maxY = Math.ceil(Math.max(a[1], b[1], c[1]));
  const area = (p1, p2, p3) => (p1[0] - p3[0]) * (p2[1] - p3[1]) - (p2[0] - p3[0]) * (p1[1] - p3[1]);
  const total = area(a, b, c);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const p = [x, y];
      const w1 = area(p, b, c) / total;
      const w2 = area(a, p, c) / total;
      const w3 = area(a, b, p) / total;
      if (w1 >= 0 && w2 >= 0 && w3 >= 0) blendPixel(canvas, ox + x, oy + y, color);
    }
  }
}

function drawBruteFrame(canvas, row, col) {
  const ox = col * 64;
  const oy = row * 64;
  const walk = col >= 4;
  const step = walk ? Math.sin((col - 4) * Math.PI / 3) : Math.sin(col * Math.PI / 2) * 0.35;
  const bob = Math.round(step);
  const facesWest = row === 1 || row === 3;
  const side = facesWest ? -1 : 1;
  const back = row >= 2;
  const cx = 32;
  const base = 58 + bob;

  ellipse(canvas, cx, base - 14, 14, 9, rgba(22, 18, 17, 175), ox, oy);
  rect(canvas, cx - 11, base - 12, 8, 9, rgba(45, 31, 22), ox, oy);
  rect(canvas, cx + 3, base - 12, 8, 9, rgba(45, 31, 22), ox, oy);
  rect(canvas, cx - 13, base - 7, 10, 4, rgba(19, 18, 17), ox, oy);
  rect(canvas, cx + 3, base - 7, 10, 4, rgba(19, 18, 17), ox, oy);

  ellipse(canvas, cx, base - 27, 14, 17, rgba(62, 75, 43), ox, oy);
  ellipse(canvas, cx - 1, base - 30, 11, 13, rgba(84, 98, 54), ox, oy);
  rect(canvas, cx - 15, base - 31, 30, 7, rgba(36, 31, 27), ox, oy);
  rect(canvas, cx - 13, base - 25, 26, 4, rgba(91, 66, 42), ox, oy);

  ellipse(canvas, cx, base - 45, 11, 10, rgba(78, 93, 50), ox, oy);
  ellipse(canvas, cx + side * 3, base - 45, 7, 7, rgba(99, 114, 59), ox, oy);
  triangle(canvas, [[cx - 10, base - 49], [cx - 22, base - 56], [cx - 13, base - 43]], rgba(127, 111, 77), ox, oy);
  triangle(canvas, [[cx + 10, base - 49], [cx + 22, base - 56], [cx + 13, base - 43]], rgba(127, 111, 77), ox, oy);
  rect(canvas, cx - 14, base - 42, 28, 3, rgba(34, 27, 25), ox, oy);
  if (!back) {
    rect(canvas, cx + side * 2 - 3, base - 47, 4, 3, rgba(236, 206, 103), ox, oy);
    rect(canvas, cx + side * 7, base - 43, 5, 2, rgba(31, 23, 19), ox, oy);
  } else {
    rect(canvas, cx - 8, base - 48, 16, 3, rgba(48, 37, 31), ox, oy);
  }

  const armY = base - 29 + Math.round(step * 2);
  line(canvas, cx - side * 10, armY, cx - side * 18, armY + 12, rgba(73, 88, 49), ox, oy, 4);
  line(canvas, cx + side * 9, armY, cx + side * 18, armY - 3, rgba(73, 88, 49), ox, oy, 4);
  line(canvas, cx + side * 18, armY - 3, cx + side * 26, armY - 16, rgba(91, 55, 31), ox, oy, 4);
  ellipse(canvas, cx + side * 28, armY - 18, 4, 8, rgba(119, 84, 49), ox, oy);
  rect(canvas, cx + side * 19 - 2, armY - 7, 5, 5, rgba(123, 96, 59), ox, oy);
  rect(canvas, cx - side * 20 - 2, armY + 10, 5, 5, rgba(123, 96, 59), ox, oy);

  rect(canvas, cx - 10, base - 25, 20, 4, rgba(142, 89, 48), ox, oy);
  rect(canvas, cx - 7, base - 20, 14, 3, rgba(186, 131, 65), ox, oy);
}

function drawAmmoFrame(canvas, col) {
  const ox = col * 32;
  const oy = 0;
  const bob = Math.round(Math.sin(col * Math.PI / 4) * 2);
  ellipse(canvas, 16, 17 + bob, 10, 8, rgba(255, 80, 55, 46), ox, oy);
  line(canvas, 9, 20 + bob, 22, 8 + bob, rgba(129, 38, 32), ox, oy, 3);
  line(canvas, 10, 19 + bob, 23, 7 + bob, rgba(213, 68, 47), ox, oy, 1);
  rect(canvas, 13, 17 + bob, 5, 4, rgba(81, 48, 28), ox, oy);
  rect(canvas, 18, 12 + bob, 4, 4, rgba(238, 178, 72), ox, oy);
  rect(canvas, 11, 22 + bob, 3, 3, rgba(238, 178, 72), ox, oy);
  if (col % 2 === 0) rect(canvas, 24, 9 + bob, 2, 2, rgba(255, 225, 111, 210), ox, oy);
  if (col % 3 !== 0) rect(canvas, 7, 14 + bob, 1, 1, rgba(255, 166, 89, 180), ox, oy);
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

function encodePng(canvas) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(canvas.width, 0);
  ihdr.writeUInt32BE(canvas.height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const scanlines = Buffer.alloc((canvas.width * 4 + 1) * canvas.height);
  for (let y = 0; y < canvas.height; y += 1) {
    const rowStart = y * (canvas.width * 4 + 1);
    scanlines[rowStart] = 0;
    scanlines.set(canvas.pixels.subarray(y * canvas.width * 4, (y + 1) * canvas.width * 4), rowStart + 1);
  }
  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(scanlines, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}

function writeBrute() {
  const canvas = createCanvas(640, 256);
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 10; col += 1) {
      drawBruteFrame(canvas, row, col);
    }
  }
  mkdirSync(characterOut, { recursive: true });
  writeFileSync(resolve(characterOut, "brute-sprite-sheet.png"), encodePng(canvas));

  const directions = ["southeast", "southwest", "northeast", "northwest"];
  const frames = {};
  const animations = {};
  directions.forEach((direction, row) => {
    const idle = [];
    const walk = [];
    for (let col = 0; col < 10; col += 1) {
      const key = `${direction}_${col.toString().padStart(2, "0")}`;
      frames[key] = { x: col * 64, y: row * 64, w: 64, h: 64 };
      if (col < 4) idle.push(key);
      else walk.push(key);
    }
    animations[`idle-${direction}`] = { frames: idle, frameRate: 5, repeat: -1 };
    animations[`walk-${direction}`] = { frames: walk, frameRate: 8, repeat: -1 };
  });
  writeFileSync(
    resolve(characterOut, "brute-sprite-sheet.json"),
    `${JSON.stringify(
      {
        image: "/assets/characters/brute-sprite-sheet.png",
        frameWidth: 64,
        frameHeight: 64,
        directions,
        frames,
        animations,
        notes: "Local deterministic larger villain sprite sheet for the dungeon prototype."
      },
      null,
      2
    )}\n`
  );
}

function writeAmmo() {
  const canvas = createCanvas(256, 32);
  for (let col = 0; col < 8; col += 1) drawAmmoFrame(canvas, col);
  mkdirSync(effectsOut, { recursive: true });
  writeFileSync(resolve(effectsOut, "ammo-pickup-sprite-sheet.png"), encodePng(canvas));
  const frames = {};
  const animationFrames = [];
  for (let col = 0; col < 8; col += 1) {
    const key = `ammo_${col.toString().padStart(2, "0")}`;
    frames[key] = { x: col * 32, y: 0, w: 32, h: 32 };
    animationFrames.push(key);
  }
  writeFileSync(
    resolve(effectsOut, "ammo-pickup-sprite-sheet.json"),
    `${JSON.stringify(
      {
        image: "/assets/effects/ammo-pickup-sprite-sheet.png",
        frameWidth: 32,
        frameHeight: 32,
        frames,
        animations: { ammo: { frames: animationFrames, frameRate: 10, repeat: -1 } },
        notes: "Local deterministic ammo pickup sprite sheet."
      },
      null,
      2
    )}\n`
  );
}

writeBrute();
writeAmmo();
