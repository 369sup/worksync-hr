# Ports 與公開契約

## 命名與共同要求
| 類型 | 命名 | 共同要求 |
| --- | --- | --- |
| Repository | `<AggregateRoot>Repository` | 每個操作含可信任 tenant scope；一個 Aggregate Root 一個 port |
| Query | `<PublishedLanguage>QueryPort` | 回傳 immutable Snapshot／Summary／Read Model |
| Service | `<Capability>Port` | 封裝 identity、clock、audit、storage、notification 等外部能力 |

## Repository Ports
| Context | Ports |
| --- | --- |
| Employee | `EmployeeRepository` |
| Organization | `OrganizationUnitRepository`, `MembershipRepository` |
| Schedule | `ShiftRepository`, `WorkScheduleRepository` |
| Attendance | `AttendanceRecordRepository` |
| Leave | `LeaveTypeRepository`, `LeaveRequestRepository`, `LeaveBalanceRepository` |
| Overtime | `OvertimeRequestRepository` |
| Approval | `ApprovalAssignmentRepository` |
| Payroll | `PayrollPeriodRepository`, `PayrollResultRepository` |
| Notification | `NotificationDeliveryRepository` |

## Cross-Context Query Ports
| Consumer | Port | Producer / Output |
| --- | --- | --- |
| Organization | `EmployeeSnapshotQueryPort` | Employee / `EmployeeSnapshot` |
| 全部受保護 Context | `OrganizationMembershipSnapshotQueryPort` | Organization / membership snapshot |
| Payroll | `PayrollMembershipSnapshotQueryPort` | Organization / payroll-safe membership snapshot |
| Attendance、Overtime | `WorkScheduleSnapshotQueryPort` | Schedule / `WorkScheduleSnapshot` |
| Leave、Overtime | `ApprovalAssignmentQueryPort` | Approval / `ApprovalAssignmentResult` |
| Attendance、Payroll | `ApprovedLeaveSummaryQueryPort` | Leave / approved summaries |
| Overtime、Payroll | `AttendanceSummaryQueryPort` | Attendance / finalized summaries |
| Payroll | `OvertimeAdjustmentQueryPort` | Overtime / adjustments |
| UI／report | `PayrollResultQueryPort`, `AuditRecordQueryPort`, `NotificationStatusQueryPort` | scoped Read Models |

## Service Ports
| Port | 契約 |
| --- | --- |
| `IdentityProviderPort` | token/session → `AuthenticatedIdentity`，不回 Firebase User |
| `TrustedActorContextPort` | identity + request → tenant-safe `ActorContext` |
| `ClockPort` | UTC instant；Domain 不直接讀系統時間 |
| `AuditPort` | append immutable fact；敏感 success fact 可參與同一 infrastructure transaction composition |
| `FileStoragePort` | 受控附件／匯出 reference，不回 Storage SDK 型別 |
| `NotificationGatewayPort` | 傳送 channel message；失敗回可分類錯誤 |

## 禁止事項
- Port 不得暴露 Firebase、Firestore、Next.js、React、Request／Response 或 transaction 型別。
- 不使用 generic repository、`PayrollRepository`、`ApprovalQueryPort`。
- Context 不得用 Repository Port 讀寫他域 Aggregate。
- 不預設 `OutboxPort` 或 `IntegrationEventPort`；需求證明需要可靠外部投遞時再建立。
