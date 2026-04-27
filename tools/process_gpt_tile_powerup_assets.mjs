import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import sharp from "sharp";

const root = process.cwd();
const sourceOut = resolve(root, "public/assets/source");
const tilesOut = resolve(root, "public/assets/tiles");
const effectsOut = resolve(root, "public/assets/effects");

const sources = {
  bridge: "/Users/frankguzzone/.codex/generated_images/019dc09f-5daf-7da3-890e-eba220edd0f4/ig_03c7d3eb3a28a8170169ed0fda3b748199b9096694cee8289b.png",
  walls: "/Users/frankguzzone/.codex/generated_images/019dc09f-5daf-7da3-890e-eba220edd0f4/ig_03c7d3eb3a28a8170169ed10156578819982424cfaaef7eba0.png",
  wallDirections: "/Users/frankguzzone/.codex/generated_images/019dc09f-5daf-7da3-890e-eba220edd0f4/ig_04f62fb8059e3a450169ed1ebbee38819aa5fc4deb0ec38e71.png",
  blast: "/Users/frankguzzone/.codex/generated_images/019dc09f-5daf-7da3-890e-eba220edd0f4/ig_03c7d3eb3a28a8170169ed11aa087c8199bdc419a2b44b766d.png"
};

function ensureDir(path) {
  mkdirSync(dirname(path), { recursive: true });
}

function copySources() {
  mkdirSync(sourceOut, { recursive: true });
  copyFileSync(sources.bridge, resolve(sourceOut, "gpt-bridge-source.png"));
  copyFileSync(sources.walls, resolve(sourceOut, "gpt-low-walls-source.png"));
  copyFileSync(sources.wallDirections, resolve(sourceOut, "gpt-low-wall-directions-source.png"));
  copyFileSync(sources.blast, resolve(sourceOut, "gpt-blast-powerup-source.png"));
}

async function keyedRaw(path) {
  const image = sharp(path).ensureAlpha();
  const metadata = await image.metadata();
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  for (let offset = 0; offset < data.length; offset += 4) {
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const magentaKey = r > 165 && b > 165 && g < 115 && Math.abs(r - b) < 88;
    const greenKey = g > 165 && r < 120 && b < 120;
    if (magentaKey || greenKey) {
      data[offset + 3] = 0;
      continue;
    }
    if (metadata.channels === 4) {
      data[offset + 3] = Math.max(data[offset + 3], 255);
    }
  }
  return { data, width: info.width, height: info.height, channels: 4 };
}

function componentBoxes(raw, minArea) {
  const { data, width, height } = raw;
  const visited = new Uint8Array(width * height);
  const boxes = [];
  const queue = new Int32Array(width * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const start = y * width + x;
      if (visited[start] || data[start * 4 + 3] < 20) {
        continue;
      }

      let head = 0;
      let tail = 0;
      let area = 0;
      let left = x;
      let right = x;
      let top = y;
      let bottom = y;
      visited[start] = 1;
      queue[tail] = start;
      tail += 1;

      while (head < tail) {
        const index = queue[head];
        head += 1;
        area += 1;
        const px = index % width;
        const py = Math.floor(index / width);
        left = Math.min(left, px);
        right = Math.max(right, px);
        top = Math.min(top, py);
        bottom = Math.max(bottom, py);

        const neighbors = [index - 1, index + 1, index - width, index + width];
        for (const next of neighbors) {
          if (next < 0 || next >= visited.length || visited[next]) {
            continue;
          }
          const nx = next % width;
          if ((next === index - 1 && nx > px) || (next === index + 1 && nx < px)) {
            continue;
          }
          if (data[next * 4 + 3] < 20) {
            continue;
          }
          visited[next] = 1;
          queue[tail] = next;
          tail += 1;
        }
      }

      if (area >= minArea) {
        boxes.push({ left, top, width: right - left + 1, height: bottom - top + 1, area });
      }
    }
  }

  return boxes;
}

function paddedBox(box, raw, pad) {
  const left = Math.max(0, box.left - pad);
  const top = Math.max(0, box.top - pad);
  const right = Math.min(raw.width, box.left + box.width + pad);
  const bottom = Math.min(raw.height, box.top + box.height + pad);
  return { left, top, width: right - left, height: bottom - top };
}

function centeredBox(box, widthRatio, heightRatio = 1, xBias = 0, yBias = 0) {
  const width = Math.max(1, Math.round(box.width * widthRatio));
  const height = Math.max(1, Math.round(box.height * heightRatio));
  const centerX = box.left + box.width / 2 + box.width * xBias;
  const centerY = box.top + box.height / 2 + box.height * yBias;
  return {
    left: Math.round(centerX - width / 2),
    top: Math.round(centerY - height / 2),
    width,
    height,
    area: width * height
  };
}

async function fitComponent(raw, box, outPath, outWidth, outHeight, options = {}) {
  const pad = options.pad ?? 10;
  const target = paddedBox(box, raw, pad);
  const scale = Math.min((outWidth * (options.maxFillX ?? 0.96)) / target.width, (outHeight * (options.maxFillY ?? 0.92)) / target.height);
  const resizedWidth = Math.max(1, Math.round(target.width * scale));
  const resizedHeight = Math.max(1, Math.round(target.height * scale));
  const left = Math.round((outWidth - resizedWidth) / 2 + (options.xOffset ?? 0));
  const top = Math.round(outHeight - resizedHeight + (options.yOffset ?? 0));
  const extracted = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .extract(target)
    .resize(resizedWidth, resizedHeight, { kernel: "nearest" })
    .modulate({ brightness: options.brightness ?? 1, saturation: options.saturation ?? 1 })
    .png()
    .toBuffer();

  ensureDir(outPath);
  await sharp({
    create: {
      width: outWidth,
      height: outHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: extracted, left, top: Math.max(0, Math.min(outHeight - resizedHeight, top)) }])
    .png()
    .toFile(outPath);
}

async function processBridge() {
  const raw = await keyedRaw(resolve(sourceOut, "gpt-bridge-source.png"));
  const box = componentBoxes(raw, 1200).sort((a, b) => b.area - a.area)[0];
  await fitComponent(raw, box, resolve(tilesOut, "wooden_bridge.png"), 96, 64, {
    pad: 16,
    maxFillX: 0.98,
    maxFillY: 0.86,
    yOffset: -1,
    brightness: 1.2,
    saturation: 1.08
  });
}

async function processWalls() {
  const raw = await keyedRaw(resolve(sourceOut, "gpt-low-walls-source.png"));
  const boxes = componentBoxes(raw, 1600)
    .sort((a, b) => b.area - a.area)
    .slice(0, 3)
    .sort((a, b) => a.left - b.left);

  const [longA, longB, corner] = boxes;
  await fitComponent(raw, longA, resolve(tilesOut, "low_dark_wall.png"), 96, 64, {
    pad: 14,
    maxFillX: 0.98,
    maxFillY: 0.86
  });
  await fitComponent(raw, longB, resolve(tilesOut, "low_vertical_wall.png"), 96, 64, {
    pad: 14,
    maxFillX: 0.98,
    maxFillY: 0.86
  });
  await fitComponent(raw, corner, resolve(tilesOut, "low_corner_wall.png"), 96, 64, {
    pad: 14,
    maxFillX: 0.98,
    maxFillY: 0.9
  });
}

async function processWallDirections() {
  const raw = await keyedRaw(resolve(sourceOut, "gpt-low-wall-directions-source.png"));
  const boxes = componentBoxes(raw, 1600)
    .sort((a, b) => b.area - a.area)
    .slice(0, 8);
  const rows = [
    boxes
      .filter((box) => box.top + box.height / 2 < raw.height / 2)
      .sort((a, b) => a.left - b.left),
    boxes
      .filter((box) => box.top + box.height / 2 >= raw.height / 2)
      .sort((a, b) => a.left - b.left)
  ];
  const names = [
    ["low_wall_north", "low_wall_south", "low_wall_east", "low_wall_west"],
    ["low_corner_ne", "low_corner_nw", "low_corner_se", "low_corner_sw"]
  ];

  for (let row = 0; row < rows.length; row += 1) {
    for (let col = 0; col < rows[row].length; col += 1) {
      const name = names[row][col];
      if (!name) {
        continue;
      }
      const sourceBox =
        row === 0
          ? centeredBox(rows[row][col], col < 2 ? 0.62 : 0.74, 1, 0, 0)
          : centeredBox(rows[row][col], 0.88, 0.96, 0, 0);
      await fitComponent(raw, sourceBox, resolve(tilesOut, `${name}.png`), 96, 64, {
        pad: row === 0 ? 4 : 8,
        maxFillX: row === 0 ? 0.96 : 0.9,
        maxFillY: 0.88,
        brightness: 1.04,
        saturation: 1.02
      });
    }
  }
}

async function fitToBuffer(raw, box, outWidth, outHeight, options = {}) {
  const pad = options.pad ?? 8;
  const target = paddedBox(box, raw, pad);
  const scale = Math.min((outWidth * (options.maxFillX ?? 0.9)) / target.width, (outHeight * (options.maxFillY ?? 0.9)) / target.height);
  const resizedWidth = Math.max(1, Math.round(target.width * scale));
  const resizedHeight = Math.max(1, Math.round(target.height * scale));
  const left = Math.round((outWidth - resizedWidth) / 2);
  const top = Math.round((outHeight - resizedHeight) / 2);
  const extracted = await sharp(raw.data, { raw: { width: raw.width, height: raw.height, channels: 4 } })
    .extract(target)
    .resize(resizedWidth, resizedHeight, { kernel: "nearest" })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: outWidth,
      height: outHeight,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: extracted, left, top }])
    .png()
    .toBuffer();
}

async function processBlastPowerUp() {
  const raw = await keyedRaw(resolve(sourceOut, "gpt-blast-powerup-source.png"));
  const boxes = componentBoxes(raw, 600)
    .sort((a, b) => b.area - a.area)
    .slice(0, 16);
  const midpoint = raw.height / 2;
  const pickupBoxes = boxes.filter((box) => box.top + box.height / 2 < midpoint).sort((a, b) => a.left - b.left).slice(0, 8);
  const blastBoxes = boxes.filter((box) => box.top + box.height / 2 >= midpoint).sort((a, b) => a.left - b.left).slice(0, 8);

  const existingPowerUps = await sharp(resolve(effectsOut, "powerups-sprite-sheet.png")).png().toBuffer();
  const pickupFrames = await Promise.all(pickupBoxes.map((box) => fitToBuffer(raw, box, 32, 32, { pad: 8, maxFillX: 0.92, maxFillY: 0.92 })));
  const pickupComposites = pickupFrames.map((input, index) => ({ input, left: index * 32, top: 96 }));
  await sharp({
    create: {
      width: 256,
      height: 128,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([{ input: existingPowerUps, left: 0, top: 0 }, ...pickupComposites])
    .png()
    .toFile(resolve(effectsOut, "powerups-sprite-sheet.png"));

  const frames = {};
  const animations = {};
  ["quickshot", "haste", "ward", "blast"].forEach((name, row) => {
    animations[`powerup-${name}`] = { frames: [], frameRate: 10, repeat: -1 };
    for (let frame = 0; frame < 8; frame += 1) {
      const frameName = `${name}_${frame.toString().padStart(2, "0")}`;
      frames[frameName] = {
        x: frame * 32,
        y: row * 32,
        w: 32,
        h: 32
      };
      animations[`powerup-${name}`].frames.push(frameName);
    }
  });
  writeFileSync(
    resolve(effectsOut, "powerups-sprite-sheet.json"),
    `${JSON.stringify(
      {
        image: "/assets/effects/powerups-sprite-sheet.png",
        frameWidth: 32,
        frameHeight: 32,
        frames,
        animations,
        notes: "Power-up spritesheet: quickshot, haste, ward, and rare blast rows. Blast row is generated from gpt-image-2 source art."
      },
      null,
      2
    )}\n`
  );

  const blastFrames = await Promise.all(blastBoxes.map((box) => fitToBuffer(raw, box, 64, 64, { pad: 12, maxFillX: 0.96, maxFillY: 0.96 })));
  const blastComposites = blastFrames.map((input, index) => ({ input, left: index * 64, top: 0 }));
  await sharp({
    create: {
      width: 512,
      height: 64,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite(blastComposites)
    .png()
    .toFile(resolve(effectsOut, "blast-sprite-sheet.png"));

  writeFileSync(
    resolve(effectsOut, "blast-sprite-sheet.json"),
    `${JSON.stringify(
      {
        image: "/assets/effects/blast-sprite-sheet.png",
        frameWidth: 64,
        frameHeight: 64,
        animations: {
          "blast-impact": {
            frames: Array.from({ length: 8 }, (_, frame) => frame),
            frameRate: 16,
            repeat: 0
          }
        }
      },
      null,
      2
    )}\n`
  );
}

copySources();
await processBridge();
await processWalls();
await processWallDirections();
await processBlastPowerUp();
console.log("Processed GPT bridge, wall, and blast power-up assets.");
