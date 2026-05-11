import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { assetManifest } from "../../src/game/assets/manifest";

interface ManifestAsset {
  label: string;
  path?: string;
  metadataPath?: string;
  frameWidth?: number;
  frameHeight?: number;
}

interface SpriteMetadata {
  image?: string;
  frameWidth?: number;
  frameHeight?: number;
  frames?: Record<string, { w: number; h: number }>;
}

const publicPath = (assetPath: string): string => join(process.cwd(), "public", assetPath.replace(/^\//, ""));

const pngDimensions = (assetPath: string): { width: number; height: number } => {
  const data = readFileSync(publicPath(assetPath));

  assert.equal(data.subarray(1, 4).toString("ascii"), "PNG", `${assetPath} is a PNG`);

  return {
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20)
  };
};

const collectAssets = (value: unknown, label: string): ManifestAsset[] => {
  if (!value || typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const current =
    typeof record.path === "string" || typeof record.metadataPath === "string"
      ? [
          {
            label,
            path: typeof record.path === "string" ? record.path : undefined,
            metadataPath: typeof record.metadataPath === "string" ? record.metadataPath : undefined,
            frameWidth: typeof record.frameWidth === "number" ? record.frameWidth : undefined,
            frameHeight: typeof record.frameHeight === "number" ? record.frameHeight : undefined
          }
        ]
      : [];

  return Object.entries(record).reduce<ManifestAsset[]>((assets, [key, child]) => {
    if (typeof child === "string" && child.startsWith("/assets/")) {
      assets.push({ label: `${label}.${key}`, path: child });
      return assets;
    }

    assets.push(...collectAssets(child, `${label}.${key}`));
    return assets;
  }, current);
};

test("asset manifest points at files that exist under public", () => {
  const assets = collectAssets(assetManifest, "assetManifest");

  assert.ok(assets.length > 0, "manifest exposes assets");

  assets.forEach((asset) => {
    if (asset.path) {
      assert.ok(existsSync(publicPath(asset.path)), `${asset.label} path exists: ${asset.path}`);
    }

    if (asset.metadataPath) {
      assert.ok(existsSync(publicPath(asset.metadataPath)), `${asset.label} metadata exists: ${asset.metadataPath}`);
    }
  });
});

test("sprite frame dimensions match manifest and metadata", () => {
  const spriteAssets = collectAssets(assetManifest, "assetManifest").filter(
    (asset) => asset.path?.endsWith(".png") && asset.frameWidth && asset.frameHeight
  );

  assert.ok(spriteAssets.length > 0, "manifest exposes sprite sheets");

  spriteAssets.forEach((asset) => {
    assert.ok(asset.path);
    assert.ok(asset.frameWidth);
    assert.ok(asset.frameHeight);

    const dimensions = pngDimensions(asset.path);
    assert.equal(dimensions.width % asset.frameWidth, 0, `${asset.label} width aligns to frame width`);
    assert.equal(dimensions.height % asset.frameHeight, 0, `${asset.label} height aligns to frame height`);

    if (!asset.metadataPath) {
      return;
    }

    const metadata = JSON.parse(readFileSync(publicPath(asset.metadataPath), "utf8")) as SpriteMetadata;

    assert.equal(metadata.image, asset.path, `${asset.label} metadata references the manifest image`);
    assert.equal(metadata.frameWidth, asset.frameWidth, `${asset.label} metadata frame width matches`);
    assert.equal(metadata.frameHeight, asset.frameHeight, `${asset.label} metadata frame height matches`);

    Object.entries(metadata.frames ?? {}).forEach(([frameName, frame]) => {
      assert.equal(frame.w, asset.frameWidth, `${asset.label}.${frameName} width matches`);
      assert.equal(frame.h, asset.frameHeight, `${asset.label}.${frameName} height matches`);
    });
  });
});
