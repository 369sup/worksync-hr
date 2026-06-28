---
name: review-ddd-boundary
description: "檢查 worksync-hr 的 Domain / Application / Infrastructure / UI 邊界"
agent: "agent"
---

請檢查以下邊界是否被破壞：
- Domain 是否依賴 React / Next.js / Firebase
- Application 是否只做 orchestration
- Infrastructure 是否承接 Firebase adapters
- UI 是否直接碰觸敏感資料真相

請用條列輸出問題與修正建議。
