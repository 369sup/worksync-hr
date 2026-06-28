# Ports

## 目的
- 定義核心依賴的抽象能力與命名規範。

## Port 分類
| 類型 | 命名規範 | 例子 |
| --- | --- | --- |
| Repository Port | `<Aggregate>NameRepository` | `LeaveRequestRepository` |
| Query Port | `<ReadModel>NameQueryPort` 或 `<Context><Snapshot>QueryPort` | `EmployeeProfileQueryPort` |
| Service Port | `<Capability>NamePort` | `AuditPort`, `ClockPort`, `TrustedActorContextPort` |

## 命名規則
- 以業務能力命名，不以 Firestore、HTTP、Next.js、page 命名。
- Repository Port 擁有 aggregate persistence 語意。
- Query Port 回傳 snapshot / summary / read model，不回傳 aggregate 可變狀態。
- Service Port 封裝時間、稽核、身份、匯出、檔案等外部能力。

## Use Case 與 Ports 對照
| Use case | Repository Port | Query Port | Service Port |
| --- | --- | --- | --- |
| `RecordPunch` | `AttendanceRecordRepository` | `EmployeeProfileQueryPort` | `ClockPort`, `AuditPort` |
| `SubmitLeaveRequest` | `LeaveRequestRepository` | `EmployeeProfileQueryPort`, `ApprovalQueryPort` | `AuditPort` |
| `ApproveLeaveRequest` | `LeaveRequestRepository` | `ApprovalQueryPort` | `AuditPort` |
| `SubmitOvertimeRequest` | `OvertimeRequestRepository` | `AttendanceSummaryQueryPort`, `ApprovalQueryPort` | `AuditPort` |
| `RunPayroll` | `PayrollRepository` | `AttendanceSummaryQueryPort`, `LeaveAdjustmentQueryPort`, `OvertimeAdjustmentQueryPort`, `EmployeePayrollSnapshotQueryPort` | `AuditPort`, `ClockPort` |

## 禁止事項
- 不要命名成 `FirestoreLeaveRepositoryPort`。
- 不要讓 port 泄漏 Firebase SDK 型別。
- 不要讓 UI 直接依賴 adapter concrete class。
