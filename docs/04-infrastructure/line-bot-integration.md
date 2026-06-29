# LINE Bot Integration

## 目前邊界
- LINE Bot 暫時只做通知，不處理打卡、請假、簽核、薪資查詢、角色管理、tenant 選擇或任何 command／mutation。
- LINE Bot 是 Notification driven adapter，不是 Bounded Context。
- LINE SDK 只允許在 Infrastructure／Notification adapter；LINE payload 必須轉為 adapter DTO，不得進 Domain。

## Port 與資料保護
- 透過 `NotificationGatewayPort` 或 adapter-specific `LineNotificationGatewayPort` 傳送。
- Payroll、Audit、Sensitive HR 通知不得含明細，只能提示狀態或待處理事項。
- 投遞結果只更新 `NotificationDelivery`，不改變來源業務狀態。
- 未來若支援 LINE command，必須另做架構、identity、tenant、capability、scope 與安全設計；本階段不得加入。
