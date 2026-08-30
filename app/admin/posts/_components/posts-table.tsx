"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { Btn } from "../../_components/ui/Btn";
import { StatusDot } from "../../_components/ui/StatusDot";
import { deletePost } from "../_actions/posts";
import { DeleteDialog } from "./delete-dialog";
import type { PostRow, PostSection } from "@/types/database";

const SECTION_LABEL: Record<PostSection, string> = {
  showreel: "Showreel",
  archives: "Archives",
  film: "Film",
  photography: "Photography",
  personal: "Personal",
};

interface PostsTableProps {
  readonly posts: ReadonlyArray<PostRow>;
  readonly userRole: "admin" | "editor";
}

export function PostsTable({ posts, userRole }: PostsTableProps) {
  const router = useRouter();
  const [pendingDelete, setPendingDelete] = useState<PostRow | null>(null);

  if (posts.length === 0) {
    return (
      <div className="border border-[#2a2a2a] rounded-[2px] p-12 text-center">
        <p className="text-[13px] text-muted">조건에 맞는 게시물이 없습니다.</p>
        <Link href="/admin/posts/new" className="mt-4 inline-block">
          <Btn variant="primary" size="md">+ 새 포스트</Btn>
        </Link>
      </div>
    );
  }

  return (
    <>
      <div>
        {posts.map((post) => {
          const canDelete = userRole === "admin" || !post.published;
          return (
            <div
              key={post.id}
              className="grid grid-cols-[120px_1fr_140px_120px_100px_140px] items-center gap-5 border-b border-[#2a2a2a] py-4 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <Link
                href={`/admin/posts/${post.id}`}
                className="block overflow-hidden rounded-[2px] aspect-[3/2] bg-white/5"
              >
                <CldImage
                  src={post.thumbnail_public_id}
                  alt={post.thumbnail_alt ?? post.title}
                  width={240}
                  height={160}
                  crop="fill"
                  className="h-full w-full object-cover transition-transform duration-200 ease-out hover:scale-[1.03]"
                />
              </Link>

              <div className="min-w-0">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="block text-[15px] text-foreground transition-colors hover:text-accent"
                >
                  {post.title}
                </Link>
                <div className="mt-1 truncate text-[11px] tracking-[0.05em] text-[#666] font-mono">
                  /{post.section}/{post.slug}
                </div>
              </div>

              <div className="text-[12px] tracking-[0.05em] text-accent">
                {SECTION_LABEL[post.section]}
              </div>

              <div className="flex items-center gap-2 text-[12px] text-accent">
                <StatusDot
                  status={post.published ? "published" : "draft"}
                  label={post.published ? "공개" : "초안"}
                />
              </div>

              <div className="text-right text-[12px] text-muted tabular-nums">
                {post.date}
              </div>

              <div className="flex justify-end gap-2">
                <Link href={`/admin/posts/${post.id}`}>
                  <Btn variant="ghost" size="sm">편집</Btn>
                </Link>
                {canDelete && (
                  <Btn
                    variant="danger"
                    size="sm"
                    onClick={() => setPendingDelete(post)}
                  >
                    삭제
                  </Btn>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {pendingDelete && (
        <DeleteDialog
          title="게시물을 삭제할까요?"
          description={`"${pendingDelete.title}"이(가) 영구 삭제됩니다. 연결된 미디어도 함께 삭제됩니다.`}
          onConfirm={async () => {
            const result = await deletePost(pendingDelete.id);
            if (result.ok) router.refresh();
            return result;
          }}
          onClose={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
