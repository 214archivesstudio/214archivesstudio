"use client";

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import {
  createPost,
  updatePost,
  type ActionResult,
} from "../_actions/posts";
import { ThumbnailUploader } from "./thumbnail-uploader";
import { SectionFields } from "./section-fields";
import type { PostRow, PostSection } from "@/types/database";

const SECTION_OPTIONS: ReadonlyArray<{ value: PostSection; label: string }> = [
  { value: "showreel", label: "Showreel" },
  { value: "archives", label: "Archives" },
  { value: "film", label: "Film" },
  { value: "photography", label: "Photography" },
  { value: "personal", label: "Personal" },
];

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

  return (
    <form action={formAction} className="space-y-6 max-w-3xl">
      {errorMessage && (
        <div className="text-sm text-red-300 border border-red-500/40 bg-red-500/10 rounded px-3 py-2">
          {errorMessage}
        </div>
      )}

      <Section title="기본 정보">
        <label className="block space-y-1">
          <span className="text-sm text-accent">
            섹션<span className="text-red-400 ml-1">*</span>
          </span>
          <select
            name="section"
            value={section}
            onChange={(e) => setSection(e.target.value as PostSection)}
            disabled={isEdit}
            className="w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground disabled:opacity-60"
          >
            {SECTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-background">
                {opt.label}
              </option>
            ))}
          </select>
          {isEdit && (
            <span className="block text-xs text-muted">
              기존 게시물의 섹션은 변경할 수 없습니다. 다른 섹션으로 옮기려면 삭제 후 재생성하세요.
            </span>
          )}
        </label>

        <Field
          label="제목"
          name="title"
          required
          defaultValue={initial?.title}
          error={fieldErrors?.title}
        />
        <Field
          label="슬러그"
          name="slug"
          required
          defaultValue={initial?.slug}
          error={fieldErrors?.slug}
          placeholder="kebab-case (예: 25-tokyo)"
          help="URL 식별자. 소문자/숫자/하이픈만 허용. 섹션 안에서 유일해야 합니다."
        />
        <Field
          label="날짜"
          name="date"
          type="date"
          required
          defaultValue={initial?.date}
          error={fieldErrors?.date}
        />
        <Field
          label="설명"
          name="description"
          textarea
          defaultValue={initial?.description ?? ""}
          error={fieldErrors?.description}
        />
      </Section>

      <Section title="썸네일">
        <ThumbnailUploader
          initialPublicId={initial?.thumbnail_public_id}
          initialWidth={initial?.thumbnail_width}
          initialHeight={initial?.thumbnail_height}
          initialAlt={initial?.thumbnail_alt ?? undefined}
          fieldError={fieldErrors?.thumbnail_public_id}
        />
        <Field
          label="썸네일 alt 텍스트"
          name="thumbnail_alt"
          defaultValue={initial?.thumbnail_alt ?? ""}
          error={fieldErrors?.thumbnail_alt}
          help="스크린리더용 대체 텍스트. 비우면 제목이 사용됩니다."
        />
      </Section>

      <Section title={`${SECTION_OPTIONS.find((s) => s.value === section)?.label} 전용 필드`}>
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
        />
      </Section>

      <Section title="정렬">
        <Field
          label="표시 순서"
          name="display_order"
          type="number"
          defaultValue={String(initial?.display_order ?? 0)}
          error={fieldErrors?.display_order}
          help="낮은 값이 먼저 표시. 같은 섹션 안에서만 의미 있음."
        />
      </Section>

      <div className="flex items-center justify-between pt-2 border-t border-accent/15">
        <Link
          href="/admin/posts"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← 목록으로
        </Link>
        <SubmitButton mode={mode} />
      </div>
    </form>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 border border-accent/15 rounded p-5">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();
  const labels = mode === "create" ? ["생성 중…", "생성"] : ["저장 중…", "저장"];
  return (
    <button
      type="submit"
      disabled={pending}
      className="bg-foreground text-background font-medium text-sm px-4 py-2 rounded disabled:opacity-50 hover:opacity-90 transition-opacity"
    >
      {pending ? labels[0] : labels[1]}
    </button>
  );
}

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly type?: "text" | "date" | "number";
  readonly required?: boolean;
  readonly defaultValue?: string;
  readonly placeholder?: string;
  readonly help?: string;
  readonly error?: string;
  readonly textarea?: boolean;
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
  placeholder,
  help,
  error,
  textarea,
}: FieldProps) {
  const inputClass =
    "w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground";
  return (
    <label className="block space-y-1">
      <span className="text-sm text-accent">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          rows={4}
          className={inputClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className={inputClass}
        />
      )}
      {help && !error && (
        <span className="block text-xs text-muted">{help}</span>
      )}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
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
