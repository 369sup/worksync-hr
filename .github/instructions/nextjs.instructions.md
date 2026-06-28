---
applyTo: "src/app/**,src/components/**,docs/05-frontend/**"
---
# Next.js App Router 指令

## UI 分層
- App Router page、layout、route handler 放在 `src/app/**`。
- 共用 UI 元件放在 `src/components/**`，優先使用 shadcn/ui。
- Client Component 只處理互動與顯示，不直接寫入敏感資料。

## Server 優先
- 寫入流程優先使用 Server Actions 或 Route Handlers。
- Payroll、permissions、audit log 更新需經 server-side 控制。

## 文件
- 前端文件說明頁面責任、狀態來源、表單邊界。
- 若需 stateful UI，先確認是否真的需要 `use client`。
