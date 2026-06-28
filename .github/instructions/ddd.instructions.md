---
applyTo: "src/domain/**,src/application/**,docs/01-architecture/**,docs/02-domain/**"
---
# DDD + Hexagonal 指令

## Domain
- 先對齊 `docs/00-project/glossary.md`、`docs/01-architecture/bounded-contexts.md` 與對應的 `docs/02-domain/*.md`。
- Entity 要有明確識別、生命週期與 invariant；狀態只能由具業務語意的行為改變。
- Value Object 以不可變與值相等為前提。
- Domain Service 只放跨 entity 規則，不放框架、HTTP、Firebase、React、Next.js。
- `src/domain/**` 不可 import React、Next.js、Firebase SDK，也不可接受 client 自報角色、權限或敏感欄位作為真相。

## Application
- Use case 只負責 orchestration、權限檢查入口、transaction boundary、port 協調。
- Repository、query、clock、id generator、event publisher 以 port 抽象表示。
- Actor、membership、capability 等可信任資訊必須由 adapter / port 提供，不接受 Client 自報角色或 scope。
- `src/application/**` 不可直接依賴 Firebase SDK、UI component、Route Handler 或 App Router。
- 不在 Use Case 複製 Domain 規則；跨 Context 只依已定案契約協作。

## 文件
- 架構文件優先用 Mermaid、表格、短條列。
- Domain 文件只記錄核心 entity、value object、規則、狀態圖與已公開契約。
- 語言、邊界、dependency rule、port 契約變更時，先更新 canonical docs 再改程式。
