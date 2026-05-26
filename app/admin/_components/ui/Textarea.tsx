import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly invalid?: boolean;
}

export function Textarea({
  className,
  invalid,
  rows = 4,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      rows={rows}
      {...rest}
      className={cn(
        "w-full bg-transparent text-[15px] text-foreground placeholder:text-[#555]",
        "border rounded-[2px] p-3 outline-none resize-y",
        "focus:border-foreground transition-colors duration-200",
        invalid ? "border-[#e2a98c]" : "border-[#2a2a2a]",
        className,
      )}
    />
  );
}
