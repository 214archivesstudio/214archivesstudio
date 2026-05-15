import type { Metadata } from "next";
import { ARCHIVES } from "@/data/archives";
import { formatArchiveYear } from "@/lib/utils";
import ArchiveDetailClient from "./ArchiveDetailClient";

interface ArchiveDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: ArchiveDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const archive = ARCHIVES.find((a) => a.id === id);

  return {
    title: archive
      ? `${archive.city} ${formatArchiveYear(archive.year)}`
      : "Archives",
  };
}

export function generateStaticParams() {
  return ARCHIVES.map((item) => ({ id: item.id }));
}

export default function ArchiveDetailPage() {
  return <ArchiveDetailClient />;
}
