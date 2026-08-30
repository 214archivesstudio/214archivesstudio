import Link from "next/link";
import { cn } from "@/lib/utils";
import type { PostSection } from "@/types/database";

interface SectionTabsProps {
  readonly active: PostSection | null;
  readonly counts: Record<PostSection, number>;
  readonly total: number;
  readonly search: string;
}

const TABS: ReadonlyArray<{ section: PostSection | null; label: string }> = [
  { section: null, label: "전체" },
  { section: "showreel", label: "Showreel" },
  { section: "archives", label: "Archives" },
  { section: "film", label: "Film" },
  { section: "photography", label: "Photography" },
  { section: "personal", label: "Personal" },
];

function tabHref(section: PostSection | null, search: string): string {
  const sp = new URLSearchParams();
  if (section) sp.set("section", section);
  if (search) sp.set("q", search);
  const qs = sp.toString();
  return qs ? `/admin/posts?${qs}` : "/admin/posts";
}

export function SectionTabs({ active, counts, total, search }: SectionTabsProps) {
  return (
    <div className="mb-1 flex flex-wrap gap-0 border-b border-[#2a2a2a]">
      {TABS.map((tab) => {
        const isActive = tab.section === active;
        const count = tab.section === null ? total : counts[tab.section];
        return (
          <Link
            key={tab.label}
            href={tabHref(tab.section, search)}
            className={cn(
              "-mb-px flex items-center gap-2 px-[18px] py-3 text-[13px] transition-colors duration-200",
              isActive
                ? "border-b border-foreground text-foreground"
                : "border-b border-transparent text-muted hover:text-foreground",
            )}
          >
            <span>{tab.label}</span>
            {/* 검색 중엔 카운트가 검색과 무관한 전체 수라 숨긴다 */}
            {!search && (
              <span className="text-[11px] text-[#666]">{count}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
