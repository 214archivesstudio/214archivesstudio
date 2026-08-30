# Admin Setup Guide

> 어드민 시스템 셋업 단계. 결정 배경은 [ADR-0001](../wiki/decisions/0001-admin-architecture.md) 참고.

이 가이드는 Phase 1만 다룹니다 (Supabase 인프라 + 첫 admin + seed). 어드민 UI 구축은 Phase 3, sync 스크립트는 Phase 5.

## 사전 요구사항

- [Supabase CLI](https://supabase.com/docs/guides/cli) 설치: `brew install supabase/tap/supabase`
- Supabase 계정
- Cloudinary 계정 (이미 사용 중)
- `tsx` 런타임 (seed 스크립트 실행용): `npm install -D tsx`
- `@supabase/supabase-js` (런타임 + 서버): `npm install @supabase/supabase-js`

## 1. Supabase 프로젝트 생성

1. <https://supabase.com/dashboard> → **New Project**
2. 이름: `214archivesstudio` (또는 자유). 리전: `ap-northeast-2 (Seoul)` 권장 (KR 사용자 latency).
3. 프로젝트 생성 후 **Project Settings → API**에서 다음을 복사:
   - **Project URL** → `SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ 절대 커밋 금지

## 2. 로컬 프로젝트 연결

```bash
supabase login
supabase link --project-ref <your-project-ref>
```

`<your-project-ref>`는 dashboard URL에서 확인 (`https://supabase.com/dashboard/project/{ref}`).

## 3. 첫 admin 사용자 등록

마이그레이션 `00002_seed_first_admin.sql`은 이미 존재하는 `auth.users` 행을 `user_roles`로 승격합니다. 따라서 **마이그레이션 실행 전에 사용자가 먼저 존재**해야 합니다.

1. Supabase Dashboard → **Authentication → Users → Add user → Create new user**
2. 이메일: `214archivesstudio@gmail.com`
3. **Auto Confirm User** ON으로 즉시 활성화
4. 비밀번호 입력 (첫 로그인부터 사용)

> 어드민은 [ADR-0001 amendment](../wiki/decisions/0001-admin-architecture.md#amendments)에 따라 **이메일·비밀번호 로그인**을 사용합니다 (매직링크는 rate limit 이슈로 폐기). 비밀번호를 잊으면 dashboard의 같은 화면에서 직접 재설정.

## 4. 마이그레이션 적용

```bash
supabase db push
```

다음이 적용됩니다:
- `00001_initial_schema.sql` — 테이블·enum·RLS·트리거
- `00002_seed_first_admin.sql` — `214archivesstudio@gmail.com`을 `admin` 역할로 등록
- `00003_is_admin_service_role.sql` — service role 의 admin 판정 보정
- `00004_reorder_post_media.sql` — 미디어 순서 변경용 SQL 함수 `reorder_post_media` (어드민 드래그 정렬이 호출)

`00002`가 "First admin user not found" 에러를 내면 3단계로 돌아가 사용자를 먼저 만드세요.

스키마를 바꿨다면 TS 타입도 재생성합니다 (프로젝트가 `supabase link` 된 상태여야 함):

```bash
npm run gen:types   # → types/supabase.ts (생성 파일, 직접 편집 금지)
```

## 5. 환경 변수 설정

`.env.local`에 [.env.example](../.env.example)을 복사해 채웁니다.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`와 `GITHUB_DISPATCH_TOKEN`은 server-only. `NEXT_PUBLIC_` prefix가 없는 변수는 브라우저에 노출되지 않습니다.

## 6. data/*.ts → Supabase Seed

기존 30개 작품을 Supabase에 import:

```bash
npm run seed                  # all drafts (published=false)
npm run seed -- --publish-all # Step 0 gate / test: 모두 published=true
```

> 내부적으로 `tsx --env-file=.env.local scripts/seed-from-data.ts`를 실행합니다. 이 스크립트는 라이브 `data/*.ts` 콘텐츠를 직접 읽어 DB에 upsert합니다 (Step 0 게이트의 round-trip source). 이전의 `scripts/seed-from-csv.ts`는 보존되지만 더 이상 호출되지 않습니다.

모든 게시물이 기본 `published=false` (draft)로 들어옵니다. 어드민 UI에서 검토하고 publish하면 됩니다.

성공 출력 예:
```
Seeding from data/*.ts → Supabase (published=false (drafts)).
  ✓ archives/24-taipei (26 media)
  ✓ archives/25-tokyo (15 media)
  ...
Seed complete: 30/30 posts upserted.
```

## 7. Cloudinary Upload Preset (Phase 3b 진입 전)

어드민에서 이미지를 업로드하려면 Cloudinary에 **unsigned upload preset**이 하나 필요합니다.

1. <https://console.cloudinary.com> → **Settings → Upload → Upload presets → Add upload preset**
2. 다음 값으로 생성:
   - **Preset name**: `214archives_admin` (자유)
   - **Signing Mode**: **Unsigned**
   - **Asset folder**: `214archives` (이미지가 항상 이 prefix 아래로 들어감 — slug 별 폴더는 widget 콜백에서 동적으로 지정)
   - **Use filename or externally defined Public ID**: ON
   - **Unique filename**: ON (덮어쓰기 방지)
   - **Overwrite**: OFF
   - **Allowed formats**: `jpg, png, webp, avif, gif`
   - **Max file size**: 20MB 정도 권장
3. 저장 후 preset name을 `.env.local`의 `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`에 입력:
   ```
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=214archives_admin
   ```
4. 어드민 페이지 새로고침 → 업로드 위젯 작동.

> **왜 unsigned?** signed upload는 서버 시그니처가 필요해 어드민에서 매번 Server Action을 거쳐야 합니다. unsigned로 두되 RLS와 admin 라우트 보호로 권한을 통제합니다. preset에 size·format·folder 제약이 걸려 있어 악용 위험은 낮음.

### 7.1 영상 썸네일 preset (Phase G1, film 전용)

film 게시물의 hover 영상 썸네일을 어드민에서 업로드하려면 **영상 전용 unsigned preset**이 별도로 필요합니다 (이미지 preset의 용량·포맷 제약과 분리하기 위함).

1. **Settings → Upload → Upload presets → Add upload preset**
2. 다음 값으로 생성:
   - **Preset name**: `214archives_admin_video`
   - **Signing Mode**: **Unsigned**
   - **Asset folder**: `214archives/film`
   - **Unique filename**: ON / **Overwrite**: OFF
   - **Allowed formats**: `mp4, webm, mov`
   - **Max file size**: 200MB
3. `.env.local` 과 Vercel 환경 변수에 추가:
   ```
   NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET=214archives_admin_video
   ```
4. 어드민에서 film 게시물 편집 → "영상 썸네일" 업로더가 안내 박스 대신 업로드 버튼으로 표시되면 완료.

> 업로드된 원본은 그대로 보존되고, DB에는 `du_10,q_auto,vc_auto,w_1280` 변환이 적용된 딜리버리 URL(앞 10초·자동 압축·최대 폭 1280)이 저장됩니다. 상세: [admin-phase-g1-plan §2](./admin-phase-g1-plan.md).

## 8. GitHub Actions Publish Trigger (Phase 4)

어드민의 "사이트에 반영" 버튼은 `repository_dispatch`로 [.github/workflows/publish.yml](../.github/workflows/publish.yml)을 트리거합니다. 두 가지 셋업이 필요:

### 8.1 Fine-grained Personal Access Token

1. <https://github.com/settings/personal-access-tokens> → **Generate new token (fine-grained)**
2. 다음으로 설정:
   - **Token name**: `214archives publish dispatch`
   - **Resource owner**: 이 repo가 속한 owner (예: `214archivesstudio`)
   - **Repository access**: **Only select repositories** → `214archivesstudio/214archivesstudio` 만
   - **Repository permissions**:
     - **Actions**: `Read and write` (workflow를 dispatch하려면 write 필요)
     - **Metadata**: `Read` (자동 활성화)
   - 만료 기한: 사용 정책에 맞게 (예: 90일)
3. 발급된 토큰을 `.env.local`의 `GITHUB_DISPATCH_TOKEN`에 붙여넣기
4. `.env.local`의 `GITHUB_DISPATCH_REPO`를 `owner/repo` 형식으로 (예: `214archivesstudio/214archivesstudio`)

> PAT은 server-only. 어드민 server action(`triggerPublish`)만 사용. 절대 NEXT_PUBLIC_ prefix 붙이지 말 것.

### 8.2 GitHub Actions secrets

워크플로 안에서 Supabase에 publish_jobs 상태를 PATCH하려면 두 시크릿이 필요:

1. <https://github.com/214archivesstudio/214archivesstudio/settings/secrets/actions> → **New repository secret**
2. 다음 두 시크릿 추가:
   - `SUPABASE_URL` ← `.env.local`의 같은 값
   - `SUPABASE_SERVICE_ROLE_KEY` ← `.env.local`의 같은 값

### 8.3 Vercel 환경 변수 (프로덕션 어드민 운영 시 필수)

어드민은 [ADR-0001](../wiki/decisions/0001-admin-architecture.md) 에 따라 Vercel 프로덕션 (`/admin/*`) 에서 운영됩니다. `triggerPublish()` 등 server action 이 Vercel 측 env 를 읽으므로, **`.env.local` 만 채우면 로컬은 동작해도 prod 어드민은 동작하지 않습니다.**

**Vercel Dashboard → Project → Settings → Environment Variables** 에서 다음을 **Production** scope 에 등록:

| 변수 | 값 | 비고 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | 클라이언트 노출 OK |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | 클라이언트 노출 OK |
| `SUPABASE_URL` | 같은 Project URL (server-side 헬퍼용) | server-only |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret | ⚠️ server-only |
| `GITHUB_DISPATCH_TOKEN` | 8.1 에서 발급한 PAT | ⚠️ server-only |
| `GITHUB_DISPATCH_REPO` | `214archivesstudio/214archivesstudio` | — |
| `NEXT_PUBLIC_SITE_URL` | `https://214archives.studio` | dev 의 `localhost:3001` 과 다름 |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | 클라우드 네임 | 이미 등록돼 있을 수 있음 |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | 7번 에서 만든 preset | 어드민 업로드 위젯용 |
| `NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET` | 7.1 에서 만든 영상 preset | film 영상 썸네일 업로더용 |

등록 후 **Deployments → 최신 Production → Redeploy** (또는 main 에 빈 commit push) 로 env 를 적용합니다. 재배포 없이는 새 env 가 반영 안 됨.

> `NEXT_PUBLIC_SITE_URL` 은 dev (`http://localhost:3001`) 와 prod (`https://214archives.studio`) 가 달라야 합니다. Supabase Dashboard → Authentication → URL Configuration 의 Site URL/Redirect URLs 와도 일치해야 OAuth/이메일 흐름이 깨지지 않습니다.

### 8.4 검증

1. 어드민 대시보드 (`/admin`) → "사이트에 반영" 클릭
2. publish_jobs 테이블에 새 row 생성 (status=pending → running → success)
3. GitHub Actions tab에서 workflow run 확인
4. workflow가 성공하면 `data/*.ts`가 commit + push (sync diff가 있을 때만)
5. Vercel이 main push 감지하고 자동 빌드

> 첫 번째 publish 클릭 전에는 drift 카운트가 모든 published 게시물을 표시합니다 (last_success=null이라 모든 row가 "변경됨"으로 카운트). 한 번 성공 publish 후에는 정상 동작.

## 9. 검증

Supabase Dashboard → **Table Editor**에서 확인:
- `posts` 30 rows (모두 `published=false`)
- `post_media` ~330 rows
- `user_roles` 1 row (admin)

## 다음 단계

- **Phase 2** ✅ — Supabase Auth + `app/admin/*` 라우트 보호 미들웨어
- **Phase 3a** ✅ — 게시물 목록 + 필터/검색/삭제
- **Phase 3b** ✅ — 게시물 등록·수정 + 썸네일 업로드 + publish 토글
- **Phase 3c** ✅ — 미디어 매니저 (다중 업로드 + reorder + 삭제)
- **Phase 4** ✅ — `scripts/sync-from-supabase.ts` + GitHub Actions + 어드민 Publish 빌드 트리거

각 phase는 별도 ADR 또는 task로 진행. 진행 중 발견되는 이슈는 [ADR-0001 § Open questions](../wiki/decisions/0001-admin-architecture.md#open-questions-실행-중-결정)에 추가합니다.

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `supabase db push`에서 "First admin user not found" | 3단계 누락. Auth에서 사용자 생성 후 재시도. |
| Seed 스크립트가 RLS 에러를 냄 | service role key 대신 anon key를 썼을 가능성. `SUPABASE_SERVICE_ROLE_KEY` 확인. |
| 마이그레이션 롤백 필요 | `supabase db reset` (⚠️ 모든 데이터 삭제) — dev 환경에서만. |
| Seed가 "Only admin can create already-published posts" 에러 | 마이그레이션 `00003_is_admin_service_role.sql` 미적용. `supabase db push` 다시 실행. |
| Publish가 트리거 안 됨 / 401 | `GITHUB_DISPATCH_TOKEN` 권한·만료 확인. fine-grained PAT의 **Actions: write** 가 있어야 함. |
| Publish run은 끝났는데 어드민 status 가 그대로 | GH Action secrets (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`)이 누락됐을 가능성. PATCH 콜이 실패해도 workflow 자체는 성공 표시되니 GH Actions log 의 "Mark job result" 단계 확인. |
