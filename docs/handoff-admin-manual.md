# 핸드오프 — 214 어드민 사용자 매뉴얼을 `arms-demo-manual.html` 형식으로 제작

> 작성 2026-08-30 (세션 `2f10d6bb`). 다른 세션이 이 문서만 읽고 이어서 작업할 수 있도록 씀.
> 목표: **`arms-demo-manual.html`(VitePress 단일 파일 매뉴얼)과 동일한 형식·디자인**으로 214archivesstudio 관리자 페이지 사용자 매뉴얼을 만든다.

---

## 0. 한눈에

| 항목 | 값 |
|---|---|
| 참조 파일 | `/Users/dongmin/Documents/GitHub/214archivesstudio/arms-demo-manual.html` (6.9 MB, **untracked**, 커밋 금지) |
| 참조의 원천 프로젝트 | `/Users/dongmin/Documents/GitHub/ARMS-FE/manual/` — VitePress 1.6.3, `docs/.vitepress/{config.mts, theme/custom.css, theme/index.ts, theme/style/print.css}` **재사용 가능** |
| 참조의 데모 원고·단일 파일 스크립트 | ARMS-FE 저장소(현재 브랜치·`origin/demo`)에 **없음**. 단일 파일은 §2.4 스펙대로 직접 만들어야 함 |
| 콘텐츠 원천 | `docs/admin-guide.md` (2026-08-30, 현재 배포본 기준 시나리오 가이드 — 그대로 페이지로 쪼개면 됨) |
| 사실 확인 코드 | §5 표 (필수 필드·권한·미디어 규칙) |
| 스크린샷 | 아직 없음. §6 절차로 실제 어드민에서 촬영 (임시 admin → 촬영 → 삭제) |
| 산출물 제안 | `214archivesstudio/manual/` (VitePress 프로젝트) + 빌드 후 단일 파일 `admin-manual.html` |

---

## 1. 참조 형식 분석 — `arms-demo-manual.html`이 정확히 무엇인가

VitePress 1.6.3 **기본 테마**로 빌드한 여러 페이지를 **한 HTML에 이어 붙이고 이미지를 base64로 내장**한 파일이다. 브라우저에서 열면 왼쪽 사이드바 + 오른쪽 본문(전 페이지 연속 스크롤)으로 보인다.

### 1.1 문서 골격
```html
<!DOCTYPE html><html lang="ko-KR"><head>
  <title>AutoLink 전시 가이드</title>
  <meta name="generator" content="VitePress v1.6.3">
  <style>…VitePress 기본 테마 CSS 전체 + custom.css 인라인…</style>
  <link rel="icon" href="data:image/x-icon;base64,…">        ← favicon 내장
</head><body>
  <div id="app">
    <div class="VPNav"> VPNavBar(로고 img data URI + 타이틀) </div>
    <aside class="VPSidebar"><nav id="VPSidebarNav">
      <section class="VPSidebarItem level-0"><h2 class="text">그룹명</h2>
        <div class="items"><div class="VPSidebarItem level-1 is-link">
          <a class="VPLink link" href="#page-<slug>"><p class="text">페이지명</p></a> …
    </nav></aside>
    <div class="VPContent"><div class="VPDoc"><main class="main"><div class="vp-doc">
      <section class="page" id="page-<slug>"><div>
        <h1 id="<slug>--<제목>">제목 <a class="header-anchor" href="#…">​</a></h1>
        <h2 id="<slug>--개요">개요 …</h2> … 
      </div></section>
      <section class="page" id="page-<다음 slug>">…</section>   ← 페이지마다 반복
    </div></main></div></div>
  </div>
  <script>(function(){ … })();</script>                        ← 663자 스크롤 스파이
</body></html>
```
- 페이지 26개가 `section.page`로 연속. 사이드바 링크는 `#page-<slug>` 앵커.
- 헤딩 id는 `<slug>--<제목>` 형식(페이지 간 충돌 방지). 각 헤딩에 `a.header-anchor`.
- `<script>` 하나: 스크롤 위치로 현재 `section.page`를 찾아 사이드바 항목에 `is-active` 부여 (+ 클릭 시 동일). 외부 스크립트·CSS·폰트 요청 **0** (완전 오프라인).
- 이미지 40개 전부 `<p><img src="data:image/png;base64,…" alt="…"></p>`. 개당 35–276 KB.

### 1.2 디자인 토큰 (ARMS-FE `manual/docs/.vitepress/theme/custom.css` 그대로)
```css
:root { --vp-c-brand-1: #106cf2; --vp-c-brand-3: #106cf2 !important; --vp-c-bg-soft: #f3f7fe; }
/* 인라인 라벨 배지: 마크다운 `텍스트`{.class} 문법 */
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.master  { background:#efe0f8; color:#912fd3; font-weight:700 }
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.admin   { background:#e3f2fd; color:#1976d2; font-weight:700 }
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.normal  { background:#f1f8e9; color:#388e3c; font-weight:700 }
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.disable { background:#767676; color:#f8f8f8; font-weight:700 }
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.error   { background:#f24922; color:#ffebd9; font-weight:700 }
.vp-doc :not(pre,h1,h2,h3,h4,h5,h6) > code.warning { background:#ff9f42; color:#4b1900; font-weight:700 }
/* 그 외 restricted / normalDevice / end / disable2 / error2 / warning2 — 데모 파일 <style> 앞부분 참고 */
.vp-doc ol.alpha { list-style-type: upper-alpha }
.vp-doc table { display:block; max-width:100%; overflow-x:auto; word-break:keep-all }
```
- 폰트 Inter(테마 기본), 라이트 모드 고정(`appearance: false`), 본문 최대폭·간격은 테마 기본.
- 콜아웃: VitePress 컨테이너 `::: info` / `::: tip` / `::: warning` / `::: danger` → `<div class="warning custom-block"><p class="custom-block-title">주의</p>…</div>`.

### 1.3 페이지 작성 패턴 (데모 매뉴얼에서 관찰)
사이드바 그룹: **실행 및 세팅 / 설명 / 주의사항 / 예상 질문 및 대응**. 각 페이지 구조:
1. `# 제목`
2. `## 개요` — 2~3문장, 필요 시 권한 표 (`` `일반 사용자`{.normal} `` 같은 배지)
3. `## 화면` — 전체 스크린샷 1장 → `### A. 영역` `### B. 영역`… 각 영역 설명(불릿) + 부분 스크린샷
4. 절차형 페이지는 `## 실행` / `## 로그인` … 아래 **번호 목록**(한 단계 = 한 동작, 굵게 표시한 UI 라벨)
5. `::: warning 주의` 블록으로 하지 말아야 할 것
6. 마지막 그룹에 `### 1. 질문?` 형식의 Q&A

원고 규칙(ARMS-FE `manual/docs/AGENTS.md` 요약): 한국어 과업 중심, H1 다음 번호 절, 스크린샷은 `docs/img/N.webp` 전역 번호 + 상대경로(`../../img/N.webp`), 페이지 추가/이름 변경 시 `config.mts` 사이드바를 반드시 동기화, 사이드바 링크는 `.md` 없이.

---

## 2. 재현 절차 (권장)

### 2.1 프로젝트 생성
```bash
cd /Users/dongmin/Documents/GitHub/214archivesstudio
mkdir -p manual/docs/.vitepress/theme/style manual/docs/img manual/docs/public
cp ../ARMS-FE/manual/docs/.vitepress/theme/custom.css   manual/docs/.vitepress/theme/
cp ../ARMS-FE/manual/docs/.vitepress/theme/index.ts     manual/docs/.vitepress/theme/
cp ../ARMS-FE/manual/docs/.vitepress/theme/style/print.css manual/docs/.vitepress/theme/style/
```
`manual/package.json`:
```json
{ "name": "@214/manual", "private": true,
  "scripts": { "docs:dev": "vitepress dev docs", "docs:build": "vitepress build docs", "bundle": "node scripts/bundle-single-file.mjs" },
  "devDependencies": { "vitepress": "1.6.3" } }
```
- 루트 `package.json`/lockfile을 건드리지 않으려면 `manual/`에서 `npm install` 로 독립 설치 (루트는 npm, ARMS-FE는 pnpm — 섞지 말 것).
- `config.mts`는 ARMS 것을 베이스로: `lang: 'ko-KR'`, `title: '214 Archives 어드민 가이드'`, `appearance: false`, `search: { provider: 'local' }`, `base: '/'`, `outDir: 'dist'`, `srcExclude: ['AGENTS.md']`, 로고는 `public/logo.png`(사이트 `public/` 의 214 로고 재사용 가능 여부 확인). 사이드바는 §4.
- 214 브랜드에 맞추려면 `--vp-c-brand-1`만 바꿔도 됨(예: 어드민의 warm `#d6a877`은 배경이 밝아 대비가 약하니 `#1a1a1a` 계열 검토). **사용자가 "동일한 디자인"을 요구했으므로 기본은 ARMS 값 유지**, 변경은 확인 후.

### 2.2 원고 작성
- `docs/admin-guide.md`의 각 절을 페이지로 분할 (§4 매핑). 문장은 이미 작가 눈높이로 다듬어져 있으므로 **내용을 바꾸지 말고 형식만 옮길 것** (개요/화면/절차/주의 패턴에 맞춰 재배치, 스크린샷 삽입).
- 배지 문법 활용 예: `` `공개`{.normal} `` `` `초안`{.disable} `` `` `DRIFT · 3`{.warning} `` `` `실패`{.error} ``.

### 2.3 빌드 확인
`npm run docs:dev` → 사이드바 도달성·이미지·링크 확인 → `npm run docs:build` → `dist/`.

### 2.4 단일 파일 번들 스크립트 스펙 (`manual/scripts/bundle-single-file.mjs`, 직접 작성)
입력 `dist/`, 출력 `admin-manual.html`. 데모 파일과 같은 구조를 만들려면:
1. `config.mts` 사이드바 순서대로 각 페이지의 `dist/<route>.html`을 읽어 `<main class="main">` 안의 `.vp-doc` 내부 HTML을 추출.
2. 각 페이지를 `<section class="page" id="page-<slug>"><div>…</div></section>`으로 감싼다. `<slug>` = 라우트에서 `/`→`-` (예 `guide-film-create`). 페이지 안 모든 헤딩 `id`와 `a.header-anchor href`에 `<slug>--` 접두어를 붙여 충돌을 없앤다.
3. 첫 페이지의 셸(`<head>`, `VPNav`, `VPSidebar`, `VPContent` 래퍼)을 취해 본문 자리에 2의 섹션들을 순서대로 넣는다. 사이드바 `<a href="/…">`는 `#page-<slug>`로 치환. 상단 nav 링크는 `#`.
4. `<link rel="stylesheet">`는 `<style>`로 인라인, `<script type="module">`·VitePress 런타임 JS는 **제거**(정적 문서이므로 불필요), `<link rel="icon">`·`<img src>`는 base64 data URI로 치환 (`dist/assets/*.webp`, `public/logo.png`).
5. 아래 스크롤 스파이 스크립트를 `</body>` 앞에 삽입:
   ```js
   (function(){var links=[].slice.call(document.querySelectorAll('.VPSidebar a[href^="#page-"]'));
   var byId={};links.forEach(function(a){byId[a.getAttribute('href').slice(1)]=a.closest('.VPSidebarItem');});
   function mark(id){links.forEach(function(a){a.closest('.VPSidebarItem').classList.remove('is-active');});var it=byId[id];if(it)it.classList.add('is-active');}
   var sections=[].slice.call(document.querySelectorAll('section.page'));
   function onScroll(){var y=window.scrollY+100,cur=sections[0];sections.forEach(function(s){if(s.offsetTop<=y)cur=s;});if(cur)mark(cur.id);}
   window.addEventListener('scroll',onScroll,{passive:true});links.forEach(function(a){a.addEventListener('click',function(){mark(a.getAttribute('href').slice(1));});});onScroll();})();
   ```
6. 사이드바 그룹 접힘(`VPSidebarItem.collapsed`)은 모두 펼친 상태로 두고, 로컬 검색(DocSearch) 마크업은 제거해도 된다(런타임 JS가 없으면 동작 안 함).
7. 결과 파일을 브라우저로 열어 확인: 사이드바 클릭 이동, 스크롤 시 활성 표시, 이미지 표시, 외부 요청 0 (DevTools Network).

---

## 3. 콘텐츠 원천과 매핑

`docs/admin-guide.md` 구조 → 매뉴얼 페이지 (아래 §4 사이드바 기준):
| admin-guide.md | 매뉴얼 페이지 |
|---|---|
| 0 딱 두 가지만 기억하기 · 화면 구성 | 시작하기 / 로그인·화면 구성 / 공개·초안과 게시의 차이 |
| 1 공통 A~F | 공통 조작 그룹 6페이지 (새 게시물 · 갤러리 · 수정 · 공개/초안 · 게시 · 삭제) |
| 2 카테고리별 5개 | 카테고리 그룹 5페이지 (각: 개요=필수·선택·갤러리 표 → 등록 절차 → 수정·삭제는 공통 링크) |
| 3 운영 시나리오 | 시나리오 그룹 1페이지 (또는 5개 소절) |
| 4 막혔을 때 | 주의사항 및 문제 해결 |
| 5 체크리스트 | 게시 전 체크리스트 |

추가로 넣을 만한 것: 대시보드 화면 설명(게시 패널·최근 활동·통계), 목록 화면 설명(검색·섹션 탭·최신순), 편집 화면 구성(A 폼 / B 공개 상태 / C 미디어 / D 위험 영역) — 데모 매뉴얼의 "화면 → A/B/C" 패턴에 맞춰 각 화면마다 한 페이지.

---

## 4. 제안 사이드바 (config.mts)
```
시작하기
  ├ 접속과 로그인            /start/0-login
  ├ 화면 구성                /start/1-layout        (대시보드·목록·편집 화면 스크린샷 + A/B/C)
  └ 공개·초안과 게시의 차이   /start/2-publish-model
공통 조작
  ├ 새 게시물 만들기          /common/0-create
  ├ 갤러리 사진 넣기·순서·설명 /common/1-gallery
  ├ 수정하기                  /common/2-edit
  ├ 공개 / 초안 바꾸기        /common/3-visibility
  ├ 사이트에 내보내기(게시)    /common/4-publish
  └ 삭제하기                  /common/5-delete
카테고리별 등록
  ├ Showreel                 /category/showreel
  ├ Archives                 /category/archives
  ├ Film                     /category/film
  ├ Photography              /category/photography
  └ Personal                 /category/personal
운영 시나리오               /scenarios/index
주의사항 및 문제 해결        /troubleshooting/index
게시 전 체크리스트           /checklist/index
```

---

## 5. 사실 확인 — 코드에서 검증된 현재 동작 (2026-08-30 배포본 `00ed76e`)
| 항목 | 값 | 코드 |
|---|---|---|
| 섹션 5개 · 표시 순서 | showreel, archives, film, photography, personal | `lib/sections.ts` |
| 공통 필수 | 제목·슬러그·날짜·썸네일(`thumbnail_public_id`) | `lib/validation/post-schema.ts` baseFields |
| Archives 필수 | 도시·연도 라벨 | 같은 파일 `archivesSchema` |
| Photography 필수 | 클라이언트 | `photographySchema` |
| 영상 URL | showreel·film 필수, personal 선택 | `app/admin/posts/_components/section-fields.tsx:86-87` |
| 영상 썸네일 (film 전용) | mp4/webm/mov ≤200MB, 앞 10초 `du_10,q_auto,vc_auto,w_1280`, 고급 URL 입력 폴백 | `video-thumbnail-uploader.tsx` |
| 갤러리 | showreel 없음; personal만 `+ 영상`(YouTube/Vimeo, YouTube는 썸네일 표시) | `media/MediaManager.tsx:41,52` |
| 다중 업로드 | 고른 순서대로 추가(`onQueuesEnd` 보정), 1번 카드가 목록 썸네일 | `media/AddImageButton.tsx`, `MediaManager.finalizeBatchOrder` |
| 정렬 | 드래그(마우스 distance 6 / 터치 delay 200ms), 키보드 Tab→Space→화살표→Space | `media/MediaGrid.tsx` |
| 공개/초안 토글 | admin만; 초안 전환 시 확인창 | `posts/[id]/page.tsx:84`, `publish-toggle.tsx` |
| 삭제 | 목록: admin 또는 초안만 / 편집 화면 위험 영역 | `posts-table.tsx:39`, `delete-post-button.tsx` |
| 게시 | 대시보드 "변경사항 게시" → 약 30초 후 IN SYNC, 활동 "빌드 시작됨 · 1~3분 후 사이트 반영", 10분 타임아웃 시 TIMEOUT + 다시 게시 | `publish-panel.tsx`, `.github/workflows/publish.yml` |
| 목록 | 최신 수정순, 섹션 탭, 검색(쉼표 등 안전), 20개 페이지네이션 | `lib/repos/posts.ts`, `posts/page.tsx` |
| 피드백 | 저장 토스트, 검증 에러 요약+첫 칸 스크롤, created 토스트, alt "저장됨" | `post-form.tsx`, `created-toast.tsx`, `MediaCard.tsx` |
| 에러 화면 | `error.tsx`, `not-found.tsx` (셸 안) | `app/admin/` |
| 모바일 | 375px 오버플로 0, 편집 화면은 공개 상태·미디어가 위 | `AdminHeader.tsx`, `layout.tsx` |

사용자 결정(변경 금지): 팀 화면 없음(개인 포트폴리오), editor 역할은 존재하지만 UI 언급 불필요, 용어는 **공개/초안**, **변경사항 게시**, **미반영(DRIFT)**.

---

## 6. 스크린샷 촬영 절차 — **Playwright(MCP)로 직접 촬영** (ARMS 매뉴얼과 같은 방식)

사용자 지시: ARMS 매뉴얼 스크린샷도 Playwright로 직접 찍었으므로 **그 방식을 그대로 차용**한다. 이 세션에서 어드민 QA·검증에 쓴 호출 레시피가 아래에 있고, 메모리 `admin-browser-qa-procedure`에도 같은 내용이 있다.

### 6.1 준비
1. **임시 admin 생성** — service role 사용. 촬영 후 반드시 삭제.
   ```ts
   // scripts/_tmp-qa-user.mts  → QA_OUT=<경로> npx tsx --env-file=.env.local scripts/_tmp-qa-user.mts ; 끝나면 rm
   import { createClient } from "@supabase/supabase-js";
   import { writeFileSync } from "node:fs";
   const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
   const email = `qa-temp-${Date.now()}@214archives.invalid`, password = "Qa!" + Math.random().toString(36).slice(2, 12) + "Zz9";
   const { data, error } = await sb.auth.admin.createUser({ email, password, email_confirm: true }); if (error) throw error;
   await sb.from("user_roles").insert({ user_id: data.user!.id, role: "admin" });
   writeFileSync(process.env.QA_OUT!, JSON.stringify({ email, password, uid: data.user!.id })); console.log(email);
   ```
   삭제: `user_roles` delete(user_id) → `auth.admin.deleteUser(uid)`. 정상 상태 = `auth.users` 2 · `user_roles` 2 · `posts` 32.
   (tsx 스크립트는 `scripts/` 아래에 있어야 node_modules 해석이 됨. scratchpad에서는 실패.)
2. **대상 환경**: 프로덕션 `https://www.214archives.com/admin` 권장(실데이터 32건, 화면이 자연스러움). 로컬은 `npm run dev`(:3001), 같은 DB.
3. Playwright MCP 도구 로드: `ToolSearch("select:mcp__playwright__browser_navigate,mcp__playwright__browser_snapshot,mcp__playwright__browser_click,mcp__playwright__browser_fill_form,mcp__playwright__browser_type,mcp__playwright__browser_take_screenshot,mcp__playwright__browser_resize,mcp__playwright__browser_evaluate,mcp__playwright__browser_wait_for,mcp__playwright__browser_press_key,mcp__playwright__browser_file_upload,mcp__playwright__browser_close")`.

### 6.2 이 세션에서 실제로 쓴 호출 레시피 (그대로 반복하면 됨)
```
browser_resize            { width: 1280, height: 800 }                 # 데스크톱 기준. 모바일은 375×760
browser_navigate          { url: "https://www.214archives.com/admin/login" }
browser_fill_form         { fields: [ {target:"input[type=email], input[name=email]", name:"이메일", type:"textbox", value:<email>},
                                      {target:"input[type=password]",              name:"비밀번호", type:"textbox", value:<pw>} ] }
browser_click             { target: 'button:has-text("로그인")', element: "로그인 버튼" }
browser_wait_for          { time: 3 }
browser_take_screenshot   { scale: "css", filename: "01-login.png" }                        # 뷰포트
browser_take_screenshot   { scale: "css", filename: "02-dashboard.png", fullPage: true }    # 전체 페이지
browser_snapshot          { depth: 8 }   또는  { filename: "snap.md" }                       # ref 얻기 (파일 저장 시 iframe 내부까지 포함)
browser_take_screenshot   { scale: "css", filename: "03-publish-panel.png", target: "<ref 또는 CSS 셀렉터>", element: "게시 패널" }  # 부분(A/B/C 영역) 컷
browser_evaluate          { function: "() => document.documentElement.scrollWidth" }         # 상태 확인용
browser_close
```
- `target`은 스냅샷 ref(`e12`, `f4e43`) 또는 **고유 CSS 셀렉터** 둘 다 됨. 셀렉터가 2개 이상에 맞으면 실패하므로(`button[type=submit]` 사례) 텍스트 셀렉터 `button:has-text("…")`를 선호.
- 스크린샷 파일은 **저장소 루트**에 떨어진다 → 촬영 후 `manual/docs/img/N.webp`로 이동·변환(`sharp` 또는 `cwebp`). 루트에 png를 남기지 말 것.
- `browser_file_upload`(Cloudinary 위젯에 파일 넣기)는 **저장소 루트 안 경로만** 허용 → 필요 시 `.playwright-mcp/qa-images/`(gitignored)에 복사.
- Cloudinary 위젯은 교차 출처 iframe이라 일반 스냅샷엔 안 잡히지만 `browser_snapshot {filename}`에는 잡힘 → `button "Browse" [ref=…]`로 클릭 가능.
- 상태가 있는 화면(토스트·확인창·에러 요약)은 동작을 실제로 일으킨 직후 `browser_wait_for {time: 1}` 뒤에 찍는다. 예: 빈 제목으로 `생성` 클릭 → 요약 메시지; `초안` 클릭 → 확인창; 저장 → 토스트(1.2초 내).
- 어드민은 다크 UI이므로 매뉴얼(라이트 테마) 안에서 이미지 테두리가 필요하면 CSS로 `.vp-doc img { border: 1px solid #e5e7eb; border-radius: 4px }` 추가 검토.

### 6.3 촬영 목록 (데모 매뉴얼 밀도 기준 20~25장, 번호는 `img/N.webp`)
| N | 화면 | 방법 |
|---|---|---|
| 1 | 로그인 | 뷰포트 |
| 2 | 대시보드 전체 | fullPage |
| 3 | 게시 패널 IN SYNC | 부분 `target` |
| 4 | 게시 패널 DRIFT · N | 임시 게시물을 공개로 바꾼 뒤 촬영 → 이후 초안으로 되돌리고 삭제 (게시 버튼은 누르지 말 것 — 필요하면 무변경 실행이라 안전) |
| 5 | 최근 활동 표 | 부분 |
| 6 | 목록 전체 · 7 섹션 탭+검색 | fullPage / 부분 |
| 8 | 새 포스트 섹션 카드 | 부분 |
| 9–13 | 각 섹션 폼 (Showreel·Archives·Film·Photography·Personal) | 섹션 카드 클릭 후 fullPage |
| 14 | 썸네일 업로더 + Cloudinary 위젯 | `+ 이미지`/`파일 선택` 클릭 후 뷰포트 |
| 15 | 편집 화면 전체 | fullPage (기존 게시물 열람만) |
| 16 | 공개 상태 카드 · 17 초안 확인창 | 부분 / `초안` 클릭 후 (임시 게시물에서만) |
| 18 | 미디어 그리드·alt 입력 | 부분 |
| 19 | `+ 영상` 모달 (Personal) | 클릭 후 뷰포트 |
| 20 | Film 영상 썸네일 업로더 | 부분 |
| 21 | 위험 영역 · 22 삭제 확인창 | 부분 / 클릭 후 (임시 게시물) |
| 23 | 저장 토스트 · 24 검증 에러 요약 | 저장 직후 / 빈 제목 제출 직후 |
| 25 | 404 화면 | `/admin/posts/00000000-0000-0000-0000-000000000000` |
| 26–27 | 모바일 목록·편집 (375×760) | resize 후 |

### 6.5 시나리오 재현 순서 — `docs/admin-guide.md`를 그대로 따라가며 촬영
사용자 지시: 시나리오 구성과 Playwright 재현은 **다른 세션**이 `docs/admin-guide.md`(2026-08-30)를 참고해 진행한다. 아래는 그 가이드의 절 순서를 Playwright 동작과 촬영 컷으로 1:1 대응시킨 것. §6.3의 번호(N)와 같은 파일명을 쓴다.

| 가이드 절 | Playwright로 재현할 동작 | 촬영 컷 (N) |
|---|---|---|
| 0 딱 두 가지 | 로그인 → 대시보드 | 1 로그인, 2 대시보드, 3 게시 패널 |
| 공통 A 새 게시물 | `Posts` → `+ 새 포스트` → 섹션 카드 → 필드 입력(임시 슬러그 `qa-temp-…`) → 썸네일 `파일 선택` → 빈 필수값으로 `생성` 1회(에러 요약) → 올바르게 `생성` | 6 목록, 8 섹션 카드, 14 업로더, 24 에러 요약, 15 편집 화면(생성 직후 토스트 포함) |
| 공통 B 갤러리 | `+ 이미지` → 위젯(파일 스냅샷으로 `Browse` ref) → `.playwright-mcp/qa-images/` 이미지 2~3장 → alt 입력 후 blur("저장됨") → 카드 ✕ → 확인창 | 18 미디어 그리드·alt, (22와 같은 확인창 패턴) |
| 공통 C 수정 | 제목 변경 → `저장` → 토스트 1.2초 내 촬영 | 23 저장 토스트 |
| 공통 D 공개/초안 | `공개` 클릭(헤더 DRIFT·1) → `초안` 클릭 → 확인창 촬영 → `초안으로 전환` | 16 공개 상태 카드, 17 초안 확인창, 4 게시 패널 DRIFT |
| 공통 E 게시 | 대시보드 게시 패널(DRIFT 상태) 촬영 후 **`변경사항 게시`는 임시 게시물을 초안으로 되돌린 뒤에만** 실행(무변경 실행이라 안전, 최근 활동 행 촬영) | 4, 5 최근 활동 |
| 공통 F 삭제 | 위험 영역 `삭제…` → 확인창 촬영 → `삭제` → 목록 복귀 | 21 위험 영역, 22 삭제 확인창 |
| Showreel | 새 포스트에서 Showreel 카드 → 영상 URL 입력(미리보기 렌더) — **생성하지 않고** 폼만 촬영 | 9 |
| Archives | Archives 카드 → 도시·연도 라벨 필드 보이게 촬영 | 10 |
| Film | Film 카드 → 영상 URL + 영상 썸네일 업로더 보이게 촬영 | 11, 20 |
| Photography | Photography 카드 → 클라이언트 필드 | 12 |
| Personal | 임시 게시물(Personal) 편집 화면에서 `+ 영상` → 모달 촬영 → YouTube URL 추가 → 카드 썸네일 촬영 | 13, 19 |
| 3 운영 시나리오 | 별도 촬영 불필요 — 3·4·5 컷 재사용 |
| 4 막혔을 때 | `/admin/posts/00000000-0000-0000-0000-000000000000` → 404 화면 | 25 |
| 모바일 | `browser_resize 375×760` → 목록·편집 | 26, 27 |

실행 순서 권장: 로그인·대시보드(1–3) → 새 포스트 폼 5종(8–13, 생성 없이 카드만 바꿔가며) → 임시 Personal 게시물 생성(14, 24, 15) → 갤러리·영상(18, 19, 20은 Film 폼에서) → 수정·토스트(23) → 공개/초안(16, 17, 4) → 무변경 게시(5) → 삭제(21, 22) → 404(25) → 모바일(26, 27) → 원상복구(§6.4). 임시 게시물은 **하나**만 만들고 끝에 삭제하면 DB·Cloudinary 잔여가 남지 않는다(이미지는 `qa-temp-` prefix 삭제).

### 6.4 촬영 후 원상복구 (이 세션 표준)
`qa-temp*` 게시물 delete(cascade) → Cloudinary 업로드가 있었다면 Admin API `DELETE /resources/image/upload?prefix=214archives/admin/qa-temp-` → `user_roles`·auth 사용자 삭제 → `pkill -f "next dev -p 3001"` → 루트 `*.png`·`scripts/_tmp-*.mts`·`.playwright-mcp/` 당일 파일 제거 → `git status`에 새 파일 없음 확인.

---

## 7. 제약·주의
- `arms-demo-manual.html`은 untracked이며 다른 제품(AutoLink) 문서다. **커밋하지 말고**, 형식 참조 후 필요 없으면 삭제 여부를 사용자에게 확인.
- `.env`·`.env.local`에 Supabase service role, GitHub PAT, Cloudinary API secret이 있다. 문서·스크린샷에 노출 금지.
- 매뉴얼 결과물의 저장 위치·커밋 여부는 사용자에게 확인(제안: `manual/` 소스는 커밋, `dist/`·`admin-manual.html`은 gitignore 또는 `docs/`에 1개만).
- 저장소 상태(2026-08-30 23:20): `main` = origin = `00ed76e`. 미커밋은 세션 이전부터 있던 것뿐 — `docs/admin-phase-3c-4-plan.md`, `214Archives_기획서.md`, `docs/admin-phase-e-playbook.md`, `handoff/`(5월 디자인 목업), `.omc/`, 그리고 `arms-demo-manual.html`, 이 문서.
- 루트 `npm run lint`는 에러 0(경고 3). `manual/`을 만들면 `eslint.config.mjs`의 ignores에 `manual/**` 추가 검토.

---

## 8. 완료 기준
- [ ] `manual/` VitePress 프로젝트가 `npm run docs:build` 통과, 사이드바 §4 전 페이지 도달
- [ ] 각 페이지가 §1.3 패턴(개요 → 화면 A/B/C 또는 번호 절차 → 주의)을 따르고, 내용은 `docs/admin-guide.md`와 일치
- [ ] 스크린샷 20장 이상, 전부 실제 화면, 개인정보·비밀값 없음, `img/N.webp` 규칙
- [ ] 단일 파일 `admin-manual.html`: 외부 요청 0, 사이드바 이동·활성 표시 동작, 파일 크기 ≤ 10 MB
- [ ] 임시 계정·게시물·Cloudinary 자산 0, 루트에 임시 파일 없음
- [ ] `docs/admin-overview.md` §7·§12 와 `wiki/log.md`에 매뉴얼 위치·빌드 방법 기록
