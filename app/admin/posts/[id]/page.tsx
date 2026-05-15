import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { findPostById, findPostMedia } from "@/lib/repos/posts";
import { PostForm } from "../_components/post-form";
import { PublishToggle } from "../_components/publish-toggle";
import { MediaManager } from "../_components/media/MediaManager";

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

  const media = await findPostMedia(post.id);

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
          썸네일·기본 정보가 저장됐습니다. 이제 아래에서 갤러리를 추가하세요.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        <div className="space-y-6">
          <PostForm mode="edit" initial={post} />
          <MediaManager
            postId={post.id}
            section={post.section}
            initialMedia={media}
          />
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6">
          <PublishToggle
            postId={post.id}
            initialPublished={post.published}
            canToggle={user.role === "admin"}
          />
        </aside>
      </div>
    </div>
  );
}
