import { readFileSync } from "node:fs";
import { isIP } from "node:net";
import { join } from "node:path";

const indexHtmlPath = join(process.cwd(), ".next/server/app/index.html");
const indexHtml = readFileSync(indexHtmlPath, "utf8");

const socialImageMetaTagPattern =
  /<meta\b(?=[^>]*(?:property|name)=["'](?:og:image|twitter:image)["'])(?=[^>]*content=["']([^"']+)["'])[^>]*>/g;
const shareImagePath = "/opengraph-image.png";
const socialImageUrls = [...indexHtml.matchAll(socialImageMetaTagPattern)].map(
  (match) => match[1]
);

const isLoopbackHostname = (hostname) => {
  const normalizedHostname = hostname.toLowerCase().replace(/^\[(.*)\]$/, "$1");

  if (normalizedHostname === "localhost" || normalizedHostname.endsWith(".localhost")) {
    return true;
  }

  if (normalizedHostname === "::1") {
    return true;
  }

  if (isIP(normalizedHostname) === 4) {
    return normalizedHostname.startsWith("127.");
  }

  return normalizedHostname.startsWith("::ffff:127.");
};

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

  if (isLoopbackHostname(parsedImageUrl.hostname)) {
    throw new Error(`Production metadata contains local share image URL: ${imageUrl}`);
  }
}

if (!indexHtml.includes(shareImagePath)) {
  throw new Error(`Production metadata is missing ${shareImagePath}`);
}

console.log("Built metadata social share image URLs are absolute and non-local.");
