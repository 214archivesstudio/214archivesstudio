"use client";

import FadeIn from "@/components/common/FadeIn";
import HorizontalSlider from "@/components/ui/HorizontalSlider";
import { PHOTOGRAPHY } from "@/data/photography";
import { formatDate } from "@/lib/utils";

export default function PhotographyPage() {
  const sliderItems = PHOTOGRAPHY.map((item) => ({
    id: item.id,
    title: `${item.title} - ${item.client}`,
    date: formatDate(item.date),
    thumbnail: item.thumbnail,
  }));

  return (
    <div className="py-12">
      <div className="px-6 md:px-12">
        <FadeIn>
          <h1 className="mb-12 text-2xl font-light tracking-[0.2em] text-foreground">
            Photography
          </h1>
        </FadeIn>
      </div>
      <HorizontalSlider items={sliderItems} basePath="/photography" />
    </div>
  );
}
