# 戰術設計 Tactical Design

## 基本規則
- Entity 以 identity 判斷同一性；Value Object 不可變且以值判斷相等。
- Aggregate 是 transaction consistency boundary，只能由 Aggregate Root 對外變更。
- Repository Port 一個 Aggregate Root 一個，不建立 generic repository。
- 每個 Aggregate、Snapshot、Domain Event 都包含或可推導可信任 `TenantId`。

## 模型速查
| Context | Aggregate Root | Entity / Value Object |
| --- | --- | --- |
| Employee | `Employee` | `EmployeeId`, `EmployeeStatus`, `PersonalProfile` |
| Organization | `OrganizationUnit`, `Membership` | `Role`, `Capability`, `EmploymentPeriod`, `ReportingLine` |
| Schedule | `Shift`, `WorkSchedule` | `WorkDay`, `ShiftTimeRange`, `ScheduleVersion` |
| Attendance | `AttendanceRecord` | `Punch`, `AttendanceException`, `WorkDate`, `CorrectionReason` |
| Leave | `LeaveType`, `LeaveRequest`, `LeaveBalance` | `LeavePeriod`, `LeaveBalanceEntry`, `LeaveUnit` |
| Overtime | `OvertimeRequest` | `CompensationMode`, `OvertimePeriod`, `CompensationDecision` |
| Approval | `ApprovalAssignment` | `Approver`, `Delegate`, `ApprovalTargetRef`, `DelegateWindow` |
| Payroll | `PayrollPeriod`, `PayrollResult` | `PayrollInput`, `PayrollAdjustment`, `PayrollLine`, `Money` |
| Audit | `AuditRecord` | `AuditAction`, `AuditResult`, `TargetRef` |
| Notification | `NotificationDelivery` | `Recipient`, `NotificationChannel`, `DeliveryAttempt` |

Payroll 的 Repository Ports 為 `PayrollPeriodRepository`、`PayrollResultRepository`；凍結輸入版本使用 `PayrollInputVersion`。

## 跨 Aggregate 規則
- 同 Context 不同 Aggregate 以 ID 參照，Application Use Case 負責編排。
- 跨 Context 只傳 Snapshot、Summary 或 versioned event，不傳 Entity reference。
- 需要同一 Firestore transaction 的敏感業務寫入與 Audit fact，由 infrastructure transaction composition 實作；核心不接觸 Firebase transaction。
- 目前 Domain Event 在同程序記錄與派送；可靠跨服務投遞被證明需要前不採 Outbox。
