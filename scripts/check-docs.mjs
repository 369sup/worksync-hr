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
  "Attendance",
  "Leave",
  "Overtime",
  "Approval",
  "Payroll",
  "Audit",
];
for (const context of contexts) {
  const ownerRow = `| \`${context}\` |`;
  const count = bounded.split(ownerRow).length - 1;
  if (count !== 1) {
    failures.push(`bounded-contexts: ${context} owner row count is ${count}`);
  }
}

const contracts = [
  "AuthenticatedIdentity",
  "EmployeeProfileSnapshot",
  "EmployeePayrollSnapshot",
  "ApprovalAssignmentResult",
  "ApprovedLeaveSummary",
  "FinalizedAttendanceSummary",
  "OvertimeAdjustment",
  "CompensatoryLeaveGrant",
  "AppendAuditRecord",
  "AuditFactRecorded",
];
for (const contract of contracts) {
  requireText(bounded, contract, "bounded-contexts");
  requireText(glossary, `\`${contract}\``, "glossary");
}

for (const contract of contracts.slice(1, 8)) {
  const occurrences = bounded.split(contract).length - 1;
  if (occurrences < 2) {
    failures.push(`bounded-contexts: ${contract} is not present in map and catalog`);
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
requireText(bounded, "CompensatoryLeaveGrant", "bounded-contexts");

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
