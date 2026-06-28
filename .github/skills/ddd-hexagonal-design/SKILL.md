---
name: ddd-hexagonal-design
description: "Use when designing worksync-hr features with DDD strategic design, tactical design, and hexagonal architecture."
---

# ddd-hexagonal-design

## 用途
- 戰略設計
- 戰術設計
- Ports / Adapters 切分
- App Router 與 Parallel Routes 對 UI composition 的規劃

## 產出
- bounded context 建議
- aggregate / use case / port 草案
- Parallel Routes / named slots 草案（如適用）
- 邊界風險清單

## 邊界提醒
- 後台主應用區預設使用 Parallel Routes，簡單 auth / public / one-off page 才使用普通 routes。
- Slot 不等於 Bounded Context；route group 不等於 Subdomain。
