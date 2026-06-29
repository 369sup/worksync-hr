# 1HR 系統願景

## Problem
- HR 資料分散在員工主檔、排班、差勤、請假、加班與薪資流程，造成重複輸入、責任不清與結果難以追溯。
- 多租戶 SaaS 必須同時保護企業間隔離、員工個資、權限與薪資資料，不能只依賴前端或 Firebase Auth。

## Assumptions
- 每筆業務資料只屬於一個 `TenantId`；`TenantId` 由 server-side `ActorContext` 提供，不接受 Client 自報。
- 規則採法域中立設計；假別、班別、加班與薪資公式由其 owner Context 版本化。
- Payroll 管理計算與薪資單，不負責銀行撥薪、報稅、保險申報或會計總帳。

## Design
- 以 Employee、Organization 建立可信任人員與任職基礎。
- 以 Schedule、Attendance、Leave、Overtime、Approval 完成差勤流程。
- Payroll 只收斂上游已發布 Snapshot／Summary，產生可覆核、可追溯的薪資結果。
- Audit 保存敏感操作事實；Notification 只傳遞結果，不決定業務狀態。
- Next.js 與 Firebase 都是 adapter concern；Domain Model 不依賴框架或 document shape。

## Trade-offs
- 系統範圍完整，但依五個 Phase 交付，不要求一次完成。
- 保留明確 Context 與 Port，不建立 generic workflow engine、中央設定 God Context 或預防性分散式架構。
