# 六邊形架構 Hexagonal Architecture

## 目的
- 用 Ports & Adapters 保護 Application 與 Domain 核心，隔離 Next.js、Firebase、HTTP 與 UI。

## Mermaid 圖解
```mermaid
flowchart LR
  subgraph Driving[Driving / Inbound Adapters]
    UI[Next.js UI]
    SA[Server Actions]
    RH[Route Handlers]
  end

  subgraph Core[Application + Domain]
    UC[Use Cases]
    DOM[Domain]
    PORTS[Ports]
  end

  subgraph Driven[Driven / Outbound Adapters]
    FS[Firestore Repository]
    AUTH[Firebase Auth]
    STORAGE[Storage Adapter]
  end

  UI --> SA
  SA --> UC
  RH --> UC
  UC --> DOM
  UC --> PORTS
  FS -. implements .-> PORTS
  AUTH -. implements .-> PORTS
  STORAGE -. implements .-> PORTS
```

## worksync-hr 套用方式
- UI 層使用 App Router、Parallel Routes、Server Actions、Route Handlers、shadcn/ui。
- Application layer 只負責 use case orchestration、權限入口、port 協調。
- Infrastructure layer 才能實作 Firestore repository、Auth adapter、Storage adapter、mapper。

## 規則
- Domain 不可知道 React、Next.js、Firebase SDK。
- Application 只依賴 Domain 與 ports。
- Driving Adapter 呼叫 Inbound Port；Driven Adapter 實作 Outbound Port。
- 敏感寫入必須經 server-side trusted actor context。

## Parallel Routes 與 DDD 邊界

- 後台主應用區預設使用 Parallel Routes，作為 UI composition pattern。
- Slot 不等於 Bounded Context；route group 不等於 Subdomain；page 不等於 Use Case。
- UI layout 只負責組裝 slot，不可決定 Domain model 或跨層依賴方向。
- Parallel Routes 可搭配 named slots、`default.tsx`、Intercepting Routes，但核心邊界仍由 DDD + Hexagonal Architecture 決定。

## 維護注意事項
- 新增整合前先判斷是否需要新 port。
- 若只是換技術供應者，不要讓 adapter 洩漏型別進核心。
