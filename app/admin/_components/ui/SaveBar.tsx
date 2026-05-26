import type { ReactNode } from "react";

interface SaveBarProps {
  readonly status?: ReactNode;
  readonly actions: ReactNode;
}

export function SaveBar({ status, actions }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-20 -mx-12 mt-12 border-t border-[#2a2a2a] bg-background/90 px-12 py-4 backdrop-blur-md">
      <div className="flex items-center justify-between gap-4">
        <div className="text-[12px] text-muted">{status}</div>
        <div className="flex items-center gap-3">{actions}</div>
      </div>
    </div>
  );
}
