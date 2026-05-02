---
title: "Data Layer"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/project-structure.md
  - types/index.ts
---

# Data Layer

콘텐츠는 정적입니다. DB도 CMS도 없고, `data/*.ts`의 typed array만 있습니다. 모든 인터페이스는 `types/index.ts`에 모이고 `readonly` + `ReadonlyArray<T>`로 불변입니다.

## 데이터 파일

| 파일 | 항목 수 | 내용 |
|---|---|---|
| `data/navigation.ts` | NAV 6 + SNS 3 | 메뉴, SNS(Instagram/YouTube/Vimeo), `SITE_CONFIG` |
| `data/showreels.ts` | 1 | 2025 Showreel |
| `data/archives.ts` | 14 | 도시별 여행 (CSV는 13개 — [[overview#발견된-contradiction-lint-후보]]) |
| `data/films.ts` | (확인 필요) | 기획서엔 미정의, CSV엔 8개 |
| `data/photography.ts` | 6 | CAU Fashion, KimAeYoung, LARK, YOUTH, B.Ready, NOT4NERD |
| `data/personal.ts` | 2 | PONY Project, About Me Project |

## 핵심 타입

```
미디어 타입
├── CloudinaryImage    { publicId, alt, width, height }
├── VideoEmbed         { platform: "youtube"|"vimeo", videoId, title }
└── BackgroundMedia    { type: "image"|"video", src, overlayOpacity? }

콘텐츠 타입
├── ShowreelItem       { id, title, year, date, thumbnail, video, description? }
├── ArchiveItem        { id, city, year, date, thumbnail, photos[], description? }
├── PhotographyItem    { id, title, client, date, thumbnail, photos[], description? }
├── FilmItem           { id, title, date, thumbnail, videoThumbnailUrl, video, photos[], description? }
└── PersonalWorkItem   { id, title, date, thumbnail, media[], description? }   ← media는 image|video 혼합

네비게이션 타입
├── NavItem            { label, href }
└── SocialLink         { platform, url, label, iconPublicId }
```

모든 필드는 `readonly`. 배열은 `ReadonlyArray<T>`.

## 팩토리 함수

`data/archives.ts`, `data/photography.ts`에는 `createArchive(...)`, `createPhotographyItem(...)` 같은 팩토리 함수가 있어 반복적인 publicId/photo 생성을 자동화합니다. 모두 `as const`.

## 미디어 참조 규칙

모든 이미지는 Cloudinary publicId로 참조됩니다. 예시 publicId 구조:

```
214archives/{section}/{slug}/{filename}
  └─ archives/22-london/thumbnail
  └─ archives/22-london/photo-01
  └─ film/01-unveil/thumbnail
  └─ film/01-unveil/01
  └─ photography/lookbook-bready/thumbnail
  └─ photography/lookbook-bready/photo-01
```

CSV(`raw/portfolio-posts.csv`)에 모든 publicId가 정리되어 있어 `data/*.ts`를 갱신할 때 신뢰할 수 있는 source of truth로 쓸 수 있음.

## CSV ↔ data 파일 매핑

`raw/portfolio-posts.csv`의 컬럼 → `data/*.ts` 필드:

| CSV 컬럼 | 매핑 |
|---|---|
| `page` | 어느 `data/{page}.ts`에 들어가는지 |
| `slug` | `id` |
| `title` | `title` (또는 archives의 경우 `city + year`로 분해) |
| `date` | `date` (ISO 8601) |
| `thumbnail_id` | `thumbnail.publicId` |
| `image_ids` | `photos[].publicId` (`;` 구분) |
| `video_url` | `video.platform` + `video.videoId`로 파싱 |

이 CSV를 읽어서 `data/*.ts`를 자동 생성하는 build script가 합리적 다음 단계.

## See also

- [[codebase/architecture]]
- [[codebase/conventions]] — readonly/immutability 규칙
- [[overview#작업물-핵심-사실]]
