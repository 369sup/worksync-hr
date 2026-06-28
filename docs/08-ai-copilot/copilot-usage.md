# Copilot Usage

## 目的
- 說明 Copilot 在本專案的使用邊界。

## 圖解
- Copilot 可協助文件、測試、重構；不得破壞 DDD 邊界。

## 規則
- 產生程式碼前先確認所在 layer。
- Domain 不可引入 React、Next.js、Firebase。

## 範例
- 產生 repository adapter 時，實作放在 infrastructure。

## 維護注意事項
- 規則以 `.github/copilot-instructions.md` 為準。
