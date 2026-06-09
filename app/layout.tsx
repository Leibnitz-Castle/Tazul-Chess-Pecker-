import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
// Lichess PGN Viewer CSS — GPL-3.0-or-later — @lichess-org/pgn-viewer v2.6.0
// Copied locally because the package exports field blocks direct CSS resolution in Next.js.
// Re-copy from node_modules after package upgrades.
import "./lichess-pgn-viewer.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Pecker Chess Platform",
  description: "Woodpecker Method training — spaced-repetition tactics for serious players.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
