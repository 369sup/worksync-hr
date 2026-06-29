# Notification Domain

## Context 邊界
- 負責 `NotificationDelivery`、Channel、Recipient、DeliveryAttempt、DeliveryStatus 與 retry。
- 不負責業務決策、來源 Aggregate 狀態、rollback、Approval decision，或 Attendance／Leave／Overtime／Payroll command。

## 模型與契約
| 類型 | 內容 |
| --- | --- |
| Aggregate | `NotificationDelivery` |
| Public contract | `NotificationStatusSummary` |
| Ports | `NotificationDeliveryRepository`, `NotificationStatusQueryPort`, `NotificationGatewayPort` |

## 規則
- Notification 在來源 commit 後執行。
- 通知失敗只更新 `NotificationDelivery`，不得回滾來源 Aggregate。
- LINE Bot 暫時只可作為 `NotificationGatewayPort` 的通知 Channel。
