import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const manifestPath = join(process.cwd(), "src/game/assets/manifest.ts");
const manifestSource = readFileSync(manifestPath, "utf8");
const assetPaths = [...manifestSource.matchAll(/"(?<path>\/assets\/[^"]+\.(?:json|png|wav))"/g)]
  .map((match) => match.groups.path)
  .filter((path, index, paths) => paths.indexOf(path) === index)
  .sort();

const missingPaths = assetPaths.filter((assetPath) => !existsSync(join(process.cwd(), "public", assetPath)));

if (missingPaths.length > 0) {
  console.error(`Missing ${missingPaths.length} manifest asset(s):`);
  for (const assetPath of missingPaths) {
    console.error(`- ${assetPath}`);
  }
  process.exit(1);
}

console.log(`Validated ${assetPaths.length} manifest asset(s).`);
