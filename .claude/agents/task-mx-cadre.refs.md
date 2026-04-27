# task-mx-cadre — references

Loaded by the curator during the Step 4 self-critique pass. Not read in normal SOP flow — kept here to keep the always-loaded body lean.

## Extended anti-pattern descriptions

### Frontmatter incompleteness
A shard arrives missing required fields (`id`, `title`, `status`) or has them as empty strings rather than explicit `null`. The score script silently skips entries it can't parse, which means the orchestrator's `## Ready` queue starts dropping items the user expects to see. Required fields are non-negotiable. Optional fields (`due`, `priority`, `impact`, etc.) MUST be explicit `null` when unknown — never omitted, never empty string. The `?` placeholder is reserved for migration-mode ambiguity surfaced for user review; in steady-state, the agent normalizes `?` to `null` before write.

### Blocker-graph implausibility
A `blockers: [#7]` entry where #7 doesn't exist in the board (orphan), or where #7's status is already DONE/SUPERSEDED (stale). Orphans usually mean the user typo'd an id or referenced a TODO that never got created; stale blockers mean the user forgot to remove the dependency after closing the blocker. Both are recoverable via score-script DAG processing — orphans are silently dropped (score script ignores ids not in the entry set), stale blockers are bypassed (DONE/SUPERSEDED entries are excluded from the DAG). But surface them in the audit return so the user can decide whether to keep the dependency for documentation or remove it.

### Schema drift
Frontmatter fields outside the declared 15-field schema (id, title, status, priority, due, scheduled, blockers, blocking, tags, project, impact, effort, created, updated, closed). Drift starts with one field — `assignee`, `epic`, `points` — and the parser silently ignores them, the user assumes they're load-bearing, and the schema's coherence rots. Reject unknown keys at audit time. If a new field genuinely earns its place, that's an ADR amendment and a `weights.json` extension, not an ad-hoc shard write.

### Duplicate-by-title
Two entries with the same case-insensitive title across different ids. Usually indicates intake collision: user said "add this to TODOs" twice for the same idea, or two shards landed in the inbox before the curator ran and integrated them. Sometimes legitimate (two distinct work items with the same name) — surface for user resolution rather than auto-merging.

### Cycle on integration
A shard's `blockers: [#a]` chain combined with the existing graph creates a cycle (#a → #b → #c → #a). Refuse-and-emit: shard moves to `.cadre/task-mx/inbox/.rejected/<original-name>` with a prepended `# REJECTED: cycle [...]` header. `todos.md` is unchanged. User prose is preserved — they can edit the rejected shard, fix the blocker chain, and copy it back to inbox to retry.

### Migration-mode self-validation drift
Migration mode generates frontmatter for existing prose-heavy entries. The agent is comparing its OWN output to its OWN inferences — a self-validation loop with no external ground truth (sycophancy risk per Sharma et al., Anthropic 2023, *Towards Understanding Sycophancy*). The 4-rule self-critique pass is REPLACED in migration mode with a structured-diff emit + halt-for-orchestrator-review. The user is the L1 ground truth; the agent emits, the user gates.

### Direct-write to `.cadre/todos.md`
ANY agent-side `Write` or `Edit` of `.cadre/todos.md` outside the `score.ts --integrate` path is a footprint violation. The script owns the atomic-rename discipline (Windows-aware two-step) and the format. Direct edits create inconsistency, race conditions, and break the single-writer invariant.

---

## Examples

### Example 1: Frontmatter incompleteness

**BAD shard:**
```yaml
---
id: 100
title: Fix the thing
---

needs to ship before friday.
```

Missing `status`, no normalized null fields. Score script will guess `status: TODO` (default) but `due` and `priority` go undefined. "Friday" is a strong due-date signal lost in the prose body.

**GOOD shard (after orchestrator drafts properly):**
```yaml
---
id: 100
title: Fix the thing
status: TODO
priority: H
due: 2026-05-01
scheduled: null
blockers: []
tags: [bug]
project: cadre
impact: 2
effort: 1
created: 2026-04-27
updated: 2026-04-27
closed: null
---

Needs to ship before friday. Production users hitting the bug since the 4.6 deploy.
```

All fields explicit. "Friday" extracted into `due:`. Bug context preserved in body.

### Example 2: Blocker-graph implausibility

**BAD shard:**
```yaml
---
id: 105
title: Wire CI
status: TODO
blockers: [99]   # 99 doesn't exist
...
---
```

Score script silently drops the dependency (99 not in entry set). Audit return SHOULD surface: `warning: orphan blocker #99 in entry #105 — dropped from DAG`.

**Recovery:** orchestrator updates the shard with the correct id, drafts a new shard for #99 if it should exist, or removes the blocker if it was a typo.

### Example 3: Cycle on integration

**Existing graph:**
- #5 blockers: [#7]
- #7 blockers: [#9]

**Incoming shard:**
```yaml
---
id: 9
title: Foo
status: TODO
blockers: [#5]   # creates cycle: 5 → 7 → 9 → 5
...
---
```

**Curator action:** move shard to `.cadre/task-mx/inbox/.rejected/<ts>-<slug>.md` with prepended:
```
# REJECTED: cycle [#5 → #7 → #9 → #5] @ 2026-04-27T13:42:00Z
```
Original shard content preserved below the header.

**Return:** `{ok: false, reason: "cycle detected: #5 → #7 → #9 → #5; shard moved to .rejected/"}`. Orchestrator relays to user; user resolves the dependency conflict and re-submits.

### Example 4: Migration-mode structured diff

For each existing entry, emit:

```
## #5. Wire formatter + linter + fast-test subset into pre-commit once stack is chosen

Original prose excerpt (first 200 chars):
> Activates the moment the runtime/stack is chosen. Complements TODO #21's base framework install.

Inferred frontmatter:
  status: TODO
  priority: ?  (no signal in prose)
  due: null
  scheduled: null
  blockers: [21]   (extracted: "Complements TODO #21")
  tags: []
  project: cadre
  impact: ?
  effort: ?
  created: ?
  updated: 2026-04-27
  closed: null

Ambiguous fields (await user review): priority, impact, effort, created
```

Halt and return. User reviews the diff, accepts/edits/rejects per-entry, then re-dispatches with `mode: migration-commit`.
