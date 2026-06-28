# Storage Rules

## 目的
- 定義附件、報表、稽核匯出檔案的 path 命名與存取規則。

## Path 命名規範
| 類型 | 建議 path |
| --- | --- |
| 請假附件 | `tenants/{tenant_id}/leave_requests/{request_id}/{file_name}` |
| 加班附件 | `tenants/{tenant_id}/overtime_requests/{request_id}/{file_name}` |
| 薪資匯出 | `tenants/{tenant_id}/payroll_exports/{payroll_period_id}/{file_name}` |
| 稽核匯出 | `tenants/{tenant_id}/audit_exports/{export_id}/{file_name}` |

## Rules 原則
- path 必須帶 tenant 與 resource identifier。
- 員工只能讀寫自己被允許的附件 path。
- 薪資報表、稽核匯出、權限相關附件一律 server-only。
- metadata 需標記 owner context、resource id、classification。

## Sensitive path 規則
| 類型 | Client write |
| --- | --- |
| leave attachment | 僅限本人、且僅限非敏感附件情境 |
| overtime attachment | 僅限本人、受規則限制 |
| payroll export | 禁止 |
| audit export | 禁止 |
