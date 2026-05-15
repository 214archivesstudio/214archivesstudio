# 관리자 페이지 — Phase 3c + 4 작업 계획

> **상태**: 작업 계획 (2026-05-15 수립). 진행 중 갱신.
> **범위**: 미디어 매니저(3c) + Publish 빌드 트리거(4) 한 ship + Admin Header 오염 자투리 fix.
> **참고**: [ADR-0001](../wiki/decisions/0001-admin-architecture.md) · [admin-overview](./admin-overview.md) · [admin-setup](./admin-setup.md)

---

## 0. 배경

[docs/admin-overview.md](./admin-overview.md) §6 진척도 기준 Phase 3b 완료, Phase 3c 진입 직전. ADR-0001의 본래 목적 ("작가가 직접 운영")이 실현되려면 3c(미디어 매니저)와 4(publish 빌드 트리거)가 모두 필요. 두 phase를 한 ship으로 묶고 같이 검증한다.

---

## 1. 결정 기록 (8 branches)

이번 계획 수립 과정에서 확정된 결정. ADR-0001의 Open Questions 일부를 해소.

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

---

## 2. 용어 (코드·UI 일관 적용)

| 용어 | 정의 |
|---|---|
| `published` | DB의 공개 의도 플래그 (boolean column on `posts`) |
| publish toggle | `published` 를 뒤집는 액션. 공개 사이트에 영향 ❌ |
| sync to site ("사이트에 반영") | 현재 `published=true` 스냅샷을 `data/*.ts` 로 emit + commit + 빌드 트리거 |
| drift | 마지막 성공 sync 이후 변경된 published 게시물 개수. 어드민 대시보드에 배지로 표시 |

---

## 3. 단계별 작업

### Step 0 — Sync 스크립트 + diff-zero 검증 *(~1.5d, 가장 먼저)*

Schema가 기존 `data/*.ts` 를 손실 없이 표현하는지 증명하는 게이트. 통과 못 하면 Step 2로 넘어가지 않음.

- `scripts/sync-from-supabase.ts` 작성
  - service role key로 모든 `published=true` posts + 연결된 `post_media` 읽기
  - section 별로 grouping → `data/{archives,film,personal,photography,showreels}.ts` 재생성
  - `types/index.ts` 의 shape 그대로 emit
    - archives/photo: `photos: ReadonlyArray<CloudinaryImage>`
    - film: `photos` + 상위 `video`/`videoThumbnailUrl`
    - personal: `media: ReadonlyArray<CloudinaryImage | VideoEmbed>` (순서 보존)
    - showreel: 갤러리 없음, 상위 `video` 만
  - deterministic 출력: `display_order` 정렬, 객체 key 고정 순서, prettier 포맷
- `package.json` 에 `npm run sync` 추가
- 검증 절차
  1. seed의 30개 게시물 모두 `published=true` 로 (테스트 환경에서)
  2. `npm run sync` 실행
  3. `git diff data/` 가 의미 있는 변경 없음 — 무의미한 whitespace는 허용
  4. 의미 있는 diff → schema/seed/sync 셋 중 하나 결함. 그 자리에서 수정

### Step 1 — Admin Header 오염 fix *(~0.5d, 자투리)*

[app/layout.tsx](../app/layout.tsx) 가 모든 라우트에 공개 Header를 박는 문제 ([admin-overview §11](./admin-overview.md)).

**채택**: Route group 분리.

```
app/
├── (public)/      # Header/Footer 포함 layout
│   ├── archives/
│   ├── film/
│   └── ...
├── admin/         # 기존 어드민 layout
└── layout.tsx     # root: html/body 만
```

대안 (root layout에서 분기) 거부 — fragile.

### Step 2 — Phase 3c 미디어 매니저 *(~4d)*

#### 2.1 — Server Actions (`app/admin/posts/_actions/media.ts`)

| Action | 권한 | 동작 |
|---|---|---|
| `addImageMedia(postId, { publicId, width, height, alt? })` | editor/admin | `display_order = max(existing) + 1` 로 insert |
| `addVideoMedia(postId, url)` | editor/admin, **section=personal만** | `parseVideoUrl()` 재사용, server-side section check |
| `updateMediaAlt(mediaId, alt)` | editor/admin | null 허용 |
| `deleteMedia(mediaId)` | editor/admin | RLS가 권한 처리 |
| `reorderMedia(postId, orderedIds[])` | editor/admin | 단일 transaction에서 `display_order` 일괄 update |

ActionResult 패턴은 [app/admin/posts/_actions/posts.ts](../app/admin/posts/_actions/posts.ts) 와 동일.

#### 2.2 — UI 컴포넌트 (`app/admin/posts/_components/media/`)

- `<MediaManager postId section initialMedia />` — 최상위 컨테이너
- `<MediaGrid />` — `<SortableContext>` (dnd-kit) wrapper, 그리드 레이아웃
- `<MediaCard media />` — 썸네일 + alt input (`onBlur` 저장) + delete 버튼
- `<VideoMediaCard media />` — platform 아이콘 + videoId 표시 (personal 한정)
- `<AddVideoModal />` — URL 입력 → 클라이언트 `parseVideoUrl` 검증 → action 호출
- `<DeleteMediaButton />` — confirm dialog ([delete-dialog.tsx](../app/admin/posts/_components/delete-dialog.tsx) 패턴 재사용)

#### 2.3 — @dnd-kit 정렬

- 의존성 추가: `@dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities`
- `onDragEnd` → optimistic UI 즉시 갱신 → `reorderMedia(postId, newOrder)` 백그라운드 호출
- 실패 시 toast + 원상복구
- KeyboardSensor 추가 (접근성)

#### 2.4 — Personal 영상 항목

- section==='personal' 일 때만 "영상 추가" 버튼 노출
- 모달에서 URL 입력 → `parseVideoUrl` 통과해야 추가 가능
- 영상 카드는 platform 아이콘 + videoId 표시 (영상 썸네일 자동 fetch는 Phase 4.5 후보)

#### 2.5 — 편집 페이지 통합

- `/admin/posts/[id]/page.tsx` 의 `<PostForm />` 아래에 `<MediaManager />` 섹션
- showreel: "쇼릴은 갤러리가 없습니다" 안내만
- 신규 생성 직후(`?created=1`): "썸네일·기본 정보가 저장됐습니다. 이제 갤러리를 추가하세요" 인라인 메시지

### Step 3 — Phase 4 publish + GitHub Actions *(~2.5d)*

#### 3.1 — GitHub Actions workflow (`.github/workflows/publish.yml`)

```yaml
on:
  repository_dispatch:
    types: [publish-content]
concurrency:
  group: publish-builds
  cancel-in-progress: false
```

Steps: checkout → setup-node → `npm ci` → `npx tsx scripts/sync-from-supabase.ts` → 빈 diff면 skip / 아니면 `git commit -am "publish: $(date -u +%Y-%m-%dT%H:%M:%SZ)" && git push` → publish_jobs PATCH (success/failed)

#### 3.2 — `triggerPublish()` server action

- `requireAdmin()` (editor 차단)
- `publish_jobs` insert (status='pending', triggered_by=user.id)
- `fetch('https://api.github.com/repos/{owner}/{repo}/dispatches', { headers: { Authorization: Bearer ${GH_DISPATCH_TOKEN}, Accept: application/vnd.github+json }, body: { event_type: 'publish-content', client_payload: { job_id } } })`
- 실패 시 publish_job을 failed로 update

#### 3.3 — Admin dashboard publish UI ([app/admin/page.tsx](../app/admin/page.tsx))

- **Drift indicator**: `posts where published = true and updated_at > (last successful publish_jobs.completed_at ?? epoch)` count
  - 0 → "사이트와 동기화됨"
  - N>0 → "미반영 변경 N건"
- **"사이트에 반영" 버튼** — admin only. drift=0이어도 강제 재빌드용으로 활성
- **최근 publish_jobs 10건** 테이블: time, triggered_by, status, github_run_url
- **폴링**: 진행중 job 있을 때만 5초 간격으로 `getJobStatus(jobId)` 호출. 끝나면 stop.

#### 3.4 — env vars + setup docs

- Next.js 서버측: `GITHUB_DISPATCH_TOKEN` (fine-grained PAT, 해당 repo만, `actions: write` + `metadata: read`)
- GH Action secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- [docs/admin-setup.md](./admin-setup.md) 에 PAT 발급법·secret 등록법 추가

### Step 4 — 문서 *(~0.5d, 마지막)*

- **ADR-0001 amendments** (2026-05-15 자):
  - Build trigger → `repository_dispatch` (Open Q §1 해소)
  - Publish 의미론 분리 (`published` ↔ sync action)
  - Preview mode 보류 v1 (Open Q §2 해소)
- [docs/admin-overview.md](./admin-overview.md) §3 기획 변화 + §6 Phase 진척도 + §12 다음 작업 갱신
- [wiki/log.md](../wiki/log.md) 에 한 줄 entry 추가

---

## 4. 일정 추정

| Step | 추정 | 누적 |
|---|---|---|
| 0 sync + diff-zero | 1.5d | 1.5d |
| 1 Header fix | 0.5d | 2d |
| 2 미디어 매니저 (3c) | 4d | 6d |
| 3 publish + Action (4) | 2.5d | 8.5d |
| 4 문서 | 0.5d | **~9d** |

---

## 5. 리스크 & 보류

- **Step 0 게이트 실패 가능성**: personal mixed media 순서 손실, archives `year` (string '22) vs DB `year_label` 매핑, film `videoThumbnailUrl` 매핑이 가장 의심됨. 미디어 매니저 시작 전에 schema patch 필요할 수도 있음.
- **GH PAT 권한 최소화**: fine-grained PAT, 해당 repo만, 최소 권한.
- **빌드 한도 여유**: Vercel 무료 6000분/월, GH Actions 무료 2000분/월 — 작가가 하루 100번 발행해도 한참 안 닿음.
- **추후 결정 거리**:
  - Preview mode (Q7 (B)) — 작가 운영 시작 후 욕구 보면서 추가
  - `as never` 정리 → `supabase gen types typescript` 도입
  - `next lint` → ESLint flat config migration
  - 영상 항목 자동 썸네일 fetch (oembed)

---

## 6. 참고 문서

- [ADR-0001 — Admin architecture](../wiki/decisions/0001-admin-architecture.md)
- [admin-overview](./admin-overview.md) — 현재 상태 스냅샷
- [admin-setup](./admin-setup.md) — 셋업 가이드
- [wiki/log.md](../wiki/log.md) — 시간순 활동 로그
