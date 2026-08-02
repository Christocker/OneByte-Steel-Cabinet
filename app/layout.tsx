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
  title: "OneByte Steel Cabinets",
  description:
    "Premium steel cabinets built to last for homes, offices, schools, warehouses, and businesses.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "OneByte Steel Cabinets",
    description:
      "Premium steel cabinets built to last for homes, offices, schools, warehouses, and businesses.",
    url: getSiteUrl(),
    siteName: "OneByte Steel Cabinets",
    locale: "en_PH",
    type: "website",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
