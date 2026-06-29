---
applyTo: "src/domain/**,src/application/**,docs/01-architecture/**,docs/02-domain/**,docs/03-application/**"
---

# DDD / Hexagonal Architecture Instructions

- 先做 Strategic Design，再做 Tactical Design。
- Domain 不可依賴 React、Next.js、Firebase。
- Entity、Value Object、Aggregate Root 必須表達業務規則。
- Repository 在核心中只定義介面，不實作 Firebase。
- Application Use Case 只做流程編排。
- 跨 Context 協作前，先確認 Ubiquitous Language 與 Context Map。
- 所有 Aggregate、Port、Snapshot、Event 都必須維持可信任 tenant scope。
- 不預設 generic repository、generic workflow、CQRS、Event Sourcing 或 Outbox。

## Parallel Routes 與 DDD 邊界

- Parallel Routes 是 UI composition，不是 DDD boundary。
- Slot 不等於 Bounded Context。
- Route group 不等於 Subdomain。
- Page 不等於 Use Case。
- UI layout 不可決定 Domain model；Domain、Application、Infrastructure 仍依 DDD + Hexagonal 分層。
