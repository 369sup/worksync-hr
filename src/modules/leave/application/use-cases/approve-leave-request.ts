import type { Clock } from "@/shared/kernel/clock";

import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { ApproveLeaveRequestCommand } from "../commands/approve-leave-request.command";
import type { ApprovalAssignmentQueryPort } from "../ports/outbound/approval-assignment-query-port";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import {
  assertResolvedApprover,
  loadLeaveRequest,
} from "./leave-use-case-support";

export class ApproveLeaveRequestUseCase {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly approval: ApprovalAssignmentQueryPort,
    private readonly transactions: LeaveCommandTransactionPort,
    private readonly clock: Clock,
  ) {}

  async execute(command: ApproveLeaveRequestCommand) {
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

    const approvedAt = this.clock.now();
    request.approve({
      approverMembershipId: command.actor.membershipId,
      approverEmployeeId: command.actor.employeeId!,
      approvedAt,
    });
    const snapshot = await this.transactions.commit({
      tenantId: command.actor.tenantId,
      actor: command.actor,
      action: "LeaveRequestApproved",
      occurredAt: approvedAt,
      request,
      domainEvents: request.pullDomainEvents(),
    });
    return { leaveRequestId: snapshot.id, status: snapshot.status } as const;
  }
}
