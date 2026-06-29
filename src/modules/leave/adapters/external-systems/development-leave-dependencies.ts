import type { LeaveWorkCalendarQueryPort } from "../../application/ports/outbound/leave-work-calendar-query-port";
import { MvpLeaveEligibilityPolicy } from "../../domain/policies/leave-eligibility-policy";

export const developmentLeaveWorkCalendars: LeaveWorkCalendarQueryPort = {
  async getLeaveWorkCalendar(input) {
    return {
      tenantId: input.tenantId,
      assignedCalendarId: input.assignedCalendarId,
      timezone: input.timezone,
      sourceVersion: "development-only",
      workingIntervals: [{ startAt: input.startAt, endAt: input.endAt }],
    };
  },
};

export const developmentLeaveEligibilityPolicy =
  new MvpLeaveEligibilityPolicy();
