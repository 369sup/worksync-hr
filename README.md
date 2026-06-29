# worksync-hr

> 多租戶 1HR 員工、組織、差勤、請假、加班與薪資系統藍圖。

## 專案定位
- 員工主檔、組織任職、權限、班別排班、差勤、請假、加班、簽核、薪資、稽核與通知。
- 以五個 Phase 漸進交付完整系統；完整範圍不代表一次完成。
- 以 DDD + Hexagonal Architecture 保護核心規則與敏感資料邊界。
- 前端使用 Next.js App Router，後端邊界以 Server Actions / Route Handlers 串接 Application Use Case。

## 技術棧
| 類別 | 技術 |
| --- | --- |
| Frontend | Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui |
| Backend boundary | Server Actions、Route Handlers |
| Firebase | Firebase Auth、Firestore、Storage |
| Architecture | DDD + Hexagonal Architecture |

## 本地開發指令
```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm build
```

## 文件入口
- 文件總入口：[`docs/README.md`](docs/README.md)
- Copilot / 文件規則：[`.github/copilot-instructions.md`](.github/copilot-instructions.md)

## 架構閱讀順序
```txt
docs/README.md
→ docs/01-architecture/ddd-design-process.md
→ docs/01-architecture/overview.md
→ docs/01-architecture/strategic-design.md
→ docs/01-architecture/bounded-contexts.md
→ docs/01-architecture/tactical-design.md
→ docs/01-architecture/hexagonal-architecture.md
→ docs/01-architecture/dependency-rule.md
→ docs/01-architecture/advanced-patterns.md
→ docs/01-architecture/adr/README.md
→ docs/02-domain/*
→ docs/03-application/*
→ docs/04-infrastructure/*
→ docs/05-frontend/*
→ docs/06-devops/*
→ docs/07-security/*
→ docs/08-ai-copilot/*
```

## 開發前注意事項
- 先讀 `docs/README.md`、`docs/01-architecture/`、ADR，再判斷修改位置。
- 先確認 bounded contexts、Ubiquitous Language、ports，再動手改 `src/**`。
- UI route、page、slot 只是 composition，不是 bounded context、subdomain、use case。
- 若只是補充規則、圖、流程，優先更新 canonical doc，不要濫增 ADR。

## 安全提醒
- 薪資、權限、稽核資料不可由 Client Component 直接寫入。
- Firebase document 不等於 Domain Entity，必須透過 mapper 轉換。
- Firebase Auth 只證明 identity；角色、membership、capability 真相必須由 server-side trusted actor context 建立。
- 所有資料與公開契約都由可信任 `TenantId` 隔離；Client 不得自報 tenant。
- Payroll 不包含銀行實際撥薪、報稅、保險申報或會計總帳。

## 主要文件地圖
| 目錄 | 用途 |
| --- | --- |
| `docs/00-project/` | 需求、願景、詞彙、roadmap |
| `docs/01-architecture/` | DDD、六邊形架構、dependency rule、ADR |
| `docs/02-domain/` | 各 bounded context 的責任、狀態機、事件 |
| `docs/03-application/` | Use Case、Command / Query、Ports |
| `docs/04-infrastructure/` | Firebase、schema、rules、emulator |
| `docs/05-frontend/` | App Router、forms、page map、shadcn/ui |
| `docs/06-devops/` | local setup、env、CI、部署 |
| `docs/07-security/` | 角色權限、資料分級、audit |
| `docs/08-ai-copilot/` | Copilot 工作流、提示模式、MCP |
