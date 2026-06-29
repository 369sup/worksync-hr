# Page Map

## 目的
- 定義主要頁面群組、角色限制與與 Context 的對照。

## 導覽圖
```mermaid
flowchart TD
  Root[/] --> Dashboard[/dashboard]
  Dashboard --> Employees[/employees]
  Dashboard --> Organization[/organization]
  Dashboard --> Schedule[/schedules]
  Dashboard --> Attendance[/attendance]
  Dashboard --> Leave[/leave]
  Dashboard --> Approvals[/approvals]
  Dashboard --> Overtime[/overtime]
  Dashboard --> Payroll[/payroll]
  Dashboard --> Audit[/audit]
```

## Page 對照
| 路由群組 | 主要 Context | 角色 / 能力 | 備註 |
| --- | --- | --- | --- |
| `/employees` | Employee | HR / Manager / Admin | 可搭配 `@list` + `@detail` |
| `/organization` | Organization | HR / System Admin | 組織、任職、Role／Capability 管理 |
| `/schedules` | Schedule | Manager / HR | 班別與排班發布；可搭配 calendar／exceptions |
| `/attendance` | Attendance | Employee / Manager / HR | 可搭配 `@calendar` + `@records` |
| `/leave` | Leave | Employee / Manager / HR | 可搭配 `@summary` + `@detail` |
| `/approvals` | Approval | Manager / HR / Admin | 可搭配 `@queue` + `@history` |
| `/overtime` | Overtime | Employee / Manager / HR | 可搭配 `@list` + `@detail` |
| `/payroll` | Payroll | Payroll Admin / HR / Admin | 高敏感，server-side gate |
| `/audit` | Audit | HR / Payroll Admin / System Admin | 高敏感，禁止 client direct write；Security policy 適用所有 routes |
| `/notifications` | Notification | self / admin | Phase 5 delivery status；不控制來源流程 |

## 警示
- page 只代表入口，不代表單一 use case。
- 同一頁可組合多個 Context read model。
- slot 與 route group 都不能反向定義 Domain 邊界。
