# Ports

## 目的
- 定義 application 依賴的抽象能力，避免核心直接耦合 Firebase 或 UI。

## 圖解
| 類型 | 代表能力 |
| --- | --- |
| Repository Port | `EmployeeRepository`, `AttendanceRecordRepository`, `LeaveRequestRepository`, `OvertimeRequestRepository`, `PayrollRepository` |
| Query Port | `EmployeeProfileQueryPort`, `ApprovalQueryPort`, `AttendanceSummaryQueryPort`, `LeaveAdjustmentQueryPort` |
| Service Port | `AuthContextPort`, `ClockPort`, `AuditPort`, `FileStoragePort` |

## 規則
- Port 以能力命名，不以 Firestore、HTTP、Firebase、page、action 命名。
- Repository Port 代表 aggregate 邊界；Query Port 代表 read model 或已公開 snapshot。
- Adapter 可以實作多個 port，但不可把 Firebase 型別洩漏回 Application / Domain。
- actor、role、capability、scope 等可信任資訊必須由 port / adapter 提供。

## 範例
- `PayrollRepository` 是 port；Firestore 版實作只是其中一個 adapter。

## 維護注意事項
- 新增外部整合前，先檢查現有 port 是否已足夠表達需求。
