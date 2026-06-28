---
applyTo: "src/app/**,src/components/**,docs/05-frontend/**"
---

# Next.js Instructions

- 使用 Next.js App Router。
- 預設 Server Component。
- Client Component 只用於互動狀態、表單、瀏覽器 API。
- UI 優先使用 shadcn/ui。
- 不要預設使用 Parallel Routes。
- 一般 CRUD 使用 route groups、layouts、pages。
- Route Handler 與 Server Action 負責輸入驗證、actor context、錯誤轉譯。
