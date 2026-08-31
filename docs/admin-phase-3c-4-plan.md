# 관리자 페이지 — Phase 3c + 4 작업 계획 (ship 완료)

> **상태**: ✅ ship 완료 (2026-05-16). 본 문서는 *수립 → 실행 → 회고* 의 단일 기록.
> **범위**: 미디어 매니저(3c) + Publish 빌드 트리거(4) 한 ship + Admin Header 오염 자투리 fix.
> **참고**: [ADR-0001](../wiki/decisions/0001-admin-architecture.md) · [admin-overview](./admin-overview.md) · [admin-setup](./admin-setup.md)

---

## 0. 배경

[docs/admin-overview.md](./admin-overview.md) §6 진척도 기준 Phase 3b 완료, Phase 3c 진입 직전. ADR-0001의 본래 목적 ("작가가 직접 운영")이 실현되려면 3c(미디어 매니저)와 4(publish 빌드 트리거)가 모두 필요. 두 phase를 한 ship으로 묶고 같이 검증.

---

## 1. 결정 기록 (8 branches)

이번 계획 수립 과정에서 확정된 결정. ADR-0001의 Open Questions §1, §2 해소.

| # | 분기 | 결정 | 사유 (요약) |
|---|---|---|---|
| 1 | 스코프 | 3c → 4 한 ship + Header fix / `as never`·lint 별도 phase | ADR 핵심 가치는 4까지 가야 실현 |
| 2 | 정보 구조 | `/admin/posts/[id]` 한 페이지, 갤러리는 즉시 저장 | 작가가 "게시물 = 한 화면" 멘탈 모델. 사진 30장 올리고 또 "저장"은 어색 |
| 3 | 혼합 미디어 | archives/photo/film = 이미지만, personal = 이미지+영상 | 기존 `data/personal.ts` 가 mixed media. 절반만 지원하면 sync에서 손실 |
| 4 | 업로드 UI | Cloudinary Upload Widget multi-mode 재사용 | 큐·진행률·재시도 무료. critical path 단축 |
| 5 | 빌드 트리거 | GitHub Actions `repository_dispatch` + concurrency group | ADR 가정과 일치, concurrency가 큐 락 문제 자연 해결 |
| 6 | publish 의미론 | `published` (의도 플래그) ↔ "사이트에 반영" (배포 액션) 분리 | ADR §Consequences의 dual-storage 모델 정확화. 빌드 비용을 작가가 통제 |
| 7 | Preview 모드 | v1 미포함. 어드민 내 preview는 추후 후보 | ADR 정적 모델 보존. publish 후 확인 흐름이 충분 (2분) |
| 8 | 작업 순서 | Sync-first — 스크립트 먼저 짜고 diff-zero 검증 | 가장 큰 미지수는 "schema가 기존 data/*.ts 를 손실 없이 표현하는가". 늦게 발견하면 재작업 |

### 1.1 실행 중 추가 확정된 결정

| # | 분기 | 결정 | 사유 |
|---|---|---|---|
| 9 | seed source | CSV 기반 → `data/*.ts` 기반으로 재작성 | `data/*.ts` 가 live 콘텐츠 source. round-trip 게이트가 "data/*.ts → DB → data/*.ts" 손실 없음을 직접 증명 |
| 10 | archives year 표현 | DB `year_label` 4-digit `"2022"` 저장, sync verbatim emit | UI 의 `formatArchiveYear` 가 표시용 `'22` 변환 담당. DB 는 정규형 |
| 11 | film videoThumbnailUrl | DB `posts.video_thumbnail_url` 컬럼이 source, sync verbatim emit | `buildVideoThumbnailUrl` 헬퍼 + `VIDEO_THUMBNAIL_VERSIONS` 맵 사라짐. admin UI 에서 추후 직접 편집 가능 |
| 12 | personal placeholder video | `data/personal.ts` PONY 의 placeholder video item 제거 | `videoId: "placeholder"` 는 실 영상 아님 |
| 13 | showreel year 파생 | sync 가 `date.slice(0,4)` 로 파생, slug=id 통일 (`2025-showreel`) | 별도 컬럼 신설 회피. data/showreels.ts 의 date 가 실제 연도와 맞아야 함 |
| 14 | `is_admin()` service_role | migration 00003 에서 `is_admin()` 이 service_role 도 admin 으로 인정 | `guard_publish_toggle` 트리거가 service role 의 publish 토글을 막던 schema 결함 수정. RLS 정책 영향 없음 (이미 bypassrls) |

---

## 2. 용어 (코드·UI 일관 적용)

| 용어 | 정의 |
|---|---|
| `published` | DB의 공개 의도 플래그 (boolean column on `posts`) |
| publish toggle | `published` 를 뒤집는 액션. 공개 사이트에 영향 ❌ |
| sync to site ("사이트에 반영") | 현재 `published=true` 스냅샷을 `data/*.ts` 로 emit + commit + 빌드 트리거 |
| drift | 마지막 성공 sync 이후 변경된 published 게시물 개수. 어드민 대시보드에 배지로 표시 |

---

## 3. 단계별 작업 (실제 산출물)

### Step 0 — Sync 스크립트 + diff-zero 검증 ✅

**산출물**:
- [scripts/seed-from-data.ts](../scripts/seed-from-data.ts) — `data/*.ts` const 를 직접 읽어 DB upsert. `--publish-all` 플래그로 테스트 게이트용 published=true 토글.
- [scripts/sync-from-supabase.ts](../scripts/sync-from-supabase.ts) — `published=true` posts + media 를 읽어 `data/{archives,films,personal,photography,showreels}.ts` 재생성. 정렬키 `date desc, slug asc`, 내부 media 는 `display_order asc`. `--dry-run` 으로 stdout 미리보기.
- [supabase/migrations/00003_is_admin_service_role.sql](../supabase/migrations/00003_is_admin_service_role.sql) — `is_admin()` 이 service_role 도 admin 으로 인정.
- [package.json](../package.json) — `seed` → `seed-from-data.ts`, `sync` 신설. env fallback (`SUPABASE_URL` ?? `NEXT_PUBLIC_SUPABASE_URL`).
- 1회성 마이그레이션: `data/{archives,films,personal,photography,showreels}.ts` 가 helper-free 리터럴 form 으로 재생성됨. PONY placeholder video 제거.

**검증 (실 실행 기록)**:
1. `npm run seed -- --publish-all` → 30/30 posts upserted, published=true ✓
2. `npm run sync` → 30 posts fetched, 5개 파일 재생성 ✓
3. `npm run sync` 재실행 → diff-zero (idempotent 확인) ✓

**game-day 발견**:
- service role 이 published=true insert 차단 → migration 00003 으로 해결 (계획 §5 의 "schema patch 필요할 수도" 적중).
- `.env.local` 이 `SUPABASE_URL` 미존재, `NEXT_PUBLIC_SUPABASE_URL` 만 존재 → 스크립트가 둘 다 받게 fallback 추가.
- showreel `year` 가 date placeholder(`2026-02-23`) 때문에 derive 시 어긋남 → data/showreels.ts 의 date 를 실 연도로 교정.

### Step 1 — Admin Header 오염 fix ✅

**산출물**:
- [app/(public)/](../app/(public)/) route group 신설. 공개 라우트(`archives`, `film`, `personal`, `photography`, `showreel`, `contact`, `/`) 가 모두 이 그룹으로 이동.
- `app/(public)/layout.tsx` — 공개 Header + Footer + Background.
- `app/layout.tsx` — root: html/body 만.
- `/admin/*` 은 그룹 밖이라 공개 Header 자동 제외.

대안 (root layout 에서 분기) 거부 — fragile.

### Step 2 — Phase 3c 미디어 매니저 ✅

**산출물**:

| 항목 | 위치 |
|---|---|
| Server Actions | [app/admin/posts/_actions/media.ts](../app/admin/posts/_actions/media.ts) |
| 컨테이너 | `app/admin/posts/_components/media/MediaManager.tsx` |
| 그리드 + dnd-kit | `MediaGrid.tsx` |
| 카드 (이미지) | `MediaCard.tsx` — 썸네일 + alt onBlur 저장 + 삭제 |
| 카드 (영상, personal 전용) | `VideoMediaCard.tsx` — platform 아이콘 + videoId 표시 |
| 이미지 추가 | `AddImage.tsx` — Cloudinary widget multi-mode |
| 영상 추가 | `AddVideoModal.tsx` — URL → `parseVideoUrl` 검증 |
| 의존성 | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| 편집 페이지 통합 | `app/admin/posts/[id]/page.tsx` — `<PostForm />` 아래 `<MediaManager />`. showreel 은 안내 메시지만. `?created=1` 인라인 가이드. |

| Action | 권한 | 동작 |
|---|---|---|
| `addImageMedia(postId, …)` | editor/admin | `display_order = max(existing) + 1` insert |
| `addVideoMedia(postId, url)` | editor/admin, **section=personal만** | `parseVideoUrl()`, server-side section check |
| `updateMediaAlt(mediaId, alt)` | editor/admin | null 허용 |
| `deleteMedia(mediaId)` | editor/admin | RLS 권한 처리 |
| `reorderMedia(postId, orderedIds[])` | editor/admin | 일괄 `display_order` update |

`onDragEnd` → optimistic UI 갱신 → 백그라운드 action. 실패 시 toast + 원상복구. KeyboardSensor 추가 (a11y).

### Step 3 — Phase 4 publish + GitHub Actions ✅

**산출물**:
- [.github/workflows/publish.yml](../.github/workflows/publish.yml) — `repository_dispatch: publish-content` + `concurrency: publish-builds (cancel-in-progress: false)`. Steps: checkout → setup-node → `npm ci` → `npx tsx scripts/sync-from-supabase.ts` → 빈 diff면 skip / 아니면 `git commit -am "publish: …" && git push` → `publish_jobs` PATCH(success/failed).
- [app/admin/_actions/publish.ts](../app/admin/_actions/publish.ts) — `triggerPublish()` server action. `requireAdmin()` 게이트, `publish_jobs` row 생성, GitHub Dispatch API 호출, 실패 시 row 를 failed 로 마킹.
- [app/admin/page.tsx](../app/admin/page.tsx) — drift indicator + "사이트에 반영" 버튼 + 최근 publish_jobs 10건 테이블 + 진행중 job 5초 폴링 (끝나면 stop).
- env: `GITHUB_DISPATCH_TOKEN`, `GITHUB_DISPATCH_REPO` (Next.js 서버측). GH Action secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [docs/admin-setup.md §8](./admin-setup.md#8-github-actions-publish-trigger-phase-4) — PAT 발급법 + secret 등록법 추가.

### Step 4 — 문서 ✅

- **ADR-0001 amendments** (2026-05-15 자): Build trigger `repository_dispatch` (Open Q §1 해소), Publish 의미론 분리, Preview mode 보류 v1 (Open Q §2 해소).
- [docs/admin-overview.md](./admin-overview.md) §3 기획 변화 + §6 Phase 진척도 (3c/4 완료) + §12 다음 작업 갱신.
- [wiki/log.md](../wiki/log.md) + [wiki/index.md](../wiki/index.md) 갱신.

---

## 4. 일정 추정 vs 실제

| Step | 추정 | 실제 |
|---|---|---|
| 0 sync + diff-zero | 1.5d | ~0.5d (audit + 마이그레이션 1건 포함) |
| 1 Header fix | 0.5d | ~0.3d |
| 2 미디어 매니저 (3c) | 4d | ~1d (Cloudinary widget·dnd-kit 패턴화로 단축) |
| 3 publish + Action (4) | 2.5d | ~1d |
| 4 문서 | 0.5d | ~0.3d |
| **합계** | **~9d** | **~3d (한 세션)** |

추정이 보수적이었음. 후속 일정 추정 시 참고.

---

## 5. 리스크 & 발생 사건 (회고)

### 5.1 예측한 리스크 → 실제

- **personal mixed media 순서 손실**: PONY placeholder 가 실 영상 아니라 데이터에서 제거하는 결정으로 해결. mixed media 순서 보존 자체는 sync 가 `display_order` asc 로 emit 해서 잘 동작 ✓
- **archives `year` vs `year_label`**: DB 4-digit 저장으로 결정. `formatArchiveYear` UI 유틸이 표시용 변환 담당 ✓
- **film `videoThumbnailUrl`**: DB 컬럼이 source 로 결정. 1회성 마이그레이션 diff 후 idempotent ✓

### 5.2 예측 못 한 발생 사건

- **`is_admin()` service_role 인식 부재** (migration 00001 의 잠재 결함): seed 가 published=true 로 insert 시 `guard_publish_toggle` 트리거가 차단. migration 00003 으로 해결.
- **`.env.local` 의 `SUPABASE_URL` 부재**: `NEXT_PUBLIC_SUPABASE_URL` 만 존재. 스크립트 fallback 추가.
- **showreel `date` placeholder 와 derive 충돌**: data/showreels.ts 의 date 를 실 연도와 맞게 교정.

### 5.3 보류 (그대로 유지)

- Preview mode (Q7 (B)) — 작가 운영 시작 후 욕구 보면서 추가
- `as never` 정리 → `supabase gen types typescript` 도입
- `next lint` → ESLint flat config migration
- 영상 항목 자동 썸네일 fetch (oembed)

---

## 6. Ship 후 잔여 작업

### 6.1 운영 진입 전 사용자 셋업 (필수)

- [ ] **Fine-grained PAT 발급** — github.com/settings/personal-access-tokens, repo=`214archivesstudio/214archivesstudio`, Actions: Read and write, Metadata: Read → `.env.local` 의 `GITHUB_DISPATCH_TOKEN` + `GITHUB_DISPATCH_REPO` 채우기.
- [ ] **GitHub Actions secrets 등록** — repo settings → Secrets → `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`. 자세한 단계는 [docs/admin-setup.md §8](./admin-setup.md#8-github-actions-publish-trigger-phase-4).
- [ ] **migration 00003 staging 환경 적용** (있다면).

### 6.2 실 운영 first-pass 검증 (필수, 브라우저)

Step 2 — 미디어 매니저 (`/admin/posts/<id>`):
- [ ] **이미지 다중 업로드** — Cloudinary widget multi-mode 동시 업로드 → 그리드 끝에 순서대로 추가
- [ ] **드래그 정렬** — 드롭 후 optimistic 갱신 → 새로고침 후에도 순서 유지
- [ ] **키보드 정렬 (a11y)** — Tab → Space (grab) → 화살표 → Space (drop)
- [ ] **alt 편집** — input 수정 → onBlur 저장 → 새로고침 유지
- [ ] **삭제** — 확인 다이얼로그 → 그리드에서 사라짐
- [ ] **personal 영상 추가** — `/admin/posts/<pony-project>` "영상 추가" 버튼 → YouTube URL → 카드 추가
- [ ] **personal 외 영상 차단** — archives/film/photo/showreel 에는 "영상 추가" 버튼 부재
- [ ] **잘못된 영상 URL 거부** — `https://example.com/asdf` → "유효한 YouTube 또는 Vimeo URL이 아닙니다"
- [ ] **showreel 안내 메시지** — `/admin/posts/<2025-showreel>` "쇼릴은 갤러리가 없습니다"
- [ ] **신규 생성 인라인 가이드** — `/admin/posts/new` 생성 후 `?created=1` 메시지

Step 3 — Publish 흐름 (`/admin`):
- [ ] **Drift 지표** — 미커밋 변경 N건 표시 정확성
- [ ] **버튼 권한** — editor 계정에서는 버튼 숨김 / admin 만 노출
- [ ] **트리거 → 폴링** — 클릭 → 5초 폴링 → pending → running → success → drift 0 회귀
- [ ] **빈 diff skip** — 두 번 연속 클릭 시 두 번째는 commit 없이 종료
- [ ] **실패 경로** — 잘못된 token → 친화적 에러 + `publish_jobs.status='failed'`
- [ ] **GH Actions tab** — workflow run 가시성, main 브랜치 commit 푸시 확인
- [ ] **Vercel 빌드** — main push → 자동 빌드 → 1-3분 후 공개 사이트 반영

Step 1 — Route group:
- [ ] (재확인) `/admin/*` 어디서도 공개 Header 안 보임
- [ ] 공개 라우트 모두 정상 (Header + Background)
- [ ] 게시물 상세 SSG 정상 — canonical 리터럴 form 실 렌더 (이미지·영상)

**Full loop 실증** (필수):
- [ ] 실제 작가가 게시물 1건 등록 → 갤러리 5-10장 → 정렬 → publish 토글 → "사이트에 반영" → 공개 사이트 반영까지의 full loop 1회. 막힘없이 돌면 ADR-0001 의 본래 목적이 실증됨.

### 6.3 단기 우선순위 잔여 (admin-overview §12)

- [ ] **`as never` 캐스트 정리** — `supabase gen types typescript --linked > types/database.ts` 도입 시 일괄 해소
- [ ] **`next lint` 복구** — Next.js 16 호환 ESLint flat config migration
- [ ] **publish_jobs `triggered_by` 이메일 enrichment** — 현재 UUID 만. `auth.admin.getUserById` (service role) lookup
- [ ] **첫 publish 의 drift 표시 보정** — `last_success === null` 일 때 UX 분기

### 6.4 중기 후보 (필요 시)

- [ ] 영상 oembed thumbnail fetch
- [ ] Preview mode (ADR Open Q §2)
- [ ] Phase 3d Team 관리 — 사용자 초대 UI
- [ ] `reorderMedia` Postgres RPC 단일 transaction 화

### 6.5 알려진 트레이드오프

- video thumbnail URL 직접 편집 UI 없음 (DB 컬럼만 source)
- sync 출력 prettier 미통과 — 일부 줄이 길지만 현재 형식 OK

---

## 7. Launch sequence (다음 ship)

> 2026-05-21 grill 산물. §6.1 + §6.2 의 "필수" 항목들을 실 launch 가능한 순서로 정렬. 작업 owner 와 의존성 명시.

### 7.0 확정된 운영 컨텍스트

- **운영 위치**: Vercel 프로덕션 (`https://214archives.studio/admin`)
- **prod Supabase**: migration 00003 적용 ✅, 30/30 published=true ✅ (Step 0 게이트가 prod 에 대해 `--publish-all` 로 실행됨)
- **Vercel server-side env**: 미설정 (Supabase service role, GITHUB_DISPATCH_*) — A4 에서 셋업
- **Risk**: A4 누락 시 prod 어드민이 동작 불가. Phase D 전 반드시 완료.

### 7.1 Phase A — Prep & Setup

| # | 작업 | Owner | Exit |
|---|---|---|---|
| A1 | Fine-grained PAT 발급 (Actions: R+W, Metadata: R, repo 한정, 만료 90일) | 작가 | 토큰값 확보 |
| A2 | `.env.local` 에 `GITHUB_DISPATCH_TOKEN`, `GITHUB_DISPATCH_REPO` 채우기 | 작가 | 로컬 publish action 통과 |
| A3 | GH Actions secrets 등록 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) | 작가 | repo secrets 페이지 확인 |
| A4 | Vercel env 등록 (Production scope) — `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_DISPATCH_TOKEN`, `GITHUB_DISPATCH_REPO`, `NEXT_PUBLIC_SITE_URL=https://214archives.studio`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | 작가 | Vercel dashboard 확인 |
| A5 | Vercel 재배포 (env 적용) | 작가 | prod 빌드 성공 |
| A6 | `docs/admin-setup.md §8` 에 Vercel env 절차 추가 (현재 누락) | Claude | doc commit |

자세한 절차: [docs/admin-setup.md §8](./admin-setup.md#8-github-actions-publish-trigger-phase-4)

### 7.2 Phase B — 미디어 매니저 검증 (Claude, localhost, A 와 병렬 가능)

전제: `npm run dev` (3001), `.env.local` 의 prod Supabase. **테스트 전용 임시 post 1건** 으로 격리, 검증 후 삭제.

`mcp__playwright` 자동 큐핀:
- 이미지 다중 업로드 (Cloudinary widget)
- 드래그 정렬 → optimistic UI → 새로고침 후 유지
- 키보드 정렬 a11y (Tab → Space → 화살표 → Space)
- alt 편집 onBlur 저장
- 삭제 확인 다이얼로그
- personal 영상 추가 + URL 검증
- personal 외 섹션 "영상 추가" 부재
- 잘못된 영상 URL 거부
- showreel 안내 메시지
- `?created=1` 인라인 가이드

### 7.3 Phase C — Publish 흐름 검증 (공동, localhost dev → prod)

전제: A1–A3 완료.

| # | 작업 | Owner |
|---|---|---|
| C1 | `localhost:3001/admin` 로그인 | 작가 |
| C2 | drift 지표 확인 (`last_success=null` 이라 30 표시 — §6.5) | Claude playwright |
| C3 | "사이트에 반영" → pending → running → success → drift 0 (diff zero) | Claude playwright |
| C4 | GH Actions tab — workflow success + "no changes" 로그 | 작가 |
| C5 | 두 번째 클릭도 빈 diff skip | Claude playwright |
| C6 | 실패 경로 — PAT 잠깐 잘못된 값 → friendly error + `publish_jobs.status='failed'` → PAT 복구 | 공동 |
| C7 | 실 sync — post 1건 텍스트 수정 → drift 1 → publish → main 에 commit + push | 작가 + Claude |
| C8 | Vercel auto-build (~1–3분) → 공개 사이트 반영 확인 | 작가 |

### 7.4 Phase D — Production admin 검증

전제: Phase A 전체 완료.

- [ ] `https://214archives.studio/admin` 접속 → 공개 Header 부재
- [ ] 공개 라우트 (`/`, `/archives`, `/film`, `/personal`, `/photography`, `/showreel`, `/contact`) 모두 Header + Background
- [ ] 게시물 상세 SSG 정상 (이미지·영상 렌더)
- [ ] prod 어드민 로그인 → 대시보드 → 한 번 더 publish (diff zero skip)

### 7.5 Phase E — Full loop 실증 (ADR-0001 본래 목적 검증)

- [ ] 작가가 신규 게시물 1건 등록
- [ ] 갤러리 5–10장 업로드 + 드래그 정렬
- [ ] (personal 이면) 영상 1건 추가
- [ ] publish 토글 ON
- [ ] "사이트에 반영" 클릭
- [ ] 2분 후 공개 사이트 반영 확인
- [ ] (테스트면) 삭제 후 다시 publish

**Exit**: 막힘없이 한 번 완료 → ADR-0001 의 "비기술 사용자가 직접 운영" 가치 실증.

### 7.6 Phase F — Launch 후 정렬 (별도 ship)

§6.3 단기 + §6.4 중기 + §6.5 트레이드오프 의 잔여. 우선순위는 Phase E 완료 후 별도 grill 에서 결정.

### 7.7 의존성 그래프

```
A1 ─┬─► A2 ──► C (publish 검증)
    ├─► A3 ──┘
    └─► A4 ──► A5 ──► D (prod 검증) ──► E (full loop)

A6 (doc) ──► (병렬)
B (미디어 매니저) ──► (병렬, A 무관)
```

### 7.8 일정 추정

| Phase | 추정 | Owner |
|---|---|---|
| A | ~30분 | 작가 + Claude (A6) |
| B | ~30분 | Claude |
| C | ~20분 | 공동 |
| D | ~10분 | 작가 |
| E | ~20–60분 | 작가 |
| **합계 launch** | **~2시간** | — |
| F | TBD | 다음 grill |

---

## 8. 참고 문서

- [ADR-0001 — Admin architecture](../wiki/decisions/0001-admin-architecture.md) — Amendments 에 이번 ship 결정 반영
- [admin-overview](./admin-overview.md) — 현재 상태 스냅샷 (Phase 진척도 갱신)
- [admin-setup](./admin-setup.md) — 셋업 가이드 §8 (PAT, GH secrets, Vercel env)
- [wiki/log.md](../wiki/log.md) — 시간순 활동 로그
