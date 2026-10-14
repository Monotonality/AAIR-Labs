import type { Metadata } from "next";
import { Geist_Mono, Instrument_Serif, Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const mono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const siteDescription =
  "Applied AI Research Labs at UT Dallas: student research, member portfolios, events, and the public paper library.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "AAIR Labs at UTD",
    template: "%s · AAIR Labs",
  },
  description: siteDescription,
  applicationName: "AAIR Labs",
  openGraph: {
    type: "website",
    siteName: "AAIR Labs",
    title: "AAIR Labs at UTD",
    description: siteDescription,
    url: "/",
    images: [
      {
        url: "/aair-namesake-logo-full.jpg",
        width: 4000,
        height: 2333,
        alt: "AAIR Labs at UT Dallas",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AAIR Labs at UTD",
    description: siteDescription,
    images: ["/aair-namesake-logo-full.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${serif.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}