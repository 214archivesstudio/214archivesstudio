import type { Metadata } from "next";
import { PHOTOGRAPHY } from "@/data/photography";
import PhotographyDetailClient from "./PhotographyDetailClient";

interface PhotographyDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PhotographyDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const project = PHOTOGRAPHY.find((p) => p.id === id);

  return {
    title: project ? `${project.title} - ${project.client}` : "Photography",
  };
}

export function generateStaticParams() {
  return PHOTOGRAPHY.map((item) => ({ id: item.id }));
}

export default function PhotographyDetailPage() {
  return <PhotographyDetailClient />;
}
