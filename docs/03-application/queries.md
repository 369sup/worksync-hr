# Queries

## 目的
- 定義查詢命名、讀模型責任與敏感資料回傳規則。

## 命名規範
| 規則 | 說明 |
| --- | --- |
| 動詞以 `Get` / `List` / `Search` / `Resolve` 開頭 | `GetEmployeeProfile`, `ListPendingApprovals` |
| 以 read model 命名 | 不用 `FetchFirestoreLeaveDocs` |
| 明示 scope | `ListTeamLeaveRequests`, `GetSelfAttendanceSummary` |
| 敏感查詢明確標示 | `GetPayrollDetail`, `ExportAuditLogsPreview` |

## Query 分流
| 類型 | 說明 | 範例 |
| --- | --- | --- |
| Self view | 員工只看自己 | `GetSelfLeaveHistory` |
| Team view | 主管看授權範圍 | `ListPendingApprovals` |
| Admin / HR view | 敏感細節檢視 | `GetPayrollRunDetail` |
| Projection / report | 聚合多 Context read model | `GetDashboardSummary` |

## 回傳規則
- 預設回傳最小必要欄位。
- 敏感欄位需由 actor capability 決定是否解遮罩。
- Query 可以為 UI 最佳化，但不可反向定義 Domain rule。
