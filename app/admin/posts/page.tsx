import Link from "next/link";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { countPostsBySection, listPosts } from "@/lib/repos/posts";
import type { PostSection } from "@/types/database";
import { Btn } from "../_components/ui/Btn";
import { PageHead } from "../_components/ui/PageHead";
import { PostsTable } from "./_components/posts-table";
import { SectionTabs } from "./_components/section-tabs";
import { SearchInput } from "./_components/search-input";

const PAGE_SIZE = 20;

interface SearchParams {
  readonly section?: string;
  readonly q?: string;
  readonly page?: string;
}

function parseSection(value: string | undefined): PostSection | undefined {
  const valid: ReadonlyArray<PostSection> = [
    "showreel",
    "archives",
    "film",
    "photography",
    "personal",
  ];
  if (value && (valid as ReadonlyArray<string>).includes(value)) {
    return value as PostSection;
  }
  return undefined;
}

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireAuthenticatedAdmin();
  const params = await searchParams;

  const section = parseSection(params.section);
  const search = (params.q ?? "").trim();
  const pageNum = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const offset = (pageNum - 1) * PAGE_SIZE;

  const [{ posts, total }, sectionCounts] = await Promise.all([
    listPosts({
      section,
      search: search || undefined,
      limit: PAGE_SIZE,
      offset,
    }),
    countPostsBySection(),
  ]);

  const totalAll = Object.values(sectionCounts).reduce((acc, n) => acc + n, 0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const publishedDisplayed = posts.filter((p) => p.published).length;
  const draftDisplayed = posts.length - publishedDisplayed;

  return (
    <>
      <PageHead
        eyebrow="콘텐츠"
        title="포스트"
        subtitle={`전체 ${total}건 · 페이지 ${pageNum}/${totalPages} · 표시 중 게시 ${publishedDisplayed} · 초안 ${draftDisplayed}`}
        right={
          <Link href="/admin/posts/new">
            <Btn variant="primary" size="md">+ 새 포스트</Btn>
          </Link>
        }
      />

      <div className="mb-5 flex items-center gap-3">
        <div className="flex-1" />
        <SearchInput section={section ?? ""} defaultValue={search} />
      </div>

      <SectionTabs
        active={section ?? null}
        counts={sectionCounts}
        total={totalAll}
        search={search}
      />

      <div className="mt-2">
        <PostsTable posts={posts} userRole={user.role} />
      </div>

      {totalPages > 1 && (
        <Pagination
          page={pageNum}
          totalPages={totalPages}
          section={section}
          search={search}
        />
      )}
    </>
  );
}

function Pagination({
  page,
  totalPages,
  section,
  search,
}: {
  page: number;
  totalPages: number;
  section: PostSection | undefined;
  search: string;
}) {
  const baseParams = new URLSearchParams();
  if (section) baseParams.set("section", section);
  if (search) baseParams.set("q", search);

  function pageUrl(p: number): string {
    const sp = new URLSearchParams(baseParams);
    sp.set("page", String(p));
    return `/admin/posts?${sp.toString()}`;
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-3 text-[12px] text-muted">
      {page > 1 ? (
        <Link href={pageUrl(page - 1)}>
          <Btn variant="ghost" size="sm">← 이전</Btn>
        </Link>
      ) : (
        <Btn variant="ghost" size="sm" disabled>
          ← 이전
        </Btn>
      )}
      <span className="px-2 tabular-nums">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link href={pageUrl(page + 1)}>
          <Btn variant="ghost" size="sm">다음 →</Btn>
        </Link>
      ) : (
        <Btn variant="ghost" size="sm" disabled>
          다음 →
        </Btn>
      )}
    </nav>
  );
}
