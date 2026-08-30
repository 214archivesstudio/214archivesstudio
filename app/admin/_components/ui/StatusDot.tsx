import { cn } from "@/lib/utils";

export type StatusKind = "published" | "draft" | "pending" | "error";

const COLORS: Record<StatusKind, string> = {
  published: "bg-foreground",
  draft: "bg-[#666]",
  pending: "bg-[#d6a877]",
  error: "bg-[#e2a98c]",
};

const DEFAULT_LABEL: Record<StatusKind, string> = {
  published: "공개",
  draft: "초안",
  pending: "진행 중",
  error: "실패",
};

interface StatusDotProps {
  readonly status: StatusKind;
  /** Visible text next to the dot. Omit only when adjacent text already names the status. */
  readonly label?: string;
  readonly className?: string;
}

/**
 * Colour dot + text label. Colour alone never carries the status — when no
 * `label` is rendered the dot still exposes an accessible name.
 */
export function StatusDot({ status, label, className }: StatusDotProps) {
  const dot = (
    <span
      role={label ? undefined : "img"}
      aria-label={label ? undefined : DEFAULT_LABEL[status]}
      aria-hidden={label ? true : undefined}
      className={cn(
        "inline-block h-1.5 w-1.5 shrink-0 rounded-full",
        COLORS[status],
        label ? undefined : className,
      )}
    />
  );
  if (!label) return dot;
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      {dot}
      {label}
    </span>
  );
}
