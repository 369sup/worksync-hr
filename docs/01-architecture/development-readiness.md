# 全 Context 開發放行標準

## 目的
- 定義「架構與契約可開工」的最低條件，避免以檔案存在或目錄標示 Ready 取代實質驗證。
- 細部 HR 政策可列為後續需求，但不得讓 Context 邊界、資料所有權或公開契約保持歧義。

## 文件閘門
| Gate | 通過條件 |
| --- | --- |
| Subdomain | Core、Supporting、Generic 均有分類、理由、投入與 sourcing 策略 |
| Bounded Context | 七個內部 Context 各有唯一責任與資料 owner；Security 不被建模成 Context |
| Ubiquitous Language | Aggregate、公開 DTO、Repository Port 與事件在 glossary 有唯一名稱 |
| Context Map | 每條邊有上游、下游、pattern、契約、同步性與失敗／一致性策略 |
| Hexagonal boundary | Domain 不依賴 Next.js、React、Firebase；跨 Context 不共享 Aggregate 或 document |
| Application contract | 每個首批 use case 有 actor、input、output、ports 與 error mapping |
| Security | 敏感寫入 server-only；角色／capability 由 trusted actor context 解析；必要操作可 audit |
| Frontend | page／slot 不代表 Context；每個 named slot 都有 `default.tsx` |

## Context 驗收情境
| Context | Happy path | 拒絕／衝突 | 跨 Context 契約 |
| --- | --- | --- | --- |
| Employee | 建立 Employee 與啟用 Membership | 無 capability 不得修改角色；inactive membership 不得使用 | 產生版本化 `EmployeeProfileSnapshot`／`EmployeePayrollSnapshot` |
| Attendance | 有效員工打卡並 finalize 工作日 | 重複打卡、非法校正、未 finalize 不得供 Payroll 使用 | 消費 `EmployeeProfileSnapshot`、`ApprovedLeaveSummary`；發布 `FinalizedAttendanceSummary` |
| Leave | 提交、核准、取消請假並更新額度 | 非 approver、重疊期間、額度不足或非法狀態轉移 | 消費 `ApprovalAssignmentResult`；發布 `ApprovedLeaveSummary`；冪等接收 `CompensatoryLeaveGrant` |
| Approval | 解析 approver、套用有效 delegation | 無責任人、代理過期、自我核准時拒絕 | 發布 `ApprovalAssignmentResult`；不修改 Leave／Overtime 狀態 |
| Overtime | 核准後發布薪資調整或補休 | 未核准不得發布；同一決策不可重複轉換 | 消費 attendance／approval；發布 `OvertimeAdjustment` 或 `CompensatoryLeaveGrant` |
| Payroll | 固定 input version、計算、覆核、發布 | 上游未 finalized、版本漂移、未覆核不得發布 | 只消費三種 Published Language 與 employee payroll snapshot，不回寫上游 |
| Audit | append、查詢、受控匯出 audit record | Client write、覆寫、越權查詢或匯出一律拒絕 | 接收 `AppendAuditRecord`／events；永不成為授權真相來源 |

## 可延後但必須明示的政策
- 假別額度數值、遲到門檻、加班換算倍率、薪資公式與法規參數可由後續需求決定。
- 延後政策必須透過 Domain policy／Value Object 或設定 port 落地，不得以 Firebase 欄位或 UI 條件取代。
- 若政策改變 Aggregate 邊界、資料 owner 或 Published Language，必須先更新 strategic docs 並評估 ADR。

## 自動驗證
```txt
pnpm docs:check
pnpm lint
pnpm typecheck
pnpm build
```

`docs:check` 必須同時檢查 canonical fragments、禁止命名，以及所有 Mermaid fenced blocks 的 declaration、括號、引號與 fence 結構。修改過的圖仍須在支援 Mermaid 的 renderer 抽查。

## Definition of Ready
- 上述文件閘門與 Context 情境均可從 canonical docs 找到唯一答案。
- `docs:check`、lint、typecheck、build 全部通過。
- working tree 不包含驗證過程產生的未追蹤 cache。
- 未完成的細部政策被標示為非 boundary-breaking backlog，不得以「候選模型」保留架構決策。
