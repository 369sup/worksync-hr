# AGENTS.md

## 專案
- 名稱：`worksync-hr`
- 技術棧：Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui、Firebase Auth、Firestore、Storage
- 架構：DDD + Hexagonal Architecture

## 設計順序
```txt
Strategic Design → Tactical Design → Architecture → Advanced Patterns
```

## 分層規則
| Layer | 規則 |
| --- | --- |
| Domain | 不可依賴 React / Next.js / Firebase |
| Application | 只負責 use case orchestration |
| Infrastructure | 實作 Firebase adapters |
| UI | 使用 Next.js App Router 與 shadcn/ui |

## 敏感資料規則
- 薪資、權限、稽核資料不得由 Client Component 直接寫入。
- Firebase document 不可直接充當 Domain entity。

## 路由規則
- 後台主應用區預設使用 Parallel Routes。
- 簡單 auth / public / one-off page 可使用普通 routes、route groups、layouts、pages。
- 每個 named slot 都必須提供 `default.tsx`。
- slot 是 UI composition，不是 Bounded Context 或 Subdomain。

## 文件規則
- 修改前先檢查 `docs/` 與 `docs/01-architecture/adr/`。
- 文件使用繁體中文，優先 Mermaid、表格、短條列。
