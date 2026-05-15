import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { findPostById } from "@/lib/repos/posts";
import { PostForm } from "../_components/post-form";
import { PublishToggle } from "../_components/publish-toggle";

interface PageProps {
  readonly params: Promise<{ id: string }>;
  readonly searchParams: Promise<{ created?: string }>;
}

export default async function EditPostPage({ params, searchParams }: PageProps) {
  const user = await requireAuthenticatedAdmin();
  const { id } = await params;
  const { created } = await searchParams;

  const post = await findPostById(id);
  if (!post) notFound();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/admin/posts"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <div className="text-xs text-muted">
          {post.section} · {post.slug} · 마지막 수정 {new Date(post.updated_at).toLocaleString("ko-KR")}
        </div>
      </header>

      {created === "1" && (
        <div className="text-sm border border-green-500/40 bg-green-500/10 text-green-300 rounded px-3 py-2">
          게시물이 생성됐습니다. 사진 갤러리는 미디어 매니저에서 추가하세요.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <PostForm mode="edit" initial={post} />

        <aside className="space-y-4 lg:sticky lg:top-6">
          <PublishToggle
            postId={post.id}
            initialPublished={post.published}
            canToggle={user.role === "admin"}
          />

          <Link
            href={`/admin/posts/${post.id}/media`}
            className="block border border-accent/15 rounded p-4 text-sm hover:border-foreground transition-colors"
          >
            <div className="font-medium">미디어 관리</div>
            <div className="text-xs text-muted mt-1">
              사진 갤러리 추가/순서/삭제 (Phase 3c에서 활성화)
            </div>
          </Link>
        </aside>
      </div>
    </div>
  );
}
