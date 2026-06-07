import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const appOutputDir = path.join(process.cwd(), ".next", "server", "app");
const shareImagePath = "/opengraph-image.png";
const localhostShareImagePattern =
  /https?:\/\/localhost(?::\d+)?\/opengraph-image\.png/;

const walkFiles = (directory) => {
  return readdirSync(directory).flatMap((entry) => {
    const entryPath = path.join(directory, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return walkFiles(entryPath);
    }

    return [entryPath];
  });
};

if (!existsSync(appOutputDir)) {
  throw new Error(
    "Next app output was not found. Run `npm run build` before verifying metadata."
  );
}

const htmlFiles = walkFiles(appOutputDir).filter((filePath) =>
  filePath.endsWith(".html")
);
const metadataHtml = htmlFiles
  .map((filePath) => readFileSync(filePath, "utf8"))
  .filter((contents) => contents.includes(shareImagePath));
const combinedMetadataHtml = metadataHtml.join("\n");

if (metadataHtml.length === 0) {
  throw new Error("No built HTML contained the OpenGraph share image metadata.");
}

if (localhostShareImagePattern.test(combinedMetadataHtml)) {
  throw new Error("Production metadata must not use localhost share image URLs.");
}

const expectedMetadataOrigin = process.env.EXPECTED_METADATA_ORIGIN;

if (expectedMetadataOrigin) {
  const expectedShareImageUrl = new URL(shareImagePath, expectedMetadataOrigin);

  if (!combinedMetadataHtml.includes(expectedShareImageUrl.toString())) {
    throw new Error(
      `Expected built metadata to include ${expectedShareImageUrl.toString()}.`
    );
  }
}

console.log(
  `Verified ${metadataHtml.length} HTML file(s) with non-localhost share image metadata.`
);
