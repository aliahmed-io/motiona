import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
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
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "ABYSSAL — Born from the Sea | Luxury Yacht Experience",
  description:
    "Experience the pinnacle of nautical engineering. The Riva Aquarama Lamborghini — classical wood craftsmanship reborn for an age that demands both beauty and absolute silence.",
  keywords: [
    "luxury yacht",
    "Riva Aquarama",
    "bespoke yacht",
    "nautical engineering",
    "yacht experience",
    "3D yacht",
  ],
  authors: [{ name: "ABYSSAL" }],
  creator: "ABYSSAL",
  openGraph: {
    type: "website",
    locale: "en_US",
    title: "ABYSSAL — Born from the Sea",
    description:
      "Classical wood craftsmanship reborn. Only nine hulls built annually. Experience the Riva Aquarama in immersive 3D.",
    siteName: "ABYSSAL",
  },
  twitter: {
    card: "summary_large_image",
    title: "ABYSSAL — Born from the Sea",
    description:
      "Classical wood craftsmanship reborn. Experience the Riva Aquarama in immersive 3D.",
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
      className={`${inter.variable} ${outfit.variable} ${cormorant.variable} antialiased dark`}
    >
      <body className="relative">
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}

