# 戰略設計 Strategic Design

## Problem
- 將完整差勤薪資範圍切成可維護的語言與資料所有權邊界，不以 route、collection 或組織部門代替 Bounded Context。

## Subdomain 分類
| 類型 | Subdomain / Context | 分類理由 | 投入策略 |
| --- | --- | --- | --- |
| Core | Attendance | 工作日、打卡、異常與結算正確性直接影響差勤結果 | 自建規則與高覆蓋 Domain tests |
| Core | Leave | 假別、額度與申請狀態是差勤核心 | 自建一致性模型與版本化政策 |
| Core | Overtime | 加班有效性與補償方式直接影響假額度及薪資 | 自建，明確隔離 Leave／Payroll |
| Core | Payroll | 收斂多上游結果並產生高敏感計算結果 | 自建，最高安全與可追溯要求 |
| Supporting | Employee | 提供員工主檔，不承擔組織、權限或薪資規則 | 保持小型 Aggregate |
| Supporting | Organization | 擁有組織、任職、主管、Role、Capability 真相 | 自建 tenant-safe membership model |
| Supporting | Schedule | 擁有 Shift 與發布後的 WorkSchedule | 自建版本化排班，不塞入 Attendance |
| Supporting | Approval | 解析審批與代理責任，不擁有請假／加班狀態 | 明確 use case，不建通用流程引擎 |
| Generic | Audit | 保存跨域敏感操作事實 | append-only、受控查詢與匯出 |
| Generic | Notification | 投遞通知與保存 delivery status | Phase 5 實作；不影響業務 transaction |
| Generic / Cross-cutting | Auth、Security、File | 通用身份 provider、授權政策與檔案能力 | Firebase provider + ACL／adapter |

## 不建立的 Context
| 候選 | 決策 | 原因 |
| --- | --- | --- |
| System Settings | 不建立中央 Context | LeaveType、Shift、PayrollRule 各自屬於其 Domain；集中會形成設定 God Model |
| Security | 作為跨 Context policy | 授權由 server adapter、ActorContext 與 capability guard 落實；Audit 保持獨立 |
| File | 作為 Service Port／Storage adapter | 檔案沒有獨立 HR 語言或生命周期需求 |
| UI route / slot | 不屬於 Domain | 只負責畫面 composition |

## Trade-offs
- 十個 Context 足以隔離語言與生命週期；不再為每個資料表拆 Context。
- 採 Snapshot／Query Port 與同程序 Domain Event；只有可靠跨服務投遞需求被證明後才評估 Outbox 或 broker。
- Query Read Model 不等於完整 CQRS；目前不拆獨立 command/query datastore。
