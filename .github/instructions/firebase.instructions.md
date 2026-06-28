---
applyTo: "src/infrastructure/firebase/**,firestore.rules,storage.rules,docs/04-infrastructure/**"
---
# Firebase 指令

## Adapter 邊界
- Firebase 只出現在 infrastructure adapter、rules、emulator 設定。
- Firestore document 與 Domain entity 必須透過 mapper 轉換。
- Application / Domain 不可直接依賴 Firebase SDK 型別。

## Schema 與命名
- Collection 名稱使用小寫複數與底線。
- Firestore schema 文件需標示 owner、主要欄位、敏感欄位。

## 安全
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。
- Firestore / Storage rules 預設 deny，再逐步開放最小權限。
- 涉及角色權限時，要同步檢查 Admin、HR、Manager、Employee。
