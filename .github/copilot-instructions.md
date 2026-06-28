# Copilot Instructions for worksync-hr

## Project overview
- `worksync-hr` 是 HR / attendance / leave / payroll 導向專案。
- 先查 `docs/README.md`、`docs/01-architecture/` 與 ADR，再動手修改。

## Tech stack
- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Firebase Auth / Firestore / Storage
- DDD + Hexagonal Architecture

## Build commands
| 用途 | 指令 |
| --- | --- |
| Lint | `pnpm lint` |
| Typecheck | `pnpm typecheck` |
| Build | `pnpm build` |

## DDD 設計流程
1. Strategic Design：確認 Subdomain、Bounded Context、Ubiquitous Language、Context Map。
2. Tactical Design：確認 Value Object、Entity、Aggregate Root、Domain Service、Domain Event、Factory、Repository。
3. Architecture：確認 Ports、Application Use Case、Driving Adapter、Driven Adapter。
4. Advanced Patterns：只有需求明確時才使用 DTO/VO、CQRS、Outbox、Event Sourcing。

## Hexagonal Architecture rules
- Domain 不可 import React、Next.js、Firebase SDK。
- Application layer 只負責 use case orchestration。
- Repository 在核心只定義介面；Firebase 實作留在 Infrastructure。
- UI / Route Handler / Server Action 都是 adapter，不可反向污染 Domain。

## Firebase boundary rules
- Firebase SDK 只允許出現在 Infrastructure 或明確 Firebase 邊界。
- Firestore document 不等於 Domain Entity。
- Firebase document 與 Domain entity 必須透過 mapper 轉換。
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。

## Next.js App Router rules
- 使用 Next.js App Router。
- 後台主應用區預設使用 Parallel Routes。
- 預設 Server Component。
- Client Component 只用於互動狀態、表單、瀏覽器 API。
- Dashboard、工作台、簽核、薪資、員工詳情、差勤檢查等多區塊頁面，優先使用 named slots。
- 每個 named slot 必須提供 `default.tsx`；`@modal/default.tsx` 通常回傳 `null`。
- 需要 modal deep link 時，可搭配 Intercepting Routes。
- 簡單 auth / public / one-off page 可使用普通 routes。
- Slot 不等於 Bounded Context；UI layout 不可決定 Domain model。

## Documentation rules
- 文件使用繁體中文。
- 優先使用 Mermaid、表格、短條列。
- 不要寫長篇教科書。
- 程式或架構邊界變更時，先同步 docs。

## ADR rules
- ADR 只記錄重大、耐久、難逆轉的架構決策。
- DDD 方法論、一般規範、範例流程不要塞進 ADR。

## Mermaid-first documentation rule
- 能用 Mermaid 圖說清邊界、流程、依賴時，優先畫圖。
- Mermaid code block 必須可在 GitHub Markdown 渲染。
