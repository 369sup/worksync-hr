# shadcn/ui

## 目的
- 定義 shadcn/ui 元件使用順序與放置規範。

## 放置規範
| 類型 | 建議位置 |
| --- | --- |
| 原生 shadcn/ui primitives | `src/components/ui/**` |
| 跨頁可重用組件 | `src/components/<feature>/**` |
| 頁面專用組件 | 對應 route group / page 附近 |

## 使用原則
- 先重用既有 primitive / variant，再新增 feature component。
- 不把 shadcn/ui variant 命名成 Domain 概念真相來源。
- Dialog、Sheet、Table、Form 等互動元件可放 Client Component，但 sensitive submit 仍走 server-side。
- layout 與 slot 只是畫面組合；component 命名不能取代 use case 或 bounded context 設計。
