import Link from "next/link";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { listPosts } from "@/lib/repos/posts";
import type { PostSection } from "@/types/database";
import { PostsTable } from "./_components/posts-table";

const SECTION_OPTIONS: ReadonlyArray<{ value: PostSection | ""; label: string }> = [
  { value: "", label: "모든 섹션" },
  { value: "showreel", label: "Showreel" },
  { value: "archives", label: "Archives" },
  { value: "film", label: "Film" },
  { value: "photography", label: "Photography" },
  { value: "personal", label: "Personal" },
];

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

  const { posts, total } = await listPosts({
    section,
    search: search || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Posts</h1>
          <p className="text-sm text-muted">
            전체 {total}개 · 페이지 {pageNum}/{totalPages}
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="bg-foreground text-background font-medium text-sm px-3 py-2 rounded hover:opacity-90 transition-opacity"
        >
          + 새 게시물
        </Link>
      </header>

      <form
        method="get"
        action="/admin/posts"
        className="flex flex-wrap items-center gap-3"
      >
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted">섹션</span>
          <select
            name="section"
            defaultValue={section ?? ""}
            className="bg-transparent border border-accent/30 rounded px-2 py-1.5 text-sm focus:outline-none focus:border-foreground"
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background">
                {opt.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm flex-1 min-w-60">
          <span className="text-muted">검색</span>
          <input
            type="text"
            name="q"
            defaultValue={search}
            placeholder="제목 또는 slug"
            className="flex-1 bg-transparent border border-accent/30 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-foreground"
          />
        </label>
        <button
          type="submit"
          className="text-sm border border-accent/30 rounded px-3 py-1.5 hover:border-foreground transition-colors"
        >
          적용
        </button>
        {(section || search) && (
          <Link
            href="/admin/posts"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            초기화
          </Link>
        )}
      </form>

      <PostsTable posts={posts} userRole={user.role} />

      {totalPages > 1 && (
        <Pagination
          page={pageNum}
          totalPages={totalPages}
          section={section}
          search={search}
        />
      )}
    </div>
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
    <nav className="flex items-center justify-center gap-2 text-sm">
      {page > 1 ? (
        <Link
          href={pageUrl(page - 1)}
          className="px-3 py-1.5 border border-accent/30 rounded hover:border-foreground transition-colors"
        >
          이전
        </Link>
      ) : (
        <span className="px-3 py-1.5 border border-accent/15 rounded text-[#555555] cursor-not-allowed">
          이전
        </span>
      )}
      <span className="text-muted tabular-nums px-2">
        {page} / {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={pageUrl(page + 1)}
          className="px-3 py-1.5 border border-accent/30 rounded hover:border-foreground transition-colors"
        >
          다음
        </Link>
      ) : (
        <span className="px-3 py-1.5 border border-accent/15 rounded text-[#555555] cursor-not-allowed">
          다음
        </span>
      )}
    </nav>
  );
}
