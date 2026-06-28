# 路線圖

## 目的
- 記錄高層級推進順序，避免把 roadmap 寫成實作 backlog。

## 圖解
- Phase 1：Employee、Leave、Attendance、Approval 的最小垂直切片。
- Phase 2：Overtime、Payroll 與更完整的 Firestore / rules 治理。
- Phase 3：Audit、deployment hardening、automation、可觀測性與進階治理。

## 規則
- 路線圖描述方向與依賴，不承諾日期。
- 先穩定 canonical docs、邊界與驗證 gate，再擴充新流程。
- 若要調整核心先後順序，先更新需求、bounded contexts 與必要 ADR。

## 範例
- 先完成可信任 actor、請假與出勤協作，再把加班與薪資接到已公開契約上。

## 維護注意事項
- 完成事項可標記階段狀態，但不要把 issue 清單直接複製進來。
