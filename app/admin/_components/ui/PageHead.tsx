import type { ReactNode } from "react";

interface PageHeadProps {
  readonly title: ReactNode;
  readonly subtitle?: ReactNode;
  readonly eyebrow?: ReactNode;
  readonly right?: ReactNode;
}

export function PageHead({ title, subtitle, eyebrow, right }: PageHeadProps) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-[#2a2a2a] pb-6">
      <div className="min-w-0">
        {eyebrow && (
          <div className="mb-2.5 text-[11px] uppercase tracking-[0.2em] text-muted">
            {eyebrow}
          </div>
        )}
        <h1 className="m-0 text-[28px] font-light tracking-[0.18em] text-foreground">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-[13px] text-muted">{subtitle}</p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
