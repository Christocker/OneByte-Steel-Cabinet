import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import { getSiteUrl } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: "Steel Cabinets for Sale in Dasmariñas, Cavite | OneByte",
    template: "%s | OneByte Steel Cabinets",
  },
  description:
    "Steel cabinets in Dasmariñas, Cavite: full glass, half glass, sliding, full metal, wardrobes, and filing cabinets. Message us for prices, delivery, and pick-up.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Steel Cabinets for Sale in Dasmariñas, Cavite | OneByte",
    description:
      "Full glass, half glass, sliding, full metal, wardrobes, and filing cabinets. Message us for prices, delivery, and pick-up.",
    url: getSiteUrl(),
    siteName: "OneByte Steel Cabinets",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Steel Cabinets for Sale in Dasmariñas, Cavite | OneByte",
    description:
      "Full glass, half glass, sliding, full metal, wardrobes, and filing cabinets. Message us for prices, delivery, and pick-up.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f4eddd",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PH" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
