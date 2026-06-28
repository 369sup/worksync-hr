# worksync-hr Copilot 指引

本專案以 DDD、Hexagonal Architecture、文件先行與最小必要複雜度為原則。先確認邊界、事實與驗證 gate，再提出或實作變更。

## 開始工作

1. 先從 `docs/README.md` 找到本次變更的 canonical docs。
2. 先讀實際程式、設定與 workflow，區分 facts、assumptions、constraints。
3. `docs/` 是規範來源；Mermaid、表格與規則要與擁有該決策的文件放在同一處。
4. 若變更會影響語言、邊界、路由、權限、Firestore schema 或 rules，先更新文件再更新程式。

## 架構邊界

```text
Inbound Adapter -> Application -> Domain
Outbound Adapter -> core-owned Port
Firebase / external services -> Outbound Adapter
```

- `Domain` 只放 entity、value object、domain service、domain rule，不依賴 React、Next.js、Firebase SDK。
- `Application` 只負責 use case orchestration、交易邊界、授權入口與 port 協調。
- `Infrastructure` 才能實作 Firebase adapter、外部整合、document mapper 與 DTO 轉換。
- `UI` 使用 App Router、Server Actions、Route Handlers、shadcn/ui；不得直接成為業務真相來源。

## 文件與決策

- `docs/00-project/` 管需求、詞彙與 roadmap。
- `docs/01-architecture/` 管 bounded contexts、dependency rule、六邊形架構與 ADR。
- `docs/02-domain/` 與 `docs/03-application/` 只保留核心規則、use case 與 port 契約，不展開框架細節。
- `docs/04-infrastructure/` 擁有 Firebase、Firestore schema、rules 與 adapter 邊界。
- `docs/07-security/` 擁有角色、capability、audit 與 data classification。
- 只有必要、耐久、難逆轉的跨 Context 決策才新增 ADR。

## 開發限制

- Auth provider 只證明 identity；角色、capability、敏感寫入權限必須由 server-side trusted actor context 提供。
- Firebase document 與 Domain entity 必須透過 mapper 轉換，不可互相充當。
- Payroll、permissions、audit 與其他敏感資料不得由 Client Component 直接寫入。
- 不預建 generic repository、shared business service 或未被當前需求證明需要的 abstraction。

## 驗證

- 使用 repo 現有的 `pnpm lint`、`pnpm typecheck`、`pnpm build` gate。
- 只有實際執行且成功的命令可以宣稱通過；既有失敗需與本次變更分開回報。
- 若 build 受外部字型或網路限制影響，也要明確記錄為環境限制，不把它當成已解決。
