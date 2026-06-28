---
name: plan-ddd-feature
description: "在新增 worksync-hr 功能前產生 DDD + Hexagonal 設計計畫"
agent: "agent"
---

請先分析：
- Subdomain 與 Bounded Context
- Ubiquitous Language
- Use Case
- Aggregate / Entity / Value Object
- Inbound / Outbound Ports
- Driving / Driven Adapters
- App Router routing strategy（後台主應用區預設 Parallel Routes；簡單 auth / public / one-off page 才用普通 routes）
- named slots、`default.tsx` fallback、slot naming 與 Intercepting Routes 需求

補充限制：
- Slot 是 UI composition，不是 Bounded Context。
- Route group 不等於 Subdomain。

不要直接修改程式碼，先輸出短版設計計畫。
