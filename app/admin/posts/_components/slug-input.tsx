"use client";

import { useEffect, useRef, useState } from "react";
import { Field } from "../../_components/ui/Field";
import { Input } from "../../_components/ui/Input";
import { checkSlugAvailable } from "../_actions/posts";
import type { PostSection } from "@/types/database";

const DEBOUNCE_MS = 400;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const MAX_AUTO_SUFFIX = 50;

/** "2026-08-31" → "26-08-31". Invalid/empty date → "". */
function defaultSlugFromDate(date: string): string {
  const m = DATE_RE.exec(date);
  return m ? `${m[1].slice(2)}-${m[2]}-${m[3]}` : "";
}

/** Taken auto value → next candidate: base → base-2 → base-3 …, null when done. */
function nextAutoCandidate(date: string, current: string): string | null {
  const base = defaultSlugFromDate(date);
  if (base === "" || !current.startsWith(base)) return null;
  const suffix = /^-(\d+)$/.exec(current.slice(base.length));
  if (!suffix && current !== base) return null;
  const next = suffix ? Number(suffix[1]) + 1 : 2;
  return next > MAX_AUTO_SUFFIX ? null : `${base}-${next}`;
}

interface SlugInputProps {
  readonly section: PostSection;
  readonly initialSlug: string;
  /** Edit mode: the post's own row must not count as a conflict. */
  readonly excludeId?: string;
  readonly fieldError?: string;
  /** Create mode: date the default address is derived from. Omit to disable. */
  readonly dateValue?: string;
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
  dateValue,
}: SlugInputProps) {
  const [slug, setSlug] = useState(initialSlug);
  const [result, setResult] = useState<CheckResult | null>(null);

  // 날짜 기반 기본값: 비어 있거나 직전 자동값 그대로면 새 자동값으로 교체.
  // 사용자가 직접 수정한 값은 덮어쓰지 않는다.
  const lastAutoRef = useRef(initialSlug);
  useEffect(() => {
    if (dateValue === undefined) return;
    const auto = defaultSlugFromDate(dateValue);
    setSlug((prev) =>
      prev === "" || prev === lastAutoRef.current ? auto : prev,
    );
    lastAutoRef.current = auto;
  }, [dateValue]);

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
      // 자동값이 이미 사용 중이면 -2, -3… 순번을 붙여 빈 주소를 찾는다.
      // 사용자가 직접 수정한 값(lastAutoRef 와 다른 값)에는 손대지 않는다.
      if (
        !res.data.available &&
        dateValue !== undefined &&
        value === lastAutoRef.current
      ) {
        const candidate = nextAutoCandidate(dateValue, value);
        if (candidate) {
          lastAutoRef.current = candidate;
          setSlug(candidate);
        }
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [checkKey, section, value, excludeId, dateValue]);

  const current = checkKey && result?.key === checkKey ? result : null;
  const taken = current?.available === false;
  const liveMessage = !checkKey
    ? null
    : current === null
      ? "확인 중…"
      : taken
        ? "이미 사용 중인 주소입니다"
        : "사용 가능";

  return (
    <Field
      label="URL 주소"
      required
      hint={`공개 주소: /${section}/${value || "…"}`}
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
