import Header from "@/components/layout/Header";
import BackgroundLayer from "@/components/layout/BackgroundLayer";
import { BackgroundProvider } from "@/context/BackgroundContext";
import { getCldImageUrl } from "next-cloudinary";

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <BackgroundProvider>
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
    </BackgroundProvider>
  );
}
