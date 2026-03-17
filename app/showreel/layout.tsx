import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Showreel",
};

export default function ShowreelLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
