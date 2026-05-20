import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPath = resolve(root, "src/game/assets/manifest.ts");
const manifestSource = readFileSync(manifestPath, "utf8");
const sourceFile = ts.createSourceFile(
  manifestPath,
  manifestSource,
  ts.ScriptTarget.Latest,
  true,
  ts.ScriptKind.TS
);

const assetPaths = new Set();

const collectAssetPaths = (node) => {
  if (ts.isStringLiteralLike(node) && node.text.startsWith("/assets/")) {
    assetPaths.add(node.text);
  }

  ts.forEachChild(node, collectAssetPaths);
};

collectAssetPaths(sourceFile);

const missingAssets = [...assetPaths]
  .sort()
  .filter((assetPath) => !existsSync(resolve(root, "public", assetPath.slice(1))));

if (missingAssets.length > 0) {
  console.error("Missing files referenced by src/game/assets/manifest.ts:");
  for (const assetPath of missingAssets) {
    console.error(`- public${assetPath}`);
  }
  process.exit(1);
}

console.log(`Verified ${assetPaths.size} asset manifest references.`);
