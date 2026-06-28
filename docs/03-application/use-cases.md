# Use Cases

## 目的
- 列出主要 use case 與流程邊界。

## 圖解
### 員工打卡
```mermaid
sequenceDiagram
  actor E as Employee
  participant UI
  participant UC as ClockIn/ClockOut Use Case
  participant Repo as Attendance Port
  E->>UI: 送出打卡
  UI->>UC: 呼叫 use case
  UC->>Repo: 儲存 / 讀取紀錄
```

### 請假申請
```mermaid
sequenceDiagram
  actor E as Employee
  participant UI
  participant UC as SubmitLeaveRequest
  participant Repo as Leave Port
  participant Ap as Approval Port
  E->>UI: 送出請假
  UI->>UC: 建立申請
  UC->>Repo: 儲存草稿/申請
  UC->>Ap: 建立審批請求
```

### 加班申請
```mermaid
sequenceDiagram
  actor E as Employee
  participant UI
  participant UC as SubmitOvertimeRequest
  participant Repo as Attendance Port
  participant Ap as Approval Port
  E->>UI: 送出加班申請
  UI->>UC: 呼叫 use case
  UC->>Repo: 保存加班資料
  UC->>Ap: 建立審批
```

### 薪資結算
```mermaid
sequenceDiagram
  actor HR
  participant UI
  participant UC as RunPayroll
  participant Ports as Attendance/Leave/Payroll Ports
  HR->>UI: 啟動結算
  UI->>UC: 呼叫 use case
  UC->>Ports: 讀取核准資料並寫入 payroll
```

## 規則
- Use case 不含 Firebase SDK。
- 每個流程只暴露必要輸入與輸出。

## 範例
- `RunPayroll` 讀取 Attendance、Leave、Payroll ports。

## 維護注意事項
- 新流程先補本文件，再決定是否需要新 port。
