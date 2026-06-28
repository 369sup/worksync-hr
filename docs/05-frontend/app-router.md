# App Router

## 目的
- 定義前端路由層責任。

## 圖解
```mermaid
flowchart TD
  Layout[layout.tsx] --> SlotSummary[@summary]
  Layout --> SlotList[@list]
  Layout --> SlotDetail[@detail]
  Layout --> SlotModal[@modal]
  SlotSummary --> UI[shadcn/ui]
  SlotList --> UI
  SlotDetail --> UI
  SlotModal --> UI
  UI --> Action[Server Action / Route Handler]
  Action --> APP[Application]
```

## Next.js Routing Strategy

- 本專案預設使用 Next.js App Router + Parallel Routes。

### 預設原則

- 後台主應用區預設使用 Parallel Routes。
- Dashboard、工作台、簽核、薪資、員工詳情、差勤檢查等多區塊頁面，優先使用 named slots。
- 使用 `@folder` 建立 slot，例如 `@summary`、`@list`、`@detail`、`@activity`、`@modal`、`@alerts`。
- 父層 `layout.tsx` 必須接收 slot props 並組合畫面。
- 每個 slot 必須提供 `default.tsx`。
- 需要 slot 內獨立 loading / error 狀態時，可在 slot 內建立 `loading.tsx` 與 `error.tsx`。
- 需要 modal deep link 時，可搭配 Intercepting Routes。
- 需要角色條件頁面時，可使用 Parallel Routes 依角色渲染不同 slot。

### 仍可使用普通 route 的情境

| 類型 | 範例 |
| --- | --- |
| Auth / public page | `/login`、`/logout`、`/forgot-password`、`/privacy`、`/terms` |
| 系統頁 | `/unauthorized`、`/not-found` |
| 單一步驟頁 | 單一步驟設定頁 |
| 簡單頁 | 沒有多 panel、沒有 split view、沒有獨立 loading/error 的頁面 |

### 禁止事項

- 不要為了形式而建立空洞 slot。
- 不要讓 Parallel Routes 破壞 DDD 分層。
- 不要在 Client Component 直接讀寫薪資、權限、稽核資料。
- 不要在 Domain layer import React、Next.js、Firebase。
- 不要把 slot 結構當成 domain boundary；slot 是 UI composition，不是 Bounded Context。

## 建議的 App Router Layout 範式

```txt
src/app/
├─ (auth)/
│  └─ login/
│     └─ page.tsx
├─ (dashboard)/
│  ├─ layout.tsx
│  ├─ page.tsx
│  ├─ default.tsx
│  ├─ @summary/
│  │  ├─ default.tsx
│  │  ├─ loading.tsx
│  │  └─ page.tsx
│  ├─ @alerts/
│  │  ├─ default.tsx
│  │  ├─ loading.tsx
│  │  └─ page.tsx
│  ├─ @activity/
│  │  ├─ default.tsx
│  │  ├─ loading.tsx
│  │  └─ page.tsx
│  └─ @modal/
│     ├─ default.tsx
│     └─ (.)employees/
│        └─ [employeeId]/
│           └─ page.tsx
├─ (hr)/
│  └─ employees/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ default.tsx
│     ├─ @list/
│     │  ├─ default.tsx
│     │  └─ page.tsx
│     ├─ @detail/
│     │  ├─ default.tsx
│     │  └─ [employeeId]/
│     │     └─ page.tsx
│     └─ @activity/
│        ├─ default.tsx
│        └─ [employeeId]/
│           └─ page.tsx
├─ (attendance)/
│  └─ attendance/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ default.tsx
│     ├─ @calendar/
│     ├─ @records/
│     ├─ @exceptions/
│     └─ @detail/
├─ (approval)/
│  └─ approvals/
│     ├─ layout.tsx
│     ├─ page.tsx
│     ├─ default.tsx
│     ├─ @queue/
│     ├─ @detail/
│     └─ @history/
└─ (payroll)/
   └─ payroll/
      ├─ layout.tsx
      ├─ page.tsx
      ├─ default.tsx
      ├─ @runs/
      ├─ @preview/
      ├─ @exceptions/
      └─ @audit/
```

## `layout.tsx` 範例

```tsx
export default function DashboardLayout({
  children,
  summary,
  alerts,
  activity,
  modal,
}: {
  children: React.ReactNode
  summary: React.ReactNode
  alerts: React.ReactNode
  activity: React.ReactNode
  modal: React.ReactNode
}) {
  return (
    <>
      {modal}
      <main>
        <section>{summary}</section>
        <section>{children}</section>
        <aside>{alerts}</aside>
        <aside>{activity}</aside>
      </main>
    </>
  )
}
```

## Parallel Routes `default.tsx` Rule

每個 named slot 必須提供 `default.tsx`。

原因：

- refresh / hard navigation 時，Next.js 可能無法恢復不在目前 URL 中的 slot 狀態。
- `default.tsx` 可提供 fallback。
- 沒有 fallback 時，未匹配 slot 可能變成 404。

建議：

- `@modal/default.tsx` 通常回傳 `null`。
- 資訊型 slot 可回傳 empty state skeleton。
- 主要內容 slot 可回傳可理解的空狀態。

## Slot Naming

slot 使用小寫語意名稱。

建議 slot：

- `@summary`
- `@list`
- `@detail`
- `@activity`
- `@alerts`
- `@modal`
- `@queue`
- `@history`
- `@calendar`
- `@records`
- `@exceptions`
- `@preview`
- `@audit`

避免：

- `@left`
- `@right`
- `@box1`
- `@panel2`
- `@temp`

## Parallel Routes 與 DDD 邊界

Parallel Routes 是 UI composition pattern，不是 DDD boundary。

- Slot 不等於 Bounded Context。
- Route group 不等於 Subdomain。
- Page 不等於 Use Case。
- UI layout 不可決定 Domain model。
- Domain、Application、Infrastructure 分層仍以 DDD + Hexagonal Architecture 為準。

## 範例
- 請假表單頁面送出後呼叫 server-side use case。

## 維護注意事項
- 新頁面先標示 server/client 邊界與 slot fallback。
