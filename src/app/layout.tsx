import type { Metadata } from "next";
import "./globals.css";

const DEFAULT_SITE_URL = "http://localhost:3000";

const normalizeSiteUrl = (value?: string) => {
  const trimmedValue = value?.trim();
  if (!trimmedValue) {
    return undefined;
  }

  const hasHttpScheme = /^https?:\/\//i.test(trimmedValue);
  const hasExplicitScheme = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue);
  const isHostWithPort = /^[^/:?#]+:\d+(?:[/?#]|$)/.test(trimmedValue);
  if (hasExplicitScheme && !hasHttpScheme && !isHostWithPort) {
    return undefined;
  }

  const urlValue = hasHttpScheme ? trimmedValue : `https://${trimmedValue}`;

  try {
    const parsedUrl = new URL(urlValue);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:"
      ? parsedUrl
      : undefined;
  } catch {
    return undefined;
  }
};

const siteUrl =
  normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  normalizeSiteUrl(process.env.VERCEL_URL) ??
  new URL(DEFAULT_SITE_URL);

const title = "Hobgoblin Ruin Prototype";
const description = "A dark GBA-inspired isometric dungeon prototype.";
const shareImage = {
  url: "/opengraph-image.png",
  width: 1360,
  height: 752,
  alt: "Hobgoblin key art with a winged hero holding a staff in a gothic dungeon."
};

export const metadata: Metadata = {
  metadataBase: siteUrl,
  title,
  description,
  openGraph: {
    title,
    description,
    images: [shareImage],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage]
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
