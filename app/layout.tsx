import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "214 Archives Studio",
    template: "%s | 214 Archives Studio",
  },
  description:
    "Visual storytelling through photography and videography. Portfolio of 214 Archives Studio.",
  openGraph: {
    title: "214 Archives Studio",
    description: "Visual storytelling through photography and videography.",
    url: "https://214archives.studio",
    siteName: "214 Archives Studio",
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "214 Archives Studio",
    description: "Visual storytelling through photography and videography.",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1A1A1A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
