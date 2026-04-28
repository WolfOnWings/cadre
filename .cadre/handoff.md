## 2026-04-28 — frontmatter shard fill-in complete; CI task pivot pending

### Narrative

The session opened with the standard handoff-mx integration pass, consuming prior-session events. The user asked to see the todo board, which surfaced the outstanding open item: 25 active TODO entries carried explicit-null `priority`/`impact`/`effort`/`created` fields from the migration heuristic, making scoring fictional. The orchestrator ran a plan to close this gap: a one-off Bun script (`shard-fillin.ts`) read the live board, applied best-guess estimates per entry, and emitted 24 inbox shards (TODO #29 was already DEFERRED, so excluded). The user approved all estimates at once ("yes on all. best guess"). The shards were written to `.cadre/task-mx/inbox/`, then `task-mx-cadre` integrated all 24 via `score.ts --integrate`, regenerated the board's ranked Index, and confirmed inbox clear. The frontmatter fill-in item is resolved; scoring is now grounded in real axis values.

At session close, the user pivoted toward CI work ("no. let's work on the CI task. What's the story behind it"), but the session ended before any CI work began. TODO #22 (Base CI workflow) is the named next-up for the following session.

No architectural decisions or ADR entries this session. The board-curator pattern (ADR-074) held without modification; the fill-in run was pure data enrichment, not a structural change.

### Decisions

- No new ADRs. The frontmatter fill-in is an operational data-quality pass, not an architectural decision. ADR-074's single-writer / inbox-shard discipline governed the mechanics.

### Active Items

- **TODO #22 — Base CI workflow** — user-directed next-up at session close; no work started yet. Next session: surface the current CI task entry and plan implementation.
- **TODO #14 — Three-review architecture detail** — untouched; awaits CI + stranger-swarm + risk-detection layers; naturally unblocked once TODO #22 lands.
- **TODO #27 — taskboard-mx agent superseded** — still open; needs verification and close/relabel.
- **TODO #30 — Break out CLAUDE.md into `.claude/` primitives** — not started.
- **TODO #31 — events-log filtering / sampling** — logger filters in place; monitor synthesis time across sessions; revisit if past 3 minutes.
- **TODO #61 / ADR-061 — researcher-cadre format migration** (skill → agent) — untouched.
- **Open: task-mx-cadre prime hook** — prime hook (session-start board injection) deferred per ADR-074; unbuilt.
- **Signal: subagent stall pattern** — general-purpose subagent stalled at 50+ tool calls in prior session on a mechanical shard task. Worth noting: this session's fill-in used the orchestrator-direct path (shard generation + `task-mx-cadre` integration subagent) without incident. Consider formalizing "orchestrator generates shards; task-mx-cadre integrates" as the canonical path for bulk board mutations.

### Changes

- `.cadre/task-mx/logs/shard-fillin.ts` — one-off Bun script created; reads todos.md entries, applies frontmatter best-guess overrides, emits 24 shards to inbox
- `.cadre/task-mx/inbox/` — 24 frontmatter-fill shards generated and subsequently consumed (inbox empty on session close)
- `.cadre/todos.md` — all 24 active TODOs updated with real priority/impact/effort/created values; board Index regenerated
- `.cadre/task-mx/archive/2026-04.md` — no new entries (no TODOs closed this session)
- `.cadre/handoffs/2026-04-27.md` — prior session entry appended (same-day multi-entry)
- `.cadre/handoff.md` — replaced with this entry
