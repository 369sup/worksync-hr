# worksync-hr 文件入口

## 文件目錄用途
| 目錄 | 用途 |
| --- | --- |
| `00-project/` | 需求、詞彙、roadmap |
| `01-architecture/` | DDD、六邊形架構、bounded contexts、ADR |
| `02-domain/` | Domain 規則、Entity、Value Object、事件 |
| `03-application/` | Use case、ports、application contract |
| `04-infrastructure/` | Firebase、Firestore schema、rules、adapters |
| `05-frontend/` | App Router 邊界、UI 規範 |
| `06-devops/` | CI、部署、環境流程 |
| `07-security/` | 角色、capability、audit、資料分類 |
| `08-ai-copilot/` | Copilot 工作方式與提示 |

## DDD 文件閱讀順序
```txt
01-architecture/ddd-design-process.md
→ 01-architecture/strategic-design.md
→ 01-architecture/tactical-design.md
→ 01-architecture/hexagonal-architecture.md
→ 01-architecture/advanced-patterns.md
→ 02-domain/*
→ 03-application/*
→ 04-infrastructure/*
```

## Mermaid 圖優先原則
- 先用 Mermaid 圖說清邊界、依賴、流程，再補短條列。
- 圖、表格、規則放在擁有該決策的 canonical doc。
- 避免把 `docs/` 寫成長篇教科書。

## ADR 使用原則
- 只記錄重大、耐久、難逆轉的跨 Context 架構決策。
- 若只是名詞澄清、流程補充、圖更新，直接改既有文件。
- 新增 ADR 前，先確認 `01-architecture/` 是否已有 canonical doc 可承接。

## worksync-hr 核心 bounded contexts
| Context | 主要責任 |
| --- | --- |
| `Employee` | 員工主檔、membership、capability 真相來源 |
| `Attendance` | 出勤紀錄、工時收斂 |
| `Leave` | 請假申請與狀態流 |
| `Overtime` | 加班申請與核定結果 |
| `Approval` | approver、delegate、責任分派 |
| `Payroll` | 計薪期間、輸入收斂、薪資結果 |
| `Audit / Security` | 稽核事件、權限治理、敏感資料保護 |

## 維護提醒
- 變更語言、邊界、路由、權限、schema、rules 前，先更新文件。
- `src/**` 的命名、測試、DTO/mapper 應回頭對齊這些文件。
