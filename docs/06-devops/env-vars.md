# Env Vars

## 目的
- 盤點環境變數分類。

## 圖解
- 類型：公開前端設定、server-only 設定、emulator 設定。

## 規則
- Firebase public config 可放公開變數。
- 權限、管理、金流或後台密鑰一律 server-only。

## 範例
- App Hosting / CI secret 不應直接暴露到 Client Component。

## 維護注意事項
- 新增變數時同步標示 owner 與用途。
