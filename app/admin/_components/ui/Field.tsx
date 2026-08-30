import { cloneElement, isValidElement, useId, type ReactElement, type ReactNode } from "react";
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

/**
 * Label + control + error. When `error` is set and `children` is a single
 * element, the control receives `aria-describedby` pointing at the error text
 * so screen readers announce it. The error node carries `data-field-error`
 * so the form can scroll to the first failing field.
 */
export function Field({
  label,
  hint,
  required,
  error,
  children,
  htmlFor,
  className,
}: FieldProps) {
  const errorId = useId();
  const control =
    error && isValidElement(children)
      ? cloneElement(children as ReactElement<Record<string, unknown>>, {
          "aria-describedby": errorId,
        })
      : children;

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
        {control}
      </label>
      {error && (
        <p id={errorId} data-field-error className="mt-1 text-[11px] text-[#e2a98c]">
          {error}
        </p>
      )}
    </div>
  );
}
