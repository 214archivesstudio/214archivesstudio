import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly invalid?: boolean;
}

export function Input({ className, invalid, type = "text", ...rest }: InputProps) {
  return (
    <input
      type={type}
      aria-invalid={invalid ? true : undefined}
      {...rest}
      className={cn(
        "w-full bg-transparent text-[15px] text-foreground placeholder:text-[#555]",
        "border-0 border-b py-2 px-0 outline-none",
        "focus:border-foreground transition-colors duration-200",
        invalid ? "border-[#e2a98c]" : "border-[#2a2a2a]",
        className,
      )}
    />
  );
}
