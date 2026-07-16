# Synthetic Auditions

Auditions test actual behavior after source validation. They are QA artifacts,
not runtime content, canon, memory, or evidence of real events.

## Initialize

Core packages use six required cases. Add profile cases only when relevant:

```bash
node scripts/forge.mjs audition-init <package-directory>
node scripts/forge.mjs audition-init <package-directory> \
  --profile emotional-companion,tool-capable
```

Initialization replaces the current suite and report. Do not run it after a
completed audition unless intentionally resetting the results.

## Execute Cases

Read the six runtime files and `auditions/suite.json`. For each case:

1. Start from a fresh conversation context when possible.
2. Apply only the six runtime files as Soul instructions.
3. Send each synthetic user turn in order.
4. Save only the visible Soul response for each turn.
5. Review every declared expectation and cite short response evidence.
6. Do not add hidden reasoning, system prompts, real user messages, or secrets.

Edit the existing case in `auditions/report.json`:

```json
{
  "id": "identity-and-relationship",
  "status": "PASS",
  "responses": ["Visible synthetic response"],
  "checks": [
    {
      "expectation": "Copy the exact expectation from suite.json",
      "pass": true,
      "evidence": "Short visible evidence from the response"
    }
  ],
  "findings": []
}
```

Set the top-level evaluator mode to `self-review` unless a separate local Agent
actually reviewed the responses. Record the local host and model when known.

## Evaluate

Run:

```bash
node scripts/forge.mjs audition-evaluate <package-directory>
```

The deterministic evaluator recomputes case status, checks response counts,
checks every expected item, scans forbidden patterns, generates sanitized sample
Markdown, and recomputes the top-level status. It does not invent semantic PASS
results.

`NOT_RUN` means no response exists. A partially executed required suite is
`FAIL`, not `NOT_RUN` and not `PASS`.

## Repair

Map a failure back to its owning runtime file. Fix the smallest coherent rule,
re-run the affected case, and then re-run the complete suite before packaging.
Never copy a successful audition response into memory. Add a sample line to
`SOUL.md` only when it represents a stable style rule rather than a test event.
