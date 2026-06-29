# App Router

## 目的
- 定義 route group、Parallel Routes、named slots、`default.tsx` 與 server/client 邊界。

## 路由視圖
```mermaid
flowchart TD
  Root[(app)] --> Auth[(auth group)]
  Root --> Main[(dashboard / hr / attendance / approval / payroll groups)]
  Main --> Layout[layout.tsx]
  Layout --> Summary[@summary]
  Layout --> Detail[@detail]
  Layout --> Activity[@activity]
  Layout --> Modal[@modal]
  Summary --> Action[Server Action / Route Handler]
  Detail --> Action
  Activity --> Action
  Modal --> Action
```

## Route group 規範
| 類型 | 建議 |
| --- | --- |
| auth / public / one-off | 普通 routes 或 route groups |
| 後台主應用區 | 預設 Parallel Routes |
| 群組命名 | 使用業務語意，例如 `(dashboard)`、`(hr)`、`(payroll)` |
| 禁止 | 不要用 route group 取代 bounded context 設計 |

## Parallel Routes 使用條件
- 同頁需要多 panel / split view。
- slot 需要獨立 loading / error / refresh。
- 需要 modal deep link 或 role-based panel 組合。
- 若只是單頁單流程，不必硬用 Parallel Routes。

## named slots 命名規範
| 規則 | 範例 |
| --- | --- |
| 使用小寫語意名詞 | `@summary`, `@detail`, `@queue`, `@modal` |
| 避免位置名 | 不用 `@left`, `@right`, `@panel1` |
| 每個 slot 必備 fallback | `default.tsx` |

## `default.tsx` 規則
- 每個 named slot 必須提供 `default.tsx`。
- `@modal/default.tsx` 通常回傳 `null`。
- content slot 可回傳 skeleton 或 empty state。

## Modal deep link / Intercepting Routes
| 情境 | 建議 |
| --- | --- |
| 同頁開啟詳細 modal 且可分享 URL | 使用 Intercepting Routes |
| 只是一般 dialog 狀態 | 可留在 local UI state |
| 涉及敏感寫入 | 仍需經 server-side use case |

## Server / Client 規則
- 預設 Server Component。
- Client Component 只用在互動狀態、表單控制、瀏覽器 API。
- page 不等於 use case；slot 不等於 bounded context。
- Server Action、Route Handler 都視為公開端點，每次驗證 identity、tenant、capability 與 resource scope。
- 不在 Client Component 直接寫任職／權限、敏感個資、差勤校正、假額度、簽核決策、薪資、稽核或受控匯出。
- Firebase Admin SDK 路徑不受 Security Rules 保護，必須由 Application policy 授權。
