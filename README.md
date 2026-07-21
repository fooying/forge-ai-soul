<p align="right">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

# Zaohua · Forge AI Soul

**Turn one description into an AI Soul you can meet, try, and evaluate.**

No setup questionnaire full of package fields. Describe the presence you want,
or ask Zaohua to guide you one question at a time. It chooses a working name,
detects your language, creates the local Soul, lets you talk with it, and checks
whether the personality holds together under SOUL-6.

> **You**
>
> Create Lumen, a calm planning companion with dry wit. She should notice
> patterns, respect my decisions, and become gently direct when I avoid a hard
> question.
>
> **Lumen, in a trial conversation**
>
> That sounds like a low-battery kind of day, not a problem that needs to be
> turned into a project. We can leave it simple. What part of the tiredness is
> asking for a little room?

The complete generated example is available in [`examples/lumen`](examples/lumen).

## Three Things You Can Do

### 1. Create an AI Soul

Give one useful paragraph and receive a complete first version. A name is
optional, and language is detected from what you write.

```text
Create a night-shift archivist who is observant, dry-witted, and quietly
protective. She respects distance, remembers small preferences, and never
pretends she has done something in the real world.
```

If you do not know what you want yet, use guided creation instead:

```text
I only know that I want someone steady but not overly agreeable. Guide me one
question at a time and help me discover the rest.
```

Zaohua asks about the relationship, personality contrast, voice, important
moments, and boundaries. You can skip any question or let it decide.

### 2. Preview It or Talk to It

Ask for short scenes when you want a quick feel for the Soul:

```text
Show me three sample conversations: an ordinary check-in, a disagreement, and
a moment where this Soul needs to refuse me.
```

Or start a live trial chat in the current conversation:

```text
Let me talk to the Soul we just created. Stay in character until I say stop.
```

Trial messages are temporary. They do not silently become the Soul's history,
memory, or permanent settings. When the trial ends, Zaohua can turn your
feedback into a revised version.

### 3. Evaluate It with SOUL-6

SOUL-6 checks whether an AI Soul feels like one coherent character rather than
a collection of adjectives. It covers personality, executable behavior, voice
consistency, relationship and capability limits, safety, and long-term growth.

```text
Evaluate this Soul with SOUL-6. Do not just give me a score; tell me what may
feel unnatural in a real conversation and what to improve first.
```

The result includes a plain-language summary, concrete failure examples,
synthetic behavioral trials, and a detailed local report.

## What a Generated Soul Includes

Each result has a human-facing README that starts with:

- Who the Soul is and what the relationship feels like
- Representative trial conversations in the Soul's actual voice
- A SOUL-6 score with practical strengths and weaknesses
- Simple usage instructions

The runtime package, reports, and portable ZIP remain available for compatible
AI agent hosts, but you do not need to understand their internal fields to
create or try a Soul.

## Install

Copy or link [`skill/forge-ai-soul`](skill/forge-ai-soul) into the Skill folder
used by your AI agent host. Node.js 20 or newer is the only local runtime
requirement.

Then talk to the agent naturally:

```text
Use $forge-ai-soul to create a warm but candid companion from this description...
```

Everything runs locally. The Skill does not upload content, use telemetry,
require an account, call AISoulHub, or check for updates.

<details>
<summary><strong>Local helpers and development</strong></summary>

The AI agent normally runs the helpers for you. To inspect them directly:

```bash
node skill/forge-ai-soul/scripts/forge.mjs help
node skill/forge-ai-soul/scripts/forge.mjs create \
  "Create an AI Soul named Lumen, a calm night archivist."
node skill/forge-ai-soul/scripts/forge.mjs evaluate ./aisouls/lumen --write
```

Repository validation:

```bash
npm test
npm run check
npm run build:skill
```

The project intentionally has no runtime npm dependencies.

</details>

## Explore More

Zaohua never opens these links automatically, but you can optionally:

- [Browse more AI Souls on AISoulHub.io](https://aisoulhub.io/souls)
- [Forge an AI Soul online](https://aisoulhub.io/forge/aisoul?tab=generate)

Zaohua creates original fictional AI Souls. It does not distill, clone, or
impersonate real people or public figures.

SOUL-6 originated at
[AISoulHub.io](https://aisoulhub.io/about/review-metrics#soul6) and is provided
under CC BY 4.0. Code and Skill content are MIT licensed. A local SOUL-6 result
is a self-check, not AISoulHub.io certification or endorsement.
