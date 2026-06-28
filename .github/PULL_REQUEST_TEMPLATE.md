## 摘要
- 說明本次變更目的。

## 變更內容
- 條列主要修改。

## DDD / 六邊形架構檢查
- [ ] Domain layer 未新增 React / Next.js / Firebase import
- [ ] Application layer 僅依賴 ports，未直接依賴 Firebase SDK
- [ ] Infrastructure layer 才實作 adapter / mapper
- [ ] Firebase document 與 Domain entity 已透過 mapper 轉換

## Firebase 安全檢查
- [ ] 薪資、權限、稽核資料未由 Client Component 直接寫入
- [ ] Firestore / Storage rules 已同步檢查
- [ ] 敏感欄位僅透過受控 server-side 流程更新

## 文件同步
- [ ] `docs/` 已同步更新
- [ ] 如有重大架構決策，已新增 ADR
- [ ] Copilot / GitHub 設定未與既有規則衝突

## 驗證
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm build`
