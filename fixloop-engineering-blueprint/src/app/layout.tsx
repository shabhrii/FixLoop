import type { Metadata, Viewport } from "next";
import "./globals.css";
import { CookieConsentBanner } from "@/components/compliance/cookie-consent-banner";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_ORIGIN || "http://localhost:3000"),
  title: {
    default: "FixLoop — Precision Manufacturing Defect Investigation",
    template: "%s | FixLoop Precision QMS",
  },
  description:
    "Mobile-first defect-investigation, root cause analysis and proof-backed corrective action workflow for precision manufacturing.",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "FixLoop — Precision Manufacturing Defect Investigation",
    description:
      "Mobile-first defect-investigation, root cause analysis and proof-backed corrective action workflow for precision manufacturing.",
    url: "/",
    siteName: "FixLoop",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "FixLoop Precision Manufacturing Quality Management Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "FixLoop — Precision Manufacturing Defect Investigation",
    description:
      "Mobile-first defect-investigation, root cause analysis and proof-backed corrective action workflow for precision manufacturing.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5, // Allow pinch zoom — accessibility requirement design.md §10
  themeColor: "#2F5F91", // fl-blue-700 per design.md §3
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // No `dark` class — design.md uses light surfaces
    <html lang="en">
      <body className="antialiased">
        {children}
        <CookieConsentBanner />
      </body>
    </html>
  );
}
