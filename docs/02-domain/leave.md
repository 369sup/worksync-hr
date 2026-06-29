# Leave Domain

## 責任範圍
- 請假申請、額度消耗、送審、核准、駁回、取消。
- 對外提供 approved leave result / period summary。

## 不負責的事項
- approver 真相來源。
- 出勤原始 punch。
- 薪資發放。

## Aggregate / Entity / Value Object
| 類型 | 模型 |
| --- | --- |
| Aggregate | `LeaveRequest`, `LeaveBalanceLedger` |
| Entity | `LeaveDecisionRecord`, `LeaveBalanceEntry` |
| Value Object | `LeaveType`, `LeavePeriod`, `LeaveStatus`, `LeaveReason` |

## 主要狀態機
```mermaid
stateDiagram-v2
  [*] --> Draft
  Draft --> PendingApproval: SubmitLeaveRequest
  PendingApproval --> Approved: ApproveLeaveRequest
  PendingApproval --> Rejected: RejectLeaveRequest
  PendingApproval --> Cancelled: CancelLeaveRequest
  Approved --> CancelledAfterApproval: CancelApprovedLeave
  Rejected --> [*]
  Cancelled --> [*]
  CancelledAfterApproval --> [*]
```

## Domain Events
- `LeaveRequestSubmitted`
- `LeaveRequestApproved`
- `LeaveRequestRejected`
- `LeaveRequestCancelled`
- `LeaveBalanceConsumed`
- `LeaveOverrideApplied`
- `CompensatoryLeaveGranted`

## 與其他 Context 的協作
| 對象 | 協作方式 |
| --- | --- |
| `Employee` | 取得身份、部門、主管與額度 scope |
| `Approval` | 解析 approver 與指派責任 |
| `Attendance` | 輸出 `ApprovedLeaveSummary` 供出勤套用 |
| `Payroll` | 輸出 `ApprovedLeaveSummary` |
| `Overtime` | 冪等接收 `CompensatoryLeaveGrant`，更新 `LeaveBalanceLedger` |
| `Audit` | 透過 `AuditPort` 或事件記錄 override、理由、敏感查閱 |

## 公開契約
- `ApprovedLeaveSummary`：只公開 Approved 申請，不包含敏感 reason。
- `CompensatoryLeaveGrant`：依 `eventId` 冪等接收；不得直接 import `OvertimeRequest`。
