"use client";

import { Field } from "../../_components/ui/Field";
import { Input } from "../../_components/ui/Input";
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
    <>
      {section === "archives" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="도시"
            required
            error={fieldErrors?.city}
          >
            <Input
              name="city"
              defaultValue={initial.city ?? ""}
              placeholder="Tokyo"
              invalid={Boolean(fieldErrors?.city)}
            />
          </Field>
          <Field
            label="연도 라벨"
            required
            hint="제목 옆 표기 (예: '25)"
            error={fieldErrors?.year_label}
          >
            <Input
              name="year_label"
              defaultValue={initial.year_label ?? ""}
              placeholder="'25"
              invalid={Boolean(fieldErrors?.year_label)}
            />
          </Field>
        </div>
      )}

      {section === "photography" && (
        <Field
          label="클라이언트"
          required
          error={fieldErrors?.client}
        >
          <Input
            name="client"
            defaultValue={initial.client ?? ""}
            placeholder="B.Ready"
            invalid={Boolean(fieldErrors?.client)}
          />
        </Field>
      )}

      {(section === "showreel" ||
        section === "film" ||
        section === "personal") && (
        <Field
          label="영상 URL"
          required={section === "showreel" || section === "film"}
          hint="YouTube 또는 Vimeo"
          error={fieldErrors?.video_url}
        >
          <Input
            name="video_url"
            defaultValue={initial.video_url ?? ""}
            placeholder="https://youtu.be/abc123"
            invalid={Boolean(fieldErrors?.video_url)}
          />
        </Field>
      )}

      {section === "film" && (
        <Field
          label="영상 썸네일 URL"
          hint="선택 · film 전용"
          error={fieldErrors?.video_thumbnail_url}
        >
          <Input
            name="video_thumbnail_url"
            defaultValue={initial.video_thumbnail_url ?? ""}
            placeholder="https://…"
            invalid={Boolean(fieldErrors?.video_thumbnail_url)}
          />
        </Field>
      )}
    </>
  );
}
