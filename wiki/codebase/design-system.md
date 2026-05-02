---
title: "Design System"
type: codebase
last_updated: "2026-05-02"
sources:
  - raw/기획서.md
  - raw/project-structure.md
---

# Design System

## 컬러

| 변수 | 값 | 용도 |
|---|---|---|
| `--color-background` | `#1A1A1A` | 전체 배경 |
| `--color-foreground` | `#FFFFFF` | 기본 텍스트 |
| `--color-accent` | `#CCCCCC` | 보조 텍스트, 구분선 |
| `--color-muted` | `#888888` | 비활성 텍스트, 메타 |
| `--color-overlay` | `rgba(0,0,0,0.6)` | 이미지 위 어두운 오버레이 (기획서는 0.4~0.6 권장) |

다크 톤 미니멀. 콘텐츠(이미지·영상)가 주인공.

## 타이포그래피

- **기본**: Pretendard Variable (CDN, `globals.css`)
- **Fallback chain**: Pretendard → Noto Sans KR → system-ui
- **제목**: Bold, 흰색
- **본문**: Regular, 흰색 또는 `#CCCCCC`
- **태그라인**: Light italic, `#CCCCCC` (예: "Every moment happens once. We archive it!")

## 브레이크포인트

| 이름 | px | 대상 |
|---|---|---|
| `sm` | 480 | 소형 모바일 |
| `md` | 768 | 태블릿 / 햄버거 메뉴 전환점 |
| `lg` | 1280 | 데스크톱 |
| `xl` | 1440 | 대형 데스크톱 |

`tailwind.config.ts`의 커스텀 값.

## 레이아웃 룰

| 페이지 | Desktop | Mobile |
|---|---|---|
| Showreel | 3열 그리드 | 세로 스크롤 |
| Archives 목록 | 3열 그리드 | 1열 세로 스크롤 |
| Archives 상세 | 4×3 그리드 (여백 없음) | 풀폭 세로 스크롤 |
| Photography 목록 | 가로 슬라이더 | 세로 스크롤 |
| Personal 목록 | 2열 그리드 | 1열 |
| Header navigation | 가로 메뉴 | 햄버거 → 풀스크린 메뉴 |

## 애니메이션 토큰

| 이름 | 동작 | 사용처 |
|---|---|---|
| `fade-in` | 아래→위 20px + 투명→불투명 (0.6s) | 범용 등장 |
| `fade-out` | 불투명→투명 (0.4s) | 퇴장 |
| `slide-up` | 아래→위 100% (0.5s) | 모달, 모바일 메뉴 |
| `logo-rise` | 아래→위 40px + 0.95→1 스케일 (1.2s) | 홈 인트로 ([[codebase/components#loading-animation]]) |
| 썸네일 hover | `scale(1.03)` + 오버레이 변화 + 배경 cross-fade | 모든 그리드 |
| 페이지 전환 | 부드러운 페이드 | Framer Motion `AnimatePresence` |

전환 시간은 0.4~1.2s 범위.

## 인터랙션 룰

- **호버 효과**: 썸네일 `scale(1.03)` + 배경 변화 (배경은 [[codebase/components#background-system]] 참고)
- **모바일 제스처**: 좌우 스와이프로 갤러리 탐색
- **풀스크린 뷰 (Lightbox)**: 좌/우 화살표 키 + ESC + 배경 클릭으로 닫기

## 톤 & 비주얼 컨셉

기획서 §1 인용: *"다크 톤 기반 미니멀 디자인, 시네마틱 영상미학적 분위기"*. 콘텐츠는 풀스크린 미디어 표현으로 몰입감 극대화.

## See also

- [[codebase/architecture]]
- [[codebase/components]]
