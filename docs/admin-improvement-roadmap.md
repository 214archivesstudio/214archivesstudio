# 관리자 페이지 — 개선 로드맵 (Phase G1–G4)

> **상태**: G1 ✅ (2026-08-30, [admin-phase-g1-plan](./admin-phase-g1-plan.md)) · G2 ✅ (2026-08-30, 아래 §1 G2 메모) · G3–G4 착수 전.
> **범위**: 기존 어드민(Phase 3c+4 ship 완료본)의 사용성 개선. 신규 기능이 아니라 실사용 마찰 제거가 목적.
> **참고**: [admin-phase-3c-4-plan](./admin-phase-3c-4-plan.md) · [admin-overview](./admin-overview.md) · [ADR-0001](../wiki/decisions/0001-admin-architecture.md)

---

## 0. 배경 — 2026-07-10 사용성 감사 요약

어드민 전 화면·전 액션을 감사한 결과, **가짜 버튼이나 mock 데이터는 없음**. 게시 흐름(GitHub Actions dispatch), Cloudinary 업로드, admin/editor 권한 분리 모두 실제 동작. 남은 문제는 세 갈래:

1. **실사용 최대 마찰**: film 영상 썸네일이 어드민에서 관리 불가에 가까움 — 텍스트 URL 입력만 있어 Cloudinary 콘솔 수동 업로드 + URL 복붙 필요 (`section-fields.tsx:90-103`)
2. **작동하지만 깨지기 쉬움**: publish 폴링 무한 대기, publish 토글 무확인, triggered_by 이메일 항상 null
3. **불친절한 표현**: "GH ↗"·"Supabase RLS" 등 기술 용어 노출, 한/영 혼용("공개 상태" vs "Draft"), 색상만으로 상태 표시하는 StatusDot

### film 영상 썸네일 현행 구조 (G1의 전제 지식)

- 원본: Cloudinary `214archives/film/<slug>/thumbnail.mp4` (8개 모두 수동 업로드된 상태)
- DB: `posts.video_thumbnail_url` (film 전용, `00001_initial_schema.sql:104`)
- sync: `scripts/sync-from-supabase.ts:192` 가 verbatim emit → `data/films.ts`
- 렌더링: `/film` 진입 시 `VideoPreloadContext` 가 **8개 mp4 원본 전체를 XHR→Blob 으로 다운로드** 후 `VideoThumbnail`(`<video autoPlay muted loop>`)과 hover 배경(`useHoverBackgroundVideo` → `BackgroundLayer`)에 사용
- 본편 영상(`video_url` → YouTube/Vimeo iframe)과는 별개 필드

---

## 1. Phase 목록

### Phase G1 — film 영상 썸네일 업로드 ✅ (ship 2026-08-30)

텍스트 URL 입력을 Cloudinary 영상 업로드 위젯으로 교체. **투자 대비 효과 최대** — 이거 하나로 film 섹션이 어드민만으로 완결 운영됨.

| # | 작업 | 대상 파일 | 비고 |
|---|---|---|---|
| G1-1 | `VideoThumbnailUploader` 컴포넌트 신설 | `app/admin/posts/_components/` 신규 | `thumbnail-uploader.tsx` 의 CldUploadWidget 패턴 재사용. `resourceType: "video"`, `clientAllowedFormats: ["mp4","webm","mov"]`, `maxFileSize` 제한, 폴더 `214archives/film/` |
| G1-2 | 업로드 결과를 변환 URL 로 저장 | 동일 + `_actions/posts.ts` 스키마 | `.../video/upload/du_10,q_auto,vc_auto,w_1280/<public_id>.mp4` — `du_10` 으로 10초 트리밍 강제, `q_auto,vc_auto` 로 압축 |
| G1-3 | 폼 내 인라인 미리보기 | G1-1 컴포넌트 내 | `<video muted loop autoPlay playsInline>` 로 업로드 즉시 확인 |
| G1-4 | URL 직접 입력은 "고급" 접이식으로 유지 | `section-fields.tsx:90-103` | 하위 호환. 기존 8개 게시물 URL 보존 |
| G1-5 | (선택) 기존 8개 URL 마이그레이션 | Supabase 데이터 | 기존 URL 에 `du_10,q_auto,vc_auto,w_1280` 변환 프리픽스 삽입. `/film` 초기 로딩이 8개 원본 blob 다운로드라 **실제 공개 사이트 성능 개선** |

**검증**: film 게시물 편집 → mp4 업로드 → 미리보기 재생 확인 → publish → sync 후 `data/films.ts` 에 변환 URL 반영 → `/film` 카드·hover 배경 재생 확인.

### Phase G2 — 실수 방지·신뢰성 ✅ (ship 2026-08-30)

| # | 작업 | 대상 파일 |
|---|---|---|
| G2-1 | publish 폴링 타임아웃 (예: 10분) + 초과 시 failed 표시·재시도 버튼 | `publish-panel.tsx:51-68` |
| G2-2 | 공개→초안 전환 확인 다이얼로그 | `publish-toggle.tsx` (기존 `delete-dialog.tsx` 재사용) |
| G2-3 | "Draft"→"초안" 등 한/영 표기 통일 | `publish-toggle.tsx:40,90` 외 |
| G2-4 | StatusDot 텍스트 라벨 + aria-label | `_components/ui/StatusDot.tsx` |

**검증**: GitHub Actions secret 을 일부러 비운 상태에서 publish → 10분 후 failed 전환 확인. 공개 토글 시 다이얼로그 노출 확인.

*구현 메모 (2026-08-30)*: G2-1 타임아웃은 페이지 마운트가 아니라 job `created_at` 기준 10분. 초과 시 `markJobTimedOut` 서버 액션으로 **DB 도 `failed` 로 기록** — UI 상태만 바꾸면 stuck `running` 행이 다음 로드에서 `findActiveJobId` 에 다시 잡혀 버튼이 영구 비활성화되기 때문 (위 리스크 표의 "UI 상태일 뿐" 메모는 이 결정으로 대체). G2-2 는 `DeleteDialog` 에 `confirmLabel/pendingLabel/confirmVariant` 옵션을 추가해 재사용. G2-3 은 상태 표기를 **공개 / 초안** 으로 통일 (Draft·게시됨·공개됨 정리) — 대문자 Pill(`DRIFT`, `SUCCESS`)·`GH ↗` 는 G4-4 범위로 유지. G2-4 는 `StatusDot` 에 `label` prop (라벨 미지정 시 `role="img"` + `aria-label`).

### Phase G3 — 편집 경험 (~2일)

| # | 작업 | 대상 파일 |
|---|---|---|
| G3-1 | 슬러그 중복 debounce 실시간 검사 | `post-form.tsx:102-115` + 서버 액션 신규 |
| G3-2 | video 미디어 카드 oembed 썸네일 (YouTube `img.youtube.com/vi/<id>/mqdefault.jpg` — API 키 불필요) | `media/MediaCard.tsx` |
| G3-3 | 영상 URL 입력 시 즉시 임베드 미리보기 | `section-fields.tsx` |
| G3-4 | 게시물 테이블 모바일 카드 레이아웃 | `posts-table.tsx:47-50` |

**검증**: 중복 슬러그 입력 시 제출 전 경고. 모바일 뷰포트(375px)에서 목록 판독 가능.

### Phase G4 — 기술 부채·표현 정리 (여유 시)

| # | 작업 | 비고 |
|---|---|---|
| G4-1 | `supabase gen types` 도입 → `as never` 캐스트 제거 | ADR-0001 Open Q. 서버 액션 전반 ~10곳 |
| G4-2 | ESLint flat config 복구 (`next lint`) | 기존 문서화된 TODO |
| G4-3 | publish_jobs 이메일 enrichment 또는 해당 열 제거 | `lib/repos/publish-jobs.ts:29-33` — 항상 null 인 상태 해소 |
| G4-4 | 기술 용어 정리: "GH ↗", "Supabase RLS", drift 첫 게시 전 문구 | `jobs-card.tsx` · `team/page.tsx:51` · `drift-badge.tsx` |

**검증**: `npm run lint` 통과, `tsc --noEmit` 통과, 어드민 전 화면에서 구현 세부 용어 미노출.

*명시적 보류 유지*: preview mode, 팀 초대 UI, 비밀번호 재설정 — 2인 이상 운영 전까지 착수하지 않음 (ADR-0001 결정 존중).

---

## 2. 실행 순서 — 순차인가 병렬인가

**결론: 완전 순차도, 완전 병렬도 아님.** G1∥G2 는 병렬 가능, G3 는 G1 뒤, G4 는 마지막 단독.

### 파일 충돌 기준 의존성

```
G1 (film 썸네일)  ─┐
                   ├─ 병렬 가능 (겹치는 파일 없음)
G2 (신뢰성)       ─┘
        │
G3 (편집 경험) ← G1 완료 후 권장
        │          이유: G3-1·G3-3 이 G1 과 같은 폼 영역
        │               (post-form.tsx / section-fields.tsx) 수정
        ▼
G4 (기술 부채) ← 마지막 단독 권장
                   이유: G4-1 타입 재생성이 서버 액션 전반을
                        건드려 G1~G3 어느 것과도 충돌 가능
```

| 조합 | 병렬 가능? | 근거 |
|---|---|---|
| G1 ∥ G2 | ✅ | G1 은 폼/미디어 영역, G2 는 publish 패널·토글·StatusDot — 파일 집합 서로소 |
| G1 ∥ G3 | ⚠️ 부분 | G3-2(MediaCard)·G3-4(posts-table) 는 독립이라 병렬 가능. G3-1·G3-3 은 G1 과 같은 파일(`section-fields.tsx`, `post-form.tsx`) — 충돌 |
| G2 ∥ G3 | ✅ | 파일 집합 서로소 |
| G4 ∥ 아무거나 | ❌ | G4-1 이 `types/database.ts` 재생성 + 서버 액션 광범위 수정. 격리된 단독 커밋이어야 리뷰·롤백 가능 |

### 권장 시나리오

- **1인 순차 진행 시**: G1 → G2 → G3 → G4. 가치 순서와 의존 순서가 일치하므로 그대로 진행하면 됨.
- **병렬 진행 시 (에이전트/브랜치 분리)**: wave 1 = G1 + G2 + (G3-2, G3-4) 세 lane 동시 → wave 2 = G3-1 + G3-3 → wave 3 = G4. 이론상 3 wave 로 압축.
- 어느 쪽이든 **각 Phase 는 독립 커밋/ship** 으로 유지 (Phase 3c+4 때의 ship 단위 원칙과 동일).

---

## 3. 리스크

| 리스크 | 완화 |
|---|---|
| G1-2 변환 URL 이 기존 blob 프리로더와 비호환 가능성 (CORS, content-type) | 변환 URL 도 동일 Cloudinary 도메인이라 CORS 동일. 배포 전 `/film` 에서 blob 폴백 체인(`useVideoAutoplay`) 동작 확인 |
| G1-5 마이그레이션 후 기존 카드 화질 저하 | `w_1280` 는 현 카드·배경 표시 크기 대비 충분. 우려 시 `w_1600` 로 상향 |
| G2-1 타임아웃이 정상 장기 빌드를 failed 로 오표시 | 현행 빌드 실측 2–3분. 10분 여유면 오탐 없음. failed 표시는 UI 상태일 뿐 job 레코드는 GitHub 이 최종 갱신 |
| G4-1 타입 재생성이 숨은 타입 오류 대량 노출 | 예상된 비용. `tsc --noEmit` 를 게이트로, 별도 ship |
