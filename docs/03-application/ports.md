# Ports 與公開契約

## 目的
- 固定 Application Core 依賴的抽象能力、owner、輸入輸出與失敗語意。

## Port 分類
| 類型 | 命名規範 | 規則 |
| --- | --- | --- |
| Repository Port | `<AggregateRoot>Repository` | 一個 Aggregate Root 一個 persistence port |
| Query Port | `<PublishedLanguage>QueryPort` | 回傳 immutable snapshot／summary／result |
| Service Port | `<Capability>Port` | 封裝 audit、clock、identity、event、export 等外部能力 |

## Repository Ports
| Owner Context | Port | Aggregate Root | 主要操作 |
| --- | --- | --- | --- |
| Employee | `EmployeeRepository` | `Employee` | `findById`, `save` |
| Employee | `MembershipRepository` | `Membership` | `findActiveBySubject`, `save` |
| Attendance | `AttendanceRecordRepository` | `AttendanceRecord` | `findByEmployeeAndWorkDate`, `save` |
| Leave | `LeaveRequestRepository` | `LeaveRequest` | `findById`, `save` |
| Leave | `LeaveBalanceLedgerRepository` | `LeaveBalanceLedger` | `findByEmployeeAndType`, `save` |
| Approval | `ApprovalAssignmentRepository` | `ApprovalAssignment` | `findByTargetRef`, `save` |
| Overtime | `OvertimeRequestRepository` | `OvertimeRequest` | `findById`, `save` |
| Payroll | `PayrollPeriodRepository` | `PayrollPeriod` | `findById`, `save` |
| Payroll | `SalarySlipRepository` | `SalarySlip` | `findByPeriodAndEmployee`, `saveBatch` |

## Cross-Context Query Ports
| Consumer | Port | Producer | Output | Failure |
| --- | --- | --- | --- | --- |
| Attendance、Leave、Overtime、Approval | `EmployeeProfileQueryPort` | Employee | `EmployeeProfileSnapshot` | 無有效 membership → `NOT_FOUND`／`FORBIDDEN` |
| Payroll | `EmployeePayrollSnapshotQueryPort` | Employee | `EmployeePayrollSnapshot` | version 缺失／變更 → `CONFLICT` |
| Leave、Overtime | `ApprovalAssignmentQueryPort` | Approval | `ApprovalAssignmentResult` | 無責任人／過期 → `CONFLICT` |
| Payroll | `AttendanceSummaryQueryPort` | Attendance | `FinalizedAttendanceSummary` | 未 finalized → `CONFLICT` |
| Attendance、Payroll | `ApprovedLeaveSummaryQueryPort` | Leave | `ApprovedLeaveSummary[]` | 上游 timeout → `UPSTREAM_UNAVAILABLE` |
| Payroll | `OvertimeAdjustmentQueryPort` | Overtime | `OvertimeAdjustment[]` | 上游 timeout → `UPSTREAM_UNAVAILABLE` |

## Service Ports
| Port | Owner / Adapter | 契約 |
| --- | --- | --- |
| `IdentityProviderPort` | Identity ACL / Firebase Auth adapter | token → `AuthenticatedIdentity`；不得回 Firebase User |
| `TrustedActorContextPort` | Employee adapter | identity → `ActorContext` |
| `AuditPort` | Audit adapter | 同步 `append(AppendAuditRecord)`；敏感 read／denied 記錄失敗即中止 |
| `AuditStorePort` | Audit infrastructure | append-only save／scoped search；不提供 update |
| `OutboxPort` | 各來源 Context infrastructure | 與 Aggregate 在同一 transaction 保存 `AuditFactRecorded`／integration event |
| `IntegrationEventPort` | Infrastructure | publish versioned event；consumer 至少一次且冪等 |
| `ClockPort` | Infrastructure | 取得 UTC instant；Domain 不直接讀系統時間 |
| `ExportPort` | Infrastructure | 產生受控匯出 reference，不回傳 Storage SDK 型別 |

## 禁止事項
- 不使用 `PayrollRepository`、`ApprovalQueryPort` 等缺少 Aggregate 或 Published Language 的模糊名稱。
- Port 不得洩漏 Firebase SDK、Firestore document、React、Next.js request 型別。
- UI 不得直接依賴 adapter concrete class。
- Context 不得透過 Repository Port 讀寫他域 Aggregate。
- Application transaction 必須把 Aggregate 與該 Context 的 outbox entry 一起提交；Audit consumer 不加入來源交易。
