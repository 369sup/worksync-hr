# Google Workspace Integration

## 邊界
- Google Workspace 是外部 adapter 能力，不建立 Bounded Context。
- Google Drive、Calendar、Chat、Sheets、Forms payload 不得直接進 Domain，必須轉為 Application DTO、Command 或 Query Result。
- 匯出與敏感讀取必須通過 `FileStoragePort`、`AuditPort`、capability guard 與 tenant scope。

## 未來可評估 Ports
- `GoogleDriveExportPort`
- `GoogleCalendarPort`
- `GoogleChatNotificationPort`
- `GoogleSheetsImportPort`

目前只保留邊界，不實作 Ports、Apps Script 或 MCP 自動化。
