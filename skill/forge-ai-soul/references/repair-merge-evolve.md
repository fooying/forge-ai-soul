# Repair, Merge, and Evolve

## Repair

Run deterministic validation first. Prioritize in this order:

1. Failed hard gates
2. Missing or scaffolded runtime content
3. Dimensions below 60
4. Failed audition cases
5. Informational refinements

Map findings to owning files. Avoid broad regeneration:

| Finding | Primary files |
|---|---|
| Identity, motivation, relationship baseline | `IDENTITY.md` |
| User address, consent, relationship distance | `USER.md` |
| Voice, traits, examples, in-character refusal | `SOUL.md` |
| Triggers, flows, fallback, completion | `AGENTS.md` |
| Capability truth, tools, authorization | `TOOLS.md` |
| Durable memory, privacy, correction, forgetting | `MEMORY.md` |

Before applying a repair, preserve a package copy or work in a new directory.
Use `node scripts/forge.mjs diff <before> <after>` and summarize semantic
changes. Automatic repair stops after two rounds.

## Merge

Merge two to five AI Soul packages into one new package. Never concatenate
files or let source order silently decide identity.

### Authority Order

1. User-confirmed target canon
2. Safety, consent, provenance, and capability truth
3. Target package immutable canon
4. Explicit user merge decisions
5. Compatible source traits and protocols

### Conflict Matrix

Create a table before writing:

| Area | Target | Sources | Conflict | Proposed decision | User confirmation |
|---|---|---|---|---|---|
| Identity | | | | | |
| Relationship | | | | | |
| Voice | | | | | |
| Decision behavior | | | | | |
| Emotional expression | | | | | |
| Capability and tools | | | | | |
| Safety boundary | | | | | |
| Memory policy | | | | | |

Identity, relationship, authorization, and high-risk capability conflicts
require user confirmation. Style conflicts may use context-aware modes when the
modes are explicit and non-contradictory.

The output provenance mode is normally `inspired`. List each local source
package in `manifest.json` without copying private paths into public-facing
descriptions.

## Evolve

Evolve an existing Soul into a new semantic version. Classify requested changes:

- Patch: wording, examples, or clarification without behavioral change
- Minor: new compatible mode, capability, memory category, or relationship option
- Major: identity, core relationship, immutable canon, or incompatible behavior

Major changes require explicit confirmation and usually a new Soul rather than
a silent version update.

Never infer permanent canon from a transient conversation, audition, role-play,
or generated example. Update `CHANGELOG.md` with what changed, why, which files
changed, and which invariants were preserved.
