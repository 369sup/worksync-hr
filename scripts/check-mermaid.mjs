import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsRoot = path.join(root, "docs");
const declarations = /^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|gitGraph|mindmap|timeline|quadrantChart|C4Context)\b/;

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

function stripQuotedText(source) {
  return source.replace(/"(?:[^"\\]|\\.)*"/g, '""');
}

function checkBalanced(source, open, close) {
  let depth = 0;
  for (const character of stripQuotedText(source)) {
    if (character === open) depth += 1;
    if (character === close) depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

const failures = [];
let diagramCount = 0;
for (const file of await markdownFiles(docsRoot)) {
  const content = await readFile(file, "utf8");
  const openingCount = [...content.matchAll(/```mermaid\s*$/gm)].length;
  const blocks = [...content.matchAll(/```mermaid\s*\r?\n([\s\S]*?)```/g)];
  if (openingCount !== blocks.length) {
    failures.push(`${path.relative(root, file)}: unclosed Mermaid fence`);
  }

  for (const [index, block] of blocks.entries()) {
    diagramCount += 1;
    const source = block[1].trim();
    const firstStatement = source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith("%%"));
    const label = `${path.relative(root, file)} diagram ${index + 1}`;
    if (!firstStatement || !declarations.test(firstStatement)) {
      failures.push(`${label}: missing supported diagram declaration`);
    }
    if (!checkBalanced(source, "[", "]")) failures.push(`${label}: unbalanced []`);
    if (!checkBalanced(source, "(", ")")) failures.push(`${label}: unbalanced ()`);
    if (!checkBalanced(source, "{", "}")) failures.push(`${label}: unbalanced {}`);
    const quoteCount = (source.match(/(?<!\\)"/g) ?? []).length;
    if (quoteCount % 2 !== 0) failures.push(`${label}: unbalanced quotes`);
  }
}

if (failures.length > 0) {
  console.error("Mermaid structural checks failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Mermaid structural checks passed (${diagramCount} diagrams).`);
