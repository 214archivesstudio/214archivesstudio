import type { PostSection } from "@/types/database";

/** 어드민 전역에서 쓰는 섹션 목록 (표시 순서 고정). 라벨·설명의 단일 출처. */
export const SECTIONS: ReadonlyArray<{
  readonly value: PostSection;
  readonly label: string;
  readonly note: string;
}> = [
  { value: "showreel", label: "Showreel", note: "단일 영상" },
  { value: "archives", label: "Archives", note: "도시·연도 + 갤러리" },
  { value: "film", label: "Film", note: "영상 + 갤러리" },
  { value: "photography", label: "Photography", note: "클라이언트 + 갤러리" },
  { value: "personal", label: "Personal", note: "갤러리 (영상 선택)" },
];

export const SECTION_LABEL: Record<PostSection, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.value, s.label]),
) as Record<PostSection, string>;
