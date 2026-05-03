"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CldImage } from "next-cloudinary";
import { cn } from "@/lib/utils";
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
      <div className="border border-accent/15 rounded p-8 text-center text-sm text-muted">
        조건에 맞는 게시물이 없습니다.
      </div>
    );
  }

  return (
    <>
      <div className="border border-accent/15 rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-left text-muted border-b border-accent/15">
            <tr>
              <th className="px-3 py-2 font-medium w-16">미리보기</th>
              <th className="px-3 py-2 font-medium">제목</th>
              <th className="px-3 py-2 font-medium w-28">섹션</th>
              <th className="px-3 py-2 font-medium w-28">날짜</th>
              <th className="px-3 py-2 font-medium w-24">상태</th>
              <th className="px-3 py-2 font-medium w-32 text-right">작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const canDelete =
                userRole === "admin" ||
                (!post.published);
              return (
                <tr
                  key={post.id}
                  className="border-b border-accent/10 last:border-b-0 hover:bg-white/2"
                >
                  <td className="px-3 py-2">
                    <div className="w-12 h-12 rounded overflow-hidden bg-white/5">
                      <CldImage
                        src={post.thumbnail_public_id}
                        alt={post.thumbnail_alt ?? post.title}
                        width={96}
                        height={96}
                        crop="fill"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Link
                      href={`/admin/posts/${post.id}`}
                      className="text-foreground hover:underline"
                    >
                      {post.title}
                    </Link>
                    <div className="text-[#666666] text-xs font-mono mt-0.5">
                      {post.slug}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded border border-accent/20 text-xs text-accent">
                      {SECTION_LABEL[post.section]}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-accent tabular-nums">
                    {post.date}
                  </td>
                  <td className="px-3 py-2">
                    <PublishedBadge published={post.published} />
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-2 justify-end">
                      <Link
                        href={`/admin/posts/${post.id}`}
                        className="text-xs px-2 py-1 border border-accent/30 rounded hover:border-foreground transition-colors"
                      >
                        편집
                      </Link>
                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => setPendingDelete(post)}
                          className="text-xs px-2 py-1 border border-red-500/40 text-red-300 rounded hover:bg-red-500/10 transition-colors"
                        >
                          삭제
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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

function PublishedBadge({ published }: { published: boolean }) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded text-xs",
        published
          ? "bg-green-500/15 text-green-300 border border-green-500/30"
          : "bg-white/5 text-muted border border-accent/20",
      )}
    >
      {published ? "공개" : "Draft"}
    </span>
  );
}
