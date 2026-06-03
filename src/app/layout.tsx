import type { Metadata } from "next";
import "./globals.css";

const defaultSiteUrl = "https://hobgoblin-dungeon.vercel.app";
const configuredSiteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  process.env.URL ||
  defaultSiteUrl;
const normalizedSiteUrl = configuredSiteUrl.startsWith("http")
  ? configuredSiteUrl
  : `https://${configuredSiteUrl}`;
const siteUrl = new URL(normalizedSiteUrl);

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
