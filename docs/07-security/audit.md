# Audit

## 目的
- 定義必記錄事件、欄位與敏感資料存取追蹤要求。

## 必記錄事件
| 類型 | 例子 |
| --- | --- |
| 身份 / 權限變更 | role 變更、capability grant/revoke、manager reassignment |
| 流程 override | leave override、attendance correction override |
| 薪資流程 | run payroll、review payroll、publish salary slips、export payroll |
| 敏感資料讀取 | 查看薪資明細、查看 audit log、查看 sensitive HR reason |
| 規則拒絕 / 安全事件 | denied write、unauthorized export、policy mismatch |

## Audit record 最小欄位
| 欄位 | 說明 |
| --- | --- |
| `actorId` | 誰觸發 |
| `action` | 做了什麼 |
| `targetType` / `targetId` | 作用對象 |
| `occurredAt` | 何時發生 |
| `result` | success / denied / failed |
| `reason` | 必要時的簡短理由 |
| `requestSource` | ui / api / system / batch |

## 規則
- audit log 只能 server-side append。
- 不在 audit 中保存 secret、token、完整附件內容。
- 匯出敏感資料前後都應記錄 audit event。
- Audit 是下游 Bounded Context；Security 是跨 Context policy，兩者不得合併成單一模型。
