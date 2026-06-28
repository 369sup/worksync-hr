# Data Classification

## 目的
- 將資料分級，對齊 UI、rules、query、audit 的最小保護要求。

## 分級表
| 等級 | 範例 | 保護要求 |
| --- | --- | --- |
| Public Config | Firebase public config、公開文件導覽 | 可公開，但不可夾帶權限真相 |
| Internal | 導覽資訊、一般流程設定、非敏感出勤摘要 | 登入 + 最小權限 |
| Personal | 姓名、聯絡方式、任職資訊、主管關係 | 依角色與用途最小揭露 |
| Sensitive HR | 請假原因、補登說明、代理審批理由 | server-side write、精細授權、audit |
| Payroll | 薪資、扣款、匯款資訊、薪資匯出 | 最嚴格授權、server-only write/export |
| Audit / Security | audit metadata、權限配置、安全事件 | append-only、server-side、嚴格讀取 |

## Client Component 禁止直接寫入
- Payroll 資料。
- Audit / Security 資料。
- 權限與 capability 設定。
- 敏感個資 override 欄位。
- Sensitive HR 理由全文與匯出檔案。
