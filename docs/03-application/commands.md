# Commands

## 目的
- 列出會改變狀態的 application commands。

## 圖解
- 典型 command：ClockIn、ClockOut、SubmitLeaveRequest、ApproveRequest、RunPayroll。

## 規則
- Command 名稱使用動詞開頭。
- Command handler 只做 orchestration，不放 Firebase 細節。

## 範例
- `SubmitLeaveRequest` 會建立 LeaveRequest 並觸發 ApprovalRequest。

## 維護注意事項
- Command 若跨 context，需補充權限與稽核影響。
