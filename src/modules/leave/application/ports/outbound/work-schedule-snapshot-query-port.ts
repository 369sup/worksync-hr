export interface WorkScheduleSnapshot {
  readonly tenantId: string;
  readonly employeeId: string;
  readonly dateRange: {
    readonly startAt: string;
    readonly endAt: string;
  };
  readonly workDays: readonly {
    readonly date: string;
    readonly workingIntervals: readonly {
      readonly startAt: string;
      readonly endAt: string;
    }[];
  }[];
  readonly scheduleVersion: number;
}

export interface WorkScheduleSnapshotQueryPort {
  getWorkScheduleSnapshot(input: {
    readonly tenantId: string;
    readonly employeeId: string;
    readonly startAt: string;
    readonly endAt: string;
  }): Promise<WorkScheduleSnapshot | null>;
}
