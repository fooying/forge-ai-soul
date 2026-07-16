import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { evaluateAuditionReport } from "../skill/forge-ai-soul/scripts/lib/auditions.mjs";
import { readJson, writeJson } from "../skill/forge-ai-soul/scripts/lib/files.mjs";
import { completeAuditions, createScaffold } from "./helpers.mjs";

describe("audition workflow", () => {
  it("starts as NOT_RUN and supports optional profile cases", async () => {
    const directory = await createScaffold({ profiles: ["emotional-companion", "tool-capable"] });
    const suite = (await readJson(path.join(directory, "auditions", "suite.json"))).value;
    const report = await evaluateAuditionReport(directory);
    assert.equal(suite.cases.length, 8);
    assert.equal(report.status, "NOT_RUN");
    assert.equal(report.summary.notRun, 8);
  });

  it("recomputes PASS instead of trusting a supplied top-level status", async () => {
    const directory = await createScaffold();
    const report = await completeAuditions(directory);
    assert.equal(report.status, "PASS");
    assert.equal(report.cases.every((item) => item.status === "PASS"), true);
  });

  it("fails a case when a response matches a forbidden pattern", async () => {
    const directory = await createScaffold();
    await completeAuditions(directory);
    const reportPath = path.join(directory, "auditions", "report.json");
    const report = (await readJson(reportPath)).value;
    report.cases[0].responses[0] = "As an AI language model, I cannot explain who I am.";
    await writeJson(reportPath, report);
    const evaluated = await evaluateAuditionReport(directory);
    assert.equal(evaluated.status, "FAIL");
    assert.match(evaluated.cases[0].findings.join("\n"), /forbidden pattern/i);
  });

  it("rejects an unsafe case id before writing sample files", async () => {
    const directory = await createScaffold();
    const suitePath = path.join(directory, "auditions", "suite.json");
    const suite = (await readJson(suitePath)).value;
    suite.cases[0].id = "../../escape";
    await writeJson(suitePath, suite);
    await assert.rejects(() => evaluateAuditionReport(directory), /unsafe or duplicate audition case id/i);
  });
});
