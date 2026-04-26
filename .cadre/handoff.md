# HANDOFF

Active session log. Most-recent session lives here; prior session entries archived under `.cadre/handoffs/<ISO-date>.md`. Each entry format:

- **Narrative** — prose walkthrough so a fresh instance can reconstruct what happened and why.
- **Decisions** — condensed bulleted list of architectural/tactical decisions made this session, with cross-references into `.cadre/logs/ADR/decision-log.md` for the full record.
- **Open threads / next-up** — what's outstanding and what the next session should expect.
- **Pointers** — where the rich context lives if the fresh instance needs to dig deeper.

---

## 2026-04-26 — Architectural simplification: tracked operational state, CC native worktrees

### Narrative

Session opened with the small loose end from prior: start the handoff-mx-cadre agent (TODO #12). User immediately surfaced friction with the worktree workflow — the harness resets cwd to the primary working directory after every Bash call, which breaks the "stay in one Claude session and hop worktrees" mental model. Two felt gaps emerged from that single ergonomic complaint: (1) one-Claude-session-per-worktree is the only viable convention; (2) `.cadre/` was gitignored, so fresh worktrees started blank.

The conversation pivoted into solving the gitignore-vs-worktree problem first. Initial design: a "playbook" — `cadre/playbook.json` listing operational-state files; a worktree-init script copying them in; a PostToolUse bidirectional sync hook keeping all worktrees + main byte-identical. Built and committed (commit `1345135`) on `feat/playbook-cadre`. Never merged.

User then shared a Reddit post on `.claude/` structure scaling and asked to pivot scope to include `.claude/` restructure. Invoked `/plan-cadre` for a unified rework plan. The plan-cadre brainstorm exposed a sequence of progressively simpler approaches: the user's intent (`abandon canonical store, just keep in main + use worktreeinclude`) led to a sharp clarifying question — *"won't merging propagate the edits?"* — which surfaced the load-bearing fact: for `git merge` to propagate, files must be tracked. The privacy concern that drove the gitignore was reconsidered. Operational state isn't actually sensitive (lab-notebook category); it just felt private. User upgraded "track playbook subset" to "track everything in `.cadre/`" mid-conversation.

Parallel discovery via claude-code-guide: **Claude Code already ships native worktree support.** `claude --worktree <name>` creates the worktree, copies gitignored files via `.worktreeinclude`, launches the session, auto-cleans on exit. `WorktreeCreate`/`WorktreeRemove` hooks are real harness events. Subagent worktree isolation via `isolation: worktree` frontmatter. The custom shell wrapper and PostToolUse sync hook we'd built were redundant with first-class harness features.

The architecture collapsed dramatically. The full bidirectional sync + custom command + worktree-init script + JSON config + `.worktreeinclude` config + per-worktree SCRATCH.md all evaporated. What remained: un-gitignore `.cadre/` and `CLAUDE.md`, adopt CC native, update doctrine. The playbook concept survived for less than 24 hours.

Brooks reflection identified five candidate shifts; the load-bearing one was scope split — ship the simplification (PR #1) separately from the anticipatory `.claude/` Reddit-style restructure (PR #2 deferred). The other four (branch rename, CC native verification, namespace cleanup, pre-tracking scrub) folded into PR #1 detail or were captured as future work.

Execution: reset `feat/playbook-cadre` to `origin/main` (drops `1345135`); pre-tracking scrub (one personal email redacted from bootstrap plan; nothing else sensitive); un-gitignore `.cadre/` + `CLAUDE.md`; commit; CLAUDE.md doctrine update (Worktrees entry rewritten for CC native, "The playbook" entry replaced with "Operational state is tracked"); branch renamed to `refactor/track-operational-state`; pushed; PR #4 opened. Live-fire verification in a fresh worktree (handed off to a separate Claude instance) revealed one drift surprise — `claude --worktree` branches from `origin/HEAD`, not from a specified PR — but the architecture itself verified clean. PR #4 merged as `8570e36`.

Workflow surprise worth carrying forward: the test plan I wrote conflated "spawn fresh work" with "verify a PR's content." Those are different flows. The verifying instance fast-forwarded its worktree to the PR head; the recipe is now in the doctrine.

### Subsequent same-day refinements (after PR #4 merged)

After landing the load-bearing simplification (PR #4, `8570e36`), the day continued with four smaller PRs that closed gaps surfaced by dogfooding the new workflow:

- **PR #5 — session housekeeping** (merged as `e524507`). Captured this session's narrative in handoff, marked TODO #27 DONE (Playbook → superseded), added TODO #28, captured ADRs 063–067, refined CLAUDE.md doctrine note that `claude --worktree` branches from `origin/HEAD` (gap surfaced by PR #4's verification).
- **PR #6 — `.claude/` Reddit-style scaffold** (merged as `7b1166c`). Closed TODO #28: scaffolded `.claude/{rules, hooks, commands, agents}/` empty with `.gitkeep`; added `*.local.md` / `*.local.json` to `.gitignore`; CLAUDE.md doctrine entry "**`.claude/` directory shape**" added. Removed stale `.claude/references/`. Content migration from CLAUDE.md to `rules/` deferred (no crowding yet); namespace cleanup `cadre/references/` → `.cadre/references/` deferred (different content categories). ADR-068.
- **PR #7 — branch-default doctrine refinement** (merged as `1b4b43b`). User caught that the new "Worktrees" doctrine read as "use worktrees for every change," which wasn't the intent. Refined to "Default flow: branch + PR" leading; "Worktrees: parallel Claude sessions" as the called-out exception. ADR-069 (no supersession of ADR-065 — the worktree spawn mechanism is unchanged; only the framing of *when* to reach for them).
- **PR #8 — auto-merge mechanics** (this PR). Reconciled ADR-010 (no auto-merge; human decides) with the user's "checks fire and merge happens" workflow: human stays the decision-maker; orchestrator enables `gh pr merge --auto` once human says yes; gates fire; merge lands on green. ADR-070 captures the operational mechanic; ADR-010 unchanged in substance, cross-linked. TODO #14 updated (merge review flow + decision-maker note).

### Decisions this session (condensed — full entries in `.cadre/logs/ADR/decision-log.md`)

Session decisions span ADR-063 through ADR-070:

1. **ADR-063:** Bidirectional sync architecture rejected before merge.
2. **ADR-064:** `.cadre/` and `CLAUDE.md` un-gitignored; tracked operational state replaces playbook concept. Supersedes ADR-014.
3. **ADR-065:** Adopt CC native worktree primitives. Supersedes ADR-021.
4. **ADR-066:** Reddit-style `.claude/` restructure deferred to PR #2 (originally TODO #28; closed in PR #6).
5. **ADR-067:** SCRATCH.md concept abandoned.
6. **ADR-068:** `.claude/` Reddit-style scaffolding adopted (TODO #28 closed via PR #6).
7. **ADR-069:** Branches are the default flow; worktrees for parallel Claude sessions only.
8. **ADR-070:** Auto-merge mechanics (`gh pr merge --auto` after human decides yes); cross-linked to ADR-010.

### Open threads / next-up

**Active task board:** `.cadre/todos.md` now has 28 items. Completed this session: TODO #27 (the Playbook, DONE — superseded by tracking) and TODO #28 (`.claude/` Reddit-style scaffold, DONE via PR #6).

**Original target still unaddressed: TODO #12 (handoff-mx-cadre agent).** The session opened with this as the goal but pivoted to architecture work for the entire day. **Now genuinely next-up — and the user has signaled a fresh session will start with this work.** The workflow infrastructure is finally clean enough to build on. The agent will run autonomously to maintain `.cadre/handoff.md` (live mutation during session, session-end stamp, session-start surfacing, lifecycle/archive). Now plausibly the simplest version of itself since handoff is just a tracked file edited via standard tools.

**Pending implementation:**
- **TODO #12 — handoff-mx-cadre agent. NEXT (new session).** Now plausibly the simplest version of itself, since handoff is just a tracked file edited via standard tools.
- **TODO #61 (ADR-061) — researcher-cadre format migration** (skill → agent).
- **TODO #14 — three-review architecture detail.** Now incorporates auto-merge mechanics (ADR-070) once CI/swarm/risk-detection layers ship.
- **TODO #22 — base CI workflow.** Required before auto-merge mechanics activate in practice.

**Pointers for next session (handoff-mx-cadre):**
- Workflow infrastructure is clean: tracked operational state, branch + PR default, CC native worktrees for parallel sessions, auto-merge mechanics specified.
- Five PRs landed today: #4 (architectural simplification), #5 (housekeeping), #6 (`.claude/` scaffold), #7 (branch-default doctrine), #8 (auto-merge mechanics).
- Plan that drove the architectural pivot: `.cadre/plans/what-di-you-think-floofy-rose.md`.
- Workflow surprise carrying forward: `claude --worktree` branches from `origin/HEAD`, not from a specified PR. To verify a PR's content, fast-forward the worktree's branch to the PR head after creation. Doctrine notes this.
- Original handoff-maintainer contract (TODO #12): live mutation during session, session-end stamp, session-start surfacing, lifecycle/archive. User never has to prompt it. Per-commit narrative lives in commit messages, not handoff.

### Pointers

- **Repo:** `github.com/WolfOnWings/cadre` (public). PRs through #8 merged.
- **Tracked operational state:** `.cadre/` and `CLAUDE.md` now tracked. Standard git merge propagates edits.
- **Plan:** `.cadre/plans/what-di-you-think-floofy-rose.md` (this session's planning artifact).
- **Doctrine:** `CLAUDE.md`. Updated this session: Worktrees entry (CC native + branch-default framing), "Operational state is tracked" replaces "The playbook" entry, "`.claude/` directory shape" entry added.
- **Decision log:** ADR-063 through ADR-070 captured this session.

---

## 2026-04-23 → 2026-04-24 — Skill ecosystem buildout: creator-cadre, plan-cadre, references, doctrine sharpening

### Narrative

This session continued from the bootstrap (2026-04-22). Where bootstrap settled the project's foundations — naming, doctrine, file hygiene, three-review architecture, repo + branch protection — this session built the first three Cadre skills that operationalize the doctrine, settled the reference architecture that future skills/agents draw from, and sharpened several pieces of doctrine through real use.

**Researcher-cadre shipped first.** The session opened with the small loose end from bootstrap: `.claude/skills/researcher-cadre/SKILL.md` was untracked locally. Codified the `-cadre` suffix convention into CLAUDE.md (the disambiguation answer to harness-native skills like Anthropic's `researcher`), shipped researcher-cadre as the first PR, and used it as the proving ground for the worktree → PR → merge flow. PR #1.

**Brainstorm-orch concept and engram revival overlap.** A short architectural conversation about whether the brainstorm-orch skill (a posture-priming layer for design conversations) and TODO #15's engram revival (always-on preresponse reminders) were duplicating effort. Settled: complementary, different scope — engrams fire on every turn for any conversation; brainstorm-orch / its eventual successor primes specifically for design work. brainstorm-orch was eventually subsumed by **plan-cadre** (a more concrete shape for the same intent).

**First researcher-cadre dispatch.** Backgrounded the brainstorming-techniques research dispatch — first real validation of researcher-cadre under load. Brief landed at `.cadre/research/2026-04-23-brainstorming-techniques.md` (~3300 words, six themes including the load-bearing finding that question-mode > suggestion-mode preserves user idea ownership at d=0.57 ownership effect, Maier et al. 2025 RCT N=486). This brief became the design-science source for plan-cadre.

**Reference architecture took shape.** The user uploaded four design-science documents (vocabulary-routing, persona-science, agent-template, master-synthesis) plus a Forge-era SKILL (7).md as the agent-creator template. The Cadre version had to adapt these for the project's conventions and a different stack. Authored three new Cadre patterns refs (`creating-skills.md`, `creating-agents.md`, `creating-hooks.md`) — Cadre's project-specific patterns layered atop the live Claude Code documentation. Then later, the user provided a new research brief on instruction-following techniques (10 techniques ranked by published evidence with arXiv citations); this became `creation-techniques.md` and was promoted to **north star reference** for skill/agent design. master-synthesis was decomposed (load-bearing content distributed; rest deleted) since it overlapped substantially with the new north star. References then moved from `.claude/references/` (initial assumption) to `cadre/references/` at the project root (tracked, not gitignored) — knowledge consumed by primitives belongs in its own namespace, not in the harness-primitives namespace.

**The "iron law" → "I/O contract" terminology shift.** The user noted, mid-session, that "iron law" was Cadre-internal coinage — invented terminology that doesn't route to anything in the LLM's embedding space. By the vocabulary effectiveness test that the new vocabulary-routing.md ref had just added, "iron law" failed: replacing it with a generic equivalent wouldn't change output quality. Replaced with "I/O contract" (routes to real CS concepts: interface contracts, API contracts, data contracts) across CLAUDE.md, creating-agents.md, and the creator-cadre drafts. Substance unchanged; only the lever for activating expert knowledge clusters.

**Mode-aware agents settled.** A real architectural fork emerged when designing creator-cadre: should it produce agents that need all input upfront (subagent mode, fire-once, no mid-task asking) or agents that can ask peers for input (teammate mode)? The user pushed back on the simple answer ("just produce subagents") with: "What about push review? That could benefit from team dialog." Genuinely sharp. Verified via a claude-code-guide deep dive that CC's agent-teams pattern is real (cross-session coordination via shared task list at `~/.claude/tasks/{team-name}/`), and another deep-dive established that for Cadre's three-review architecture, orchestrator-mediated rounds preferred over teams (teams are designed for parallel exploration with independent findings, not deliberative consensus on a shared artifact). Both modes (subagent and teammate) became first-class in `creating-agents.md`; agent definitions declare `mode:` in frontmatter; SOP must match declared mode (mode/SOP mismatch is now an anti-pattern).

**Hook stack decision.** A backgrounded researcher-cadre dispatch produced `.cadre/research/2026-04-24-hook-language-best-practices.md`. Conclusions: polyglot at the contract layer is universal (every modern hook system uses JSON-stdin / exit-code), but each ecosystem converges on a single-language default. For Cadre derived from Claude Code: TypeScript-on-Bun is the strongest default (Bun ships with Claude Code per Anthropic's Dec 2025 acquisition; CC runs as a Bun executable; ~5-15ms cold start; native TS without ts-node; bash demonstrably broken on Windows for non-trivial work). Codified in `creating-hooks.md`. Plus claude-code-guide confirmed hooks CAN dispatch agents via `"type": "agent"` config — validates the Cadre pattern of "hook stays deterministic; if AI judgment needed, hook dispatches an agent."

**Creator-cadre shape took the longest.** Started as an agent (subagent format), then pivoted to skill after a real architectural insight from the user: creator needs the orchestrator's project-relationship context (which agents/skills/hooks already exist, what conventions apply) and benefits from interactive mid-build asking — a clean-context subagent would either need heavy dispatch prompts or runtime re-discovery. Skills inherit orchestrator context naturally and run in the interactive layer. Pivoted; planned A/B test of inline-refs vs read-from-files variants was abandoned because `creation-techniques.md` Technique 5 (total context / token volume) explicitly predicts the inline variant is anti-pattern. Shipped as PR #2.

**Plan-cadre crystallized the design language.** With creator-cadre live, the user requested plan-cadre as the next primitive — load-bearing for collaborative planning within plan mode. Two-phase architecture: brainstorm (intent → could → should → will + Brooks rewrite test) → architect (sketch → iterate to crystal clarity, with the **PB&J granularity test** as exit criterion). User contributed several sharp shifts: "we" voice throughout (collaborative framing, not orchestrator-as-passive-facilitator), self-check feedback rounds, mode-shift at Brooks step where the orchestrator's domain knowledge becomes load-bearing (resists colonization once user's direction is established). Three CLAUDE.md doctrine items (Response Bloat, Yanking, Aside-Killing) absorbed as anti-patterns. Step 9 added: post-ExitPlanMode persistence to `.cadre/plans/<slug>.md` for worktree seeding. Shipped as PR #3.

**Workflow miss noted.** The session worked directly on main during the creator-cadre design (everything was in `.cadre/drafts/`, gitignored, so nothing tracked moved). When `cadre/references/` got created at the root (tracked), should have been on a feature branch from that moment. Recovered via worktree creation + move + commit + PR for both creator-cadre and plan-cadre — but the lesson (start a worktree the moment tracked-territory work begins, even if early) is worth carrying forward.

**Decisions captured into ADR log.** End of session: extracted decisions from the bootstrap handoff, todos, and plans (33 ADRs from 2026-04-22) plus this session (29 ADRs from 2026-04-23/24) into `.cadre/logs/ADR/decision-log.md` — first real population of the ADR namespace per TODO #4's "create when first real ADR is being written." Old handoff archived to `.cadre/handoffs/2026-04-22.md`.

### Decisions this session (condensed — full entries in `.cadre/logs/ADR/decision-log.md`)

Session decisions span ADR-034 through ADR-062. One-line summaries:

1. **ADR-034:** -cadre suffix convention codified in CLAUDE.md.
2. **ADR-035:** researcher-cadre shipped (PR #1) — first Cadre primitive in main.
3. **ADR-036:** brainstorm-orch and engram revival (#15) are complementary, different scopes.
4. **ADR-037:** First researcher-cadre dispatch produced brainstorming-techniques research brief.
5. **ADR-038:** Authored 3 new Cadre patterns refs (creating-skills/agents/hooks).
6. **ADR-039:** References moved to `cadre/references/` at root (tracked).
7. **ADR-040:** master-synthesis decomposed and deleted; content distributed.
8. **ADR-041:** creation-techniques.md adopted as north star for skill/agent design.
9. **ADR-042:** "Iron law" → "I/O contract" (vocabulary-routing improvement; supersedes ADR-003).
10. **ADR-043:** PB&J granularity test established for plan exit criterion.
11. **ADR-044:** CC subagents are flat files (no subdirs) — verified via claude-code-guide.
12. **ADR-045:** Two-format Cadre architecture: skills (orchestrator-priming) + agents (subagent dispatch).
13. **ADR-046:** Agent mode declaration: subagent (fire-once) vs teammate (cross-session team member).
14. **ADR-047:** CC agent-teams confirmed cross-session coordination via shared task list.
15. **ADR-048:** For three-review architecture, orchestrator-mediated rounds preferred over agent teams.
16. **ADR-049:** Hooks CAN dispatch agents via `"type": "agent"` config.
17. **ADR-050:** Hook language default: TS-on-Bun; polyglot at contract layer; bash for trivial one-liners.
18. **ADR-051:** Hook scripts at `.claude/hooks/<name>-cadre.ts`.
19. **ADR-052:** creator-cadre as skill (not agent) — needs orchestrator project context + interactive asking.
20. **ADR-053:** A/B test of inline-refs vs read-from-files for creator-cadre abandoned (research predicted result).
21. **ADR-054:** creator-cadre ships at `.claude/skills/creator-cadre/SKILL.md` with read-on-demand refs (PR #2).
22. **ADR-055:** plan-cadre as skill for collaborative planning within plan mode.
23. **ADR-056:** plan-cadre two-phase architecture: brainstorm → architect.
24. **ADR-057:** "Ask more than propose" load-bearing posture (Maier et al. 2025).
25. **ADR-058:** Mode-shift at Brooks step — orchestrator's domain knowledge becomes load-bearing.
26. **ADR-059:** plan-cadre Step 9: post-ExitPlanMode persistence to `.cadre/plans/<slug>.md`.
27. **ADR-060:** plan-cadre incorporates 3 CLAUDE.md anti-patterns (Response Bloat, Yanking, Aside-Killing).
28. **ADR-061:** researcher-cadre slated for migration from skill to agent format (pending implementation).
29. **ADR-062:** TODO #26 — refactor plan-cadre Step 9 into post-ExitPlanMode hook (deferred).

### Open threads / next-up

**Active task board:** `.cadre/todos.md` now has 26 items (one added this session). Nothing completed this session except indirectly — TODO #1 / #16 were already done last session; this session completed work that wasn't on the board (researcher-cadre ship, creator-cadre + plan-cadre). 25 active.

**Next session priority (decided end-of-session):**
1. **TODO #12 — handoff maintainer agent.** Automates what was done manually at the end of this session. Just-felt-pain. Independent of hook infrastructure.
2. **TODO #3 — taskboard runner agent.** Bootstrap-prescribed first infrastructural agent. Once #12 is built, the patterns transfer.
3. **TBD** — pick based on what feels load-bearing after #3.

**Pending implementation:**
- **researcher-cadre format migration** (ADR-061) — re-implement as agent at `.claude/agents/researcher-cadre.md`. Underway-but-not-started.
- **Plan-cadre validation** — first real use to verify the two-phase flow, the PB&J test in practice, the `.cadre/plans/` persistence step.
- **TODO #26** — refactor Step 9 to a hook once hook infrastructure exists (depends on TODO #21).

**Most upstream open TODOs (from bootstrap, untouched this session):**
- **TODO #3 (taskboard runner agent)** — original target of this session, paused at the brainstorm-orch / creator-cadre pivot. Resume now that creator-cadre exists to build it.
- **TODO #12 (handoff maintainer agent)** — automates exactly what was done by hand at the end of this session. Clear next priority after #3.
- **TODO #14 (three-review architecture detailed design)** — push-review and merge-review SOPs, stranger-agent and stranger-swarm implementations.
- **TODO #15 (engram revival)** — complementary to plan-cadre per ADR-036; still open.
- **TODO #21 (pre-commit framework + hooks install)** — design review required; now better-informed by ADR-050/051 (TS-on-Bun direction settled).
- **TODO #22 (base CI workflow)** — design review required.
- **TODO #25 (recursive retro architecture)** — depends on TODO #12.

**Citation audit candidate (carried over from bootstrap):** several 2026-dated citations in CLAUDE.md and the new ref docs are unverified. Worth a researcher-cadre verification pass before they harden.

**Stale artifacts to clean up:**
- `.cadre/drafts/creator-cadre-{a,b}.md` — agent-format drafts of creator-cadre, abandoned per ADR-052. Safe to delete after this session settles.
- `.cadre/drafts/agent-creator-cadre-SKILL.md` — earlier draft from the original agent-format direction. Same.
- `.cadre/drafts/creator-cadre-SKILL.md` and `.cadre/drafts/plan-cadre-SKILL.md` — sources for the shipped skills. Keep until confirmed ship is good.
- `.claude/references/` — empty directory left over from the move; Windows file lock prevented `rmdir`. Remove when lock releases.

### Pointers

- **Repo:** `github.com/WolfOnWings/cadre` (public).
- **Recent commits / PRs:** PR #1 researcher-cadre, PR #2 creator-cadre + cadre/references, PR #3 plan-cadre. All merged to main.
- **Skills shipped:** `.claude/skills/{researcher-cadre, creator-cadre, plan-cadre}/SKILL.md`.
- **References:** `cadre/references/` — 7 docs (`creation-techniques.md` north star; `agent-template.md`, `vocabulary-routing.md`, `persona-science.md`; Cadre patterns: `creating-skills.md`, `creating-agents.md`, `creating-hooks.md`).
- **Research briefs (this session):** `.cadre/research/2026-04-23-brainstorming-techniques.md`, `.cadre/research/2026-04-24-hook-language-best-practices.md`, `.cadre/research/2026-04-24-cc-agent-teams-deep-dive.md`.
- **ADR log:** `.cadre/logs/ADR/decision-log.md` (first real population).
- **Drafts:** `.cadre/drafts/` (mostly stale post-ship; see cleanup notes above).
- **Task board:** `.cadre/todos.md` (26 items, one added this session as #26).
- **Doctrine:** `CLAUDE.md` (gitignored, private). Updated this session: added "Cadre primitive naming" doctrine (ADR-034); changed "Iron law" → "I/O contract" (ADR-042).
- **Archived handoff:** `.cadre/handoffs/2026-04-22.md` (bootstrap session).
- **In-progress plan from session start:** `~/.claude/plans/humming-snacking-marble.md` (taskboard runner agent planning, paused at the pivot to brainstorm-orch).

### User signals to carry forward

- All bootstrap-era signals still apply (5/10 yanking, ping-pong cadence, "we don't know yet" is valid, corrections at earned scope, defer/TBD as achievements, follow asides).
- **"We" voice** in collaborative work — orchestrator is not a passive facilitator; the relationship is collaborative. Captured in plan-cadre's posture and Brooks-step mode-shift.
- **PB&J granularity test** for plan exit criteria — generalizes to "agent-readable output" as a quality bar.
- **Question-mode > suggestion-mode** by default during design conversations (Maier et al. d=0.57 ownership effect). The mode-shift at Brooks-equivalent moments (when user direction is established) is the deliberate exception.
- **Vocabulary effectiveness test** for any project-internal term — does it route to a real embedding cluster? "Iron law" failed; "I/O contract" passed. Apply to any future Cadre coinage.
- **Worktree the moment tracked-territory work begins** — even if it feels early. This session's recovery worked but cost ceremony.
