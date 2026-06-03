import { readFileSync } from "node:fs";
import { join } from "node:path";

const indexHtmlPath = join(process.cwd(), ".next/server/app/index.html");
const indexHtml = readFileSync(indexHtmlPath, "utf8");

const socialImageMetaTagPattern =
  /<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'])(?=[^>]*content=["']([^"']+)["'])[^>]*>/g;
const localHostnames = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
const shareImagePath = "/opengraph-image.png";
const socialImageUrls = [...indexHtml.matchAll(socialImageMetaTagPattern)].map(
  (match) => match[1]
);

if (socialImageUrls.length === 0) {
  throw new Error("Production metadata is missing social share image tags.");
}

for (const imageUrl of socialImageUrls) {
  let parsedImageUrl;
  try {
    parsedImageUrl = new URL(imageUrl);
  } catch {
    throw new Error(`Production metadata share image is not an absolute URL: ${imageUrl}`);
  }

  if (localHostnames.has(parsedImageUrl.hostname)) {
    throw new Error(`Production metadata contains local share image URL: ${imageUrl}`);
  }
}

if (!indexHtml.includes(shareImagePath)) {
  throw new Error(`Production metadata is missing ${shareImagePath}`);
}

console.log("Built metadata social share image URLs are absolute and non-local.");
