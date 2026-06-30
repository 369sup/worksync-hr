import type { Clock } from "@/shared/kernel/clock";

import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { RejectLeaveRequestCommand } from "../commands/reject-leave-request.command";
import type { ApprovalAssignmentQueryPort } from "../ports/outbound/approval-assignment-query-port";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import {
  assertResolvedApprover,
  loadLeaveRequest,
} from "./leave-use-case-support";

export class RejectLeaveRequestUseCase {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly approval: ApprovalAssignmentQueryPort,
    private readonly transactions: LeaveCommandTransactionPort,
    private readonly clock: Clock,
  ) {}

  async execute(command: RejectLeaveRequestCommand) {
    const request = await loadLeaveRequest(
      this.repository,
      command.actor.tenantId,
      command.leaveRequestId,
    );
    await assertResolvedApprover({
      actor: command.actor,
      request,
      approval: this.approval,
    });

    const rejectedAt = this.clock.now();
    request.reject({
      approverMembershipId: command.actor.membershipId,
      approverEmployeeId: command.actor.employeeId!,
      rejectedAt,
      rejectionReason: command.rejectionReason,
    });
    const snapshot = await this.transactions.commit({
      tenantId: command.actor.tenantId,
      actor: command.actor,
      action: "LeaveRequestRejected",
      occurredAt: rejectedAt,
      auditReason: command.rejectionReason.trim(),
      request,
      domainEvents: request.pullDomainEvents(),
    });
    return { leaveRequestId: snapshot.id, status: snapshot.status } as const;
  }
}
