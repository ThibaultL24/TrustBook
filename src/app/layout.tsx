import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers";
import { APP_URL } from "@/lib/config/runtime";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const title = "Trustbook";
const description =
  "A Circles-native trust-aware community feed — ranked by explicit trust and backed by CRC actions.";

export const metadata: Metadata = {
  title: { default: title, template: "%s · Trustbook" },
  description,
  applicationName: "Trustbook",
  manifest: "/manifest.json",
  metadataBase: new URL(APP_URL),
  openGraph: {
    title,
    description,
    url: APP_URL,
    siteName: "Trustbook",
    type: "website",
    images: [{ url: "/og-image.svg", width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og-image.svg"],
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#0f766e",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body
        className="min-h-full bg-slate-50 font-sans text-slate-900 pb-safe"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
