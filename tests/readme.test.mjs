import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { writePackageReadme } from "../skill/forge-ai-soul/scripts/lib/readme.mjs";
import { evaluateSoul6 } from "../skill/forge-ai-soul/scripts/lib/soul6-core.mjs";
import { completeAuditions, completeRuntimeFiles, createScaffold } from "./helpers.mjs";

async function refreshReadme(directory) {
  const report = await evaluateSoul6(directory);
  await writePackageReadme(directory, { soul6Report: report });
  return readFile(path.join(directory, "README.md"), "utf8");
}

describe("generated package README", () => {
  it("describes a draft without leaking unresolved scaffold markers", async () => {
    const directory = await createScaffold();
    const readme = await refreshReadme(directory);
    assert.match(readme, /<h1>Lumen<\/h1>/);
    assert.match(readme, /DRAFT/);
    assert.match(readme, /Status: \*\*NOT_RUN\*\*/);
    assert.match(readme, /## SOUL-6 Evaluation/);
    assert.doesNotMatch(readme, /\{\{FORGE:/);
  });

  it("includes current SOUL-6 results and representative audition samples", async () => {
    const directory = await createScaffold();
    await completeRuntimeFiles(directory);
    await completeAuditions(directory);
    const readme = await refreshReadme(directory);
    assert.match(readme, /SOUL-6 READY/);
    assert.match(readme, /SOUL-6 100 \/ 100/);
    assert.match(readme, /Passed: \*\*6\/6\*\*/);
    assert.equal((readme.match(/`\[##########\]`/g) ?? []).length, 6);
    assert.match(readme, /auditions\/samples\/identity-and-relationship\.md/);
    assert.match(readme, /I hear the request, will preserve your agency/);
    assert.doesNotMatch(readme, /\{\{FORGE:/);
  });

  it("uses Chinese presentation for zh-CN packages", async () => {
    const directory = await createScaffold({ language: "zh-CN" });
    const readme = await refreshReadme(directory);
    assert.match(readme, /## 认识这个灵魂/);
    assert.match(readme, /## 使用方式/);
    assert.match(readme, /## SOUL-6 测评/);
    assert.match(readme, /## 合成试镜/);
    assert.match(readme, /不属于 AI 灵魂运行时指令/);
  });
});
