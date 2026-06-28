# Firestore Schema

## 目的
- 定義 collections、敏感欄位標示與 mapper / rules 的共同依據。

## 命名規範
| 規則 | 範例 |
| --- | --- |
| collection 使用小寫複數 + 底線 | `leave_requests`, `salary_slips` |
| 欄位使用 snake_case | `employee_id`, `occurred_at` |
| 參照欄位明示 target | `payroll_period_id`, `approver_id` |
| 敏感欄位以 `sensitive:` 清單註記 | 供 rules / mapper / query 對齊 |

## 主要 collections
| Collection | Owner | 主要欄位 | sensitive |
| --- | --- | --- | --- |
| `employees` | Employee | `employee_id`, `department_id`, `employment_status`, `manager_id` | `role_snapshot`, `capability_snapshot`, `personal_contact` |
| `attendance_records` | Attendance | `employee_id`, `work_date`, `punches`, `status` | `anomalies`, `correction_reason` |
| `leave_requests` | Leave | `employee_id`, `leave_type_id`, `period`, `status` | `reason`, `override_reason` |
| `overtime_requests` | Overtime | `employee_id`, `period`, `compensation_mode`, `status` | `reason`, `compensation_result` |
| `approval_assignments` | Approval | `resource_type`, `resource_id`, `approver_id`, `delegate_id`, `status` | `decision_reason` |
| `payroll_periods` | Payroll | `period`, `status`, `input_version` | `gross_total`, `net_total`, `banking_batch_ref` |
| `salary_slips` | Payroll | `payroll_period_id`, `employee_id`, `published_at` | `gross_pay`, `net_pay`, `deductions`, `bank_account_masked` |
| `audit_logs` | Audit | `actor_id`, `action`, `target_type`, `target_id`, `occurred_at`, `result` | `reason`, `metadata` |

## Mapper 規則
- Firestore timestamp、reference、document ID 由 adapter 轉成 Domain / application 型別。
- `read model` 可扁平化，但 `aggregate write model` 仍要保留語意邊界。
- 新增 sensitive 欄位時，同步更新 `firestore-rules.md`、`data-classification.md`、`audit.md`。
