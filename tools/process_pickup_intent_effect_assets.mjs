import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = resolve(root, "public/assets/source/pickup-intent-effects-gpt-image-2-source.png");
const outPath = resolve(root, "public/assets/effects/pickup-intent-effects-sprite-sheet.png");
const metadataPath = resolve(root, "public/assets/effects/pickup-intent-effects-sprite-sheet.json");

const frameSize = 64;
const columns = 8;
const effectRows = ["haste_afterimage", "burst_charge", "seeker_orbit"];

async function keyedRaw(path) {
  const image = sharp(path).ensureAlpha();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const isGreenKey = g > 120 && g - Math.max(r, b) > 45 && r < 150 && b < 150;
    if (isGreenKey) {
      data[offset] = 0;
      data[offset + 1] = 0;
      data[offset + 2] = 0;
      data[offset + 3] = 0;
    }
  }
  return { data, width: info.width, height: info.height, channels: 4 };
}

function alphaAt(raw, x, y) {
  return raw.data[(y * raw.width + x) * 4 + 3];
}

function rowBands(raw) {
  const bands = [];
  let inBand = false;
  let start = 0;

  for (let y = 0; y < raw.height; y += 1) {
    let count = 0;
    for (let x = 0; x < raw.width; x += 1) {
      if (alphaAt(raw, x, y) > 12) {
        count += 1;
      }
    }

    if (count > 18 && !inBand) {
      inBand = true;
      start = y;
    } else if (count <= 18 && inBand) {
      inBand = false;
      if (y - start > 28) {
        bands.push({ top: start, bottom: y - 1 });
      }
    }
  }

  if (inBand) {
    bands.push({ top: start, bottom: raw.height - 1 });
  }

  return bands
    .sort((a, b) => b.bottom - b.top - (a.bottom - a.top))
    .slice(0, effectRows.length)
    .sort((a, b) => a.top - b.top);
}

function contentBounds(raw, band) {
  let left = raw.width;
  let right = 0;
  let top = raw.height;
  let bottom = 0;

  for (let y = band.top; y <= band.bottom; y += 1) {
    for (let x = 0; x < raw.width; x += 1) {
      if (alphaAt(raw, x, y) <= 12) {
        continue;
      }
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
  }

  return { left, right, top, bottom };
}

function cellBox(raw, bounds, index) {
  const cellWidth = (bounds.right - bounds.left + 1) / columns;
  const centerX = bounds.left + cellWidth * (index + 0.5);
  const centerY = (bounds.top + bounds.bottom) / 2;
  const size = Math.max(cellWidth * 0.96, bounds.bottom - bounds.top + 28);
  const left = Math.max(0, Math.round(centerX - size / 2));
  const top = Math.max(0, Math.round(centerY - size / 2));
  return {
    left,
    top,
    width: Math.min(raw.width - left, Math.round(size)),
    height: Math.min(raw.height - top, Math.round(size))
  };
}

async function fitFrame(raw, box, rowIndex) {
  const extracted = await sharp(raw.data, {
    raw: { width: raw.width, height: raw.height, channels: 4 }
  })
    .extract(box)
    .resize(frameSize, frameSize, { kernel: "nearest", fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .modulate({ brightness: rowIndex === 0 ? 1.08 : 1, saturation: rowIndex === 0 ? 1.06 : 1 })
    .png()
    .toBuffer();

  return extracted;
}

const raw = await keyedRaw(sourcePath);
const bands = rowBands(raw);
if (bands.length !== effectRows.length) {
  throw new Error(`Expected ${effectRows.length} source rows, found ${bands.length}.`);
}

const frames = {};
const animations = {};
const composites = [];

for (let row = 0; row < bands.length; row += 1) {
  const bounds = contentBounds(raw, bands[row]);
  animations[effectRows[row]] = {
    frames: [],
    frameRate: row === 1 ? 15 : 12,
    repeat: -1
  };

  for (let col = 0; col < columns; col += 1) {
    const frameName = `${effectRows[row]}_${String(col).padStart(2, "0")}`;
    const input = await fitFrame(raw, cellBox(raw, bounds, col), row);
    composites.push({ input, left: col * frameSize, top: row * frameSize });
    frames[frameName] = { x: col * frameSize, y: row * frameSize, w: frameSize, h: frameSize };
    animations[effectRows[row]].frames.push(frameName);
  }
}

await sharp({
  create: {
    width: columns * frameSize,
    height: effectRows.length * frameSize,
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
      image: "/assets/effects/pickup-intent-effects-sprite-sheet.png",
      source: "/assets/source/pickup-intent-effects-gpt-image-2-source.png",
      frameWidth: frameSize,
      frameHeight: frameSize,
      frames,
      animations,
      notes: "Intentional pickup VFX: haste afterimages, burst arrow charge, and orbiting seeking-arrow pips from gpt-image-2 source art."
    },
    null,
    2
  )}\n`
);

console.log("Processed intentional pickup effect sprites.");
