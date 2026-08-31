"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { toast } from "sonner";
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
  type FieldErrors,
} from "../_actions/posts";
import { SectionPicker } from "./section-picker";
import { SectionFields } from "./section-fields";
import { SlugInput } from "./slug-input";
import { ThumbnailUploader } from "./thumbnail-uploader";
import type { PostRow, PostSection } from "@/types/database";
import { SECTION_LABEL } from "@/lib/sections";


interface PostFormProps {
  readonly mode: "create" | "edit";
  readonly initial?: PostRow;
}

export function PostForm({ mode, initial }: PostFormProps) {
  const isEdit = mode === "edit";
  const initialSection = (initial?.section ?? "archives") as PostSection;
  const [section, setSection] = useState<PostSection>(initialSection);
  const [date, setDate] = useState(initial?.date ?? "");

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

  const serverFieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const errorMessage = state && !state.ok ? state.error : undefined;

  // 서버 검증 에러는 사용자가 해당 필드를 고치는 즉시 지운다. `token` 으로
  // 어느 제출 결과에 대한 clear 인지 묶어, 다음 제출 결과가 오면 자동 초기화.
  const [cleared, setCleared] = useState<{
    readonly token: unknown;
    readonly keys: ReadonlySet<string>;
  }>({ token: undefined, keys: new Set() });
  const fieldErrors: FieldErrors | undefined = serverFieldErrors
    ? Object.fromEntries(
        Object.entries(serverFieldErrors).filter(
          ([key]) => !(cleared.token === state && cleared.keys.has(key)),
        ),
      )
    : undefined;
  const fieldErrorCount = Object.keys(fieldErrors ?? {}).length;

  function clearFieldError(name: string) {
    setCleared((prev) => ({
      token: state,
      keys: new Set(prev.token === state ? [...prev.keys, name] : [name]),
    }));
  }

  const formRef = useRef<HTMLFormElement>(null);
  const dirtyRef = useRef(false);

  // 제출 결과 피드백: 성공 토스트 / 실패 시 첫 에러 필드로 스크롤
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      if (isEdit) toast.success("저장했어요");
      return;
    }
    const first = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"], [data-field-error]',
    );
    first?.scrollIntoView({ block: "center", behavior: "smooth" });
    if (first?.matches("input, textarea")) first.focus({ preventScroll: true });
  }, [state, isEdit]);

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
      ref={formRef}
      action={(formData) => {
        dirtyRef.current = false;
        formAction(formData);
      }}
      onChange={(event) => {
        dirtyRef.current = true;
        const name = (event.target as unknown as { name?: string }).name;
        if (name) clearFieldError(name);
      }}
      className="space-y-10"
    >
      {(errorMessage || fieldErrorCount > 0) && (
        <div className="rounded-[2px] border border-[#5a3322] bg-[#e2a98c]/5 px-3 py-2 text-[13px] text-[#e2a98c]">
          {errorMessage ?? `입력 ${fieldErrorCount}곳을 확인해 주세요.`}
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
          <SlugInput
            section={section}
            initialSlug={initial?.slug ?? ""}
            excludeId={isEdit ? initial?.id : undefined}
            fieldError={fieldErrors?.slug}
            dateValue={isEdit ? undefined : date}
          />
          <Field
            label="날짜"
            required
            error={fieldErrors?.date}
          >
            <Input
              type="date"
              name="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
          onDirty={() => {
            dirtyRef.current = true;
            clearFieldError("video_thumbnail_url");
          }}
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
          onDirty={() => {
            dirtyRef.current = true;
            clearFieldError("thumbnail_public_id");
          }}
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

