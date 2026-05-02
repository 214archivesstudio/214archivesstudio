# 214 Archives Studio — Wiki

이 디렉토리는 **214 Archives Studio**에 대한 살아있는 지식 베이스입니다.
[Andrej Karpathy의 LLM Wiki 패턴](../llm-wiki.md)을 따라, LLM이 점진적으로 구축·유지하는 영구 합성물입니다.

## 어떻게 쓰는가

- **읽기**: 어디부터 시작할지 모르겠으면 [overview.md](./overview.md), 그다음 [index.md](./index.md).
- **새 source 추가**: `wiki/raw/`에 파일을 떨어뜨리고 LLM에게 "ingest 해줘"라고 합니다.
- **질문하기**: 그냥 LLM에게 물어봅니다 — wiki를 먼저 읽고 합성해서 답합니다.
- **점검**: "wiki 점검 해줘" → 모순·고아 페이지·누락된 연결을 찾아줍니다.

## 두 트랙

이 wiki는 두 도메인을 함께 다룹니다:

1. **`codebase/`** — Next.js 사이트 자체에 대한 지식 (아키텍처, 컴포넌트, 컨벤션)
2. **`works/` + `clients/` + `timeline/`** — 사이트에 담긴 사진·영상 작업물에 대한 지식

두 트랙은 독립적으로 발전하지만 cross-reference로 연결됩니다.

## 운영 규칙은?

LLM을 위한 운영 규칙은 [CLAUDE.md](./CLAUDE.md)에 있습니다. 페이지 템플릿, 명명 규칙, ingest/query/lint 워크플로가 정의되어 있습니다. 도메인이 바뀌면 LLM과 함께 업데이트하세요.

## Tip

- Obsidian으로 이 디렉토리를 vault로 열면 graph view, `[[wiki-link]]`, dataview가 모두 작동합니다.
- 검색은 ripgrep(`rg`)이 충분합니다. 규모가 커지면 [qmd](https://github.com/tobi/qmd) 같은 로컬 검색을 추가할 수 있습니다.
