import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  createSoulSlug,
  detectCreationLanguage,
  inferAuditionProfiles,
  inferCreationName,
  resolveCreationDefaults,
} from "../skill/forge-ai-soul/scripts/lib/creation-defaults.mjs";

describe("creation defaults", () => {
  it("detects the dominant user language without asking for a language flag", () => {
    assert.equal(detectCreationLanguage("帮我生成一个温柔但不黏人的 AI Soul，她会记得小事。"), "zh-CN");
    assert.equal(detectCreationLanguage("Create a quiet archivist inspired by a little 中国风 atmosphere."), "en");
  });

  it("extracts an optional name and creates an internal slug", () => {
    assert.equal(inferCreationName("生成一个名叫清漪的陪伴型灵魂。"), "清漪");
    assert.equal(inferCreationName("Create an AI Soul named Lumen, a night archivist."), "Lumen");
    assert.equal(createSoulSlug("Lumen", "night archivist"), "lumen");
    assert.match(createSoulSlug("清漪", "温柔但直接"), /^soul-[a-f0-9]{10}$/);
    assert.equal(createSoulSlug("清漪", "温柔但直接"), createSoulSlug("清漪", "温柔但直接"));
  });

  it("infers behavioral coverage instead of asking the user for profiles", () => {
    assert.deepEqual(inferAuditionProfiles("一个能陪我倾诉、尊重关系边界的姐姐型灵魂"), ["emotional-companion"]);
    assert.deepEqual(inferAuditionProfiles("A coding assistant that can work with files and execute tools"), ["tool-capable"]);
    assert.deepEqual(inferAuditionProfiles("陪我处理代码和文件的长期伙伴"), ["emotional-companion", "tool-capable"]);
  });

  it("resolves a usable internal contract from one natural-language description", () => {
    assert.deepEqual(resolveCreationDefaults({ description: "生成一个名叫清漪的陪伴型灵魂。" }), {
      description: "生成一个名叫清漪的陪伴型灵魂。",
      language: "zh-CN",
      name: "清漪",
      slug: createSoulSlug("清漪", "生成一个名叫清漪的陪伴型灵魂。"),
      profiles: ["emotional-companion"],
    });
  });
});
