import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Personal Work",
};

export default function PersonalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
