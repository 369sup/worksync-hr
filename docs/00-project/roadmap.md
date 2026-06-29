# 分階段開發路線圖

## 原則
- 路線圖描述可驗收能力與依賴，不承諾日期，也不等同 issue backlog。
- Audit 寫入與 tenant 隔離從 Phase 1 即為基線；Phase 5 完成查詢、治理與自動化能力。

## Phase 1：基礎身份、員工、組織、權限與基本出勤
| 項目 | 內容 |
| --- | --- |
| Context | Employee、Organization、Attendance、Audit 基線 |
| Use Cases | `HireEmployee`、`UpdateEmployeeProfile`、`CreateOrganizationUnit`、`AssignMembership`、`GrantCapability`、`RevokeCapability`、`ResolveActorContext`、`RecordPunch` |
| 驗收 | 使用者只能在自己的 tenant 與 scope 內建立可信任 actor、維護主檔並打卡 |

## Phase 2：班別、排班、請假、假額度與簽核
| 項目 | 內容 |
| --- | --- |
| Context | Schedule、Leave、Approval，加上 Phase 1 上游 |
| Use Cases | `DefineShift`、`PublishWorkSchedule`、`DefineLeaveType`、`AdjustLeaveBalance`、`SubmitLeaveRequest`、`ResolveApprovalAssignment`、`ApplyDelegation`、`ApproveLeaveRequest` |
| 驗收 | 員工依有效排班申請請假，責任人或有效代理人可完成決策 |

## Phase 3：加班、出勤異常與差勤彙總
| 項目 | 內容 |
| --- | --- |
| Context | Attendance、Overtime、Approval、Leave、Schedule |
| Use Cases | `DetectAttendanceExceptions`、`RequestAttendanceCorrection`、`ResolveAttendanceException`、`FinalizeAttendanceRecord`、`SubmitOvertimeRequest`、`ApproveOvertimeRequest`、`PublishOvertimeCompensation` |
| 驗收 | 可產生具版本的 finalized attendance、overtime payroll adjustment 或 compensatory leave grant |

## Phase 4：薪資期間、輸入、計算與結果
| 項目 | 內容 |
| --- | --- |
| Context | Payroll 與所有上游 Published Language |
| Use Cases | `OpenPayrollPeriod`、`CollectPayrollInputs`、`FreezePayrollInputs`、`CalculatePayroll`、`AddPayrollAdjustment`、`ReviewPayroll`、`PublishPayrollResults`、`ReopenPayrollPeriod` |
| 驗收 | 可重現指定輸入版本的薪資結果、薪資單與受控匯出；不回寫上游資料 |

## Phase 5：稽核、報表、通知、治理與自動化
| 項目 | 內容 |
| --- | --- |
| Context | Audit、Notification 及跨域 Read Model |
| Use Cases | `SearchAuditRecords`、`ExportAuditRecords`、`GenerateAttendanceReport`、`ExportPayrollResults`、`DeliverNotification`、`RetryNotificationDelivery` |
| 驗收 | 敏感查詢與匯出可追溯，通知失敗可重試且不改變來源 Domain 狀態 |
