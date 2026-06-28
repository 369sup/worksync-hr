# Data Classification

## 目的
- 將資料區分敏感度，便於 rules 與 UI 邊界設計。

## 圖解
| 等級 | 範例 | 原則 |
| --- | --- | --- |
| Public Config | Firebase 前端設定 | 可公開 |
| Internal | 一般員工資料、出勤摘要 | 需登入控管 |
| Sensitive | 薪資、角色、審批理由 | server-side 控制 |
| Audit | 稽核紀錄 | 嚴格控管、不可任意覆寫 |

## 規則
- 敏感與稽核資料不可直接由 Client Component 寫入。
- 分類調整時需同步更新 rules 與文件。

## 範例
- `payroll_runs` 屬 Sensitive。

## 維護注意事項
- 若法遵需求提高，優先補充此文件。
