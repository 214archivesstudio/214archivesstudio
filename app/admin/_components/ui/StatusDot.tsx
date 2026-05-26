import { cn } from "@/lib/utils";

export type StatusKind = "published" | "draft" | "pending" | "error";

const COLORS: Record<StatusKind, string> = {
  published: "bg-foreground",
  draft: "bg-[#666]",
  pending: "bg-[#d6a877]",
  error: "bg-[#e2a98c]",
};

export function StatusDot({
  status,
  className,
}: {
  readonly status: StatusKind;
  readonly className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block h-1.5 w-1.5 rounded-full",
        COLORS[status],
        className,
      )}
    />
  );
}
