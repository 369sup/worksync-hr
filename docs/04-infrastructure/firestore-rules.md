# Firestore Rules

## 目的
- 記錄 Firestore 存取控制原則。

## 圖解
- 原則：預設 deny、最小權限、敏感資料 server-only。

## 規則
- 員工僅能讀寫自己的非敏感資料。
- Payroll、permissions、audit log 寫入需經 server-side。
- Rules 需與角色模型同步。

## 範例
- `payroll_runs` 不對一般 Employee 開放寫入。

## 維護注意事項
- 每次調整 schema 都要重新檢查 rules。
