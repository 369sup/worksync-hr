# ADR-0001: 使用 Next.js + Firebase 作為主要技術棧

## 狀態
Accepted

## 日期
2026-06-29

## 背景
- 專案需要快速建立 Web UI、驗證、資料儲存與檔案管理。

## 決策
- 採用 Next.js App Router 作為前端與 server-side 入口。
- 採用 Firebase 作為 Auth、Firestore、Storage 基礎平台。

## 原因
- Next.js 與 React 生態成熟。
- Firebase 可快速提供 managed backend。
- 適合以五個 Phase 漸進交付完整 HR 差勤薪資系統。
- 可保留未來 Firebase App Hosting 選項。
- 與 TypeScript 整合成本低。

## 取捨
- 優點：啟動快、整合成本低、部署選項明確。
- 限制：需控管 Firebase SDK 邊界與 vendor lock-in。

## 後續影響
- 架構上需明確切分 UI、Application、Domain、Infrastructure。
- 程式碼需限制 Firebase 只出現在 adapter。
- Firebase rules 需與角色權限同步設計。
- 文件需維持技術棧與邊界說明。
