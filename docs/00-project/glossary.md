# Ubiquitous Language 詞彙表

## 目的
- 依 Bounded Context 固定業務語言、所有權與跨 Context Published Language。
- 同一詞若在不同 Context 有不同意義，必須以 Context 限定，不建立模糊的全域模型。

## 跨 Context 規則
| Term | 定義 | 禁止混用 |
| --- | --- | --- |
| `AuthenticatedIdentity` | Identity ACL 由 Firebase Auth 驗證後產生的最小身份證明 | 不等於 `Employee`、`Membership` 或授權結果 |
| `ActorContext` | server-side 根據 identity 與 membership 建立的可信任 actor、scope、capability | 不得由 Client 自報 |
| Snapshot | 某一版本的不可變事實快照，可由下游保存作為執行輸入 | 不代表可修改的上游 Entity |
| Summary | 為跨 Context 消費整理的最小結果 | 不得夾帶來源 Aggregate |
| Result | 一次查詢或責任解析的結果 | 不代表持久化 Entity |
| Published Language | Context 對外承諾的 application DTO 或 integration event | 不得直接使用 Firestore document shape |
| Security Policy | 適用所有 Context 的授權、資料分級與 server-side 寫入規則 | 不稱為 `Security Context` |

## Employee Context
| Term | 定義 |
| --- | --- |
| `Employee` | 具持續身份的員工主檔 Aggregate |
| `Membership` | 員工在組織中的任職、角色、capability 與啟用狀態 Aggregate |
| `EmployeeProfileSnapshot` | 提供一般業務流程使用的任職與 scope 公開快照 |
| `EmployeePayrollSnapshot` | Payroll 使用的版本化在職與計薪 scope 快照 |
| `CapabilitySet` | server-side 解析的具體允許能力集合，不等於 UI role label |

## Attendance Context
| Term | 定義 |
| --- | --- |
| `AttendanceRecord` | 某員工某工作日的出勤一致性邊界 |
| `Punch` | 一次具時間與動作的打卡事實 |
| `AttendanceAnomaly` | 需要確認或校正的出勤異常 |
| `FinalizedAttendanceSummary` | Payroll 可消費的版本化已結算出勤摘要 |

## Leave Context
| Term | 定義 |
| --- | --- |
| `LeaveRequest` | 一次請假申請及其狀態轉移的 Aggregate |
| `LeaveBalanceLedger` | 依員工與假別保存額度異動的獨立 Aggregate，不屬於單一 `LeaveRequest` |
| `LeaveDecisionRecord` | Leave 內保存的核准或駁回事實，不等於 Approval 的 assignment |
| `ApprovedLeaveSummary` | Attendance、Payroll 可消費的已核准請假摘要 |
| `CompensatoryLeaveGrant` | Overtime 發布、Leave 冪等接收的補休授予事件 |

## Approval Context
| Term | 定義 |
| --- | --- |
| `ApprovalAssignment` | 某目標在指定時間應由誰審批的責任 Aggregate |
| `DelegationRule` | 在有效期間將審批責任代理給他人的規則 |
| `ApprovalTargetRef` | 只含目標 Context、類型與 ID 的跨 Context 參照 |
| `ApprovalAssignmentResult` | Leave、Overtime 查詢責任解析後取得的公開結果 |

## Overtime Context
| Term | 定義 |
| --- | --- |
| `OvertimeRequest` | 一次加班申請及補償決策的 Aggregate |
| `CompensationMode` | 薪資或補休的核定補償方式 |
| `OvertimeAdjustment` | Payroll 可消費的版本化薪資調整結果 |

## Payroll Context
| Term | 定義 |
| --- | --- |
| `PayrollPeriod` | 一次計薪執行、輸入版本與狀態的一致性邊界 |
| `SalarySlip` | 某員工在某計薪期間的薪資結果 Aggregate |
| `PayrollInputVersion` | Payroll 收斂所有上游 snapshot 的不可變版本識別 |
| `PayrollPeriodRepository` | 唯一負責 `PayrollPeriod` 持久化語意的 Repository Port |

## Audit Context
| Term | 定義 |
| --- | --- |
| `AuditRecord` | 一筆不可覆寫、可追溯的重要操作或敏感存取事實 |
| `AppendAuditRecord` | 各 Context 透過 `AuditPort` 提交的最小 application command |
| `AuditFactRecorded` | 與來源 Aggregate 原子寫入 local outbox、由 Audit 冪等消費的 integration event |
| `AuditAction` | 穩定的業務動作名稱，不使用 UI click 或 Firestore operation 命名 |

## 命名禁則
- 不使用 `Audit / Security`：Audit 是 Context；Security 是政策。
- 不使用未限定的 `InputVersion`：一律使用 `PayrollInputVersion`。
- 不使用 `PayrollRepository`：一律使用 `PayrollPeriodRepository` 或 `SalarySlipRepository`。
- 不使用 `EmployeeProfile` 指涉 Aggregate：公開讀取一律命名為 `EmployeeProfileSnapshot`。
- 不以 `PageData`、`FirestoreDoc`、`FirebaseUser` 命名 Domain Model 或 Published Language。

## 維護規則
- 新增 Context、公開契約、Aggregate 或跨 Context event 前，先更新本文件與 `bounded-contexts.md`。
- 程式、測試、UI label 與文件使用同一組詞彙；需要別名時必須在此明示。
