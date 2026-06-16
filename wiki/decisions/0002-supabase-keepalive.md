---
title: "Supabase 무료 플랜 정지 방지: GitHub Actions keep-alive cron"
type: decision
status: Accepted
date: "2026-06-16"
deciders: [mindong]
---

# ADR-0002: Supabase 무료 플랜 정지 방지 — GitHub Actions keep-alive cron

## Context

[ADR-0001](./0001-admin-architecture.md)의 build-time sync 아키텍처에서는 공개 사이트가 정적(`data/*.ts` → Vercel)이라 **방문자 트래픽이 Supabase를 전혀 건드리지 않습니다**. DB에 접근하는 주체는 어드민 패널과 publish job뿐입니다. 이는 ADR-0001 §Consequences의 Positive("Supabase가 다운돼도 공개 사이트 멀쩡")로 의도된 성질이지만, 운영 중 그 이면의 비용이 드러났습니다:

> **2026-06-16 — Supabase 프로젝트 "214archivesstudio's Project"가 일시정지됨.**
> Supabase 무료 플랜은 7일간 활동이 없으면 프로젝트를 paused 상태로 전환합니다. 스튜디오가 7일 넘게 어드민 로그인·발행을 하지 않자 DB로 가는 요청이 0이 되어 정지됐습니다.

정지의 영향:
- 데이터·백업·스토리지는 안전. 대시보드에서 **80일 이내(2026-09-04까지) 수동 resume** 가능. 이후엔 resume 불가(데이터 다운로드만 가능).
- 공개 사이트는 정적이라 **방문자에겐 영향 없음**. 막히는 것은 어드민 편집·발행뿐.

요구사항:
- 어드민을 며칠 안 써도 DB가 정지되지 않아야 함 (hands-off).
- 새 자격증명·인프라 비용 없이.
- keep-alive 자체가 조용히 죽으면 알아챌 수 있어야 함 (silent failure 방지).

## Decision

**GitHub Actions cron으로 매일 Supabase REST에 가벼운 쿼리를 1회 보내 활동을 발생시킵니다.** 워크플로: [.github/workflows/keepalive.yml](../../.github/workflows/keepalive.yml).

```
매일 04:23 UTC (13:23 KST)
  → curl GET $SUPABASE_URL/rest/v1/posts?select=id&limit=1
      (apikey + Authorization: service_role)
  → 실제 Postgres 쿼리 실행 = "활동"으로 집계 → 7일 정지 타이머 리셋
  → HTTP != 200 이면 exit 1 → GitHub 실패 알림 메일 (= 무료 모니터링)
주 1회 (ISO 주차 변경 시)
  → .github/keepalive-heartbeat.txt 갱신 + commit + push
      (GitHub의 "60일 무커밋 → 스케줄 자동비활성" 방지)
```

### 핵심 설계 결정

| 분기 | 결정 | 근거 |
|---|---|---|
| 방식 | GitHub Actions cron | Supabase secret(`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY`)이 publish 워크플로용으로 **이미 등록**됨. UptimeRobot은 DB를 치는 공개 엔드포인트가 없어(정적 사이트) 키 노출 또는 신규 `/api/health` 라우트가 필요 → 더 많은 일·노출 |
| 빈도 | 매일 (오프피크 04:23 UTC) | GH 스케줄러는 부하 시 지연·누락 가능. 7일 한계에 daily면 1회 누락돼도 6일 여유. 정시(:00) 회피 |
| ping 대상 | `posts?select=id&limit=1`, service_role 키 | `id`는 확정 컬럼. service_role은 RLS 우회 → 200 확정. 실제 Postgres 쿼리 실행 보장 |
| 실패 가시성 | 비-200 시 `exit 1` | GitHub 기본 실패 알림 메일을 무료 모니터로 활용 |
| GH 60일 자동비활성 | 주 1회 heartbeat 커밋 | dormant 기간에도 레포 활동 발생 → 스케줄 유지. 파일에 ISO 주차 기록 → `git diff --quiet`로 주당 1커밋만 자연 발생, 히스토리 소음 최소화. `[skip ci]`로 다른 워크플로 미트리거 |

### 전제 (실행 순서)

1. **먼저 대시보드에서 프로젝트 resume** — 정지된 프로젝트엔 핑이 닿지 않음. resume 전 실행 시 첫 run이 실패 메일로 떨어짐.
2. resume 직후 Actions 탭 → "Supabase Keep-Alive" → Run workflow로 1회 수동 검증 (HTTP 200 확인). 이것이 "REST 핑이 실제로 활동으로 집계되는가"의 첫 검증.

## Consequences

### Positive
- **hands-off 정지 방지**: 어드민 미사용 기간에도 DB가 살아있음. 운영비 0원 유지(curl 1회 = Actions 무료 한도 내 무시할 비용).
- **무료 모니터링**: keep-alive가 키 회전·테이블 변경·정지로 깨지면 GitHub 실패 메일로 조기 경보.
- **dormancy 내성**: heartbeat 커밋이 GH의 60일 스케줄 자동비활성까지 막아, 스튜디오가 수개월 손을 떼도 자동 유지.

### Negative
- **"REST 핑 = 활동" 100% 보장 아님**: 실제 Postgres 쿼리를 실행하는 요청이라 일반적으로 집계되고 널리 검증된 방식이나, Supabase의 pause 판정 내부 정책에 의존. 어긋날 경우 daily 마진 + 실패 메일로 조기 발견하도록 설계.
- **봇 커밋 추가**: `main`에 주 1회 keepalive 봇 커밋이 쌓임(publish 봇과 동일 패턴이라 일관). `git log` 소음 약간.
- **service_role 키를 keep-alive에도 사용**: anon 키로도 keep-alive는 가능하나, 200 확정·정책 단순화를 위해 기존 secret 재사용. 노출면은 늘지 않음(Actions secret 내부 유지).

### Neutral / 따라오는 일
- `.github/keepalive-heartbeat.txt`가 레포에 새로 생김(주차 1줄, 덮어쓰기라 비대화 없음).
- 근본 해법(업그레이드)을 원하면 Supabase Pro($25/mo)로 정지 자체가 사라짐 — 현 단계에선 무료 유지가 비용 대비 합리적이라 보류.

## Alternatives considered

### UptimeRobot 등 외부 모니터로 URL 핑
**거부 이유**: 공개 사이트가 정적이라 사이트를 핑해도 호스트만 깨우고 DB는 안 깨움. DB를 치려면 (a) Supabase REST URL에 API 키를 monitor 설정에 박거나 (b) DB를 쿼리하는 신규 `/api/health` 라우트 필요 → cron보다 일·노출 큼.

### Supabase pg_cron / Edge Function 내부 cron
**거부 이유**: 정지된 프로젝트의 내부 cron은 돌지 않으므로 자기참조적(정지 예방용으로 부적합). 외부 트리거가 본질적으로 필요.

### Supabase Pro 업그레이드
**거부 이유(현 단계)**: $25/mo. 정지 자체를 없애는 근본책이지만, 30개 작품·어드민 1-2명 규모에서 keep-alive로 무료 유지가 합리적. 트래픽·기능이 커지면 재검토.

### 핑 빈도를 7일 1회로 (원안 제안)
**거부 이유**: GH 스케줄러 누락 1회면 7일 한계 초과 위험. daily로 마진 확보(누락돼도 6일).

## See also

- [[decisions/0001-admin-architecture]] — 공개 사이트가 DB를 안 건드리는 build-time sync 구조(정지의 근본 원인)
- [[codebase/architecture]]
- [.github/workflows/keepalive.yml](../../.github/workflows/keepalive.yml)
- [.github/workflows/publish.yml](../../.github/workflows/publish.yml) — secret을 공유하는 기존 워크플로
