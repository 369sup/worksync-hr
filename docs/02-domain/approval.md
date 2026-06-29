# Approval Domain

## 邊界
| 負責 | 不負責 |
| --- | --- |
| ApprovalAssignment、Approver、Delegate、有效期間、責任解析 | 通用 workflow、Leave／Overtime 狀態、Role／Capability 真相 |

## 模型
| 類型 | 模型 |
| --- | --- |
| Aggregate | `ApprovalAssignment` |
| Value Object | `Approver`, `Delegate`, `ApprovalTargetRef`, `DelegateWindow`, `AssignmentStatus` |
| Domain Event | `ApprovalAssigned`, `ApprovalDelegated`, `ApprovalEscalated`, `ApprovalDecisionRecorded` |
| Public contract | `ApprovalAssignmentResult` |
| Ports | `ApprovalAssignmentRepository`, `ApprovalAssignmentQueryPort` |

## 規則
- 以 Organization membership snapshot 解析責任，驗證 tenant、capability、scope、代理有效期與禁止自我核准政策。
- `RecordApprovalDecision` 只記錄責任已履行；來源 Context 的 approve／reject Use Case 才能改變來源 Aggregate。
- 不建立可配置任意流程節點的 Approval Engine；新流程先以明確 Use Case 接入。
