import { EmployeeNotEligibleForLeaveError } from "../errors/leave-domain-error";

export interface LeaveEligibilityPolicy {
  assertEligible(input: {
    readonly employee: {
      readonly tenantId: string;
      readonly employeeId: string;
      readonly status: "active" | "inactive" | "suspended";
    };
    readonly schedule: {
      readonly tenantId: string;
      readonly employeeId: string;
      readonly workDays: readonly {
        readonly workingIntervals: readonly {
          readonly startAt: string;
          readonly endAt: string;
        }[];
      }[];
    };
    readonly leaveTypeId: string;
    readonly leaveTypeCode: string;
    readonly startAt: Date;
    readonly endAt: Date;
  }): void;
}

export class DefaultLeaveEligibilityPolicy implements LeaveEligibilityPolicy {
  assertEligible(
    input: Parameters<LeaveEligibilityPolicy["assertEligible"]>[0],
  ) {
    const identifiersAreValid =
      Boolean(input.leaveTypeId.trim()) && Boolean(input.leaveTypeCode.trim());
    const scheduleMatchesEmployee =
      input.employee.tenantId === input.schedule.tenantId &&
      input.employee.employeeId === input.schedule.employeeId;
    const requestTouchesWorkingTime = input.schedule.workDays.some((workDay) =>
      workDay.workingIntervals.some((interval) => {
        const startAt = new Date(interval.startAt);
        const endAt = new Date(interval.endAt);
        return (
          Number.isFinite(startAt.getTime()) &&
          Number.isFinite(endAt.getTime()) &&
          startAt < input.endAt &&
          endAt > input.startAt
        );
      }),
    );

    if (
      input.employee.status !== "active" ||
      !identifiersAreValid ||
      !scheduleMatchesEmployee ||
      !requestTouchesWorkingTime
    ) {
      throw new EmployeeNotEligibleForLeaveError();
    }
  }
}
