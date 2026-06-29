export interface LeaveRequestListItem {
  id: string;
  employeeId: string;
  leaveTypeCode: string;
  startAt: string;
  endAt: string;
  status: "pending" | "approved" | "rejected" | "cancelled";
  submittedAt: string;
}

export interface LeaveRequestDetail extends LeaveRequestListItem {
  leaveTypeId: string;
  reason: string | null;
  approverId: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  cancelledBy: string | null;
  cancelledAt: string | null;
}

export interface LeaveRequestSearchCriteria {
  status?: LeaveRequestListItem["status"];
  employeeId?: string;
  periodStart?: Date;
  periodEnd?: Date;
  page: number;
  pageSize: number;
}

export interface LeaveRequestPage {
  items: readonly LeaveRequestListItem[];
  page: number;
  pageSize: number;
  hasNext: boolean;
}
