# Audit Domain

## 邊界
| 負責 | 不負責 |
| --- | --- |
| append-only AuditRecord、遮罩查詢、保存與受控匯出 | 授權決策、application log、修改來源 Aggregate |

## 模型
| 類型 | 模型 |
| --- | --- |
| Aggregate | `AuditRecord` |
| Value Object | `AuditAction`, `AuditResult`, `TargetRef`, `RequestContext` |
| Domain Event | `AuditRecordAppended` |
| Read Model | `AuditRecordView` |
| Ports | `AuditStorePort`, `AuditRecordQueryPort`, `AuditPort` |

## 規則
- AuditRecord 包含 `tenantId`、`recordId`、actor、action、target、result、reason、requestId、occurredAt 與 metadata classification。
- 只允許 server-side append；不提供 update 或一般 delete。
- 敏感 mutation 的成功 fact 應與來源寫入在同一 Firestore transaction／batch 完成，但核心不接觸 Firebase transaction。
- 敏感 read、denied、failed 與 export 必須記錄；token、secret、附件全文不得進 AuditRecord。
- append-only audit 不等於 Event Sourcing，也不要求 Outbox。
