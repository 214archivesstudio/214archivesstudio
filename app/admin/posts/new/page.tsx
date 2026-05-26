import Link from "next/link";
import { requireAuthenticatedAdmin } from "@/lib/auth";
import { Btn } from "../../_components/ui/Btn";
import { PageHead } from "../../_components/ui/PageHead";
import { PostForm } from "../_components/post-form";

export default async function NewPostPage() {
  await requireAuthenticatedAdmin();

  return (
    <>
      <PageHead
        eyebrow="포스트 / 새로 만들기"
        title="새 포스트"
        subtitle="섹션을 먼저 선택하면 해당 섹션에 맞는 필드가 표시됩니다"
        right={
          <Link href="/admin/posts">
            <Btn variant="text" size="md">← 포스트 목록</Btn>
          </Link>
        }
      />
      <PostForm mode="create" />
    </>
  );
}
