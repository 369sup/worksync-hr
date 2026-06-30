import type { FirebaseFirestore } from "@/bootstrap/persistence/firestore";
import type {
  DocumentData,
  QueryDocumentSnapshot,
} from "firebase-admin/firestore";

import type {
  OrganizationMembershipSnapshot,
  OrganizationMembershipSnapshotQueryPort,
} from "./actor-context-factory";

function stringArray(value: unknown): readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string")
    ? value
    : [];
}

function toMembership(
  document: QueryDocumentSnapshot<DocumentData>,
): OrganizationMembershipSnapshot | null {
  const tenant = document.ref.parent.parent;
  const data = document.data();
  if (
    !tenant ||
    tenant.parent.id !== "tenants" ||
    data.tenantId !== tenant.id ||
    typeof data.userId !== "string" ||
    data.status !== "active"
  ) {
    return null;
  }
  return {
    tenantId: tenant.id,
    membershipId: document.id,
    userId: data.userId,
    employeeId: typeof data.employeeId === "string" ? data.employeeId : null,
    organizationUnitId:
      typeof data.organizationUnitId === "string"
        ? data.organizationUnitId
        : null,
    status: "active",
    roles: stringArray(data.roles),
    capabilities: stringArray(data.capabilities),
  };
}

export class FirestoreMembershipQueryAdapter
  implements OrganizationMembershipSnapshotQueryPort
{
  constructor(private readonly database: FirebaseFirestore) {}

  async findActiveMembershipByUserId(input: { userId: string }) {
    const result = await this.database
      .collectionGroup("memberships")
      .where("userId", "==", input.userId)
      .where("status", "==", "active")
      .limit(2)
      .get();
    const memberships = result.docs
      .map(toMembership)
      .filter((value): value is OrganizationMembershipSnapshot => Boolean(value));
    if (memberships.length !== 1) return null;
    return memberships[0];
  }
}
