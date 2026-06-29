# 資料分類與保護

| 等級 | 範例 | 最低要求 |
| --- | --- | --- |
| Public | 公開說明、Firebase public config | 不含 tenant／授權真相 |
| Internal | 非敏感選項、一般組織導覽 | authenticated + tenant scope |
| Personal | 姓名、聯絡方式、任職、排班 | 目的限制、最小欄位、server-side sensitive write |
| Sensitive HR | 請假原因、異常、校正、代理理由 | 精細 capability、遮罩、audit |
| Payroll | input、adjustment、result、薪資單、匯出 | server-only write、嚴格讀取、audit、短效下載 |
| Audit | AuditRecord、政策拒絕、安全事件 | append-only、server-only、遮罩查詢 |
| Security | Membership、Role、Capability、ActorContext | server-side 管理、每次授權、所有異動 audit |

## Client Component 不得直接寫入
- tenant、Membership、Role、Capability、敏感 Employee 欄位。
- Attendance correction／exception、LeaveBalance、Approval decision。
- Payroll、Audit、notification administration、受控匯出 metadata。

## 多租戶
- 每次讀寫同時驗證 actor tenant、resource tenant 與 path tenant。
- 報表、批次與 system job 不得以全域查詢後在記憶體過濾代替 tenant-scoped query。
