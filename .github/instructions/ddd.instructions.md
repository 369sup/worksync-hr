---
applyTo: "src/domain/**,src/application/**,docs/01-architecture/**,docs/02-domain/**"
---
# DDD + Hexagonal 指令

## Domain
- Entity 要有明確識別與生命週期。
- Value Object 以不可變與值相等為前提。
- Domain Service 只放跨 entity 規則，不放框架細節。
- `src/domain/**` 不可 import React、Next.js、Firebase SDK。

## Application
- Use case 只負責 orchestration、權限檢查入口、port 協調。
- Repository、clock、id generator、event publisher 以 port 抽象表示。
- `src/application/**` 不可直接依賴 Firebase SDK。

## 文件
- 架構文件優先用 Mermaid、表格、短條列。
- Domain 文件只記錄核心 entity、value object、規則，不展開實作細節。
