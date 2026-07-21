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
    const initialized = run(["create", "Create an AI Soul named Lumen, a calm night archivist with dry wit.", "--output", directory]);
    assert.equal(initialized.status, 0, initialized.stderr);
    assert.match(initialized.stdout, /Prepared Lumen/);
    assert.match(initialized.stdout, /replace every \{\{FORGE:/i);
    const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8"));
    assert.equal(manifest.name, "Lumen");
    assert.equal(manifest.slug, "lumen");
    assert.equal(manifest.language, "en");
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
    const command = ["create", "Create an AI Soul named Lumen, a quiet archivist.", "--output", directory];
    assert.equal(run(command).status, 0);
    const repeated = run(command);
    assert.equal(repeated.status, 1);
    assert.match(repeated.stderr, /not empty/i);
  });

  it("infers Chinese output and companion coverage from one description", async () => {
    const root = await temporaryDirectory("forge-ai-soul-cli-zh-");
    const directory = path.join(root, "qingyi");
    const created = run(["create", "生成一个名叫清漪的陪伴型灵魂，她温柔但不黏人，也会尊重关系边界。", "--output", directory]);
    assert.equal(created.status, 0, created.stderr);
    const manifest = JSON.parse(await readFile(path.join(directory, "manifest.json"), "utf8"));
    const suite = JSON.parse(await readFile(path.join(directory, "auditions", "suite.json"), "utf8"));
    assert.equal(manifest.name, "清漪");
    assert.equal(manifest.language, "zh-CN");
    assert.match(manifest.slug, /^soul-[a-f0-9]{10}$/);
    assert.equal(suite.cases.some((item) => item.profile === "emotional-companion"), true);
  });

  it("keeps technical creation flags out of the primary help", () => {
    const result = run(["help"]);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /natural-language requests/i);
    assert.doesNotMatch(result.stdout, /--slug|--profile|--provenance/);
  });
});
