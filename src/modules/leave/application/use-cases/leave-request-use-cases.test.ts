import { describe, expect, it } from "vitest";

import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import {
  LeaveRequest,
  type LeaveRequestSnapshot,
} from "../../domain/aggregates/leave-request";
import { MvpLeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { EmployeeLeaveProfileQueryPort } from "../ports/outbound/employee-leave-profile-query-port";
import type { LeaveApprovalQueryPort } from "../ports/outbound/leave-approval-query-port";
import type { LeaveCommandTransactionPort } from "../ports/outbound/leave-command-transaction-port";
import type { LeaveRequestQueryPort } from "../ports/outbound/leave-request-query-port";
import type { LeaveVisibilityQueryPort } from "../ports/outbound/leave-visibility-query-port";
import type { LeaveWorkCalendarQueryPort } from "../ports/outbound/leave-work-calendar-query-port";
import { ApproveLeaveRequestUseCase } from "./approve-leave-request";
import { CancelLeaveRequestUseCase } from "./cancel-leave-request";
import { GetLeaveRequestDetailUseCase } from "./get-leave-request-detail";
import { RejectLeaveRequestUseCase } from "./reject-leave-request";
import { SearchLeaveRequestsUseCase } from "./search-leave-requests";
import { SubmitLeaveRequestUseCase } from "./submit-leave-request";

const now = new Date("2026-06-28T04:00:00.000Z");
const clock: Clock = { now: () => now };

const employeeActor: ActorContext = {
  tenantId: "tenant_test",
  userId: "user-employee",
  employeeId: "EMP-001",
  membershipStatus: "active",
  capabilities: ["leave.submit.self", "leave.cancel.self", "leave.read.self"],
  correlationId: "correlation-employee",
};

const managerActor: ActorContext = {
  tenantId: "tenant_test",
  userId: "user-manager",
  employeeId: "EMP-MANAGER",
  membershipStatus: "active",
  capabilities: ["leave.approve.department", "leave.read.department"],
  correlationId: "correlation-manager",
};

const approval: LeaveApprovalQueryPort = {
  async resolveApprover(input) {
    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      approverId: "EMP-MANAGER",
      source: "manager",
      routeCode: "direct-manager",
      validFrom: "2020-01-01T00:00:00.000Z",
      validUntil: null,
    };
  },
};

const visibility: LeaveVisibilityQueryPort = {
  async getManagedEmployeeIds() {
    return {
      tenantId: "tenant_test",
      employeeIds: ["EMP-001", "EMP-014"],
    };
  },
};

const employeeProfiles: EmployeeLeaveProfileQueryPort = {
  async getEmployeeLeaveSnapshot(input) {
    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      employmentStatus: "active",
      departmentId: "DEPT-001",
      managerId: "EMP-MANAGER",
      timezone: "Asia/Taipei",
      assignedCalendarId: "CAL-001",
      hiredAt: "2020-01-01T00:00:00.000Z",
      terminatedAt: null,
    };
  },
};

const workCalendars: LeaveWorkCalendarQueryPort = {
  async getLeaveWorkCalendar(input) {
    return {
      tenantId: input.tenantId,
      assignedCalendarId: input.assignedCalendarId,
      timezone: input.timezone,
      sourceVersion: "test",
      workingIntervals: [{ startAt: input.startAt, endAt: input.endAt }],
    };
  },
};

function pendingRequest() {
  return LeaveRequest.submit({
    tenantId: "tenant_test",
    employeeId: "EMP-001",
    leaveTypeId: "LT-001",
    leaveTypeCode: "annual-leave",
    startAt: new Date("2026-07-10T01:00:00.000Z"),
    endAt: new Date("2026-07-10T09:00:00.000Z"),
    reason: "Family appointment",
    submittedAt: new Date("2026-06-27T04:00:00.000Z"),
  });
}

class RepositoryFake implements LeaveRequestRepository {
  constructor(private request: LeaveRequest | null = null) {}

  async save(_tenantId: string, request: LeaveRequest) {
    this.request = request;
  }

  async findById() {
    return this.request;
  }

  async hasOverlap() {
    return false;
  }
}

class TransactionFake implements LeaveCommandTransactionPort {
  readonly commits: Parameters<LeaveCommandTransactionPort["commit"]>[0][] = [];
  private replay: LeaveRequestSnapshot | null = null;
  private fingerprint: string | null = null;

  async findIdempotentResult(input: {
    payload: Readonly<Record<string, string>>;
  }) {
    if (!this.replay) return null;
    if (this.fingerprint !== JSON.stringify(input.payload)) {
      throw Object.assign(new Error("Idempotency key reused."), {
        code: "IDEMPOTENCY_KEY_REUSED",
      });
    }
    return this.replay;
  }

  async commit(input: Parameters<LeaveCommandTransactionPort["commit"]>[0]) {
    this.commits.push(input);
    const snapshot = input.request.toSnapshot();
    if (input.idempotency) {
      this.replay = snapshot;
      this.fingerprint = JSON.stringify(input.idempotency.payload);
    }
    return snapshot;
  }
}

describe("Leave request MVP application use cases", () => {
  it("replays an identical submit before overlap and persistence work", async () => {
    const repository = new RepositoryFake();
    const transactions = new TransactionFake();
    const useCase = new SubmitLeaveRequestUseCase(
      repository,
      employeeProfiles,
      workCalendars,
      new MvpLeaveEligibilityPolicy(),
      clock,
      transactions,
    );
    const command = {
      actor: employeeActor,
      leaveTypeId: "LT-001",
      leaveTypeCode: "annual-leave",
      startAt: new Date("2026-08-03T01:00:00.000Z"),
      endAt: new Date("2026-08-03T09:00:00.000Z"),
      reason: "Family appointment",
      idempotencyKey: "idem-submit-1",
    };

    const first = await useCase.execute(command);
    const replay = await useCase.execute(command);

    expect(replay).toEqual(first);
    expect(transactions.commits).toHaveLength(1);
  });

  it("approves and publishes the aggregate event through the transaction port", async () => {
    const request = pendingRequest();
    request.pullDomainEvents();
    const transactions = new TransactionFake();
    const useCase = new ApproveLeaveRequestUseCase(
      new RepositoryFake(request),
      approval,
      transactions,
      clock,
    );

    await expect(
      useCase.execute({ actor: managerActor, leaveRequestId: "leave-1" }),
    ).resolves.toMatchObject({ status: "approved" });
    expect(transactions.commits[0]).toMatchObject({
      action: "LeaveRequestApproved",
      domainEvents: [
        expect.objectContaining({ eventType: "LeaveRequestApproved" }),
      ],
    });
  });

  it("rejects with a reason and allows applicant self-cancel", async () => {
    const rejectionTransactions = new TransactionFake();
    const reject = new RejectLeaveRequestUseCase(
      new RepositoryFake(pendingRequest()),
      approval,
      rejectionTransactions,
      clock,
    );
    await expect(
      reject.execute({
        actor: managerActor,
        leaveRequestId: "leave-1",
        rejectionReason: "Insufficient staffing",
      }),
    ).resolves.toMatchObject({ status: "rejected" });

    const cancel = new CancelLeaveRequestUseCase(
      new RepositoryFake(pendingRequest()),
      new TransactionFake(),
      clock,
    );
    await expect(
      cancel.execute({ actor: employeeActor, leaveRequestId: "leave-1" }),
    ).resolves.toMatchObject({ status: "cancelled" });
  });

  it("requires an override reason outside applicant self-cancel", async () => {
    const cancel = new CancelLeaveRequestUseCase(
      new RepositoryFake(pendingRequest()),
      new TransactionFake(),
      clock,
    );

    await expect(
      cancel.execute({
        actor: {
          ...managerActor,
          employeeId: "EMP-HR",
          capabilities: ["leave.override"],
        },
        leaveRequestId: "leave-1",
      }),
    ).rejects.toMatchObject({ code: "OVERRIDE_REASON_REQUIRED" });
  });

  it("passes resolved visibility to detail and search query ports", async () => {
    const query: LeaveRequestQueryPort = {
      async getDetail(input) {
        expect(input.visibility).toEqual({
          kind: "employees",
          employeeIds: ["EMP-001"],
        });
        return {
          id: input.leaveRequestId,
          employeeId: "EMP-001",
          leaveTypeId: "LT-001",
          leaveTypeCode: "annual-leave",
          startAt: "2026-07-10T01:00:00.000Z",
          endAt: "2026-07-10T09:00:00.000Z",
          status: "pending",
          submittedAt: "2026-06-27T04:00:00.000Z",
          reason: "Family appointment",
          approverId: null,
          approvedAt: null,
          rejectedAt: null,
          rejectionReason: null,
          cancelledBy: null,
          cancelledAt: null,
        };
      },
      async search(input) {
        expect(input.visibility).toEqual({
          kind: "employees",
          employeeIds: ["EMP-001", "EMP-014"],
        });
        return { items: [], page: 1, pageSize: 20, hasNext: false };
      },
    };

    const getDetail = new GetLeaveRequestDetailUseCase(
      query,
      visibility,
      clock,
    );
    const search = new SearchLeaveRequestsUseCase(query, visibility, clock);
    await getDetail.execute({
      actor: employeeActor,
      leaveRequestId: "leave-1",
    });
    await search.execute({
      actor: managerActor,
      criteria: { page: 1, pageSize: 20 },
    });
  });
});
