# 관리자 페이지 — 기획·진행 현황

> 본 문서는 **현재 상태 스냅샷**입니다. 결정 사유의 정식 기록은 [ADR-0001](../wiki/decisions/0001-admin-architecture.md), 시간순 활동은 [wiki/log.md](../wiki/log.md)를 참조하세요.

---

## 1. 목적

작가(214 Archives Studio 운영자)가 **개발자를 거치지 않고 직접 포트폴리오 게시물을 등록·수정·삭제**할 수 있는 어드민 페이지. 이미지·영상 업로드 포함. 현재 사이트의 정체성(정적·빠른·운영비 0원)을 깨지 않으면서 동작.

대상 사용자: 어드민 1–2명 (작가 본인 + 협업자).

---

## 2. 아키텍처 — Supabase + Build-time Sync

```
[어드민 편집] → Supabase (draft 저장소)
                    │
                    │  "Publish" 클릭
                    ▼
            GitHub Action 트리거
                    │
                    ▼
   scripts/sync-from-supabase.ts 실행
   → Supabase 읽어 data/*.ts 재생성
   → git commit + push
                    │
                    ▼
            Vercel 자동 빌드·배포
                    │
                    ▼
            공개 사이트에 반영 (~2분)
```

**핵심**: 공개 사이트는 여전히 정적 빌드 + Cloudinary CDN. Supabase는 어드민의 작업 공간일 뿐.

### 거부된 대안
- **완전 동적 (옵션 A)**: 매 요청 Supabase fetch — 정적 모델 깨짐, 비용↑
- **하이브리드 ISR (옵션 C)**: ISR 캐싱 — 인프라 복잡도 증가, 30개 규모에 과함
- **Cloudinary → Supabase Storage 전환** — 기존 변환·CDN 인프라 폐기, 가치 없음

---

## 3. 기획 변화 이력

| 일자 | 결정 | 사유 |
|---|---|---|
| 2026-05-02 | ADR-0001 채택: Supabase + build-time sync, admin/editor 2단계, 매직링크 인증 | 초안 |
| 2026-05-03 | **Phase 4 흡수**: Cloudinary 업로드를 Phase 3b(썸네일)/3c(다중)에 통합. 기존 Phase 5(sync)가 새 Phase 4로 | 작가가 publicId 같은 식별자를 직접 다루면 "관리자 페이지에서 등록"의 가치가 사라짐 |
| 2026-05-03 | **인증 방식 변경**: 매직링크 → 이메일·비밀번호 | Supabase 무료 SMTP의 시간당 2건 rate limit에 자주 막힘 |
| 2026-05-15 | **Publish 의미론 분리**: `published` 토글 ↔ "사이트에 반영" 액션 | 빌드 비용을 작가가 통제. drift 가시화. |
| 2026-05-15 | **Build trigger 채택**: GitHub Actions `repository_dispatch` + `publish-builds` concurrency group | ADR Open Q §1 해소. 단일 publish-at-a-time 락이 자연스럽게 달성됨 |
| 2026-05-15 | **Preview 모드 v1 미포함** | publish 후 확인 흐름(~2분)으로 충분. ADR 정적 모델 보존. Open Q §2 해소 |
| 2026-05-15 | **Admin Header 오염 fix**: `app/(public)/` route group 분리 | 어드민이 공개 사이트 Header를 상속받던 운영 이슈. ADR 에는 미명시였던 자투리. |
| 2026-05-15 | **`is_admin()` service_role 인정 (migration 00003)** | sync/seed 가 service role 로 published 토글하려면 트리거가 통과시켜야 함. RLS 는 영향 없음 |

자세한 amendment 사유: [ADR-0001 § Amendments](../wiki/decisions/0001-admin-architecture.md#amendments)

---

## 4. 역할 모델 (2단계 RBAC)

| 작업 | editor | admin |
|---|---|---|
| 게시물 목록 조회 | ✅ | ✅ |
| 게시물 작성 / 자기 draft 편집 | ✅ | ✅ |
| 다른 사람 draft 편집 | ❌ | ✅ |
| 이미지·영상 업로드 | ✅ | ✅ |
| **Publish 토글 + 빌드 트리거** | ❌ | ✅ |
| 사용자 초대 / 역할 부여 | ❌ | ✅ |

RLS 정책 + Postgres 트리거(`guard_publish_toggle`)로 이중 방어. 첫 admin: `214archivesstudio@gmail.com`.

---

## 5. 데이터 모델 (Supabase)

`supabase/migrations/00001_initial_schema.sql` 참조.

| 테이블 | 역할 |
|---|---|
| `posts` | 게시물 본문 (섹션, slug, 제목, 날짜, 썸네일 메타, 영상 메타, published 등) |
| `post_media` | 사진/영상 갤러리 항목 (post_id FK, type, public_id 또는 video_id, display_order) |
| `user_roles` | user_id → admin/editor 매핑 |
| `publish_jobs` | "Publish" 액션 audit + 빌드 상태 |

**미디어 저장소**: Cloudinary (publicId만 Supabase에 메타로). Supabase Storage 사용 안 함.

---

## 6. 진척도 (Phase별)

| Phase | 상태 | 산출물 |
|---|---|---|
| **사이드 트랙 — LLM Wiki** | ✅ 완료 | wiki/ 전체 (overview/codebase/decisions/works/clients 44페이지) + ADR-0001 |
| **Phase 1 — Supabase 인프라** | ✅ 완료 | 스키마 마이그레이션, 30개 작품 seed 스크립트, 첫 admin 자동 등록, .env.example, setup 가이드 |
| **Phase 2 — 인증 + 라우트 보호** | ✅ 완료 | 이메일·비밀번호 로그인, `/admin/*` 미들웨어, role 헬퍼, 어드민 셸 + placeholder 대시보드 |
| **Phase 3a — 게시물 목록·삭제** | ✅ 완료 | `/admin/posts` 목록 (섹션 필터 + 검색 + 페이지네이션 + 삭제) |
| **Phase 3b — 게시물 등록·수정** | ✅ 완료 | `/admin/posts/new`, `/admin/posts/[id]` 폼 (섹션별 동적 필드, 썸네일 업로드, publish 토글, stale-write 가드) |
| **Phase 3c — 미디어 매니저** | ✅ 완료 | 다중 이미지 업로드, reorder (`@dnd-kit`), alt onBlur 저장, 삭제. personal 섹션에 영상 항목 추가 |
| **Phase 4 — Publish 빌드 트리거** | ✅ 완료 | `scripts/sync-from-supabase.ts`, `.github/workflows/publish.yml` (`repository_dispatch`), 어드민 "사이트에 반영" 버튼 + drift 지표 + 폴링 |
| **사이드 트랙 — Admin Header fix** | ✅ 완료 | `app/(public)/` route group 분리 (Step 1) |
| ~~**(옵션) Phase 3d — Team 관리**~~ | ❌ 폐기 (2026-08-30) | 개인 포트폴리오 결정으로 팀 화면 자체를 제거. `user_roles`·RLS 는 유지 |

---

## 7. 코드 구조

2026-08-30 기준 실제 파일 (Phase H 까지 반영).

```
app/
├── admin/                          # 어드민 라우트 (미들웨어로 보호)
│   ├── layout.tsx                  # 어드민 셸 (AdminHeader + DriftBadge + UserPill + Toaster)
│   ├── page.tsx                    # 대시보드 (통계 · 게시 패널 · 최근 활동)
│   ├── error.tsx                   # 어드민 에러 화면 (다시 시도 / 목록으로)        ← H1
│   ├── not-found.tsx               # 어드민 404 (셸 안)                               ← H1
│   ├── [...missing]/page.tsx       # 미매칭 /admin/* → notFound()                     ← H2
│   ├── login/page.tsx              # 이메일·비밀번호 로그인
│   ├── logout/route.ts             # POST 로그아웃
│   ├── _actions/publish.ts         # triggerPublish · getJobStatus · markJobTimedOut
│   ├── _components/
│   │   ├── publish-panel.tsx       # drift 목록 · 게시 버튼 · 폴링(10분 타임아웃)
│   │   ├── jobs-card.tsx           # 최근 활동 표 (KST, 내부 스크롤)
│   │   ├── drift-badge.tsx         # 헤더 미반영 배지
│   │   └── ui/                     # 디자인 시스템 atoms
│   │       ├── AdminHeader.tsx · UserPill.tsx · PageHead.tsx
│   │       ├── Btn.tsx · Card.tsx · Pill.tsx · StatusDot.tsx
│   │       ├── Field.tsx · Input.tsx · Textarea.tsx   # aria-invalid / aria-describedby 연결
│   │       └── (index.ts · SaveBar.tsx · Select.tsx · tokens.ts — 미사용, H5-7 정리 후보)
│   └── posts/
│       ├── page.tsx                # 목록 (최신순 · 섹션 탭 · 검색 · 페이지네이션)
│       ├── new/page.tsx            # 생성
│       ├── [id]/page.tsx           # 편집 (폼 + 공개 상태 + 미디어 + 위험 영역)
│       ├── _actions/posts.ts       # create/update/delete/togglePublished/checkSlugAvailable
│       ├── _actions/media.ts       # addImage(순번)/addVideo/updateAlt/delete/reorder
│       └── _components/
│           ├── post-form.tsx       # useActionState · 저장 토스트 · 에러 clear-on-edit
│           ├── slug-input.tsx      # debounce 중복 검사
│           ├── section-fields.tsx  # 섹션별 필드 · 영상 URL 즉시 미리보기
│           ├── section-picker.tsx · section-tabs.tsx · search-input.tsx
│           ├── thumbnail-uploader.tsx · video-thumbnail-uploader.tsx
│           ├── publish-toggle.tsx  # 공개/초안 (초안 전환 확인창)
│           ├── delete-dialog.tsx   # 확인 다이얼로그 (포커스 트랩) · delete-post-button.tsx
│           ├── created-toast.tsx   # ?created=1 1회성 토스트
│           ├── posts-table.tsx     # 반응형 목록
│           └── media/              # MediaManager · MediaGrid(dnd-kit) · MediaCard · AddImageButton · AddVideoModal
└── auth/callback/route.ts          # OAuth 콜백 (현재 미사용)

lib/
├── supabase/                       # @supabase/ssr 클라이언트 (client · server · middleware)
├── auth.ts                         # getCurrentAdminUser · requireAuthenticatedAdmin · requireAdmin
├── repos/posts.ts                  # listPosts(살균 검색) · findPostById · findPostMedia · countPostsBySection
├── repos/publish-jobs.ts           # listRecentPublishJobs · getLastSuccessAt(created_at) · drift · findActiveJobId
├── validation/post-schema.ts       # zod 섹션별 discriminated union
└── video.ts                        # parseVideoUrl · YouTube 썸네일 URL (client-safe)

middleware.ts                        # /admin/* 라우트 보호
.github/workflows/publish.yml        # 게시: Resolve job id → sync → commit/push → 결과 기록

supabase/migrations/
├── 00001_initial_schema.sql        # posts/post_media/user_roles/publish_jobs + RLS + 트리거
└── 00002_seed_first_admin.sql      # 첫 admin user_roles 등록

scripts/sync-from-supabase.ts        # Supabase → data/*.ts (publish 워크플로가 실행)
types/supabase.ts                    # GENERATED (npm run gen:types) — 편집 금지
types/database.ts                    # 생성 타입 위의 alias (PostRow 등, Readonly)
```

---

## 8. 기술 스택

| 분류 | 기술 | 버전 |
|---|---|---|
| 프레임워크 | Next.js (App Router) | 16.1 |
| 언어 | TypeScript strict | 5.9 |
| UI | React | 19.2 |
| 스타일 | Tailwind CSS 4 (CSS-first) | 4.1 |
| DB + Auth | Supabase | postgres-js 2.x + ssr 0.10 |
| 폼 검증 | zod | 4.x (섹션별 discriminated union) |
| 이미지 | Cloudinary (next-cloudinary) | 6.x |
| 드래그앤드롭 (예정) | @dnd-kit/core + sortable | 미설치 (3c에서) |
| 배포 | Vercel | — |

**중요 사항**:
- 어드민은 모든 페이지가 client component / server component 혼합. Server Actions(`"use server"`) 사용 — route handler 거의 안 씀.
- `npm run dev`는 포트 **3001**로 변경됨 (3000 충돌 회피).
- 매직링크 미사용 — 비밀번호 인증으로 단일화.

---

## 9. 운영 워크플로 (작가 기준)

### 새 게시물 등록 (3b 완료 시점)
1. `/admin/posts/new` → 섹션 선택 (archives/film/photography/personal/showreel)
2. 섹션별 필드 입력 (archives → city/year_label, photography → client 등)
3. 썸네일 업로드 (Cloudinary 위젯)
4. 영상 URL 입력 (해당 섹션) — YouTube/Vimeo 자동 파싱
5. **저장** → 편집 페이지로 redirect (draft 상태)
6. 사진 갤러리는 `미디어 관리` 페이지에서 (Phase 3c)
7. (admin) 우측 사이드바에서 **Publish 토글** → draft → 공개
8. Publish 빌드 트리거 (Phase 4) — Vercel 빌드 → 공개 사이트 반영

### 게시물 수정
- `/admin/posts/[id]` → 텍스트 수정 → **저장**
- 섹션 변경 불가 (필드 orphan 방지). 변경하려면 삭제 후 재생성.

### 게시물 삭제
- 목록의 **삭제** → 확인 다이얼로그 → 영구 삭제 (`post_media` cascade)
- editor는 자기 draft만, admin은 모두 가능 (RLS)

---

## 10. 사전 셋업 (사용자 사이드)

[`docs/admin-setup.md`](./admin-setup.md) 전체 가이드 참조.

### 필수
- Supabase 프로젝트 생성 + 마이그레이션 적용 (`supabase db push`)
- 첫 admin 계정 등록 (이메일·비밀번호) + `user_roles` SQL로 admin 부여
- `.env.local` 작성: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`, `NEXT_PUBLIC_SITE_URL=http://localhost:3001`
- Cloudinary unsigned upload preset 생성

### CSV → Supabase Seed (1회)
```bash
npm run seed
```
30개 작품을 모두 draft로 import.

---

## 11. 알려진 이슈 / 트레이드오프

| 항목 | 영향 | 조치 |
|---|---|---|
| ~~**어드민 로그인 페이지에 frontend Header 노출**~~ | ✅ 2026-05-15 해결 | `app/(public)/` route group 분리 |
| ~~**Publish 빌드 큐 동시성**~~ | ✅ 2026-05-15 해결 | GH Actions `concurrency: { group: publish-builds }` |
| ~~**Supabase v2 타입 추론 회피 cast (`as never`)**~~ | ✅ 2026-08-30 해결 | `types/supabase.ts` 생성(`npm run gen:types`) + `types/database.ts` 가 alias 파생. 캐스트 0건 |
| ~~**`next lint`가 Next.js 16에서 작동 안 함**~~ | ✅ 2026-08-30 `lint: eslint .` 로 교체 | `handoff/` ignore. **잔존**: 공개 사이트 코드 3건(`LoadingAnimation` purity, `VideoPreloadContext` set-state-in-effect, `useVideoAutoplay` refs — React Compiler 신규 규칙) 은 어드민 범위 밖이라 미수정 |
| **비밀번호 reset UI 없음** | 어드민이 비밀번호 잊으면 dashboard에서 직접 reset | 1–2명 환경이라 OK. 사용자 늘면 reset flow 추가 |
| ~~**publish_jobs `triggered_by_email` 미연결**~~ | ✅ 2026-08-30 열 제거 | 대시보드가 트리거한 사람을 표시하지 않으므로 항상 null 이던 필드를 삭제. 필요해지면 auth admin API 로 enrichment |
| ~~**영상 미디어 카드의 시각 thumbnail 없음**~~ | ✅ 2026-08-30 (G3-2) | YouTube 는 `img.youtube.com` 정적 썸네일. Vimeo 는 oembed 필요 + 현재 0건이라 텍스트 폴백 |
| **Publish 첫 실행 시 drift 가 모든 published 게시물** | `last_success = null` 이라 모든 row 가 "변경됨" 으로 카운트 | 첫 성공 publish 이후 정상화. 셋업 가이드에 명시 |
| ~~**저장 성공 피드백·에러 화면 없음**~~ | ✅ 2026-08-30 (H1) | 저장 토스트, 검증 에러 clear-on-edit + 첫 에러 스크롤, `error.tsx`/`not-found.tsx`, 다이얼로그 포커스 트랩 |
| ~~**모바일(375px) 셸 가로 오버플로**~~ | ✅ 2026-08-30 (H2) | 헤더·본문 반응형, 활동 표 내부 스크롤. 4화면 실측 0 |
| ~~**다중 업로드 순서 경쟁 · UTC 시각 · 검색어 쉼표 크래시**~~ | ✅ 2026-08-30 (H3) | 클라이언트 순번 부여, `Asia/Seoul` 직접 조립, PostgREST 메타문자 살균. 업로드 순서는 실업로드 확인 필요 |
| ~~**어드민 밖 수동 publish 가 drift 에 미반영**~~ | ✅ 2026-08-30 (H4, 코드) | 워크플로가 `job_id` 없이도 `publish_jobs` 행 생성. drift 기준 `created_at`. **라이브 검증은 push 후** (`admin-phase-h-plan` §H4) |
| **editor 권한 UI 가 RLS 와 불일치** | 편집 화면 삭제 버튼에 권한 분기 없음, 권한 부족 시 "충돌" 문구 | 보류 — editor 0명. 두 번째 운영자 생기면 한 ship 으로 (`admin-phase-h-plan` §6) |
| **Cloudinary env 누락 시 무언 데이터 소실 · sync 1000행 상한** | 환경 변수 하나로 `video_thumbnail_url` null 저장, `post_media` 1000행 초과분 게시 누락 | H5 후보 (미착수). 현재 규모(미디어 ~330행)에서는 미발생 |

---

## 12. 다음 작업 (Phase 3c + 4 ship 이후)

Phase 3c + 4 까지 ship 됨. 이후 2026-07-10 사용성 감사로 [admin-improvement-roadmap](./admin-improvement-roadmap.md) (Phase G1–G4) 가 수립됐고 G1(film 영상 썸네일 업로드)은 ship 완료 — 아래 목록은 그 로드맵에 흡수됨.

G1–G4 는 2026-08-30 전부 ship, 같은 날 실주행 평가(REVISE) 후속으로 [admin-phase-h-plan](./admin-phase-h-plan.md) H1–H4 ship (H4 는 push 후 라이브 검증).

다음 후보:

- **push + 라이브 검증**: 로컬 커밋을 push → Vercel 배포 → `gh workflow run publish.yml` 로 H4 확인 → 이미지 5장 동시 업로드로 H3-1 확인
- **첫 운영**: 실제 작가가 어드민에서 게시물 등록 → 갤러리 업로드 → "변경사항 게시" 까지의 full 흐름을 사용자 테스트
- **H5 부채** (여유 시): Cloudinary env 가드, sync 페이지네이션, `x-pathname`, 스키마 정리, reorder upsert, 죽은 코드
- ~~이메일 enrichment~~ · ~~as never 정리~~ · ~~ESLint flat config~~ — G4 (2026-08-30) · ~~영상 oembed~~ — G3 YouTube · ~~Phase 3d Team 관리~~ — H2 폐기

---

## 참고 문서

- 결정 사유 (ADR): [wiki/decisions/0001-admin-architecture.md](../wiki/decisions/0001-admin-architecture.md)
- 셋업 가이드: [docs/admin-setup.md](./admin-setup.md)
- 시간순 활동 로그: [wiki/log.md](../wiki/log.md)
- 프로젝트 개요: [wiki/overview.md](../wiki/overview.md)
- 코드베이스 아키텍처: [wiki/codebase/architecture.md](../wiki/codebase/architecture.md)
