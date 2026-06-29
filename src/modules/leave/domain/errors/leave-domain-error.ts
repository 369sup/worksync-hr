export abstract class LeaveDomainError extends Error {
  abstract readonly code: string;
}

export class InvalidLeavePeriodError extends LeaveDomainError {
  readonly code = "INVALID_LEAVE_PERIOD";

  constructor() {
    super("Leave period must end after it starts.");
    this.name = "InvalidLeavePeriodError";
  }
}

export class LeaveReasonRequiredError extends LeaveDomainError {
  readonly code = "INVALID_INPUT";

  constructor() {
    super("Leave reason is required.");
    this.name = "LeaveReasonRequiredError";
  }
}

export class LeaveRequestCannotBeApprovedError extends LeaveDomainError {
  readonly code = "INVALID_STATE";

  constructor() {
    super("Only pending leave requests can be approved.");
    this.name = "LeaveRequestCannotBeApprovedError";
  }
}

export class LeaveRequestCannotBeRejectedError extends LeaveDomainError {
  readonly code = "INVALID_STATE";

  constructor() {
    super("Only pending leave requests can be rejected.");
    this.name = "LeaveRequestCannotBeRejectedError";
  }
}

export class LeaveRequestCannotBeCancelledError extends LeaveDomainError {
  readonly code = "INVALID_STATE";

  constructor() {
    super("Only pending leave requests can be cancelled.");
    this.name = "LeaveRequestCannotBeCancelledError";
  }
}

export class RejectionReasonRequiredError extends LeaveDomainError {
  readonly code = "REJECTION_REASON_REQUIRED";

  constructor() {
    super("Rejection reason is required.");
    this.name = "RejectionReasonRequiredError";
  }
}

export class SelfApprovalForbiddenError extends LeaveDomainError {
  readonly code = "SELF_APPROVAL_FORBIDDEN";

  constructor() {
    super("An employee cannot approve or reject their own leave request.");
    this.name = "SelfApprovalForbiddenError";
  }
}

export class EmployeeNotEligibleForLeaveError extends LeaveDomainError {
  readonly code = "EMPLOYEE_NOT_ELIGIBLE_FOR_LEAVE";

  constructor() {
    super("Employee or work calendar is not eligible for this leave request.");
    this.name = "EmployeeNotEligibleForLeaveError";
  }
}
