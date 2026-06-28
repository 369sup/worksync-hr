# Data Classification

## 目的
- 將資料依敏感度分級，作為 rules、UI 邊界與 audit 的基準。

## 圖解
| 等級 | 範例 | 最低保護 |
| --- | --- | --- |
| Public Config | Firebase 前端設定、文件導覽資訊 | 可公開，但不可夾帶權限真相 |
| Internal | 部門名稱、一般流程設定、非敏感出勤摘要 | 需登入與最小授權 |
| Personal | 員工姓名、聯絡方式、任職資訊 | 最小揭露、依角色與用途控制 |
| Sensitive HR | 請假原因、補登說明、代理審批理由 | server-side 寫入、精細授權、可追溯 |
| Payroll | 薪資、扣款、帳戶或發薪結果 | 最嚴格存取與稽核 |
| Audit / Security | 稽核事件、權限配置、session / secret 相關資訊 | 嚴格 server-side 控制，不向 client 洩漏 |

## 規則
- Sensitive HR、Payroll、Audit / Security 資料不得由 Client Component 直接寫入。
- 列表與 read model 預設不回傳完整敏感欄位；只有明確 capability 才能看見。
- 分類一旦調整，需同步更新 roles、rules、schema、query model 與 audit 規則。

## 範例
- `payroll_periods.net_total`、`salary_slips.net_pay`、`leave_requests.reason`、`audit_logs.reason` 都不應直接暴露在一般列表頁。

## 維護注意事項
- 若法遵、稽核或保存期限要求提高，優先更新此文件與 `audit.md`。
