import { EmployeeNotEligibleForLeaveError } from "../errors/leave-domain-error";

export interface LeaveEligibilityPolicy {
  assertEligible(input: {
    readonly employee: {
      readonly tenantId: string;
      readonly employeeId: string;
      readonly employmentStatus: "active" | "inactive" | "suspended";
      readonly timezone: string;
      readonly assignedCalendarId: string | null;
    };
    readonly calendar: {
      readonly tenantId: string;
      readonly assignedCalendarId: string;
      readonly timezone: string;
      readonly workingIntervals: readonly {
        readonly startAt: string;
        readonly endAt: string;
      }[];
    };
    readonly leaveTypeId: string;
    readonly leaveTypeCode: string;
    readonly startAt: Date;
    readonly endAt: Date;
  }): void;
}

export class MvpLeaveEligibilityPolicy implements LeaveEligibilityPolicy {
  assertEligible(
    input: Parameters<LeaveEligibilityPolicy["assertEligible"]>[0],
  ) {
    const identifiersAreValid =
      Boolean(input.leaveTypeId.trim()) && Boolean(input.leaveTypeCode.trim());
    const calendarMatchesEmployee =
      input.employee.tenantId === input.calendar.tenantId &&
      input.employee.assignedCalendarId === input.calendar.assignedCalendarId &&
      input.employee.timezone === input.calendar.timezone;
    const requestTouchesWorkingTime = input.calendar.workingIntervals.some(
      (interval) => {
        const startAt = new Date(interval.startAt);
        const endAt = new Date(interval.endAt);
        return (
          Number.isFinite(startAt.getTime()) &&
          Number.isFinite(endAt.getTime()) &&
          startAt < input.endAt &&
          endAt > input.startAt
        );
      },
    );

    if (
      input.employee.employmentStatus !== "active" ||
      !identifiersAreValid ||
      !calendarMatchesEmployee ||
      !requestTouchesWorkingTime
    ) {
      throw new EmployeeNotEligibleForLeaveError();
    }
  }
}
