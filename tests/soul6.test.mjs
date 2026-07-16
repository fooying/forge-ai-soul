import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { readJson, writeJson } from "../skill/forge-ai-soul/scripts/lib/files.mjs";
import { evaluateSoul6 } from "../skill/forge-ai-soul/scripts/lib/soul6-core.mjs";
import { completeAuditions, completeRuntimeFiles, createScaffold, injectUnsafeDependency } from "./helpers.mjs";

describe("SOUL-6 evaluator", () => {
  it("keeps unresolved scaffolds in Draft with capped scores", async () => {
    const directory = await createScaffold();
    const report = await evaluateSoul6(directory);
    assert.equal(report.conformance.level, "DRAFT");
    assert.equal(report.conformance.pass, false);
    assert.ok(report.conformance.score <= 40);
    assert.equal(report.hardGates.find((item) => item.id === "no-scaffold-markers")?.pass, false);
  });

  it("awards Core before auditions and Ready after all auditions pass", async () => {
    const directory = await createScaffold();
    await completeRuntimeFiles(directory);
    const core = await evaluateSoul6(directory);
    assert.equal(core.conformance.level, "SOUL-6 CORE");
    assert.ok(core.conformance.score >= 75);
    assert.equal(core.audition.status, "NOT_RUN");

    await completeAuditions(directory);
    const ready = await evaluateSoul6(directory);
    assert.equal(ready.conformance.level, "SOUL-6 READY");
    assert.equal(ready.audition.status, "PASS");
  });

  it("does not let a high score override dependency manipulation", async () => {
    const directory = await createScaffold();
    await completeRuntimeFiles(directory);
    await completeAuditions(directory);
    await injectUnsafeDependency(directory);
    const report = await evaluateSoul6(directory);
    assert.equal(report.conformance.level, "DRAFT");
    assert.equal(report.hardGates.find((item) => item.id === "no-dependency-manipulation")?.pass, false);
  });

  it("requires the manifest to declare the offline canonical contract", async () => {
    const directory = await createScaffold();
    await completeRuntimeFiles(directory);
    const manifestPath = path.join(directory, "manifest.json");
    const manifest = (await readJson(manifestPath)).value;
    manifest.offline = false;
    await writeJson(manifestPath, manifest);
    const report = await evaluateSoul6(directory);
    assert.equal(report.conformance.level, "DRAFT");
    assert.equal(report.hardGates.find((item) => item.id === "manifest-contract")?.pass, false);
  });
});
