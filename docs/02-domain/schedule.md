# Schedule Domain

## Context 邊界
- 負責 `Shift`、`WorkSchedule`、`WorkDay`、`ScheduleVersion`。
- 不負責 Punch、AttendanceException、Leave approval、Overtime compensation 或 Payroll calculation。

## 模型與契約
| 類型 | 內容 |
| --- | --- |
| Aggregates | `Shift`, `WorkSchedule` |
| Public contract | `WorkScheduleSnapshot` |
| Repository Ports | `ShiftRepository`, `WorkScheduleRepository` |
| Query Port | `WorkScheduleSnapshotQueryPort` |

## 規則
- Attendance、Overtime 只能透過 `WorkScheduleSnapshotQueryPort` 消費排班。
- 已發布排班必須具有 `ScheduleVersion`。
- 修訂產生新版本，不得靜默改變下游已使用的 Snapshot。
