import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode;
  readonly padded?: boolean;
}

export function Card({
  children,
  padded = true,
  className,
  ...rest
}: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        "border border-[#2a2a2a] rounded-[2px] bg-white/[0.02]",
        padded && "p-6",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardLabel({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  return (
    <div
      className={cn(
        "text-[11px] text-muted uppercase tracking-[0.18em] mb-3",
        className,
      )}
    >
      {children}
    </div>
  );
}
