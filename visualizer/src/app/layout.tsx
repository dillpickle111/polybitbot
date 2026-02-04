import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { SiteCommandPalette } from "@/components/site-command-palette";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Signal — Decision intelligence for probabilistic markets",
    template: "%s | Signal",
  },
  description: "Robust edge scoring that survives uncertainty, time feasibility, and execution cost.",
  openGraph: {
    title: "Signal — Decision intelligence for probabilistic markets",
    description: "Robust edge scoring that survives uncertainty, time feasibility, and execution cost.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Signal" }],
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
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={`font-sans antialiased`}>
        {children}
        <SiteCommandPalette />
      </body>
    </html>
  );
}
