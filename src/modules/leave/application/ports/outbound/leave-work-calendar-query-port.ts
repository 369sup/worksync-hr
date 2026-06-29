export interface LeaveWorkCalendarSnapshot {
  readonly tenantId: string;
  readonly assignedCalendarId: string;
  readonly timezone: string;
  readonly sourceVersion: string;
  readonly workingIntervals: readonly {
    readonly startAt: string;
    readonly endAt: string;
  }[];
}

export interface LeaveWorkCalendarQueryPort {
  getLeaveWorkCalendar(input: {
    readonly tenantId: string;
    readonly employeeId: string;
    readonly assignedCalendarId: string;
    readonly timezone: string;
    readonly startAt: string;
    readonly endAt: string;
  }): Promise<LeaveWorkCalendarSnapshot | null>;
}
