# Firestore Schema

## 目的
- 定義主要 collections 與關聯。

## 圖解
```mermaid
erDiagram
  employees ||--o{ attendance_records : has
  employees ||--o{ leave_requests : has
  employees ||--o{ payroll_runs : receives
  leave_requests ||--o{ approval_requests : creates
  approval_requests ||--o{ audit_logs : writes
```

## 規則
- Collection 使用小寫複數與底線。
- Document 欄位先對齊 domain model，再由 mapper 轉換。

## 範例
- `attendance_records` 儲存 clock in/out 與狀態。

## 維護注意事項
- 新增 collection 時同步更新 rules 與權限文件。
