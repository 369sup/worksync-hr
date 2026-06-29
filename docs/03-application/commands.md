# Commands

## 命名與邊界
- 使用業務動詞：`PublishWorkSchedule`、`FinalizeAttendanceRecord`、`FreezePayrollInputs`。
- 一個 command 一個業務意圖；禁止 `UpdateFirestoreDoc`、`HandleForm`、`SaveEverything`。
- Command DTO 不包含 Firebase 型別，也不接受 Client 自報 tenant、role、capability。
- Server Action／Route Handler 建立 `ActorContext` 後才可呼叫 command use case。

## 分類
| 類型 | 範例 | 必要控制 |
| --- | --- | --- |
| Self service | `RecordPunch`, `SubmitLeaveRequest` | self scope、membership active |
| Manager／Approval | `ApproveLeaveRequest`, `ApproveOvertimeRequest` | assignment、delegate、capability |
| HR | `HireEmployee`, `AdjustLeaveBalance`, `ApplyAttendanceCorrection` | tenant scope、reason、audit |
| Payroll | `FreezePayrollInputs`, `AddPayrollAdjustment`, `PublishPayrollResults` | server-only、version lock、audit |
| Integration | `GrantCompensatoryLeave`, `DeliverNotification` | tenant、event ID、version、idempotency |
