import type { Clock } from "@/shared/kernel/clock";

import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { CancelLeaveRequestCommand } from "../commands/cancel-leave-request.command";
import { LeaveApplicationError } from "../errors/leave-application-error";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import {
  assertActiveMembership,
  loadLeaveRequest,
} from "./leave-use-case-support";

export class CancelLeaveRequestUseCase {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly transactions: LeaveCommandTransactionPort,
    private readonly clock: Clock,
  ) {}

  async execute(command: CancelLeaveRequestCommand) {
    assertActiveMembership(command.actor);
    const request = await loadLeaveRequest(
      this.repository,
      command.actor.tenantId,
      command.leaveRequestId,
    );
    const snapshotBefore = request.toSnapshot();
    const isSelf =
      command.actor.employeeId === snapshotBefore.employeeId &&
      command.actor.capabilities.includes("leave.cancel.self");
    const isOverride = command.actor.capabilities.includes("leave.override");
    if (!isSelf && !isOverride) {
      throw new LeaveApplicationError(
        "FORBIDDEN",
        "Leave cancellation is not allowed.",
      );
    }
    const overrideReason = command.overrideReason?.trim();
    if (!isSelf && isOverride && !overrideReason) {
      throw new LeaveApplicationError(
        "OVERRIDE_REASON_REQUIRED",
        "An override reason is required.",
      );
    }

    const cancelledAt = this.clock.now();
    request.cancel({
      cancelledBy: command.actor.employeeId ?? command.actor.userId,
      cancelledAt,
      ...(isSelf ? {} : { overrideReason }),
    });
    const snapshot = await this.transactions.commit({
      tenantId: command.actor.tenantId,
      actor: command.actor,
      action: "LeaveRequestCancelled",
      occurredAt: cancelledAt,
      ...(overrideReason ? { auditReason: overrideReason } : {}),
      request,
      domainEvents: request.pullDomainEvents(),
    });
    return { leaveRequestId: snapshot.id, status: snapshot.status } as const;
  }
}
