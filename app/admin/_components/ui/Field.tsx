import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface FieldProps {
  readonly label: ReactNode;
  readonly hint?: ReactNode;
  readonly required?: boolean;
  readonly error?: ReactNode;
  readonly children: ReactNode;
  readonly htmlFor?: string;
  readonly className?: string;
}

export function Field({
  label,
  hint,
  required,
  error,
  children,
  htmlFor,
  className,
}: FieldProps) {
  return (
    <div className={cn("mb-6", className)}>
      <label htmlFor={htmlFor} className="block">
        <div className="flex items-baseline justify-between text-[11px] uppercase tracking-[0.15em] text-muted mb-2">
          <span>
            {label}
            {required && <span className="text-foreground ml-1">*</span>}
          </span>
          {hint && (
            <span className="text-[#666] normal-case tracking-normal">
              {hint}
            </span>
          )}
        </div>
        {children}
      </label>
      {error && (
        <p className="mt-1 text-[11px] text-[#e2a98c]">{error}</p>
      )}
    </div>
  );
}
