# Ubiquitous Language 詞彙表

## 使用規則
- 所有公開契約都必須包含 `tenantId` 與必要的 `version`；`TenantId` 由可信任 `ActorContext` 取得。
- 同名詞跨 Context 若語意不同，必須使用 Context 限定名稱。
- Snapshot／Summary 是不可變 Published Language，不是上游 Aggregate 或 Firestore document。

| Term | 中文名稱 | 定義 | Context | 使用情境 | 不可誤解為 | 程式命名建議 |
| --- | --- | --- | --- | --- | --- | --- |
| TenantId | 租戶識別 | SaaS 資料與授權的最高隔離鍵 | Cross-cutting | 所有 command、query、port、snapshot | Client 可任意指定的欄位 | `TenantId` |
| AuthenticatedIdentity | 已驗證身份 | Identity ACL 驗證 Firebase token 後的最小身份證明 | Application | 組成 ActorContext 前 | Employee、Membership 或授權結果 | `AuthenticatedIdentity` |
| Employee | 員工 | 具持續身份的員工主檔 Aggregate | Employee | 建立、更新、停用員工 | Firebase User 或 Membership | `Employee` |
| OrganizationUnit | 組織單位 | tenant 內具階層與有效期間的組織 Aggregate | Organization | 部門、單位調整 | UI 群組或 Firebase collection | `OrganizationUnit` |
| Membership | 任職身分 | Employee 在 tenant／組織中的任職、主管與權限關係 Aggregate | Organization | ActorContext、在職判定 | Employee 本身或登入 session | `Membership` |
| Role | 角色 | 一組職責標籤，用來配置 Capability | Organization | HR、Manager、Payroll Admin | 最終授權判定 | `Role` |
| Capability | 能力 | 可執行特定動作與 scope 的最小授權單位 | Organization / Security policy | server-side guard | UI 可見性或 Role 名稱 | `Capability` |
| ActorContext | 行為者上下文 | 由 identity、tenant、Membership、Capability 組成的可信任 application input | Application | 每個受保護 Use Case | Client payload 或 Firebase claims 原樣 | `ActorContext` |
| Shift | 班別 | 版本化工作時段、休息與跨日規則 Aggregate | Schedule | 定義可排入工作日的班別 | 實際出勤紀錄 | `Shift` |
| WorkSchedule | 工作排班 | 某員工於日期範圍的已發布排班 Aggregate | Schedule | 發布與修訂排班 | AttendanceRecord | `WorkSchedule` |
| WorkDay | 工作日 | 排班中某日期的班別指派 Entity | Schedule | 指定 employee、date、shift | 日曆日期或 Punch | `WorkDay` |
| Punch | 打卡 | 不可變的進出時間事實 Entity | Attendance | 上班、下班或核准補登 | 完整出勤結果 | `Punch` |
| AttendanceRecord | 出勤紀錄 | 某員工某工作日的出勤一致性 Aggregate | Attendance | 打卡、異常、校正、結算 | Firestore document | `AttendanceRecord` |
| AttendanceException | 出勤異常 | 排班、打卡、請假結果不一致的具狀態 Entity | Attendance | 缺卡、遲到、重疊 | 系統錯誤或任意 anomaly | `AttendanceException` |
| AttendanceSummary | 出勤摘要 | 對 UI 或跨域公開的不可變差勤結果 | Attendance | Payroll、Overtime、報表 | 可修改的 AttendanceRecord | `FinalizedAttendanceSummary` |
| LeaveRequest | 請假申請 | 一次請假意圖與狀態轉移 Aggregate | Leave | 提交、核准、駁回、取消 | ApprovalAssignment | `LeaveRequest` |
| LeaveType | 假別 | Leave 擁有的版本化資格與計量政策 Aggregate | Leave | 特休、病假等 tenant 設定 | 全域 System Setting | `LeaveType` |
| LeaveBalance | 假額度 | 員工、假別、效期下的額度與異動 Aggregate | Leave | 授予、扣抵、返還、調整 | LeaveRequest 欄位或計算快取 | `LeaveBalance` |
| OvertimeRequest | 加班申請 | 一次加班期間、理由、核定與補償決策 Aggregate | Overtime | 申請與核定加班 | AttendanceRecord | `OvertimeRequest` |
| CompensationMode | 補償方式 | 核定為薪資或補休的 Value Object | Overtime | 核准加班後產生結果 | Payroll 計算公式 | `CompensationMode` |
| ApprovalAssignment | 審批責任 | 目標資源在有效期間內的責任指派 Aggregate | Approval | 解析、代理、升級責任 | Leave／Overtime 狀態機 | `ApprovalAssignment` |
| ApprovalAssignmentResult | 審批責任結果 | Approval 對外公開的不可變責任解析結果 | Approval | Leave／Overtime 決策前查詢 | ApprovalAssignment Aggregate | `ApprovalAssignmentResult` |
| Approver | 審批人 | 具有效 assignment 與 capability 的責任人 Value Object | Approval | 執行決策前驗證 | 任意 Manager | `Approver` |
| Delegate | 代理人 | 在有效期間代行指定審批責任的 Value Object | Approval | 請假代理、責任轉移 | 永久 Role 或替代 Employee | `Delegate` |
| PayrollPeriod | 薪資期間 | 計薪窗口、輸入版本與整體狀態 Aggregate | Payroll | 開啟、凍結、覆核、發布 | 月份字串或 SalarySlip | `PayrollPeriod` |
| PayrollInput | 薪資輸入 | 某員工於期間內收斂的版本化不可變輸入 | Payroll | 保存上游 Snapshot 版本 | 上游 Aggregate 或即時查詢結果 | `PayrollInput` |
| PayrollResult | 薪資結果 | 某員工、期間的計算結果 Aggregate | Payroll | 計算、調整、覆核、發布 | 薪資期間或匯款結果 | `PayrollResult` |
| PayrollAdjustment | 薪資調整項 | 具原因、金額、來源與 audit 關聯的 Result 子 Entity | Payroll | 人工或核准來源調整 | 上游 OvertimeAdjustment | `PayrollAdjustment` |
| AuditRecord | 稽核紀錄 | 不可覆寫的敏感操作、讀取或拒絕事實 Aggregate | Audit | 查詢、匯出、治理 | 一般 application log | `AuditRecord` |
| ApprovedLeaveSummary | 已核准請假摘要 | Leave 對 Attendance／Payroll 公開的版本化結果 | Leave | 排除工作時間、收斂薪資輸入 | LeaveRequest Aggregate | `ApprovedLeaveSummary` |
| OvertimeAdjustment | 加班調整結果 | Overtime 對 Payroll 公開的已核定薪資補償摘要 | Overtime | 收斂 PayrollInput | PayrollAdjustment | `OvertimeAdjustment` |
| CompensatoryLeaveGrant | 補休授予舊名 | `CompensatoryLeaveGrant` 是 `CompensatoryLeaveGranted` 的 deprecated compatibility alias | Overtime / Leave | 僅供舊檢查器與遷移文件 | 新事件 canonical 名稱 | `CompensatoryLeaveGranted` |
| AppendAuditRecord | 追加稽核輸入 | `AuditPort` 接收的 application input DTO | Audit | server-side 留痕 | AuditRecord Aggregate | `AppendAuditRecord` |
| AuditFactRecorded | 稽核事實已記錄 | 可供同程序 handler 消費的已記錄事實 | Audit | audit 後續處理 | Outbox 或 Event Sourcing | `AuditFactRecorded` |
| NotificationDelivery | 通知投遞 | 一次訊息投遞及重試狀態 Aggregate | Notification | Email／站內通知 | 業務決策或來源事件 | `NotificationDelivery` |
| Snapshot | 快照 | 上游在特定版本公開的不可變事實 | Cross-context | 執行與重現下游計算 | 上游 Entity 的共享參照 | `<Subject>Snapshot` |
| RepositoryPort | 儲存庫埠 | 以 Aggregate 語意載入與保存的 Driven Port | Application | command orchestration | 資料表 DAO 或 generic repository | `<AggregateRoot>Repository` |
| QueryPort | 查詢埠 | 回傳 Snapshot、Summary 或 Read Model 的 Driven Port | Application | 跨 Context／UI 查詢 | 他域 Repository | `<PublishedLanguage>QueryPort` |
| DomainEvent | 領域事件 | Aggregate 已完成之業務事實，使用過去式命名 | Domain | 同程序後續處理或轉為整合事件 | Message Broker、AuditRecord 或 command | `<Subject><PastTense>` |
| IntegrationEvent | 整合事件 | 版本化、可冪等消費的跨 Context Published Language | Application | Overtime → Leave、通知 | Domain Entity 序列化 | `<Context>.<Event>.vN` |

## 禁止命名
- 不使用 `AttendanceAnomaly`、`LeaveBalanceLedger`、`SalarySlip` 指稱 Aggregate。
- 不使用 `PayrollRepository`、`ApprovalQueryPort`、`FirestoreDoc` 或 `FirebaseUser` 作為核心契約。
- `SalarySlipView` 僅可作為已發布 `PayrollResult` 的 Read Model。
- `EmployeeProfileSnapshot`、`EmployeePayrollSnapshot` 僅為舊檢查器相容別名；新實作使用 `OrganizationMembershipSnapshot`、`PayrollMembershipSnapshot`。
