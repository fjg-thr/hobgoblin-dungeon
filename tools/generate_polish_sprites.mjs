import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const uiOut = resolve(root, "public/assets/ui");
const effectsOut = resolve(root, "public/assets/effects");
const tilesOut = resolve(root, "public/assets/tiles");

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
    for (let px = x; px < x + w; px += 1) blendPixel(canvas, ox + px, oy + py, color);
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

function ellipse(canvas, cx, cy, rx, ry, color, ox = 0, oy = 0) {
  for (let y = -ry; y <= ry; y += 1) {
    for (let x = -rx; x <= rx; x += 1) {
      if ((x * x) / (rx * rx) + (y * y) / (ry * ry) <= 1) blendPixel(canvas, ox + cx + x, oy + cy + y, color);
    }
  }
}

function polygon(canvas, points, color, ox = 0, oy = 0) {
  const minY = Math.floor(Math.min(...points.map((p) => p[1])));
  const maxY = Math.ceil(Math.max(...points.map((p) => p[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const nodes = [];
    let j = points.length - 1;
    for (let i = 0; i < points.length; i += 1) {
      const pi = points[i];
      const pj = points[j];
      if ((pi[1] < y && pj[1] >= y) || (pj[1] < y && pi[1] >= y)) {
        nodes.push(Math.round(pi[0] + ((y - pi[1]) / (pj[1] - pi[1])) * (pj[0] - pi[0])));
      }
      j = i;
    }
    nodes.sort((a, b) => a - b);
    for (let i = 0; i < nodes.length; i += 2) {
      if (nodes[i + 1] === undefined) continue;
      for (let x = nodes[i]; x <= nodes[i + 1]; x += 1) blendPixel(canvas, ox + x, oy + y, color);
    }
  }
}

function diamond(canvas, cx, cy, hw, hh, color, ox = 0, oy = 0) {
  polygon(canvas, [[cx, cy - hh], [cx + hw, cy], [cx, cy + hh], [cx - hw, cy]], color, ox, oy);
}

const font = {
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01111", "10000", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["11111", "00100", "00100", "00100", "00100", "00100", "11111"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  0: ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  1: ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  2: ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  3: ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  4: ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  5: ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  6: ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  7: ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  8: ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  9: ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"]
};

function drawText(canvas, text, x, y, scale, color, shadow = rgba(38, 8, 8, 255), ox = 0, oy = 0) {
  const draw = (dx, dy, fill) => {
    let cursor = x;
    for (const ch of text) {
      const glyph = font[ch] ?? font[" "];
      glyph.forEach((row, gy) => {
        [...row].forEach((bit, gx) => {
          if (bit === "1") rect(canvas, cursor + gx * scale + dx, y + gy * scale + dy, scale, scale, fill, ox, oy);
        });
      });
      cursor += (ch === " " ? 4 : 6) * scale;
    }
  };
  draw(Math.max(1, Math.floor(scale / 3)), Math.max(1, Math.floor(scale / 3)), shadow);
  draw(0, 0, color);
}

function textWidth(text, scale) {
  return [...text].reduce((sum, ch) => sum + (ch === " " ? 4 : 6) * scale, 0);
}

function drawPanel(canvas, x, y, w, h, glow, ox = 0, oy = 0) {
  rect(canvas, x + 8, y + 8, w - 16, h - 16, rgba(17, 18, 19, 235), ox, oy);
  rect(canvas, x + 12, y + 12, w - 24, h - 24, rgba(31, 32, 32, 235), ox, oy);
  rect(canvas, x + 8, y, w - 16, 8, rgba(76, 62, 49, 255), ox, oy);
  rect(canvas, x + 8, y + h - 8, w - 16, 8, rgba(51, 42, 36, 255), ox, oy);
  rect(canvas, x, y + 8, 8, h - 16, rgba(62, 52, 44, 255), ox, oy);
  rect(canvas, x + w - 8, y + 8, 8, h - 16, rgba(28, 25, 24, 255), ox, oy);
  rect(canvas, x + 6, y + 6, 8, 8, glow, ox, oy);
  rect(canvas, x + w - 14, y + 6, 8, 8, glow, ox, oy);
  rect(canvas, x + 6, y + h - 14, 8, 8, rgba(119, 77, 55, 255), ox, oy);
  rect(canvas, x + w - 14, y + h - 14, 8, 8, rgba(119, 77, 55, 255), ox, oy);
}

function crc32(buffer) {
  let crc = ~0;
  for (const byte of buffer) {
    crc ^= byte;
    for (let i = 0; i < 8; i += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
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

function writePng(path, canvas) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, encodePng(canvas));
}

function drawLowWall(canvas, variant) {
  const top = variant === "vertical" ? rgba(101, 97, 82) : variant === "corner" ? rgba(115, 109, 92) : rgba(88, 86, 75);
  const leftFace = rgba(45, 44, 39);
  const rightFace = rgba(30, 31, 30);
  const mortar = rgba(17, 19, 18, 235);
  diamond(canvas, 48, 22, 32, 16, top);
  polygon(canvas, [[16, 22], [48, 38], [48, 58], [16, 42]], leftFace);
  polygon(canvas, [[80, 22], [48, 38], [48, 58], [80, 42]], rightFace);
  line(canvas, 16, 22, 48, 6, rgba(142, 135, 111), 0, 0, 2);
  line(canvas, 48, 6, 80, 22, rgba(71, 69, 61), 0, 0, 2);
  line(canvas, 16, 22, 48, 38, mortar, 0, 0, 1);
  line(canvas, 80, 22, 48, 38, mortar, 0, 0, 1);
  for (let i = 0; i < 5; i += 1) {
    line(canvas, 22 + i * 10, 19 - Math.floor(i / 2), 31 + i * 10, 24 + Math.floor(i / 2), rgba(50, 49, 43, 180));
  }
  for (let y = 30; y <= 53; y += 9) {
    line(canvas, 20, y, 48, y + 14, mortar);
    line(canvas, 76, y, 48, y + 14, mortar);
  }
  for (let x = 24; x <= 70; x += 12) {
    line(canvas, x, 26, x - 3, 46, rgba(18, 20, 19, 185));
  }
  rect(canvas, 45, 52, 6, 6, rgba(91, 65, 45, 255));
  if (variant === "corner") {
    rect(canvas, 43, 0, 10, 10, rgba(123, 118, 95));
    rect(canvas, 41, 8, 14, 9, rgba(73, 70, 61));
  }
}

function writeLowWalls() {
  mkdirSync(tilesOut, { recursive: true });
  ["dark", "vertical", "corner"].forEach((variant) => {
    const canvas = createCanvas(96, 64);
    drawLowWall(canvas, variant);
    writePng(resolve(tilesOut, `low_${variant}_wall.png`), canvas);
  });
}

function writeSparkles() {
  const frame = 64;
  const canvas = createCanvas(frame * 8, frame);
  for (let col = 0; col < 8; col += 1) {
    const ox = col * frame;
    const angle = (Math.PI * 2 * col) / 8;
    for (let i = 0; i < 9; i += 1) {
      const a = angle + (Math.PI * 2 * i) / 9;
      const r = 13 + ((i * 5 + col * 3) % 18);
      const x = 32 + Math.round(Math.cos(a) * r);
      const y = 32 + Math.round(Math.sin(a) * r * 0.74);
      const bright = i % 3 === 0 ? rgba(255, 245, 152, 230) : i % 3 === 1 ? rgba(137, 220, 255, 210) : rgba(255, 166, 242, 185);
      line(canvas, x - 2, y, x + 2, y, bright, ox);
      line(canvas, x, y - 2, x, y + 2, bright, ox);
      blendPixel(canvas, ox + x, y, rgba(255, 255, 255, 255));
    }
  }
  mkdirSync(effectsOut, { recursive: true });
  writePng(resolve(effectsOut, "haste-sparkle-sprite-sheet.png"), canvas);
  writeFileSync(resolve(effectsOut, "haste-sparkle-sprite-sheet.json"), `${JSON.stringify({ image: "/assets/effects/haste-sparkle-sprite-sheet.png", frameWidth: 64, frameHeight: 64, frames: 8, notes: "Looping star-mode sparkle ring for haste power-up." }, null, 2)}\n`);
}

function writeTitleSheet() {
  const fw = 640;
  const fh = 320;
  const canvas = createCanvas(fw * 4, fh);
  for (let col = 0; col < 4; col += 1) {
    const ox = col * fw;
    const pulse = col % 2 === 0 ? rgba(219, 37, 55, 255) : rgba(255, 195, 88, 255);
    drawPanel(canvas, 82, 54, 476, 190, pulse, ox);
    ellipse(canvas, 158, 149, 52, 22, rgba(170, 120, 39, 210), ox);
    ellipse(canvas, 482, 149, 52, 22, rgba(170, 120, 39, 210), ox);
    rect(canvas, 278, 76, 84, 44, rgba(47, 43, 38, 255), ox);
    rect(canvas, 286, 82, 68, 30, rgba(89, 27, 35, 255), ox);
    const title = "HOBGOBLIN";
    const title2 = "DUNGEON";
    drawText(canvas, title, (fw - textWidth(title, 7)) / 2, 126, 7, rgba(255, 225, 135), rgba(45, 9, 12), ox);
    drawText(canvas, title2, (fw - textWidth(title2, 6)) / 2, 190, 6, rgba(207, 221, 168), rgba(24, 42, 28), ox);
    rect(canvas, 174 + col * 3, 94, 6, 6, rgba(255, 236, 150, 210), ox);
    rect(canvas, 452 - col * 3, 88, 5, 5, rgba(255, 236, 150, 210), ox);
  }
  mkdirSync(uiOut, { recursive: true });
  writePng(resolve(uiOut, "start-title-sprite-sheet.png"), canvas);
  writeFileSync(resolve(uiOut, "start-title-sprite-sheet.json"), `${JSON.stringify({ image: "/assets/ui/start-title-sprite-sheet.png", frameWidth: fw, frameHeight: fh, frames: 4, text: "HOBGOBLIN DUNGEON" }, null, 2)}\n`);
}

function writeGameOverSheet() {
  const fw = 560;
  const fh = 260;
  const canvas = createCanvas(fw * 4, fh);
  for (let col = 0; col < 4; col += 1) {
    const ox = col * fw;
    drawPanel(canvas, 54, 44, 452, 154, col % 2 === 0 ? rgba(173, 23, 38) : rgba(116, 16, 25), ox);
    const text = "GAME OVER";
    drawText(canvas, text, (fw - textWidth(text, 10)) / 2, 104 + (col === 1 ? 1 : 0), 10, rgba(255, 207, 106), rgba(66, 7, 9), ox);
    rect(canvas, 176, 174, 208, 4, rgba(101, 27, 27, 220), ox);
  }
  mkdirSync(uiOut, { recursive: true });
  writePng(resolve(uiOut, "game-over-sprite-sheet.png"), canvas);
  writeFileSync(resolve(uiOut, "game-over-sprite-sheet.json"), `${JSON.stringify({ image: "/assets/ui/game-over-sprite-sheet.png", frameWidth: fw, frameHeight: fh, frames: 4, text: "GAME OVER" }, null, 2)}\n`);
}

function writeLifeMeterSheet() {
  const fw = 640;
  const fh = 240;
  const canvas = createCanvas(fw * 4, fh);
  for (let col = 0; col < 4; col += 1) {
    const ox = col * fw;
    drawPanel(canvas, 12, 28, 616, 184, col % 2 === 0 ? rgba(255, 72, 74) : rgba(255, 180, 88), ox);
    rect(canvas, 300, 44, 40, 52, rgba(44, 42, 38), ox);
    for (let i = 0; i < 3; i += 1) {
      const cx = [160, 322, 484][i];
      ellipse(canvas, cx, 150, 58, 48, rgba(11, 12, 13, 255), ox);
      ellipse(canvas, cx, 150, 44, 36, rgba(56, 43, 35, 255), ox);
      rect(canvas, cx - 28, 137, 56, 24, rgba(23, 22, 23, 255), ox);
      rect(canvas, cx - 8, 132, 16, 18, rgba(183, 22, 44, 190 + col * 10), ox);
    }
  }
  mkdirSync(uiOut, { recursive: true });
  writePng(resolve(uiOut, "life-meter-sprite-sheet.png"), canvas);
  writeFileSync(resolve(uiOut, "life-meter-sprite-sheet.json"), `${JSON.stringify({ image: "/assets/ui/life-meter-sprite-sheet.png", frameWidth: fw, frameHeight: fh, frames: 4 }, null, 2)}\n`);
}

function writeHudPanelSheet() {
  const fw = 224;
  const fh = 58;
  const canvas = createCanvas(fw * 4, fh * 2);
  for (let row = 0; row < 2; row += 1) {
    for (let col = 0; col < 4; col += 1) {
      const ox = col * fw;
      const oy = row * fh;
      drawPanel(canvas, 0, 0, fw, fh, row === 0 ? rgba(255, 221, 115) : rgba(255, 103, 66), ox, oy);
      const label = row === 0 ? "SCORE" : "AMMO";
      drawText(canvas, label, 14, 18, 3, row === 0 ? rgba(255, 226, 145) : rgba(255, 170, 103), rgba(40, 8, 8), ox, oy);
    }
  }
  mkdirSync(uiOut, { recursive: true });
  writePng(resolve(uiOut, "hud-panels-sprite-sheet.png"), canvas);
  writeFileSync(resolve(uiOut, "hud-panels-sprite-sheet.json"), `${JSON.stringify({ image: "/assets/ui/hud-panels-sprite-sheet.png", frameWidth: fw, frameHeight: fh, rows: ["score", "ammo"], framesPerRow: 4 }, null, 2)}\n`);
}

writeLowWalls();
writeSparkles();
writeTitleSheet();
writeGameOverSheet();
writeLifeMeterSheet();
writeHudPanelSheet();
