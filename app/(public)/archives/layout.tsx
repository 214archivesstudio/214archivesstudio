import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Archives",
};

export default function ArchivesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
