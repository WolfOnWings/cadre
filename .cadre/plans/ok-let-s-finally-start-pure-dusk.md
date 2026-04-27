# Plan: handoff-mx-cadre agent

## Intent

Per TODO #12 (confirmed 2026-04-26):

- Runs fully autonomous in the background — user never prompts it. No "update the handoff" or "read the handoff" requests should ever be needed.
- **Live mutation during session** — entry updated continuously as in-session actions occur, not just at session end.
- **Session-end stamp** — the live entry is sealed into the final record at session end.
- **Session-start surfacing** — relevant prior handoff content surfaces into new sessions automatically.
- **Lifecycle/archive** — aging handled; archive, don't delete.
- Handoff is **session-level**. Per-commit narrative belongs in commit messages (via commit-review gate).

Context: PR #4's architectural simplification (tracked `.cadre/`, CC-native worktrees) shrinks the implementation space substantially — handoff is now just a tracked file editable via standard tools, no sync hook or playbook needed.

## Could

- **A. Pure-hook driven (no agent).** Lifecycle hooks (SessionStart / Stop / SessionEnd) trigger; deterministic capture; no judgment in the loop.
- **B. Hooks dispatch a subagent for content.** Hooks trigger; subagent reads context and judges what to capture; writes to handoff.
- **C. Skill primes orchestrator + Stop hook seals.** Skill auto-loads at session start, primes inline-maintenance posture; orchestrator updates as it works; Stop hook checkpoints.
- **A-refined (chosen direction in Should):** lifecycle hooks for triggers + orchestrator does synthesis inline as part of its normal turn. Synthesis happens orchestrator-side; the orchestrator's session context is the asset, no clean-context briefing problem.

## Should

**Direction: A-refined.** Lifecycle hooks (SessionStart for surfacing prior handoff; Stop hook checkpoints what orchestrator wrote each turn; SessionEnd hook seals/finalizes) + CLAUDE.md instruction telling orchestrator to maintain handoff inline. No subagent dispatch.

Rationale:
- Synthesis is the load-bearing piece, not triggers. Hooks are blunt for "what's worth capturing"; orchestrator with full session context judges this naturally.
- Subagent dispatch would require re-briefing the agent with context the orchestrator already has — pure overhead.
- Cleaner: fewer moving parts, no agent file, no inter-agent contract.

## Parked

- **B (subagent for content).** Steel-man: clean context forces explicit state handoff, surfacing what's actually load-bearing — subagent can't smuggle in tacit context, so handoff entries become self-contained. Re-promote if: orchestrator-side discipline fails, or if context-window cost of inline maintenance exceeds the re-briefing cost.
- **C (skill priming).** Steel-man: explicit "you are in handoff-maintenance posture" framing might help orchestrator stay disciplined under context pressure mid-long-session. Re-promote if: CLAUDE.md instruction proves insufficient as a behavioral anchor.

Last Responsible Moment check: narrowing is evidence-based (orchestrator-side synthesis is structurally simpler given session-context advantage), not time-pressure. The path doesn't preclude adding a subagent later if the discipline fails.

## Will

**(REVISED 2026-04-26 — Shape D: boundary-synthesizer architecture. Supersedes prior Wills.)**

Build handoff-mx-cadre as **logger + boundary-triggered synthesizer subagent**. The logger captures everything; the subagent synthesizes at every boundary. No mid-session blocks, no threshold tuning, no concurrency.

- **Logger hook** (`"type": "command"`, fast, registered on UserPromptSubmit / PostToolUse / Stop): appends a structured event entry to `.cadre/session-events.log`. No threshold check. No dispatch.

- **SessionStart hook** (matchers: `startup`, `resume`, `clear`, `compact`) — two actions:
  - **Action 1** (`"type": "agent"`): synthesizer subagent. Reads `.cadre/session-events.log` + `.cadre/handoff.md`. If events log non-empty: synthesizes a handoff entry from accumulated events (the four-section structure), appends as the new active entry to `.cadre/handoff.md` (sealing the prior active), clears `.cadre/session-events.log`. Idempotent on empty log (no-op). Blocks briefly — acceptable at session-start (already a context-reset moment).
  - **Action 2** (`"type": "command"`): surface hook. Reads `.cadre/handoff.md` and returns most recent entry **verbatim** via `additionalContext`.

- **SessionEnd hook** (`"type": "agent"`, all matchers): same synthesizer subagent. Drains the events log so no events are lost if no next session occurs. Idempotent.

**No information loss** — every event captured in log, integrated at next boundary. **No mid-session pauses** — orchestrator never blocked except briefly at boundaries. **Aligned with autonomous intent** — user does literally nothing. **Compact-handling default:** each SessionStart fire (including `compact`) seals a new entry from accumulated events; long sessions that compact will produce multiple entries (each compact = a natural segmentation point).

**Handoff doc structure** (defined contract — four sections, fixed):
- **Narrative** — prose story of the session (whatever length is required, ≤ 200 lines)
- **Decisions** — ADRs added with rationale
- **Active Items** — hot todos / work
- **Changes** — pointers to files touched or things created since last session, one-line summary each

**Subagent contract location.** `.claude/agents/handoff-mx-cadre.md` holds the full role / vocabulary / anti-patterns / SOP / I-O-contract. Hook config inline prompt is thin: "Read `.claude/agents/handoff-mx-cadre.md` for your contract; execute the integration against current state." Indirection earns the Cadre primitive convention (-cadre suffix, declared file footprint) even though hook agents are dispatched by inline prompt rather than by-name reference.

Hook scripts at `.claude/hooks/handoff-mx-*-cadre.ts` (TS-on-Bun, ADR-050); subagent at `.claude/agents/handoff-mx-cadre.md`. Operational-metadata exception (ADR-071) applies to handoff edits.

---

*Prior Wills preserved in git history. Evolution: (1) lifecycle hooks + orchestrator-side inline maintenance, no subagent; (2) subagent + threshold-triggered with mtime check; (3) subagent + threshold-triggered with events-log queue; (4) **Shape D — boundary-synthesizer (current)**. Each refinement responded to a constraint surfaced by verification or user calibration. Shape D resolves the `"type": "agent"` blocking constraint by integrating only at boundaries (where blocking is acceptable) while preserving the no-information-loss property via the always-running logger.*

## Brooks Reflection

**Stop hook is the discipline anchor (collapses concerns 1 + 2).** User refined: Stop hook fires a simple "Update the handoff" reminder every turn — engram-class anchor in lightweight form. Eliminates the hard dependency on TODO #15 (full engram revival); upgradeable to richer YAML engrams when #15 ships. So Stop is not redundant — it carries the discipline that CLAUDE.md alone would lose under context pressure.

**Prior-art scan dispatched** (researcher subagent, background): spaced-repetition session loops, LSP lifecycle event semantics, memex-class state patterns, agent-system handoffs (LangGraph / CrewAI / AutoGen), OS session mechanisms (tmux / hibernation), IDE workspace restoration. Output: `.cadre/research/2026-04-26-handoff-mx-prior-art.md`.

**Hook/skill creation investigation** (creator-cadre invoked): verify CC native lifecycle hook event semantics, JSON output format for context injection, settings.json registration. Architect phase locks in exact wiring.

Architect-phase open items (gated on research + creator-cadre findings):
- Hook script structure (one file vs three; orchestrator function vs separate handlers)
- SessionStart context-injection mechanism (stdout? specific JSON envelope?)
- Archive trigger logic (size? date? entry count?)
- Stop hook reminder phrasing — minimal "Update the handoff" or richer prompt
- Exact CLAUDE.md doctrine wording for inline-maintenance posture
- Hook scripts location: single `.claude/hooks/handoff-mx-cadre.ts` vs split per event

## Architect-Phase Findings — Hook Semantics (verified via claude-code-guide)

**SessionStart** ✅ fits surfacing requirement.
- Fires on: `startup`, `resume`, `clear`, `compact`
- Output: JSON with `hookSpecificOutput.additionalContext` field — this is the context-injection mechanism for surfacing prior handoff. Multiple SessionStart hooks concatenate; stdout also injected.

**Stop** ❌ wrong mechanism for engram-class reminder.
- Fires after each Claude turn (correct cadence for "live mutation").
- **No `additionalContext` injection.** Only output: `decision: "block"` with `reason` — prevents the turn from ending. Too heavy for a gentle reminder; would interrupt natural conversational flow.

**UserPromptSubmit** ✅ correct mechanism for the discipline anchor (architectural correction).
- Fires before Claude processes user input — once per turn.
- Same `additionalContext` injection as SessionStart.
- This is the right hook for "Update the handoff" pre-turn reminder. The user's *intent* (Stop = engram-class anchor) was correct; the *mechanism* (Stop) was wrong.

**SessionEnd** ✅ fits seal+archive requirement.
- Fires on session termination (`clear`, `resume`, `logout`, `prompt_input_exit`, `bypass_permissions_disabled`, `other`).
- Observational only — no decision control, exit codes ignored. No context injection (session ending).
- Hook types limited to `command` and `mcp_tool` (no `agent`/`prompt`/`http` here).

**Settings.json structure (verified):**
```
hooks.<EventName>[].matcher        regex/exact string on event source/reason
hooks.<EventName>[].hooks[].type   command | agent | prompt | http | mcp_tool
hooks.<EventName>[].hooks[].command  shell command or path
```

**Cadre conventions (from `.cadre/references/creating-hooks.md`):**
- TS-on-Bun default for non-trivial scripts (Bun ships with CC; ~5-15ms cold start; type safety; cross-platform).
- Naming: concise, glanceable.
- Script header: shebang + Cadre comment block (name / triggers / side effects / failure mode).
- Logging: `.cadre/logs/hooks/<name>.log`.
- Always verify hook event names against live docs (kata v1 hallucinated `OnFileSave`, `BeforeCommit`, etc. — costly).

**Implied Will refinement:**
- SessionStart + **UserPromptSubmit** + SessionEnd (Stop dropped — wrong mechanism for the user's intent).
- The "simple reminder every turn" anchor is preserved; only the hook event name is corrected.
- ✅ User confirmed via AskUserQuestion (2026-04-26).

## Research Findings — Prior Art (researcher subagent, 2026-04-26)

Full brief at `C:\Users\duham\.claude\plans\ok-let-s-finally-start-pure-dusk-agent-ac5907b269a2681e3.md` (plan-mode forced atypical location; relocate to `.cadre/research/2026-04-26-handoff-mx-prior-art.md` post-ExitPlanMode).

**Patterns surveyed (per-pattern decisions noted; not adopted wholesale — see post-survey reconsideration below):**
- **Bury before suspend before delete** (Anki) — staged archival; aged entries drop from active surfacing first, then move to archive subdir; never delete. *Decision: simplify to 2-stage (active vs. archived to `.cadre/handoffs/<ISO-date>.md`); the suspend middle-stage isn't load-bearing at our scale.*
- **Progressive disclosure** (Anthropic Skills) — thin always-loaded summary at SessionStart; full body on demand. *❌ REJECTED 2026-04-26 — would summarize an already-summarized handoff (failure step). SessionStart injects the most recent entry verbatim instead; the entry is already bounded.*
- **Recency decay + consolidation** (CrewAI) — merge near-duplicates, don't stack. *Decision: subagent does this implicitly when integrating events into the active entry; doesn't need separate doctrine.*
- **Daily-notes pattern** (Roam / Logseq / Obsidian) — date-based archive filenames. *Decision: already aligned with Cadre convention (`<ISO-date>.md`); no change.*
- **LSP two-phase shutdown** — per-turn heartbeat + seal-then-terminate. *Decision: descriptive only — already reflected in SessionEnd architecture.*

**Anti-patterns:**
- ❌ Auto-truncation under context pressure (OpenAI threads model) — silent state loss; archive instead.
- ❌ Workstation-state storage (IntelliJ workspace.xml is gitignored, user-specific) — handoff is **team-shareable** session-level operational state, parallel to release notes; stays tracked.

**What belongs in handoff:** session intent, decisions + rationale, blockers, open trees, pointers.
**What doesn't:** per-commit narrative (commit messages), conversation transcript, reusable doctrine (CLAUDE.md, ADR log).

## Action Plan (sketch — revised 2026-04-26 to subagent architecture)

### Phase 1: Doctrine + Schema
- CLAUDE.md entry on handoff maintenance — purpose, the four-section structure, what belongs vs. doesn't (per research findings), how to read the active handoff
- Defined handoff-doc structure (already locked in Will): **Narrative** / **Decisions** / **Active Items** / **Changes**

### Phase 2: Logging hooks (`.claude/hooks/handoff-mx-logger-cadre.ts` — single shared script, multiple event registrations)
- Fires on UserPromptSubmit, PostToolUse, Stop (verify event scope in architect detail)
- Appends a structured entry to `.cadre/session-events.log` (newline-delimited JSON or similar)
- After append, checks integration queue size; if > threshold, backgrounds handoff-mx-cadre subagent (`"type": "agent"` hook config per ADR-049, OR shell-level dispatch — verify)

### Phase 3: handoff-mx-cadre subagent (`.claude/agents/handoff-mx-cadre.md`)
- Mode: subagent (per ADR-046 — fire-once dispatch)
- Input contract: read `.cadre/handoff.md` + `.cadre/session-events.log`
- Output contract: rewrite `.cadre/handoff.md` with new events integrated into the four sections (Narrative / Decisions / Active Items / Changes); leave events log untouched (logger or SessionEnd handles clearing)
- Idempotent — running twice on the same input yields the same output

### Phase 4: SessionStart hook (`handoff-mx-start-cadre.ts`)
- Read `.cadre/handoff.md`, return progressive-disclosure summary of most recent entry via `additionalContext`
- Matchers: `startup`, `resume`, `clear`, `compact`

### Phase 5: SessionEnd hook (`handoff-mx-end-cadre.ts`)
- Final integration pass: dispatch handoff-mx-cadre to drain remaining events
- Clear `.cadre/session-events.log`
- Matcher: all reasons

### Phase 6: Settings registration
- Hooks registered in `.claude/settings.json`; subagent auto-discoverable in `.claude/agents/`

### Phase 7: Logging
- `.cadre/logs/hooks/handoff-mx-{logger,start,end}.log` per Cadre convention

### Phase 8: Validate + bootstrap
- Manual: trigger threshold mid-test-session; observe subagent fire + handoff mutation; verify integration is incremental, not destructive
- Bootstrap proof: inline THIS planning session as the first dogfooded entry (or let the new subagent process THIS session's events log on first run)
- Log files record each fire

### Phase 9: Capture + ship
- ADR-072 (or next number) in decision log capturing the subagent architecture + the loop-back reasoning
- Branch + PR (doctrine + behavior change — ADR-071 exception does NOT apply)

### Open for crystal-clarity iteration *(historical — most items locked in the Action Plan below)*
- ~~Integration threshold~~ → **time-based, 5 min default** (locked)
- Logging hook event scope, events log entry format, subagent dispatch mechanism, mutation strategy, SessionStart summary contents, crash recovery — all consolidated with defaults in the Action Plan section below

## Action Plan (revised to Shape D)

### File deliverables
- `.claude/agents/handoff-mx-cadre.md` — subagent contract (synthesizer role, four-section output, I/O contract)
- `.claude/hooks/handoff-mx-logger-cadre.ts` — logger hook script (one shared script, registered on three events)
- `.claude/hooks/handoff-mx-surface-cadre.ts` — SessionStart Action-2 surface script (returns `additionalContext`)
- `.claude/settings.json` — registrations: logger × 3 events, SessionStart with two actions (agent + surface command), SessionEnd agent
- ~~`CLAUDE.md` doctrine entry~~ — DROPPED 2026-04-26: orchestrator doesn't need to know about handoff mechanics. Synthesis is hand-crafted and delivered by the synthesizer subagent; orchestrator just reads the entry surfaced via `additionalContext` at SessionStart. No discipline required of the orchestrator → no doctrine entry needed.
- `.cadre/handoff.md` — one-time schema migration to four-section structure (existing entries reformatted; no information loss)
- `.cadre/session-events.log` — empty file at first, gitignored (or tracked? — open: see below)
- `.cadre/logs/ADR/decision-log.md` — ADR-072 capturing Shape D + Brooks-class evolution path

### Architecture summary (Shape D)
- Logger hook (command, fast): UserPromptSubmit / PostToolUse / Stop → append event JSON to `.cadre/session-events.log`. No threshold, no dispatch.
- SessionStart hook (matchers: startup / resume / clear / compact) — two actions:
  - Action 1 (agent, blocks): synthesizer reads events log + handoff; if events log non-empty, archives any existing entry in `.cadre/handoff.md` to `.cadre/handoffs/<entry-date>.md`, writes the new four-section entry as sole content of `.cadre/handoff.md`, clears events log.
  - Action 2 (command, fast): reads `.cadre/handoff.md` (now contains the new entry as sole content) and returns it verbatim via `hookSpecificOutput.additionalContext`.
- SessionEnd hook (agent): same synthesizer call as Action 1. Drain on session close.

### Defaults (locked unless flagged)
- **Logging event scope:** `UserPromptSubmit`, `PostToolUse`, `Stop` (covers user input, orch tool actions, orch responses). PreToolUse / Notification / agent-completion explicitly NOT logged in v1 to keep noise low.
- **Events log format:** newline-delimited JSON (`.cadre/session-events.log`). Fields per entry: `{ts, event, matcher?, summary, payload?}`. `summary` ≤ 200 chars; `payload` only when full data is ≤ 1KB and high-value.
- **Synthesizer dispatch:** `"type": "agent"` with inline prompt: "Read `.claude/agents/handoff-mx-cadre.md` for your full contract; execute its synthesis SOP against `.cadre/session-events.log` and `.cadre/handoff.md`. Return ok: true on success." Subagent's contract file holds the actual SOP.
- **Surface mechanism:** `"type": "command"` Bun script returns `{"hookSpecificOutput": {"hookEventName": "SessionStart", "additionalContext": "<latest entry verbatim>"}}` to stdout.
- **Handoff layout (per existing project convention):** `.cadre/handoff.md` holds exactly ONE entry — the most current. ALL prior entries live in `.cadre/handoffs/<ISO-date>.md`.
- **Archival policy:** on each integration, every entry currently in `.cadre/handoff.md` is moved to `.cadre/handoffs/<entry-date>.md` (append to that date's file if it exists; create otherwise). Then `.cadre/handoff.md` is rewritten with the new entry as sole content. Archive files are append-only / immutable.
- **Events-log consume mechanism:** rename-based atomic — `.cadre/session-events.log` is renamed to `.cadre/session-events.log.processing-<ts>` at the start of integration; new events accumulate in a freshly-created log; the `.processing-<ts>` file is deleted on success, or remains in place for crash-recovery reprocessing on failure. No lockfile needed (boundary-triggered = never concurrent).
- **Compact handling:** identical to startup/resume — each compact-fire seals a new entry from accumulated events. Long sessions that compact = multiple handoff entries, naturally segmented.
- **Concurrency:** no concurrency by design — boundary-triggered, never concurrent. Safety-net: synthesizer takes `.cadre/.handoff-mx.lock` before mutating; releases on completion. Second invocation no-ops if lock held (defensive only).
- **Logging:** each hook writes to `.cadre/logs/hooks/handoff-mx-{logger,surface,synthesizer}.log`.

### Execution order
1. **Doctrine first** — CLAUDE.md "Handoff maintenance" entry. Defines the contract every other piece implements.
2. **Subagent contract** — `.claude/agents/handoff-mx-cadre.md` via creator-cadre flow. I/O contract: reads `.cadre/session-events.log` + `.cadre/handoff.md` + `CLAUDE.md`; writes `.cadre/handoff.md` (atomic) + truncates `.cadre/session-events.log`.
3. **Logger hook** — `.claude/hooks/handoff-mx-logger-cadre.ts`. Reads stdin JSON, extracts fields per event type, appends to events log, exits 0.
4. **Surface hook** — `.claude/hooks/handoff-mx-surface-cadre.ts`. Reads handoff, finds most recent entry, returns `additionalContext` JSON.
5. **Settings registration** — wire all hooks in `.claude/settings.json`. SessionStart matchers: `startup|resume|clear|compact`. SessionEnd matchers: `*`. Logger registered on UserPromptSubmit / PostToolUse / Stop.
6. **`.gitignore` update** — add `.cadre/session-events.log` and `.cadre/session-events.log.processing-*` (transient operational state).
7. **Bootstrap proof** — manually invoke synthesizer on a hand-crafted events log; verify the four-section output, archival to `.cadre/handoffs/<date>.md`, and the events-log consume/delete cycle.
8. **Live-fire test** — fresh session: SessionStart's two-action sequence (synthesizer agent then surface command); send messages (logger captures); end session (SessionEnd drains). Existing `.cadre/handoff.md` entries (currently free-form prose) get archived as-is on the first synthesizer run; four-section structure takes effect from the new entry forward — no separate migration needed.
9. **ADR-072 + branch+PR** — ADR captures Shape D and the architectural evolution path (lifecycle hooks → threshold-triggered → boundary-synthesizer). PR ships everything together. ADR-071 operational-metadata exception does NOT apply (this is doctrine + behavior).

### Verification
- ✅ Hook event names — verified live via claude-code-guide
- ✅ Settings.json registration syntax — verified
- ✅ Multiple hooks per matcher — supported (per docs)
- ✅ `"type": "agent"` exists, blocks synchronously, returns ok/reason
- 🔍 To verify in implementation: action ordering when SessionStart has both agent + command actions (does agent fire first as written in array?); subagent's ability to read its own contract file (`.claude/agents/handoff-mx-cadre.md`) and execute against state

### Risks / open in implementation
- **Action ordering at SessionStart (CRITICAL — verify before shipping):** synthesizer (Action 1, agent) MUST complete before surface (Action 2, command) reads `.cadre/handoff.md`, otherwise surface injects stale content and orchestrator boots with the prior session's handoff instead of the freshly-synthesized one. Per CC docs, `"type": "agent"` blocks synchronously, and multiple hooks per matcher fire in array order — but the docs don't deeply confirm serial-execution semantics for mixed types within the same hook array. Verification step in impl: write a test that proves the order; if parallel rather than serial, fall back to combining the two into a single agent hook that performs synthesis AND embeds the latest entry into its `reason` field (worse — `reason` is for user-facing decision text, not `additionalContext` injection — but the existence-check ordering is preserved).
- **Schema migration:** existing handoff entries don't follow the four-section structure. One-time migration — by hand or LLM-assisted — must preserve all information. Verify against current entries before shipping.
- **Token cost:** synthesizer fires at every SessionStart (incl. compact) + SessionEnd. For sessions with many compacts, cost adds up. Mitigation: instrument; tune by adjusting which matchers trigger synthesis (e.g., skip `compact` if cost is high).
- **Events log persistence:** open question — should `.cadre/session-events.log` be tracked or gitignored? It's transient (cleared after each integration) but if a session crashes mid-flow, the unintegrated log is the only record. Tracked = safety; gitignored = reduces git noise. Default: gitignored, with periodic snapshot if crash recovery becomes a concern.

## Subagent Draft — `.claude/agents/handoff-mx-cadre.md`

*(Drafted via creator-cadre flow; verified live agent syntax — no `mode` frontmatter field, so mode declared as body marker.)*

```
---
name: handoff-mx-cadre
description: Synthesizer subagent that compresses accumulated session events from `.cadre/session-events.log` into a four-section handoff entry in `.cadre/handoff.md` at session boundaries. Use when SessionStart (startup/resume/clear/compact) or SessionEnd fires AND the events log has unintegrated entries. Idempotent on empty log. Do NOT use for per-commit narrative (commit messages own that), doctrine changes (CLAUDE.md / ADR log), or orchestrator-side handoff edits.
tools: Read, Edit, Write, Bash, Glob, Grep
model: inherit
---

**Mode:** subagent

## Role Identity

You are a session-handoff synthesizer responsible for compressing accumulated session events into a structured four-section handoff entry within the Cadre orchestrator/worker runtime. You report to the Orchestrator and collaborate with the lifecycle hooks that produce your input.

## Domain Vocabulary

**Synthesis & Compression:** narrative compression, event aggregation, signal-vs-noise filtering, semantic deduplication, recency weighting, level-of-resolution discipline (Mandelbrot scale-invariance via CLAUDE.md)

**Session Lifecycle:** session boundary, lifecycle hook (SessionStart / SessionEnd), session-events log, integration pass, atomic write, idempotency, lockfile contention

**Handoff Structure:** four-section template (Narrative / Decisions / Active Items / Changes), active entry, sealed entry, entry chronology (most-recent-first), header line (ISO date + ≤8-word descriptor)

**Decision Capture:** ADR cross-reference (decision-log.md), rationale provenance, ADR-vs-commit-log boundary, decision-as-artifact (Meyer's Design by Contract)

**Information Hygiene:** information loss vs information bloat, summarizing-the-summary anti-pattern, per-commit-narrative-drift, sealed-entry immutability

## Anti-Pattern Watchlist

### Information Loss
- **Detection:** Omitting an event whose mention would change a future session's understanding — a TODO added but not surfaced in Active Items, a calibration signal not noted in Narrative, an ADR cross-reference dropped.
- **Why it fails:** Handoff's purpose is enabling pickup; missed signal = next session restarts with a stale mental model.
- **Resolution:** When in doubt, include. Active Items or Changes catches anything not Narrative-worthy. The 200-line Narrative cap is a budget, not a target.

### Summarizing the Summary
- **Detection:** Producing a Narrative summary even shorter than the event aggregation already implies; over-compression that strips fidelity without adding clarity.
- **Why it fails:** Cadre's prior-art research surfaced this as a compounded-compression failure (each pass loses signal). Handoff is already the compressed surface; further compression at consumption time = double-loss.
- **Resolution:** Use the 200-line Narrative budget when the session warrants it. The active entry IS the summary; SessionStart surfaces it verbatim, no further pass.

### Per-Commit Drift
- **Detection:** Writing per-commit details into Narrative (each git commit getting its own paragraph), or repeating commit-message content in prose.
- **Why it fails:** Per-commit narrative lives in commit messages; handoff is session-level (the arc, not the per-commit log). Duplication risks drift between sources of truth.
- **Resolution:** Narrative captures the arc and WHY. Changes lists commits at one-line granularity, by file or topic. Cross-reference commit hashes in Changes when useful.

### Doctrine Echo
- **Detection:** Copying CLAUDE.md doctrine or ADR-log content directly into Narrative or Decisions.
- **Why it fails:** Doctrine is the authoritative source and lives in its own file; duplicating it bloats and risks drift.
- **Resolution:** Cross-reference (e.g., "ADR-072 captures the decision; rationale in decision-log.md"). Decisions section names the ADR by number with a one-sentence summary; readers consult the log for full text.

### Archive Mutation
- **Detection:** Any text change to the existing content of an archive file when appending a new entry to it (multi-entry same-date case).
- **Why it fails:** Archived entries are immutable history. Mutation breaks the chain and audit trail across `.cadre/handoffs/`.
- **Resolution:** Append-only writes to existing archive files. Read existing archive content, append new entry text after a `---` separator. Byte-compare the pre-existing portion before flushing — must be unchanged.

### Vague Active Items
- **Detection:** Active Items entries like "continue work," "more research needed," "wrap up integration" — without concrete pointers.
- **Why it fails:** Future session can't act on vague items; defeats the section.
- **Resolution:** Every Active Item names a TODO number, file path, ADR, or next-action verb. Format: `- TODO #12 — handoff-mx-cadre agent: subagent shipped; logger + surface hooks pending. Next: draft `.claude/hooks/handoff-mx-logger-cadre.ts` per Action Plan Phase 3.`

### Tool-Call Log Replay
- **Detection:** Narrative reads as a sequential log of tool invocations (Read, Edit, Bash, Edit, ...).
- **Why it fails:** Tool-call sequences are mechanism, not story. Reader needs the WHY behind the mechanism. Replay produces tedious unparseable prose.
- **Resolution:** Synthesize the conversational arc — what shifted, what was learned, what got discarded. Tool calls are evidence beneath the prose, not the prose itself.

## Behavioral Instructions

### Step 1: Crash recovery + empty-log check + atomic consume

Check for any leftover `.cadre/session-events.log.processing-*` files (crash recovery — a prior run died mid-flow).
IF a `.processing-*` file exists: this is the events to process; SKIP the consume step (use the existing file as-is) and proceed to Step 2.
ELSE IF `.cadre/session-events.log` is empty (0 bytes) or doesn't exist: no work; return `{ok: true, reason: "no events to integrate"}`.
ELSE (events log has content, no leftover .processing-*): rename `.cadre/session-events.log` → `.cadre/session-events.log.processing-<ISO-timestamp>` atomically. Logger writes after this point go to a freshly-created `session-events.log` (append-mode auto-creates the file).

OUTPUT: a single `.processing-<ts>` file ready to consume, OR early return.

### Step 2: Read inputs

Read `.cadre/session-events.log.processing-<ts>` (events to synthesize, newline-delimited JSON).
Read `.cadre/handoff.md` (current state, including all sealed entries).
Read `CLAUDE.md` (project doctrine, for orientation on what's load-bearing).
OPTIONAL: Read `.cadre/logs/ADR/decision-log.md` if events reference ADR additions (for rationale lookup).

OUTPUT: in-memory inputs.

### Step 3: Aggregate events into a timeline

Parse each event entry. Group by event type (UserPromptSubmit / PostToolUse / Stop). Cross-reference timestamps to reconstruct the conversational arc — chronological flow of user input → orchestrator action → orchestrator response → user input.

OUTPUT: aggregated event groups + timeline.

### Step 4: Synthesize Narrative section

Write the prose story of the session. Cover: what the user wanted (intent); the arc (what shifted, what got discarded, what surprised); user signals worth carrying forward (calibration moments, doctrine seeds); WHY decisions were made.

Length: up to 200 lines. Voice: third-person past tense.
IF story exceeds 200 lines: prioritize ruthlessly — keep pivots, decisions, calibrations, surprises; drop routine tool-use unless load-bearing.

OUTPUT: Narrative prose.

### Step 5: Synthesize Decisions, Active Items, Changes

**Decisions** — for each formal decision (ADR added, doctrine refinement, architectural shift): cite ADR number, one-sentence summary, one-to-two-sentence rationale.

**Active Items** — TODOs added/changed, in-progress work, blockers, open trees. Every item names a TODO number, file, ADR, or specific next-action verb.

**Changes** — files touched/created. One line per file: `path — what changed in one phrase`. Group by category (doctrine / hooks / agents / etc.) if many.

OUTPUT: three bulleted lists.

### Step 6: Construct entry header

Generate `## <ISO date> — <≤8-word descriptor>`. Descriptor reflects the session's central thread.
Example: `## 2026-04-26 — handoff-mx-cadre subagent designed and shipped`

OUTPUT: header line.

### Step 7: Archive all existing entries

Read existing `.cadre/handoff.md`. Parse into entries by splitting on `## YYYY-MM-DD` headers.
For EACH existing entry:
- Extract its date from the header.
- Archive path: `.cadre/handoffs/<YYYY-MM-DD>.md`.
- IF archive file exists for that date (rare — multi-entry same day, or crash-recovery replay): append the entry text after a `---` separator. Byte-compare the pre-existing portion of the archive file before flushing — must be unchanged.
- ELSE: write a new archive file with the entry as its sole content.

IF any archive write fails: leave `.processing-<ts>` file untouched (retry on next run), return `{ok: false, reason: "archive write failed: <path>"}`.

OUTPUT: every prior handoff entry persisted under `.cadre/handoffs/`; existing `.cadre/handoff.md` content released for replacement.

### Step 8: Atomically write new handoff.md

Compose new handoff content: just the new entry (header + four sections — no `---` trailer needed since `.cadre/handoff.md` now holds exactly one entry).
Write to `.cadre/handoff.md.tmp`.
Rename `.tmp` → `.cadre/handoff.md` (atomic).

OUTPUT: updated `.cadre/handoff.md` = the new entry, sole content.

### Step 9: Delete consumed events file + return

Remove `.cadre/session-events.log.processing-<ts>` — events fully integrated; no risk of duplicate processing on next run.

OUTPUT: `{ok: true, reason: "integrated <N> events; archived <M> prior entries; new entry: '<header descriptor>'"}`.

## Output Format

Return value (passed back to the dispatching hook):
`{"ok": true, "reason": "integrated <N> events; archived <0|1> entry; new entry: '<descriptor>'"}`

Side-effects on disk:
- `.cadre/handoff.md` — REPLACED with the new entry as sole content (no other entries retained at root)
- `.cadre/handoffs/<ISO-date>.md` — every prior entry archived (one per session date; multi-entry days append within the same date file)
- `.cadre/session-events.log.processing-<ts>` — created (consume), then deleted (completion)
- `.cadre/session-events.log` — fresh empty file (logger creates on next event)

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
> The session opened with TODO #12 as the named next-up. Plan-cadre flow ran intent → could → should → will. Initial direction was lifecycle hooks + orchestrator-side inline maintenance (no subagent). User pivoted back to subagent architecture once a logging hook + structured events log emerged as a way to give the subagent deterministic input — solving the "no subagent because re-briefing overhead" objection. Hook-semantics verification surfaced that `"type": "agent"` blocks; user re-pivoted to "Shape D — boundary-synthesizer." User caught two further refinements: progressive-disclosure summarization is a failure step (already-summarized handoff doesn't need re-summarizing); CLAUDE.md doctrine entry is unnecessary (orchestrator never reads/writes handoff directly).

## Decision Authority

**Autonomous:**
- Aggregating events into prose narrative
- Choosing what's load-bearing vs noise
- Section assignment for each event
- Header descriptor wording (≤8 words)
- Word/line allocation across sections within 200-line Narrative budget

**Out of scope (refuse with `{ok: false, reason: "out of scope: ..."}`):**
- Per-commit narrative (lives in commit messages)
- Conversation transcripts (raw events; not suitable for prose handoff)
- Reusable doctrine (CLAUDE.md, ADR log)
- Mutating sealed entries
- Editing files outside the file footprint

**File Footprint:**
- **Reads:** `.cadre/session-events.log.processing-<ts>` (renamed events log), `.cadre/handoff.md`, `CLAUDE.md`, `.cadre/logs/ADR/decision-log.md` (optional)
- **Writes:** `.cadre/handoff.md` (atomic prepend, sealed entries verbatim), `.cadre/handoffs/<ISO-date>.md` (on archive)
- **Renames / Deletes:** `.cadre/session-events.log` → `.cadre/session-events.log.processing-<ts>` (atomic consume); `.cadre/session-events.log.processing-<ts>` deleted on completion
- Anything outside this footprint is a bug.

## Interaction Model

**Receives from:**
- Logger hook → events written to `.cadre/session-events.log` (input is the file, not a message)
- SessionStart / SessionEnd hook → invocation trigger via inline prompt: "Read `.claude/agents/handoff-mx-cadre.md` for your contract; execute against current state."

**Delivers to:**
- Orchestrator (next session) → updated `.cadre/handoff.md` (read by surface hook at SessionStart)
- Filesystem → truncated events log
- Dispatching hook → `{ok, reason}` JSON return value

**Handoff format:** Markdown four-section entry prepended to `.cadre/handoff.md`. Events log truncated.

**Coordination:** Synchronous within hook dispatch (`"type": "agent"` blocks until completion). No mid-task communication with peers or orchestrator.
```

## Hook Script Draft — `.claude/hooks/handoff-mx-logger-cadre.ts`

Single shared script registered under three events (UserPromptSubmit / PostToolUse / Stop). Reads stdin JSON payload, extracts event-relevant fields, appends a newline-delimited JSON entry to `.cadre/session-events.log`. Non-blocking (exit 0 always; never gates the harness).

```typescript
#!/usr/bin/env bun
// Cadre hook: handoff-mx-logger-cadre
// Triggers on: UserPromptSubmit, PostToolUse, Stop (registered in .claude/settings.json)
// Side effects:
//   - appends one newline-delimited JSON line to `.cadre/session-events.log`
//   - appends operational status to `.cadre/logs/hooks/handoff-mx-logger.log`
// Failure mode: non-blocking — exit 0 on append AND on any error (log to operational log; never gate harness).

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const EVENTS_LOG = ".cadre/session-events.log";
const HOOK_LOG = ".cadre/logs/hooks/handoff-mx-logger.log";
const TRUNCATE_AT = 4096;  // chars; cap on individual fields to bound entry size

function trunc(s: unknown, n = TRUNCATE_AT): string {
  if (s == null) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  return str.length > n ? str.slice(0, n) + "…[truncated]" : str;
}

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
  const ts = new Date().toISOString();
  const payload = await Bun.stdin.json();
  const event: string = payload.hook_event_name ?? "unknown";

  const entry: Record<string, unknown> = {
    ts,
    event,
    session_id: payload.session_id ?? null,
  };

  // Event-specific fields. Field names per live CC docs (verified at impl time;
  // see plan's hook-payload verification step).
  switch (event) {
    case "UserPromptSubmit":
      entry.prompt = trunc(payload.prompt);
      break;
    case "PostToolUse":
      entry.tool = payload.tool_name ?? null;
      entry.tool_input = trunc(payload.tool_input);
      entry.tool_response = trunc(payload.tool_response);
      break;
    case "Stop":
      // Stop is a turn-boundary marker. transcript_path lets the synthesizer
      // read full session prose if needed for narrative reconstruction.
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    default:
      // Unknown event — capture what we have for diagnostics, don't crash.
      entry.raw_payload = trunc(payload);
  }

  ensureDir(EVENTS_LOG);
  appendFileSync(EVENTS_LOG, JSON.stringify(entry) + "\n");

  ensureDir(HOOK_LOG);
  appendFileSync(HOOK_LOG, `${ts} [${event}] logged\n`);

  // Empty JSON output — pass-through; don't inject context, don't decide.
  console.log("{}");
  process.exit(0);
}

main().catch((err) => {
  // Non-blocking: log error, exit 0. Never gate the harness.
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${new Date().toISOString()} ERROR ${err?.message ?? err}\n`);
  } catch {
    // last-resort swallow — we cannot fail this script
  }
  console.log("{}");
  process.exit(0);
});
```

### Verification needed at impl time
- **Payload field names per event.** UserPromptSubmit: confirm `prompt` field. PostToolUse: confirm `tool_name`, `tool_input`, `tool_response`. Stop: confirm `transcript_path`. Use claude-code-guide.
- **`Bun.stdin.json()`** is the canonical Bun API for reading JSON from stdin (alternative: `await new Response(Bun.stdin).json()`). Confirm.
- **Truncation cap** — 4096 chars per field is a starting heuristic. Adjust if event volumes prove problematic for synthesizer context.

### Open in implementation
- **Tool-input/response sensitivity.** `tool_input` for a Bash event might include secrets the user typed. Logger truncates but doesn't redact. Acceptable in v1 (logs are gitignored); revisit when committing event logs becomes interesting.
- **Append concurrency.** Hooks fire serially per the harness model (one event at a time per orchestrator turn). No append race expected. If the harness ever parallelizes, switch to file-locking via `flock`.

## Hook Script Draft — `.claude/hooks/handoff-mx-surface-cadre.ts`

SessionStart Action 2 (runs after the synthesizer agent in Action 1 completes). Reads `.cadre/handoff.md`, returns its full content via `additionalContext` for orchestrator context injection. Simpler than logger — pure read + emit.

```typescript
#!/usr/bin/env bun
// Cadre hook: handoff-mx-surface-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
//   This is Action 2 of 2; Action 1 is the synthesizer agent that runs first
//   (assuming serial execution within the hooks array — verified pre-ship).
// Side effects:
//   - reads .cadre/handoff.md
//   - emits hookSpecificOutput.additionalContext via stdout for context injection
//   - appends operational status to .cadre/logs/hooks/handoff-mx-surface.log
// Failure mode: missing/empty handoff.md = empty additionalContext;
//   any error → empty additionalContext + log; exit 0 (never gate harness).

import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const HANDOFF = ".cadre/handoff.md";
const HOOK_LOG = ".cadre/logs/hooks/handoff-mx-surface.log";

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
  const ts = new Date().toISOString();
  let additionalContext = "";

  if (existsSync(HANDOFF)) {
    additionalContext = readFileSync(HANDOFF, "utf-8");
  }

  const out = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext,
    },
  };

  ensureDir(HOOK_LOG);
  appendFileSync(HOOK_LOG, `${ts} surfaced ${additionalContext.length} chars\n`);

  console.log(JSON.stringify(out));
  process.exit(0);
}

main().catch((err) => {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${new Date().toISOString()} ERROR ${err?.message ?? err}\n`);
  } catch {}
  // Empty additionalContext on error — graceful degrade
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" },
  }));
  process.exit(0);
});
```

## Settings Registration — `.claude/settings.json` (additive merge)

Five hook registrations: SessionStart (two actions: synthesizer agent + surface command), SessionEnd (synthesizer agent — drain), and logger registered on UserPromptSubmit / PostToolUse / Stop. Synthesizer timeout extended from default 60s → 120s to give synthesis room for busy sessions.

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "agent",
            "prompt": "Read `.claude/agents/handoff-mx-cadre.md` for your full contract (role identity, anti-patterns, 9-step SOP, file footprint). Execute its integration SOP against current state: detect any leftover `.cadre/session-events.log.processing-*` (crash recovery) or rename `.cadre/session-events.log` → `.processing-<ts>` to consume; archive any prior entries in `.cadre/handoff.md` to `.cadre/handoffs/<entry-date>.md`; write the new four-section entry as sole content of `.cadre/handoff.md`; delete the `.processing-<ts>` file. Idempotent on empty log.",
            "timeout": 120
          },
          {
            "type": "command",
            "command": "bun run .claude/hooks/handoff-mx-surface-cadre.ts"
          }
        ]
      }
    ],
    "SessionEnd": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "agent",
            "prompt": "Read `.claude/agents/handoff-mx-cadre.md` for your full contract. Execute its integration SOP to drain any unintegrated events from `.cadre/session-events.log` (consume via rename to `.processing-<ts>`); archive prior entries from `.cadre/handoff.md` to `.cadre/handoffs/<entry-date>.md`; write a new four-section entry; delete the `.processing-<ts>` file. Idempotent on empty log.",
            "timeout": 120
          }
        ]
      }
    ],
    "UserPromptSubmit": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "bun run .claude/hooks/handoff-mx-logger-cadre.ts" }
        ]
      }
    ],
    "PostToolUse": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "bun run .claude/hooks/handoff-mx-logger-cadre.ts" }
        ]
      }
    ],
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          { "type": "command", "command": "bun run .claude/hooks/handoff-mx-logger-cadre.ts" }
        ]
      }
    ]
  }
}
```

### Verification needed at impl time
- **Matcher semantics for non-lifecycle events** — confirm `"matcher": "*"` is valid (vs. omitting matcher entirely) for UserPromptSubmit, PostToolUse, Stop.
- **Two SessionStart actions, serial execution.** Confirm pre-ship that the agent (Action 1) blocks before the command (Action 2) runs. If parallel, fold surface logic into agent's `reason` field as fallback (suboptimal — `reason` doesn't auto-inject as `additionalContext`).
- **Pipe-separated regex matcher** (`startup|resume|clear|compact`) — confirm regex semantics work for SessionStart matchers, vs. needing four separate matcher entries.
- **Bun-available in hook PATH.** `bun run` invocation depends on Bun being on the harness's PATH. Verify on Windows + macOS + Linux during impl.

### Open in implementation
- **`.gitignore` for events log.** Add `.cadre/session-events.log` and `.cadre/session-events.log.processing-*` to `.gitignore` — these are transient operational state, not history.
- **Logging directory bootstrap.** `.cadre/logs/hooks/` must exist; either pre-create with `.gitkeep` or rely on hook scripts to `mkdirSync`.
- **First-run initialization.** No prior `.cadre/handoff.md`? Synthesizer's empty-log return + missing handoff = no-op; surface hook returns empty `additionalContext`. Clean first-session experience.

## Architect Findings — Subagent Dispatch Mechanism (verified via claude-code-guide)

**`"type": "agent"` hook config — exists, but BLOCKS.**
- Confirmed in current docs (`code.claude.com/docs/en/hooks.md` and `hooks-guide.md`); marked **experimental** but officially supported.
- Schema: `{type: "agent", prompt: "<inline prompt with $ARGUMENTS>", timeout: 60}`. **No path/name field — the agent identity IS the inline prompt.** So we can't reference `.claude/agents/handoff-mx-cadre.md` from the hook config; the contract has to live inline (or the hook script generates it).
- **Synchronous blocking.** Default timeout 60s, max ~50 tool-use turns. Agent runs to completion before orchestrator continues.
- Returns `{ok: true/false, reason: "..."}` — only the decision is fed back to Claude; file side-effects persist on disk.

**No native background dispatch.** For non-blocking, only path is shell-launch via `"type": "command"` that does `nohup claude -p "..." > /tmp/log 2>&1 &` or `claude --worktree <name> -p "..."`. Non-idiomatic, Windows-fragile (`nohup` semantics differ).

**Multiple hooks per matcher** are supported — a single SessionStart matcher can register both a `command` hook (fast surface) and an `agent` hook (integration). Order/coordination across them not deeply documented.

**Implications for our architecture.** The user's threshold-triggered architecture (logger checks queue, dispatches subagent in background) doesn't have a clean idiomatic mechanism. Three viable shapes:

- **Shape A — Boundary-triggered (no mid-session integration).** Logger hook is `"type": "command"` (fast, just appends). Integration runs only at SessionStart (with `compact` matcher critically) + SessionEnd, both as `"type": "agent"`. Block is acceptable at boundaries (already context-reset moments). No mid-session pauses. Loses real-time live-mutation but covers the moments that matter for the contract (compact = context reset; SessionEnd = next-session prep). Simpler architecture.

- **Shape B — Threshold-triggered with block.** Logger hook is `"type": "agent"` with a prompt that conditionally appends + integrates. Visible 5-30s pause every ~5 min during active work. Live-mutation property preserved. UX cost.

- **Shape C — Shell-launch background.** Logger checks threshold via fast command; if exceeded, shells out to `nohup claude -p &`. Non-blocking. Non-idiomatic, Windows-fragile, hard to coordinate completion / lockfile semantics.
