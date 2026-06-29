# Audit Policy

## 必記錄事件
| 類型 | 事件 |
| --- | --- |
| 身份與權限 | Membership、主管、Role、Capability、tenant admin 變更 |
| 差勤與假勤 | 補登、校正、異常解除、假額度調整、override |
| 審批 | assignment、delegation、approve、reject、escalation |
| 薪資 | open、freeze inputs、calculate、adjust、review、reopen、publish、export |
| 敏感存取 | Payroll／Audit／Sensitive HR read、download、export |
| 安全 | denied、cross-tenant attempt、policy mismatch、failed audit |

## AuditRecord 最小欄位
| 欄位 | 說明 |
| --- | --- |
| `tenantId`, `recordId` | 隔離與唯一識別 |
| `actorId`, `membershipId?` | 行為者與當時任職 |
| `action`, `targetRef` | 穩定業務動作與對象 |
| `result`, `reason?` | success／denied／failed 及必要理由 |
| `requestId`, `requestSource` | 關聯 UI／API／system job |
| `occurredAt` | server clock 時間 |
| `metadata` | 經分類與遮罩的最小補充資料 |

## 一致性與保存
- 敏感 mutation success fact 與來源寫入應由同一 Firestore transaction／batch 提交。
- 敏感 read、denied、failed、export 使用同步 `AuditPort`；記錄失敗時 fail closed。
- AuditRecord 不可更新；更正以新紀錄關聯原紀錄。
- 保存期限與 legal hold 屬法域／企業政策，確認前不硬編碼。
- Audit 不等於 Event Sourcing，也不需要預設 Outbox。
