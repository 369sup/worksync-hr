# Local Setup

## 目的
- 說明最小本地啟動前置作業。

## 圖解
- Node.js 22 + pnpm 11 + Firebase Emulator（後續補齊）。

## 規則
- 套件安裝使用 `pnpm install --frozen-lockfile`。
- 本地驗證至少執行 lint、typecheck、build。

## 範例
- 初次開發先安裝依賴，再確認環境變數與 Emulator 連線。

## 維護注意事項
- 目前 `package.json` 尚未提供 `pnpm typecheck` script，後續需補上。
