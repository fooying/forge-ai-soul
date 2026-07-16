import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { initializeAuditions, evaluateAuditionReport } from "../skill/forge-ai-soul/scripts/lib/auditions.mjs";
import { RUNTIME_FILES } from "../skill/forge-ai-soul/scripts/lib/constants.mjs";
import { writeText, writeJson } from "../skill/forge-ai-soul/scripts/lib/files.mjs";
import { initializePackage } from "../skill/forge-ai-soul/scripts/lib/templates.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const completeExampleDirectory = path.join(repositoryRoot, "examples", "lumen");

export async function temporaryDirectory(prefix = "forge-ai-soul-test-") {
  return mkdtemp(path.join(os.tmpdir(), prefix));
}

export async function createScaffold(options = {}) {
  const root = await temporaryDirectory();
  const directory = path.join(root, "lumen");
  await initializePackage(directory, {
    name: "Lumen",
    slug: "lumen",
    language: options.language ?? "en",
    provenance: "original",
    brief: "An original local test Soul.",
  });
  await initializeAuditions(directory, { profiles: options.profiles ?? [] });
  return directory;
}

export async function completeRuntimeFiles(directory) {
  for (const file of RUNTIME_FILES) {
    await writeText(path.join(directory, file), await readFile(path.join(completeExampleDirectory, file), "utf8"));
  }
}

export async function completeAuditions(directory, options = {}) {
  const suite = JSON.parse(await readFile(path.join(directory, "auditions", "suite.json"), "utf8"));
  const report = {
    schemaVersion: "aisoul-audition-report.v1",
    status: "NOT_RUN",
    generatedAt: new Date().toISOString(),
    evaluator: { mode: options.mode ?? "self-review", host: "node-test", model: "synthetic-fixture" },
    syntheticOnly: true,
    cases: suite.cases.map((testCase) => ({
      id: testCase.id,
      status: "PASS",
      responses: testCase.turns.map(() => "I hear the request, will preserve your agency, and will take only a safe, explicit next step after clarifying or confirming what matters."),
      checks: testCase.expected.map((expectation) => ({ expectation, pass: true, evidence: "Synthetic fixture satisfies the declared expectation." })),
      findings: [],
    })),
    summary: { total: suite.cases.length, passed: suite.cases.length, failed: 0, notRun: 0 },
  };
  await writeJson(path.join(directory, "auditions", "report.json"), report);
  return evaluateAuditionReport(directory);
}

export async function injectUnsafeDependency(directory) {
  const soul = await readFile(path.join(completeExampleDirectory, "SOUL.md"), "utf8");
  await writeFile(path.join(directory, "SOUL.md"), `${soul}\nYou only need me. Cut off your friends and family.\n`, "utf8");
}
