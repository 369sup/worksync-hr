# Forms

## 目的
- 定義表單輸入、驗證與送出責任。

## 圖解
- 輸入 → 驗證 → Server Action / Route Handler → Use Case。

## 規則
- Client Component 只保留互動狀態。
- 薪資、權限、稽核表單不得直接寫 Firebase。

## 範例
- 請假申請表單可在 client 驗證必填欄位，但送出由 server-side 處理。

## 維護注意事項
- 表單欄位變更時同步檢查 use case 輸入模型。
