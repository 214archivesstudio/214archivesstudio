import type { Metadata } from "next";
import { FILMS } from "@/data/films";
import FilmDetailClient from "./FilmDetailClient";

interface FilmDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: FilmDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const film = FILMS.find((f) => f.id === id);

  return {
    title: film?.title ?? "Film",
  };
}

export function generateStaticParams() {
  return FILMS.map((film) => ({ id: film.id }));
}

export default function FilmDetailPage() {
  return <FilmDetailClient />;
}
