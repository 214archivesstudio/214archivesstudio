import type { Metadata, Viewport } from "next";
import Header from "@/components/layout/Header";
import BackgroundLayer from "@/components/layout/BackgroundLayer";
import { getCldImageUrl } from "next-cloudinary";
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
      <body>
        <BackgroundLayer
          media={{
            type: "image",
            src: getCldImageUrl({
              src: "214archives/background/home-bg",
              width: 1920,
              height: 1080,
              quality: "auto",
              format: "auto",
            }),
            overlayOpacity: 0.6,
          }}
        />
        <Header />
        <main className="relative min-h-screen pt-20">{children}</main>
      </body>
    </html>
  );
}
