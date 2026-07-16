import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";
import { RUNTIME_FILES } from "../skill/forge-ai-soul/scripts/lib/constants.mjs";
import { listFilesRecursive, pathExists } from "../skill/forge-ai-soul/scripts/lib/files.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = path.join(root, "skill", "forge-ai-soul");

async function checkJsonFiles() {
  const files = [path.join(root, "package.json")];
  for (const entry of await readdir(path.join(root, "spec"))) if (entry.endsWith(".json")) files.push(path.join(root, "spec", entry));
  for (const file of files) JSON.parse(await readFile(file, "utf8"));
}

async function checkSkill() {
  const skillText = await readFile(path.join(skill, "SKILL.md"), "utf8");
  assert.doesNotMatch(skillText, /\[TODO|TODO:/i, "SKILL.md still contains TODO markers");
  assert.ok(skillText.split(/\r?\n/).length <= 500, "SKILL.md exceeds 500 lines");
  assert.match(skillText, /^---\nname: forge-ai-soul\ndescription:/);
  const openai = await readFile(path.join(skill, "agents", "openai.yaml"), "utf8");
  assert.match(openai, /\$forge-ai-soul/);
  for (const language of ["zh-CN", "en"]) {
    for (const file of RUNTIME_FILES) assert.equal(await pathExists(path.join(skill, "assets", "templates", language, file)), true, `Missing ${language}/${file}`);
  }
}

async function checkOfflineRuntime() {
  const files = (await listFilesRecursive(path.join(skill, "scripts"))).filter((item) => item.relative.endsWith(".mjs"));
  const activeNetworkPatterns = [
    /\bfetch\s*\(/,
    /from\s+["']node:https?["']/,
    /\bhttps?\.request\s*\(/,
    /\b(?:curl|wget)\s+/,
    /\b(?:axios|got)\s*\(/,
  ];
  for (const file of files) {
    const content = await readFile(file.absolute, "utf8");
    for (const pattern of activeNetworkPatterns) assert.doesNotMatch(content, pattern, `Active network code found in ${file.relative}`);
  }
}

async function checkStandardCopy() {
  const canonical = await readFile(path.join(root, "spec", "SOUL-6.md"), "utf8");
  const bundled = await readFile(path.join(skill, "references", "soul-6.md"), "utf8");
  assert.equal(bundled, canonical, "Bundled SOUL-6 reference is out of sync with spec/SOUL-6.md");
}

await checkJsonFiles();
await checkSkill();
await checkOfflineRuntime();
await checkStandardCopy();
process.stdout.write("Repository checks passed.\n");
