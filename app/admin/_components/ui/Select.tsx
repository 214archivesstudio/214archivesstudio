import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  readonly invalid?: boolean;
}

export function Select({ className, invalid, children, ...rest }: SelectProps) {
  return (
    <div className="relative">
      <select
        {...rest}
        className={cn(
          "w-full appearance-none bg-transparent text-[15px] text-foreground",
          "border-0 border-b py-2 pr-6 pl-0 outline-none cursor-pointer",
          "focus:border-foreground transition-colors duration-200",
          // Native option dropdowns inherit page bg poorly on dark; force a
          // background so the popped list stays readable in Chrome/Safari.
          "[&>option]:bg-background [&>option]:text-foreground",
          invalid ? "border-[#e2a98c]" : "border-[#2a2a2a]",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          className,
        )}
      >
        {children}
      </select>
      <span
        aria-hidden
        className="pointer-events-none absolute right-1 top-1/2 -translate-y-1/2 text-[10px] text-muted"
      >
        ▾
      </span>
    </div>
  );
}
