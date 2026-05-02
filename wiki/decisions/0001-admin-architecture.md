---
title: "Admin architecture: Supabase + build-time sync"
type: decision
status: Accepted
date: "2026-05-02"
deciders: [mindong]
---

# ADR-0001: Admin architecture — Supabase + build-time sync

## Context

[214 Archives Studio](../overview.md)는 콘텐츠가 코드(`data/*.ts`)에 정적으로 박힌 Next.js 포트폴리오 사이트입니다. 새 게시물 추가 = 개발자가 `data/*.ts`를 편집 + Cloudinary에 업로드 + git push. 이는 비기술 사용자에게 진입 장벽이 되며 작가가 직접 운영하기 어렵습니다.

요구사항:
- 사진작가/촬영감독이 **직접 게시물을 추가·수정·삭제**할 수 있어야 함
- 이미지·영상 업로드 (현재 Cloudinary CDN 인프라 보존)
- 여러 사용자가 협업 가능 (역할 분리)
- 현재 사이트의 정체성(빠른 정적 사이트, 운영비 0원, [기획서](../raw/기획서.md)의 "성능 우선" 가치) 유지

DB는 [Supabase](https://supabase.com/)로 결정 (auth + Postgres + RLS의 결합이 이 규모에 맞음).

## Decision

**옵션 B "build-time sync" 채택**: Supabase는 어드민의 작업 공간으로만 쓰이고, 공개 사이트는 정적 빌드를 그대로 유지합니다. 어드민의 "Publish" 액션이 GitHub Actions 워크플로를 트리거해 Supabase → `data/*.ts` 동기화 + git commit + Vercel 재배포를 수행합니다.

```
어드민 편집 → Supabase 저장 (draft)
        → "Publish" 클릭
        → GitHub Action: scripts/sync-from-supabase.ts 실행
        → data/*.ts 재생성 + git commit + push
        → Vercel 자동 빌드·배포 (~1-3분)
        → 공개 사이트 반영
```

### 역할 모델: admin / editor 2단계 (권한 매트릭스)

| 작업 | editor | admin |
|---|---|---|
| 게시물 작성 / 자기 draft 편집 | ✅ | ✅ |
| 다른 사람 draft 편집 | ❌ | ✅ |
| 이미지/영상 업로드 (Cloudinary) | ✅ | ✅ |
| Publish 토글 + 빌드 트리거 | ❌ | ✅ |
| 사용자 초대 / 역할 부여 | ❌ | ✅ |

첫 admin: `214archivesstudio@gmail.com`. 이후 admin이 어드민 UI에서 추가 사용자 초대.

### 미디어 스토리지

**Cloudinary 그대로 유지.** Supabase에는 publicId 등 메타만 저장. 이유: 이미 `next.config.ts`에 도메인 등록됐고 Cloudinary의 자동 AVIF/WebP·반응형 srcSet 강점을 포기할 이유 없음.

## Consequences

### Positive
- **공개 사이트가 변하지 않음**: 정적 빌드 + Cloudinary CDN. Supabase가 다운돼도 공개 사이트 멀쩡 (어드민만 일시 중단).
- **빌드 타임 타입 안전성 보존**: `data/*.ts`가 여전히 [types/index.ts](../codebase/data-layer.md)에 의해 검증됨.
- **git history = 콘텐츠 history**: 별도 revisions 테이블 불필요. `git log data/archives.ts`로 추적.
- **운영비 변동 최소**: Supabase 무료 티어 + Vercel 무료 티어로 충분. 빌드 한도(월 6000분)에 한참 미달.
- **간단한 RLS**: 어드민만 DB 접근하므로 정책 단순. 공개 페이지는 Supabase 의존성 zero.

### Negative
- **Publish 지연**: "저장 → 사이트 반영"이 즉시가 아님 (1-3분). 어드민 UI에 진행 상태 표시 필수.
- **CI 파이프라인 의존**: GitHub Actions 또는 Vercel Deploy Hook 셋업 필요. CI 다운 시 publish 차단.
- **콘텐츠가 두 곳에 존재**: Supabase(작업 중) + `data/*.ts`(배포됨). draft와 published의 정합성을 어드민 UI에서 명확히 표시해야 혼란 없음.
- **빌드 큐 충돌 가능성**: 여러 admin이 동시에 publish하면 git push 충돌 가능. CI에서 lock 또는 retry로 대응.

### Neutral / 따라오는 일
- `scripts/sync-from-supabase.ts` 작성 필요 (Supabase → TypeScript 코드 생성기).
- `app/admin/*` 라우트군 신설 (Supabase Auth로 보호).
- `.env.local`에 Supabase URL + anon key + service role key 추가.
- 어드민에 Cloudinary Upload Widget 임베드 (signed upload preset 권장).

## Alternatives considered

### A. 완전 동적 (Supabase fetch on every page request, ISR off)
**거부 이유**: 30개 작품 규모에서 동적 인프라의 비용·복잡도가 정당화되지 않음. 공개 사이트가 Supabase 가용성에 묶임. 빌드 타임 타입 검증을 잃음.

### C. 하이브리드 (ISR로 캐시, e.g. revalidate=60)
**거부 이유**: A의 단점 대부분을 그대로 가짐 + 현재 모든 page가 client component이라 ISR 효과 제한. 즉시성이 필요한 도메인이 아니므로 B로 충분.

### Cloudinary → Supabase Storage 전환
**거부 이유**: 마이그레이션 비용 + 기존 `next.config.ts`·`lib/cloudinary.ts` 인프라 폐기 + Cloudinary의 변환·CDN 강점 상실.

### 3단계 역할 (admin / editor / viewer)
**거부 이유**: 30개 포트폴리오 규모에서 viewer 분리 가치 낮음. editor는 draft만 만지므로 검토자 역할도 안전하게 흡수.

### 별도 어드민 SaaS (Forestadmin / Retool / Refine)
**거부 이유**: 외부 의존성 추가, 비용, 자체 Next.js 코드베이스에 어드민을 두는 것이 일관성·유지보수에 유리.

## Open questions (실행 중 결정)

- **Publish 큐 락**: 단순 단일 publish-at-a-time 락이면 충분한가, 아니면 GitHub Actions의 concurrency 그룹으로 처리?
- **Preview 모드**: 어드민이 unpublished draft를 사이트에서 미리 보는 기능 (`?preview=token` + ISR bypass) — 1차 출시 포함 여부.
- **이미지 정렬 UI**: drag-and-drop 라이브러리 선택 (`@dnd-kit/core` 권장).

## See also

- [[overview]]
- [[codebase/architecture]]
- [[codebase/data-layer]] — `data/*.ts` 정적 모델
- 구현 가이드: `docs/admin-setup.md`
- 마이그레이션: `supabase/migrations/00001_initial_schema.sql`
