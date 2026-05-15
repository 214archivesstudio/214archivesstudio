"use client";

import type { PostSection } from "@/types/database";
import type { FieldErrors } from "../_actions/posts";

interface SectionFieldsProps {
  readonly section: PostSection;
  readonly initial: {
    readonly city?: string | null;
    readonly year_label?: string | null;
    readonly client?: string | null;
    readonly video_url?: string | null;
    readonly video_thumbnail_url?: string | null;
  };
  readonly fieldErrors?: FieldErrors;
}

export function SectionFields({
  section,
  initial,
  fieldErrors,
}: SectionFieldsProps) {
  return (
    <div className="space-y-4">
      {section === "archives" && (
        <>
          <Field
            label="도시"
            name="city"
            required
            defaultValue={initial.city ?? ""}
            error={fieldErrors?.city}
            placeholder="Tokyo"
          />
          <Field
            label="연도 라벨"
            name="year_label"
            required
            defaultValue={initial.year_label ?? ""}
            error={fieldErrors?.year_label}
            placeholder="'25"
            help="제목 옆에 표시되는 연도 표기. slug의 연도와 다를 수 있음 (예: slug 25-tokyo, 라벨 '25)."
          />
        </>
      )}

      {section === "photography" && (
        <Field
          label="클라이언트"
          name="client"
          required
          defaultValue={initial.client ?? ""}
          error={fieldErrors?.client}
          placeholder="B.Ready"
        />
      )}

      {(section === "showreel" || section === "film" || section === "personal") && (
        <Field
          label="영상 URL"
          name="video_url"
          defaultValue={initial.video_url ?? ""}
          error={fieldErrors?.video_url}
          placeholder="https://youtu.be/abc123 또는 https://vimeo.com/123456"
          help={
            section === "showreel" || section === "film"
              ? "필수 권장 — 이 섹션은 영상 중심입니다"
              : "선택사항"
          }
        />
      )}

      {section === "film" && (
        <Field
          label="영상 썸네일 URL"
          name="video_thumbnail_url"
          defaultValue={initial.video_thumbnail_url ?? ""}
          error={fieldErrors?.video_thumbnail_url}
          placeholder="https://…"
          help="film 섹션의 별도 비디오 썸네일 URL (선택)"
        />
      )}
    </div>
  );
}

interface FieldProps {
  readonly label: string;
  readonly name: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly help?: string;
  readonly error?: string;
}

function Field({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  help,
  error,
}: FieldProps) {
  return (
    <label className="block space-y-1">
      <span className="text-sm text-accent">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-transparent border border-accent/30 rounded px-3 py-2 text-sm focus:outline-none focus:border-foreground"
      />
      {help && !error && (
        <span className="block text-xs text-muted">{help}</span>
      )}
      {error && <span className="block text-xs text-red-400">{error}</span>}
    </label>
  );
}
