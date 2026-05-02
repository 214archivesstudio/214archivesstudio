---
title: "Conventions"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/project-structure.md
  - CLAUDE.md (project root)
  - ~/.claude/rules/typescript/coding-style.md
---

# Conventions

## TypeScript

- **strict 모드**: 켜져 있음 (`tsconfig.json`)
- **모든 데이터는 readonly**: 인터페이스는 `readonly` 필드, 배열은 `ReadonlyArray<T>`. 데이터 객체는 `as const`.
- **immutability**: 객체 갱신은 spread (`{ ...obj, field: value }`). 절대 mutate 금지.
- **path alias**: `@/*` → 프로젝트 루트 (`tsconfig.json`).

## 파일 크기 / 구성

- 파일 110줄 이하가 일반 (project-structure.md 보고). 200~400줄까지 ok, 800줄 절대 금지.
- 컴포넌트는 도메인/기능별로 묶임 (`layout/`, `ui/`, `common/`).
- `data/`, `types/`, `lib/` 분리 명확.

## 명명

- **컴포넌트 파일**: `PascalCase.tsx` (`ThumbnailGrid.tsx`)
- **utility 파일**: `camelCase.ts` (`cloudinary.ts`, `utils.ts`)
- **데이터 파일**: 복수형 `{section}s.ts` (`archives.ts`, `films.ts`)
- **slug**: kebab-case (`22-london`, `lookbook-bready`)
- **Cloudinary publicId**: `214archives/{section}/{slug}/{filename}` 패턴

## Cloudinary 사용 규칙

- `next-cloudinary`의 `CldImage` 컴포넌트로 렌더 (자동 AVIF + WebP 포맷, srcSet, lazy).
- 배경/preload용 URL은 `getCldImageUrl()`로 생성.
- `next.config.ts`의 `remotePatterns`에 Cloudinary, YouTube, Vimeo 도메인 등록.
- 환경변수 미설정 시 `"placeholder"` 폴백 — dev 경고 추가 권장 (현재 silent failure).

## 컴포넌트 작성

- `"use client"` 필요한 곳에만 (이상적으론 leaf 컴포넌트). 단 현재 코드는 거의 모든 page에 client directive 있음 — 리팩터 대상.
- props는 인터페이스로 별도 정의 (`types/index.ts`의 `*Props`).
- 외부 링크는 항상 `rel="noopener noreferrer"`.

## 스타일

- Tailwind utility 우선. 커스텀 CSS는 `globals.css`에만.
- Tailwind 4 CSS-first config (`tailwind.config.ts`에 `theme.extend`).
- 다크 테마 고정. 라이트 테마 없음.

## Git / 커밋 메시지

루트 `CLAUDE.md`와 `~/.claude/rules/common/git-workflow.md` 따름:
- format: `<type>: <description>` (feat/fix/refactor/docs/test/chore/perf/ci)
- 한 번에 하나의 변경
- 새 commit > amend (--amend는 사용자 명시 시에만)
- 비밀값 절대 커밋 금지

## 보안

- 시크릿은 환경변수로만. 하드코딩 금지.
- 외부 링크 `rel="noopener noreferrer"` (이미 적용).
- 사용자 입력 없으니 SQL/XSS는 무관 — 단 향후 contact form 추가 시 검증 필요.

## 테스팅 (현재 없음, 권장)

- 프레임워크 부재. 권장 스택: Jest + React Testing Library + Playwright (E2E).
- `lib/utils.ts` 같은 순수 함수부터 단위 테스트 추가.

## 모르는 영역 (확인 필요)

- ESLint 규칙: `next/core-web-vitals`만. `no-console`, `no-explicit-any`, `no-unused-vars` 강화 권장.
- Prettier 설정 (`.prettierrc` 미확인).

## See also

- [[codebase/architecture]]
- [[codebase/data-layer]]
- 루트 `CLAUDE.md` (이 wiki의 부모 디렉토리)
