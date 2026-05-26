"use client";

import { cn } from "@/lib/utils";
import type { PostSection } from "@/types/database";

const OPTIONS: ReadonlyArray<{
  readonly value: PostSection;
  readonly label: string;
  readonly note: string;
}> = [
  { value: "showreel", label: "Showreel", note: "단일 영상" },
  { value: "archives", label: "Archives", note: "도시·연도 + 갤러리" },
  { value: "film", label: "Film", note: "영상 + 갤러리" },
  { value: "photography", label: "Photography", note: "클라이언트 + 갤러리" },
  { value: "personal", label: "Personal", note: "갤러리 (영상 선택)" },
];

interface SectionPickerProps {
  readonly selected: PostSection;
  readonly onSelect: (section: PostSection) => void;
}

export function SectionPicker({ selected, onSelect }: SectionPickerProps) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-5">
      {OPTIONS.map((opt) => {
        const active = opt.value === selected;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            aria-pressed={active}
            className={cn(
              "flex min-h-[110px] flex-col justify-between gap-3 rounded-[2px] border p-5 text-left transition-colors duration-200 ease-out",
              active
                ? "border-foreground bg-white/[0.04]"
                : "border-[#2a2a2a] bg-white/[0.02] hover:border-foreground/40",
            )}
          >
            <div className="text-[16px] font-light tracking-[0.1em] text-foreground">
              {opt.label}
            </div>
            <div className="text-[11px] uppercase tracking-[0.1em] text-muted">
              {active ? "선택됨" : opt.note}
            </div>
          </button>
        );
      })}
    </div>
  );
}
