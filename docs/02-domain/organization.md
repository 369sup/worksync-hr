# Organization Domain

## Context 邊界
- 負責 `OrganizationUnit`、`Membership`、`Role`、`Capability`、`ReportingLine`。
- 不負責 Employee 個資、Firebase Auth、Attendance Punch 或 Payroll 計算。

## 模型與契約
| 類型 | 內容 |
| --- | --- |
| Aggregates | `OrganizationUnit`, `Membership` |
| Public contracts | `OrganizationMembershipSnapshot`, `PayrollMembershipSnapshot` |
| Repository Ports | `OrganizationUnitRepository`, `MembershipRepository` |
| Query Ports | `OrganizationMembershipSnapshotQueryPort`, `PayrollMembershipSnapshotQueryPort` |

## 規則
- Role 只是 Capability 配置起點；最終授權檢查 Capability、scope 與 tenant。
- Membership 是 server-side `ActorContext` 的任職與授權來源。
- Organization 只透過 `EmployeeSnapshot` 等公開契約取得員工識別，不直接讀寫 Employee Aggregate。
