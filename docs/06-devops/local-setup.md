# Local Setup

## 目的
- 說明最小本地啟動與驗證步驟。

## 圖解
1. 安裝 Node.js 22 與 pnpm 11。
2. 執行 `pnpm install --frozen-lockfile`。
3. 準備必要的 Firebase 與本地環境變數。
4. 依需求執行 `pnpm lint`、`pnpm typecheck`、`pnpm build`、`pnpm dev`。

## 規則
- 本地安裝與 CI 一致使用 pnpm。
- 驗證至少先跑 lint、typecheck、build，再進入功能開發。
- 若 build 需要抓取外部字型或其他網路資源，需先確認當前環境可存取。

## 範例
- 目前 `src/app/layout.tsx` 透過 `next/font/google` 載入 Geist 字型；在網路受限環境執行 `pnpm build` 可能失敗。

## 維護注意事項
- 若新增 emulator、seed 或 health 檢查流程，請同步更新此文件與 `env-vars.md`。
