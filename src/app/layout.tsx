import type { Metadata } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : new URL(
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "http://localhost:3000"
    );

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
