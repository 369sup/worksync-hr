# Env Vars

## 目的
- 盤點公開前端設定、server-only 設定與環境隔離原則。

## 圖解
| 類型 | 範例 | 原則 |
| --- | --- | --- |
| Client-exposed | `NEXT_PUBLIC_FIREBASE_API_KEY`, `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | 只放 Firebase public config，不放權限真相 |
| Server-only | session secret、admin credentials、service account、internal capability config | 只能在 server-side 使用 |
| Local / Emulator | emulator host、feature toggle | 僅對應本地或測試環境 |

## 規則
- 缺少 required server config 時要 fail fast，不以 silent fallback 掩蓋。
- client 端永不接觸 service account、session secret、角色來源或敏感流程控制值。
- 各環境使用不同 project、secret 與權限設定，不共用 production 憑證。

## 範例
- Firebase public config 可以暴露到 client，但 payroll export token、admin credential 與 audit 寫入權限不能暴露。

## 維護注意事項
- 新增變數時同步標示用途、owner、server/client 範圍與對應文件。
