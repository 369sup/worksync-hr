import { describe, expect, it, vi } from "vitest";

import type { Clock } from "@/shared/kernel/clock";
import type { ActorContext } from "@/shared/types/actor-context";

import type { LeaveRequest } from "../../domain/aggregates/leave-request";
import type { LeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";
import type { LeaveRequestRepository } from "../../domain/repositories/leave-request-repository";
import type { EmployeeLeaveProfileQueryPort } from "../ports/outbound/employee-leave-profile-query-port";
import type { LeaveWorkCalendarQueryPort } from "../ports/outbound/leave-work-calendar-query-port";
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
  membershipStatus: "active",
  capabilities: ["leave.submit.self"],
  correlationId: "correlation-1",
};

const employeeProfiles: EmployeeLeaveProfileQueryPort = {
  async getEmployeeLeaveSnapshot(input) {
    return {
      tenantId: input.tenantId,
      employeeId: input.employeeId,
      employmentStatus: "active",
      departmentId: "DEPT-001",
      managerId: "EMP-002",
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
      sourceVersion: "test-1",
      workingIntervals: [{ startAt: input.startAt, endAt: input.endAt }],
    };
  },
};

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
      employeeProfiles,
      workCalendars,
      eligibilityPolicy,
      clock,
      repository,
    );

    const result = await useCase.execute({
      actor,
      leaveTypeId: "LT-001",
      leaveTypeCode: "annual-leave",
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
      employeeProfiles,
      workCalendars,
      { assertEligible: vi.fn() },
      { now: () => new Date("2026-06-28T02:00:00.000Z") },
      new RecordingRepository(),
    );

    await expect(
      useCase.execute({
        actor: { ...actor, membershipStatus: "inactive" },
        leaveTypeId: "LT-001",
        leaveTypeCode: "annual-leave",
        startAt: new Date("2026-07-02T01:00:00.000Z"),
        endAt: new Date("2026-07-02T09:00:00.000Z"),
        reason: "Family appointment",
        idempotencyKey: "idem-1",
      }),
    ).rejects.toMatchObject({ code: "MEMBERSHIP_INACTIVE" });
  });
});
