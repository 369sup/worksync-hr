import type { ContextManifest } from "@/shared/types/context-manifest";

const contexts: ContextManifest[] = [
  {
    name: "Employee",
    kind: "supporting",
    description: "Employee master data and EmployeeSnapshot publication.",
  },
  {
    name: "Organization",
    kind: "supporting",
    description:
      "Organization units, memberships, reporting lines, roles, and capabilities.",
  },
  {
    name: "Schedule",
    kind: "supporting",
    description: "Shift definitions and versioned work schedules.",
  },
  {
    name: "Attendance",
    kind: "core",
    description: "Punches, attendance records, exceptions, and finalization.",
  },
  {
    name: "Leave",
    kind: "core",
    description: "Leave types, requests, balances, and approved summaries.",
  },
  {
    name: "Overtime",
    kind: "core",
    description: "Overtime requests and compensation outcomes.",
  },
  {
    name: "Approval",
    kind: "supporting",
    description: "Approval responsibility, delegation, and assignment results.",
  },
  {
    name: "Payroll",
    kind: "core",
    description: "Payroll periods, frozen inputs, results, and salary slips.",
  },
  {
    name: "Audit",
    kind: "generic",
    description: "Append-only security and sensitive-operation facts.",
  },
  {
    name: "Notification",
    kind: "generic",
    description: "Post-commit notification delivery and retry status.",
  },
];

export const appManifest = {
  routeRoot: "src/app",
  primaryContext: "Leave",
  contexts,
} as const;
