"use client";

import { cn } from "@/lib/utils";
import { SECTIONS } from "@/lib/sections";
import type { PostSection } from "@/types/database";

interface SectionPickerProps {
  readonly selected: PostSection;
  readonly onSelect: (section: PostSection) => void;
}

export function SectionPicker({ selected, onSelect }: SectionPickerProps) {
  return (
    <div className="mt-2 grid grid-cols-2 gap-3 md:grid-cols-5">
      {SECTIONS.map((opt) => {
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
