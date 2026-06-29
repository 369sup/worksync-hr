# Firebase Storage Rules Blueprint

## Paths
| 類型 | Path | Client write |
| --- | --- | --- |
| 請假附件 | `tenants/{tenantId}/leave_requests/{requestId}/{fileId}` | 僅經明確政策允許的本人最小上傳 |
| 加班附件 | `tenants/{tenantId}/overtime_requests/{requestId}/{fileId}` | 僅經明確政策允許的本人最小上傳 |
| 薪資單／匯出 | `tenants/{tenantId}/payroll_exports/{payrollPeriodId}/{fileId}` | 禁止 |
| 稽核匯出 | `tenants/{tenantId}/audit_exports/{exportId}/{fileId}` | 禁止 |

## 規則
- tenant、owner context、resource ID、classification、content type 與 size 都必須驗證。
- 受控檔案由 server-side `FileStoragePort` 建立 reference；核心不接觸 Storage SDK、bucket 或 signed URL 型別。
- 跨 tenant path 一律拒絕；下載 URL 必須短效、具 capability 並記錄 AuditRecord。
- Attachment 不等於 Domain Entity；Domain 只保存必要 `FileReference`。
