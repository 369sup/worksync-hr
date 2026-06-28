# Deployment

## 目的
- 記錄部署方向與邊界。

## 圖解
- 目標：先支援一般 Next.js 部署，後續可評估 Firebase App Hosting。

## 規則
- 部署前需確認環境變數、權限與 rules 已同步。
- 敏感資料的 server-side 流程不可因部署方式被繞過。

## 範例
- 若使用 Firebase App Hosting，仍需保留 Application / Domain 邊界。

## 維護注意事項
- 實際部署腳本確定後再補細節。
