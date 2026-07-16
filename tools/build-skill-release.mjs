import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { FORGE_VERSION } from "../skill/forge-ai-soul/scripts/lib/constants.mjs";
import { createZipFromDirectory } from "../skill/forge-ai-soul/scripts/lib/zip.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = path.join(root, "skill", "forge-ai-soul");
const outputDirectory = path.join(root, "dist");
await mkdir(outputDirectory, { recursive: true });
const output = path.join(outputDirectory, `forge-ai-soul-${FORGE_VERSION}.zip`);
const result = await createZipFromDirectory(source, output, "forge-ai-soul");
process.stdout.write(`Built ${result.outputFile} with ${result.files} files.\n`);
