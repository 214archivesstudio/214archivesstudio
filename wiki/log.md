# Log

> 시간순 활동 기록. 각 항목은 `## [YYYY-MM-DD] {action} | {target}` 헤더로 시작합니다.
> 최근 5개를 빠르게 보려면: `grep "^## \[" wiki/log.md | tail -5`

---

## [2026-05-02] phase-3a | Posts list + filter + delete

ADR-0001 Phase 3의 첫 sub-phase. 어드민이 시드된 30개 게시물을 브라우저에서 검토하고 draft를 삭제할 수 있게 됨.

**구현 산출물**
- `lib/repos/posts.ts` — `listPosts()`, `findPostById()`, `countPostsBySection()` query 헬퍼. `server-only` import로 client 누출 방지.
- `app/admin/posts/_actions/posts.ts` — `deletePost()` server action. RLS 위반(42501) 친화적 메시지 매핑. `revalidatePath('/admin/posts')`.
- `app/admin/posts/_components/delete-dialog.tsx` — conditional-rendered confirm modal. Escape 키 + 배경 클릭으로 닫기. autoFocus로 cancel 버튼 포커싱. (init 시점 setState in effect 패턴 회피 — React 19 룰)
- `app/admin/posts/_components/posts-table.tsx` — section badge, draft/published badge, 썸네일 (CldImage), edit/delete 액션. editor는 published 게시물의 delete 버튼 hide.
- `app/admin/posts/page.tsx` — server component. searchParams로 `?section=...&q=...&page=...` 처리. 20/page 페이지네이션. 빈 상태 + 초기화 링크 처리.

**스타일 시스템 정리**
- 새 파일들은 모두 색상 토큰 사용 (`text-accent`, `text-muted`, `border-accent/15` 등). Tailwind 4 `@theme`에 정의된 `--color-accent`/`--color-muted` 활용.
- 기존 어드민 파일(login, layout, dashboard)은 여전히 `text-[#CCCCCC]` 형태 — 향후 일관성 정리 작업으로 보류.

**Tooling 메모**
- `next lint` 명령이 Next.js 16에서 작동 안 함. `npx eslint <paths>`로 직접 실행. `package.json`의 `lint` script는 Phase 3 종료 시 갱신 검토 필요.
- `tsc --noEmit` clean.

**검증 시나리오 (사용자가 브라우저에서)**
1. `/admin/posts` 접근 → 30개 게시물 (모두 draft 배지)
2. 섹션 필터 → archives 선택 시 13개만
3. 검색 "Tokyo" → 1개 매칭
4. Draft 게시물 삭제 → 확인 다이얼로그 → 새로고침 후도 사라짐
5. (editor 계정) published 게시물 → 삭제 버튼 숨김 확인

**다음 단계 (3b)**
- `/admin/posts/new` + `/admin/posts/[id]` 편집 폼
- zod 추가
- 섹션별 dynamic 필드 (archives의 city/year_label, photography의 client)
- publish 토글 (admin only)
- stale-write 가드

---

## [2026-05-02] phase-2 | Auth + /admin route protection

매직링크 + 역할 기반 라우트 보호 구현. ADR-0001 implementation continued.

**구현 산출물**
- `lib/supabase/{client,server,middleware}.ts` — `@supabase/ssr` 0.10 기반 3개 클라이언트 헬퍼.
- `types/database.ts` — Supabase 스키마 타입 (수동 정의, supabase CLI gen에 의존하지 않음).
- `lib/auth.ts` — `getCurrentAdminUser()`, `requireAuthenticatedAdmin()`, `requireAdmin()` 헬퍼.
- `middleware.ts` (root) — `/admin/*`을 인증 + role 게이트로 보호. `/admin/login`은 예외, `/auth/callback`은 통과.
- `app/admin/login/page.tsx` — 매직링크 발송 폼. `shouldCreateUser: false`로 자동가입 차단 (등록된 어드민만 로그인).
- `app/auth/callback/route.ts` — OTP code → session cookie 교환. open-redirect 방어.
- `app/admin/layout.tsx` — 보호된 셸. 헤더에 user/role 표시 + admin 전용 Team 메뉴.
- `app/admin/page.tsx` — placeholder 대시보드 (게시물 카운트 통계).
- `app/admin/logout/route.ts` — POST 핸들러로 로그아웃.

**환경 변경**
- `package.json` dev/start 스크립트를 포트 3001로 변경 (3000 충돌).
- `.env.example`의 `NEXT_PUBLIC_SITE_URL`을 dev 기본값 `http://localhost:3001`로.

**Supabase Dashboard 설정 필요 (사용자 측)**
- Authentication → URL Configuration → Site URL: `http://localhost:3001`
- Additional Redirect URLs에 `http://localhost:3001/auth/callback` 추가
- Email Auth → "Email magic links" 활성화 확인

**알려진 트레이드오프**
- 미들웨어가 매 요청마다 `user_roles` 조회 — 단일 사용자 환경에서 무시할 만한 비용. 트래픽 늘면 캐시 검토.
- 타입 추론 우회 캐스트 1곳 (`lib/auth.ts`) — Supabase v2의 select-string narrowing 이슈. CLI generated types로 가면 해소될 수 있음.

**다음 단계 (Phase 3)**
- `/admin/posts` 목록 + 상세 편집 UI
- shadcn/ui + react-hook-form + zod 스택 (또는 단순 fetch + form 으로 시작)
- Cloudinary Upload Widget 임베드 (Phase 4)

---

## [2026-05-02] decision | ADR-0001 admin architecture + Phase 1 인프라

어드민 시스템 설계 결정 + Supabase 인프라 부트스트랩.

**ADR 작성**
- [[decisions/0001-admin-architecture]] — Supabase + build-time sync 채택. 역할은 admin/editor 2단계.
- 첫 admin: `214archivesstudio@gmail.com` (사용자 결정)
- 옵션 A(완전 동적), C(ISR 하이브리드), 3단계 역할, Supabase Storage 등 거부 사유 ADR에 기록.

**Wiki schema 갱신**
- `decisions/` 카테고리를 정식 등록. ADR 페이지 템플릿 [[CLAUDE#3-3-adr-페이지]]에 추가.
- 디렉토리 트리 다이어그램 갱신.

**구현 산출물 (Phase 1)**
- `supabase/migrations/00001_initial_schema.sql` — posts/post_media/user_roles/publish_jobs 테이블 + RLS + 역할 헬퍼 함수 + publish toggle 가드 트리거.
- `supabase/migrations/00002_seed_first_admin.sql` — 첫 admin 등록 (auth.users 사용자 사전 생성 필요).
- `scripts/seed-from-csv.ts` — CSV의 30개 작품을 Supabase posts/post_media로 idempotent upsert. 모두 draft로 import.
- `.env.example` 갱신 — Supabase 키 + Cloudinary upload preset + GitHub dispatch 토큰.
- `docs/admin-setup.md` — Phase 1 셋업 가이드.

**다음 단계**
- Phase 2: Supabase Auth 클라이언트 + `/admin/*` 라우트 보호
- Phase 3: 어드민 CRUD UI
- Phase 4: Cloudinary Upload Widget 통합
- Phase 5: `sync-from-supabase.ts` + GitHub Actions

각 phase 시작 시 ADR로 분기점 기록 검토 (예: "preview 모드 1차 출시 포함 여부", "drag-and-drop 라이브러리 선택").

---

## [2026-05-02] init | wiki 스켈레톤 + 첫 ingest

LLM Wiki 패턴([llm-wiki.md](../llm-wiki.md))을 적용해 `wiki/` 디렉토리 구축.

**생성된 인프라**
- `wiki/CLAUDE.md` — schema 파일 (운영 규칙, 페이지 템플릿, 워크플로)
- `wiki/README.md` — 사람을 위한 안내
- `wiki/index.md` — 페이지 카탈로그
- `wiki/log.md` — 이 파일
- `wiki/overview.md` — 프로젝트 전체 개요

**Raw sources 등록 (3개)**
- `wiki/raw/기획서.md` (462줄, 2025-02-10 작성) — 프로젝트 기획서. 사이트맵, 페이지 사양, 디자인 시스템, 기술 스택, SEO/성능 목표.
- `wiki/raw/project-structure.md` (306줄) — 코드 구조, 라우트 맵, 컴포넌트 의존성 그래프, 타입 시스템 요약.
- `wiki/raw/portfolio-posts.csv` (30 posts) — 작품 메타데이터 (slug, title, date, Cloudinary publicId, 영상 URL).

**Ingest 결과**
- `codebase/` — 아키텍처/라우팅/데이터/디자인/컴포넌트/컨벤션 6개 페이지 생성
- `works/` — 30개 작품 페이지 자동 생성
  - archives/ 13개 (London, Paris, Rome, Switzerland, Hochiminh, Hongkong, Melbourne, Sydney, Dubai, Taipei, Miyakojima, Newyork, Tokyo)
  - film/ 8개 (Unveil, Set It Off, Not4Nerd, Ewha, All At Once, Never Forget, Shanghai, About)
  - photography/ 6개 (B.Ready, CAU Fashion, KimAeYoung, LARK, NOT4NERD, YOUTH)
  - personal/ 2개 (About Me, PONY)
  - showreel/ 1개 (2025 Showreel)
- `clients/` — 6개 클라이언트 페이지 생성

**발견된 contradiction (lint 후보)**
- 기획서 §3.3.2는 archives 14개(Shanghai 포함)를 명시하지만 CSV에는 13개만 있음. Shanghai는 `film/07-shanghai`에 영상 작업으로 존재. **확인 필요**: archives에 Shanghai가 누락된 것인지, 기획서가 stale 한 것인지.
- CSV의 `24-taipei` 라벨은 `TAIPEI '25`, `25-newyork` 라벨은 `NEWYORK '24`. slug의 연도 prefix와 표시 라벨이 불일치. 의도적인지 오타인지 **확인 필요**.
- CSV의 `22-switzerland`의 표시 라벨은 `NTERLAKEN '22` — `INTERLAKEN`의 오타로 추정.
- `data/archives.ts`에는 14개(Shanghai 포함)가 있다는 project-structure.md 기록과 CSV의 13개가 불일치.
