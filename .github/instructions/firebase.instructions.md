---
applyTo: "src/infrastructure/firebase/**,firestore.rules,storage.rules,docs/04-infrastructure/**,docs/07-security/**"
---

# Firebase Instructions

- Firebase SDK 只允許出現在 Infrastructure 或明確 Firebase 邊界。
- Firestore document 不等於 Domain Entity。
- 必須使用 mapper 轉換 Firestore document 與 Domain model。
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。
- Collection 使用小寫複數與底線。
- Auth provider 只證明 identity；角色與 capability 真相留在 server-side。
