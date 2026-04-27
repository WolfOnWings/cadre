# handoff-mx-cadre — references

Loaded by the synthesizer during the Step 4 self-critique pass. Not read in normal SOP flow — kept here to keep the always-loaded body lean.

## Extended anti-pattern descriptions

### Information Loss
Omitting an event whose mention would change a future session's understanding — a TODO added but not surfaced in Active Items, a calibration signal not noted in Narrative, an ADR cross-reference dropped. Handoff's purpose is enabling pickup; missed signal = next session restarts with a stale mental model. When in doubt, include — Active Items or Changes catches anything not Narrative-worthy.

### Summarizing the Summary
Producing a Narrative summary even shorter than the event aggregation already implies; over-compression that strips fidelity without adding clarity. Cadre's prior-art research surfaced this as a compounded-compression failure (each pass loses signal). Handoff is already the compressed surface; further compression at consumption time = double-loss. The active entry IS the summary; SessionStart surfaces it verbatim, no further pass.

### Per-Commit Drift
Writing per-commit details into Narrative (each git commit getting its own paragraph), or repeating commit-message content in prose. Per-commit narrative lives in commit messages; handoff is session-level (the arc, not the per-commit log). Duplication risks drift between sources of truth. Narrative captures the arc and WHY; Changes lists commits at one-line granularity, by file or topic.

### Doctrine Echo
Copying CLAUDE.md doctrine or ADR-log content directly into Narrative or Decisions. Doctrine is the authoritative source and lives in its own file; duplicating it bloats and risks drift. Cross-reference instead (e.g., "ADR-072 captures the decision; rationale in decision-log.md"). Decisions section names the ADR by number with a one-sentence summary; readers consult the log for full text.

### Archive Mutation
Any text change to the existing content of an archive file when appending a new entry to it (multi-entry same-date case). Archived entries are immutable history. The archive append is a pure POSIX O_APPEND operation — never read-then-rewrite, which would risk mutation under concurrent access (none today, but the discipline matters).

### Vague Active Items
Active Items entries like "continue work," "more research needed," "wrap up integration" — without concrete pointers. Future session can't act on vague items; defeats the section. Every Active Item names a TODO number, file path, ADR, or next-action verb.

### Tool-Call Log Replay
Narrative reads as a sequential log of tool invocations (Read, Edit, Bash, Edit, ...). Tool-call sequences are mechanism, not story. Reader needs the WHY behind the mechanism. Replay produces tedious unparseable prose. Synthesize the conversational arc — what shifted, what was learned, what got discarded. Tool calls are evidence beneath the prose, not the prose itself.

---

## Examples

### Example 1: Vague Active Items

**BAD:**
> ### Active Items
> - Continue handoff-mx work
> - More research on hooks

Problems: nothing actionable. "Continue" is not a verb the next session can execute. "More research" doesn't name what.

**GOOD:**
> ### Active Items
> - **TODO #12** — handoff-mx-cadre agent: subagent definition shipped this session; logger + surface hooks pending. Next session: draft `.claude/hooks/handoff-mx-logger-cadre.ts` per Action Plan Phase 3.
> - **Open verification** — `"type": "agent"` action ordering when SessionStart has both agent + command actions. Confirm during impl; if parallel rather than serial, fold surface logic into agent's `reason` field.

### Example 2: Tool-Call Log Replay

**BAD:**
> User asked to plan handoff-mx. Orchestrator read handoff.md. Orchestrator read todos.md. Orchestrator read CLAUDE.md. Orchestrator invoked plan-cadre. Orchestrator wrote plan file. User responded "OK." Orchestrator edited plan file. User said "shift the sketch first." Orchestrator edited plan file. ...

Problems: mechanism without arc. Reader sees what tools fired, not what the conversation was about.

**GOOD:**
> The session opened with TODO #12 as the named next-up. Plan-cadre flow ran intent → could → should → will. Initial direction was lifecycle hooks + orchestrator-side inline maintenance (no subagent). User pivoted back to subagent architecture once a logging hook + structured events log emerged as a way to give the subagent deterministic input — solving the "no subagent because re-briefing overhead" objection. Hook-semantics verification surfaced that `"type": "agent"` blocks; user re-pivoted to "Shape D — boundary-synthesizer."

### Example 3: Narrative — audience + skeleton + drop list

**Audience:** a fresh-instance orchestrator opening the next session. They need enough context to pick up without re-deriving what shifted.

**Three-bullet skeleton:**
1. **Pivots** — what direction changed, and why. (One paragraph.)
2. **Decisions** — what got committed to (ADR or doctrine refinement). (One paragraph; cross-ref the ADR by number.)
3. **Surprises / signals** — what was learned about the user's preferences, the codebase's actual state, or a tool's real behavior. (One paragraph.)

**Drop list:**
- Per-commit details (commit messages own that)
- Doctrine restatement (CLAUDE.md / ADR log own that)
- Tool-call sequences (mechanism, not arc)
- Self-narration ("I read X, then I read Y") — replace with what was learned
