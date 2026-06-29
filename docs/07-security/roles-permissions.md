# Roles & Permissions

## 目的
- 定義 Role、Capability、敏感資料讀寫與 trusted actor 邊界。

## Role vs Capability
| 概念 | 說明 |
| --- | --- |
| Role | 人在組織中的職責身分，例如 `Employee`、`Manager`、`HR` |
| Capability | 系統允許執行的具體能力，例如 `leave.approve.team`、`payroll.run` |
| 原則 | Auth 只證明 identity；role / capability 必須由 server-side actor context 解析 |

## 權限矩陣
| Capability | Employee | Manager | HR | Payroll Admin | System Admin |
| --- | ---: | ---: | ---: | ---: | ---: |
| `attendance.record.self` | ✓ | ✓ | ✓ |  | ✓ |
| `attendance.read.team` |  | ✓ | ✓ |  | ✓ |
| `leave.submit.self` | ✓ | ✓ | ✓ |  | ✓ |
| `leave.approve.team` |  | ✓ | ✓ |  | ✓ |
| `leave.override` |  |  | ✓ |  | ✓ |
| `overtime.approve.team` |  | ✓ | ✓ |  | ✓ |
| `payroll.run` |  |  | ✓ | ✓ | ✓ |
| `payroll.read.detail` |  |  | ✓ | ✓ | ✓ |
| `audit.read` |  |  | ✓ | ✓ | ✓ |
| `permissions.manage` |  |  |  |  | ✓ |

## 讀寫 / 匯出規則
| 資料類型 | 可讀 | 可寫 | 可匯出 |
| --- | --- | --- | --- |
| 個人出勤 / 請假 | self、授權 manager、HR | server-side use case | 受 actor capability 限制 |
| 薪資明細 | HR、Payroll Admin、System Admin | server-side only | 嚴格 capability + audit |
| audit log | HR、Payroll Admin、System Admin | append-only server-side | 嚴格 capability + audit |
| 權限設定 | System Admin | server-side only | 嚴格 capability + audit |

## 禁止事項
- Employee 不可自我核准。
- Client Component 不可直接寫入薪資、權限、稽核、敏感個資。
- 沒有明確 capability 的操作一律拒絕。
- Security 是跨 Context policy；role 與 capability 真相由 Employee 的 Membership 擁有，不建立 Security Context。
