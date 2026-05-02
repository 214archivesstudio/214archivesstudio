---
title: "214 Archives Studio — Overview"
type: synthesis
last_updated: "2026-05-02"
sources:
  - raw/기획서.md
  - raw/project-structure.md
  - raw/portfolio-posts.csv
---

# 214 Archives Studio — Overview

> *Every moment happens once. We archive it.*

## What it is

**214 Archives Studio**는 사진작가/촬영감독의 작업물을 보여주는 포트폴리오 웹사이트입니다.
이 wiki는 **사이트 자체의 코드**와 **사이트가 아카이빙하는 작업물** 두 가지를 다룹니다.

- **사이트**: Next.js (App Router) + TypeScript + Tailwind CSS 4 + Cloudinary CDN. Vercel 배포. 다크 톤, 시네마틱한 미니멀 디자인.
- **작업물**: 13개 여행 아카이브, 8개 필름, 6개 사진 작업, 2개 개인 작업, 1개 쇼릴. 총 30개 게시물.

레퍼런스 사이트는 [ethanandtom.com](https://www.ethanandtom.com/), [cubiflow.com](https://www.cubiflow.com/).

## 두 도메인 한눈에

| 도메인 | wiki 위치 | 핵심 source |
|---|---|---|
| **사이트 코드** | [codebase/](./codebase/) | [raw/project-structure.md](./raw/project-structure.md), [raw/기획서.md](./raw/기획서.md) |
| **포트폴리오 작업물** | [works/](./works/), [clients/](./clients/) | [raw/portfolio-posts.csv](./raw/portfolio-posts.csv) |

## 사이트 — 핵심 사실

- **섹션 6개**: Showreel, Archives, Film, Photography, Personal, Contact. 각 섹션은 list view + detail view 패턴을 따릅니다.
- **콘텐츠는 정적**: DB·CMS 없음. `data/*.ts`의 typed array. 모든 미디어는 Cloudinary `publicId`로 참조.
- **인터랙티브 배경**: 썸네일 hover 시 페이지 배경이 해당 작품의 이미지/영상으로 cross-fade 전환 ([[codebase/components#background-system]]).
- **모든 페이지가 client component**: 서버 컴포넌트는 layout 수준에서만. 단 `showreel/[id]`만 서버 컴포넌트(통일성 부족 — [[codebase/architecture]] 참고).
- **성능 목표**: Lighthouse 90+, FCP 1.5s, LCP 2.5s, CLS 0.1.

자세한 내용 → [[codebase/architecture]]

## 작업물 — 핵심 사실

### 시기 분포
- **2022**: 4개 (모두 유럽 여행 — London, Paris, Rome, Switzerland)
- **2023**: 4개 (아시아·오세아니아 — Hochiminh, Hongkong, Melbourne, Sydney)
- **2024**: 2개 (Dubai, NewYork)
- **2025**: 3개 (Miyakojima, Tokyo, Taipei)
- **2026 (게시 날짜)**: Film 8개 + Photography 6개 + Personal 2개 + Showreel 1개

> **주의**: CSV에서 `25-newyork`의 date는 `2024-08-30`, `24-taipei`의 date는 `2025-07-04`. slug의 연도와 실제 촬영 날짜가 어긋남. 의도적 분류일 수도, 데이터 정리 필요일 수도. 확인 필요.

### 매체 분포
- **사진만**: archives 13개 + photography 6개 + personal 1개 (about-me) = 20개
- **영상만**: film 1개 (all-at-once는 사진 없음) + showreel 1개 = 2개
- **사진 + 영상**: film 7개 + personal 1개 (pony-project — but pony는 사진만? 확인) = 8개

### 클라이언트
- **상업**: B.Ready (제품), NOT4NERD (룩북 + 영상 — film/03 + photography/lookbook-not4nerd 양쪽에 있음 — 같은 프로젝트?), CAU 패션디자인학과 (룩북), LARK (프로필), YOUTH (컨셉)
- **개인**: 김애영 (프로필)
- **자체 작업**: archives, personal/pony-project, personal/about-me

자세한 내용 → [[clients/]]의 각 페이지

## 발견된 contradiction (lint 후보)

기획서·project-structure·CSV 사이에 일부 불일치:

1. **archives 개수**: 기획서 §3.3.2와 project-structure는 **14개** (Shanghai 포함). CSV는 **13개**. Shanghai는 `film/07-shanghai`로만 존재. → archives에 누락? 아니면 기획서/data 파일이 stale?
2. **연도 라벨 불일치**: `24-taipei` slug에 `TAIPEI '25` 표시, `25-newyork` slug에 `NEWYORK '24` 표시. → 의도? 데이터 오류?
3. **`22-switzerland` 라벨 오타**: CSV에 `NTERLAKEN '22` (앞 글자 I 누락)
4. **NOT4NERD 중복**: `film/03-not4nerd`와 `photography/lookbook-not4nerd`가 같은 클라이언트의 별도 작업물인지, 혹은 한 프로젝트의 두 매체인지 확인 필요

전체 lint 결과는 [[log#2026-05-02]] 참고.

## 다음 단계 제안

이 wiki를 풍부하게 만들려면:

- **시각 분석 ingest**: 각 작품의 썸네일·대표 사진을 LLM에게 보여주고 비주얼 메모를 작품 페이지의 `Notes` 섹션에 추가.
- **테마 페이지 신설**: archives 13개를 훑어 반복되는 테마(거리·건축·인물·자연 등)를 추출해 `themes/`에 합성.
- **timeline 페이지**: 2022~2025 페이지를 만들어 같은 시기 작업의 맥락(여행 동선, 클라이언트 동시 진행 등)을 정리.
- **decisions 페이지**: 코드의 의사결정 (왜 Cloudinary, 왜 App Router, 왜 모든 페이지가 client component인지) ADR 스타일로 기록.
- **contradiction 해결**: 위 4개 항목을 사용자와 확인하고 wiki·data 파일을 일치시키기.
