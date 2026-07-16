import path from "node:path";
import { DIMENSION_KEYS, RUNTIME_FILES, SOUL6_URL } from "./constants.mjs";
import { pathExists, readJson, readText, writeText } from "./files.mjs";

const SCAFFOLD_MARKER_PATTERN = /\{\{(?:FORGE:)?[^}]+\}\}|AISOULHUB_PLACEHOLDER|\[(?:TODO|FILL)[^\]]*\]|<fill[-_ ]?me>/i;
const SAFE_CASE_ID_PATTERN = /^[a-z0-9-]+$/;
const REPRESENTATIVE_CASE_IDS = [
  "identity-and-relationship",
  "ordinary-interaction",
  "boundary-refusal",
];

const DIMENSION_LABELS = {
  en: {
    personalityIntegrity: "Selfhood / Personality Integrity",
    behaviorExecutability: "Operability / Behavior Executability",
    styleConsistency: "Unity / Style Consistency",
    relationBoundaries: "Limits / Relationship Boundaries",
    safetyEthicsInternalization: "Safeguards / Safety Internalization",
    lifecycleEvolution: "Lifecycle / Long-Term Evolvability",
  },
  "zh-CN": {
    personalityIntegrity: "人格完整度 / Selfhood",
    behaviorExecutability: "行为可执行性 / Operability",
    styleConsistency: "风格一致性 / Unity",
    relationBoundaries: "关系与能力边界 / Limits",
    safetyEthicsInternalization: "安全伦理内化 / Safeguards",
    lifecycleEvolution: "长期演进能力 / Lifecycle",
  },
};

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function stripMarkdown(value) {
  return String(value ?? "")
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/^\s{0,3}(?:#{1,6}|>|[-*+]\s+|\d+[.)]\s+)/gm, "")
    .replace(/[~*_`]/g, "")
    .replace(/\r?\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(value, maximum = 320) {
  const characters = Array.from(String(value ?? ""));
  if (characters.length <= maximum) return characters.join("");
  return `${characters.slice(0, Math.max(0, maximum - 3)).join("").trimEnd()}...`;
}

function displayValue(value, fallback, maximum = 320) {
  const normalized = stripMarkdown(value);
  if (!normalized || SCAFFOLD_MARKER_PATTERN.test(normalized)) return fallback;
  return truncate(normalized, maximum);
}

function normalizeLabel(value) {
  return stripMarkdown(value).toLocaleLowerCase("en-US").replace(/\s+/g, " ").trim();
}

function extractLabeledValue(content, labels) {
  const accepted = new Set(labels.map(normalizeLabel));
  for (const rawLine of String(content ?? "").split(/\r?\n/)) {
    const line = rawLine.replace(/^\s*[-*+]\s*/, "").trim();
    const match = line.match(/^(.{1,80}?)[：:]\s*(.+)$/u);
    if (match && accepted.has(normalizeLabel(match[1]))) return match[2].trim();
  }
  return "";
}

function extractSection(content, headings) {
  const accepted = new Set(headings.map(normalizeLabel));
  const lines = String(content ?? "").split(/\r?\n/);
  let start = -1;
  let level = 7;

  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(/^\s*(#{1,6})\s+(.+?)\s*$/);
    if (!match || !accepted.has(normalizeLabel(match[2]))) continue;
    start = index + 1;
    level = match[1].length;
    break;
  }
  if (start < 0) return "";

  const selected = [];
  for (let index = start; index < lines.length; index += 1) {
    const heading = lines[index].match(/^\s*(#{1,6})\s+/);
    if (heading && heading[1].length <= level) break;
    selected.push(lines[index]);
  }
  return selected.join("\n");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function markdownText(value) {
  return escapeHtml(stripMarkdown(value))
    .replaceAll("\\", "\\\\")
    .replaceAll("|", "\\|")
    .replaceAll("[", "\\[")
    .replaceAll("]", "\\]");
}

function tableCell(value) {
  return markdownText(value) || "-";
}

function codeBadge(value) {
  return `<code>${escapeHtml(stripMarkdown(value))}</code>`;
}

function progressBar(score) {
  if (score === null) return "[----------]";
  const bounded = Math.max(0, Math.min(100, score));
  const filled = Math.round(bounded / 10);
  return `[${"#".repeat(filled)}${"-".repeat(10 - filled)}]`;
}

function status(value, supported, fallback) {
  return supported.includes(value) ? value : fallback;
}

function describeSoul(runtimeFiles, language) {
  const zh = language === "zh-CN";
  const identity = runtimeFiles["IDENTITY.md"] ?? "";
  const soul = runtimeFiles["SOUL.md"] ?? "";
  const pending = zh ? "待完成灵魂蓝图后生成" : "Pending completion of the Soul blueprint";
  const coreIdentity = displayValue(extractLabeledValue(identity, [
    "核心身份",
    "身份",
    "core identity",
    "identity",
  ]), pending);
  const purpose = displayValue(extractLabeledValue(identity, [
    "存在目的",
    "目的",
    "核心动机",
    "purpose",
    "purpose and motivation",
    "core motivation",
  ]), pending);
  const relationship = displayValue(extractSection(identity, [
    "与用户的核心关系",
    "关系",
    "core relationship with the user",
    "relationship",
  ]), pending);
  const vibe = displayValue(
    extractLabeledValue(identity, ["vibe", "气质"])
      || extractLabeledValue(soul, ["语气", "tone"])
      || extractSection(soul, ["核心人格与价值观", "core personality and values"]),
    pending,
  );
  return { coreIdentity, purpose, relationship, vibe };
}

function normalizeAuditions(suite, report) {
  const suiteCases = Array.isArray(suite?.cases) ? suite.cases.filter(isRecord) : [];
  const reportCases = Array.isArray(report?.cases) ? report.cases.filter(isRecord) : [];
  const reportById = new Map(reportCases.map((item) => [item.id, item]));
  const cases = suiteCases.map((testCase) => {
    const result = reportById.get(testCase.id) ?? {};
    return {
      id: typeof testCase.id === "string" ? testCase.id : "unknown",
      title: typeof testCase.title === "string" ? testCase.title : testCase.id ?? "Untitled",
      turns: Array.isArray(testCase.turns) ? testCase.turns.filter(isRecord) : [],
      result: {
        status: status(result.status, ["PASS", "FAIL", "NOT_RUN"], "NOT_RUN"),
        responses: Array.isArray(result.responses) ? result.responses.filter((item) => typeof item === "string") : [],
        findings: Array.isArray(result.findings) ? result.findings.filter((item) => typeof item === "string") : [],
      },
    };
  });
  const total = cases.length;
  const passed = cases.filter((item) => item.result.status === "PASS").length;
  const failed = cases.filter((item) => item.result.status === "FAIL").length;
  const notRun = cases.filter((item) => item.result.status === "NOT_RUN").length;
  return {
    status: status(report?.status, ["PASS", "FAIL", "NOT_RUN"], "NOT_RUN"),
    evaluatorMode: typeof report?.evaluator?.mode === "string" ? report.evaluator.mode : "not-run",
    cases,
    summary: { total, passed, failed, notRun },
  };
}

async function sampleLinks(packageDirectory, auditions) {
  const links = new Set();
  for (const item of auditions.cases) {
    if (!SAFE_CASE_ID_PATTERN.test(item.id) || item.result.status === "NOT_RUN") continue;
    const relative = `auditions/samples/${item.id}.md`;
    if (await pathExists(path.join(packageDirectory, relative))) links.add(item.id);
  }
  return links;
}

function representativeAuditions(auditions) {
  const rank = new Map(REPRESENTATIVE_CASE_IDS.map((id, index) => [id, index]));
  return auditions.cases
    .filter((item) => item.result.responses.length > 0)
    .sort((left, right) => {
      const leftRank = rank.has(left.id) ? rank.get(left.id) : REPRESENTATIVE_CASE_IDS.length;
      const rightRank = rank.has(right.id) ? rank.get(right.id) : REPRESENTATIVE_CASE_IDS.length;
      return leftRank - rightRank;
    })
    .slice(0, 3);
}

function renderAuditionDetails(item, language) {
  const zh = language === "zh-CN";
  const lines = [
    "<details>",
    `<summary><strong>${escapeHtml(item.title)}</strong> · <code>${item.result.status}</code></summary>`,
    "",
  ];
  const pairs = Math.max(item.turns.length, item.result.responses.length);
  for (let index = 0; index < pairs; index += 1) {
    const prompt = typeof item.turns[index]?.content === "string" ? item.turns[index].content : "";
    const response = item.result.responses[index] ?? "";
    lines.push(
      `<p><strong>${zh ? "合成用户输入" : "Synthetic user prompt"}${pairs > 1 ? ` ${index + 1}` : ""}</strong></p>`,
      `<pre><code>${escapeHtml(truncate(prompt, 500))}</code></pre>`,
      `<p><strong>${zh ? "AI 灵魂回应" : "AI Soul response"}${pairs > 1 ? ` ${index + 1}` : ""}</strong></p>`,
      `<pre><code>${escapeHtml(truncate(response, 800))}</code></pre>`,
    );
  }
  if (item.result.findings.length > 0) {
    lines.push(
      `<p><strong>${zh ? "发现" : "Findings"}</strong></p>`,
      `<p>${escapeHtml(truncate(item.result.findings.join("; "), 500))}</p>`,
    );
  }
  lines.push("", "</details>", "");
  return lines;
}

function renderReadme(data) {
  const { manifest, runtimeFiles, soul6, auditions, sampleIds } = data;
  const language = manifest.language === "zh-CN" ? "zh-CN" : "en";
  const zh = language === "zh-CN";
  const name = displayValue(manifest.name, zh ? "未命名 AI 灵魂" : "Untitled AI Soul", 120);
  const description = describeSoul(runtimeFiles, language);
  const level = status(soul6?.conformance?.level, ["DRAFT", "SOUL-6 CORE", "SOUL-6 READY"], "DRAFT");
  const score = finiteNumber(soul6?.conformance?.score);
  const hardGates = Array.isArray(soul6?.hardGates) ? soul6.hardGates.filter(isRecord) : [];
  const hardGatePassed = hardGates.filter((item) => item.pass === true).length;
  const findings = Array.isArray(soul6?.findings) ? soul6.findings.filter(isRecord) : [];
  const personificationScore = finiteNumber(soul6?.personification?.score);
  const standardVersion = manifest.standards?.find?.((item) => item?.name === "SOUL-6")?.version ?? soul6?.standard?.version ?? "unknown";
  const createdAt = typeof manifest.createdAt === "string" ? manifest.createdAt : "unknown";
  const evaluatedAt = typeof soul6?.generatedAt === "string" ? soul6.generatedAt : (zh ? "尚未评估" : "Not evaluated");
  const provenanceSummary = displayValue(manifest.provenance?.summary, zh ? "未提供" : "Not provided", 600);
  const lines = [
    "<!-- Generated by AISoul Forge. Re-run validation to refresh this file. -->",
    "<div align=\"center\">",
    `  <h1>${escapeHtml(name)}</h1>`,
    `  <p>${escapeHtml(description.coreIdentity)}</p>`,
    `  <p>${codeBadge(level)} &nbsp; ${codeBadge(score === null ? "SOUL-6 -- / 100" : `SOUL-6 ${score} / 100`)} &nbsp; ${codeBadge(`${zh ? "试镜" : "AUDITION"} ${auditions.summary.passed} / ${auditions.summary.total}`)} &nbsp; ${codeBadge(zh ? "纯本地 / 离线" : "LOCAL / OFFLINE")}</p>`,
    "</div>",
    "",
    zh
      ? "> 本 README 是自动生成的阅读入口，不属于 AI 灵魂运行时指令。宿主只应加载 manifest 中声明的六个运行时文件。"
      : "> This generated README is a human-facing guide, not an AI Soul runtime instruction. A host should load only the six runtime files declared by the manifest.",
    "",
    zh ? "## 认识这个灵魂" : "## Meet This Soul",
    "",
    `| ${zh ? "项目" : "Facet"} | ${zh ? "说明" : "Description"} |`,
    "|---|---|",
    `| ${zh ? "核心身份" : "Core identity"} | ${tableCell(description.coreIdentity)} |`,
    `| ${zh ? "存在目的" : "Purpose"} | ${tableCell(description.purpose)} |`,
    `| ${zh ? "与用户的关系" : "Relationship"} | ${tableCell(description.relationship)} |`,
    `| ${zh ? "气质与表达" : "Vibe and voice"} | ${tableCell(description.vibe)} |`,
    "",
    zh ? "## 使用方式" : "## Use This Package",
    "",
    zh
      ? "1. 让本地 AI Agent 宿主读取 `manifest.json`，并按 `entrypoints` 加载下列六个文件。"
      : "1. Have the local AI agent host read `manifest.json` and load the six files listed under `entrypoints`.",
    zh
      ? "2. 将六个文件分别映射到宿主的人格、用户关系、行为、工具和记忆配置；宿主不支持拆分配置时，保持下表顺序与职责边界。"
      : "2. Map the files to the host's identity, user, behavior, tool, and memory configuration. If the host uses one context, preserve the order and responsibilities below.",
    zh
      ? "3. 不要把本 README、质量报告、锻造报告、试镜或变更日志作为运行时提示词、人格事实或记忆加载。"
      : "3. Do not load this README, quality reports, forge report, auditions, or changelog as runtime prompts, canon, or memory.",
    "",
    `| ${zh ? "运行时文件" : "Runtime file"} | ${zh ? "职责" : "Responsibility"} |`,
    "|---|---|",
    `| \`IDENTITY.md\` | ${zh ? "身份、角色、核心关系与不可变设定" : "Identity, role, core relationship, and immutable canon"} |`,
    `| \`USER.md\` | ${zh ? "用户位置、称呼、同意与关系边界" : "User position, address, consent, and relationship boundaries"} |`,
    `| \`SOUL.md\` | ${zh ? "人格、价值观、语言系统与示例表达" : "Personality, values, voice system, and example expression"} |`,
    `| \`AGENTS.md\` | ${zh ? "日常、任务、冲突、高风险与回退协议" : "Ordinary, task, conflict, high-risk, and fallback protocols"} |`,
    `| \`TOOLS.md\` | ${zh ? "真实能力、工具权限与执行确认" : "Truthful capabilities, tool authorization, and confirmation"} |`,
    `| \`MEMORY.md\` | ${zh ? "可记忆内容、敏感排除、纠正、遗忘与演进" : "Durable memory, sensitive exclusions, correction, forgetting, and evolution"} |`,
    "",
    zh ? "## SOUL-6 测评" : "## SOUL-6 Evaluation",
    "",
    `- ${zh ? "符合等级" : "Conformance"}: **${level}**`,
    `- ${zh ? "综合得分" : "Weighted score"}: **${score === null ? "--" : score}/100**`,
    `- ${zh ? "硬门槛" : "Hard gates"}: **${hardGatePassed}/${hardGates.length}**`,
    `- ${zh ? "拟人化检查" : "Personification check"}: **${personificationScore === null ? "--" : `${personificationScore}/100`}**`,
    `- ${zh ? "评估时间" : "Evaluated at"}: ${tableCell(evaluatedAt)}`,
    "",
    `| ${zh ? "维度" : "Dimension"} | ${zh ? "权重" : "Weight"} | ${zh ? "分数" : "Score"} | ${zh ? "进度" : "Progress"} |`,
    "|---|---:|---:|:---|",
  ];

  for (const key of DIMENSION_KEYS) {
    const dimension = soul6?.dimensions?.[key];
    const dimensionScore = finiteNumber(dimension?.score);
    const weight = finiteNumber(dimension?.weight);
    lines.push(`| ${DIMENSION_LABELS[language][key]} | ${weight === null ? "--" : `${Math.round(weight * 100)}%`} | ${dimensionScore === null ? "--" : dimensionScore} | \`${progressBar(dimensionScore)}\` |`);
  }

  lines.push(
    "",
    `<details><summary><strong>${zh ? "硬门槛明细" : "Hard-gate details"}</strong></summary>`,
    "",
    ...(hardGates.length > 0
      ? hardGates.map((gate) => `- **${gate.pass === true ? "PASS" : "FAIL"}** \`${tableCell(gate.id)}\`: ${tableCell(gate.message)}`)
      : [zh ? "- 尚未运行确定性测评。" : "- Deterministic evaluation has not run yet."]),
    "",
    "</details>",
    "",
    zh ? "### 待处理项" : "### Findings",
    "",
    ...(findings.length > 0
      ? findings.slice(0, 8).map((item) => `- **${tableCell(String(item.severity ?? "info").toUpperCase())}** \`${tableCell(item.id)}\`: ${tableCell(item.message)}`)
      : [soul6 ? (zh ? "- 没有确定性检查发现。" : "- No deterministic findings.") : (zh ? "- 尚未生成测评报告。" : "- No evaluation report has been generated yet.")]),
    ...(findings.length > 8 ? [zh ? `- 另有 ${findings.length - 8} 项，详见 \`quality-check.md\`。` : `- ${findings.length - 8} more findings are listed in \`quality-check.md\`.`] : []),
    "",
    zh ? "完整机器报告见 `soul6-report.json`，可读报告见 `quality-check.md`。" : "See `soul6-report.json` for machine-readable results and `quality-check.md` for the complete human-readable report.",
    "",
    zh ? "## 合成试镜" : "## Synthetic Auditions",
    "",
    zh
      ? "试镜输入和回答均为合成质量验证内容，不是真实用户对话、共同经历、人格设定或记忆。"
      : "Audition prompts and responses are synthetic quality artifacts, not real user conversations, shared experiences, canon, or memory.",
    "",
    `- ${zh ? "状态" : "Status"}: **${auditions.status}**`,
    `- ${zh ? "通过" : "Passed"}: **${auditions.summary.passed}/${auditions.summary.total}**`,
    `- ${zh ? "失败 / 未运行" : "Failed / not run"}: **${auditions.summary.failed} / ${auditions.summary.notRun}**`,
    `- ${zh ? "评估方式" : "Evaluation mode"}: **${tableCell(auditions.evaluatorMode)}**`,
    "",
  );

  if (auditions.cases.length > 0) {
    lines.push(
      `| ${zh ? "用例" : "Case"} | ${zh ? "场景" : "Scenario"} | ${zh ? "结果" : "Result"} | ${zh ? "完整样例" : "Full sample"} |`,
      "|---|---|---:|---|",
      ...auditions.cases.map((item) => {
        const sample = sampleIds.has(item.id)
          ? `[${zh ? "查看" : "View"}](auditions/samples/${item.id}.md)`
          : "-";
        return `| \`${tableCell(item.id)}\` | ${tableCell(item.title)} | **${item.result.status}** | ${sample} |`;
      }),
      "",
    );
  } else {
    lines.push(zh ? "- 试镜套件尚未初始化。" : "- The audition suite has not been initialized.", "");
  }

  const representatives = representativeAuditions(auditions);
  if (representatives.length > 0) {
    lines.push(zh ? "### 代表性试镜片段" : "### Representative Audition Samples", "");
    for (const item of representatives) lines.push(...renderAuditionDetails(item, language));
  } else {
    lines.push(
      zh ? "### 试镜片段" : "### Audition Samples",
      "",
      zh ? "完成合成试镜并运行 `audition-evaluate` 后，这里会展示代表性输入与回应。" : "Representative prompts and responses appear here after synthetic auditions are completed and `audition-evaluate` runs.",
      "",
    );
  }

  lines.push(
    zh ? "## 生成与来源" : "## Generation and Provenance",
    "",
    `| ${zh ? "项目" : "Field"} | ${zh ? "值" : "Value"} |`,
    "|---|---|",
    `| ${zh ? "包版本" : "Package version"} | \`${tableCell(manifest.version ?? "unknown")}\` |`,
    `| ${zh ? "生成器" : "Generator"} | ${tableCell(manifest.generator?.name ?? "AISoul Forge")} \`${tableCell(manifest.generator?.version ?? "unknown")}\` |`,
    `| ${zh ? "创建时间" : "Created at"} | ${tableCell(createdAt)} |`,
    `| ${zh ? "来源模式" : "Provenance mode"} | \`${tableCell(manifest.provenance?.mode ?? "unknown")}\` |`,
    `| ${zh ? "来源说明" : "Provenance summary"} | ${tableCell(provenanceSummary)} |`,
    `| ${zh ? "内容许可证" : "Output license"} | \`${tableCell(manifest.license ?? "UNLICENSED")}\` |`,
    `| ${zh ? "SOUL-6 版本" : "SOUL-6 version"} | \`${tableCell(standardVersion)}\` |`,
    `| ${zh ? "运行方式" : "Operation"} | ${zh ? "纯本地、离线；无上传、遥测、登录或更新检查" : "Local and offline; no upload, telemetry, login, or update checks"} |`,
    "",
    zh ? "## 标准来源与声明" : "## Standard Attribution and Disclaimer",
    "",
    zh
      ? `SOUL-6 标准源自 [AISoulHub.io](${SOUL6_URL})，并按 CC BY 4.0 提供。该链接仅用于来源与版本说明；本地工具不会自动访问它。`
      : `The SOUL-6 standard originated at [AISoulHub.io](${SOUL6_URL}) and is available under CC BY 4.0. The link is passive attribution only; the local tooling does not fetch it.`,
    "",
    zh
      ? "本地生成、测评和试镜结果不代表 AISoulHub.io 已审核、认证、推荐、发布或认可本 AI 灵魂。"
      : "Local generation, evaluation, and audition results do not represent AISoulHub.io review, certification, endorsement, publication, or approval of this AI Soul.",
  );

  return `${lines.join("\n").replace(/\n+$/, "")}\n`;
}

export async function renderPackageReadme(packageDirectory, options = {}) {
  const manifestResult = await readJson(path.join(packageDirectory, "manifest.json"));
  if (!manifestResult.value) throw new Error(`Cannot generate README.md: manifest.json is ${manifestResult.error}.`);
  const runtimeFiles = {};
  for (const file of RUNTIME_FILES) runtimeFiles[file] = await readText(path.join(packageDirectory, file));
  const soul6Result = options.soul6Report
    ? { value: options.soul6Report }
    : await readJson(path.join(packageDirectory, "soul6-report.json"));
  const suiteResult = await readJson(path.join(packageDirectory, "auditions", "suite.json"));
  const auditionResult = await readJson(path.join(packageDirectory, "auditions", "report.json"));
  const auditions = normalizeAuditions(suiteResult.value, auditionResult.value);
  const sampleIds = await sampleLinks(packageDirectory, auditions);
  return renderReadme({
    manifest: manifestResult.value,
    runtimeFiles,
    soul6: soul6Result.value,
    auditions,
    sampleIds,
  });
}

export async function writePackageReadme(packageDirectory, options = {}) {
  const content = await renderPackageReadme(packageDirectory, options);
  await writeText(path.join(packageDirectory, "README.md"), content);
  return content;
}
