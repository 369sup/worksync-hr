# Firestore Schema Blueprint

## 根路徑
- 業務資料位於 `tenants/{tenantId}/<collection>/{documentId}`。
- `tenantId` 同時存在於 document 作為防禦性驗證欄位，但 path 才是隔離根；兩者不一致即拒絕 mapping。
- Collection 是 persistence choice，不代表 Aggregate 或 Bounded Context。

## Collections
| Path（位於 tenant 下） | Owner | Document 用途 | 對外 Read Model |
| --- | --- | --- | --- |
| `employees/{employeeId}` | Employee | Employee aggregate write model | `EmployeeSnapshot` |
| `organization_units/{unitId}` | Organization | OrganizationUnit write model | organization tree view |
| `memberships/{membershipId}` | Organization | Membership、roles、capabilities | `OrganizationMembershipSnapshot` |
| `shifts/{shiftId}` | Schedule | Shift policy version | shift view |
| `work_schedules/{scheduleId}` | Schedule | WorkSchedule／WorkDay write model | `WorkScheduleSnapshot` |
| `attendance_records/{recordId}` | Attendance | Punch、exception、status | `FinalizedAttendanceSummary` |
| `leave_types/{leaveTypeId}` | Leave | versioned LeaveType | leave type option view |
| `leave_requests/{requestId}` | Leave | LeaveRequest write model | approved summary／history item |
| `leave_balances/{balanceId}` | Leave | LeaveBalance 與 entries | `LeaveBalanceSummary` |
| `overtime_requests/{requestId}` | Overtime | OvertimeRequest write model | `OvertimeAdjustment` |
| `approval_assignments/{assignmentId}` | Approval | assignment／delegate | `ApprovalAssignmentResult` |
| `payroll_periods/{periodId}` | Payroll | period／input version／status | period summary |
| `payroll_results/{resultId}` | Payroll | input、lines、adjustments、result | `PayrollResultSummary`, `SalarySlipView` |
| `audit_records/{recordId}` | Audit | append-only AuditRecord | masked `AuditRecordView` |
| `notification_deliveries/{deliveryId}` | Notification | recipient／attempt／status | `NotificationStatusSummary` |

## Document／Domain／Read Model
- Aggregate write document 可為 Firestore transaction 最佳化，但 mapper 必須重建 Domain 不變條件。
- Read Model 可扁平化或重複欄位，不能被 command handler 當成 Aggregate 保存。
- 跨 Context adapter 只輸出 Published Language，不暴露其他 collection document。
