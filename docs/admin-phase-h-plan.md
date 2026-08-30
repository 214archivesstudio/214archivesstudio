# 관리자 페이지 — Phase H 작업 계획 (평가 후속 개선)

> **상태**: ✅ ship 완료 (2026-08-30) — Step 0 · H1 · H2 · H3 · H4 · H6. H4 라이브 검증과 H3-1 실업로드 확인은 **push 후** 운영자 절차(§H4, §3). H5 는 미착수(여유 시).
> **입력**: 2026-08-30 어드민 사용성·기능 평가 — Playwright 실주행 14개 흐름 + 코드 정적 리뷰(critic) 교차 검증. 판정 REVISE. 보고서: [어드민 사용성·기능 평가](https://claude.ai/code/artifact/c0a3e239-fc09-4c8b-a1af-7f9e0a582a89) (비공개 아티팩트).
> **범위**: 평가에서 나온 High 6 · Med 14 · Low 3 중 **개인 포트폴리오 운영(admin 1인)** 에 실제로 영향 있는 것. 팀 화면 제거 포함.
> **참고**: [admin-improvement-roadmap](./admin-improvement-roadmap.md) (G1–G4 완료) · [admin-overview](./admin-overview.md) · [ADR-0001](../wiki/decisions/0001-admin-architecture.md)

---

## 0. 배경

G1–G4 로드맵을 마친 직후 어드민을 처음으로 **로그인해서 끝까지 조작**해 봤다. 결과: 기능은 전부 실제로 동작하고 오동작은 0건이었지만, 세 갈래의 문제가 확인됐다.

1. **피드백 공백** — 저장 성공 표시 없음, 검증 에러가 고쳐도 안 사라짐, 에러 화면 없음, alt 저장 확인 없음. 운영자가 "지금 됐나?"를 판단할 수단이 반복해서 빠져 있다.
2. **정합성** — 다중 이미지 업로드 순서 경쟁 상태, 프로덕션 시각 UTC 표시, 검색어 쉼표 크래시, 어드민 밖 publish가 대시보드를 거짓말하게 함.
3. **반응형** — 목록만 모바일 대응됐고 공통 헤더·본문 패딩·편집 화면·팀 화면은 375px에서 가로 오버플로.

여기에 사용자 결정 하나가 더해졌다: **이 사이트는 개인용 포트폴리오라 팀 화면이 필요 없다.**

---

## 1. 결정 기록

| # | 분기 | 결정 | 사유 |
|---|---|---|---|
| 1 | 팀 화면 | **제거** — `app/admin/team/` 라우트, 헤더 nav "Team", `lib/repos/user-roles.ts` 삭제 | 개인 포트폴리오, admin 1인. UUID·가짜 "오프라인"·과장된 역할 설명 등 Med 3건이 화면과 함께 사라짐 |
| 2 | `user_roles` 테이블·RLS·editor 역할 | **유지** (스키마 무변경) | 인증 모델의 근간. 제거 시 마이그레이션·정책 재작성이 필요한데 얻는 게 없음. editor 는 "존재하지만 쓰지 않는" 상태로 둠 |
| 3 | editor 관련 findings (권한 UI ≠ RLS, editor 타임아웃 미전환, 권한 부족 시 충돌 메시지) | **보류** — 플랜에서 제외, §6 에 기록 | editor 0명. 두 번째 운영자가 생기면 그때 한 ship 으로 |
| 4 | Ship 단위 | **4개 ship** (H1 피드백·안전망 → H2 셸·팀 제거 → H3 정합성 → H4 게시 파이프라인) + H5 부채는 여유 시 | 각 ship 이 독립 커밋·독립 검증. H1–H3 은 파일이 서로소라 순서 바꿔도 됨. H4 는 워크플로 파일이라 단독 |
| 5 | 에러 화면 | `app/admin/error.tsx` + `not-found.tsx` 신설, 로그인 페이지는 제외 | 로그인은 셸이 없어 별도 |
| 6 | 시각 표시 | 서버 컴포넌트에 `timeZone: "Asia/Seoul"` 명시 (클라이언트 이관 안 함) | 한 줄 수정 × 3곳. 운영자 1인·한국 고정이라 TZ 하드코딩이 정확 |
| 7 | 다중 업로드 순번 | **클라이언트가 순번을 부여** — 위젯 `onSuccess` 호출 순서대로 `index` 를 넘기고 서버는 `max + 1 + index` | RPC 없이 해결. 서버 max 조회를 1회로 줄이는 건 H5 |
| 8 | 검색어 | 살균 (`, ( ) . * \ % _` 제거) + 탭 카운트는 검색 중 숨김 | `textSearch` 전환은 인덱스 필요, 30건 규모에 과잉 |
| 9 | 목록 기본 정렬 | **`updated_at DESC`** 로 변경, 섹션 필터 시에도 동일 | "방금 만든 게 어디 갔지" 해소. 공개 사이트 정렬은 `data/*.ts` 기준이라 무관 |
| 10 | 수동 publish | 워크플로가 `job_id` 없이 실행되면 **스스로 `publish_jobs` 행을 insert** (`triggered_by` null, message "수동 실행") | drift 가 publish_jobs 기준인 구조를 유지하면서 구멍만 막음 |
| 11 | drift 기준 시각 | `completed_at` → **job `created_at`** (≒ sync 시각) | 게시 도중 저장한 변경이 누락되는 창 제거. 코드 한 줄 |

---

## 2. 작업 단계

### Step 0 — 미확정 항목 실행 검증 (~20분)

플랜 확정 전에 정적 리뷰가 확정하지 못한 1건을 재현한다. **재현되면 H1 에 High 로 편입**.

1. `npm run dev` → 아무 게시물 편집 → 제목 수정 → 저장 → 새로고침 없이 다시 제목 수정 → 저장
2. 두 번째 저장이 "다른 사용자가 이 게시물을 수정했거나 삭제했습니다" 로 실패하면 `post-form.tsx:47` 의 `updatePost.bind(null, initial.id, initial.updated_at)` 가 revalidate 후 갱신되지 않는 것 — `useActionState` 를 `initial.updated_at` 을 key 로 리마운트하거나 hidden input 으로 `updated_at` 을 넘기도록 수정

**verify**: 연속 2회 저장 성공.

> ✅ 2026-08-30 실행: 임시 게시물에서 v1→v2→v3 연속 저장 성공, 충돌 에러 없음. `useActionState` 가 리렌더마다 바인딩된 action 을 갱신하므로 정상. **H1 편입 없음.**

### Step H1 — 피드백·안전망 (~2시간) 🔴

| # | 작업 | 대상 파일 | 비고 |
|---|---|---|---|
| H1-1 | 저장 성공 토스트 | `post-form.tsx` | `useEffect` 로 `state?.ok` 감지 → `toast.success("저장했어요")`. 생성은 리다이렉트되므로 편집만 해당 |
| H1-2 | 검증 에러 clear-on-edit | `post-form.tsx`, `section-fields.tsx` | 서버 `fieldErrors` 를 로컬 state 로 복사, 해당 필드 `onChange` 시 키 삭제 |
| H1-3 | 제출 실패 시 첫 에러 필드로 스크롤 + 상단 요약 | `post-form.tsx` | `state` 변경 effect 에서 `[aria-invalid=true]` 첫 요소 `scrollIntoView`. 상단에 "입력 N곳을 확인하세요" |
| H1-4 | 폼 에러 ↔ 입력 aria 연결 | `ui/Field.tsx`, `ui/Input.tsx`, `ui/Textarea.tsx` | Field 가 error `id` 부여, `invalid` 시 `aria-invalid` + `aria-describedby`. 색약·스크린리더 대응 |
| H1-5 | 에러 화면 | `app/admin/error.tsx`, `app/admin/not-found.tsx` 신규 | 한국어 안내 + "다시 시도" / "포스트 목록으로". 어드민 셸 안에서 렌더 |
| H1-6 | 다이얼로그 초기 포커스·포커스 트랩·스크롤 잠금 | `delete-dialog.tsx` | 마운트 시 취소 버튼 focus, Tab 순환, `body overflow:hidden` |
| H1-7 | alt 저장 성공 표시 | `media/MediaCard.tsx` | 저장 후 1.5초 "저장됨" 텍스트 |
| H1-8 | 실패한 게시 메시지 사람 문장 매핑 | `_actions/publish.ts`, `jobs-card.tsx` | 401/403 → "GitHub 토큰이 만료됐거나 권한이 없습니다", 404 → "저장소 설정 확인". 원문은 `title` 툴팁 |

**verify (브라우저)**: 편집 저장 → 토스트. 빈 제목 제출 → 상단 요약 + 스크롤 + 입력하면 에러 즉시 소멸. `/admin/posts/없는-id` → not-found 화면에서 목록 복귀. 삭제 다이얼로그 열면 포커스가 취소 버튼, Tab 이 밖으로 안 나감.

> ✅ 2026-08-30 ship. Playwright 실주행 결과: 저장 토스트 "저장했어요" 표시 · 빈 제목 제출 시 "입력 1곳을 확인해 주세요" + scrollY 850→113 + 제목 필드 포커스 + `aria-invalid="true"` / `aria-describedby`→에러 문구 · 제목 입력 즉시 에러·요약 소멸 · 다이얼로그 초기 포커스 "취소", Tab 2회에 순환, Escape 후 포커스가 "삭제…" 버튼으로 복원 + `body overflow` 해제 · 존재하지 않는 id → 404 화면(셸 안, 목록/대시보드 링크). H1-7(alt 저장됨)·H1-8(실패 문구)은 이미지 업로드·GitHub 실패를 재현하지 않아 코드 검증만.
>
> 구현 메모: clear-on-edit 는 서버 `fieldErrors` 를 로컬로 복사하지 않고 `{token: state, keys}` 로 "이 제출 결과에서 지운 키" 만 기억해 파생 — effect 내 setState 없이 `react-hooks/set-state-in-effect` 통과. `Field` 는 `useId` 로 에러 id 를 만들고 단일 자식일 때만 `cloneElement` 로 `aria-describedby` 주입(업로더처럼 복합 자식은 스킵). 실패 문구는 `publish_jobs.message` 에 사람 문장, `error` 에 원문을 두고 활동 표에서 `title` 툴팁으로 노출.

### Step H2 — 셸 반응형 + 팀 화면 제거 (~1.5시간) 🔴

| # | 작업 | 대상 파일 | 비고 |
|---|---|---|---|
| H2-1 | 팀 화면 제거 | `app/admin/team/` 삭제, `lib/repos/user-roles.ts` 삭제, `AdminHeader.tsx` items 에서 Team + `showTeam` prop 제거, `layout.tsx` 호출부 | 결정 #1. 서버 액션·RLS 무변경 |
| H2-2 | 본문·헤더 패딩 반응형 | `layout.tsx:48`, `AdminHeader.tsx:36` | `px-4 md:px-12` |
| H2-3 | 헤더 우측 슬롯 접기 | `layout.tsx`, `AdminHeader.tsx`, `ui/UserPill.tsx` | 모바일: 이메일 숨김(`hidden md:inline`), "사이트 보기" 숨김, DriftBadge·Logout 만. nav 는 `flex-wrap gap-4 md:gap-7` |
| H2-4 | 편집 화면 모바일 순서 | `posts/[id]/page.tsx:71–95` | `aside` 에 `order-first lg:order-none` — 공개 상태·미디어가 위험 영역보다 먼저 |
| H2-5 | `실행 로그 ↗` 줄바꿈 | `jobs-card.tsx:90` | `whitespace-nowrap` |
| H2-6 | 대시보드 통계 카드 모바일 | `app/admin/page.tsx` | 4열 → `grid-cols-2 md:grid-cols-4` (평가에서 미확인 — 구현 시 375px 확인) |

**verify**: 375px 에서 `document.documentElement.scrollWidth === clientWidth` (대시보드·목록·편집·새 포스트 4화면). `/admin/team` → 404(not-found 화면). 헤더에 Team 없음.

> ✅ 2026-08-30 ship. 375px 실측: 대시보드·목록·새 포스트·편집 4화면 모두 `scrollWidth 371 = clientWidth 371`. 편집 화면 세로 순서 공개 상태(y 275) → 미디어(444) → 위험 영역(1929). `/admin/team` → "찾을 수 없는 페이지입니다"(셸 안). 데스크톱 nav `Dashboard · Posts`, "사이트 보기" 데스크톱만 표시, 실행 로그 링크 1줄(15px).
>
> 구현 중 추가된 것 2건: ① 헤더 수정 후에도 대시보드가 575px 로 넘쳐 원인 추적 → **최근 활동 `<table>`** 이었음. `overflow-x-auto` 래퍼 + 셀 패딩 `px-4 md:px-6` + 메시지 열 `min-w-[200px]` 로 표 내부 스크롤. ② `not-found.tsx` 는 세그먼트 안의 `notFound()` 호출에만 적용돼 `/admin/team` 이 Next 기본 404 로 떨어짐 → `app/admin/[...missing]/page.tsx` catch-all 이 `notFound()` 호출. H2-6(통계 카드)은 이미 `grid-cols-2 md:grid-cols-4` 라 무변경. 모바일 로고는 "214" 로 축약. 팀 삭제 후 stale `.next/types` 가 tsc 를 깨뜨림 → `next build` 로 재생성(운영 메모: 라우트 삭제 후엔 빌드 먼저).

### Step H3 — 정합성 (~2.5시간) 🔴

| # | 작업 | 대상 파일 | 비고 |
|---|---|---|---|
| H3-1 | 다중 업로드 순번 | `media/AddImageButton.tsx`, `media/MediaManager.tsx`, `_actions/media.ts` (`addImageMedia`) | 결정 #7. 위젯 성공 콜백 카운터로 `index` 전달, 서버 `nextOrder = max + 1 + index`. `findPostMedia` 정렬에 `created_at` 2차 키 |
| H3-2 | 시각 timeZone | `jobs-card.tsx:18–29`, `posts/[id]/page.tsx:53–55` | 결정 #6. `isToday` 도 KST 기준으로. (팀 페이지는 H2 에서 삭제) |
| H3-3 | 시각 포맷 한국어 | `jobs-card.tsx:24` | "PM 05:53" → `hour12: true` + 한국어 로케일 결과 "오후 5:53" 확인 |
| H3-4 | 검색어 살균 + 탭 카운트 | `lib/repos/posts.ts:43`, `posts/page.tsx`, `section-tabs.tsx` | 결정 #8. 검색 중엔 탭 배지 숨김 + "검색 지우기" 링크 |
| H3-5 | 목록 기본 정렬 최신순 | `lib/repos/posts.ts:28–30` | 결정 #9 |
| H3-6 | 드리프트 목록 "외 N건" | `publish-panel.tsx`, `app/admin/page.tsx:34` | `drift - driftItems.length > 0` 이면 한 줄 + 목록 링크 |
| H3-7 | 용어 잔여 통일 | `app/admin/page.tsx:52` ("공개됨"→"공개"), `posts/page.tsx:66` ("게시"→"공개"), `MediaManager.tsx:129` ("+ 비디오"→"+ 영상") | G2-3 누락분 |
| H3-8 | `?created=1` 배너 1회성 | `posts/[id]/page.tsx:65` | 클라이언트에서 마운트 후 `router.replace` 로 쿼리 제거, 또는 토스트로 대체 |

**verify**: 이미지 5장 동시 업로드 → 그리드 순서 = 선택 순서 (3회 반복). 검색 `TOKYO, 2025` → 에러 없이 0건. 새 포스트 생성 후 목록 1페이지 최상단. 프로덕션 배포 후 최근 활동 시각이 KST.

> ✅ 2026-08-30 ship. 실주행: 검색 `TOKYO, 2025` → 크래시 없이 0건 + 탭 카운트 숨김 + "검색 지우기 ×", `tokyo` → 1건. 새 포스트가 목록 최상단. 대시보드 시각 "오후 5:53" / "6월 16일 오후 10:03". 통계 카드 "공개", 부제 "표시 중 공개", "+ 영상". created 토스트 1회 + URL 쿼리 즉시 제거. **미검증**: H3-1 다중 업로드 순서 — 실제 Cloudinary 업로드가 필요해 코드 검증만 (운영자 확인 항목: 이미지 5장 동시 업로드 → 순서 보존).
>
> 구현 메모: ① 시각은 `toLocale*` 의 `hour12` 가 이 Node ICU 에서 "PM" 으로 나와 `formatToParts(hourCycle h23)` 로 직접 "오전/오후" 조립 — 환경 무관하게 결정적. ② created 배너 → 토스트 전환 시 두 가지를 겪음: 서버 액션 redirect 직후 `router.replace` 가 무시돼 `history.replaceState` 로 교체(Next 가 라우터 상태와 동기화), 하드 로드에서는 자식 effect 가 layout `<Toaster>` 구독보다 먼저 돌아 토스트가 유실 → `setTimeout 0` 으로 미룸 + `id` 로 StrictMode 중복 제거. ③ 업로드 순번: 위젯 `open()` 시 카운터 0, `onSuccess` 마다 `index++`, 서버 `max + 1 + index`; 로컬 목록은 응답 순서가 달라도 `display_order` 로 정렬. `findPostMedia` 는 `created_at` 2차 정렬.

### Step H4 — 게시 파이프라인 (~1.5시간) 🟡

| # | 작업 | 대상 파일 | 비고 |
|---|---|---|---|
| H4-1 | 수동 실행 시 `publish_jobs` 행 생성 | `.github/workflows/publish.yml` | 결정 #10. `JOB_ID` 비어 있으면 sync 전에 REST insert 로 행 생성 후 `JOB_ID` 에 채움 → 이후 단계 그대로 동작 |
| H4-2 | 게시 완료 문구 | `publish.yml:74–96`, `admin-guide.md` | "사이트에 반영됨" → "빌드 시작됨 · 1~3분 후 사이트 반영" |
| H4-3 | drift 기준 시각 | `lib/repos/publish-jobs.ts` (`getLastSuccessAt`) | 결정 #11. `completed_at` → `created_at` (status success 조건 유지) |
| H4-4 | `completed_at` null 방어 | 동일 | `.not("completed_at", "is", null)` |
| H4-5 | `markJobTimedOut` 호출 try/catch | `publish-panel.tsx:71` | 서버 실패와 무관하게 UI 전환 보장 (G2-1 주석이 약속한 동작) |
| H4-6 | 보상 UPDATE 실패 로깅 | `_actions/publish.ts:67–80` | 실패 시 반환 메시지에 "10분 뒤 자동 해제" |

**verify**: `gh workflow run publish.yml` (job_id 없이) → publish_jobs 에 행 생성 + 대시보드 "마지막 게시 방금". 어드민 버튼 publish → 최근 활동 문구 확인.

> ✅ 2026-08-30 코드 완료. **라이브 검증 보류** — `workflow_dispatch` 는 origin 의 워크플로 파일을 실행하므로 push 전에는 새 워크플로를 돌릴 수 없다. 대신 "Resolve job id" 단계의 셸 스니펫을 로컬 env 로 그대로 실행해 검증: REST insert → `{"status":"pending","message":"수동 실행 (GitHub Actions)","triggered_by":null}` 행 생성, `jq` 로 id 파싱 성공, 테스트 행 삭제(204). YAML 은 js-yaml 파싱 통과. `tsc`·`eslint`·`next build` 통과.
>
> **push 후 확인 절차**: ① `gh workflow run publish.yml` (입력 없이) → 완료 후 대시보드 최근 활동에 "완료 · 변경 사항 없음 … · 수동 실행" 행 + "마지막 게시 방금" ② 어드민 "변경사항 게시" → 활동 표 문구 "빌드 시작됨 · 1~3분 후 사이트 반영"(변경 있을 때).
>
> 구현 메모: `JOB_ID` 를 job-level `env:` 에서 빼고 첫 단계 "Resolve job id" 가 `GITHUB_ENV` 로 확정 — job-level env 와 `GITHUB_ENV` 의 우선순위 모호성을 피하고 이후 단계(`Mark job running`/`Mark job result`)는 무변경. 행 생성 실패는 `::warning::` 만 내고 게시는 계속(비차단). drift 기준은 `getLastSuccessAt` 이 `created_at` 을 반환하도록 바꿔 호출부(`getDriftCount`/`listDriftPosts`/`DriftBadge`/`publish-panel`) 무변경. `completed_at IS NOT NULL` 가드 포함.

### Step H5 — 잠재 부채 (여유 시, ~3시간) ⚪

| # | 작업 | 대상 파일 |
|---|---|---|
| H5-1 | Cloudinary env 가드 — hidden input 항상 렌더, `CLOUD_NAME` 누락 시 에러 표시, 3개 env 부팅 검증 | `video-thumbnail-uploader.tsx`, `thumbnail-uploader.tsx`, `lib/env.ts` 신규 |
| H5-2 | sync 쿼리 `.range()` 페이지네이션 | `scripts/sync-from-supabase.ts:34–48` |
| H5-3 | `x-pathname` — 미들웨어에서 설정 (또는 로그인 라우트 그룹 분리) | `middleware.ts`, `layout.tsx:12` |
| H5-4 | 스키마·저장 로직 일치 — showreel/film/personal 에서 city·year_label·client 제거 | `post-schema.ts:66–88` |
| H5-5 | `reorderMedia` 단일 upsert | `_actions/media.ts:221–231` |
| H5-6 | MediaManager 서버 상태 재동기화 | `MediaManager.tsx:26` |
| H5-7 | 죽은 코드·중복 — `ui/index.ts`·`SaveBar`·`Select` 삭제, 섹션 라벨 맵 `lib/sections.ts` 단일화 | 6곳 |
| H5-8 | `video_thumbnail_url` URL 검증 | `post-schema.ts:46` |
| H5-9 | 미디어 그리드 `TouchSensor` 추가 (실기기 스크롤 확인 후) | `media/MediaGrid.tsx:34` |

### Step H6 — 문서·wiki 마감 (~30분)

- [x] [admin-overview](./admin-overview.md): §7 코드 트리 실제 구조로 재작성, §11 알려진 이슈 H1–H4 해소 표시 + 보류/H5 항목, §12 다음 작업 (2026-08-30)
- [x] [admin-guide](./admin-guide.md): 게시 완료 문구(H4), 목록 정렬 설명(H3), 막힘 표 — 각 ship 에서 반영
- [x] [ADR-0001](../wiki/decisions/0001-admin-architecture.md): 2026-08-30 amendment "팀 화면 폐기" (H2) + `wiki/index.md` amended 날짜
- [x] 본 문서 상태 갱신 + `wiki/log.md` ship 항목

**테스트 흔적 원상복구 (2026-08-30 확인)**: 임시 QA 계정 0 (`auth.users` 2 = 원본), `user_roles` 2 (원본), `qa-temp*` 게시물 0, 고아 `post_media` 0, 게시물 총 32 (시작 시점과 동일), Cloudinary 업로드 없음. 오늘 `publish_jobs` 는 평가 중 버튼으로 실행한 정상 publish 1건만(수동 스니펫 테스트 행은 삭제). 로컬: 임시 스크립트·PNG 없음, dev 서버 종료, `.playwright-mcp/` 오늘 로그 삭제(gitignored), 저장소 미커밋은 세션 이전부터 있던 파일뿐.

---

## 3. 검증 게이트 종합 (ship 조건)

- [ ] `tsc --noEmit` · `eslint app/admin lib` · `next build` 통과 (각 ship 마다)
- [ ] 375px 4화면 가로 스크롤 0
- [ ] 편집 저장 → 토스트 / 연속 2회 저장 성공 / 에러 필드 clear-on-edit
- [ ] 이미지 5장 동시 업로드 순서 보존 3회
- [ ] 검색어 쉼표 무크래시
- [ ] 수동 publish 후 대시보드 drift 0
- [ ] `/admin/team` 404 + 헤더 Team 없음
- [ ] 프로덕션 시각 KST

---

## 4. 일정 추정

| Ship | 추정 | 비고 |
|---|---|---|
| Step 0 | 20분 | 플랜 확정 전 |
| H1 | 2h | |
| H2 | 1.5h | |
| H3 | 2.5h | |
| H4 | 1.5h | 워크플로 변경은 실제 run 으로만 검증 가능 |
| H6 | 30분 | |
| **합계 (H5 제외)** | **~8h** | 1–2 세션 |
| H5 | 3h | 별도 |

---

## 5. 리스크

| 리스크 | 완화 |
|---|---|
| H1-2/H1-3 이 `useActionState` 흐름과 얽혀 폼이 복잡해짐 | 에러 로컬 state 는 `fieldErrors` 의 얕은 복사 하나로 한정. 200줄 넘기면 `use-form-errors.ts` 훅으로 분리 |
| H3-1 순번 부여가 위젯 콜백 순서에 의존 — Cloudinary 가 완료 순서대로 호출하므로 파일 선택 순서와 다를 수 있음 | "선택 순서" 가 아니라 "업로드 완료 순서" 로 결정적이면 충분. 사용자는 드래그로 재정렬 가능 |
| H4-1 워크플로에서 REST insert 실패 시 게시 자체가 막힘 | insert 는 `|| true` 로 비차단. 실패하면 기존 동작(행 없음)으로 폴백 |
| H3-5 정렬 변경으로 운영자가 익숙한 섹션 묶음이 사라짐 | 섹션 탭이 있으므로 묶음은 탭으로. 필요하면 정렬 토글은 후속 |
| 팀 화면 제거 후 "누가 admin 인지" 확인 경로가 사라짐 | 1인 운영이라 불필요. 필요 시 Supabase Studio |

---

## 6. 명시적 비포함 (scope out)

- **editor 관련 3건** (권한 UI ≠ RLS, editor 타임아웃 미전환, 권한 부족 시 "충돌" 메시지) — 결정 #3. editor 가 생기면 한 ship 으로
- **어드민 내 이동 시 미저장 경고** (클라이언트 라우팅 가드) — Next 16 에 표준 API 가 없어 링크를 전부 버튼화해야 함. 1인 운영에서 비용 대비 낮음. `beforeunload` 는 유지
- **Vercel 배포 완료 폴링** — Deploy Hook 연동 필요. H4-2 문구 수정으로 기대치만 맞춤
- **Vimeo 썸네일** — G3 결정 유지
- **공개 사이트 lint 3건** — 어드민 범위 밖, 별도 작업
