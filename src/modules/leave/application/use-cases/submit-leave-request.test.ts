import { describe, expect, it, vi } from "vitest";

import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import type { LeaveRequest } from "../../domain/aggregates/leave-request";
import type { LeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { EmployeeSnapshotQueryPort } from "../ports/outbound/employee-snapshot-query-port";
import type { WorkScheduleSnapshotQueryPort } from "../ports/outbound/work-schedule-snapshot-query-port";
import { SubmitLeaveRequestUseCase } from "./submit-leave-request";

class RecordingRepository implements LeaveRequestRepository {
  saved: LeaveRequest | undefined;
  overlap = false;

  async save(_tenantId: string, request: LeaveRequest) {
    this.saved = request;
  }

  async findById() {
    return null;
  }

  async hasOverlap() {
    return this.overlap;
  }

  async commit(input: { request: LeaveRequest }) {
    this.saved = input.request;
    return input.request.toSnapshot();
  }

  async findIdempotentResult() {
    return null;
  }
}

const actor: ActorContext = {
  tenantId: "tenant_test",
  userId: "firebase-user-1",
  employeeId: "EMP-001",
  membershipId: "MEM-001",
  membershipStatus: "active",
  capabilities: ["leave.submit.self"],
  scope: { kind: "self" },
  requestId: "request-1",
  requestSource: "api",
};

const employees: EmployeeSnapshotQueryPort = {
  async getEmployeeSnapshot(input) {
    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      status: "active",
      displayName: "Employee One",
      version: 1,
    };
  },
};

const workSchedules: WorkScheduleSnapshotQueryPort = {
  async getWorkScheduleSnapshot(input) {
    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      dateRange: { startAt: input.startAt, endAt: input.endAt },
      workDays: [
        {
          date: "2026-07-02",
          workingIntervals: [{ startAt: input.startAt, endAt: input.endAt }],
        },
      ],
      scheduleVersion: 1,
    };
  },
};

const leaveTypes = {
  async getLeaveTypeSnapshot(input: { tenantId: string; leaveTypeId: string }) {
    return {
      tenantId: input.tenantId,
      leaveTypeId: input.leaveTypeId,
      code: "annual-leave",
      status: "active" as const,
      version: 1,
    };
  },
};

const identifiers = { generate: () => "leave_generated" };

describe("SubmitLeaveRequestUseCase", () => {
  it("uses trusted ActorContext and persists a tenant-scoped request", async () => {
    const repository = new RecordingRepository();
    const now = new Date("2026-06-28T02:00:00.000Z");
    const clock: Clock = { now: () => now };
    const eligibilityPolicy: LeaveEligibilityPolicy = {
      assertEligible: vi.fn(),
    };
    const useCase = new SubmitLeaveRequestUseCase(
      repository,
      employees,
      workSchedules,
      leaveTypes,
      eligibilityPolicy,
      identifiers,
      clock,
      repository,
    );

    const result = await useCase.execute({
      actor,
      leaveTypeId: "LT-001",
      startAt: new Date("2026-07-02T01:00:00.000Z"),
      endAt: new Date("2026-07-02T09:00:00.000Z"),
      reason: "Family appointment",
      idempotencyKey: "idem-1",
    });

    expect(repository.saved).toBeDefined();
    expect(eligibilityPolicy.assertEligible).toHaveBeenCalledOnce();
    expect(result).toMatchObject({
      leaveRequestId: expect.stringMatching(/^leave_/),
      status: "pending",
    });
  });

  it("rejects an inactive membership before loading employee data", async () => {
    const useCase = new SubmitLeaveRequestUseCase(
      new RecordingRepository(),
      employees,
      workSchedules,
      leaveTypes,
      { assertEligible: vi.fn() },
      identifiers,
      { now: () => new Date("2026-06-28T02:00:00.000Z") },
      new RecordingRepository(),
    );

    await expect(
      useCase.execute({
        actor: { ...actor, membershipStatus: "inactive" },
        leaveTypeId: "LT-001",
        startAt: new Date("2026-07-02T01:00:00.000Z"),
        endAt: new Date("2026-07-02T09:00:00.000Z"),
        reason: "Family appointment",
        idempotencyKey: "idem-1",
      }),
    ).rejects.toMatchObject({ code: "MEMBERSHIP_INACTIVE" });
  });
});
