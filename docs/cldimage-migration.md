# CldImage Migration: `<img>` → next-cloudinary

## Overview

모든 Cloudinary 이미지를 수동 `<img src={buildCloudinaryUrl(...)}>` 방식에서 `next-cloudinary`의 `CldImage` / `getCldImageUrl()`로 전환하여 자동 이미지 최적화를 적용한 마이그레이션 기록.

### Before / After

| 항목 | 이전 | 이후 |
|------|------|------|
| 렌더링 | `<img src={buildCloudinaryUrl(...)}>` | `<CldImage>` / `getCldImageUrl()` |
| srcSet | 없음 (고정 크기 1장) | `sizes` 기반 자동 생성 |
| 포맷 | `f_auto` (수동 파라미터) | `f_auto` (CldImage 기본값) |
| 품질 | `q_80` 고정 | `q_auto` (Cloudinary AI 판단) |
| priority | 없음 (전부 lazy) | above-fold 이미지 즉시 로드 |
| lazy loading | 수동 `loading="lazy"` | CldImage 기본값 |
| URL 빌더 | `lib/cloudinary.ts` (자체 구현) | `next-cloudinary` 내장 |

---

## 전환 패턴

### 패턴 A: CldImage (일반 이미지)

고정 `width`/`height`를 지정하고, `sizes`로 뷰포트별 렌더링 크기를 선언.

```tsx
import { CldImage } from "next-cloudinary";

<CldImage
  src="publicId"           // Cloudinary publicId (URL 아님)
  width={600}
  height={400}
  alt="..."
  sizes="(max-width: 768px) 100vw, 33vw"
  quality="auto"
  priority={isAboveFold}   // 첫 화면 이미지만 true
/>
```

**적용 파일**: contact, ThumbnailGrid, archives/[id], photography/[id], personal/[id]

### 패턴 B: CldImage + fill (컨테이너 기반)

부모 요소가 크기를 결정하는 경우. `width`/`height` 대신 `fill` 사용.

```tsx
<div className="relative h-[60vh] w-[40vw]">
  <CldImage
    src="publicId"
    fill
    sizes="40vw"
    quality="auto"
    alt="..."
    className="object-cover"
  />
</div>
```

**적용 파일**: HorizontalSlider

### 패턴 C: getCldImageUrl (framer-motion 호환)

`<motion.img>`처럼 CldImage로 감쌀 수 없는 경우, URL만 생성.

```tsx
import { getCldImageUrl } from "next-cloudinary";

const url = getCldImageUrl({
  src: "publicId",
  width: 1920,
  height: 1280,
  quality: "auto",
  format: "auto",
});

<motion.img src={url} />
```

**적용 파일**: Lightbox (`motion.img` 유지), layout.tsx (BackgroundLayer URL)

---

## 변경 파일 목록

| 순서 | 파일 | 패턴 | 변경 내용 |
|------|------|------|----------|
| 1 | `app/contact/page.tsx` | A | `priority`, `sizes="400px"`, 400x600 |
| 2 | `components/ui/ThumbnailGrid.tsx` | A | columns별 responsive sizes 분기 (2/3/4열) |
| 3 | `app/archives/[id]/page.tsx` | A | `priority={index < 4}` (첫 4장 즉시 로드) |
| 4 | `app/photography/[id]/page.tsx` | A | `priority={index === 0}` (첫 1장 즉시 로드) |
| 5 | `app/personal/[id]/page.tsx` | A | 비디오 분기 유지, 이미지만 CldImage 전환 |
| 6 | `components/ui/HorizontalSlider.tsx` | B | fill 모드, `sizes="(max-width: 640px) 280px, 40vw"` |
| 7 | `components/ui/Lightbox.tsx` | C | `getCldImageUrl`, `motion.img` 유지 |
| 8 | `app/layout.tsx` | C | `getCldImageUrl`로 배경 이미지 URL 생성 |
| 9 | `lib/cloudinary.ts` | - | 삭제 (모든 import 제거 확인 후) |

---

## ThumbnailGrid sizes 분기

`columns` prop에 따라 `sizes` 값이 달라짐:

```ts
const columnSizes = {
  2: "(max-width: 768px) 100vw, 50vw",
  3: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
  4: "(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw",
};
```

---

## Priority 전략

| 페이지 | 규칙 | 이유 |
|--------|------|------|
| `/contact` | `priority` (항상) | 단일 이미지, above-fold |
| `/archives/[id]` | `index < 4` | 2-4열 그리드, 첫 행 |
| `/photography/[id]` | `index === 0` | 세로 스택, 첫 장만 visible |
| `/personal/[id]` | `index === 0` | 첫 미디어가 이미지인 경우만 |
| ThumbnailGrid | 없음 | 목록 페이지, 전부 lazy |
| HorizontalSlider | 없음 | 가로 스크롤, 전부 lazy |

---

## 삭제된 코드

### lib/cloudinary.ts

세 함수 모두 삭제:

- `buildCloudinaryUrl()` — 모든 사용처가 CldImage/getCldImageUrl로 전환
- `buildBlurPlaceholder()` — 정의만 되고 미사용 상태였음
- `buildResponsiveSrcSet()` — 정의만 되고 미사용 상태였음

---

## 향후 이미지 추가 시 가이드

1. **일반 이미지**: 패턴 A (`CldImage` + `width`/`height` + `sizes`)
2. **컨테이너가 크기 결정**: 패턴 B (`CldImage fill` + `sizes`)
3. **framer-motion / 커스텀 태그 필요**: 패턴 C (`getCldImageUrl`)
4. `quality`는 항상 `"auto"` 사용
5. above-fold 이미지에만 `priority` 추가
6. `publicId`는 Cloudinary 대시보드의 public ID 그대로 전달 (URL 아님)

---

## 환경 설정

`next-cloudinary`가 자동으로 읽는 환경변수:

```
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dmsvmpsp5
```

`next.config.ts`에 `images.remotePatterns`으로 `res.cloudinary.com` 이미 등록되어 있음.
