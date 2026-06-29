---
applyTo: "docs/**,.github/prompts/**,.github/skills/**,.github/agents/**"
---

# Documentation Instructions

- 文件使用繁體中文。
- 優先 Mermaid、表格、短條列。
- ADR 只記錄重大架構決策。
- DDD 方法論放在 docs，不要塞進 ADR。
- Mermaid code block 必須可在 GitHub Markdown 渲染。
- 路由文件預設說明 Next.js App Router + Parallel Routes；簡單 auth / public / one-off page 才回到普通 routes。
- 說明 slot 時要同步標示 `default.tsx`、slot 命名與 Intercepting Routes 等 fallback / deep link 規則。
- 文件必須明確區分 UI composition 與 DDD boundary；slot、route group、page 都不是 bounded context。
- 完整系統依五個 Phase 描述，不以 MVP 作為主要規劃語意。
- Context、Aggregate、Snapshot、Port、Use Case 名稱必須與 glossary 一致。
