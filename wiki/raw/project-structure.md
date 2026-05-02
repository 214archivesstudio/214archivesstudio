# 214 Archives Studio - 프로젝트 구조 문서

> 사진작가/영상작가 포트폴리오 웹사이트
> 최종 업데이트: 2025-02-10 (초기 스캐폴딩 완료)

---

## 기술 스택

| 분류 | 기술 | 버전 | 용도 |
|------|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1 | SSR/SSG, 라우팅, 이미지 최적화 |
| 언어 | TypeScript | 5.9 | 정적 타입 검사, strict 모드 |
| UI | React | 19.2 | 컴포넌트 기반 UI |
| 스타일링 | Tailwind CSS | 4.1 | 유틸리티 퍼스트 CSS |
| 애니메이션 | Framer Motion | 12.x | 페이지 전환, 스크롤, 호버 효과 |
| 이미지 CDN | Cloudinary (next-cloudinary) | 6.x | 이미지 변환, 반응형 최적화 |
| 배포 | Vercel | - | 정적/서버 배포 |

---

## 디렉토리 트리

```
214archivesstudio/
├── app/                          # Next.js App Router 페이지
│   ├── layout.tsx                #   루트 레이아웃 (메타데이터, 헤더, 배경)
│   ├── page.tsx                  #   홈 페이지 (/)
│   ├── archives/
│   │   ├── page.tsx              #   아카이브 목록 (/archives)
│   │   └── [id]/
│   │       └── page.tsx          #   아카이브 상세 (/archives/:id)
│   ├── showreel/
│   │   ├── page.tsx              #   쇼릴 목록 (/showreel)
│   │   └── [id]/
│   │       └── page.tsx          #   쇼릴 상세 (/showreel/:id)
│   ├── photography/
│   │   ├── page.tsx              #   사진 목록 (/photography)
│   │   └── [id]/
│   │       └── page.tsx          #   사진 상세 (/photography/:id)
│   ├── personal/
│   │   ├── page.tsx              #   개인 작업 목록 (/personal)
│   │   └── [id]/
│   │       └── page.tsx          #   개인 작업 상세 (/personal/:id)
│   ├── film/
│   │   └── page.tsx              #   필름 (/film) - Coming Soon
│   └── contact/
│       └── page.tsx              #   연락처 (/contact)
│
├── components/                   # 재사용 가능한 컴포넌트
│   ├── layout/                   #   레이아웃 관련
│   │   ├── BackgroundLayer.tsx   #     고정 배경 (이미지/비디오 크로스페이드)
│   │   ├── Header.tsx            #     고정 헤더 (스튜디오명 + 네비게이션 + 로고)
│   │   ├── Navigation.tsx        #     데스크톱 가로 메뉴
│   │   └── MobileMenu.tsx        #     모바일 풀스크린 메뉴
│   ├── ui/                       #   UI 위젯
│   │   ├── ThumbnailGrid.tsx     #     N열 썸네일 그리드 (2/3/4열)
│   │   ├── HorizontalSlider.tsx  #     수평 스크롤 슬라이더 (스냅)
│   │   ├── Lightbox.tsx          #     풀스크린 이미지 뷰어 (키보드 네비게이션)
│   │   ├── VideoPlayer.tsx       #     YouTube/Vimeo iframe 임베드
│   │   └── LoadingAnimation.tsx  #     "214" 로고 인트로 애니메이션
│   └── common/                   #   범용 애니메이션 래퍼
│       ├── FadeIn.tsx            #     방향별 페이드인 (상/하/좌/우)
│       └── ScrollReveal.tsx      #     스크롤 트리거 등장 효과
│
├── data/                         # 정적 콘텐츠 데이터
│   ├── navigation.ts             #   네비게이션 항목, SNS 링크, SITE_CONFIG
│   ├── showreels.ts              #   쇼릴 데이터 (1개 플레이스홀더)
│   ├── archives.ts               #   아카이브 데이터 (14개 도시)
│   ├── photography.ts            #   사진 프로젝트 데이터 (6개 프로젝트)
│   └── personal.ts               #   개인 작업 데이터 (2개 프로젝트)
│
├── types/                        # TypeScript 타입 정의
│   └── index.ts                  #   전체 인터페이스 (미디어, 콘텐츠, Props)
│
├── lib/                          # 유틸리티 함수
│   ├── cloudinary.ts             #   Cloudinary URL 빌더, 블러 플레이스홀더, srcSet
│   └── utils.ts                  #   cn(), slugify(), formatArchiveYear(), delay()
│
├── styles/                       # 글로벌 스타일
│   └── globals.css               #   Pretendard 폰트, 다크 테마, 스크롤바, 유틸리티
│
├── public/                       # 정적 에셋
│   ├── logo/
│   │   └── 214-logo.svg          #   "214" 텍스트 SVG 로고
│   ├── images/                   #   (이미지 에셋 - 추후 추가)
│   └── videos/                   #   (비디오 에셋 - 추후 추가)
│
├── tailwind.config.ts            # Tailwind 설정 (색상, 폰트, 브레이크포인트, 애니메이션)
├── next.config.ts                # Next.js 설정 (이미지 도메인, 포맷)
├── tsconfig.json                 # TypeScript 설정 (strict, 경로 별칭 @/*)
├── eslint.config.mjs             # ESLint 설정 (next/core-web-vitals)
├── postcss.config.mjs            # PostCSS 설정 (Tailwind CSS 4)
├── package.json                  # 의존성, 스크립트
├── .env.example                  # 환경변수 템플릿
├── .gitignore                    # Git 무시 파일
├── 214Archives_기획서.md          # 기획 문서
└── 홈페이지 UI PDF.pdf            # UI 디자인 참고
```

---

## 라우트 맵

| 경로 | 파일 | 렌더링 방식 | 설명 |
|------|------|-------------|------|
| `/` | `app/page.tsx` | 정적 (Static) | 스튜디오명 + 태그라인, 인트로 애니메이션 |
| `/showreel` | `app/showreel/page.tsx` | 정적 | 3열 썸네일 그리드 |
| `/showreel/:id` | `app/showreel/[id]/page.tsx` | SSG (`generateStaticParams`) | 비디오 플레이어 + 설명 |
| `/archives` | `app/archives/page.tsx` | 정적 | 3열 그리드 (14개 도시) |
| `/archives/:id` | `app/archives/[id]/page.tsx` | 동적 (Dynamic) | 4열 사진 그리드 + 라이트박스 |
| `/film` | `app/film/page.tsx` | 정적 | "Coming Soon" 플레이스홀더 |
| `/photography` | `app/photography/page.tsx` | 정적 | 수평 스크롤 슬라이더 |
| `/photography/:id` | `app/photography/[id]/page.tsx` | 동적 | 세로 사진 리스트 + 라이트박스 |
| `/personal` | `app/personal/page.tsx` | 정적 | 2열 썸네일 그리드 |
| `/personal/:id` | `app/personal/[id]/page.tsx` | 동적 | 사진/비디오 혼합 레이아웃 |
| `/contact` | `app/contact/page.tsx` | 정적 | SNS 링크 목록 |

---

## 컴포넌트 의존성 그래프

```
app/layout.tsx
├── components/layout/BackgroundLayer.tsx   ← framer-motion, types/BackgroundMedia
├── components/layout/Header.tsx
│   ├── components/layout/Navigation.tsx    ← data/navigation, lib/utils
│   └── components/layout/MobileMenu.tsx    ← data/navigation, lib/utils
└── styles/globals.css

app/page.tsx
└── components/ui/LoadingAnimation.tsx      ← framer-motion
    data/navigation.ts (SITE_CONFIG)

app/archives/page.tsx
├── components/common/FadeIn.tsx            ← framer-motion
├── components/ui/ThumbnailGrid.tsx         ← framer-motion, lib/cloudinary
├── data/archives.ts
└── lib/utils.ts (formatArchiveYear)

app/archives/[id]/page.tsx
├── components/common/FadeIn.tsx
├── components/ui/Lightbox.tsx              ← framer-motion, lib/cloudinary
├── data/archives.ts
└── lib/cloudinary.ts

app/showreel/[id]/page.tsx                  (서버 컴포넌트)
├── components/common/FadeIn.tsx
├── components/ui/VideoPlayer.tsx
└── data/showreels.ts

app/photography/page.tsx
├── components/common/FadeIn.tsx
├── components/ui/HorizontalSlider.tsx      ← framer-motion, lib/cloudinary
└── data/photography.ts

app/personal/[id]/page.tsx
├── components/common/FadeIn.tsx
├── components/ui/VideoPlayer.tsx
├── lib/cloudinary.ts
├── data/personal.ts
└── types/index.ts (isVideoEmbed 타입 가드)
```

---

## 타입 시스템

### 핵심 인터페이스 (`types/index.ts`)

```
미디어 타입
├── CloudinaryImage    { publicId, alt, width, height }
├── VideoEmbed         { platform: "youtube"|"vimeo", videoId, title }
└── BackgroundMedia    { type: "image"|"video", src, overlayOpacity? }

콘텐츠 타입
├── ShowreelItem       { id, title, year, thumbnail, video, description? }
├── ArchiveItem        { id, city, year, thumbnail, photos[], description? }
├── PhotographyItem    { id, title, client, thumbnail, photos[], description? }
└── PersonalWorkItem   { id, title, thumbnail, media[], description? }

네비게이션 타입
├── NavItem            { label, href }
└── SocialLink         { platform, url, label }

컴포넌트 Props
├── ThumbnailGridProps       { items[], basePath, columns?, onHover? }
├── HorizontalSliderProps    { items[], basePath }
├── LightboxProps            { images[], initialIndex, onClose }
└── VideoPlayerProps         { video, autoPlay? }
```

모든 필드는 `readonly`, 배열은 `ReadonlyArray<T>` 적용.

---

## 데이터 구조

| 파일 | 항목 수 | 상세 |
|------|---------|------|
| `data/navigation.ts` | 6 + 3 | NAV_ITEMS 6개, SOCIAL_LINKS 3개(Instagram, YouTube, Vimeo) |
| `data/showreels.ts` | 1 | 2025 Showreel (플레이스홀더 videoId) |
| `data/archives.ts` | 14 | Shanghai, Taipei, Tokyo, Miyakojima, New York, Dubai, Hong Kong, Ho Chi Minh, Sydney, Melbourne, Rome, Interlaken, Paris, London |
| `data/photography.ts` | 6 | CAU Fashion, KimAeYoung, LARK, YOUTH, B.Ready, NOT4NERD |
| `data/personal.ts` | 2 | PONY Project, About Me Project (플레이스홀더 videoId) |

데이터 파일에서 팩토리 함수(`createArchive`, `createPhotographyItem`)를 사용하여 반복적인 플레이스홀더 생성을 자동화하고 있으며, 모두 `as const`로 불변 처리됨.

---

## 디자인 시스템

### 색상 체계

| 변수 | 값 | 용도 |
|------|-----|------|
| `--color-background` | `#1A1A1A` | 전체 배경색 |
| `--color-foreground` | `#FFFFFF` | 기본 텍스트 |
| `--color-accent` | `#CCCCCC` | 보조 텍스트, 설명 |
| `--color-muted` | `#888888` | 비활성 텍스트, 메타 정보 |
| `--color-overlay` | `rgba(0,0,0,0.6)` | 이미지 위 오버레이 |

### 폰트

**기본**: Pretendard Variable (CDN) → Noto Sans KR → system-ui

### 반응형 브레이크포인트

| 이름 | 값 | 대상 |
|------|-----|------|
| `sm` | 480px | 소형 모바일 |
| `md` | 768px | 태블릿 / 모바일 메뉴 전환점 |
| `lg` | 1280px | 데스크톱 |
| `xl` | 1440px | 대형 데스크톱 |

### 애니메이션

| 이름 | 동작 | 사용처 |
|------|------|--------|
| `fade-in` | 아래→위 20px 이동 + 투명→불투명 (0.6s) | 범용 등장 |
| `fade-out` | 불투명→투명 (0.4s) | 퇴장 |
| `slide-up` | 아래→위 100% 슬라이드 (0.5s) | 모달, 메뉴 |
| `logo-rise` | 아래→위 40px + 0.95→1 스케일 (1.2s) | 홈 인트로 |

---

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | O | Cloudinary 클라우드명. 미설정 시 `"placeholder"` 폴백 사용 |
| `NEXT_PUBLIC_SITE_URL` | - | 사이트 URL (메타데이터용) |

---

## 코드 리뷰 결과 요약

### 현재 상태: 개발 준비 완료 (90/100)

**빌드 검증**: `tsc` 0 에러, `eslint` 0 에러, `next build` 성공

### 잘 된 점

- TypeScript strict 모드 + `readonly` 전면 적용으로 불변성 보장
- `components/` 3계층 분리 (layout, ui, common) 명확한 역할 구분
- 모든 파일 110줄 이하로 작고 집중된 파일 구조
- Cloudinary URL 빌더로 이미지 최적화 로직 중앙화
- `as const` + `ReadonlyArray` 로 데이터 불변성 보장
- 보안: 하드코딩된 비밀값 없음, 외부 링크 `rel="noopener noreferrer"` 적용

### 개선 필요 사항

| 우선순위 | 항목 | 상세 |
|----------|------|------|
| **높음** | 접근성 보완 | Header에 skip navigation 링크 추가, Lightbox에 `role="dialog"` 및 포커스 트랩 추가 필요 |
| **높음** | 이미지 alt 텍스트 개선 | `"Shanghai photo 1"` 같은 제너릭 alt 대신 설명적인 대체 텍스트 필요 |
| **중간** | 상세 페이지 패턴 불일치 | `showreel/[id]`만 서버 컴포넌트(async + `generateStaticParams`), 나머지는 클라이언트 컴포넌트(`useParams`). 통일 필요 |
| **중간** | 타입 가드 공유 | `isVideoEmbed()`가 `personal/[id]/page.tsx`에만 존재. `lib/utils.ts`로 이동하여 재사용 가능하게 변경 |
| **중간** | Cloudinary 에러 처리 | `CLOUD_NAME`이 `"placeholder"`일 때 무음 실패. 개발 환경에서 경고 또는 폴백 이미지 필요 |
| **중간** | ESLint 규칙 보강 | `no-console`, `no-explicit-any`, `no-unused-vars` 규칙 추가 권장 |
| **낮음** | 서버 컴포넌트 최적화 | 페이지 자체는 서버 컴포넌트로 전환하고, 애니메이션 부분만 클라이언트 컴포넌트로 분리하면 성능 향상 |
| **낮음** | CSP 헤더 | `next.config.ts`에 Content Security Policy 추가 권장 |
| **낮음** | 테스트 인프라 | 현재 테스트 파일 없음. Jest + React Testing Library + Playwright 설정 필요 |

---

## NPM 스크립트

```bash
npm run dev      # 개발 서버 실행
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행
```

---

## 향후 작업 로드맵

1. **콘텐츠 교체**: 플레이스홀더 Cloudinary publicId와 videoId를 실제 값으로 교체
2. **접근성**: skip link, ARIA 레이블, 포커스 관리 구현
3. **서버 컴포넌트 전환**: 가능한 페이지를 서버 컴포넌트로 전환하여 성능 최적화
4. **테스트**: 유틸리티 함수 단위 테스트, 주요 라우트 E2E 테스트 추가
5. **SEO**: 각 페이지별 메타데이터, 구조화된 데이터(JSON-LD) 추가
6. **배포**: Vercel 연동, Cloudinary 환경변수 설정, 도메인 연결
