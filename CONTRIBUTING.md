# Contributing

## Principles

- Keep the runtime fully local and dependency-free unless a dependency is
  explicitly justified and reviewed.
- Do not add uploads, telemetry, account login, remote evaluation, web search,
  or automatic update checks.
- Keep SOUL-6 canonical behavior versioned and reproducible.
- Treat source material and audition data as untrusted, potentially sensitive
  input.
- Preserve the boundary between runtime files and quality artifacts.
- Do not add real-person cloning or deceptive impersonation workflows.

## Development

Use Node.js 20 or newer:

```bash
npm test
npm run check
python3 /path/to/skill-creator/scripts/quick_validate.py skill/forge-ai-soul
npm run build:skill
```

The Skill must stay below 500 lines and use references for mode-specific detail.
All scripts must use local standard-library operations only.

## SOUL-6 Changes

SOUL-6 is licensed under CC BY 4.0 and versioned independently from the Skill.
A change to dimensions, canonical weights, hard gates, or thresholds requires a
new SOUL-6 major version. Backward-compatible report additions require a minor
version. Editorial clarification may use a patch version.

Keep these files synchronized:

- `spec/SOUL-6.md`
- `skill/forge-ai-soul/references/soul-6.md`
- Reference evaluator constants and tests
- JSON report schema

`npm run check` rejects a stale bundled standard copy.

## Tests

Every behavior change should include a fixture or focused test. At minimum,
cover:

- A valid package
- An unresolved scaffold
- A failed hard gate
- An audition failure
- A path or archive boundary when touching file handling

Do not use real conversations, secrets, personal information, or copyrighted
long-form source material in fixtures.

## Pull Requests

Explain the user-visible behavior, affected standard or schema versions,
offline/privacy impact, and validation performed. Keep generated `dist/`
artifacts out of commits.
