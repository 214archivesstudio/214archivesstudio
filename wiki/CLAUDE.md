# Wiki Schema — 214 Archives Studio

> 이 파일은 LLM(Claude Code 등)에게 이 wiki를 어떻게 운영할지 알려주는 schema입니다.
> 사람을 위한 안내는 [README.md](./README.md)를 참고하세요.

이 wiki는 [llm-wiki.md](../llm-wiki.md) 패턴을 따릅니다. 핵심 아이디어:
**raw sources에서 점진적으로 구축되는 영구 지식 베이스**. RAG가 매번 재합성하는 것과 달리, 한 번 컴파일된 합성물이 계속 풍부해집니다.

---

## 1. 레이어 구조

| 레이어 | 위치 | 권한 | 설명 |
|---|---|---|---|
| **Raw sources** | `wiki/raw/` | 읽기 전용 | 기획서, project-structure, CSV 등 원본. LLM은 읽기만 하고 수정하지 않습니다. |
| **Wiki pages** | `wiki/{codebase,works,clients,timeline}/` | LLM이 소유 | LLM이 생성·수정·정리합니다. 사용자가 직접 쓰는 일은 드뭅니다. |
| **Schema** | `wiki/CLAUDE.md` (이 파일) | 사용자와 LLM이 공동 진화 | 운영 규칙. 도메인이 바뀌면 함께 업데이트합니다. |
| **인덱스/로그** | `wiki/index.md`, `wiki/log.md` | LLM이 소유 | 카탈로그와 시간순 기록. ingest/query/lint 때마다 갱신. |

---

## 2. 디렉토리 구조

```
wiki/
├── CLAUDE.md           # 이 파일 (schema)
├── README.md           # 사람을 위한 안내
├── index.md            # 페이지 카탈로그 (모든 페이지의 한 줄 요약)
├── log.md              # 시간순 로그 (ingest/query/lint 기록)
├── overview.md         # 프로젝트 전체 개요 (최상위 합성)
│
├── raw/                # Raw sources (immutable)
│   ├── 기획서.md
│   ├── project-structure.md
│   └── portfolio-posts.csv
│
├── codebase/           # 코드 트랙 (개발자/AI 에이전트용)
│   ├── architecture.md
│   ├── routing.md
│   ├── data-layer.md
│   ├── design-system.md
│   ├── components.md
│   └── conventions.md
│
├── decisions/          # ADR (Architecture Decision Records)
│   └── {NNNN}-{slug}.md
│
├── works/              # 작품 트랙 (포트폴리오 콘텐츠)
│   ├── archives/       # 여행 아카이브
│   ├── film/           # 필름 작업
│   ├── photography/    # 사진 작업
│   ├── personal/       # 개인 작업
│   └── showreel/       # 쇼릴
│
├── clients/            # 클라이언트별 페이지
│   └── …
│
└── timeline/           # 연도별 페이지 (점진 확장)
    └── …
```

---

## 3. 페이지 종류 및 템플릿

### 3.1 작품 페이지 (`works/{section}/{slug}.md`)

```markdown
---
title: "{TITLE}"
section: "{archives|film|photography|personal|showreel}"
slug: "{SLUG}"
date: "{YYYY-MM-DD}"
client: "{CLIENT or null}"
location: "{LOCATION or null}"
photo_count: {N}
has_video: {true|false}
tags: [{TAGS}]
---

# {TITLE}

## Overview
{한 단락. 무엇이고 언제이며 핵심 인상은 무엇인지.}

## Context
{왜 이 작업이 만들어졌는지 — 여행, 의뢰, 개인 프로젝트 등}

## Media
- **썸네일**: `{publicId}`
- **사진**: {N}장 (`{publicId-prefix}/photo-01` … `photo-NN`)
- **영상**: {URL or "없음"}

## Notes
{관찰, 테마, 다른 작품과의 연결. 시간이 지나며 추가됨.}

## Cross-references
- 클라이언트: [[clients/{client-slug}]]
- 시기: [[timeline/{year}]]
- 관련 작업: [[works/{section}/{related-slug}]]
```

### 3.2 클라이언트 페이지 (`clients/{slug}.md`)

```markdown
---
title: "{CLIENT NAME}"
slug: "{SLUG}"
type: "{brand|individual|institution}"
first_collaboration: "{YYYY-MM-DD}"
projects: [{PROJECT_SLUGS}]
---

# {CLIENT NAME}

## About
{클라이언트가 누구이며 어떤 분야인지}

## Collaboration history
- {YYYY-MM-DD} — [[works/.../slug]] ({한 줄 요약})

## Style notes
{이 클라이언트와의 작업에서 반복되는 비주얼·톤 메모}
```

### 3.3 ADR 페이지 (`decisions/{NNNN}-{slug}.md`)

```markdown
---
title: "{TITLE}"
type: decision
status: "{Proposed|Accepted|Superseded by NNNN|Deprecated}"
date: "{YYYY-MM-DD}"
deciders: [{NAMES}]
---

# ADR-{NNNN}: {TITLE}

## Context
{왜 결정이 필요했는지. 제약·요구사항·기존 상태.}

## Decision
{무엇을 결정했는지. 한두 단락으로 명료하게.}

## Consequences

### Positive
- …

### Negative
- …

### Neutral / 따라오는 일
- …

## Alternatives considered
{다른 옵션과 거부 사유}

## See also
- [[wiki-link]]
```

번호는 4자리 zero-padded (`0001-…`, `0002-…`). 파기될 때는 `Status`만 갱신하고 파일은 보존 (history 가치).

### 3.4 코드베이스 페이지 (`codebase/*.md`)

```markdown
---
title: "{TOPIC}"
type: "codebase"
last_updated: "{YYYY-MM-DD}"
sources: [{RAW_SOURCE_REFS}]
---

# {TOPIC}

## Summary
{한 단락 요약}

## Details
{기술 세부사항 — 라우팅, 타입, 컴포넌트 등}

## Files
- [{path}]({relative-link}) — {역할}

## See also
- [[codebase/{related}]]
```

---

## 4. 운영 워크플로

### 4.1 Ingest (새 source 추가 시)

사용자가 새 source를 `wiki/raw/`에 떨어뜨리고 "ingest 해줘"라고 하면:

1. **읽기**: source 전체를 읽고 핵심 takeaway를 사용자와 짧게 토론합니다.
2. **분류**: 코드 관련 정보인지, 작품/콘텐츠 정보인지, 둘 다인지 판단합니다.
3. **신규 페이지 생성**: 적절한 디렉토리에 페이지를 만듭니다.
4. **기존 페이지 갱신**: 영향받는 페이지를 모두 업데이트합니다 (보통 5–15개).
5. **cross-reference 작성**: `[[wiki-link]]` 형식으로 연결합니다.
6. **인덱스 갱신**: `wiki/index.md`에 새 페이지를 추가합니다.
7. **로그 추가**: `wiki/log.md`에 `## [YYYY-MM-DD] ingest | {source}` 항목을 append 합니다.

원본 source는 `wiki/raw/`로 복사하고, **절대 수정하지 않습니다**.

### 4.2 Query (질문에 답하기)

사용자가 wiki에 대해 질문하면:

1. **`wiki/index.md` 먼저 읽기** — 어떤 페이지가 관련 있는지 파악합니다.
2. 관련 페이지 2–10개를 읽고 합성합니다.
3. 답변에 `[[wiki-link]]`로 출처를 명시합니다.
4. **답변이 가치 있으면 wiki에 다시 file**: 비교, 분석, 발견된 연결은 새 페이지로 저장합니다 (예: `comparisons/`, `analyses/`). 채팅에서 사라지지 않게 합니다.
5. 큰 query라면 log에 기록합니다.

### 4.3 Lint (정기 점검)

사용자가 "wiki 점검"이라고 하면 다음을 검사합니다:

- **모순**: 페이지 간 충돌하는 주장 (예: 기획서는 14개 archives인데 CSV는 13개)
- **stale claim**: 새 source가 무효화한 옛 주장
- **고아 페이지**: 어떤 페이지에서도 링크되지 않은 페이지
- **누락된 cross-reference**: 같은 클라이언트/장소/시기를 다루지만 연결되지 않은 페이지
- **보충 필요한 데이터 갭**: 웹 검색으로 채울 수 있는 사실
- **인덱스 불일치**: 실제 파일과 `index.md` 항목 비교

결과를 사용자에게 보고하고, 사용자 승인 후 수정합니다. 수정 내역은 log에 기록합니다.

---

## 5. 명명 규칙

- **파일명**: `kebab-case.md` (예: `lookbook-bready.md`, `22-london.md`)
- **slug**: CSV의 slug 필드를 그대로 사용 (작품 페이지 한정)
- **클라이언트 slug**: 공백·특수문자 제거 후 kebab-case (예: "B.Ready" → `b-ready`, "CAU dept. Fashion Design" → `cau-fashion-design`)
- **frontmatter 날짜**: ISO 8601 (`YYYY-MM-DD`)
- **wiki 링크**: `[[path/without/extension]]` 형식 (Obsidian 호환)

---

## 6. 글쓰기 톤

- **사실 우선**: 추측이 들어가면 명시 ("추측:", "확인 필요:")
- **간결**: 페이지당 보통 50–200줄. 더 길어지면 분리 검토.
- **한국어 기본**: 단, 코드/기술 식별자는 원문 유지
- **불변성 표시**: 작품 페이지의 `Notes` 섹션은 추가만 하고 기존 메모는 보존 (시간이 지나며 누적)

---

## 7. 새 카테고리가 필요할 때

현재 카테고리(`codebase/`, `works/`, `clients/`, `timeline/`)로 분류되지 않는 source가 들어오면, 새 카테고리를 만들고 이 schema에 항목을 추가합니다. 변경 사항을 log에 기록합니다.

예상되는 미래 카테고리:
- `themes/` — 시네마틱, 여행, 스트리트 같은 비주얼 테마
- `equipment/` — 카메라, 렌즈, 워크플로
- `comparisons/` — query 결과로 생성된 비교 페이지

---

## 8. 메모리에서 절대 하지 말 것

- raw source 수정 (`wiki/raw/`는 immutable)
- wiki 페이지에 임시 채팅 답변 저장 (가치 있는 합성만 file 합니다)
- 커밋된 코드와 wiki를 동기화하려고 강제 — wiki는 코드를 따라가지만, 코드보다 더 풍부한 의도·맥락을 담을 수 있음
- 추측을 사실처럼 쓰기 (출처가 없으면 표시)
