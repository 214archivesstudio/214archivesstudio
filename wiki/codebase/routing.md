---
title: "Routing"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/project-structure.md
  - raw/기획서.md
---

# Routing

App Router 기반. 각 콘텐츠 섹션은 `page.tsx`(목록) + `[id]/page.tsx`(상세) 쌍을 따릅니다.

## 라우트 맵

| 경로 | 파일 | 렌더링 | 설명 |
|---|---|---|---|
| `/` | `app/page.tsx` | Static | 홈 — 인트로 애니메이션 + 태그라인 |
| `/showreel` | `app/showreel/page.tsx` | Static | 3열 썸네일 그리드 |
| `/showreel/[id]` | `app/showreel/[id]/page.tsx` | **SSG** (`generateStaticParams`) | 영상 플레이어 + 설명 |
| `/archives` | `app/archives/page.tsx` | Static | 3열 그리드 (13~14개 도시) |
| `/archives/[id]` | `app/archives/[id]/page.tsx` | Dynamic | 4열 사진 그리드 + Lightbox |
| `/film` | `app/film/page.tsx` | Static | 필름 목록 |
| `/photography` | `app/photography/page.tsx` | Static | 가로 슬라이더 + hover 텍스트 |
| `/photography/[id]` | `app/photography/[id]/page.tsx` | Dynamic | 세로 사진 리스트 + Lightbox |
| `/personal` | `app/personal/page.tsx` | Static | 2열 썸네일 그리드 |
| `/personal/[id]` | `app/personal/[id]/page.tsx` | Dynamic | 사진/영상 혼합 |
| `/contact` | `app/contact/page.tsx` | Static | SNS 링크 목록 |

## 패턴 일관성 이슈

- **`showreel/[id]`만 서버 컴포넌트** (`async` + `generateStaticParams`). 나머지 detail page는 `"use client"` + `useParams()`. 통일 권장 (서버 컴포넌트 + 애니메이션 부분만 클라이언트로 분리하면 성능 향상). project-structure.md §"코드 리뷰 결과" 참조.

## list view 패턴별

| 섹션 | 컴포넌트 | 비고 |
|---|---|---|
| Showreel | `ThumbnailGrid` (3열) | hover 시 배경 영상 |
| Archives | `ThumbnailGrid` (3열) | hover 시 배경 이미지 |
| Photography | `HorizontalSlider` | desktop only — mobile은 세로 스크롤로 fallback |
| Personal | `ThumbnailGrid` (2열) | — |
| Film | (현재 코드 확인 필요) | 기획서엔 "추후 콘텐츠 추가 예정"이지만 CSV에 8개 있음 — 갱신됨 |

## detail view 패턴별

| 섹션 | 패턴 |
|---|---|
| Archives | 4×3 그리드 → 사진 클릭 시 Lightbox 풀스크린 |
| Photography | 세로 스크롤 리스트 → Lightbox |
| Personal | media[] 순회, 타입 가드로 image/video 분기 |
| Showreel / Film | VideoPlayer 임베드 (YouTube/Vimeo iframe) |

## See also

- [[codebase/architecture]]
- [[codebase/components]]
- [[codebase/data-layer]]
