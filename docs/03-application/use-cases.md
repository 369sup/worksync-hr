# Application Use Cases

## Trusted Actor Flow
```mermaid
sequenceDiagram
  actor User
  participant Adapter as Server Action / Route Handler
  participant Identity as Identity ACL
  participant Actor as ActorContext Port
  participant UseCase
  participant Ports
  User->>Adapter: minimal input
  Adapter->>Identity: verify identity
  Identity-->>Adapter: AuthenticatedIdentity
  Adapter->>Actor: resolve tenant / membership / capability
  Actor-->>Adapter: ActorContext
  Adapter->>UseCase: ActorContext + input DTO
  UseCase->>Ports: tenant-scoped operations
```

## 共通 I/O
- Input 只含 primitive、ID、期間、理由與 idempotency key；`tenantId` 不得由 Client 決定。
- Output 只回 application DTO、Snapshot、Summary、Read Model 或 error code，不回 Aggregate／document。
- 所有 mutation 都檢查 capability、scope、aggregate version；敏感操作寫 AuditRecord。

## Phase 1
| Use Case | Input → Output | Ports |
| --- | --- | --- |
| `HireEmployee`, `UpdateEmployeeProfile`, `DeactivateEmployee` | profile／reason → `EmployeeSnapshot` | Employee repository、Audit |
| `CreateOrganizationUnit`, `MoveOrganizationUnit` | hierarchy／effective period → unit version | Organization repository、Audit |
| `AssignMembership`, `SuspendMembership`, `TerminateMembership` | employee／unit／employment period → membership snapshot | Employee query、Membership repository、Audit |
| `GrantCapability`, `RevokeCapability` | membership／role／capability／reason → membership version | Membership repository、Audit |
| `ResolveActorContext` | identity／request → `ActorContext` | Identity、Membership query、Clock、Audit on denied |
| `RecordPunch`, `GetSelfAttendance` | timestamp／type or range → record status/read model | Membership、Schedule query、Attendance repository、Clock |

## Phase 2
| Use Case | Input → Output | Ports |
| --- | --- | --- |
| `DefineShift`, `ReviseShift` | time range／break rules／effective period → shift version | Shift repository、Audit |
| `CreateWorkSchedule`, `PublishWorkSchedule`, `ReviseWorkSchedule` | employee／range／work days → schedule snapshot | Membership query、Shift／Schedule repositories、Audit |
| `DefineLeaveType`, `ReviseLeaveType` | unit／eligibility／effective period → leave type version | LeaveType repository、Audit |
| `GrantLeaveBalance`, `AdjustLeaveBalance` | employee／type／amount／reason → balance summary | Membership query、LeaveBalance repository、Audit |
| `SubmitLeaveRequest`, `CancelLeaveRequest` | type／period／reason → request status | Leave repositories、Schedule／Membership query、Audit |
| `ResolveApprovalAssignment`, `ApplyDelegation` | target／responsibility／window → assignment result | Membership query、Approval repository、Clock、Audit |
| `ApproveLeaveRequest`, `RejectLeaveRequest` | request／decision／expected version → approved summary/status | Approval query、Leave repositories、Audit |

## Phase 3
| Use Case | Input → Output | Ports |
| --- | --- | --- |
| `DetectAttendanceExceptions`, `ResolveAttendanceException` | work date／resolution → exception status | Schedule／Leave query、Attendance repository、Audit |
| `RequestAttendanceCorrection`, `ApplyAttendanceCorrection` | punch correction／reason → record version | Attendance repository、Approval query if required、Audit |
| `FinalizeAttendanceRecord` | work date／expected version → finalized summary | Schedule／Leave query、Attendance repository、Audit |
| `SubmitOvertimeRequest`, `CancelOvertimeRequest` | period／reason／preferred mode → status | Membership／Schedule／Attendance query、Overtime repository、Audit |
| `ApproveOvertimeRequest`, `RejectOvertimeRequest` | decision／mode → status | Approval query、Overtime repository、Audit |
| `PublishOvertimeCompensation` | approved request → adjustment or comp-leave event | Overtime repository、Audit；同程序 event handler |

## Phase 4
| Use Case | Input → Output | Ports |
| --- | --- | --- |
| `OpenPayrollPeriod` | payroll window／currency → period ID/status | PayrollPeriod repository、Audit |
| `CollectPayrollInputs`, `FreezePayrollInputs` | period／expected upstream versions → input version | Employee／Organization／Attendance／Leave／Overtime query ports、Payroll repositories、Audit |
| `CalculatePayroll` | frozen input version → result summaries | Payroll repositories、Clock、Audit |
| `AddPayrollAdjustment` | result／amount／reason／source → result version | PayrollResult repository、Audit |
| `ReviewPayroll`, `ReopenPayrollPeriod` | period／decision／reason → status | Payroll repositories、Audit |
| `PublishPayrollResults` | reviewed period → `SalarySlipView[]` | Payroll repositories、File Storage if export、Audit |

## Phase 5
| Use Case | Input → Output | Ports |
| --- | --- | --- |
| `SearchAuditRecords`, `ExportAuditRecords` | tenant scope／filters → masked views／file ref | Audit query、File Storage、Audit |
| `GenerateAttendanceReport`, `ExportPayrollResults` | filters／version → report/file ref | scoped query ports、File Storage、Audit |
| `DeliverNotification`, `RetryNotificationDelivery` | versioned event／delivery ID → delivery status | Notification repository／gateway、Clock |

## Failure Contract
| Code | 語意 |
| --- | --- |
| `UNAUTHENTICATED` | identity 無效；不呼叫 Use Case |
| `FORBIDDEN` | tenant、capability 或 scope 不符；不得洩漏資源存在性 |
| `NOT_FOUND` | tenant scope 內找不到必要 Aggregate／Snapshot |
| `CONFLICT` | 版本衝突、非法狀態轉移、重複打卡、輸入未 finalized |
| `VALIDATION_FAILED` | 欄位、期間、數值或 command 不合法 |
| `UPSTREAM_UNAVAILABLE` | 必要 Query Port 失敗；不得以未聲明陳舊資料繼續 |
| `AUDIT_RECORDING_FAILED` | 必記錄操作無法安全留痕；敏感流程 fail closed |
