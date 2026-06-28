---
applyTo: "src/app/**,src/components/**,docs/05-frontend/**"
---
# Next.js App Router 指令

## UI 分層
- 唯一路由根目錄是 `src/app/**`；不要建立根目錄 `app/`。
- `src/app/**` 的 Page、Layout、Route Handler、Server Action 都屬於 inbound adapter。
- 共用 UI 元件放在 `src/components/**`，優先使用 shadcn/ui。
- Route Group、slot 與資料夾命名不代表 bounded context 邊界。

## Server 優先
- Server Component 優先讀 query model / read model，不直接寫入 Firestore 或敏感資料。
- Route Handler 與 Server Action 驗證輸入、建立 trusted actor context、呼叫 use case、轉譯錯誤。
- Client Component 只處理互動與本地 UI state；授權、審批、薪資、稽核與權限真相留在 server-side。
- Payroll、permissions、audit log 更新需經 server-side 控制。

## 路由限制
- 只有需要 shareable URL、refresh restore 或 history navigation 時才使用 Parallel / Intercepting Routes。
- 使用 Parallel Routes 時，每個 slot 都要提供 `default.tsx`。
- 若需 stateful UI，先確認是否真的需要 `use client`。

## 文件
- 前端文件說明頁面責任、狀態來源、表單邊界與敏感寫入限制。
