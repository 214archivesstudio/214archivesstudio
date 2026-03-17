import type { Metadata } from "next";
import { PERSONAL_WORKS } from "@/data/personal";
import PersonalDetailClient from "./PersonalDetailClient";

interface PersonalDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PersonalDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const work = PERSONAL_WORKS.find((w) => w.id === id);

  return {
    title: work?.title ?? "Personal Work",
  };
}

export function generateStaticParams() {
  return PERSONAL_WORKS.map((item) => ({ id: item.id }));
}

export default function PersonalDetailPage() {
  return <PersonalDetailClient />;
}
