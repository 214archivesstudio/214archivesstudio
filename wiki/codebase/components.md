---
title: "Components"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/project-structure.md
  - CLAUDE.md (project root)
---

# Components

세 계층으로 정리됩니다. 모든 파일 110줄 이하로 작고 집중된 구조.

```
components/
├── layout/   ← 페이지 골격
├── ui/       ← 재사용 위젯
└── common/   ← 애니메이션 래퍼
```

## layout/

### Header
- 좌상단 스튜디오명 + 태그라인, 우상단 214 로고. 투명 배경 (콘텐츠 위에 떠 있음).
- `Navigation`, `MobileMenu`를 host.

### Navigation
- Desktop 가로 메뉴. `data/navigation.ts`의 `NAV_ITEMS` 사용.
- 호버 시 미묘한 스케일 또는 언더라인.

### MobileMenu
- 햄버거 → 풀스크린 세로 메뉴.
- `md` 미만에서만 표시.

### BackgroundLayer (= "Background System") {#background-system}
- 페이지 전체에 깔리는 고정 배경. 이미지·비디오 cross-fade.
- `BackgroundContext` (전역 상태) + `useHoverBackground` hook 으로 동작:
  - 썸네일 hover → context dispatch → BackgroundLayer가 새 미디어로 fade.
  - hover out → 기본 배경 복귀.
- `BackgroundMedia` 타입: `{ type, src, overlayOpacity? }`.
- 호버 시에만 비디오 로드(지연 로딩) — 데이터 절약.

## ui/

### ThumbnailGrid
- 책임: N열 (2/3/4) 반응형 그리드. Framer Motion stagger 애니메이션. hover 스케일.
- Props: `items[]`, `basePath`, `columns?`, `onHover?`
- 사용처: Showreel, Archives 목록, Personal 목록.

### HorizontalSlider
- 가로 스크롤 + wheel 캡처 + drag/pointer 지원 + 좌우 화살표 + scroll snap.
- Photography 목록에서만 사용 (mobile은 세로 스크롤로 fallback).
- 호버 텍스트 (작품 제목 페이드인/아웃).

### Lightbox
- 풀스크린 이미지 뷰어.
- 키보드 네비게이션 (←/→, ESC), 배경 클릭으로 닫기.
- 인접 이미지 preload (성능).
- ⚠️ 접근성 미비: `role="dialog"` + 포커스 트랩 추가 필요 ([[codebase/architecture#향후-작업]]).

### VideoPlayer
- YouTube/Vimeo iframe 임베드.
- `VideoEmbed` 타입의 `platform` + `videoId`로 분기.
- `autoPlay?` prop.

### LoadingAnimation
- 홈 진입 인트로. 검은 배경 → "214" 로고 하단→상단 + 페이드인 → 메인 콘텐츠로 전환.
- `logo-rise` 애니메이션 (1.2s).
- 1회만 재생 (아마도 sessionStorage 또는 prop).

## common/

### FadeIn
- 방향별 페이드인 (상/하/좌/우 옵션).
- Framer Motion 래퍼. 자식 콘텐츠 등장 시 0.6s 페이드.

### ScrollReveal
- 스크롤 트리거로 자식 등장 애니메이션 발동.
- IntersectionObserver 기반으로 추정.

## 의존성 그래프 (요약)

- 루트 layout이 `BackgroundLayer` + `Header` 박힘.
- 모든 list page는 `FadeIn` + 그리드/슬라이더 + 데이터.
- detail page는 `FadeIn` + Lightbox 또는 VideoPlayer + 데이터.

자세한 그래프: [[raw/project-structure#컴포넌트-의존성-그래프]]

## 글로벌 상태

| state | 위치 | 용도 |
|---|---|---|
| `BackgroundContext` | `context/BackgroundContext.tsx` (추정) | 페이지 hover 배경 변경 |

이외 글로벌 상태 없음 (Redux/Zustand 등 없음). page-local 상태로 충분.

## See also

- [[codebase/architecture]]
- [[codebase/design-system]]
- [[codebase/data-layer]]
