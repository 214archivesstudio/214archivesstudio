# 214 Archives Studio

- **공개 사이트**: <https://www.214archives.com>
- **관리자**: <https://www.214archives.com/admin>

## 아키텍처

```
[작가] → /admin (Supabase Auth)
            ↓ 편집·업로드
        Supabase (Postgres + RLS) ──── 미디어 → Cloudinary
            ↓ "사이트에 반영" 클릭
        GitHub Actions (repository_dispatch)
            ↓ scripts/sync-from-supabase.ts
        data/*.ts 갱신 → main 커밋
            ↓
        Vercel 자동 빌드 → 공개 사이트 반영 (1–3분)
```

`published=true` 의도 플래그와 "사이트에 반영" 배포 액션을 분리해, 작가가 변경을 모아 한 번에 배포합니다 ([ADR-0001](wiki/decisions/0001-admin-architecture.md)).

## 스택

- **Next.js 16** App Router · React 19 · TypeScript · Tailwind 4
- **Supabase** Postgres + Auth + RLS (어드민 CMS)
- **Cloudinary** 이미지/영상 CDN (`next-cloudinary`)
- **GitHub Actions** 빌드 트리거 (`.github/workflows/publish.yml`)
- **Vercel** 호스팅 (자동 배포)

## 디렉토리

```
app/(public)/   공개 사이트 — archives · film · personal · photography · showreel · contact
app/admin/      관리자 UI — dashboard · posts · team · login
data/*.ts       빌드 타임 콘텐츠 (Supabase 동기화 산출물)
scripts/        seed-from-data.ts · sync-from-supabase.ts
supabase/       마이그레이션
wiki/           프로젝트 지식 베이스 (codebase · decisions · works)
docs/           운영 가이드 (admin-overview · admin-setup)
```

## 로컬 개발

```bash
npm install
cp .env.example .env.local   # Supabase/Cloudinary/GitHub PAT 채우기
npm run dev                   # http://localhost:3001
```

자세한 환경 변수와 셋업 단계는 [`docs/admin-setup.md`](docs/admin-setup.md) 참고.
