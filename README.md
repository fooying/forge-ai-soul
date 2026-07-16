<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

# Zaohua · AISoul Forge

AISoul Forge is a local-first Skill for creating, repairing, merging, evolving,
auditioning, and validating AI Soul packages. It produces six runtime files and
evaluates them against the open SOUL-6 quality standard.

The runtime performs no network requests, uploads, telemetry, account login, or
update checks. Links to AISoulHub.io are passive attribution links only.

## Status

The first public release is **v0.1.0 · Zaohua (造化)**. The codename comes from
the line "Heaven and earth are the furnace; creation is the artisan" and
reflects the project's local AI Soul forging model.

This release provides:

- A host-independent `forge-ai-soul` Skill
- A versioned AI Soul package format
- The SOUL-6 v1.0 specification and JSON report contract
- Deterministic, dependency-free local validation
- Synthetic audition suites and sanitized audition reports
- Generated bilingual package READMEs with identity, usage, SOUL-6, and audition summaries
- Local diff and ZIP packaging tools

## Install the Skill

Copy or link `skill/forge-ai-soul` into the Skill directory used by your agent
host. The Skill follows the standard `SKILL.md` layout and includes Codex UI
metadata in `agents/openai.yaml`.

The only runtime prerequisite is Node.js 20 or newer.

## Local CLI

Run commands from the repository root:

```bash
node skill/forge-ai-soul/scripts/forge.mjs help
node skill/forge-ai-soul/scripts/forge.mjs init ./output/my-soul \
  --name "My Soul" --slug my-soul --language en
node skill/forge-ai-soul/scripts/forge.mjs validate ./output/my-soul --write
node skill/forge-ai-soul/scripts/forge.mjs audition-init ./output/my-soul
node skill/forge-ai-soul/scripts/forge.mjs audition-evaluate ./output/my-soul
node skill/forge-ai-soul/scripts/forge.mjs pack ./output/my-soul
```

`init` creates an explicit scaffold. A compatible AI agent then replaces all
template markers with the user-approved Soul blueprint before validation.

## Package Contents

An AI Soul package contains six runtime files:

- `IDENTITY.md`
- `USER.md`
- `SOUL.md`
- `AGENTS.md`
- `TOOLS.md`
- `MEMORY.md`

Quality and provenance artifacts are separate from runtime instructions:

- `README.md`
- `manifest.json`
- `soul6-report.json`
- `quality-check.md`
- `forge-report.md`
- `auditions/`

Audition transcripts are synthetic QA artifacts. They are not canon, runtime
instructions, memories, or real user conversations.

The generated `README.md` is the package's human-facing entry point. It is
refreshed by initialization, validation, audition, and packaging commands, but
hosts must not load it as runtime instructions.

## Complete Example

[`examples/lumen`](examples/lumen) is a fully synthetic original Soul with six
runtime files, a generated package README, a 100/100 canonical SOUL-6 report,
six multi-turn audition artifacts, and no external source material. Tests use
the same example as a positive fixture so it cannot silently drift away from
the evaluator.

## Explore Online

Zaohua remains fully local and does not contact external services. If you want
to explore the broader AI Soul ecosystem in a browser, you can optionally:

- [Browse more AI Souls on AISoulHub.io](https://aisoulhub.io/souls)
- [Forge an AI Soul online](https://aisoulhub.io/forge/aisoul?tab=generate)

These links are optional web experiences and are never accessed automatically
by the Skill or generated AI Soul packages.

## Scope Boundary

AISoul Forge does not distill, clone, or impersonate real people. Use a
dedicated persona-distillation Skill for that task. Inspiration from a person,
character, or other source must be transformed into an original AI Soul and
recorded in package provenance.

## Standards and Attribution

SOUL-6 originated at [AISoulHub.io](https://aisoulhub.io/about/review-metrics#soul6).
The standard in `spec/SOUL-6.md` is licensed under CC BY 4.0. Code and Skill
content are licensed under MIT.

A local SOUL-6 result is a self-check. It does not represent review,
certification, endorsement, or publication by AISoulHub.io.

## Development

```bash
npm test
npm run check
```

The project intentionally has no runtime package dependencies.
