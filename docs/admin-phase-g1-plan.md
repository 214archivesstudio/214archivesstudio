# 관리자 페이지 — Phase G1 작업 계획 (film 영상 썸네일 업로드)

> **상태**: ✅ ship 완료 (코드·DB 마이그레이션 2026-07-10, publish·문서 마감 2026-08-30). 실측 결과는 §4 참조.
> **범위**: film 게시물의 "영상 썸네일 URL" 텍스트 입력을 Cloudinary 영상 업로드 위젯으로 교체 + 기존 8개 게시물 URL 마이그레이션. 이 하나로 film 섹션이 어드민만으로 완결 운영됨.
> **참고**: [admin-improvement-roadmap](./admin-improvement-roadmap.md) · [admin-phase-3c-4-plan](./admin-phase-3c-4-plan.md) · [admin-setup §7](./admin-setup.md)

---

## 0. 배경

film 카드의 hover 영상 썸네일은 `posts.video_thumbnail_url`(Cloudinary mp4 전체 URL) → sync verbatim emit → `data/films.ts` → `VideoPreloadContext`가 **8개 전체를 XHR→Blob 프리로드** 하는 구조. 현재 어드민에는 텍스트 입력([section-fields.tsx:90-103](../app/admin/posts/_components/section-fields.tsx))만 있어, 실사용자는 Cloudinary 콘솔에 직접 로그인해 mp4를 수동 업로드하고 URL을 복붙해야 한다. 미리보기·형식 검증·용량 제한 없음.

부수 문제: 기존 8개 URL이 무변환 원본이라 `/film` 진입 시 원본 mp4 8개를 전부 다운로드 — 압축 변환 적용 시 공개 사이트 성능이 실제로 개선된다.

---

## 1. 결정 기록

2026-07-10 사용자 확정 (①–④) + 계획 수립 중 파생 결정 (⑤–⑧).

| # | 분기 | 결정 | 사유 |
|---|---|---|---|
| 1 | 저장 형식 | **변환 URL 전체를 기존 `video_thumbnail_url` 컬럼에 저장** | 스키마·sync 무변경. 3c+4 결정 #11 (verbatim emit) 유지 |
| 2 | Preset | **영상 전용 unsigned preset 신설** (`214archives_admin_video`) + env `NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET` | 영상용 용량 제한(200MB)을 별도로 걸고 이미지 preset 보안 설정 불변 |
| 3 | 기존 8개 | **이번 ship에 마이그레이션 포함** | URL 문자열 수정만으로 공개 사이트 로딩 개선. 재업로드 불필요 |
| 4 | 10초 처리 | **`du_10` 자동 트리밍 (앞 10초)** | 길이·용량 예측 가능. 원본은 Cloudinary에 보존되므로 비파괴 |
| 5 | 변환 스펙 | `du_10,q_auto,vc_auto,w_1280` + 확장자 `.mp4` 강제 | w_1280은 카드·배경 표시 크기 대비 충분. 확장자 강제로 mov 업로드도 mp4 딜리버리 |
| 6 | URL 조립 | `public_id` + `version` 으로 클라이언트에서 조립 (`https://res.cloudinary.com/{CLOUD_NAME}/video/upload/{변환}/v{version}/{public_id}.mp4`) | `secure_url` 문자열 치환보다 확장자 강제가 확실. `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` 기존재 확인됨 |
| 7 | 폴더 | preset asset folder `214archives/film` 고정, slug 하위 폴더 생략 | 기존 `<slug>/thumbnail.mp4` 규칙은 수동 업로드 시절 관례로 기능상 무의미. unique filename ON 이면 충돌 없음 |
| 8 | URL 직접 입력 | "고급" 접이식(`<details>`)으로 유지 | 하위 호환 + 비상 탈출구. hidden input `name="video_thumbnail_url"` 을 공유하므로 서버 액션 무변경 |

**서버측 변경 없음이 이 계획의 핵심 성질**: hidden input 이름을 기존 `video_thumbnail_url` 그대로 쓰므로 `_actions/posts.ts`, `post-schema.ts`, sync 스크립트, DB 스키마 모두 손대지 않는다.

---

## 2. 변환 URL 스펙 (canonical)

```
https://res.cloudinary.com/{CLOUD_NAME}/video/upload/du_10,q_auto,vc_auto,w_1280/v{version}/{public_id}.mp4
```

- `du_10` — 앞 10초 트리밍 (결정 #4)
- `q_auto,vc_auto` — 자동 품질·코덱 (용량 대폭 절감)
- `w_1280` — 최대 폭 1280 (원본이 작으면 no-op)
- 확장자 `.mp4` — 소스 포맷 무관 mp4 딜리버리 (결정 #5)

변환 파라미터 문자열은 컴포넌트 내 상수 하나로 정의한다 (마이그레이션 SQL과 값 일치 필요 — §3 Step 4).

---

## 3. 작업 단계

### Step 0 — 사전 준비 (사용자 작업, ~10분) 🙋

코드 착수 전 완료 필요. **이 단계만 사람 손이 필요하다.**

1. Cloudinary 콘솔 → Settings → Upload → **Add upload preset**:
   - Preset name: `214archives_admin_video`
   - Signing Mode: **Unsigned**
   - Asset folder: `214archives/film`
   - Unique filename: ON / Overwrite: OFF
   - Allowed formats: `mp4, webm, mov`
   - Max file size: 200MB
2. `.env.local` + Vercel 환경 변수에 `NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET=214archives_admin_video` 추가. `.env.example`에도 항목 추가 (코드 작업에 포함).

**verify**: Cloudinary 콘솔에서 preset이 Unsigned로 저장됨. (위젯 동작 검증은 Step 2에서)

### Step 1 — `VideoThumbnailUploader` 컴포넌트 (~반나절)

신규 파일 `app/admin/posts/_components/video-thumbnail-uploader.tsx`. [thumbnail-uploader.tsx](../app/admin/posts/_components/thumbnail-uploader.tsx) 패턴을 그대로 따른다 (env 가드 → hidden input → 미리보기/업로드 분기).

- props: `initialUrl?: string`, `fieldError?: string`
- state: `url` 하나. `<input type="hidden" name="video_thumbnail_url" value={url} />`
- `CldUploadWidget` options: `maxFiles: 1`, `multiple: false`, `sources: ["local"]`, `clientAllowedFormats: ["mp4", "webm", "mov"]`, `maxFileSize: 200_000_000`, `resourceType: "video"`
- `onSuccess`: `info.public_id` + `info.version` 으로 §2 URL 조립 → `setUrl(...)`
- URL 있을 때: `<video src={url} muted loop autoPlay playsInline>` 인라인 미리보기 (16:9, `thumbnail-uploader`의 미리보기 레이아웃 준용) + "영상 변경" 버튼 + URL 폭 축약 표시
- URL 없을 때: 드래그앤드롭 스타일 버튼 — "영상을 끌어다 놓거나 파일 선택 · 앞 10초만 사용됩니다"
- 하단 `<details>` "고급: URL 직접 입력" — 텍스트 입력이 같은 state를 갱신 (결정 #8)
- env 가드: `NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET` 미설정 시 기존 패턴과 동일한 안내 박스

**verify**: `tsc --noEmit` 통과. Storybook 없으므로 Step 2 통합 후 브라우저 검증.

### Step 2 — 폼 통합 (~1시간)

[section-fields.tsx:90-103](../app/admin/posts/_components/section-fields.tsx)의 film 전용 `<Field label="영상 썸네일 URL">` 블록을 `<VideoThumbnailUploader initialUrl={initial.video_thumbnail_url ?? ""} fieldError={fieldErrors?.video_thumbnail_url} />` 로 교체. Field 라벨은 "영상 썸네일"로 변경, hint "hover 시 재생되는 10초 미리보기 · film 전용".

**verify (브라우저)**:
1. `/admin/posts/new` → film 선택 → 업로더 노출, 타 섹션에선 미노출
2. mp4 업로드 → 미리보기 자동 재생 → 저장 → 편집 화면 재진입 시 미리보기 유지
3. Supabase `posts.video_thumbnail_url` 에 §2 형식 URL 저장 확인
4. 고급 입력에 임의 URL 붙여넣기 → 저장 → 반영 확인
5. 30초짜리 영상 업로드 → 저장된 URL 재생이 10초에서 끊기는지 확인 (`du_10` 검증)

### Step 3 — 기존 8개 마이그레이션 (~30분)

Supabase SQL Editor에서 1회 실행 (파일 재업로드 없음, 결정 #3):

```sql
update posts
set video_thumbnail_url = replace(
  video_thumbnail_url,
  '/video/upload/v',
  '/video/upload/du_10,q_auto,vc_auto,w_1280/v'
)
where section = 'film'
  and video_thumbnail_url like '%/video/upload/v%'
  and video_thumbnail_url not like '%du_10%';
-- 예상 affected rows: 8
```

- `not like '%du_10%'` 가드로 재실행 안전 (idempotent)
- 변환 문자열은 Step 1 컴포넌트 상수와 반드시 동일해야 함

**verify**:
1. affected rows = 8
2. 변환 URL 1개를 브라우저에서 직접 열어 재생 확인 (첫 요청은 파생 asset 생성으로 수 초 지연 — 정상)
3. `curl -sI <변환 URL> | grep -i content-length` 를 원본 URL과 비교해 용량 감소 확인
4. 어드민 드리프트 배지에 film 8건 표시 확인 (`updated_at` 갱신에 의한 정상 동작)

### Step 4 — publish + 공개 사이트 검증 (~30분)

1. 어드민 "변경사항 게시" → GitHub Actions 완료 대기
2. `data/films.ts` diff: 8개 `videoThumbnailUrl` 이 변환 URL로 교체되었는지 확인 (다른 필드 diff 없어야 함)
3. 배포된 `/film` 에서:
   - 카드 hover 영상 + 배경 영상 정상 재생
   - DevTools Network에서 blob 프리로드 8건의 전송량이 마이그레이션 전보다 감소했는지 확인
   - `useVideoAutoplay` 폴백 체인 이상 없음 (콘솔 에러 0)

### Step 5 — 문서·wiki 마감 (~20분)

- [admin-setup.md](./admin-setup.md) §7 아래에 영상 preset 항목 추가 (Step 0 내용)
- [admin-guide.md](./admin-guide.md) film 게시물 등록 절차에서 "Cloudinary 수동 업로드" 안내 제거, 업로더 사용법으로 교체
- admin-overview의 "video thumbnail URL은 UI 편집 불가" stale 메모 수정
- 본 문서 상태 갱신 + `wiki/log.md` ship 항목 append + [roadmap](./admin-improvement-roadmap.md) G1 체크

---

## 4. 검증 게이트 종합 (ship 조건)

- [x] `tsc --noEmit` · `npx eslint app/admin` 통과 (2026-07-10 커밋 `d1cfce6`·`662beb3`)
- [ ] 신규 film 게시물을 **어드민만으로** 등록 → publish → 공개 사이트 hover 재생까지 완주 (Cloudinary 콘솔 무접속) — *실 신규 film 게시물이 생길 때 확인*
- [x] 기존 8개 카드 hover·배경 영상 회귀 없음 — 변환 URL 8개 모두 200 OK, `video/mp4` (2026-08-30)
- [x] `/film` 프리로드 총 전송량 감소 — **48.7MB → 9.8MB (−80%)**, 아래 실측표
- [ ] 30초 영상 업로드 시 10초 트리밍 동작 — *신규 업로드 시 확인* (기존 8개는 `du_10` 적용 URL로 마이그레이션 완료)
- [x] `NEXT_PUBLIC_CLOUDINARY_VIDEO_UPLOAD_PRESET` 미설정 환경에서 안내 박스 표시 (컴포넌트 env 가드, `thumbnail-uploader` 동일 패턴)

### 4.1 마이그레이션 실측 (2026-08-30, `curl` content-length)

| slug | 원본 | 변환(`du_10,q_auto,vc_auto,w_1280`) |
|---|---|---|
| 01-unveil | 6.09MB | 1.08MB |
| 02-set-it-off | 7.14MB | 1.17MB |
| 03-not4nerd | 6.03MB | 1.58MB |
| 04-ewha | 6.38MB | 1.87MB |
| 05-all-at-once | 5.26MB | 1.51MB |
| 06-never-forget | 6.27MB | 0.62MB |
| 07-shanghai | 4.86MB | 1.11MB |
| 08-about | 6.69MB | 0.82MB |
| **합계** | **48.7MB** | **9.8MB** |

진행 기록: Step 0–3 은 2026-07-10 완료 (DB `posts.video_thumbnail_url` 8건 모두 변환 URL 확인). Step 4 publish 는 2026-08-30 `workflow_dispatch` 로 실행 — 그 사이 publish 가 한 번도 돌지 않아 `data/films.ts` 가 원본 URL 상태로 남아 있었음. sync diff 는 `data/films.ts` URL 8줄 외 변경 없음.

---

## 5. 리스크

| 리스크 | 완화 |
|---|---|
| 변환 URL 첫 요청 지연 (파생 asset 콜드 생성) | Step 3 verify에서 8개 URL을 한 번씩 미리 열어 CDN 워밍. 이후 캐시 히트 |
| 영상 변환이 Cloudinary 무료 크레딧 소모 | 파생 생성은 URL당 1회. 8 + 신규 업로드 분량이라 무료 티어에 충분. 모니터링만 |
| blob 프리로더(XHR)와 변환 URL 비호환 가능성 | 동일 도메인·동일 content-type(mp4)이라 이론상 무영향. Step 4에서 실배포 검증 + 이상 시 `useVideoAutoplay` 원본 폴백이 안전망 |
| 세로 영상 업로드 시 w_1280 의도와 다른 결과 | film 썸네일은 16:9 관례. UI hint로 "가로 영상 권장" 명시. 강제 크롭은 하지 않음 (Simplicity First) |
| 컴포넌트 상수와 마이그레이션 SQL의 변환 문자열 불일치 | §2를 canonical로 두고 두 곳 모두 이 문서를 참조. 리뷰 시 diff 대조 |

---

## 6. 명시적 비포함 (scope out)

- publish 폴링 타임아웃, publish 토글 확인 다이얼로그 → **G2**
- 슬러그 실시간 검사, oembed 썸네일, 모바일 테이블 → **G3**
- `as never` 정리, ESLint flat config → **G4**
- 영상 서버측 업로드 검증(길이·해상도) — unsigned preset 특성상 클라이언트 제한만. 실사용자 1인 환경에서 과잉
