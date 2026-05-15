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

`00002`가 "First admin user not found" 에러를 내면 3단계로 돌아가 사용자를 먼저 만드세요.

## 5. 환경 변수 설정

`.env.local`에 [.env.example](../.env.example)을 복사해 채웁니다.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY`와 `GITHUB_DISPATCH_TOKEN`은 server-only. `NEXT_PUBLIC_` prefix가 없는 변수는 브라우저에 노출되지 않습니다.

## 6. CSV → Supabase Seed

기존 30개 작품을 Supabase에 import:

```bash
npm run seed
```

> 내부적으로 `tsx --env-file=.env.local scripts/seed-from-csv.ts`를 실행합니다. `tsx`는 `.env.local`을 자동 로드하지 않으므로 `--env-file` 플래그가 필요합니다 (Node 20.6+ 내장 기능).

모든 게시물이 `published=false` (draft)로 들어옵니다. 어드민 UI 구축 후 검토하고 publish하면 됩니다.

성공 출력 예:
```
Parsed 30 rows from CSV.
  ✓ archives/22-london (10 photos)
  ✓ archives/22-paris (7 photos)
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

## 8. 검증

Supabase Dashboard → **Table Editor**에서 확인:
- `posts` 30 rows (모두 `published=false`)
- `post_media` ~330 rows
- `user_roles` 1 row (admin)

## 다음 단계

- **Phase 2** ✅ — Supabase Auth + `app/admin/*` 라우트 보호 미들웨어
- **Phase 3a** ✅ — 게시물 목록 + 필터/검색/삭제
- **Phase 3b** — 게시물 등록·수정 + 썸네일 업로드 + publish 토글
- **Phase 3c** — 미디어 매니저 (다중 업로드 + reorder + 삭제)
- **Phase 4** — `scripts/sync-from-supabase.ts` + GitHub Actions + 어드민 Publish 빌드 트리거

각 phase는 별도 ADR 또는 task로 진행. 진행 중 발견되는 이슈는 [ADR-0001 § Open questions](../wiki/decisions/0001-admin-architecture.md#open-questions-실행-중-결정)에 추가합니다.

## 트러블슈팅

| 증상 | 원인 / 해결 |
|---|---|
| `supabase db push`에서 "First admin user not found" | 3단계 누락. Auth에서 사용자 생성 후 재시도. |
| Seed 스크립트가 RLS 에러를 냄 | service role key 대신 anon key를 썼을 가능성. `SUPABASE_SERVICE_ROLE_KEY` 확인. |
| 마이그레이션 롤백 필요 | `supabase db reset` (⚠️ 모든 데이터 삭제) — dev 환경에서만. |
| CSV 컬럼이 다름 | `scripts/seed-from-csv.ts`의 `parseCsv()` 컬럼 매핑 확인. CSV 첫 행 헤더가 `page,slug,title,date,thumbnail_id,image_ids,video_url`이어야 함. |
