# 戰略設計 Strategic Design

## 目的
- 先區分業務子域、模型邊界與外部技術，再進入 tactical design。
- 本文件是 Subdomain 分類與投入策略的唯一真相來源；Context 邊界與關係以 `bounded-contexts.md` 為準。

## 基本區分
| 概念 | 回答的問題 | 本專案用法 |
| --- | --- | --- |
| Subdomain | 企業需要解決哪一類業務問題 | 依競爭差異與投入優先級分為 Core、Supporting、Generic |
| Bounded Context | 哪一套模型與語言在何處有效 | 由明確責任、資料所有權與公開契約形成模型邊界 |
| Infrastructure | 用什麼技術實作 | Next.js、Firestore、Storage，不視為 Subdomain 或 Context |

## Subdomain 分類
| 類型 | Subdomain | 對應 Bounded Context / Provider | 分類理由 | 投入與 sourcing |
| --- | --- | --- | --- | --- |
| Core | 出勤管理 | `Attendance` | 出勤規則與異常處理直接影響 HR 營運正確性 | 自建 Domain Model，優先測試規則 |
| Core | 假勤管理 | `Leave` | 額度、期間與核准結果是差勤產品核心語意 | 自建 Domain Model，優先維護一致性 |
| Core | 薪資結算 | `Payroll` | 整合多個上游結果且具高敏感度與正確性要求 | 自建 Domain Model，最高安全與稽核要求 |
| Supporting | 員工與任職關係 | `Employee` | 提供其他 Context 所需的在職、組織與 capability 真相 | 自建但保持簡單，避免成為共用 God Model |
| Supporting | 審批責任解析 | `Approval` | 支援 Leave、Overtime，但不擁有其狀態機 | 自建可重用規則，不建立 generic workflow engine |
| Supporting | 加班管理 | `Overtime` | 必要業務流程，但優先級低於差勤、假勤與薪資 | 自建最小模型，按政策逐步擴充 |
| Supporting | 稽核追蹤 | `Audit` | HR、薪資與權限操作需要專屬追溯語意 | 自建 append-only 能力，由各 Context 發布事實 |
| Generic | 身份驗證 | Firebase Auth（外部 Provider） | 只證明登入身份，非本產品差異化能力 | 採購／使用第三方，以 ACL 隔離 SDK 模型 |

## 跨域政策與技術
| 項目 | 定位 | 規則 |
| --- | --- | --- |
| Security | 跨 Context 架構政策 | 由 server-side actor context、capability guard、rules 與 audit 共同落實，不建立 `Security` Context |
| Firestore | Infrastructure | 只由 adapters 實作 persistence，不得成為 Domain Model |
| Firebase Storage | Infrastructure | 只由 storage adapter 實作，不列為 Generic Subdomain |
| Next.js App Router | UI / driving adapter | page、slot、route group 都不代表 Subdomain 或 Bounded Context |

## 投入原則
- Core Domain 的規則、錯誤與測試優先於 UI 擴充。
- Supporting Domain 只實作當前流程需要的能力，不預建通用平台。
- Generic Domain 優先採用成熟 provider，並以 Anti-Corruption Layer 保護內部語言。
- 調整分類必須有業務差異或 sourcing 策略改變的證據，並同步更新 ADR 與 `bounded-contexts.md`。

## 決策節點
| 問題 | 判斷方式 |
| --- | --- |
| 新需求屬哪個 Subdomain | 先找業務目標與競爭差異，再對應模型邊界 |
| 需要新 Bounded Context 嗎 | 是否出現獨立語言、生命週期、資料所有權或一致性邊界 |
| 只是外部技術嗎 | SDK、資料庫、framework 一律先視為 adapter concern |
| 只是 UI 分頁嗎 | 查 `docs/05-frontend/app-router.md`，不可用 route 結構反推 Domain |
