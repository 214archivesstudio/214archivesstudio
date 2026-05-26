import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BtnVariant = "primary" | "secondary" | "ghost" | "text" | "danger";
export type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: BtnVariant;
  readonly size?: BtnSize;
  readonly icon?: ReactNode;
  readonly children?: ReactNode;
}

const sizeClasses: Record<BtnSize, string> = {
  sm: "text-xs px-3 h-7",
  md: "text-[13px] px-[18px] h-9",
  lg: "text-sm px-6 h-11",
};

const variantClasses: Record<BtnVariant, string> = {
  primary:
    "bg-foreground text-[#0d0d0d] border border-foreground hover:bg-[#f0f0f0]",
  secondary:
    "bg-transparent text-foreground border border-foreground hover:bg-white/5",
  ghost:
    "bg-transparent text-accent border border-[#2a2a2a] hover:border-foreground hover:text-foreground",
  text:
    "bg-transparent text-muted border border-transparent hover:text-foreground",
  danger:
    "bg-transparent text-[#e2a98c] border border-[#5a3322] hover:bg-[#e2a98c]/5",
};

export function Btn({
  variant = "primary",
  size = "md",
  icon,
  children,
  className,
  type = "button",
  ...rest
}: BtnProps) {
  return (
    <button
      type={type}
      {...rest}
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[2px] tracking-[0.06em] transition-colors duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    >
      {icon}
      {children}
    </button>
  );
}
