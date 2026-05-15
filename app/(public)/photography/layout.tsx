import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Photography",
};

export default function PhotographyLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
