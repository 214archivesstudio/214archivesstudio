# Log

> 시간순 활동 기록. 각 항목은 `## [YYYY-MM-DD] {action} | {target}` 헤더로 시작합니다.
> 최근 5개를 빠르게 보려면: `grep "^## \[" wiki/log.md | tail -5`

---

## [2026-08-31] feat | 새 포스트 생성 폼에 갤러리(스테이징) 추가

기존에는 갤러리를 생성 후 편집 화면에서만 넣을 수 있었음. 생성 폼에 갤러리 블록 추가(`StagedMediaManager`, showreel 제외·영상은 personal 만): 업로드는 즉시 Cloudinary, 항목은 hidden input(JSON `staged_media`)으로 폼과 함께 제출 → `createPost` 가 post_media 를 배열 순서 = display_order 로 일괄 insert, 실패 시 게시물 롤백. `MediaGrid`·`MediaCard`·`AddImageButton`·`AddVideoModal`·`DeleteDialog` 재사용(순수 UI라 로컬 상태로도 동작); 모달은 폼 중첩(nested form) 회피를 위해 `createPortal`, 갤러리 내 input 의 Enter 는 폼 제출 가드. 생성 토스트는 갤러리 동반 시 "갤러리 N개도 함께 저장됐어요". 라이브 검증: 실제 2장 업로드(선택 순서 보존) + 영상 1개 + alt 입력 → 생성 → DB display_order 0·1·2 & alt 확인, 임시 게시물·Cloudinary 자산·계정 정리. 매뉴얼은 원고만 갱신(0-create·1-gallery·archives), 스크린샷은 사용자 요청으로 미변경 — 생성 폼 컷(9~13·24)에 갤러리 블록이 없는 상태로 남음. 커밋 `7262b0b`·`32e3ace`.

## [2026-08-31] feat | 게시물 폼 "표시 순서" 필드 제거 (죽은 필드 정리)

검토 결과 posts.display_order 는 소비처가 없는 죽은 필드였음: 공개 사이트는 sync 의 date desc·slug asc 정렬, 어드민 목록은 updated_at desc, 갤러리 순서는 post_media.display_order(드래그)가 담당. 초기 seed 가 값을 채웠지만 sync 가 날짜 정렬을 채택하며 무의미해진 이력. 조치: 폼에서 정렬/표시 순서 블록 제거, 날짜 필드에 "공개 사이트는 날짜 최신순 정렬" 힌트 추가. DB 컬럼·zod default(0)는 유지(스키마 변경 없음) — 저장 시 0으로 수렴하나 읽는 곳이 없어 무해. 매뉴얼 동기화: 0-create 원고에서 표시 순서 단계 삭제, 해당 블록이 찍힌 스크린샷 8컷(9~13·15·23·24) 재촬영. 재촬영 추가 팁: sonner 토스트 고정용 클론 후 원본 toaster 를 제거하면 이후 토스트가 렌더될 호스트가 사라짐 — 다음 토스트 전에 페이지 새로고침 필요; admin 편집 화면은 window.scrollTo 가 아닌 document.scrollingElement.scrollTop 으로 스크롤. 관련: [[codebase/conventions]], [[codebase/admin-manual]].

## [2026-08-31] feat | 어드민 슬러그 → "URL 주소" 워딩 변경 + 날짜 기반 기본값 자동 채움

사용자 질문("슬러그가 어디에 반영되나")에서 출발. 확인 결과 슬러그의 유일한 공개 반영처는 상세 페이지 URL(`/{section}/{slug}`, sync 시 `id`로 매핑)이며 자동 생성 로직은 없었음(`lib/utils.ts`의 `slugify()`는 미사용 dead code — 건드리지 않음). 변경: (1) 생성 폼에서 날짜 입력 시 `yy-mm-dd` 기본값 자동 채움 — 직접 수정한 값은 덮어쓰지 않고, 수정 모드에선 비활성(`slug-input.tsx`에 `dateValue` prop, `post-form.tsx` 날짜 입력을 controlled로 전환). (2) 워딩 "슬러그" → "URL 주소" 6곳(라벨·중복 메시지·검색 placeholder·zod 메시지 2건·서버 액션 메시지), 힌트를 `공개 주소: /{section}/{값}` 실시간 미리보기로 교체. 임시 admin + Playwright로 라이브 검증(자동 채움·날짜 변경 갱신·수동값 보존·수정 모드 무변경·중복 확인 연동), tsc·lint 에러 0, 계정/스크립트 정리 완료. (3) 후속: 같은 섹션·같은 날짜 중복 시 자동 순번 — 자동값이 "이미 사용 중"으로 판정되면 기존 checkSlugAvailable 콜백 안에서 `-2`, `-3`…(상한 50)을 붙여 재검사, 수동 입력값에는 불개입. 스텁 2건(`26-08-31`, `26-08-31-2`) 넣고 `26-08-31-3` 안착 + 수동 중복 입력 시 경고만 표시됨을 라이브 확인, 스텁·계정 삭제(posts 32 복원). React Compiler 주의: 이펙트 본문에서 동기 setState는 lint 에러 — setTimeout/async 콜백 안으로 옮겨 해결. 후속으로 매뉴얼도 동기화: `manual/docs` 원고 17곳 "슬러그"→"URL 주소"(0-create는 자동 채움·자동 순번 동작 설명 반영), 옛 라벨이 보이던 스크린샷 7컷(9~13 섹션별 새 포스트 폼, 15 편집 화면, 24 검증 에러) 로컬 dev + guide 임시 admin으로 재촬영 후 `docs/admin-manual.html` 재번들(1.99 MB 유지). 재촬영 팁: Playwright 스크린샷은 webp 직접 저장 가능하나 용량이 커서 `dwebp`→`cwebp -q 82` 재압축 필요; dev 모드 `nextjs-portal`(Next 배지) 제거 후 촬영; 생성 토스트는 sessionStorage `admin:post-created:<id>` 1회 가드 — 키 삭제 후 reload로 재현, fullPage 캡처 타이밍에 사라지므로 toaster DOM을 클론해 고정 후 촬영. 관련: [[codebase/conventions]], [[codebase/admin-manual]].

## [2026-08-31] ship | 어드민 사용자 매뉴얼(VitePress → 단일 HTML) P1–P5 완료

`docs/admin-manual-implementation-plan.md`를 서브에이전트 implement+review 페어로 5단계 실행. P1 스캐폴드(VitePress 1.6.3, `manual/docs/.vitepress/{config.mts,sidebar.mjs,theme/}`, 사이드바 17항목) → P2 원고(17페이지, `admin-guide.md` 문장 불변으로 카테고리별 재배치, 2세션 병렬 작성) → P3 스크린샷(Playwright MCP로 27컷 촬영, 프로덕션 임시 admin 계정 사용 후 삭제, meme-video 컷 재촬영 1건) → P4 번들 스크립트(`manual/scripts/bundle-single-file.mjs`, cheerio 기반 — section.page 라우트별 1개·`#page-<slug>` 앵커·전 자산 data URI 인라인·자체 검증 5종) → P5 문서 마감(본 항목). 결과물: `docs/admin-manual.html` 17페이지·27장·1.97 MB·외부 요청 0.

주요 발견: VitePress `outDir`은 리포 루트가 아니라 **docs 루트 기준**으로 해석됨(`../dist` → `manual/dist/`); 이미지 파일이 없으면 Vite가 빌드 자체를 실패시킴(`Could not resolve`) — P2는 0바이트 플레이스홀더로 우회 후 P3가 실제 파일로 교체; `markdown-it-attrs`는 VitePress에 이미 번들되어 있어 배지 문법(`` `공개`{.normal} ``)에 별도 설치 불필요; 체크리스트 페이지의 `- [ ]`를 렌더하려 `markdown-it-task-lists` 추가; 번들 스크립트의 스크롤 스파이는 "스크롤 맨 아래" 분기 추가(마지막 섹션이 짧아 일반 스크롤 계산으로는 활성화 안 되는 경우 보정); 스크린샷 중 YouTube 미리보기 iframe이 헤드리스 Chromium에서 검게 나오는 문제 발견 → 교차 출처 iframe을 한 번 연 뒤 `scrollY 0`에서 촬영하는 방식으로 우회. 상세: [[codebase/admin-manual]].

## [2026-08-30] plan | 어드민 매뉴얼(arms-demo-manual.html 형식) 구현 플랜 작성

`docs/admin-manual-implementation-plan.md`. 핸드오프(`docs/handoff-admin-manual.md`)를 P1 스캐폴드 → P2 원고 18페이지 → P3 Playwright 스크린샷 27컷 → P4 cheerio 단일 파일 번들(`manual/scripts/bundle-single-file.mjs` → `docs/admin-manual.html`) → P5 마감의 5단계로 정리, 단계별 검증 기준·페이지별 구조/컷 매핑·번들 알고리즘 명시. 핸드오프 대비 보완: 본문 내부 링크(`/common/1-gallery`)도 `#page-` 앵커로 재작성, 사이드바를 `sidebar.mjs`로 분리해 config와 번들이 공유, `outline`/`docFooter` 끔, 데모 스파이엔 클릭 핸들러가 없음을 확인. P2·P3는 병렬 가능.

## [2026-08-30] docs | admin-guide 를 카테고리별 시나리오 가이드로 재작성

Phase H5 배포본 기준. 구조: 0 두 가지 개념(공개/초안 vs 변경사항 게시) → 1 공통 조작 A~F(생성·갤러리·수정·공개·게시·삭제) → 2 카테고리별(Showreel·Archives·Film·Photography·Personal: 필수/선택/갤러리 표 + 등록·수정·삭제) → 3 운영 시나리오 → 4 막힘 표 → 5 게시 전 체크리스트. 필수 필드·권한·미디어 규칙은 코드(section-fields, MediaManager, posts-table)로 재확인. 열람용 HTML 아티팩트도 발행.

## [2026-08-30] verify+fix | H3-1 다중 업로드 실검증 → 선택 순서 보정 추가

사용자가 Cloudinary API 키 제공 → 위젯으로 PNG 5장 3회 동시 업로드(15 자산, Admin API prefix 삭제로 잔여 0). 결과: `display_order` 고유·오름차순·새로고침 유지는 성립하나 순서가 위젯 완료 순서(매회 다름)라 선택 순서와 불일치. `onQueuesEnd`(큐 = 선택 순서) 로 배치 완료 후 `reorderMedia` 1회 호출하는 보정 추가 → 3회차 1,2,3,4,5 확인. 부수: dnd-kit `DndDescribedBy` hydration mismatch → `DndContext id={useId()}`. QA 게시물·계정 삭제(posts 32·users 2·roles 2). Playwright 팁: 위젯 iframe 은 파일 스냅샷에는 잡히고(`Browse` ref), `browser_file_upload` 는 저장소 루트 안 경로만 허용(`.playwright-mcp/` 사용).

## [2026-08-30] fix | 공개 사이트 React Compiler lint 3건 해소 — `npm run lint` 에러 0

`LoadingAnimation`: `useRef(Date.now())` → effect 내 지역 시작 시각, `progressRef` 렌더 쓰기 → effect, `fadingOut` state+effect → `isLoaded && animationDone` 파생. `VideoPreloadContext`: entries `useMemo`, `isLoaded = finished || entries.length === 0` 파생(effect 내 setState 제거). `useVideoAutoplay`: `enabledRef` 동기화 effect, `currentSrc`/`isPlaying` 을 `fellBack`·`playing` state 에서 파생(src 동기화 effect·pause 시 setState 제거). 동작 검증: `/film` 오버레이 종료·스크롤 복원·blob 8/8·autoplay·콘솔 에러 0. 남은 경고 3건은 `<img>`(의도).

## [2026-08-30] ship | Phase H5 — 잠재 부채 9건 (RPC 정렬·sync 페이지네이션·env 가드 등)

migration 00004 `reorder_post_media` (SECURITY INVOKER) 프로덕션 적용 + 타입 재생성, `reorderMedia` 단일 RPC. sync `.range()` 페이지네이션(diff 0 확인). 두 업로더 env 누락 시 hidden input 유지 + `lib/env.ts` 배너. 미들웨어 요청 헤더 `x-pathname`(로그인 페이지 셸 이중 렌더 해소). 스키마에서 showreel/film/personal 의 city·year_label·client 제거, `video_thumbnail_url` https .mp4 검증. `lib/sections.ts` 단일 출처 + `ui/index.ts`·SaveBar·Select·tokens 삭제. MediaManager 서버 파생 key 재동기화. MouseSensor+TouchSensor. 부수: created 토스트를 sessionStorage 1회 가드로(라우터가 `?created=1` 복원하던 문제). 실주행: x-pathname·키보드 정렬 RPC·새로고침 유지 확인. 임시 계정·게시물 삭제.

## [2026-08-30] deploy | push → Vercel 배포 → H4 라이브 검증 완료

로컬 10 커밋 push(`64e6799..ba22acb`). Vercel Production 배포 success(GitHub Deployments 6165656722). 프로덕션에 임시 admin 으로 로그인해 확인: Team 제거·어드민 404·KST 시각("오후 5:53", UTC 호스트에서도 정확)·375px 오버플로 0. `gh workflow run publish.yml` 수동 실행 → 워크플로가 스스로 `publish_jobs` 행 생성("· 수동 실행", triggered_by null) → 대시보드 "마지막 게시 방금". 임시 계정 삭제(auth 2·user_roles 2 원본). 검증 중 프로덕션 대시보드 콘솔에 React #418(하이드레이션 텍스트 불일치) 1건 → `publish-panel` 상대 시각 span 에 `suppressHydrationWarning` (서버·클라이언트 시계 차로 "방금"/"1분 전" 갈림). 잔여: H3-1 실업로드 순서 확인, H5, 공개 사이트 lint 3건.

## [2026-08-30] docs | Phase H6 마감 + 테스트 흔적 원상복구 확인

admin-overview §7 코드 트리를 실제 구조로 재작성(존재하지 않던 `[id]/media/page.tsx` 등 정리, `error.tsx`·`not-found.tsx`·`[...missing]`·`created-toast`·`slug-input`·`lib/video.ts`·`repos/publish-jobs.ts` 반영), §11 H1–H4 해소 + 보류(editor)/H5 항목, §12 다음 작업(push→라이브 검증). wiki/index ADR amended 날짜. Phase H plan 상태 ✅. 원상복구 감사: QA 계정 0·user_roles 2·qa 게시물 0·고아 미디어 0·게시물 32(원본), 로컬 임시 파일 0. **다음**: push → Vercel 배포 → H4 라이브 검증 → 이미지 동시 업로드 확인.

## [2026-08-30] ship | Phase H4 — 게시 파이프라인 (코드 완료, 라이브 검증은 push 후)

publish.yml: `JOB_ID` 를 첫 단계 "Resolve job id" 에서 `GITHUB_ENV` 로 확정, 수동 실행이면 REST insert 로 `publish_jobs` 행 생성(비차단), 결과 문구 "빌드 시작됨 · 1~3분 후 사이트 반영"(+ "· 수동 실행"). `getLastSuccessAt` 이 `created_at` 반환(sync 시각 이전 기준) + `completed_at IS NOT NULL`. 패널 `markJobTimedOut` try/catch, 보상 UPDATE 실패 시 로깅 + "10분 뒤 자동 해제" 안내. 검증: 스니펫 로컬 실행(행 생성·파싱·삭제), js-yaml, tsc·eslint·build. **주의**: 워크플로는 origin 파일로 실행되므로 `gh workflow run` 검증은 push 후. 남은 것: H5(여유 시), H6 문서 마감.

## [2026-08-30] ship | Phase H3 — 정합성 (업로드 순번·KST 시각·검색 살균·최신순)

다중 업로드 순번(위젯 세션 카운터 → 서버 `max+1+index`, 로컬 `display_order` 정렬, `created_at` 2차 키), 서버 컴포넌트 시각 KST + "오전/오후" 직접 조립(ICU 의존 제거), 검색어 PostgREST 메타문자 살균 + 검색 중 탭 카운트 숨김 + 검색 지우기, 목록 기본 정렬 `updated_at DESC`, drift "외 N건", 용어 3곳, created 배너 → 1회성 토스트(`history.replaceState` + `setTimeout 0`). 실주행 검증 완료(업로드 순서는 코드 검증만). 다음: H4 (게시 파이프라인).

## [2026-08-30] ship | Phase H2 — 셸 반응형 + 팀 화면 제거

`/admin/team`·`lib/repos/user-roles.ts`·nav Team 삭제 (ADR-0001 amendment: Phase 3d 폐기, `user_roles`/RLS 유지). 헤더·본문 `px-4 md:px-12`, 모바일 로고 "214", "사이트 보기" 데스크톱만, 편집 화면 `aside order-first`, 실행 로그 nowrap. 추가 발견: 대시보드 최근 활동 표가 모바일 오버플로 원인 → 표 내부 스크롤; `/admin/*` 미매칭은 `[...missing]` catch-all 로 어드민 404. 375px 4화면 오버플로 0 실측. 다음: H3 (정합성).

## [2026-08-30] ship | Phase H Step 0 + H1 — 연속 저장 검증 통과, 피드백·안전망 8건

Step 0: 편집 화면 연속 저장 v1→v2→v3 성공 — 정적 리뷰 Open Q 해소, H1 편입 없음. H1: 저장 토스트, 검증 에러 clear-on-edit(token 파생 방식), 첫 에러 스크롤+상단 요약, Field/Input/Textarea aria 연결, `app/admin/error.tsx`·`not-found.tsx`, 다이얼로그 초기 포커스·Tab 트랩·스크롤 잠금·포커스 복원, alt "저장됨", 게시 실패 사람 문장(원문은 툴팁). 검증: tsc·eslint·build + Playwright 실주행(임시 계정, 종료 후 삭제). 다음: H2 (셸 반응형 + 팀 화면 제거).

## [2026-08-30] plan | Phase H — 어드민 평가 후속 개선 계획 + 팀 화면 제거 결정

G1–G4 직후 임시 admin 계정으로 어드민 전 흐름을 Playwright 실주행(14개, 오동작 0) + critic 정적 리뷰 교차 검증. 판정 REVISE: 저장 성공 피드백 없음, 모바일 셸 오버플로(375px scrollWidth 683), 다중 업로드 순서 경쟁, 서버 컴포넌트 UTC 시각, 검색어 쉼표 크래시, 에러 화면 부재, 수동 publish 미반영(drift 거짓 8건 — 버튼으로 정상화). **결정**: 개인 포트폴리오라 팀 화면 제거(`user_roles`·RLS 는 유지), editor 관련 3건은 보류. 산출물: [docs/admin-phase-h-plan.md](../docs/admin-phase-h-plan.md) — H1 피드백·안전망 → H2 셸·팀 제거 → H3 정합성 → H4 게시 파이프라인 (+H5 부채), ~8h. Step 0 로 "편집 화면 연속 저장" 재현 검증 선행.

## [2026-08-30] ship | Phase G4 — 생성 타입 도입·lint 복구·이메일 열 제거·용어 정리 (로드맵 G1–G4 완료)

G4-1 `npm run gen:types` → `types/supabase.ts`, `types/database.ts` 는 alias 로 축소, `as never` 0건. G4-2 `lint: eslint .` (+`handoff/` ignore) — 어드민·lib·types 0건, 공개 사이트 코드 3건 잔존(React Compiler 규칙, 별도 작업). G4-3 `triggered_by_email` 열 제거. G4-4 어드민 UI 의 GitHub/Vercel/Supabase/RLS 노출 문구 정리. 검증: `tsc`·`eslint app/admin lib types`·`next build` 통과. 이로써 [admin-improvement-roadmap](../docs/admin-improvement-roadmap.md) G1–G4 전부 ship. ADR-0001 Open Q 3건 취소선 처리.

## [2026-08-30] ship | Phase G3 — 슬러그 실시간 검사·YouTube 썸네일·영상 미리보기·모바일 목록

G3-1 `checkSlugAvailable` 서버 액션 + `SlugInput`(debounce 400ms, advisory). G3-2 MediaCard YouTube 정적 썸네일 (Vimeo 는 폴백 유지). G3-3 영상 URL 입력 즉시 `VideoPlayer` 임베드 미리보기 — `parseVideoUrl` 을 `lib/video.ts` 로 분리(client-safe). G3-4 posts-table `md:contents` 반응형. 검증: `tsc`·`eslint`·`next build` 통과, 브라우저 실검증은 로그인 자격 부재로 미수행. 다음: G4 (`supabase gen types`, ESLint flat config 는 이미 `eslint.config.mjs` 존재 — 상태 재확인 필요, publish_jobs 이메일, 기술 용어 정리).

## [2026-08-30] ship | Phase G2 — publish 타임아웃·초안 전환 확인·표기 통일·StatusDot 라벨

G2-1 publish 폴링 10분 타임아웃(job `created_at` 기준) + 초과 시 `markJobTimedOut` 서버 액션으로 DB `failed` 기록 + "다시 게시" 버튼. G2-2 공개→초안 전환 확인 다이얼로그 (`DeleteDialog` 라벨/variant prop 확장). G2-3 상태 표기 "공개/초안" 통일. G2-4 `StatusDot` `label` prop + aria-label. 검증: `tsc`·`eslint app/admin`·`next build` 통과. 브라우저 실검증(다이얼로그·타임아웃)은 어드민 로그인 자격이 없어 미수행 — 운영자 확인 필요. 다음: G3 (슬러그 실시간 검사, oembed 썸네일, 모바일 테이블).

## [2026-08-30] ship | Phase G1 마감 — film 영상 썸네일 publish + 문서

G1 잔여 확인: Step 3 DB 마이그레이션은 07-10 에 이미 완료돼 있었으나(8/8 `du_10` URL), 이후 publish 가 한 번도 돌지 않아 `data/films.ts`·공개 사이트는 원본 URL 상태였음. `workflow_dispatch` 로 publish 실행 → `data/films.ts` URL 8줄 교체. 변환 URL 8개 CDN 워밍 + 실측: `/film` 프리로드 **48.7MB → 9.8MB (−80%)**.

문서: [admin-setup §7.1](../docs/admin-setup.md) 영상 preset 추가, [admin-guide](../docs/admin-guide.md) film 업로더 절차·막힘 항목, [g1-plan §4](../docs/admin-phase-g1-plan.md) 게이트 실측, roadmap G1 체크. 부수: 07-10 로그가 언급한 admin-overview 의 "video thumbnail UI 편집 불가" stale 메모는 현재 문서에 존재하지 않음 (이미 제거됨). 다음: G2 (publish 폴링 타임아웃·초안 전환 확인).

## [2026-07-10] audit | 어드민 사용성 감사 + 개선 로드맵 (Phase G1–G4)

어드민 전 화면·전 액션 사용성 감사 수행. 결과: mock/가짜 기능 없음, 게시 파이프라인 실동작 확인. 주요 발견 — ① film `video_thumbnail_url` 이 텍스트 입력만 있어 Cloudinary 콘솔 수동 업로드 필요 (최대 마찰), ② publish 폴링 무한 대기, ③ publish 토글 무확인, ④ 기술 용어 노출·한/영 혼용.

**산출물**: [docs/admin-improvement-roadmap.md](../docs/admin-improvement-roadmap.md) — Phase G1(film 영상 썸네일 업로드) → G2(신뢰성) → G3(편집 경험) → G4(기술 부채). G1∥G2 병렬 가능, G3 은 G1 뒤(같은 폼 파일), G4 는 타입 재생성 때문에 마지막 단독. 참고: [[decisions/0001-admin-architecture]].

부수 발견: admin-overview 의 "video thumbnail URL 은 UI 편집 불가" 메모는 stale — `section-fields.tsx:90-103` 에 film 전용 입력 필드 존재.

## [2026-06-16] decision | ADR-0002 Supabase keep-alive cron

무료 플랜 Supabase 프로젝트가 7일 미사용으로 일시정지됨 (resume 마감 2026-09-04). 근본 원인은 ADR-0001의 의도된 성질 — 공개 사이트가 정적(`data/*.ts`)이라 방문자 트래픽이 DB를 안 건드림. DB 접근 주체는 어드민·publish job뿐이라, 어드민 미사용 7일이면 요청 0 → 정지.

**결정**: GitHub Actions cron으로 매일 keep-alive. [[decisions/0002-supabase-keepalive]].

**구현 산출물**
- `.github/workflows/keepalive.yml` (commit `7fdf903`) — 매일 04:23 UTC `curl GET /rest/v1/posts?select=id&limit=1` (service_role). 비-200 시 `exit 1` → GitHub 실패 메일 = 무료 모니터. 주 1회 `.github/keepalive-heartbeat.txt` heartbeat 커밋(ISO 주차 기록 → `git diff --quiet`로 주당 1커밋)으로 GitHub 60일 스케줄 자동비활성 방지. `[skip ci]`.
- secret은 publish 워크플로용으로 이미 등록됨 (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) — `gh secret list`로 존재 확인.

**의사결정 사항**
1. 방식: GH Actions cron (vs UptimeRobot — 정적 사이트라 DB 치는 공개 엔드포인트 없음)
2. 빈도: 매일 (vs 원안 7일 1회 — GH 스케줄러 누락 마진 확보)
3. ping 대상: `posts?select=id&limit=1` + service_role (200 확정, 실제 Postgres 쿼리)
4. 실패 가시성: 비-200 exit 1 → GitHub 메일
5. GH 60일 자동비활성: 주 1회 heartbeat 커밋
6. 업그레이드(Pro $25/mo) 보류 — 현 규모에서 무료 유지 합리적

**사용자 사이드 (실행 순서)**
1. 대시보드에서 프로젝트 **resume** 먼저 (정지 상태엔 핑 안 닿음).
2. resume 직후 Actions → "Supabase Keep-Alive" → Run workflow로 HTTP 200 수동 검증.
3. 이후 매일 자동.

**검증**
- YAML 구조 검사 통과 (탭 없음, 키 존재).
- secret 2종 존재 확인 (`gh secret list`).
- 첫 실제 핑(활동 집계 여부)은 resume 후 사용자 manual 검증 필요.

---

## [2026-05-15] phase-3c+4 | 미디어 매니저 + Publish 빌드 트리거 한 ship

ADR-0001 의 본래 목적("작가가 직접 운영")이 실현되는 마지막 ship. Phase 3c (다중 미디어) + Phase 4 (publish trigger) 한 commit 묶음으로 통합. 계획서: [docs/admin-phase-3c-4-plan.md](../docs/admin-phase-3c-4-plan.md).

**Step 0 — Sync gate (data ↔ DB round-trip)**
- `scripts/seed-from-data.ts` (data/*.ts → DB, idempotent upsert), `scripts/sync-from-supabase.ts` (DB published=true → data/*.ts in canonical literal form)
- `supabase/migrations/00003_is_admin_service_role.sql` — `is_admin()` 가 service_role 도 admin 으로 인정. 트리거 가드가 sync/seed 의 published 토글을 차단하던 실제 schema 결함 수정 (RLS 영향 없음).
- `data/*.ts` 전면 helper-free 리터럴 canonical form 마이그레이션 (`createArchive`, `buildVideoThumbnailUrl`, `VIDEO_THUMBNAIL_VERSIONS`, `createPhotographyItem`, `createPhoto` 헬퍼 제거). `data/films.ts` 의 video thumbnail URL 이 DB `posts.video_thumbnail_url` 컬럼으로 이동.
- `data/showreels.ts` date `2026-02-23` → `2025-12-31` (year 파생과 일치).
- `data/personal.ts` PONY 의 placeholder video item 제거 (decision C).
- 검증: 두 번 연속 `npm run sync` 결과의 md5 일치로 idempotency 확인.

**Step 1 — Admin Header 오염 fix**
- `app/(public)/` route group 신설. 공개 라우트 (archives, film, personal, photography, showreel, contact, page.tsx) 전부 이동.
- `app/(public)/layout.tsx` 가 BackgroundProvider + Header + main 책임. root `app/layout.tsx` 는 html/body + 메타데이터만.
- 브라우저 검증: `/admin/login` 에 공개 Header 없음, `/`/`/archives` 는 그대로.

**Phase 3b pre-existing commit**
- 본 ship 전에 working tree 에 남아있던 미커밋 Phase 3b 작업 (게시물 create/edit 폼, 썸네일 업로더, publish 토글, zod validation) 을 별도 commit (`40313a6`) 으로 격리.

**Step 2 — Phase 3c 미디어 매니저**
- `app/admin/posts/_actions/media.ts` — `addImageMedia` (display_order = max+1), `addVideoMedia` (personal-only 서버측 section 검사 + parseVideoUrl 재사용), `updateMediaAlt`, `deleteMedia`, `reorderMedia` (parallel per-row update).
- `app/admin/posts/_components/media/` 5 컴포넌트: MediaManager (top-level), MediaGrid (DndContext + SortableContext, Pointer + KeyboardSensor), MediaCard (image: CldImage + alt onBlur 저장 / video: platform + videoId 텍스트), AddImageButton (Cloudinary widget multi-mode), AddVideoModal (URL 입력 → parseVideoUrl → action).
- `lib/repos/posts.ts`: `findPostMedia` 추가.
- `/admin/posts/[id]` 편집 페이지에 인라인 통합. showreel 섹션은 "쇼릴은 갤러리가 없습니다" 메시지만.
- 의존성: `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities`.

**Step 3 — Phase 4 publish workflow**
- `.github/workflows/publish.yml` — `repository_dispatch: [publish-content]` + `workflow_dispatch` (수동 fallback). `concurrency: { group: publish-builds, cancel-in-progress: false }` 으로 큐 락 (ADR Open Q §1 해소). checkout → npm ci → Mark running (PATCH publish_jobs) → sync → diff 검사 (빈 diff = skip) → commit + push → Mark result (PATCH publish_jobs).
- `lib/repos/publish-jobs.ts`: `getDriftCount`, `listRecentPublishJobs`, `getLastSuccessAt`, `findActiveJobId`, `getJob`.
- `app/admin/_actions/publish.ts`: `triggerPublish` (admin-only) — publish_jobs insert + GitHub dispatches API POST. 실패 시 job 을 failed 로 업데이트. `getJobStatus` 는 polling용.
- `app/admin/_components/publish-panel.tsx`: drift 지표 + "사이트에 반영" 버튼 (admin only) + 최근 10건 jobs 테이블 + 5초 polling (active job 있을 때만).
- 어드민 대시보드에 패널 통합.
- `docs/admin-setup.md` §8: fine-grained PAT 발급 + GH Action secrets 설정 + 검증 흐름. 트러블슈팅 항목 추가.

**Step 4 — Docs (이 commit)**
- ADR-0001 amendments 섹션에 2026-05-15 추가 (publish 의미론 분리 + repository_dispatch + preview 보류 + route group fix + migration 00003 + dnd-kit 채택 + canonical literal migration). Open Questions §1/§2/§3 해소 표시 + 신규 Q 등록.
- [docs/admin-overview.md](../docs/admin-overview.md) §3 변화이력 + §6 진척도 + §11 알려진이슈 + §12 다음작업 갱신.
- 이 log 엔트리.

**의사결정 사항** (계획서 §1 표 참고)
1. 스코프: 3c + 4 한 ship + Header fix
2. 정보 구조: `/admin/posts/[id]` 한 페이지에 갤러리 인라인
3. 혼합 미디어: personal = 이미지+영상 / archives·photo·film = 이미지만
4. 업로드 UI: Cloudinary Widget multi-mode 재사용
5. 빌드 트리거: GitHub Actions `repository_dispatch` + concurrency
6. Publish 의미론: `published` (의도) ↔ "사이트에 반영" (배포 액션) 분리
7. Preview 모드: v1 미포함
8. 작업 순서: Sync-first (Step 0 게이트 먼저)

**검증**
- `npx tsc --noEmit` clean
- `npm run build` 성공, 모든 라우트 (admin + public) 컴파일
- `/admin/login` 브라우저 확인: 공개 Header 없음
- sync idempotency: md5 일치 (2회 연속 sync)
- 깊은 어드민 UX (드래그·alt·업로드·publish 트리거) 는 인증된 세션 필요로 사용자 manual 검증 권장

**커밋 시퀀스** (`b10bf72` 이후)
- `0ed51f3` Step 0 — sync gate
- `a558b8e` Step 1 — route group split
- `40313a6` Phase 3b — admin post create/edit forms (pre-existing 격리)
- `2a8bcac` Step 2 — Phase 3c media manager
- `0e6a703` Step 3 — Phase 4 publish workflow
- (이 commit) Step 4 — docs

---

## [2026-05-03] auth-change | 매직링크 → 이메일·비밀번호 로그인

Phase 2의 매직링크 인증을 비밀번호 로그인으로 전환.

**사유**
- Supabase 무료 SMTP rate limit (시간당 2건)에 자주 막힘. 어드민 셋업·테스트 흐름이 비효율적.
- 어드민 1-2명 환경에서 매번 메일을 거치는 비용이 비밀번호 관리 비용보다 큼.

**구현 변경**
- `app/admin/login/page.tsx` — 폼이 매직링크 단일 input → 이메일+비밀번호 2-input. `signInWithPassword` 호출. 잘못된 자격증명/이메일 미인증/rate limit을 한국어 메시지로 매핑. 같은 메시지 ("이메일 또는 비밀번호가 올바르지 않습니다")로 enumeration 공격 방지.
- `/auth/callback` 보존 — 향후 OAuth 추가 시 재사용.
- 미들웨어·RLS·역할 모델 변경 없음.

**사용자 사이드**
- Supabase Dashboard → Authentication → Users → 사용자 → Set password로 비밀번호 1회 설정 후 로그인.

**ADR amendment**: [[decisions/0001-admin-architecture#2026-05-03-인증-방식-매직링크--이메일·비밀번호]]

---

## [2026-05-03] decision-amend | Phase 4 흡수 — 업로드를 3b/3c에 통합

원안에서 Cloudinary 업로드를 별도 Phase 4로 두었으나, "어드민 등록"의 사용자 가치는 publicId 같은 식별자를 작가가 직접 다루지 않을 때만 성립함. 결정:
- Phase 3b에 **단일 썸네일 업로드** 통합
- Phase 3c에 **다중 미디어 업로드** 통합
- 기존 Phase 4 제거. 기존 Phase 5(sync 스크립트)가 새 Phase 4가 됨.

자세한 사유와 영향: [[decisions/0001-admin-architecture#amendments]] / `docs/admin-setup.md` §7 (Cloudinary unsigned preset 가이드 추가).

---

## [2026-05-03] phase-3b | Create/edit form + 썸네일 업로드 + publish 토글

작가가 어드민에서 게시물을 처음부터 끝까지 등록·수정할 수 있게 됨. (사진 갤러리는 Phase 3c)

**의존성 추가**
- `zod` ^4.4.3 — server action input validation. `next-cloudinary`의 `<CldUploadWidget>`은 이미 설치돼 있어 그대로 사용.

**구현 산출물**
- `lib/validation/post-schema.ts` — zod discriminatedUnion (섹션별: archives는 city/year_label 필수, photography는 client 필수, 그 외 video_url 권장). FormData 변환 헬퍼, YouTube/Vimeo URL 파서.
- `app/admin/posts/_actions/posts.ts` — `createPost`, `updatePost`, `togglePublished` 추가 (`deletePost`는 3a 그대로). Postgres 23505/42501 → 친화적 메시지 매핑. stale-write 가드 (`updated_at` `.eq()` 매칭).
- `app/admin/posts/_components/thumbnail-uploader.tsx` — Cloudinary unsigned upload widget 통합. publicId/width/height를 hidden input으로 노출.
- `app/admin/posts/_components/section-fields.tsx` — 섹션별 동적 필드. 공통 Field 컴포넌트.
- `app/admin/posts/_components/publish-toggle.tsx` — admin only. role check 위반 시 토글 비활성화 + 서버 42501 surfacing.
- `app/admin/posts/_components/post-form.tsx` — `useActionState` + `useFormStatus` 기반. 생성/편집 공유. 편집 모드에서 섹션 select disabled.
- `app/admin/posts/new/page.tsx` — 생성 페이지.
- `app/admin/posts/[id]/page.tsx` — 편집 페이지. 사이드바에 publish 토글 + 미디어 매니저 링크 (3c에서 활성화).

**검증**
- `npx tsc --noEmit` clean
- `npx eslint` clean (lib/validation, _actions, _components, pages 모두)
- Supabase v2 타입 추론 회피 캐스트 4곳 (`as never`) — Database 제네릭이 cookies 옵션과 함께 추론 깨지는 알려진 케이스. CLI generated types로 가면 해소 가능.

**사용자 사이드 사전 작업**
- Cloudinary unsigned upload preset 생성 (5분) — `docs/admin-setup.md` §7
- `.env.local`에 `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` 추가

**검증 시나리오 (브라우저)**
1. `/admin/posts/new` → 섹션 archives → city, year_label 노출
2. city 비우고 저장 → "도시는 필수입니다"
3. 기존 slug로 저장 → "이미 사용 중인 슬러그입니다"
4. 썸네일 업로드 → 미리보기 + publicId 표시 → 저장 성공 → 편집 페이지로 redirect
5. 편집 모드: 섹션 select disabled 확인
6. (editor) publish 토글 → 비활성 (admin만 토글 가능)
7. (admin) publish 토글 → 성공 + 목록의 배지 변경
8. 두 탭에서 같은 게시물 수정 → 두 번째 저장 시 stale-write 에러
9. 영상 URL 잘못된 형식 입력 → 친화적 에러

**다음 단계 (3c)**
- `/admin/posts/[id]/media` — 다중 업로드 + reorder + alt 편집 + 삭제
- `@dnd-kit/core` 추가

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
