---
title: "Architecture"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/기획서.md
  - raw/project-structure.md
  - CLAUDE.md (project root)
---

# Architecture

## Summary

Next.js (App Router) 기반의 정적 콘텐츠 포트폴리오 사이트. 모든 미디어는 Cloudinary CDN으로 서빙되고, 콘텐츠는 코드(`data/*.ts`)에 정적으로 정의됩니다. DB도 CMS도 없습니다. Vercel에 배포되며 트래픽이 적은 한 운영비는 도메인 비용만 발생합니다.

## 기술 스택 (현재 코드 기준)

| 분류 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 16.1 |
| 언어 | TypeScript (strict) | 5.9 |
| UI | React | 19.2 |
| 스타일링 | Tailwind CSS (CSS-first) | 4.1 |
| 애니메이션 | Framer Motion | 12.x |
| 이미지 | next-cloudinary | 6.x |
| 영상 호스팅 | YouTube / Vimeo (임베드) | — |
| 배포 | Vercel | — |

## 3-layer 구조

```
┌─────────────────────────────────────────────┐
│  app/  (App Router pages)                    │
│   ├─ {section}/page.tsx       — list view    │
│   └─ {section}/[id]/page.tsx  — detail view  │
└─────────────────────────────────────────────┘
                 ↓ uses
┌─────────────────────────────────────────────┐
│  components/                                 │
│   ├─ layout/  (Header, BackgroundLayer …)    │
│   ├─ ui/      (ThumbnailGrid, Lightbox …)    │
│   └─ common/  (FadeIn, ScrollReveal)         │
└─────────────────────────────────────────────┘
                 ↓ reads
┌─────────────────────────────────────────────┐
│  data/  (typed static content)               │
│   ├─ navigation.ts                           │
│   ├─ archives.ts        (14)                 │
│   ├─ showreels.ts       (1)                  │
│   ├─ photography.ts     (6)                  │
│   ├─ personal.ts        (2)                  │
│   └─ films.ts                                │
│  + types/index.ts (모든 인터페이스)           │
│  + lib/cloudinary.ts (URL 빌더, srcSet)       │
└─────────────────────────────────────────────┘
```

자세한 라우팅: [[codebase/routing]]
자세한 데이터 모델: [[codebase/data-layer]]
컴포넌트 카탈로그: [[codebase/components]]

## 핵심 디자인 결정

### 1. 모든 페이지가 client component
`"use client"`가 거의 모든 page에 붙어 있습니다 (예외: `showreel/[id]`만 서버 컴포넌트). 이유는 framer-motion과 hover 인터랙션을 직접 다루기 위함. **트레이드오프**: SSR 이점 일부 포기, 첫 페이지 hydration 비용 증가. 향후 page는 서버 컴포넌트로 두고 애니메이션 부분만 분리하는 리팩터가 권장됨 (project-structure.md §"코드 리뷰 결과 요약"에도 명시).

### 2. 정적 데이터 + Cloudinary
콘텐츠 추가 = `data/*.ts` 편집 + Cloudinary에 이미지 업로드. CMS 없이도 충분히 운영 가능한 규모(작품 30개대). 장점: 빌드 시 모든 콘텐츠 검증, 타입 안전성. 단점: 비기술 사용자가 직접 콘텐츠 추가 불가.

### 3. 인터랙티브 배경 레이어 (전역 상태)
`BackgroundContext` + `useHoverBackground` hook으로 페이지 어디서든 썸네일 hover 시 배경을 바꿉니다. 단일 `BackgroundLayer` 컴포넌트가 layout에 박혀서 영상/이미지 cross-fade를 담당. → [[codebase/components#background-system]]

### 4. 매체별 디테일 페이지 패턴
- **사진**: 세로 스크롤 갤러리 + Lightbox (4×3 grid on desktop)
- **영상**: VideoPlayer 임베드 (YouTube/Vimeo)
- **사진+영상 (personal)**: media 배열을 순회하며 타입 가드(`isVideoEmbed`)로 분기

## 환경 변수

| 변수 | 필수 | 설명 |
|---|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | O | Cloudinary 클라우드명. 미설정 시 `"placeholder"` 폴백 (dev 경고 권장 — 미구현) |
| `NEXT_PUBLIC_SITE_URL` | - | 메타데이터용 |

## 향후 작업

- 접근성: skip link, Lightbox `role="dialog"` + 포커스 트랩
- 이미지 alt 개선 (현재 generic)
- detail page 패턴 통일 (서버 컴포넌트화)
- CSP 헤더, ESLint 규칙 강화 (`no-console`, `no-explicit-any`)
- 테스트 인프라 부재 (Jest + RTL + Playwright)

## See also

- [[codebase/routing]]
- [[codebase/data-layer]]
- [[codebase/components]]
- [[codebase/design-system]]
- [[codebase/conventions]]
- [[overview]]
