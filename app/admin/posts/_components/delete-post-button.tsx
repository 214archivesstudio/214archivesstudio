"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Btn } from "../../_components/ui/Btn";
import { deletePost } from "../_actions/posts";
import { DeleteDialog } from "./delete-dialog";

interface DeletePostButtonProps {
  readonly postId: string;
  readonly title: string;
}

export function DeletePostButton({ postId, title }: DeletePostButtonProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Btn variant="danger" size="sm" type="button" onClick={() => setOpen(true)}>
        삭제…
      </Btn>
      {open && (
        <DeleteDialog
          title="이 포스트를 삭제할까요?"
          description={`"${title}"이(가) 영구 삭제됩니다. 연결된 미디어도 함께 삭제됩니다.`}
          onConfirm={async () => {
            const result = await deletePost(postId);
            if (result.ok) {
              router.push("/admin/posts");
              router.refresh();
            }
            return result;
          }}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}
