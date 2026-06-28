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
