import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hobgoblin Ruin Prototype",
  description: "A dark GBA-inspired isometric dungeon prototype."
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
