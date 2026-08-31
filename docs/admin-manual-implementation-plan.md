# 구현 플랜 — 214 어드민 사용자 매뉴얼 (`arms-demo-manual.html` 형식)

> 작성 2026-08-30. 입력: [`docs/handoff-admin-manual.md`](handoff-admin-manual.md)(형식 분석·촬영 레시피) + [`docs/admin-guide.md`](admin-guide.md)(원고).
> 이 문서는 **무엇을 어떤 순서로 만들고, 각 단계를 무엇으로 검증하는지**를 정한다. 세부 명령·레시피는 핸드오프 §2·§6을 참조하고 여기서는 중복하지 않는다.

---

## 0. 목표와 범위

**산출물**
| # | 산출물 | 위치 | 커밋 |
|---|---|---|---|
| 1 | VitePress 매뉴얼 소스 (원고 17페이지 + 스크린샷 27장 + 테마) | `manual/` | O |
| 2 | 단일 파일 번들 스크립트 | `manual/scripts/bundle-single-file.mjs` | O |
| 3 | 단일 HTML 매뉴얼 (오프라인, 이미지 내장) | `docs/admin-manual.html` | O (1개만, ≤10 MB) |
| 4 | 문서 갱신 | `docs/admin-overview.md` §7·§12, `wiki/log.md`, `.gitignore`, `eslint.config.mjs` | O |

**형식 정의 — "arms-demo-manual.html과 동일"의 구체적 의미**
- VitePress 1.6.3 기본 테마 + ARMS `custom.css` 그대로 (브랜드 `#106cf2`, 배지 클래스, 표 스크롤). 라이트 고정.
- 전 페이지를 `section.page#page-<slug>`로 한 문서에 연속 배치, 왼쪽 사이드바 앵커 이동 + 스크롤 스파이.
- 외부 요청 0 (CSS 인라인, 이미지·파비콘·로고 data URI, VitePress 런타임 JS 제거).
- 페이지 패턴: `# 제목` → `## 개요` → `## 화면`(전체 컷 → `### A.` `### B.` 부분 컷) 또는 번호 절차 → `::: warning 주의`.

**범위 밖**: 로컬 검색 동작(런타임 JS 제거로 불가, 데모도 동일), PDF 내보내기, 다크 모드, editor 역할 설명, 팀 화면.

**기본 가정 (사용자 확인 전까지 이대로 진행)**
- A1. 브랜드 색·폰트는 ARMS 값 유지 (핸드오프 §2.1 — "동일한 디자인" 요구).
- A2. 촬영 환경은 프로덕션 `https://www.214archives.com/admin`, 임시 admin 계정 사용 후 삭제.
- A3. `arms-demo-manual.html`은 완료 후 삭제 여부를 사용자에게 묻고 그 전까지 유지·미커밋.
- A4. 스크린샷은 webp로 저장(데모는 png였지만 형식은 화면에 보이지 않고 용량이 1/3). 

---

## 1. 단계 개요

| 단계 | 내용 | 산출 | 검증 | 선후 |
|---|---|---|---|---|
| P1 | 스캐폴드 — VitePress 프로젝트·테마·사이드바 | `manual/` 골격, 빈 17페이지 | `npm run docs:dev` 로 사이드바 17항목 도달 | — |
| P2 | 원고 — `admin-guide.md`를 17페이지로 재배치 | `manual/docs/**/*.md` | `npm run docs:build` 통과(dead link 0) | P1 |
| P3 | 스크린샷 — Playwright로 27컷 촬영 → webp | `manual/docs/img/1..27.webp` | 27개 존재, 각 ≤300 KB, 비밀값·실계정 없음, 원상복구 완료 | P1 (P2와 병렬 가능) |
| P4 | 번들 스크립트 — dist → 단일 HTML | `bundle-single-file.mjs`, `docs/admin-manual.html` | 브라우저 열기: 외부 요청 0, 사이드바 이동·활성, 이미지 27, 크기 ≤10 MB | P2·P3 |
| P5 | 마감 — QA·문서·저장소 정리 | 문서 4종 갱신 | `npm run lint` 에러 0, `git status`에 임시 파일 없음 | P4 |

P2와 P3는 독립적이라 **다른 세션에서 병렬** 진행 가능. P2는 이미지 경로를 §3 컷 번호로 미리 박아 두고, P3가 파일을 채운다.

---

## 2. P1 — 스캐폴드

### 2.1 파일 트리
```
manual/
├── package.json                 # @214/manual, vitepress 1.6.3, cheerio (번들용)
├── package-lock.json            # 커밋. 루트 lockfile과 분리 (루트에서 npm workspaces 쓰지 않음)
├── scripts/bundle-single-file.mjs
└── docs/
    ├── index.md                 # 홈 → 첫 페이지 링크 1줄 (사이드바·번들에서 제외)
    ├── .vitepress/
    │   ├── config.mts           # ARMS 베이스, §2.2 값
    │   ├── sidebar.mjs          # 사이드바를 순수 JS로 분리 → config.mts와 번들 스크립트가 공유
    │   └── theme/{index.ts, custom.css, style/print.css}   # ARMS에서 복사, 무수정
    ├── public/logo.png          # ../public/android-chrome-192x192.png 복사 (214-logo.svg는 흰색 텍스트라 밝은 배경에서 안 보임)
    ├── public/favicon.ico       # ../public/favicon.ico 복사
    ├── img/1.webp … 27.webp
    ├── start/{0-login,1-layout,2-publish-model}.md
    ├── common/{0-create,1-gallery,2-edit,3-visibility,4-publish,5-delete}.md
    ├── category/{showreel,archives,film,photography,personal}.md
    ├── scenarios/index.md
    ├── troubleshooting/index.md
    └── checklist/index.md
```

### 2.2 `config.mts` — ARMS 대비 변경점만
| 키 | 값 |
|---|---|
| `title` / `description` | `214 Archives 어드민 가이드` / `214archives.com 관리자 페이지 사용 설명서` |
| `base` / `outDir` | `/` / `../dist` (VitePress는 docs 루트 기준으로 해석 → `manual/dist/`) |
| `head` | `[['link', { rel: 'icon', href: '/favicon.ico' }]]` |
| `themeConfig.logo` | `/logo.png` |
| `themeConfig.nav` | `[{ text: '사용 가이드', link: '/start/0-login' }]` 1개 |
| `themeConfig.sidebar` | `import { sidebar } from './sidebar.mjs'` |
| `themeConfig.outline` | `false` (번들에서 우측 목차는 JS 없이 무의미 → 처음부터 끔) |
| `themeConfig.docFooter` | `{ prev: false, next: false }` (번들에서 이전/다음 링크 제거 수고 절감) |
| 유지 | `lang: 'ko-KR'`, `appearance: false`, `search: { provider: 'local' }`, `srcExclude: ['AGENTS.md']` |

`sidebar.mjs`는 핸드오프 §4 트리를 그대로 `{ text, items: [{ text, link }] }` 로 export. 그룹 3개는 접힘 없음(`collapsed` 미지정).

### 2.3 저장소 통합
- `.gitignore` 추가: `manual/node_modules/`, `manual/docs/.vitepress/cache/`, `manual/dist/`
- `eslint.config.mjs` ignores: `["handoff/**", "manual/**"]`
- 설치: `cd manual && npm install` (루트 `package.json`·lockfile 무변경 확인 — `git status`로).

**검증**: `npm run docs:dev` → `http://localhost:5173` 에서 사이드바 17항목 모두 클릭 시 200, 로고·파비콘 표시, 배지 문법 `` `공개`{.normal} `` 렌더 확인.

---

## 3. P2 — 원고 (페이지별 스펙)

원칙: **`admin-guide.md`의 문장을 바꾸지 않고 형식만 옮긴다.** 새로 쓰는 문장은 "개요" 2~3문장과 "화면 → A/B/C" 영역 설명뿐이며, 사실은 핸드오프 §5 표에서만 가져온다. 컷 번호 `[N]` = `img/N.webp`, 경로는 `../img/N.webp`.

배지 규약: `` `공개`{.normal} `` `` `초안`{.disable} `` `` `IN SYNC`{.normal} `` `` `DRIFT · 3`{.warning} `` `` `TIMEOUT`{.error} `` `` `실패`{.error} `` `` `admin`{.admin} ``. UI 라벨은 **굵게** (`**변경사항 게시**`). 페이지 간 참조는 `[공통 B](../common/1-gallery)` (확장자 없이).

### 시작하기
| 페이지 | 구조 | 원고 출처 | 컷 |
|---|---|---|---|
| `start/0-login` 접속과 로그인 | 개요(주소·계정·휴대폰 지원) → `## 로그인` 번호 3단계 → `::: warning` 로그인 직후 다시 로그인 화면 = 역할 없음 | guide 머리 3줄, §4 표 마지막-1행 | 1 |
| `start/1-layout` 화면 구성 | `## 대시보드` [2] → A 헤더(DRIFT 배지) B 게시 패널 [3] C 최근 활동 [5] / `## 게시물 목록` [6] → A 섹션 탭·검색 [7] B 표(최신 수정순·20개·편집/삭제) C **+ 새 포스트** / `## 편집 화면` [15] → A 폼 B 공개 상태 [16] C 미디어 [18] D 위험 영역 [21] / `## 휴대폰` [26][27] (공개 상태·미디어가 위) | guide §0 "화면 구성", handoff §5 목록·모바일 행 | 2 3 5 6 7 15 16 18 21 26 27 |
| `start/2-publish-model` 공개·초안과 게시의 차이 | 개요 → §0 표 그대로 → `::: tip` "저장·공개는 준비, 게시가 배포" → `## 배지 읽는 법` `DRIFT · N`{.warning} / `IN SYNC`{.normal} [3][4] | guide §0 | 3 4 |

### 공통 조작
| 페이지 | 구조 | 출처 | 컷 |
|---|---|---|---|
| `common/0-create` 새 게시물 만들기 | 개요 → `## 절차` 6단계(A 그대로) [6][8][14] → `## 입력을 빠뜨렸을 때` [24] → 생성 직후 화면 [15] → `::: warning` 슬러그 규칙 | 공통 A | 6 8 14 15 24 |
| `common/1-gallery` 갤러리 사진 넣기·순서·설명 | 개요(Showreel 제외, 1번 카드 = 대표) → `## 화면` [18] A 카드 B alt 입력 C ✕ → `## 절차` 5단계(B 그대로) → `::: tip` 키보드·휴대폰 정렬 | 공통 B, handoff §5 정렬·다중 업로드 | 18 |
| `common/2-edit` 수정하기 | 개요 → 4단계(C 그대로) [23] → `::: warning` 저장 전 새로고침 금지 | 공통 C, §4 표 | 23 |
| `common/3-visibility` 공개 / 초안 바꾸기 | 개요 → `## 화면` [16] → 절차 [17] → `::: info` 새 게시물은 초안으로 시작 | 공통 D | 16 17 |
| `common/4-publish` 사이트에 내보내기(게시) | 개요 → 4단계(E 그대로) [4][3][5] → `## 진행 확인` 실행 로그 ↗ → `::: warning` `TIMEOUT`{.error} 처리 | 공통 E, §3 "게시 후 바로 확인", §4 TIMEOUT 행 | 3 4 5 |
| `common/5-delete` 삭제하기 | 개요(잠깐 내리기 vs 완전 삭제) → `## 잠깐 내리기` → `## 완전히 지우기` [21][22] → `::: danger` 되돌릴 수 없음 | 공통 F | 21 22 |

### 카테고리별 등록 — 5페이지 공통 골격
```
# <카테고리> — <guide 소제목>
## 개요        필수·선택·갤러리 표(guide 그대로) + 1문장
## 화면        [폼 컷] → ### A. 공통 필드  ### B. <섹션 전용 필드>  (Film은 ### C. 영상 썸네일 [20])
## 등록        guide "등록" 번호 목록 그대로 (공통 A/B/E 는 링크)
## 수정·삭제   guide 2줄 그대로 + 링크
::: tip / warning   guide 인용 블록
```
| 페이지 | 전용 필드(B) | 컷 |
|---|---|---|
| `category/showreel` | 영상 URL + 미리보기 | 9 |
| `category/archives` | 도시·연도 라벨 | 10 |
| `category/film` | 영상 URL / C. 영상 썸네일(mp4·webm·mov ≤200 MB, 앞 10초, 고급 URL 입력) | 11 20 |
| `category/photography` | 클라이언트 | 12 |
| `category/personal` | (영상 URL 선택) + `## 영상 카드 넣기` **+ 영상** 모달 [19] | 13 19 |

### 나머지
| 페이지 | 구조 | 컷 |
|---|---|---|
| `scenarios/index` 운영 시나리오 | 개요 1문장 → `### 1.` ~ `### 5.` guide §3의 5개 항목 (제목 = 굵은 머리말, 본문 = 나머지) | 3 4 5 재사용 |
| `troubleshooting/index` 주의사항 및 문제 해결 | `## 하지 말아야 할 것` (guide 곳곳의 warning 모음: 저장 전 새로고침, 삭제 불가역, Showreel 갤러리 없음, Personal 외 + 영상 없음) → `## 증상별 해결` guide §4 표 그대로 → `## 없는 주소` [25] | 25 |
| `checklist/index` 게시 전 체크리스트 | guide §5 체크박스 그대로 + 각 항목에 관련 페이지 링크 | — |

**검증**: `npm run docs:build` 통과(VitePress는 dead link에서 빌드 실패하므로 `ignoreDeadLinks` 켜지 말 것). **이미지 파일이 없으면 Vite가 빌드를 실패시킨다**(`Could not resolve "./../img/N.webp"`, P2에서 확인) → P3 완료 전엔 `touch manual/docs/img/N.webp` 0바이트 플레이스홀더로 빌드를 통과시키고, P3가 실제 파일로 덮어쓴다. P3 검증에 `find … -size 0` = 0건을 포함할 것.

---

## 4. P3 — 스크린샷

핸드오프 §6이 레시피·촬영 목록(1~27)·재현 순서·원상복구를 이미 정의했다. 여기서는 **추가 결정**만 적는다.

1. **계정 표시명**: 어드민 헤더/대시보드에 이메일이 노출되는지 첫 컷에서 확인. 노출되면 임시 계정 이메일을 `qa-temp-…@…invalid` 대신 촬영용으로 읽기 좋은 값(예 `guide@214archives.invalid`)으로 만들고, 삭제 스크립트가 그 이메일을 지우도록 맞춘다. 실제 운영 계정으로는 촬영하지 않는다.
2. **뷰포트**: 데스크톱 1280×800 `scale: "css"`. 전체 페이지 컷(2·6·9~13·15)은 `fullPage: true`. 모바일 26·27은 375×760.
3. **변환**: 루트에 떨어진 png를 `cwebp -q 82 N.png -o manual/docs/img/N.webp` 로 변환 후 png 삭제. 목표 개당 ≤300 KB, 27장 합 ≤5 MB.
4. **다크 UI 대비**: `custom.css` 끝에 `.vp-doc img { border: 1px solid #e5e7eb; border-radius: 4px; }` 1규칙 추가 (ARMS 파일 대비 유일한 수정, 주석으로 표시).
5. **비밀값 점검**: 촬영 완료 후 27장을 훑어 토큰·URL 쿼리·실제 이메일이 없는지 확인. Cloudinary cloud name은 `NEXT_PUBLIC_`이라 노출 무방.
6. **원상복구 확인 쿼리**: `auth.users` 2 · `user_roles` 2 · `posts` 32, Cloudinary `214archives/admin/qa-temp-` prefix 0건, 루트 `*.png` 0, `scripts/_tmp-*` 0.

**검증**: `ls manual/docs/img | wc -l` = 27, `du -ch manual/docs/img/*.webp | tail -1` ≤ 5 MB, 6번 쿼리 모두 정상, `git status`에 루트 임시 파일 없음.

---

## 5. P4 — 번들 스크립트 설계

`manual/scripts/bundle-single-file.mjs` — Node ESM, 의존성 `cheerio`(DOM 조작, 정규식 금지). 입력 `dist/`, 출력 경로는 인자(`node scripts/bundle-single-file.mjs ../docs/admin-manual.html`).

### 5.1 알고리즘
```
1  sidebar = import('../docs/.vitepress/sidebar.mjs')  → routes[] (그룹 순서대로 평탄화)
2  slugOf(route) = route.replace(/^\//,'').replace(/\//g,'-')      // '/common/1-gallery' → 'common-1-gallery'
3  for route in routes:
     doc  = cheerio.load(read(`dist${route}.html`))
     body = doc('main.main .vp-doc > div')                          // 페이지 본문
     - h1~h6[id]            : id = `${slug}--${id}`
     - a.header-anchor      : href = `#${slug}--${old.slice(1)}`
     - a[href] 본문 내부 링크 : 빌드 결과는 **상대 경로** `./../common/1-gallery.html`(P1 리뷰에서 확인). `http(s)://`·`#`·`mailto:` 로 시작하지 않는 href 를 페이지 route 기준으로 절대화(`path.posix.resolve(dirname(route), href)`) → `.html` 제거 → `#page-${slugOf}` (+ `#h` 가 있으면 `#${slugOf}--h`)
     - img[src]             : dist 상대 경로 → `data:image/webp;base64,…` (svg는 image/svg+xml)
     sections.push(`<section class="page" id="page-${slug}"><div>${body.html()}</div></section>`)
4  shell = cheerio.load(read(`dist${routes[0]}.html`))
     - <link rel="stylesheet"> → 각 파일을 읽어 <style>로 인라인 (순서 유지)
     - <script type="module">, <link rel="modulepreload">, <link rel="preload" as="…"> 제거
     - <link rel="icon"> href → data URI (dist/favicon.ico)
     - .VPNavBarTitle img.logo src → data URI ; a.title href → '#'
     - .VPNavBarMenu a, .VPNavBarSearch, .VPLocalNav, .VPDocFooter, .VPDocAside 제거
     - .VPSidebar a[href]  → `#page-${slugOf(href)}` ; .VPSidebarItem.collapsed 클래스 제거
     - main.main .vp-doc > div  를 sections.join('\n') 으로 교체
     - </body> 앞에 스크롤 스파이 삽입 (핸드오프 §2.4-5 버전 — 클릭 시 즉시 활성화 포함. 데모 원본엔 클릭 핸들러가 없어 핸드오프 판이 상위 호환)
5  자체 검증 후 write:
     - 남은 <script>가 스파이 1개뿐, <link>는 icon 1개뿐
     - src/href 에 'http://' | 'https://' | '//' 로 시작하는 값 0 (VitePress 문서 링크 등 외부 a[href]는 허용 목록으로 예외)
     - section.page 수 = routes 수, img 수 = 기대치(27) 이상
     - 출력 바이트 ≤ 10 MB
     실패 시 exit 1 + 어느 규칙인지 출력
6  stdout: 페이지 수 · 이미지 수 · 바이트 수
```
`package.json` scripts: `"bundle": "vitepress build docs && node scripts/bundle-single-file.mjs ../docs/admin-manual.html"`.

### 5.2 구현 시 확인할 것 (빌드 결과를 보고 결정)
- `.vp-doc` 안쪽 래퍼가 `> div` 하나인지(VitePress 1.6.3 기본 테마는 `<div class="vp-doc _start_0-login"><div>…</div></div>`; 데모 구조와 같음). 다르면 셀렉터만 조정.
- `cleanUrls` 기본 false → 본문 링크가 `/common/1-gallery.html` 로 나오므로 3단계에서 `.html` 제거 처리.
- 로컬 검색 인덱스 JS는 `<script type="module">` 제거로 함께 사라짐. CSS에 남는 DocSearch 규칙은 무해(데모도 동일).

**검증** (Playwright MCP): `browser_navigate file:///…/docs/admin-manual.html` → `browser_network_requests` 결과가 파일 1건 → 사이드바 항목 클릭 → `browser_evaluate` 로 `.VPSidebarItem.is-active .text` 텍스트가 클릭한 항목과 일치 → `document.images.length` = 27+로고, 모두 `naturalWidth > 0` → 스크롤 후 활성 항목 변경. 마지막으로 `arms-demo-manual.html`과 나란히 열어 사이드바·본문 폭·배지·콜아웃 모양 대조.

---

## 6. P5 — 마감

1. `docs/admin-overview.md` §7 코드 구조에 `manual/` 1행, §12 다음 작업에서 매뉴얼 항목 제거·"빌드: `cd manual && npm run bundle`" 기재.
2. `wiki/log.md` 1줄, 필요 시 `wiki/codebase/` 에 manual 페이지(빌드 방법·번들 규칙·스크린샷 갱신 절차).
3. `npm run lint` 루트에서 에러 0 유지(경고 3 그대로).
4. `git status`: 추가된 것이 `manual/`(node_modules·cache·dist 제외), `docs/admin-manual.html`, 문서 갱신뿐인지 확인. `arms-demo-manual.html` 은 A3.
5. 커밋 단위 제안: ① `docs(manual): VitePress 스캐폴드 + 원고 17페이지` ② `docs(manual): 스크린샷 27장` ③ `feat(manual): 단일 파일 번들 스크립트 + admin-manual.html` ④ `docs: overview·wiki 갱신`. 커밋은 사용자 지시 후.

---

## 7. 리스크와 대응

| 리스크 | 대응 |
|---|---|
| 촬영 중 프로덕션 DB·Cloudinary에 잔여물 | 임시 게시물 1개만, 슬러그 `qa-temp-` prefix, 종료 시 §4-6 쿼리로 0 확인. **변경사항 게시**는 초안 복귀 후 무변경 실행만 |
| 스크린샷에 실계정·비밀값 노출 | 임시 계정만 사용, §4-5 육안 점검, `.env*` 값은 절대 화면에 띄우지 않음 |
| 번들 크기 초과 (데모 6.9 MB, 상한 10 MB) | webp q82, 개당 ≤300 KB. 초과 시 fullPage 컷 폭 1280 유지하고 q 75로 |
| VitePress DOM이 데모와 미세하게 다름 | 번들은 셀렉터 기반이므로 5.2에서 셀렉터만 맞춤. data-v 해시 차이는 무관 |
| 루트 Next 프로젝트 오염 (lockfile·lint) | `manual/` 독립 npm, eslint ignore, `.gitignore` 3줄 — P1에서 처리 |
| 원고가 guide와 어긋남 | P2 규칙 "문장 불변". 리뷰 시 guide 절 ↔ 페이지 매핑표(§3)로 대조 |
| 다른 세션 병렬 작업 충돌 | P2(원고)와 P3(이미지)는 파일 집합이 겹치지 않음. `custom.css` 1줄 추가는 P3 담당으로 고정 |

---

## 8. 사용자 확인 사항 (막히지 않으니 진행하면서 답 받기)
1. 브랜드 색 ARMS 파랑 유지(A1) vs 214 톤 — 기본 유지.
2. `docs/admin-manual.html` 커밋 여부(A-표 3행) — 기본 커밋 1개.
3. `arms-demo-manual.html` 완료 후 삭제 여부(A3).
4. 촬영을 프로덕션에서 해도 되는지(A2) — 로컬 `npm run dev`도 같은 DB라 잔여물 리스크는 동일.

---

## 9. 완료 기준 (핸드오프 §8 + 본 플랜 검증 항목)
- [ ] P1 `docs:dev` 사이드바 17항목 도달, 루트 lockfile 무변경
- [ ] P2 `docs:build` 통과, 17페이지가 §3 스펙과 일치, 문장은 `admin-guide.md`와 동일
- [ ] P3 `img/1..27.webp` 존재·합 ≤5 MB·비밀값 없음·원상복구 쿼리 정상
- [ ] P4 `docs/admin-manual.html` 외부 요청 0, 사이드바 이동·활성, 이미지 전부 표시, ≤10 MB, 데모와 나란히 비교 통과
- [ ] P5 overview·wiki 갱신, lint 에러 0, `git status` 깨끗
