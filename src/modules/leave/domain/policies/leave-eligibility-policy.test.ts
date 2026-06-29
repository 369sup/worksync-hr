import { describe, expect, it } from "vitest";

import { MvpLeaveEligibilityPolicy } from "./leave-eligibility-policy";

const policy = new MvpLeaveEligibilityPolicy();
const input = {
  employee: {
    tenantId: "tenant_test",
    employeeId: "EMP-001",
    employmentStatus: "active" as const,
    timezone: "Asia/Taipei",
    assignedCalendarId: "CAL-001",
  },
  calendar: {
    tenantId: "tenant_test",
    assignedCalendarId: "CAL-001",
    timezone: "Asia/Taipei",
    workingIntervals: [
      {
        startAt: "2026-07-01T01:00:00.000Z",
        endAt: "2026-07-01T09:00:00.000Z",
      },
    ],
  },
  leaveTypeId: "LT-001",
  leaveTypeCode: "annual-leave",
  startAt: new Date("2026-07-01T02:00:00.000Z"),
  endAt: new Date("2026-07-01T08:00:00.000Z"),
};

describe("MvpLeaveEligibilityPolicy", () => {
  it("accepts a request that uses the employee calendar and working time", () => {
    expect(() => policy.assertEligible(input)).not.toThrow();
  });

  it("fails closed when calendar identity or working time does not match", () => {
    expect(() =>
      policy.assertEligible({
        ...input,
        calendar: { ...input.calendar, assignedCalendarId: "CAL-OTHER" },
      }),
    ).toThrow("Employee or work calendar is not eligible");
    expect(() =>
      policy.assertEligible({
        ...input,
        calendar: { ...input.calendar, workingIntervals: [] },
      }),
    ).toThrow("Employee or work calendar is not eligible");
  });
});
