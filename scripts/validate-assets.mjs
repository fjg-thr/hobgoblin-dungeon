import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const filesToScan = [
  "src/game/assets/manifest.ts",
  "src/app/layout.tsx"
];

const publicAssetPattern = /["'`]\/(?:assets\/[^"'`]+|opengraph-image\.png)["'`]/g;
const assets = new Set();

filesToScan.forEach((file) => {
  const source = readFileSync(resolve(root, file), "utf8");
  for (const match of source.matchAll(publicAssetPattern)) {
    assets.add(match[0].slice(1, -1));
  }
});

const missing = [...assets]
  .map((asset) => ({
    publicPath: asset,
    filePath: resolve(root, "public", asset.replace(/^\//, ""))
  }))
  .filter(({ filePath }) => !existsSync(filePath));

if (missing.length > 0) {
  console.error("Missing public assets referenced by source files:");
  missing.forEach(({ publicPath }) => console.error(`- ${publicPath}`));
  process.exit(1);
}

console.log(`Validated ${assets.size} public assets.`);
