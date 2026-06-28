# 詞彙表

## 目的
- 統一 worksync-hr 的 Ubiquitous Language，避免同一概念出現第二套命名。

## 圖解
| Term | 定義 |
| --- | --- |
| `Employee` | 員工主檔與任職身分的核心對象 |
| `Membership` | 使用者在組織中的角色、capability 與啟用狀態 |
| `AttendanceRecord` | 某員工某工作日的出勤紀錄 |
| `LeaveRequest` | 一張請假申請單 |
| `OvertimeRequest` | 一張加班申請單 |
| `ApprovalAssignment` | 某流程目前應由誰審批的責任解析 |
| `PayrollPeriod` | 一次計薪期間與其輸入收斂邊界 |
| `AuditRecord` | 一筆不可任意覆寫的稽核事件 |
| `ActorContext` | server-side 建立的可信任 actor、scope、capability 資訊 |

## 規則
- 英文名詞優先對齊 entity、use case、port 名稱。
- `role`、`capability`、`approval`、`payroll`、`audit` 這類敏感語意不可由 Client 自報。
- 新增 bounded context 或公開契約前，先補這份詞彙表。

## 範例
- `RunPayroll` 表示啟動計薪流程；`PayrollPeriod` 表示資料與規則的邊界，不是 UI 頁名。

## 維護注意事項
- 若同一名詞在不同文件出現不同意義，先回來修正此文件與對應 canonical docs。
