import Link from "next/link";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { PostForm } from "../_components/post-form";

export default async function NewPostPage() {
  await requireAuthenticatedAdmin();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <Link
          href="/admin/posts"
          className="text-xs text-muted hover:text-foreground transition-colors"
        >
          ← 목록으로
        </Link>
        <h1 className="text-2xl font-bold">새 게시물</h1>
        <p className="text-sm text-muted">
          섹션을 선택하고 필요한 필드를 입력하세요. 생성 후 사진 갤러리는 미디어 매니저에서 추가할 수 있습니다.
        </p>
      </header>
      <PostForm mode="create" />
    </div>
  );
}
