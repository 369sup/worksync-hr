# ADR-0003: 使用 Firebase Auth、Firestore、Storage

## 狀態
Accepted

## 日期
2026-06-29

## 背景
- 專案需要帳號驗證、結構化資料儲存與檔案附件能力。

## 決策
- 使用 Firebase Auth 管理登入與身份。
- 使用 Firestore 儲存業務文件。
- 使用 Storage 儲存附件與匯出檔案。
- 敏感資料寫入流程由 server-side 控制。

## 原因
- 服務整合完整。
- 可快速支援權限與資料存取。
- Firestore 適合文件型流程資料。
- Storage 適合附件場景。
- 能搭配 Emulator 支援本地開發。

## 取捨
- 優點：開發速度快、平台一致性高。
- 限制：schema discipline 與 rules 設計要求高。

## 後續影響
- 架構需建立 Firebase adapters 與 mapper。
- 程式碼需避免 Client Component 直接寫入薪資、權限、稽核資料。
- Firebase rules 需對齊角色與資料分類。
- 文件需同步維護 schema、rules、emulator 指南。
