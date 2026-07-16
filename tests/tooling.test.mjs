import assert from "node:assert/strict";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { describe, it } from "node:test";
import { diffPackages } from "../skill/forge-ai-soul/scripts/lib/diff.mjs";
import { createZipFromDirectory } from "../skill/forge-ai-soul/scripts/lib/zip.mjs";
import { completeRuntimeFiles, createScaffold, temporaryDirectory } from "./helpers.mjs";

describe("local package tooling", () => {
  it("creates a portable ZIP containing a root package directory", async () => {
    const directory = await createScaffold();
    const outputRoot = await temporaryDirectory("forge-ai-soul-zip-");
    const output = path.join(outputRoot, "lumen.zip");
    const result = await createZipFromDirectory(directory, output, "lumen");
    const archive = await readFile(output);
    assert.equal(archive.subarray(0, 2).toString("ascii"), "PK");
    assert.match(archive.toString("utf8"), /lumen\/manifest\.json/);
    assert.match(archive.toString("utf8"), /lumen\/README\.md/);
    assert.ok(result.files >= 10);
    assert.ok((await stat(output)).size > 1000);
  });

  it("reports added, removed, and changed files", async () => {
    const before = await createScaffold();
    const after = await createScaffold();
    await completeRuntimeFiles(after);
    const result = await diffPackages(before, after);
    assert.ok(result.changed.includes("SOUL.md"));
    assert.equal(result.added.length, 0);
    assert.equal(result.removed.length, 0);
  });
});
