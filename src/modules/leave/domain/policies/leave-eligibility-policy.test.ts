import { describe, expect, it } from "vitest";

import { DefaultLeaveEligibilityPolicy } from "./leave-eligibility-policy";

const policy = new DefaultLeaveEligibilityPolicy();
const input = {
  employee: {
    tenantId: "tenant_test",
    employeeId: "EMP-001",
    status: "active" as const,
  },
  schedule: {
    tenantId: "tenant_test",
    employeeId: "EMP-001",
    workDays: [
      {
        workingIntervals: [
          {
            startAt: "2026-07-01T01:00:00.000Z",
            endAt: "2026-07-01T09:00:00.000Z",
          },
        ],
      },
    ],
  },
  leaveTypeId: "LT-001",
  leaveTypeCode: "annual-leave",
  startAt: new Date("2026-07-01T02:00:00.000Z"),
  endAt: new Date("2026-07-01T08:00:00.000Z"),
};

describe("DefaultLeaveEligibilityPolicy", () => {
  it("accepts a request that overlaps published working time", () => {
    expect(() => policy.assertEligible(input)).not.toThrow();
  });

  it("fails closed when schedule identity or working time does not match", () => {
    expect(() =>
      policy.assertEligible({
        ...input,
        schedule: { ...input.schedule, employeeId: "EMP-OTHER" },
      }),
    ).toThrow("Employee or work calendar is not eligible");
    expect(() =>
      policy.assertEligible({
        ...input,
        schedule: { ...input.schedule, workDays: [] },
      }),
    ).toThrow("Employee or work calendar is not eligible");
  });
});
