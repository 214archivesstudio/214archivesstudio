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
| **(옵션) Phase 3d — Team 관리** | 보류 | 두 번째 사용자 초대 + 역할 부여 UI |

---

## 7. 코드 구조

```
app/
├── admin/                          # 어드민 라우트 (미들웨어로 보호)
│   ├── layout.tsx                  # 어드민 셸 (헤더 + nav + user/role 표시)
│   ├── page.tsx                    # 대시보드 (게시물 카운트 통계)
│   ├── login/page.tsx              # 이메일·비밀번호 로그인
│   ├── logout/route.ts             # POST 로그아웃
│   └── posts/                      # 게시물 관리
│       ├── page.tsx                # 목록 ✅
│       ├── new/page.tsx            # 생성 ✅
│       ├── [id]/page.tsx           # 편집 ✅
│       ├── [id]/media/page.tsx     # 미디어 매니저 (Phase 3c)
│       ├── _actions/posts.ts       # Server Actions (create/update/delete/togglePublished)
│       └── _components/
│           ├── posts-table.tsx
│           ├── post-form.tsx
│           ├── section-fields.tsx
│           ├── thumbnail-uploader.tsx
│           ├── publish-toggle.tsx
│           └── delete-dialog.tsx
└── auth/callback/route.ts          # OAuth 콜백 (현재 미사용, 향후 OAuth 추가 시 재사용)

lib/
├── supabase/                       # @supabase/ssr 클라이언트 헬퍼
│   ├── client.ts                   # 브라우저용
│   ├── server.ts                   # 서버 컴포넌트/액션용
│   └── middleware.ts               # 미들웨어 전용 + 세션 갱신
├── auth.ts                         # requireAuthenticatedAdmin, requireAdmin
├── repos/posts.ts                  # 타입 안전 query 헬퍼
├── validation/post-schema.ts       # zod 섹션별 discriminated union
└── video.ts                        # parseVideoUrl · YouTube 썸네일 URL (client-safe, zod 없음)

middleware.ts                        # /admin/* 라우트 보호

supabase/
├── migrations/
│   ├── 00001_initial_schema.sql    # posts/post_media/user_roles/publish_jobs + RLS + 트리거
│   └── 00002_seed_first_admin.sql  # 첫 admin user_roles 등록
└── (.temp/ — CLI 캐시, gitignored)

scripts/seed-from-csv.ts             # CSV → Supabase posts 30개 import

types/database.ts                    # Supabase 스키마 TS 타입
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
| **Supabase v2 타입 추론 회피 cast (`as never`)** | `_actions/posts.ts`, `_actions/media.ts`, `_actions/publish.ts`, `lib/auth.ts` 등 다수 | `supabase gen types typescript`로 CLI generated types 도입 후 정리. 우선순위 낮음 |
| **`next lint`가 Next.js 16에서 작동 안 함** | `npm run lint` 실패. `npx eslint <paths>`로 우회 중 | Next.js 가이드 따라 ESLint flat config migration 필요 |
| **비밀번호 reset UI 없음** | 어드민이 비밀번호 잊으면 dashboard에서 직접 reset | 1–2명 환경이라 OK. 사용자 늘면 reset flow 추가 |
| **publish_jobs `triggered_by_email` 미연결** | UI에는 UUID만 표시되고 이메일 enrichment 없음 | auth.users 조회는 admin API 필요 — 추후 phase 후보 |
| **영상 미디어 카드의 시각 thumbnail 없음** | personal 섹션의 영상 항목이 platform + videoId 텍스트만 노출 | oembed fetch 도입 후보 (Phase 4.5) |
| **Publish 첫 실행 시 drift 가 모든 published 게시물** | `last_success = null` 이라 모든 row 가 "변경됨" 으로 카운트 | 첫 성공 publish 이후 정상화. 셋업 가이드에 명시 |

---

## 12. 다음 작업 (Phase 3c + 4 ship 이후)

Phase 3c + 4 까지 ship 됨. 이후 2026-07-10 사용성 감사로 [admin-improvement-roadmap](./admin-improvement-roadmap.md) (Phase G1–G4) 가 수립됐고 G1(film 영상 썸네일 업로드)은 ship 완료 — 아래 목록은 그 로드맵에 흡수됨.

다음 후보:

- **첫 운영**: 실제 작가가 어드민에서 게시물 등록 → 갤러리 업로드 → "사이트에 반영" 까지의 full 흐름을 사용자 테스트
- **이메일 enrichment**: publish_jobs UI 의 `triggered_by` UUID → 이메일 표시
- **as never 정리**: `supabase gen types typescript` 도입 후 모든 admin server actions 의 캐스트 제거
- **ESLint flat config migration**: `next lint` 다시 활성화
- **영상 oembed**: 영상 미디어 카드에 platform thumbnail 자동 fetch
- **Phase 3d Team 관리** (보류): 두 번째 admin/editor 초대 UI

---

## 참고 문서

- 결정 사유 (ADR): [wiki/decisions/0001-admin-architecture.md](../wiki/decisions/0001-admin-architecture.md)
- 셋업 가이드: [docs/admin-setup.md](./admin-setup.md)
- 시간순 활동 로그: [wiki/log.md](../wiki/log.md)
- 프로젝트 개요: [wiki/overview.md](../wiki/overview.md)
- 코드베이스 아키텍처: [wiki/codebase/architecture.md](../wiki/codebase/architecture.md)
