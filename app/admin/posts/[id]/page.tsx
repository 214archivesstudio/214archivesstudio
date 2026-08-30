import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { findPostById, findPostMedia } from "@/lib/repos/posts";
import { CardLabel } from "../../_components/ui/Card";
import { PageHead } from "../../_components/ui/PageHead";
import { Pill } from "../../_components/ui/Pill";
import { PostForm } from "../_components/post-form";
import { PublishToggle } from "../_components/publish-toggle";
import { DeletePostButton } from "../_components/delete-post-button";
import { MediaManager } from "../_components/media/MediaManager";
import type { PostSection } from "@/types/database";

const SECTION_LABEL: Record<PostSection, string> = {
  showreel: "Showreel",
  archives: "Archives",
  film: "Film",
  photography: "Photography",
  personal: "Personal",
};

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
    <>
      <PageHead
        eyebrow={
          <span>
            <Link
              href="/admin/posts"
              className="text-muted transition-colors hover:text-foreground"
            >
              포스트
            </Link>
            <span className="mx-2 text-[#444]">/</span>
            <span>{SECTION_LABEL[post.section]}</span>
          </span>
        }
        title={post.title}
        subtitle={`${post.date} · ${media.length}개 미디어 · 마지막 편집 ${new Date(
          post.updated_at,
        ).toLocaleString("ko-KR")}`}
        right={
          <div className="flex items-center gap-2.5">
            <Pill tone={post.published ? "default" : "warn"}>
              {post.published ? "공개" : "초안"}
            </Pill>
          </div>
        }
      />

      {created === "1" && (
        <div className="mb-6 rounded-[2px] border border-[#2a2a2a] bg-white/[0.03] px-4 py-3 text-[13px] text-accent">
          썸네일·기본 정보가 저장됐습니다. 이제 아래에서 갤러리를 추가하세요.
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-10">
          <PostForm mode="edit" initial={post} />

          <div className="border-t border-[#2a2a2a] pt-6">
            <CardLabel>위험 영역</CardLabel>
            <div className="flex items-center justify-between gap-4 py-3.5">
              <div className="min-w-0">
                <div className="text-[13px] text-foreground">이 포스트 삭제</div>
                <div className="mt-1 text-[11px] text-muted">
                  Supabase에서 즉시 제거됩니다. 사이트 반영은 다음 게시까지.
                </div>
              </div>
              <DeletePostButton postId={post.id} title={post.title} />
            </div>
          </div>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <PublishToggle
            postId={post.id}
            initialPublished={post.published}
            canToggle={user.role === "admin"}
          />
          <MediaManager
            postId={post.id}
            section={post.section}
            initialMedia={media}
          />
        </aside>
      </div>
    </>
  );
}
