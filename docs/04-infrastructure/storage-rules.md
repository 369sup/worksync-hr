# Storage Rules

## 目的
- 記錄附件與匯出檔案的存取原則。

## 圖解
- 類型：請假附件、匯出報表、稽核附件。

## 規則
- 路徑需帶入 tenant / employee / resource 資訊。
- 薪資報表與稽核附件禁止直接由 Client Component 上傳或覆寫。

## 範例
- 員工可上傳自己的請假附件，但不可讀取他人附件。

## 維護注意事項
- 路徑命名與 Firestore reference 要一起維護。
