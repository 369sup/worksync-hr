# 全系統開發放行標準

## 文件 Gate
| Gate | 通過條件 |
| --- | --- |
| Scope | 系統內外範圍、五個 Phase 與依賴有唯一答案 |
| Strategic | Core／Supporting／Generic 分類及十個 Context 責任明確 |
| Tactical | 每個 Context 有 Aggregate、VO、Event、Repository Port |
| Integration | 每條 Context Map 邊有 Producer、Consumer、契約與一致性策略 |
| Application | Use Case 有 actor、input、output、ports、errors、audit |
| Security | `TenantId` 可信任且 server-side；敏感寫入不可由 Client 直寫 |
| Persistence | Domain、Firestore Document、Read Model 三者分離並有 mapper |

## 資料類型判定
| 類型 | 例子 | 規則 |
| --- | --- | --- |
| Domain Aggregate | `Employee`, `Membership`, `AttendanceRecord`, `PayrollResult` | 行為與不變條件；不含 SDK 型別 |
| Firestore Document | `tenants/{tenantId}/attendance_records/{id}` | adapter persistence shape；由 mapper 轉換 |
| Read Model | `SalarySlipView`, `AttendanceCalendarView`, `ApprovalQueueItem` | UI／報表最佳化；不可承擔 command rule |
| Published Language | `WorkScheduleSnapshot`, `ApprovedLeaveSummary` | 跨 Context 不可變契約；具 tenant 與 version |

## 第一批開發切片
| Use Case | Input | Output | Ports | Audit |
| --- | --- | --- | --- | --- |
| `HireEmployee` | actor、employee profile | `EmployeeSnapshot` | `EmployeeRepository`, `AuditPort` | 必須 |
| `CreateOrganizationUnit` | actor、parentId、name、effective period | unit ID/version | `OrganizationUnitRepository`, `AuditPort` | 必須 |
| `AssignMembership` | actor、employeeId、unitId、role/capability | `OrganizationMembershipSnapshot` | Employee query、Membership repository、Audit | 必須 |
| `ResolveActorContext` | authenticated identity、request metadata | `ActorContext` | identity、membership query | denied 必須 |
| `RecordPunch` | actor、timestamp、punch type | attendance record ID/status | membership、schedule query、attendance repository、clock | 衝突／補登必須 |

## Client 禁止寫入
- tenant、Membership、Role、Capability 與敏感 Employee 欄位。
- Attendance correction／exception resolution、LeaveBalance、Approval decision。
- PayrollInput、PayrollAdjustment、PayrollResult、AuditRecord、受控匯出。

## Audit 必要情境
- 權限與任職異動、敏感個資異動、校正／override、審批／代理、Payroll 全生命周期。
- 敏感讀取、denied／failed policy、匯出請求與完成結果。

## 尚待需求但不阻擋邊界
- 各法域假別數值、遲到門檻、加班倍率、薪資公式、扣繳與保險參數。
- 通知 channel provider、保存期限、報表版型與自動化排程。
