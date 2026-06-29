# Queries 與 Read Models

## 規則
- Query 名稱使用 `Get`、`List`、`Search`、`Resolve`，並明示 self／team／tenant scope。
- Query Port 回傳 Snapshot、Summary 或 Read Model，不回傳 Aggregate 或 Firestore document。
- Read Model 可以扁平化以服務 UI／報表，但不能執行 command rule。
- 敏感欄位依 `ActorContext` 遮罩；敏感讀取與匯出必須 audit。

## Published Language Queries
| Query | Output | Owner |
| --- | --- | --- |
| `GetEmployeeSnapshot` | `EmployeeSnapshot` | Employee |
| `GetOrganizationMembershipSnapshot` | `OrganizationMembershipSnapshot` | Organization |
| `GetWorkScheduleSnapshot` | `WorkScheduleSnapshot` | Schedule |
| `ResolveApprovalAssignment` | `ApprovalAssignmentResult` | Approval |
| `ListApprovedLeaveSummaries` | `ApprovedLeaveSummary[]` | Leave |
| `GetFinalizedAttendanceSummary` | `FinalizedAttendanceSummary` | Attendance |
| `ListOvertimeAdjustments` | `OvertimeAdjustment[]` | Overtime |

## UI／報表 Read Models
| Read Model | 用途 |
| --- | --- |
| `EmployeeDirectoryItem` | tenant 內員工列表，隱藏敏感個資 |
| `AttendanceCalendarView` | 個人／團隊工作日、打卡與異常摘要 |
| `ApprovalQueueItem` | 目前 actor 有責任處理的目標摘要 |
| `LeaveBalanceSummary` | 員工各假別可用、已用與效期 |
| `PayrollResultSummary` | 期間覆核與 totals |
| `SalarySlipView` | 已發布 PayrollResult 的員工檢視 |
| `AuditRecordView` | 遮罩後的稽核查詢結果 |
