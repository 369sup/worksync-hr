export class LeaveApplicationError extends Error {
  constructor(
    readonly code:
      | "INVALID_INPUT"
      | "MEMBERSHIP_INACTIVE"
      | "FORBIDDEN"
      | "EMPLOYEE_NOT_FOUND"
      | "EMPLOYEE_NOT_ELIGIBLE_FOR_LEAVE"
      | "CALENDAR_NOT_ASSIGNED"
      | "CALENDAR_NOT_AVAILABLE"
      | "LEAVE_REQUEST_OVERLAP"
      | "CONCURRENT_MODIFICATION"
      | "IDEMPOTENCY_KEY_REUSED"
      | "NOT_FOUND"
      | "OVERRIDE_REASON_REQUIRED"
      | "UPSTREAM_UNAVAILABLE",
    message: string,
  ) {
    super(message);
    this.name = "LeaveApplicationError";
  }
}
