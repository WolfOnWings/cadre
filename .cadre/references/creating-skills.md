# Creating Skills (Cadre patterns)

Cadre-specific patterns and decision criteria for authoring Claude Code skills. Authoritative syntax should be verified against live Claude Code docs at creation time (use Explore subagent on `https://code.claude.com/docs/`); this file captures Cadre conventions and decision frameworks layered on top of the harness.

For research-grounded technique ranking (position, format, context volume, instruction density, etc.), see `creation-techniques.md` — that file is the north star for instruction-following reliability.

---

## Cadre conventions

- **Naming:** `<name>-cadre` suffix per project naming convention. Disambiguates from harness-native skills.
- **Path:** `*/cadre/.claude/skills/<name>-cadre/SKILL.md`. Directory name matches skill name in frontmatter.
- **Bundled refs:** subdirectories like `references/`, `examples/`, `schemas/` ship with the skill and are progressively-loaded.
- **I/O:** declare what the skill reads and writes (file footprint), what it produces (output artifact), what it accepts (input schema).

## File structure

```
skill-name-cadre/
├── SKILL.md                    # Core instructions, ideally under 500 lines
└── references/                 # Extended material loaded on demand
    ├── domain-deep-dive.md
    └── examples-extended.md
```

The progressive-disclosure split (per `creation-techniques.md` Technique 5) keeps the always-loaded portion (SKILL.md) small while other content (full pattern libraries, extended examples) lives in `references/` and gets read seperately.

## Frontmatter (verify current syntax via Explore)

Minimum required:
```yaml
---
name: skill-name-cadre
description: |
  Dual-register description (formal + colloquial). 
  Use this skill when [trigger contexts]. 
---
```

## Description authoring (the triggering surface)

The ~100 words of the skill description determine whether the skill fires.

**Dual-register.** Mix formal terminology (for activating expert knowledge clusters when triggered) with colloquial language (for matching user queries written in plain language). For every formal trigger phrase, write 2-3 colloquial equivalents. Single-register descriptions either undertrigger (too formal — won't fire on plain-language requests) or trigger but produce generic output (too casual — no expert routing signal).

**Pushy about triggering.** Current models undertrigger by default — they err toward not invoking a skill when the situation is ambiguous. Aggressively claim territory: include the domain AND specific user scenarios AND synonyms AND adjacent contexts. The description should make it obvious when the skill applies.

Example:

> WEAK: "Build dashboards to display data."
>
> STRONG: "Build dashboards, analytics views, KPI displays, metric compositions, and data overview screens. Use this skill whenever the user mentions dashboards, analytics, metrics, KPIs, charts, reporting views, executive summaries, or wants to display aggregated data.

## Body structure (attention-optimized order)

The order of sections within SKILL.md is not arbitrary. It is optimized for how the model processes context — the U-shaped attention curve (per `creation-techniques.md` Technique 1) means beginning and end get the most attention. The internal order:

1. **Expert Vocabulary Payload** (15-30 terms in 3-5 clusters) — appears FIRST in body to prime the routing signal before any execution begins. The vocabulary determines which knowledge clusters activate.
2. **Anti-Pattern Watchlist** (5-10 named anti-patterns) — before behavioral instructions so the model checks for failure modes before proceeding with normal execution.
3. **Behavioral Instructions** (imperative steps with explicit IF/THEN, OUTPUT lines) — structured enough to survive middle-position attention degradation.
4. **Output Format** — templates, required fields, structure specifications.
5. **Examples** — 2-3 BAD vs GOOD pairs or input→output demonstrations. Place the most representative example LAST (recency bias).

## Anti-pattern format (detection → resolution)

Every anti-pattern entry in the watchlist follows the same structure:

- **Name** with origin/attribution where one exists ("Bikeshedding (Parkinson's Law of Triviality)")
- **Detection signal** — observable in the user's input or the work-in-progress, not subjective ("seems superficial")
- **Why it fails** — the mechanism that makes this pattern produce bad outcomes
- **Resolution** — concrete action to take when detected, not vague advice ("be careful")

## Assess world-state

When required, skills should read project-specific context (`CLAUDE.md`, config files, existing conventions in the codebase) at runtime rather than defaulting to generic patterns. Hardcoding project conventions in the skill body creates brittleness — when conventions evolve, every hardcoded skill needs manual update. A skill that reads `CLAUDE.md` at runtime adapts automatically.

## Right altitude

Strike the Goldilocks zone between over-specified brittle logic and under-specified vague guidance:
- Over-specification creates fragility — hardcoded rules that break on edge cases
- Under-specification leaves the model guessing and produces high-variance output

The right altitude names things precisely (tokens, patterns, frameworks, file paths) without dictating every decision. "Use `var(--spacing-md)` for standard element gaps" names the token without dictating where to apply it.

## Common pitfalls

- **Description undertriggers** — too formal, no colloquial register. Skill won't fire when users ask in plain language.
- **Description overtriggers** — too vague. Skill fires inappropriately, wastes attention.
- **Verbose body** — over 500 lines. Middle of skill loses attention; per `creation-techniques.md` Technique 5, large bodies degrade reliability.
- **Inline edge cases** — long lists of conditional rules instead of canonical examples. Use 2-3 diverse examples; let the model generalize.
- **Overlapping skill sets** — multiple skills with unclear boundaries lead to mis-triggers. If a human can't say which skill should fire, the model can't either.
- **Hallucinated frontmatter fields** — adding fields the harness doesn't support. Verify against live docs.

## Runtime verification

Before producing a final SKILL.md, dispatch the Explore subagent on Claude Code's skill documentation to verify current frontmatter syntax, supported features, and any new conventions. The harness evolves; a stale reference is worse than no reference.
