---
title: "Admin Manual"
type: codebase
last_updated: "2026-08-31"
sources:
  - docs/admin-manual-implementation-plan.md
  - docs/handoff-admin-manual.md
  - manual/scripts/bundle-single-file.mjs
---

# Admin Manual

## Summary

어드민(`/admin`) 사용법을 다루는 오프라인 사용자 매뉴얼. `manual/`에서 VitePress 1.6.3으로 원고·스크린샷을 관리하고, `bundle-single-file.mjs`가 빌드 결과를 이미지까지 전부 인라인한 단일 HTML(`docs/admin-manual.html`, 17페이지·27장·약 2 MB, 외부 요청 0)로 묶는다. 다른 프로젝트(AutoLink)의 데모 `arms-demo-manual.html`과 같은 형식(테마·페이지 배치·번들 방식)을 목표로 재현했다.

## 어디에 무엇이 있는가

- `manual/docs/**` — VitePress 원고(마크다운) + 리소스. 시작하기(3) · 공통 조작(6) · 카테고리별 등록(5) · 운영 시나리오(1) · 주의사항 및 문제 해결(1) · 게시 전 체크리스트(1) = 17페이지.
- `manual/docs/.vitepress/sidebar.mjs` — **라우트의 단일 출처**. `{ text, items: [{ text, link }] }[]` 형태로, `config.mts`의 `themeConfig.sidebar`와 `bundle-single-file.mjs`가 이 파일을 그대로 import해 공유한다. 페이지를 추가·이름 변경할 때 여기 한 곳만 고치면 사이드바와 번들 양쪽에 반영된다.
- `manual/docs/.vitepress/theme/custom.css` — ARMS(AutoLink) 원본 그대로 복사 + 파일 끝에 1규칙만 추가: `.vp-doc img { border: 1px solid #e5e7eb; border-radius: 4px; }`. 어드민이 다크 UI라 라이트 테마 매뉴얼 안에서 스크린샷 경계를 명확히 하기 위함이며, 데모 대비 유일한 수정이다.
- `manual/docs/img/N.webp` — 스크린샷. 페이지별이 아니라 **전역 순번** 1~27. `cwebp -q 82`로 변환, 개당 ≤300 KB 목표.
- `manual/scripts/bundle-single-file.mjs` — 빌드 산출물(`dist/`)을 단일 HTML로 합치는 Node ESM 스크립트. 의존성은 `cheerio`(DOM 조작, 정규식 금지).

## 빌드

```
cd manual && npm run bundle
```

내부적으로 `vitepress build docs` → `node scripts/bundle-single-file.mjs ../docs/admin-manual.html` 순서로 실행된다(`manual/package.json`). `config.mts`의 `outDir`는 `../dist`인데, VitePress는 이 경로를 **docs 루트(`manual/docs/`) 기준**으로 해석하므로 실제 결과물은 `manual/dist/`에 생긴다 — 리포 루트 기준으로 착각하기 쉬운 지점.

## 미리보기

```
cd manual && npm run docs:dev
```

`http://localhost:5173`, 사이드바 17항목 클릭 시 200을 확인한다.

## 페이지 추가·이름 변경

1. `manual/docs/.vitepress/sidebar.mjs`에 `{ text, link }` 항목을 추가·수정한다.
2. 그 `link`에 대응하는 `.md` 파일을 `manual/docs/` 아래 만든다.
3. 본문에서 스크린샷을 쓰면 `../img/N.webp`(다음 전역 번호) 형태로 참조한다. **이미지 파일이 실제로 없으면 Vite가 빌드를 실패시킨다**(`Could not resolve "./../img/N.webp"`, Vite asset resolution). 스크린샷이 아직 없으면 0바이트 플레이스홀더로 빌드만 통과시키고, 나중에 실제 파일로 덮어쓴다.
4. `npm run docs:build`로 dead link 0, 이미지 해석 성공을 확인한다.

## 스크린샷 재촬영

절차 전체는 [`docs/handoff-admin-manual.md`](../../docs/handoff-admin-manual.md) §6(Playwright MCP 호출 레시피·촬영 목록·재현 순서·원상복구)을 따른다. 요지: 프로덕션에서 쓸 임시 admin 계정(예 `guide@214archives.invalid`)을 생성 → `/admin`에서 Playwright로 촬영 → 끝나면 계정·게시물·Cloudinary 임시 자산을 삭제한다.

실전에서 확인된 두 가지 함정(§6 문서에는 아직 반영 안 됨):
- **Cloudinary 임시 자산 이름**: `qa-temp-` prefix로 지우려 하면 안 된다 — 실제로는 `214archives/admin/` 아래 업로드한 파일 자체의 원본 파일명으로 올라간다. 삭제 전에 실제 public_id를 확인할 것.
- **YouTube 미리보기 iframe이 헤드리스 Chromium에서 검게 나옴**: Cloudinary 위젯 같은 교차 출처 iframe을 한 번이라도 연 이후에야 정상 페인트되고, 그 뒤 스크롤하면 다시 까맣게 된다. 긴(tall) 뷰포트로 `scrollY 0` 상태에서 촬영할 것.

## 번들러 불변식 (`bundle-single-file.mjs`)

- 라우트마다 `<section class="page" id="page-<slug>">` 1개(`slug = route.replace(/^\//,'').replace(/\//g,'-')`, 예: `/common/1-gallery` → `common-1-gallery`).
- 페이지 내부 헤딩 id는 `<slug>--<원래id>`로 재작성(`h1~h6[id]`, `a.header-anchor`). 페이지 간 상대 링크는 `#page-<slug>`(+ 해시가 있으면 `#<slug>--<hash>`)로 절대화한다.
- 이미지·파비콘·로고는 전부 `data:` URI로 인라인(webp/svg/ico/woff2).
- 자체 검증(`selfCheck`)을 통과해야 파일을 쓴다: `<script>` 정확히 1개(스크롤 스파이), `<link>` 정확히 1개(파비콘), `src`/`href`에 `http(s)://`나 `//`로 시작하는 값 0개, `section.page` 개수 = 라우트 개수, `img` 개수 ≥ 27, 출력 바이트 ≤ 10 MB. 하나라도 실패하면 어느 규칙인지 stderr에 찍고 `exit 1`.

## 단일 파일이 의도적으로 안 하는 것

- 로컬 검색 — VitePress 런타임 JS를 통째로 제거하므로 동작 불가(데모도 동일).
- 우측 목차(outline)·이전/다음 페이지 링크 — `config.mts`에서 처음부터 꺼둔다(번들 안에서는 어차피 무의미).
- PDF 내보내기, 다크 모드, editor 역할 설명, 팀 화면 — 애초에 범위 밖.

## Files

- [manual/docs/.vitepress/config.mts](../../manual/docs/.vitepress/config.mts) — 사이트 설정, ARMS 대비 변경점만
- [manual/docs/.vitepress/sidebar.mjs](../../manual/docs/.vitepress/sidebar.mjs) — 라우트 단일 출처
- [manual/docs/.vitepress/theme/custom.css](../../manual/docs/.vitepress/theme/custom.css) — ARMS 테마 + 이미지 테두리 1규칙
- [manual/scripts/bundle-single-file.mjs](../../manual/scripts/bundle-single-file.mjs) — 단일 HTML 번들러
- [docs/admin-manual.html](../../docs/admin-manual.html) — 산출물 (오프라인, 17페이지, 27이미지)
- [docs/admin-manual-implementation-plan.md](../../docs/admin-manual-implementation-plan.md) — 구현 플랜 (P1–P5)
- [docs/handoff-admin-manual.md](../../docs/handoff-admin-manual.md) — 형식 분석 + 촬영 레시피

## See also

- [[decisions/0001-admin-architecture]]
- [[codebase/architecture]]
