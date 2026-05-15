# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 0. Wiki Context (Before & After)

이 프로젝트는 [`wiki/`](./wiki/) 에 영구 지식 베이스를 유지합니다. 운영 규칙은 [`wiki/CLAUDE.md`](./wiki/CLAUDE.md)를 따릅니다.

**작업 전:** [`wiki/index.md`](./wiki/index.md)를 먼저 훑어 관련 페이지(2–10개)를 읽고 컨텍스트를 파악합니다. 코드 작업이면 [`wiki/codebase/`](./wiki/codebase/) · [`wiki/decisions/`](./wiki/decisions/), 콘텐츠 작업이면 [`wiki/works/`](./wiki/works/) · [`wiki/clients/`](./wiki/clients/)를 우선 확인합니다.

**작업 후:** 변경된 사실·새로 알게 된 지식·결정이 있으면 wiki를 업데이트합니다 — 영향받는 페이지 갱신, 필요 시 신규 페이지 생성, [`wiki/index.md`](./wiki/index.md) · [`wiki/log.md`](./wiki/log.md)에 기록. trivial fix는 생략 가능. 세부 워크플로(ingest/query/lint)와 템플릿은 [`wiki/CLAUDE.md`](./wiki/CLAUDE.md) 참조.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.