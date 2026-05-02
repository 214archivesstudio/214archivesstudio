# Raw Sources

이 디렉토리의 파일은 **immutable**입니다. LLM은 읽기만 하고 절대 수정하지 않습니다.

원본은 프로젝트 루트에 있고, 여기 있는 것은 wiki ingest 시점의 스냅샷 복사본입니다.
원본이 갱신되면 이 디렉토리에 새 버전을 복사하고, 갱신을 [[../log]]에 기록합니다.

## 등록된 source

| 파일 | 원본 위치 | 등록일 | 설명 |
|---|---|---|---|
| `기획서.md` | `/214Archives_기획서.md` | 2026-05-02 | 2025-02-10 작성 기획서. 사이트맵·페이지 사양·디자인·기술·SEO·성능 목표. |
| `project-structure.md` | `/project-structure.md` | 2026-05-02 | 코드 구조, 라우트 맵, 컴포넌트 의존성 그래프. |
| `portfolio-posts.csv` | `/portfolio-posts - portfolio-posts.csv` | 2026-05-02 | 30개 작품 메타데이터 (slug, title, date, Cloudinary publicId, 영상 URL). |

## 미등록 후보

- `홈페이지 UI PDF.pdf` (20MB, 프로젝트 루트) — UI 디자인 참고. 이미지 ingest 시 추가 검토.
- 작품의 실제 사진/영상 — Cloudinary에 호스트됨. 비주얼 ingest를 하려면 별도 워크플로 필요.
