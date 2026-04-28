import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = resolve(root, "public/assets/source/combat-juice-gpt-image-2-source.png");
const outPath = resolve(root, "public/assets/effects/combat-juice-sprite-sheet.png");
const metadataPath = resolve(root, "public/assets/effects/combat-juice-sprite-sheet.json");

const frameWidth = 64;
const frameHeight = 64;
const framesPerRow = 8;
const effectRows = ["hit", "deathPoof"];
const keyColor = { r: 255, g: 0, b: 255 };

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function keyToAlpha(raw) {
  for (let offset = 0; offset < raw.data.length; offset += 4) {
    const r = raw.data[offset];
    const g = raw.data[offset + 1];
    const b = raw.data[offset + 2];
    const keyDistance = Math.abs(r - keyColor.r) + Math.abs(g - keyColor.g) + Math.abs(b - keyColor.b);
    const magentaDominant = r > 150 && b > 150 && g < 120 && Math.abs(r - b) < 96;

    if (keyDistance < 150 || magentaDominant) {
      raw.data[offset + 3] = 0;
    } else {
      raw.data[offset + 3] = 255;
    }
  }
  return raw;
}

function alphaBounds(raw, minAlpha = 24) {
  let left = raw.width;
  let top = raw.height;
  let right = -1;
  let bottom = -1;

  for (let y = 0; y < raw.height; y += 1) {
    for (let x = 0; x < raw.width; x += 1) {
      const alpha = raw.data[(y * raw.width + x) * 4 + 3];
      if (alpha < minAlpha) {
        continue;
      }
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }

  if (right < left || bottom < top) {
    return { left: 0, top: 0, width: raw.width, height: raw.height };
  }

  return { left, top, width: right - left + 1, height: bottom - top + 1 };
}

function paddedBox(box, raw, pad) {
  const left = Math.max(0, box.left - pad);
  const top = Math.max(0, box.top - pad);
  const right = Math.min(raw.width, box.left + box.width + pad);
  const bottom = Math.min(raw.height, box.top + box.height + pad);
  return { left, top, width: right - left, height: bottom - top };
}

async function rawFromBuffer(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height, channels: 4 };
}

async function fitFrame(cellBuffer, row) {
  const raw = keyToAlpha(await rawFromBuffer(cellBuffer));
  const bounds = paddedBox(alphaBounds(raw), raw, row === 0 ? 4 : 7);
  const maxFillX = row === 0 ? 0.82 : 0.98;
  const maxFillY = row === 0 ? 0.82 : 0.92;
  const scale = Math.min((frameWidth * maxFillX) / bounds.width, (frameHeight * maxFillY) / bounds.height, 1);
  const resizedWidth = Math.max(1, Math.round(bounds.width * scale));
  const resizedHeight = Math.max(1, Math.round(bounds.height * scale));
  const left = Math.round((frameWidth - resizedWidth) / 2);
  const top = row === 0 ? Math.round((frameHeight - resizedHeight) / 2) : Math.round(frameHeight - resizedHeight - 3);

  const frame = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .extract(bounds)
    .resize(resizedWidth, resizedHeight, { kernel: "nearest" })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: frameWidth,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: frame, left, top: Math.max(0, Math.min(frameHeight - resizedHeight, top)) }])
    .png()
    .toBuffer();
}

async function main() {
  const source = sharp(sourcePath);
  const metadata = await source.metadata();
  const sourceFrameWidth = metadata.width / framesPerRow;
  const sourceFrameHeight = metadata.height / effectRows.length;
  const composites = [];
  const frames = {};
  const animations = {};

  for (let row = 0; row < effectRows.length; row += 1) {
    const effect = effectRows[row];
    const animationFrames = [];

    for (let col = 0; col < framesPerRow; col += 1) {
      const left = Math.round(col * sourceFrameWidth);
      const top = Math.round(row * sourceFrameHeight);
      const cell = await source
        .clone()
        .extract({
          left,
          top,
          width: Math.round((col + 1) * sourceFrameWidth) - left,
          height: Math.round((row + 1) * sourceFrameHeight) - top
        })
        .png()
        .toBuffer();
      const input = await fitFrame(cell, row);
      const frameName = `${effect}_${col.toString().padStart(2, "0")}`;

      frames[frameName] = { x: col * frameWidth, y: row * frameHeight, w: frameWidth, h: frameHeight };
      animationFrames.push(frameName);
      composites.push({ input, left: col * frameWidth, top: row * frameHeight });
    }

    animations[`combat-${effect}`] = { frames: animationFrames, frameRate: row === 0 ? 18 : 13, repeat: 0 };
  }

  ensureDir(outPath);
  await sharp({
    create: {
      width: frameWidth * framesPerRow,
      height: frameHeight * effectRows.length,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .png()
    .toFile(outPath);

  writeFileSync(
    metadataPath,
    `${JSON.stringify(
      {
        image: "/assets/effects/combat-juice-sprite-sheet.png",
        frameWidth,
        frameHeight,
        rows: effectRows,
        framesPerRow,
        frames,
        animations,
        source: "/assets/source/combat-juice-gpt-image-2-source.png",
        notes: "GPT-image-2 combat juice effects: hit impact row and death poof row, chroma-keyed and repacked into 64x64 Phaser-safe cells."
      },
      null,
      2
    )}\n`
  );
}

await main();
console.log("Processed combat juice sprites.");
