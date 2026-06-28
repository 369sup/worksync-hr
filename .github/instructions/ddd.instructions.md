---
applyTo: "src/domain/**,src/application/**,docs/01-architecture/**,docs/02-domain/**,docs/03-application/**"
---

# DDD / Hexagonal Architecture Instructions

## 設計順序

1. 先做 Strategic Design。
2. 再做 Tactical Design。
3. 再落到 Hexagonal Architecture。
4. 最後才評估 Advanced Patterns。

## Strategic Design

- 先確認 Subdomain。
- 再確認 Bounded Context。
- 在 Context 內建立 Ubiquitous Language。
- 需要跨 Context 時，補 Context Map。

## Tactical Design

- Value Object 必須不可變。
- Entity 必須有唯一識別。
- Aggregate Root 是一致性邊界。
- Domain Service 只放無法歸屬於單一 Aggregate 的業務邏輯。
- Domain Event 表示已經發生的重要業務事實。
- Repository 在核心中只定義介面，不實作 Firebase。

## Architecture

- Application Use Case 只做流程編排。
- Ports 定義在核心邊界。
- Driving Adapter 呼叫 Inbound Port。
- Driven Adapter 實作 Outbound Port。
- Firebase Adapter 放在 Infrastructure layer。

## 禁止事項

- 不要在 Domain layer import React。
- 不要在 Domain layer import Next.js。
- 不要在 Domain layer import Firebase。
- 不要把 DTO 當成 Value Object。
- 不要把 Firestore document 當成 Domain Entity。
