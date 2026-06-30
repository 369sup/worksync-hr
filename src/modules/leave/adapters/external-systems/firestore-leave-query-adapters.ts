import type { FirebaseFirestore } from "@/bootstrap/persistence/firestore";
import type { DocumentData } from "firebase-admin/firestore";

import type { ApprovalAssignmentQueryPort } from "../../application/ports/outbound/approval-assignment-query-port";
import type { EmployeeSnapshotQueryPort } from "../../application/ports/outbound/employee-snapshot-query-port";
import type { OrganizationTeamScopeQueryPort } from "../../application/ports/outbound/organization-team-scope-query-port";
import type { LeaveTypeSnapshotQueryPort } from "../../application/ports/outbound/leave-type-snapshot-query-port";
import type {
  WorkScheduleSnapshot,
  WorkScheduleSnapshotQueryPort,
} from "../../application/ports/outbound/work-schedule-snapshot-query-port";

function tenantCollection(
  database: FirebaseFirestore,
  tenantId: string,
  collection: string,
) {
  return database.collection("tenants").doc(tenantId).collection(collection);
}

function validTenant(data: DocumentData, tenantId: string) {
  return data.tenantId === tenantId;
}

export class FirestoreEmployeeSnapshotQueryAdapter
  implements EmployeeSnapshotQueryPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  async getEmployeeSnapshot(input: {
    tenantId: string;
    employeeId: string;
  }) {
    const document = await tenantCollection(
      this.database,
      input.tenantId,
      "employees",
    )
      .doc(input.employeeId)
      .get();
    const data = document.data();
    if (
      !document.exists ||
      !data ||
      !validTenant(data, input.tenantId) ||
      !["active", "inactive", "suspended"].includes(data.status) ||
      typeof data.version !== "number"
    ) {
      return null;
    }
    return {
      tenantId: input.tenantId,
      employeeId: document.id,
      status: data.status as "active" | "inactive" | "suspended",
      displayName: typeof data.displayName === "string" ? data.displayName : "",
      version: data.version,
    };
  }
}

export class FirestoreLeaveTypeSnapshotQueryAdapter
  implements LeaveTypeSnapshotQueryPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  async getLeaveTypeSnapshot(input: {
    tenantId: string;
    leaveTypeId: string;
  }) {
    const document = await tenantCollection(
      this.database,
      input.tenantId,
      "leave_types",
    )
      .doc(input.leaveTypeId)
      .get();
    const data = document.data();
    if (
      !document.exists ||
      !data ||
      !validTenant(data, input.tenantId) ||
      typeof data.code !== "string" ||
      !["active", "inactive"].includes(data.status) ||
      !Number.isInteger(data.version)
    ) {
      return null;
    }
    return {
      tenantId: input.tenantId,
      leaveTypeId: document.id,
      code: data.code,
      status: data.status as "active" | "inactive",
      version: data.version,
    };
  }
}

function toWorkScheduleSnapshot(
  tenantId: string,
  employeeId: string,
  data: DocumentData,
): WorkScheduleSnapshot | null {
  if (
    !validTenant(data, tenantId) ||
    data.employeeId !== employeeId ||
    !data.dateRange ||
    typeof data.dateRange.startAt !== "string" ||
    typeof data.dateRange.endAt !== "string" ||
    !Array.isArray(data.workDays) ||
    !Number.isInteger(data.scheduleVersion)
  ) {
    return null;
  }
  return {
    tenantId,
    employeeId,
    dateRange: {
      startAt: data.dateRange.startAt,
      endAt: data.dateRange.endAt,
    },
    workDays: data.workDays,
    scheduleVersion: data.scheduleVersion,
  } as WorkScheduleSnapshot;
}

export class FirestoreWorkScheduleSnapshotQueryAdapter
  implements WorkScheduleSnapshotQueryPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  async getWorkScheduleSnapshot(input: {
    tenantId: string;
    employeeId: string;
    startAt: string;
    endAt: string;
  }) {
    const result = await tenantCollection(
      this.database,
      input.tenantId,
      "work_schedules",
    )
      .where("employeeId", "==", input.employeeId)
      .where("status", "==", "published")
      .orderBy("scheduleVersion", "desc")
      .limit(10)
      .get();
    return (
      result.docs
        .map((document) =>
          toWorkScheduleSnapshot(
            input.tenantId,
            input.employeeId,
            document.data(),
          ),
        )
        .find((snapshot) => {
          if (!snapshot) return false;
          const scheduleStart = new Date(snapshot.dateRange.startAt).getTime();
          const scheduleEnd = new Date(snapshot.dateRange.endAt).getTime();
          const requestedStart = new Date(input.startAt).getTime();
          const requestedEnd = new Date(input.endAt).getTime();
          return scheduleStart <= requestedStart && scheduleEnd >= requestedEnd;
        }) ?? null
    );
  }
}

export class FirestoreLeaveAccessQueryAdapter
  implements ApprovalAssignmentQueryPort, OrganizationTeamScopeQueryPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  async resolveApprovalAssignment(input: {
    tenantId: string;
    leaveRequestId: string;
    requestedAt: string;
  }) {
    const result = await tenantCollection(
      this.database,
      input.tenantId,
      "approval_assignments",
    )
      .where("targetRef.id", "==", input.leaveRequestId)
      .where("targetRef.context", "==", "Leave")
      .where("status", "in", ["assigned", "delegated"])
      .limit(1)
      .get();
    const document = result.docs[0];
    const data = document?.data();
    if (
      !document ||
      !data ||
      !validTenant(data, input.tenantId) ||
      typeof data.approverMembershipId !== "string" ||
      typeof data.version !== "number"
    ) {
      return null;
    }
    if (
      typeof data.validUntil === "string" &&
      new Date(data.validUntil) < new Date(input.requestedAt)
    ) {
      return null;
    }
    return {
      tenantId: input.tenantId,
      assignmentId: document.id,
      targetRef: {
        context: "Leave" as const,
        type: "LeaveRequest" as const,
        id: input.leaveRequestId,
      },
      approverMembershipId: data.approverMembershipId,
      delegateMembershipId:
        typeof data.delegateMembershipId === "string"
          ? data.delegateMembershipId
          : null,
      status: data.status as "assigned" | "delegated",
      validUntil: typeof data.validUntil === "string" ? data.validUntil : null,
      version: data.version,
    };
  }

  async getManagedEmployeeIds(input: {
    tenantId: string;
    managerMembershipId: string;
  }) {
    const result = await tenantCollection(
      this.database,
      input.tenantId,
      "memberships",
    )
      .where("managerMembershipId", "==", input.managerMembershipId)
      .where("status", "==", "active")
      .get();
    return {
      tenantId: input.tenantId,
      managerMembershipId: input.managerMembershipId,
      employeeIds: result.docs.flatMap((document) => {
        const data = document.data();
        return validTenant(data, input.tenantId) &&
          typeof data.employeeId === "string"
          ? [data.employeeId]
          : [];
      }),
    };
  }
}
