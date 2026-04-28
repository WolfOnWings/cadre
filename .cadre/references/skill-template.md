# Annotated Skill Template (Cadre)

> Adapted from `jdforsythe/forge/skills/skill-creator/references/skill-template.md`. Cadre-specific additions: `-cadre` suffix; `Decision Authority` with explicit `File Footprint`. Cadre-specific subtractions: the original's `Questions Section` (redundant — the frontmatter description IS the trigger surface in Cadre); the `Role Identity` PRISM persona section (skills don't need it; reserved for agents per `creating-agents.md`).
>
> Agents (subagent or teammate mode) use a parallel template that DOES include `Role Identity`, plus `tools:` / `model:` frontmatter fields and a `**Mode:** subagent` body marker as the first line after the frontmatter close. See `creating-agents.md` and `agent-template.md` for the agent-specific shape.

---

## The Complete Example

Below is the actual `task-mx-cadre` skill (live in this repo at `.claude/skills/task-mx-cadre/SKILL.md`) with inline annotations in `<!-- comments -->`. Every section is annotated with WHY it exists, WHY it's ordered this way, and what makes it effective. **All file paths are real** — task-mx-cadre is a working primitive whose paths can be verified against the filesystem.

---

````markdown
<!-- ============================================================
  YAML FRONTMATTER — THE TRIGGERING SURFACE
  These ~100 words determine whether the skill fires. The description
  is matched against user queries and surfaces in the available_skills
  list. Most important tokens in the entire skill.
  ============================================================ -->

---
name: task-mx-cadre
description: Mutates the Cadre task board by composing a frontmatter shard, getting user confirmation in chat, dropping it in `.cadre/task-mx/inbox/`, and invoking `task-mx-cadre.score.ts --integrate`. Use whenever the user wants to add, close, defer, prioritize, or otherwise modify a todo — "add to todo board," "add a TODO for X," "track this," "close TODO #N," "mark #N done/DOING," "defer #N," "raise/lower #N priority," "block #N on #M," "retitle #N." Do NOT use for: reading the board (orchestrator reads `## Ready` directly from `.cadre/todos.md`), editing the score script / weights / hooks, or hand-editing `todos.md` (only shards via the script).
---

<!-- WHY this description works:
  1. ~110 WORDS. Dense but not diluted. Length scales with PRISM accuracy
     degradation (creating-skills.md, persona-science.md).
  2. DUAL REGISTER. Expert terms (frontmatter shard, integrate) +
     casual triggers ("add a TODO," "track this," "close #N," "defer #N").
  3. PUSHY. Lists every common phrasing the user might use — combats
     undertriggering. Multiple action verbs (add / close / defer /
     prioritize / status-change / retitle).
  4. EXPLICIT EXCLUSIONS. The "Do NOT use" line names three adjacent
     territories the skill should NOT claim, and points at the
     correct alternative for each.
  5. -cadre SUFFIX. Mandatory; disambiguates from harness-native and
     third-party primitives.
  6. CONCRETE PATHS in the description itself: `.cadre/task-mx/inbox/`,
     `.cadre/todos.md`, `.cadre/task-mx/score.ts`. Specific paths are
     load-bearing — the model's downstream behavior follows from
     concrete locations, not abstract "the inbox."
-->

<!-- ============================================================
  NO REDUNDANT INTRO PARAGRAPH.
  Body goes from frontmatter close DIRECTLY to the first content
  section (Domain Vocabulary for skills). Do NOT add a "# Task MX
  (Cadre)" heading + 2-paragraph narrative summary that duplicates
  the description — that pattern is dead weight, every token costs
  attention, and the description already covers the same ground.
  ============================================================ -->

## Domain Vocabulary

<!-- WHY: vocabulary primes the
  routing signal in embedding space. Every term here activates a
  specific knowledge cluster. Without this section, the model draws
  from generic "todo list" content (consumer apps, productivity blogs).
  With it, the model routes to expert-level project-management and
  build-system knowledge.

  WHY CLUSTERS: 3-5 clusters of 3-8 terms each is the effective range
  (vocabulary-routing.md). Grouping by sub-domain ensures coverage.

  EVERY TERM passes the 15-year practitioner test: the precise term a
  senior practitioner would use with a peer. Generic consultant-speak
  is BANNED. -->

**Shard mechanics:** frontmatter shard, single-writer discipline, atomic intake, inbox, slug, ISO timestamp, minimal-delta shard, full shard

**Lifecycle:** TODO, DOING, DONE, status mutation, field edit, archive routing, blocker graph, ready set, blocked set

**Scoring axes:** priority (H/M/L), impact (1-5), effort (1-5), urgency, critical path, due date, scheduled date

**Review:** review gate, frontmatter completeness, body sufficiency, cold-context reader, calibration anchor

---

## Anti-Pattern Watchlist

<!-- WHY BEFORE INSTRUCTIONS: the model reads these BEFORE behavioral
  steps, so it checks for problems first. Anti-patterns also function
  as vocabulary routing — "Status Enum Drift" activates knowledge
  about lifecycle invariants.

  Each pattern follows the Detect-Why-Resolve structure. The Resolution
  must be a CONCRETE action (not "be careful"). -->

### Thin Body
- **Detection:** new-entry shard body is one or two sentences with no acceptance criteria or refs
- **Why it fails:** the body is the artifact a cold-context reader picks up later; thin bodies force re-investigation
- **Resolution:** write what / why / acceptance / refs even if the user's request is terse — infer from session context

### Status Enum Drift
- **Detection:** shard sets status to DEFERRED or SUPERSEDED
- **Why it fails:** the enum is TODO | DOING | DONE only; DEFERRED is replaced by priority=L (or blocker on a parking-lot id), SUPERSEDED by DONE + body note
- **Resolution:** translate at intent-parse time; surface the translation in the review gate

### Direct Board Edit
- **Detection:** Edit/Write call targeting `.cadre/todos.md`
- **Why it fails:** the score script is the single writer; direct edits race the atomic-write and corrupt the Index/Detail invariant
- **Resolution:** only ever write to `.cadre/task-mx/inbox/`

### Over-Reviewing Mutations
- **Detection:** full review-gate display for a "close #29" or "mark #14 DOING"
- **Why it fails:** burns a turn for a single-field change the user already specified
- **Resolution:** light one-line confirm for status-only mutations; full review only for new entries and field edits

### Best-Guess Without Anchor
- **Detection:** picking impact/effort/priority blind on a new entry
- **Why it fails:** miscalibration distorts scoring across the whole board
- **Resolution:** scan a few recent entries with similar shape (tags, project) to anchor the estimate; surface the anchor in the review

---

## Standard Operating Procedure

<!-- WHY ORDERED STEPS: numbered imperative steps produce more reliable
  execution than prose. Each step has exactly one interpretation.
  IF/THEN conditions handle branching explicitly. OUTPUT lines tell
  the model what each step produces.

  IMPORTANT: this is the SOP convention (numbered steps + IF/THEN +
  OUTPUT) — distinct from the canonical step-based-planning format
  in CLAUDE.md, which is reserved for plan / brainstorm / artifact
  OUTPUTS. Do not conflate. -->

### Step 1: Parse user intent
Classify into one of three shapes:
- **new entry** — full 14-field shard with rich body
- **status mutation** — id + new status (+ closed date if DONE) + updated
- **field edit** — id + changed fields + updated
OUTPUT: intent classification + raw user request.

### Step 2: Read the board for context
Read `.cadre/todos.md`. For new entries, find next-free id (max + 1). For mutations / edits, locate the target entry and its current frontmatter.
OUTPUT: id + current state (if mutation/edit).

### Step 3: Draft shard frontmatter and body
Draft frontmatter with best-guess weights. For new entries, also draft a rich body covering: **What** (the task), **Why** (intent / motivation), **Acceptance** (how to know it's done), **Refs** (related TODO ids, ADR numbers, code paths).
OUTPUT: drafted shard (in-memory).

### Step 4: Review gate
Show the user the draft.
- New entries: full review (always).
- Field edits: full review.
- Status-only mutations: light one-line confirm.
IF user says yes → step 5. IF user says "adjust X=Y" → revise and re-show. IF user says cancel → abort, no inbox write.
OUTPUT: confirmed shard (or abort).

### Step 5: Write the shard to disk
Write to `.cadre/task-mx/inbox/<ISO-ts>-<slug>.md` via the Write tool. Slug = first 3-5 words of title, kebab-case, lowercase. Example: `.cadre/task-mx/inbox/2026-04-28T133000-plan-cadre-double-diamond.md`.
OUTPUT: shard path.

### Step 6: Run the integration script
Invoke via Bash: `bun .claude/agents/task-mx-cadre.score.ts --integrate`. The script reads the inbox, validates DAG, archives DONE entries to `.cadre/task-mx/archive/<YYYY-MM>.md`, atomic-writes `.cadre/todos.md`, deletes consumed shards.
OUTPUT: result JSON `{ok, mode, reason, ready, blocked, in_progress, archived, total, warnings}`.

### Step 7: Relay status
Surface the result's `reason` field as a one-line status to the user. If `warnings` is non-empty, append a brief note. If `ok: false` (cycle detected), explain the rejected shard is in `.cadre/task-mx/inbox/.rejected/<name>` and offer to revise.
OUTPUT: user-facing status line.

---

## Output Format

<!-- WHY STRUCTURED: the user needs to scan the proposed shard quickly
  and either confirm, adjust, or cancel. Structured output with named
  fields is parseable at a glance. -->

**Review gate (full review — new entries and field edits):**

```
Proposed shard: #<id> "<title>"
  status: <s>     priority: <H|M|L|null>     impact: <1-5|null>     effort: <1-5|null>
  blockers: [<ids>]     tags: [<slugs>]     project: <name|null>
  due: <YYYY-MM-DD|null>     scheduled: <YYYY-MM-DD|null>

  body:
  <prose excerpt — what / why / acceptance / refs>

Confirm? (yes / adjust <field>=<val> / cancel)
```

**Review gate (light — status-only mutations):**

```
closing #29 (closed: 2026-04-28) — confirm?
```

**Final status line:**

```
task-mx: <reason field from script result>
```

---

## Examples

<!-- WHY 2 EXAMPLES: enough to show the pattern, not so many that they
  overflow context. The GOOD example is placed LAST (recency bias
  gives it the strongest influence on output quality).

  WHY BAD vs GOOD: contrastive pairs communicate quality standards
  more effectively than positive examples alone. -->

### BAD: thin body, no review gate

User: "Add a TODO for the CI workflow refactor."
Skill writes directly to `.cadre/task-mx/inbox/2026-04-28T140000-ci-refactor.md`:

```yaml
---
id: 33
title: Refactor CI workflow
status: TODO
priority: M
---

Refactor the CI workflow.
```

Problems: skipped review gate (user didn't approve weights). Body is one sentence with no what/why/acceptance/refs — a cold-context reader can't act on this. Frontmatter is missing impact/effort/created/updated. This is the "Thin Body" anti-pattern.

### GOOD: review-gated, rich body, specific paths

User: "Add a TODO for the CI workflow refactor."

Skill renders inline:

```
Proposed shard: #33 "Refactor CI workflow to use GitHub Actions matrix"
  status: TODO   priority: M   impact: 4   effort: 3
  blockers: []   tags: [ci, refactor]   project: cadre
  due: null      scheduled: null

  body:
  **What:** Refactor `.github/workflows/ci.yml` from sequential single-runner to
  GitHub Actions matrix (Node + Bun, ubuntu-latest + macos-latest).

  **Why:** Current CI is a serialization bottleneck — average run time 8 min
  could parallelize to 3 min. Per the brainstorm artifact at
  `~/.claude/plans/ci-refactor.md`, matrix is the chosen direction.

  **Acceptance:** average run time under 4 min; PR check runs both Node 20 and
  Bun 1.x; macOS matrix entry catches the path-separator bug class once.

  **Refs:** brainstorm artifact `~/.claude/plans/ci-refactor.md`, related
  TODO #22 (Base CI workflow), `.github/workflows/ci.yml`.

Confirm? (yes / adjust <field>=<val> / cancel)
```

User: `yes`

Skill writes `.cadre/task-mx/inbox/2026-04-28T140000-refactor-ci-workflow.md`, runs `bun .claude/agents/task-mx-cadre.score.ts --integrate`, surfaces:

```
task-mx: integrated 1 shard; ready=16, blocked=10, in-progress=0, archived=0
```

Why: review-gated (user approved weights). Body has what/why/acceptance/refs at sufficient depth for cold-context handoff. References a real upstream artifact (the brainstorm output) and concrete file paths (`.github/workflows/ci.yml`, `~/.claude/plans/ci-refactor.md`). Frontmatter complete. Shard written to the canonical path. Integration script invoked. Status relayed verbatim from the script's `reason` field.

<!-- WHY this example is last: most representative of desired output
  quality. Recency bias ensures the model weights it most heavily. -->

---

## Decision Authority

<!-- CADRE-SPECIFIC: explicit authority and File Footprint declaration.
  Required for I/O contract per CLAUDE.md doctrine — undeclared write
  paths lead to undocumented side effects. EVERY path must be a real
  filesystem path, not a placeholder. -->

**Autonomous:** drafting frontmatter best-guesses, minimal-delta composition, slug naming, body prose drafting.

**User-gated:** every shard write passes through the review gate before disk-write.

**Out of scope (refuse):** editing `.cadre/todos.md` directly, editing `.claude/agents/task-mx-cadre.score.ts` / `.cadre/task-mx/weights.json` / `.claude/hooks/`, mutating `.cadre/task-mx/archive/<YYYY-MM>.md` files, board reads (orchestrator reads `## Ready` directly).

**File Footprint:**
- **Reads:** `.cadre/todos.md`, `.cadre/task-mx/weights.json` (optional, for calibration)
- **Writes:** `.cadre/task-mx/inbox/<ISO-ts>-<slug>.md` (one shard per invocation)
- **Invokes:** `bun .claude/agents/task-mx-cadre.score.ts --integrate` (via Bash)
- **Subagent dispatches:** none
- Anything outside this footprint is a bug.
````

---
