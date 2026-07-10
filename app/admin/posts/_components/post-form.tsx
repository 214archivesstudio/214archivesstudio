"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { Btn } from "../../_components/ui/Btn";
import { CardLabel } from "../../_components/ui/Card";
import { Field } from "../../_components/ui/Field";
import { Input } from "../../_components/ui/Input";
import { Pill } from "../../_components/ui/Pill";
import { Textarea } from "../../_components/ui/Textarea";
import {
  createPost,
  updatePost,
  type ActionResult,
} from "../_actions/posts";
import { SectionPicker } from "./section-picker";
import { SectionFields } from "./section-fields";
import { ThumbnailUploader } from "./thumbnail-uploader";
import type { PostRow, PostSection } from "@/types/database";

const SECTION_LABEL: Record<PostSection, string> = {
  showreel: "Showreel",
  archives: "Archives",
  film: "Film",
  photography: "Photography",
  personal: "Personal",
};

interface PostFormProps {
  readonly mode: "create" | "edit";
  readonly initial?: PostRow;
}

export function PostForm({ mode, initial }: PostFormProps) {
  const isEdit = mode === "edit";
  const initialSection = (initial?.section ?? "archives") as PostSection;
  const [section, setSection] = useState<PostSection>(initialSection);

  const initialVideoUrl = initial
    ? buildVideoUrl(initial.video_platform, initial.video_id)
    : null;

  const action =
    isEdit && initial
      ? updatePost.bind(null, initial.id, initial.updated_at)
      : createPost;

  const [state, formAction] = useActionState<ActionResult | undefined, FormData>(
    action as (
      prev: ActionResult | undefined,
      formData: FormData,
    ) => Promise<ActionResult>,
    undefined,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const errorMessage = state && !state.ok ? state.error : undefined;

  const dirtyRef = useRef(false);

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirtyRef.current) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  // Re-arm dirty guard when the server action returns a validation error —
  // the user's unsaved data is still in the form.
  useEffect(() => {
    if (state && !state.ok) {
      dirtyRef.current = true;
    }
  }, [state]);

  return (
    <form
      action={(formData) => {
        dirtyRef.current = false;
        formAction(formData);
      }}
      onChange={() => {
        dirtyRef.current = true;
      }}
      className="space-y-10"
    >
      {errorMessage && (
        <div className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[13px] text-[#e2a98c]">
          {errorMessage}
        </div>
      )}

      {!isEdit && (
        <div>
          <CardLabel>1 · 섹션 선택</CardLabel>
          <SectionPicker
            selected={section}
            onSelect={(s) => { setSection(s); dirtyRef.current = true; }}
          />
          <input type="hidden" name="section" value={section} />
        </div>
      )}

      {isEdit && initial && (
        // Section is fixed once a post exists — show it as an unobtrusive pill.
        <input type="hidden" name="section" value={section} />
      )}

      <div>
        {!isEdit && (
          <CardLabel>
            2 · 내용 입력 — {SECTION_LABEL[section]}
          </CardLabel>
        )}

        <Field
          label="제목"
          required
          hint={section === "archives" ? "대문자 도시명 권장" : undefined}
          error={fieldErrors?.title}
        >
          <Input
            name="title"
            defaultValue={initial?.title ?? ""}
            placeholder={section === "archives" ? "TAIPEI" : "제목"}
            invalid={Boolean(fieldErrors?.title)}
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="슬러그"
            required
            hint="kebab-case · 섹션 내 유일"
            error={fieldErrors?.slug}
          >
            <Input
              name="slug"
              defaultValue={initial?.slug ?? ""}
              placeholder="25-tokyo"
              invalid={Boolean(fieldErrors?.slug)}
            />
          </Field>
          <Field
            label="날짜"
            required
            error={fieldErrors?.date}
          >
            <Input
              type="date"
              name="date"
              defaultValue={initial?.date ?? ""}
              invalid={Boolean(fieldErrors?.date)}
            />
          </Field>
        </div>

        <Field
          label="설명"
          hint="선택"
          error={fieldErrors?.description}
        >
          <Textarea
            name="description"
            rows={3}
            defaultValue={initial?.description ?? ""}
            placeholder="짧은 설명을 입력하세요"
            invalid={Boolean(fieldErrors?.description)}
          />
        </Field>

        <SectionFields
          section={section}
          initial={{
            city: initial?.city,
            year_label: initial?.year_label,
            client: initial?.client,
            video_url: initialVideoUrl,
            video_thumbnail_url: initial?.video_thumbnail_url,
          }}
          fieldErrors={fieldErrors}
          onDirty={() => { dirtyRef.current = true; }}
        />
      </div>

      <div className="border-t border-[#2a2a2a] pt-6">
        <CardLabel>썸네일</CardLabel>
        <ThumbnailUploader
          initialPublicId={initial?.thumbnail_public_id}
          initialWidth={initial?.thumbnail_width}
          initialHeight={initial?.thumbnail_height}
          initialAlt={initial?.thumbnail_alt ?? undefined}
          fieldError={fieldErrors?.thumbnail_public_id}
          onDirty={() => { dirtyRef.current = true; }}
        />
        <div className="mt-4">
          <Field
            label="썸네일 alt"
            hint="스크린리더용 · 비우면 제목 사용"
            error={fieldErrors?.thumbnail_alt}
          >
            <Input
              name="thumbnail_alt"
              defaultValue={initial?.thumbnail_alt ?? ""}
              invalid={Boolean(fieldErrors?.thumbnail_alt)}
            />
          </Field>
        </div>
      </div>

      <div className="border-t border-[#2a2a2a] pt-6">
        <CardLabel>정렬</CardLabel>
        <Field
          label="표시 순서"
          hint="낮은 값이 먼저 표시"
          error={fieldErrors?.display_order}
        >
          <Input
            type="number"
            name="display_order"
            defaultValue={String(initial?.display_order ?? 0)}
            invalid={Boolean(fieldErrors?.display_order)}
          />
        </Field>
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-[#2a2a2a] pt-6">
        <Link
          href="/admin/posts"
          className="text-[12px] tracking-[0.05em] text-muted transition-colors hover:text-foreground"
        >
          ← 목록으로
        </Link>
        <div className="flex items-center gap-3">
          {isEdit && (
            <Pill tone="default">
              {SECTION_LABEL[initialSection]}
            </Pill>
          )}
          <SubmitButton mode={mode} />
        </div>
      </div>
    </form>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  const labels = mode === "create" ? ["생성 중…", "생성"] : ["저장 중…", "저장"];
  return (
    <Btn type="submit" variant="primary" size="md" disabled={pending}>
      {pending ? labels[0] : labels[1]}
    </Btn>
  );
}

function buildVideoUrl(
  platform: PostRow["video_platform"],
  videoId: PostRow["video_id"],
): string | null {
  if (!platform || !videoId) return null;
  if (platform === "youtube") return `https://youtu.be/${videoId}`;
  if (platform === "vimeo") return `https://vimeo.com/${videoId}`;
  return null;
}

