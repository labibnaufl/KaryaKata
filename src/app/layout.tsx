import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import "./globals.css";

/**
 * Body font - using Inter (replace with Open Sauce when available)
 * Inter is a clean, readable sans-serif similar to Open Sauce
 */
const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

/**
 * Heading font - using Playfair Display (replace with Peace Sans when available)
 * Playfair Display is an elegant serif suitable for headings
 */
const headingFont = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Karya Kata. - Platform Artikel",
    template: "%s | Karya Kata.",
  },
  description:
    "Platform artikel modern dengan sistem engagement lengkap. Baca, tulis, dan berinteraksi dengan komunitas pembaca.",
  keywords: ["artikel", "blog", "platform", "indonesia", "baca", "tulis"],
  authors: [{ name: "Karya Kata. Team" }],
  openGraph: {
    title: "Karya Kata. - Platform Artikel",
    description: "Platform artikel modern dengan sistem engagement lengkap",
    type: "website",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${bodyFont.variable} ${headingFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-body">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
