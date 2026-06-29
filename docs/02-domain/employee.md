# Employee Domain

## Problem
- 保存 tenant 內員工主檔及必要個資，同時避免把登入、任職、組織或權限塞入 Employee Aggregate。

## 邊界
| 負責 | 不負責 |
| --- | --- |
| `Employee` 建立、個資更新、啟用／停用 | Firebase identity、OrganizationUnit、Membership、Role、Capability、薪資計算 |

## 模型
| 類型 | 模型 |
| --- | --- |
| Aggregate | `Employee` |
| Value Object | `TenantId`, `EmployeeId`, `EmployeeStatus`, `PersonalProfile` |
| Domain Event | `EmployeeHired`, `EmployeeProfileUpdated`, `EmployeeDeactivated` |
| Public contract | `EmployeeSnapshot` |
| Ports | `EmployeeRepository`, `EmployeeSnapshotQueryPort` |

## 協作
- Organization 以 `EmployeeSnapshot` 驗證員工存在後建立 Membership。
- Payroll 透過 Organization 的 payroll-safe membership snapshot 取得任職資料，不直接讀 Employee Aggregate。
- 敏感個資異動與讀取必須經 server-side capability guard 並建立 AuditRecord。
