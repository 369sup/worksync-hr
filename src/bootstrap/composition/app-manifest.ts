import type { ContextManifest } from "@/shared/types/context-manifest";

const contexts: ContextManifest[] = [
  {
    name: "leave",
    kind: "core",
    description:
      "Leave requests, leave-policy application, and leave-facing published facts.",
  },
  {
    name: "attendance",
    kind: "core",
    description:
      "Punches, attendance records, work-duration summaries, and anomaly handling.",
  },
  {
    name: "overtime",
    kind: "core",
    description:
      "Overtime requests, compensation outcomes, and compensatory-leave generation.",
  },
  {
    name: "payroll",
    kind: "core",
    description:
      "Payroll periods, payable items, salary slips, and payroll-facing settlement.",
  },
  {
    name: "employee-profile",
    kind: "supporting",
    description:
      "Employee master data, tenant membership, and capability snapshots.",
  },
  {
    name: "scheduling",
    kind: "supporting",
    description: "Shift definitions, rosters, and shift-assignment snapshots.",
  },
  {
    name: "approval-flow",
    kind: "supporting",
    description: "Approver resolution, delegation, and approval-route lookup.",
  },
  {
    name: "notification",
    kind: "supporting",
    description:
      "Notification dispatch, delivery channels, and delivery status tracking.",
  },
];

export const appManifest = {
  routeRoot: "src/app",
  primaryContext: "leave",
  contexts,
} as const;
