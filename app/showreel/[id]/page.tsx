import { notFound } from "next/navigation";
import { SHOWREELS } from "@/data/showreels";
import VideoPlayer from "@/components/ui/VideoPlayer";
import FadeIn from "@/components/common/FadeIn";

interface ShowreelDetailPageProps {
  readonly params: Promise<{ id: string }>;
}

export function generateStaticParams() {
  return SHOWREELS.map((item) => ({ id: item.id }));
}

export default async function ShowreelDetailPage({
  params,
}: ShowreelDetailPageProps) {
  const { id } = await params;
  const showreel = SHOWREELS.find((s) => s.id === id);

  if (!showreel) {
    notFound();
  }

  return (
    <div className="px-6 py-12 md:px-12">
      <FadeIn>
        <h1 className="mb-8 text-2xl font-light tracking-[0.2em] text-foreground">
          {showreel.title}
        </h1>
      </FadeIn>
      <FadeIn delay={0.2}>
        <VideoPlayer video={showreel.video} />
      </FadeIn>
      {showreel.description && (
        <FadeIn delay={0.4}>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-accent">
            {showreel.description}
          </p>
        </FadeIn>
      )}
    </div>
  );
}
