---
name: firebase-security-review
description: "檢查 Firestore schema、rules 與敏感資料寫入邊界"
agent: "agent"
---

請聚焦檢查：
- Firestore schema 命名與 bounded context 對齊
- Firestore / Storage rules 是否最小權限
- mapper 是否隔離 document 與 Domain model
- 薪資、權限、稽核資料是否被 Client Component 直接寫入
