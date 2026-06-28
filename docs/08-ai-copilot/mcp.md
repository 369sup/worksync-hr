# MCP

## 目的
- 定義外部工具使用順序與推薦清單。

## Context7 規則
| 主題 | 規則 |
| --- | --- |
| Next.js | 先用 Context7 查 App Router、Parallel Routes、Server Actions 官方文件 |
| Firebase | 先查 Auth、Firestore、Storage、Rules 官方文件 |
| shadcn/ui | 先查元件官方文件與 CLI / 組合方式 |
| 原則 | 查完官方文件後，仍要回到本 repo 的 DDD / Security 規則判斷 |

## MCP 建議清單
| 工具 | 用途 |
| --- | --- |
| GitHub | PR、issue、CI、review comments |
| Context7 | Next.js、Firebase、shadcn/ui 官方文件 |
| Firebase / Google Cloud | emulator、rules、部署相關查詢 |
| Playwright | UI 行為與流程驗證 |
| Filesystem | 讀 repo、比對 docs、檢查結構 |

## 使用原則
- 先讀 repo 再查外部工具。
- 外部資訊只作輔助，最終以本 repo canonical docs 為準。
- 若外部建議違反 DDD / Hexagonal / Security 邊界，應拒絕採用。
