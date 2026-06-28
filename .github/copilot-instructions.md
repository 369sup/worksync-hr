# Copilot Instructions for worksync-hr

本專案使用 Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Firebase，以及 DDD + Hexagonal Architecture。

## DDD 設計流程

Copilot 在新增功能前，必須先確認該功能屬於哪個階段：

1. Strategic Design：確認 Subdomain、Bounded Context、Ubiquitous Language、Context Map。
2. Tactical Design：確認 Value Object、Entity、Aggregate Root、Domain Service、Domain Event、Factory、Repository。
3. Architecture：確認 Ports、Application Use Case、Driving Adapter、Driven Adapter。
4. Advanced Patterns：只有在需求明確時才使用 DTO/VO 區隔、CQRS、Outbox、Event Sourcing。

## 強制架構規則

- Domain layer 不可 import React。
- Domain layer 不可 import Next.js。
- Domain layer 不可 import Firebase SDK。
- Domain layer 不可依賴 Firestore document shape。
- Application layer 只負責 use case orchestration。
- Application layer 只依賴 ports。
- Infrastructure layer 實作 Firebase adapters。
- UI layer 使用 Next.js App Router、Server Actions、Route Handlers、shadcn/ui。
- Firebase document 與 Domain entity 必須透過 mapper 轉換。
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。

## Next.js Routing

- 預設使用一般 App Router routes、route groups、layouts、pages。
- 不要預設使用 Parallel Routes。
- 只有 dashboard split view、多 panel loading/error、或多 slot 狀態明確需要時才使用 Parallel Routes。
- 使用 Parallel Routes 時，必須補上 `default.tsx`。

## 文件規則

- 文件使用繁體中文。
- 優先使用 Mermaid 圖、表格、短條列。
- 不要寫長篇教科書。
- ADR 只記錄重大架構決策。
