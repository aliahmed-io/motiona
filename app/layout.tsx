import type { Metadata, Viewport } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

import Navbar from "@/components/Navbar";

export const viewport: Viewport = {
  themeColor: "#051018",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ABYSSAL — Born from the Sea | Luxury Yacht Experience",
  description:
    "A cinematic journey across the Mediterranean. Discover the craft, freedom, and quiet beauty of the classic Italian runabout.",
  keywords: [
    "luxury yacht",
    "Riva Aquarama",
    "bespoke yacht",
    "nautical engineering",
    "yacht experience",
    "cinematic boat experience",
  ],
  authors: [{ name: "ABYSSAL" }],
  creator: "ABYSSAL",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ABYSSAL — Born from the Sea",
    description:
      "Mahogany. Salt air. The first light of day. A cinematic ode to the Italian runabout.",
    siteName: "ABYSSAL",
  },
  twitter: {
    card: "summary_large_image",
    title: "ABYSSAL — Born from the Sea",
    description:
      "An immersive Mediterranean journey in five cinematic chapters.",
    creator: "@abyssal",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${cormorant.variable} antialiased dark`}
    >
      <body className="relative">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

