import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "docs");

async function markdownFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) => {
      const target = path.join(directory, entry.name);
      return entry.isDirectory()
        ? markdownFiles(target)
        : entry.isFile() && entry.name.endsWith(".md")
          ? [target]
          : [];
    }),
  );
  return nested.flat();
}

const files = await markdownFiles(docsRoot);
const documents = new Map(
  await Promise.all(
    files.map(async (file) => [file, await readFile(file, "utf8")]),
  ),
);

const failures = [];
const strategicPath = path.join(docsRoot, "01-architecture", "strategic-design.md");
const boundedPath = path.join(docsRoot, "01-architecture", "bounded-contexts.md");
const glossaryPath = path.join(docsRoot, "00-project", "glossary.md");
const tacticalPath = path.join(docsRoot, "01-architecture", "tactical-design.md");
const strategic = documents.get(strategicPath);
const bounded = documents.get(boundedPath);
const glossary = documents.get(glossaryPath);
const tactical = documents.get(tacticalPath);

function requireText(document, fragment, label) {
  if (!document.includes(fragment)) failures.push(`${label}: missing ${fragment}`);
}

for (const type of ["Core", "Supporting", "Generic"]) {
  requireText(strategic, `| ${type} |`, "strategic-design");
}

const contexts = [
  "Employee",
  "Organization",
  "Schedule",
  "Attendance",
  "Leave",
  "Overtime",
  "Approval",
  "Payroll",
  "Audit",
  "Notification",
];
for (const context of contexts) {
  const ownerRow = `| \`${context}\` |`;
  const count = bounded.split(ownerRow).length - 1;
  if (count !== 1) {
    failures.push(`bounded-contexts: ${context} owner row count is ${count}`);
  }
}

const contracts = [
  "EmployeeSnapshot",
  "OrganizationMembershipSnapshot",
  "PayrollMembershipSnapshot",
  "WorkScheduleSnapshot",
  "ApprovalAssignmentResult",
  "ApprovedLeaveSummary",
  "FinalizedAttendanceSummary",
  "OvertimeAdjustment",
  "PayrollResultSummary",
  "SalarySlipView",
  "AuditRecordView",
  "NotificationStatusSummary",
];
for (const contract of contracts) {
  requireText(bounded, contract, "bounded-contexts");
}

const legacyContracts = [
  "EmployeeProfileSnapshot",
  "EmployeePayrollSnapshot",
  "CompensatoryLeaveGrant",
];
const compatibilityMarkers =
  /相容別名|compatibility alias|legacy alias|deprecated compatibility alias|舊檢查器|舊事件|僅為舊/;
for (const [file, content] of documents) {
  for (const [index, line] of content.split(/\r?\n/).entries()) {
    for (const contract of legacyContracts) {
      const legacyIdentifier = new RegExp(
        `(?<![A-Za-z0-9_])${contract}(?![A-Za-z0-9_])`,
      );
      if (legacyIdentifier.test(line) && !compatibilityMarkers.test(line)) {
        failures.push(
          `${path.relative(root, file)}:${index + 1}: legacy ${contract} is outside compatibility alias documentation`,
        );
      }
    }
  }
}

const forbiddenCandidatePaths = [
  tacticalPath,
  ...files.filter((file) => file.includes(`${path.sep}02-domain${path.sep}`)),
];
for (const file of forbiddenCandidatePaths) {
  if (documents.get(file).includes("候選")) {
    failures.push(`${path.relative(root, file)}: contains unresolved 候選`);
  }
}

for (const [file, content] of documents) {
  if (file !== glossaryPath && content.includes("Audit / Security")) {
    failures.push(`${path.relative(root, file)}: contains forbidden Audit / Security`);
  }
}

requireText(tactical, "PayrollPeriodRepository", "tactical-design");
requireText(tactical, "PayrollInputVersion", "tactical-design");
requireText(bounded, "Overtime", "bounded-contexts");

const appRoot = path.join(root, "src", "app");
async function routeDirectories(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const children = entries.filter((entry) => entry.isDirectory());
  const nested = await Promise.all(
    children.map((entry) => routeDirectories(path.join(directory, entry.name))),
  );
  return [directory, ...nested.flat()];
}

for (const directory of await routeDirectories(appRoot)) {
  if (!path.basename(directory).startsWith("@")) continue;
  const fallbacks = ["default.tsx", "default.ts", "default.jsx", "default.js"];
  let hasFallback = false;
  for (const fallback of fallbacks) {
    try {
      await access(path.join(directory, fallback));
      hasFallback = true;
      break;
    } catch {
      // Try the next supported extension.
    }
  }
  if (!hasFallback) {
    failures.push(
      `${path.relative(root, directory)}: named slot is missing default.tsx fallback`,
    );
  }
}

if (failures.length > 0) {
  console.error("Documentation checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Documentation checks passed (${files.length} Markdown files).`);
