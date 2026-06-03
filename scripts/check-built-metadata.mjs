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

const isIPv4Loopback = (address) => isIP(address) === 4 && address.startsWith("127.");

const isIPv4MappedLoopback = (address) => {
  const mappedPrefix = "::ffff:";

  if (!address.startsWith(mappedPrefix)) {
    return false;
  }

  const mappedAddress = address.slice(mappedPrefix.length);
  if (isIPv4Loopback(mappedAddress)) {
    return true;
  }

  const mappedHextets = mappedAddress.split(":");
  if (mappedHextets.length !== 2) {
    return false;
  }

  const highBits = Number.parseInt(mappedHextets[0], 16);
  const lowBits = Number.parseInt(mappedHextets[1], 16);
  const isValidMappedAddress =
    Number.isInteger(highBits) &&
    Number.isInteger(lowBits) &&
    highBits >= 0 &&
    highBits <= 0xffff &&
    lowBits >= 0 &&
    lowBits <= 0xffff;

  return isValidMappedAddress && highBits >> 8 === 127;
};

const isLoopbackHostname = (hostname) => {
  const normalizedHostname = hostname
    .toLowerCase()
    .replace(/^\[(.*)\]$/, "$1")
    .replace(/\.+$/, "");

  if (normalizedHostname === "localhost" || normalizedHostname.endsWith(".localhost")) {
    return true;
  }

  if (normalizedHostname === "::1") {
    return true;
  }

  return isIPv4Loopback(normalizedHostname) || isIPv4MappedLoopback(normalizedHostname);
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
