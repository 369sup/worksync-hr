# Roles、Capabilities 與 ActorContext

## 所有權
- Organization Context 的 Membership 擁有 Role／Capability assignment 真相。
- Security 是跨 Context policy；Firebase Auth 只證明 identity，不能直接授權 HR 行為。
- `ActorContext` 由 server-side identity + Membership 組成；Client 不得自報 tenant、Role、Capability 或 scope。

## 基準角色矩陣
Role 只是 Capability 配置起點；最終授權一律檢查 capability 與 resource scope。

| Capability | Employee | Manager | HR | Payroll Admin | System Admin |
| --- | ---: | ---: | ---: | ---: | ---: |
| `attendance.record.self` | ✓ | ✓ | ✓ |  | ✓ |
| `attendance.correct.team` |  |  | ✓ |  | ✓ |
| `schedule.manage` |  | ✓ | ✓ |  | ✓ |
| `leave.submit.self` | ✓ | ✓ | ✓ |  | ✓ |
| `leave.approve.team` |  | ✓ | ✓ |  | ✓ |
| `leave.balance.adjust` |  |  | ✓ |  | ✓ |
| `overtime.submit.self` | ✓ | ✓ | ✓ |  | ✓ |
| `overtime.approve.team` |  | ✓ | ✓ |  | ✓ |
| `payroll.run` |  |  |  | ✓ | ✓ |
| `payroll.read.detail` |  |  |  | ✓ | ✓ |
| `audit.read` |  |  | ✓ | ✓ | ✓ |
| `permissions.manage` |  |  |  |  | ✓ |

## 授權順序
1. 驗證 Firebase identity。
2. 解析有效 tenant Membership。
3. 建立 `ActorContext`。
4. 驗證 capability、self/team/tenant scope、target tenant 與 aggregate state。
5. 執行 Use Case 並記錄必要 AuditRecord。

## 禁止事項
- Employee 不可自我核准；Delegate 必須在有效 assignment window 內。
- 任何未明確允許的跨 tenant、跨 scope、敏感欄位操作一律拒絕。
- UI 隱藏按鈕、Firebase custom claim 或 route group 都不是最終授權。
