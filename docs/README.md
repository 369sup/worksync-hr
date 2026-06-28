# worksync-hr 文件入口

## 文件目錄用途
| 目錄 | 用途 | 核心文件 | 狀態 |
| --- | --- | --- | --- |
| `00-project/` | 需求、詞彙、roadmap | `vision.md`、`requirements.md`、`glossary.md`、`roadmap.md` | Ready |
| `01-architecture/` | DDD、六邊形架構、bounded contexts、ADR | `overview.md`、`strategic-design.md`、`bounded-contexts.md`、`tactical-design.md`、`hexagonal-architecture.md`、`dependency-rule.md`、`advanced-patterns.md`、`adr/README.md` | Ready |
| `02-domain/` | Domain 規則、Aggregate、VO、事件 | `employee.md`、`attendance.md`、`leave.md`、`overtime.md`、`approval.md`、`payroll.md`、`audit-log.md` | Ready |
| `03-application/` | Use Case、ports、application contract | `use-cases.md`、`commands.md`、`queries.md`、`ports.md` | Ready |
| `04-infrastructure/` | Firebase、Firestore schema、rules、adapters | `firebase-overview.md`、`firestore-schema.md`、`firestore-rules.md`、`storage-rules.md`、`firebase-emulator.md` | Ready |
| `05-frontend/` | App Router 邊界、UI 規範 | `app-router.md`、`page-map.md`、`forms.md`、`shadcn-ui.md` | Ready |
| `06-devops/` | CI、部署、環境流程 | `local-setup.md`、`env-vars.md`、`deployment.md`、`github-actions.md` | Ready |
| `07-security/` | 角色、capability、audit、資料分類 | `roles-permissions.md`、`data-classification.md`、`audit.md` | Ready |
| `08-ai-copilot/` | Copilot 工作方式與提示 | `copilot-usage.md`、`prompt-patterns.md`、`mcp.md` | Ready |

## 架構閱讀順序
```txt
01-architecture/ddd-design-process.md
→ 01-architecture/overview.md
→ 01-architecture/strategic-design.md
→ 01-architecture/bounded-contexts.md
→ 01-architecture/tactical-design.md
→ 01-architecture/hexagonal-architecture.md
→ 01-architecture/dependency-rule.md
→ 01-architecture/advanced-patterns.md
→ 01-architecture/adr/README.md
→ 02-domain/*
→ 03-application/*
→ 04-infrastructure/*
→ 05-frontend/*
→ 06-devops/*
→ 07-security/*
→ 08-ai-copilot/*
```

## Mermaid-first 原則
- 先用 Mermaid 圖說清邊界、流程、依賴，再補短條列。
- 優先表格、短條列、命名規則，不寫長篇教科書。
- canonical doc 才是規則真相來源；避免把同一規則散落多份文件。

## ADR 使用原則
| 情境 | 動作 |
| --- | --- |
| 補流程圖、詞彙、命名規則、port 對照 | 直接改 canonical doc |
| 調整 bounded context 關係、重要部署策略、長期架構邊界 | 評估 ADR |
| UI slot 調整、範例補充、TODO 補註 | 直接改 canonical doc |
| 重大、耐久、難逆轉決策 | 新增或更新 ADR |

## 維護 TODO
| 項目 | 說明 |
| --- | --- |
| Rules automated tests | 目前以文件定義原則，實際 rules test case 尚待補齊 |
| Seed / fixture package | 目前先以文件定義建議結構，實際資料產生器待需求明確後補 |
| Deployment runbook | 目前保留策略比較與檢查點，正式上線前需補 smoke / rollback 細節 |
