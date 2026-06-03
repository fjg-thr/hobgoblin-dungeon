import { readFileSync } from "node:fs";
import { join } from "node:path";

const indexHtmlPath = join(process.cwd(), ".next/server/app/index.html");
const indexHtml = readFileSync(indexHtmlPath, "utf8");

const localShareImageUrl = "http://localhost:3000/opengraph-image.png";

if (indexHtml.includes(localShareImageUrl)) {
  throw new Error(`Production metadata contains local share image URL: ${localShareImageUrl}`);
}

const shareImagePath = "/opengraph-image.png";

if (!indexHtml.includes(shareImagePath)) {
  throw new Error(`Production metadata is missing ${shareImagePath}`);
}

console.log("Built metadata does not contain localhost share image URLs.");
