"use client";

import { useEffect, useState } from "react";
import { Field } from "../../_components/ui/Field";
import { Input } from "../../_components/ui/Input";
import { checkSlugAvailable } from "../_actions/posts";
import type { PostSection } from "@/types/database";

const DEBOUNCE_MS = 400;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

interface SlugInputProps {
  readonly section: PostSection;
  readonly initialSlug: string;
  /** Edit mode: the post's own row must not count as a conflict. */
  readonly excludeId?: string;
  readonly fieldError?: string;
}

interface CheckResult {
  readonly key: string;
  readonly available: boolean;
}

/**
 * Slug field with debounced availability check. Advisory only — submission is
 * never blocked here; the DB unique constraint stays the final gate.
 */
export function SlugInput({
  section,
  initialSlug,
  excludeId,
  fieldError,
}: SlugInputProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [result, setResult] = useState<CheckResult | null>(null);

  const value = slug.trim();
  // 형식이 안 맞으면 서버 zod 가 잡는다. 여기선 유일성만 본다.
  const shouldCheck =
    SLUG_RE.test(value) && !(excludeId && value === initialSlug);
  const checkKey = shouldCheck ? `${section}:${value}` : null;

  useEffect(() => {
    if (!checkKey) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      const res = await checkSlugAvailable(section, value, excludeId);
      if (cancelled || !res.ok || !res.data) return;
      setResult({ key: checkKey, available: res.data.available });
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkKey, section, value, excludeId]);

  const current = checkKey && result?.key === checkKey ? result : null;
  const taken = current?.available === false;
  const liveMessage = !checkKey
    ? null
    : current === null
      ? "확인 중…"
      : taken
        ? "이미 사용 중인 슬러그입니다"
        : "사용 가능";

  return (
    <Field
      label="슬러그"
      required
      hint="kebab-case · 섹션 내 유일"
      error={fieldError}
    >
      <Input
        name="slug"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        placeholder="25-tokyo"
        invalid={Boolean(fieldError) || taken}
        aria-describedby="slug-live"
      />
      {!fieldError && liveMessage && (
        <p
          id="slug-live"
          aria-live="polite"
          className={
            taken
              ? "mt-1 text-[11px] text-[#d6a877]"
              : "mt-1 text-[11px] text-[#666]"
          }
        >
          {liveMessage}
        </p>
      )}
    </Field>
  );
}
