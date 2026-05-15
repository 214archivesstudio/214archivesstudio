import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Film",
};

export default function FilmLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
