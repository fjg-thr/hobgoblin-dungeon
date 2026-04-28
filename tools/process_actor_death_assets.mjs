import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourcePath = resolve(root, "public/assets/source/actor-deaths-gpt-image-2-source.png");
const hobgoblinSheetPath = resolve(root, "public/assets/characters/hobgoblin-sprite-sheet.png");
const outPath = resolve(root, "public/assets/characters/actor-deaths-sprite-sheet.png");
const metadataPath = resolve(root, "public/assets/characters/actor-deaths-sprite-sheet.json");

const actors = ["hobgoblin", "goblin", "brute"];
const frameWidth = 64;
const frameHeight = 64;
const framesPerRow = 8;
const sourceRows = actors.length;
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

async function fitFrame(cellBuffer, actorIndex) {
  const raw = keyToAlpha(await rawFromBuffer(cellBuffer));
  const bounds = paddedBox(alphaBounds(raw), raw, 4);
  const maxFillX = actorIndex === 2 ? 0.98 : 0.92;
  const maxFillY = actorIndex === 2 ? 0.9 : 0.92;
  const scale = Math.min((frameWidth * maxFillX) / bounds.width, (frameHeight * maxFillY) / bounds.height);
  const resizedWidth = Math.max(1, Math.round(bounds.width * scale));
  const resizedHeight = Math.max(1, Math.round(bounds.height * scale));
  const left = Math.round((frameWidth - resizedWidth) / 2);
  const top = Math.round(frameHeight - resizedHeight - 3);

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

async function extractHeroPose(frameIndex) {
  const frame = await sharp(hobgoblinSheetPath)
    .extract({
      left: frameIndex * frameWidth,
      top: 0,
      width: frameWidth,
      height: frameHeight
    })
    .png()
    .toBuffer();
  const raw = await rawFromBuffer(frame);
  const bounds = paddedBox(alphaBounds(raw, 8), raw, 1);

  return sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .extract(bounds)
    .png()
    .toBuffer();
}

async function makeHeroDeathFrame(col) {
  const specs = [
    { pose: 0, rotate: 0, scale: 1, left: 5, bottom: 3, tint: 1 },
    { pose: 1, rotate: -6, scale: 1, left: 4, bottom: 3, tint: 0.98 },
    { pose: 2, rotate: -18, scale: 0.98, left: 4, bottom: 2, tint: 0.94 },
    { pose: 4, rotate: -34, scale: 0.97, left: 7, bottom: 1, tint: 0.88 },
    { pose: 5, rotate: -55, scale: 0.95, left: 12, bottom: 0, tint: 0.82 },
    { pose: 6, rotate: -73, scale: 0.93, left: 15, bottom: 0, tint: 0.76 },
    { pose: 7, rotate: -84, scale: 0.9, left: 16, bottom: 0, tint: 0.68 },
    { pose: 0, rotate: -90, scale: 0.88, left: 18, bottom: 0, tint: 0.6 }
  ];
  const spec = specs[col];
  const pose = await extractHeroPose(spec.pose);
  const transformed = await sharp(pose)
    .rotate(spec.rotate, { background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .resize({
      width: Math.round(frameWidth * spec.scale),
      height: Math.round(frameHeight * spec.scale),
      fit: "inside",
      kernel: "nearest",
      withoutEnlargement: true
    })
    .modulate({ brightness: spec.tint, saturation: spec.tint })
    .png()
    .toBuffer();
  const transformedMetadata = await sharp(transformed).metadata();
  const left = Math.min(frameWidth - transformedMetadata.width, spec.left);
  const top = frameHeight - transformedMetadata.height - spec.bottom;
  const dust = await makeHeroDust(col);

  return sharp({
    create: {
      width: frameWidth,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: dust, left: 0, top: 0 },
      { input: transformed, left: Math.max(0, left), top: Math.max(0, top) }
    ])
    .png()
    .toBuffer();
}

async function makeHeroDust(col) {
  const dustPixels = [
    [
      [18, 57, 107, 73, 42, 120],
      [43, 58, 202, 154, 72, 110]
    ],
    [
      [15, 58, 107, 73, 42, 130],
      [45, 57, 202, 154, 72, 125],
      [48, 54, 238, 201, 103, 95]
    ],
    [
      [12, 58, 107, 73, 42, 145],
      [48, 57, 202, 154, 72, 135],
      [51, 53, 238, 201, 103, 110]
    ],
    [
      [10, 59, 107, 73, 42, 155],
      [51, 58, 202, 154, 72, 150],
      [54, 52, 238, 201, 103, 120]
    ]
  ][Math.min(3, Math.max(0, col - 3))] ?? [];
  const composites = dustPixels.map(([x, y, r, g, b, alpha]) => ({
    input: Buffer.from([r, g, b, alpha]),
    raw: { width: 1, height: 1, channels: 4 },
    left: x,
    top: y
  }));

  return sharp({
    create: {
      width: frameWidth,
      height: frameHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(composites)
    .png()
    .toBuffer();
}

async function main() {
  const source = sharp(sourcePath);
  const metadata = await source.metadata();
  const sourceFrameWidth = metadata.width / framesPerRow;
  const sourceFrameHeight = metadata.height / sourceRows;
  const composites = [];
  const frames = {};
  const animations = {};

  for (let row = 0; row < sourceRows; row += 1) {
    const actor = actors[row];
    const animationFrames = [];

    for (let col = 0; col < framesPerRow; col += 1) {
      const input =
        actor === "hobgoblin"
          ? await makeHeroDeathFrame(col)
          : await fitFrame(
              await source
                .clone()
                .extract({
                  left: Math.round(col * sourceFrameWidth),
                  top: Math.round(row * sourceFrameHeight),
                  width: Math.round((col + 1) * sourceFrameWidth) - Math.round(col * sourceFrameWidth),
                  height: Math.round((row + 1) * sourceFrameHeight) - Math.round(row * sourceFrameHeight)
                })
                .png()
                .toBuffer(),
              row
            );
      const frameName = `${actor}_${col.toString().padStart(2, "0")}`;

      frames[frameName] = { x: col * frameWidth, y: row * frameHeight, w: frameWidth, h: frameHeight };
      animationFrames.push(frameName);
      composites.push({ input, left: col * frameWidth, top: row * frameHeight });
    }

    animations[`death-${actor}`] = { frames: animationFrames, frameRate: 12, repeat: 0 };
  }

  ensureDir(outPath);
  await sharp({
    create: {
      width: frameWidth * framesPerRow,
      height: frameHeight * sourceRows,
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
        image: "/assets/characters/actor-deaths-sprite-sheet.png",
        frameWidth,
        frameHeight,
        actors,
        framesPerRow,
        frames,
        animations,
        source: "/assets/source/actor-deaths-gpt-image-2-source.png",
        notes: "GPT-image-2 goblin and brute death rows are repacked from a 3x8 chroma-key source. The hobgoblin hero row is derived from the existing player sprite sheet so the death animation preserves the main character silhouette."
      },
      null,
      2
    )}\n`
  );
}

await main();
console.log("Processed actor death sprites.");
