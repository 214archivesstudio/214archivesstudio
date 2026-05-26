import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type PillTone = "default" | "accent" | "warn" | "danger";

const TONE_CLASSES: Record<PillTone, string> = {
  default: "text-accent bg-white/[0.06] border-[#2a2a2a]",
  accent: "text-foreground bg-white/10 border-[#3a3a3a]",
  warn: "text-[#d6a877] bg-[#d6a877]/[0.08] border-[#3a2e1f]",
  danger: "text-[#e2a98c] bg-[#e2a98c]/[0.08] border-[#3a2218]",
};

interface PillProps {
  readonly children: ReactNode;
  readonly tone?: PillTone;
  readonly className?: string;
}

export function Pill({ children, tone = "default", className }: PillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5",
        "text-[11px] tracking-[0.08em]",
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
