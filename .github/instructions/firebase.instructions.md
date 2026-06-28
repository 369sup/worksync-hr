---
applyTo: "src/infrastructure/firebase/**,firestore.rules,storage.rules,docs/04-infrastructure/**"
---
# Firebase 指令

## Adapter 邊界
- Firebase 只出現在 infrastructure adapter、rules、emulator 設定與 server-side auth integration。
- Firestore document、Storage metadata 與 Domain entity 必須透過 mapper / DTO 轉換。
- Auth provider 只證明 identity；角色、capability 與敏感寫入權限不可存在第二份 client-side 真相。
- Application / Domain 不可直接依賴 Firebase SDK 型別。

## Schema 與命名
- Collection 名稱使用小寫複數與底線，例如 `employees`、`attendance_records`。
- Firestore schema 文件需標示 owner、主要欄位、敏感欄位與對應 bounded context。
- 新增 collection 時同步更新 schema 文件、rules 與角色權限說明。

## 安全
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。
- Firestore / Storage rules 預設 deny，再逐步開放最小權限。
- 涉及角色權限時，要同步檢查 Admin、HR、Manager、Employee。
- 任何 adapter 都不得把 Firebase document 直接暴露成公開契約或 Domain entity。
