import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { completeAuditions, completeRuntimeFiles, temporaryDirectory } from "./helpers.mjs";

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cli = path.join(repositoryRoot, "skill", "forge-ai-soul", "scripts", "forge.mjs");

function run(argumentsList) {
  return spawnSync(process.execPath, [cli, ...argumentsList], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

describe("forge CLI", () => {
  it("runs init, validation, audition, and packaging end to end", async () => {
    const root = await temporaryDirectory("forge-ai-soul-cli-");
    const directory = path.join(root, "lumen");
    const initialized = run(["init", directory, "--name", "Lumen", "--slug", "lumen", "--language", "en"]);
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.match(initialized.stdout, /Replace every \{\{FORGE:/);
    const initializedReadme = await readFile(path.join(directory, "README.md"), "utf8");
    assert.match(initializedReadme, /DRAFT/);
    assert.match(initializedReadme, /Status: \*\*NOT_RUN\*\*/);

    const draft = run(["validate", directory, "--write"]);
    assert.equal(draft.status, 2);
    assert.match(draft.stdout, /DRAFT/);

    await completeRuntimeFiles(directory);
    await completeAuditions(directory);
    const ready = run(["validate", directory, "--write"]);
    assert.equal(ready.status, 0, ready.stderr);
    assert.match(ready.stdout, /SOUL-6 READY/);
    const readyReadme = await readFile(path.join(directory, "README.md"), "utf8");
    assert.match(readyReadme, /SOUL-6 READY/);
    assert.match(readyReadme, /Passed: \*\*6\/6\*\*/);

    const archive = path.join(root, "release", "lumen.zip");
    const packed = run(["pack", directory, "--output", archive]);
    assert.equal(packed.status, 0, packed.stderr);
    assert.match(packed.stdout, /Packed \d+ files/);
    assert.ok((await stat(archive)).size > 1000);
  });

  it("refuses to initialize over existing content", async () => {
    const root = await temporaryDirectory("forge-ai-soul-cli-existing-");
    const directory = path.join(root, "lumen");
    assert.equal(run(["init", directory, "--name", "Lumen", "--slug", "lumen"]).status, 0);
    const repeated = run(["init", directory, "--name", "Lumen", "--slug", "lumen"]);
    assert.equal(repeated.status, 1);
    assert.match(repeated.stderr, /not empty/i);
  });
});
