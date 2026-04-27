# Cadre Architecture Decision Log

Chronological record of architectural and tactical decisions made on the Cadre project. Each entry is a brief ADR (Architecture Decision Record) capturing the decision, its rationale, and notable implications.

**Format:** numbered chronologically (ADR-NNN). Where a later ADR overrides an earlier one, both are kept and cross-linked (`SUPERSEDED BY`, `SUPERSEDES`). All entries are ACCEPTED unless marked otherwise.

**Sources:** bootstrap session (2026-04-22) decisions extracted from `.cadre/handoff.md` and `.cadre/plans/2026-04-22-bootstrap.md`; subsequent session (2026-04-23 → 2026-04-24) decisions extracted from session conversation review.

---

## Bootstrap session — 2026-04-22

### ADR-001: Project renamed Kata → Cadre
*Decision:* The v2 rewrite of the prior "Kata" project is renamed **Cadre** — small, disciplined unit oriented by commander's intent.
*Why:* Fits the Mission Command doctrine and orchestrator-worker composition the CLAUDE.md already enshrines. Kata v1 drifted into bloat; new name marks the reset.

### ADR-002: Main Claude session IS the orchestrator
*Decision:* No separate "orchestrator agent" — the main Claude Code session is the orchestrator. Specialized agents are justified by scope, not by role.
*Why:* Recursion stops paying off past a certain depth; mirrors Anthropic's Lead Researcher pattern and CC's default subagent architecture.

### ADR-003: Iron law — every agent has declared (input schema) → (output artifact) + file footprint
*Decision:* Structural requirement, not a convention. Every Cadre agent declares input, output artifact, and exact file footprint.
*Why:* v1 failure-mode antidote — agents without artifact structure drift into undocumented side effects.
*SUPERSEDED BY:* ADR-043 (terminology shift to "I/O contract" for routing-friendly vocabulary; substance unchanged).

### ADR-004: Three-review architecture (commit / push / merge)
*Decision:* Three review stages anchored to git events: commit review (pre-commit hook, sentence scope, self-audit), push review (pre-push hook, page scope, self + 1 stranger), merge review (PR gate, chapter scope, stranger swarm + orchestrator synthesis → human dashboard).
*Why:* Tiered quality gates with escalating reviewer count match git-event frequency (flow / trickle / drip). L1 + L3 fused at every stage.
*Implications:* Detailed design deferred to TODO #14.

### ADR-005: Book metaphor for review sizing
*Decision:* Commit = sentence, push = page, merge = chapter. Coherence, not line count, is the judgment criterion.
*Why:* A 100-line rename is still one sentence. Sizing rubric replaces brittle line-count gates.

### ADR-006: Review gates are unconditional
*Decision:* Gates always fire on their anchored git operation. Agents do not decide whether to invoke a gate; they attempt the operation and the gate decides pass/fail.
*Why:* Mirrors how CI already works. Removes the "skip review" failure mode.

### ADR-007: Review briefs delivered just-in-time
*Decision:* Each hook injects the relevant review brief into the acting agent's context at the moment of the gate. Not preloaded.
*Why:* Context economy — principle of least privilege applied to the context window.

### ADR-008: Self-audit prompt is inverted
*Decision:* Review prompts at every stage ask "what would make me refuse to merge this?" rather than "what did I get wrong?"
*Why:* Counteracts self-preference bias (Panickssery et al.).

### ADR-009: Hot/cold review vocabulary retired; commit/push/merge naming adopted
*Decision:* Drop the briefly-used "hot/cold" thermal metaphor. Use commit-review / push-review / merge-review naming throughout.
*Why:* Anchors to the git verb rather than a thermal abstraction; matches book metaphor.

### ADR-010: No auto-merge
*Decision:* Every merge is human-decided. Merge orchestrator produces a 10–20-line human dashboard.
*Why:* Human is always the decision-maker. Orchestrator dashboard makes small merges trivially fast for the human without removing the gate.
*SEE ALSO:* ADR-070 — auto-merge mechanics. ADR-070 refines the *operational mechanic* (orchestrator enables GitHub auto-merge after the human decides yes; gates fire; merge lands on green) without changing the *substance* of ADR-010 (human still decides every merge).

### ADR-011: Consensus/vote mechanism for merge review deferred
*Decision:* Stage-2 (consensus) and stage-3 (vote) of merge review are deferred pending the user's agent-voting paper.
*Why:* Recorded as a boundary; implementation waits on that work.

### ADR-012: File hygiene — three-tier namespace
*Decision:* Root holds human-facing files (CLAUDE.md, .gitignore, .env); `.cadre/` for operational state; `.claude/` for harness primitives; product source in own namespace.
*Why:* Prior Kata attempts blew up partly on file-hygiene decay. Boundary is load-bearing, not cosmetic.

### ADR-013: .cadre/ contents emerge — no prescribed taxonomy
*Decision:* Subfolders inside `.cadre/` are created at moment of need by whatever agent or infrastructure needs them. No anticipation folders.
*Why:* Avoids speculative generality. Folder taxonomy emerges from real artifacts; the fleet does not conform to a pre-existing taxonomy.

### ADR-014: TODOS.md and HANDOFF.md live at `.cadre/`, gitignored
*Decision:* `.cadre/todos.md` and `.cadre/handoff.md`. Whole `.cadre/` directory is gitignored for now.
*Why:* Public-repo-flip exposed sensitive internal content; rescued by moving everything internal under `.cadre/` and ignoring it. Pattern narrows if some `.cadre/` content needs to be shared later.
*SUPERSEDED BY:* ADR-064 (operational state un-gitignored 2026-04-26 — privacy concern reconsidered, lab-notebook category accepted as public).

### ADR-015: Repo is public on GitHub
*Decision:* `github.com/WolfOnWings/cadre` is public.
*Why:* GitHub Free tier doesn't allow branch protection on private repos. Public was the cheaper path to keep protection.

### ADR-016: Partial branch protection on main
*Decision:* Require PR (zero approvals), block force-push, block deletions, enforce admins.
*Why:* Day-one protection without requiring CI green (CI workflow doesn't exist yet — see ADR-028).

### ADR-017: Merge queue deferred
*Decision:* Merge queue setup blocked on "Require CI green" branch protection rule, which is blocked on CI workflow (ADR-028).
*Why:* Sequenced dependency; deferred to TODO #24.

### ADR-018: Plan-before-execute workflow rule
*Decision:* Non-trivial sessions start in plan mode; approval gates implementation.
*Why:* Spec-Driven Development pattern; separates proposing/reviewing/executing as distinct cognitive acts.

### ADR-019: Conventional Commits enforced by commit-msg hook
*Decision:* All commits follow Conventional Commits format. Enforcement via commit-msg hook (deferred install — see ADR-027).
*Why:* Standard, parseable, supports automated changelog/release tooling.

### ADR-020: "When unsure, commit" heuristic
*Decision:* When deciding whether to commit or keep going, default to commit.
*Why:* Self-enforcing safety. Commits are free snapshots, squashable later. Aligns with TCR (Beck) and XP smallest-step discipline.

### ADR-021: Worktrees per feature/task, sibling directory
*Decision:* Each feature/task gets its own worktree at `cadre.worktrees/<branch>`, reused across sessions until the branch merges.
*Why:* Bare-repo + sibling-worktrees layout is standard for AI-assisted pipelines. Coheres with merge = chapter arc.
*SUPERSEDED BY:* ADR-065 (CC native worktree primitives 2026-04-26 — `claude --worktree <name>` creates worktrees at `.claude/worktrees/<name>/` inside the project; harness handles the lifecycle).

### ADR-022: git worktree prune at session end (automated)
*Decision:* `git worktree prune` runs at session end automatically.
*Why:* Safe by default — only removes entries whose dirs are gone.

### ADR-023: Retros end-of-session, non-failure-gated
*Decision:* Every session ends with a retro, regardless of whether the session went well or sideways. Goal: tweaks and reframes for Cadre, not blame.
*Why:* Per Kerth's Prime Directive; Agile Manifesto principle 12.

### ADR-024: Defer and TBD are first-class achievements
*Decision:* "We don't know yet" or "blocked on X" are valid outputs. Forcing premature closure is worse than parking a question at its right level.
*Why:* Last Responsible Moment (Poppendieck); Set-Based Concurrent Engineering. Doctrine added to CLAUDE.md.

### ADR-025: Co-Authored-By trailer is harness default (no action)
*Decision:* Claude Code injects the trailer automatically on commits it creates. No project-level action needed.
*Why:* Intent already met by harness behavior.

### ADR-026: Recovery-playbook git commands are orchestrator-operated
*Decision:* The orchestrator (main Claude session) runs recovery commands (reset, reflog, restore, etc.); the user does not need muscle memory for them.
*Why:* User's interface is intent, not git syntax. Three commands warrant named Cadre wrappers: `cadre bisect`, `cadre recover`, plus a destructive-git safety hook.

### ADR-027: Pre-commit framework install deferred (TODO #21)
*Decision:* Choice of framework (`pre-commit` vs husky vs lefthook), gitleaks + commitlint configs all require design review.
*Why:* Day-one parsimony; design discipline before installation.

### ADR-028: CI workflow deferred (TODO #22)
*Decision:* Base `.github/workflows/ci.yml` requires design review.
*Why:* Same parsimony reasoning as ADR-027.

### ADR-029: ADR template deferred until first real ADR is written
*Decision:* Don't create `decisions/` + `decisions/0000-template.md` upfront. Create on first real ADR.
*Why:* Parsimony. Template is shape-without-substance until needed.

### ADR-030: Pattern library deferred (TODO #17)
*Decision:* Versioned library for reusable primitives (agents, skills, prompts, hooks) with prepend-on-tweak versioning. Shape TBD; build when concrete reuse pattern earns it.
*Why:* Defer until reuse signal is real.

### ADR-031: Recursive retro architecture (base-3)
*Decision:* L1 retros consume 3 session handoffs; L2 consumes 3 L1s; Ln consumes 3 L(n-1)s. One scale-invariant template at every altitude. Abstraction carried by input compression, not altitude-specific prompting.
*Why:* Synthesizes scale-invariance (Mandelbrot, Koestler) with the Rule of Three under Miller's 7±2 working-memory floor.
*Implications:* Design deferred to TODO #25.

### ADR-032: Iterative-creation collaborative pattern
*Decision:* Complex artifacts are built in layers (skeleton → prose → cited/grounded → refinement). Skeleton-before-content is the load-bearing discipline.
*Why:* Prevents premature-bounding failure mode — at each layer, the user can steer shape before content ossifies.

### ADR-033: Dispatch subagents clean — no seeded sources
*Decision:* Subagent prompts seed the entire context. Avoid named authors/works/frameworks unless the agent should specifically attend to them.
*Why:* Empirical demo (bootstrap session) showed seeded prompts can fabricate grounding chains that survive even after the seed is removed. Double-blind logic borrowed from experimental methodology.

---

## Session — 2026-04-23 → 2026-04-24

### ADR-034: -cadre suffix convention codified for primitive naming (2026-04-23)
*Decision:* All Cadre primitives (skills, agents, hooks, scripts) carry a `-cadre` suffix.
*Why:* Disambiguates from harness-native primitives that may share base names (immediate motivating case: Anthropic ships a built-in `researcher` skill that would shadow ours). Brands provenance at the call site. Same lever as C library prefixing and Java reverse-DNS package naming.
*Implications:* Codified in CLAUDE.md "Cadre primitive naming" section.

### ADR-035: researcher-cadre renamed and shipped as first Cadre primitive (2026-04-23)
*Decision:* The local researcher skill renamed `researcher` → `researcher-cadre`. Shipped via PR #1 to `.claude/skills/researcher-cadre/SKILL.md`.
*Why:* First application of the suffix convention (ADR-034). Establishes the worktree → PR shipping flow.
*Implications:* researcher-cadre slated for eventual format migration (skill → agent) per ADR-046; not yet implemented.

### ADR-036: brainstorm-orch and engram revival (#15) are complementary, different scopes (2026-04-23)
*Decision:* The brainstorm-orch skill concept and engram revival (TODO #15) target the same failure modes (premature bounding, response bloat, steering-vs-collaborating) but with different mechanisms. Engrams = always-on preresponse reminders; brainstorm-orch = posture-priming skill activated for design conversations specifically. Both exist.
*Why:* Different mechanisms (unconditional fire vs invokable) serve different scopes (any conversation vs design conversations).
*Implications:* brainstorm-orch concept later subsumed by plan-cadre (ADR-056).

### ADR-037: First researcher-cadre dispatch — brainstorming techniques research (2026-04-23)
*Decision:* researcher-cadre dispatched (backgrounded, general-purpose subagent invoking the skill) to produce a research brief on collaborative brainstorming and creative design generation prior art.
*Why:* Sources the design science for what becomes plan-cadre. First validation that the skill works under real dispatch.
*Implications:* Brief landed at `.cadre/research/2026-04-23-brainstorming-techniques.md`. Research findings later baked into plan-cadre's SOP.

### ADR-038: Authored 3 new Cadre patterns reference docs (2026-04-23)
*Decision:* Authored `creating-skills.md`, `creating-agents.md`, `creating-hooks.md` as Cadre-specific patterns and decision criteria for each primitive type, layered atop the live Claude Code documentation.
*Why:* Live docs are authoritative on syntax; Cadre patterns add the project's conventions, decision frameworks, and common pitfalls. Two-layer reference architecture (live docs + Cadre patterns) caught immediately as the right separation.

### ADR-039: References moved from .claude/references/ to .cadre/references/ at root (2026-04-24)
*Decision:* All design-science reference docs live at `.cadre/references/` (project root, tracked) rather than `.claude/references/`.
*Why:* References are knowledge consumed by primitives, not harness primitives themselves. `.claude/` is for harness primitives; `cadre/` (a new namespace at root) for Cadre-specific knowledge. Tracked so refs ship with creator-cadre.
*Implications:* Updated all path references in skills/agents that read from `.cadre/references/*`.

### ADR-040: master-synthesis decomposed and deleted (2026-04-24)
*Decision:* The user-uploaded master-synthesis.md ref decomposed: load-bearing content distributed into `creating-skills.md`, `creating-agents.md`, `vocabulary-routing.md`, and `persona-science.md`. Master-synthesis itself deleted.
*Why:* Significant overlap with the new north-star ref (ADR-042). Decomposition removed duplication while preserving the unique content (description authoring, evaluation framework, project-context-reading principles).
*SUPERSEDES:* implicit prior decision to keep master-synthesis as a primary ref.

### ADR-041: creation-techniques.md adopted as the north star reference (2026-04-24)
*Decision:* User's research brief on instruction-following techniques (10 techniques ranked by published evidence) becomes the north star for skill/agent design. Stored at `.cadre/references/creation-techniques.md` and referenced from all creating-X.md files.
*Why:* Research-grounded ranking (position, format, output format, RLHF helpfulness, context volume, instruction density, constraint type, reasoning effort, specification level, few-shot examples) gives concrete predictions and a "Current best practice" synthesis. Higher rigor than master-synthesis.
*Implications:* All future creator-cadre output should apply Technique 1-10 + the synthesis.

### ADR-042: "Iron law" terminology replaced with "I/O contract" (2026-04-24)
*Decision:* The "iron law" framing for the agent input/output/footprint requirement is replaced by "I/O contract" across CLAUDE.md, creating-agents.md, and the creator-cadre drafts.
*Why:* "Iron law" is Cadre-internal coinage with no embedding-cluster activation outside the project (vocabulary-routing failure per the vocabulary effectiveness test). "I/O contract" routes to real CS concepts (interface contracts, API contracts, data contracts) and remains semantically equivalent.
*SUPERSEDES:* ADR-003 (terminology only; substance unchanged).

### ADR-043: PB&J granularity test established for plan exit criterion (2026-04-24)
*Decision:* A plan is "crystal clear" when an agent following it with no other input could execute (the agent doesn't put a closed jar of PB on an unopened loaf).
*Why:* Concrete heuristic for granularity that beats abstract "user signals satisfaction" criterion. Maps directly to Cadre's eventual plan-as-spec-for-worktree pattern.
*Implications:* Codified in plan-cadre Step 8 (architect-phase iteration).

### ADR-044: CC subagents are flat files; no subdirectories supported (2026-04-23)
*Decision:* Verified via claude-code-guide: subagent definitions live at `.claude/agents/<name>.md` as single flat files. The harness only scans `.md` files directly in `.claude/agents/`; subdirectories are not supported for subagent loading.
*Why:* Constrains the layout; reference material for agents must inline OR be Read at runtime from a sibling location.

### ADR-045: Cadre supports two primitive formats — skills and agents (2026-04-23)
*Decision:* Cadre uses both Claude Code primitive types deliberately. Skills (`.claude/skills/<name>/SKILL.md`) for orchestrator-priming work; agents (`.claude/agents/<name>.md`) for backgrounded subagent dispatch with isolated context.
*Why:* Skills load content into the current conversation's context; agents spawn separate processes with their own context windows. Different needs, different vehicles.

### ADR-046: Agent mode declaration — subagent vs teammate (2026-04-24)
*Decision:* Every agent definition declares its mode in frontmatter: `mode: subagent` (fire-once dispatch via Agent tool, no mid-task communication) or `mode: teammate` (member of an agent team with peer messaging via shared task list). The mode constrains what the SOP can include.
*Why:* SOP content depends on whether the agent can rely on peer interactions for input. Subagent SOPs must be self-sufficient; teammate SOPs require team context. Mode/SOP mismatch is a real failure mode (added as anti-pattern).

### ADR-047: CC agent-teams confirmed as cross-session coordination via shared task list (2026-04-24)
*Decision:* Verified via claude-code-guide deep dive: Claude Code's "agent teams" pattern is multiple independent sessions coordinated through a shared task list at `~/.claude/tasks/{team-name}/`, with direct peer-to-peer messaging. Lifecycle hooks: `TeammateIdle`, `TaskCreated`, `TaskCompleted`.
*Why:* Establishes the actual mechanism for teammate-mode agents. Enables informed decision about when to use teams vs alternatives.

### ADR-048: For three-review architecture — orchestrator-mediated rounds preferred over agent teams (2026-04-24)
*Decision:* The push-review architecture (and plausibly merge-review) uses orchestrator-mediated rounds (orchestrator dispatches reviewers sequentially, passing prior outputs forward) rather than CC agent teams.
*Why:* Per the agent-teams research: teams are designed for parallel exploration with independent findings, not deliberative consensus on a shared artifact. For Cadre's adversarial-review semantics, orchestrator-mediated rounds give predictable tactical control aligned with Commander's intent doctrine. Token cost is also lower (artifact passed forward, not cloned to N teammates).
*Implications:* Push-review SOP (TODO #14) builds on orchestrator-mediated dispatch. Merge-review may use teams if codebase complexity justifies parallel debate.

### ADR-049: Hooks CAN dispatch agents via type:agent config (2026-04-24)
*Decision:* Verified via claude-code-guide: hooks support `"type": "agent"` configuration that spawns a subagent for complex verification logic, with 60s default timeout.
*Why:* Validates the Cadre pattern of "hook stays deterministic; if AI judgment needed, hook dispatches an agent and gates on its structured output."

### ADR-050: Hook language — TS-on-Bun default; polyglot at the contract layer (2026-04-24)
*Decision:* The hook contract is language-neutral (JSON-stdin / exit-code / optional JSON-stdout, mirroring pre-commit / lefthook / Claude Code's protocol). The default *implementation* language for non-trivial hooks is TypeScript executed via Bun. Bash is acceptable for trivial one-liners only. Other languages (Python, Go, etc.) allowed at the contract layer when domain-justified.
*Why:* Bun ships with Claude Code (Anthropic acquired Bun in Dec 2025; CC runs as a Bun executable), so Bun is "free." ~5-15ms cold start, native TS without ts-node, type safety, structured-data ergonomics. Bash is demonstrably broken on Windows for non-trivial work (multiple open issues in `anthropics/claude-code`). Sourced from `.cadre/research/2026-04-24-hook-language-best-practices.md`.

### ADR-051: Hook script location — .claude/hooks/<name>-cadre.ts (2026-04-24)
*Decision:* Non-trivial hooks live as scripts at `.claude/hooks/<name>-cadre.ts` (or `.sh` for trivial one-liners; other extensions when justified). Hook configuration in settings.json calls the script.
*Why:* Keeps settings.json clean; per-script header declares trigger event and side effects (modified I/O contract for hooks).

### ADR-052: creator-cadre as skill (not agent) (2026-04-24)
*Decision:* The creator-cadre primitive (creates new Cadre skills/agents/hooks) is implemented as a skill at `.claude/skills/creator-cadre/SKILL.md`, not as an agent.
*Why:* Creator needs the orchestrator's project-relationship context (existing primitives, conventions, doctrine) and benefits from interactive mid-build asking. A clean-context subagent would either dump heavy context into every dispatch prompt or re-discover state at runtime; skills inherit naturally. Plus, the OG agent-creator pattern (per user-provided reference) was a skill.
*SUPERSEDES:* earlier draft assumption that creator-cadre would be an agent (drafts at `.cadre/drafts/creator-cadre-{a,b}.md` abandoned).

### ADR-053: A/B test of inline-refs vs read-from-files for creator-cadre abandoned (2026-04-24)
*Decision:* The planned empirical comparison of inline-references (creator-cadre-a) vs read-from-files (creator-cadre-b) is abandoned. The read-from-files variant ships.
*Why:* `creation-techniques.md` Technique 5 (total context / token volume) explicitly predicts the inline variant is anti-pattern (~2% effectiveness loss per 100K tokens; "burning 50K+ tokens before user's actual request"). Empirical validation would have just confirmed the prediction.

### ADR-054: creator-cadre ships with read-on-demand reference loading (2026-04-24)
*Decision:* creator-cadre's SOP reads `.cadre/references/*` at runtime per-step rather than inlining content into the skill body.
*Why:* Aligns with progressive disclosure (master-synthesis-era principle preserved in `creating-skills.md`) and `creation-techniques.md` Technique 5. Skill body stays under 500 lines.

### ADR-055: plan-cadre as skill for collaborative planning within plan mode (2026-04-24)
*Decision:* plan-cadre is a skill at `.claude/skills/plan-cadre/SKILL.md` that primes the orchestrator into facilitator mode within Claude Code's plan mode.
*Why:* Subsumes the brainstorm-orch concept (ADR-036) into a more concrete shape. Skill form (not agent) for the same reasons as creator-cadre (ADR-052) — orchestrator already has project context; interactive asking is natural in plan mode.

### ADR-056: plan-cadre two-phase architecture — brainstorm → architect (2026-04-24)
*Decision:* plan-cadre runs two phases inside plan mode. Brainstorm: intent → could → should → will, with explicit feedback rounds and a Brooks rewrite reflection at the end. Architect: rough action plan sketch → iterative refinement to crystal clarity (PB&J test).
*Why:* User's outline. Modal exploration (could/should/will) maps to divergent → narrowing → commitment. Brooks rewrite is the cheap-to-refactor moment before the architect phase calcifies the brainstorm shape.

### ADR-057: plan-cadre "ask more than propose" load-bearing posture (2026-04-24)
*Decision:* The orchestrator under plan-cadre defaults to question-mode rather than suggestion-mode. Open questions over structured option-sets during brainstorm phases.
*Why:* Maier, Schneider & Feuerriegel (2025, RCT N=486) — question-mode preserves higher perceived ownership (d=0.57) and increases idea diversity during refinement. Suggestion-mode and model-led approaches *decrease* diversity. Sourced from `.cadre/research/2026-04-23-brainstorming-techniques.md`.

### ADR-058: Mode-shift at Brooks step — orchestrator's domain knowledge becomes load-bearing (2026-04-24)
*Decision:* During the Brooks rewrite reflection (end of brainstorm), the orchestrator shifts from question-mode to active contribution. Brings broader-domain knowledge to bear; dispatches researcher-cadre for prior-art comparison.
*Why:* By Brooks, user's intent and direction are articulated and ownership is established. Orchestrator's contribution at Brooks informs rather than colonizes. Captures the "we" voice — collaborative, not user-leads-only.

### ADR-059: plan-cadre Step 9 — post-ExitPlanMode persistence to .cadre/plans/ (2026-04-24)
*Decision:* After plan mode exits, the final plan is copied from the harness path (`~/.claude/plans/<slug>.md`) to `.cadre/plans/<slug>.md` for project-scoped persistence.
*Why:* Plan mode's plan file is harness-scoped and ephemeral. Project work needs project-scoped persistence — these plans become seeds for worktree branches.
*Implications:* Future refactor to a hook for reliability (TODO #26).

### ADR-060: plan-cadre anti-patterns incorporate 3 CLAUDE.md doctrine items (2026-04-24)
*Decision:* plan-cadre's anti-pattern watchlist includes Response Bloat (CLAUDE.md "Exchange rhythm"), Yanking (CLAUDE.md "Calibration"), and Aside-Killing (CLAUDE.md "Creative drilling"), in addition to brainstorming-research-derived patterns.
*Why:* CLAUDE.md captures specific Cadre-orchestrator failure modes that plan-cadre exists to counter. Cross-reference makes the doctrine link explicit.

### ADR-061: researcher-cadre slated for migration from skill to agent format (2026-04-24, pending)
*Decision:* researcher-cadre will be re-implemented as an agent (`.claude/agents/researcher-cadre.md`) rather than a skill. Not yet implemented; tracked.
*Why:* Per ADR-045's two-format pattern: dispatched-as-work primitives like researcher-cadre fit the agent format better than the skill format. Current usage (general-purpose subagent invoking the skill) is the awkward two-step that motivated the format clarity.
*STATUS:* PENDING IMPLEMENTATION.

### ADR-062: TODO #26 — refactor plan-cadre Step 9 into post-ExitPlanMode hook (2026-04-24, deferred)
*Decision:* Once Cadre's hook infrastructure is real (TS-on-Bun ready, hook events verified), the persist-to-`.cadre/plans/` move (currently a SOP step the orchestrator must remember) refactors into an automatic post-exit hook.
*Why:* Orchestrator can't always be relied on to remember Step 9 (compaction, context drift). Hook gives deterministic guarantee.
*STATUS:* DEFERRED, dependency on hook infrastructure (TODO #21).

---

## Architectural simplification session — 2026-04-26

### ADR-063: Bidirectional sync "playbook" architecture rejected before merge (2026-04-26)
*Decision:* The bidirectional auto-sync playbook architecture (committed as `1345135` on `feat/playbook-cadre`: `cadre/playbook.json` + worktree-init script + PostToolUse sync hook + settings.json wiring) is abandoned. Branch reset to `origin/main` and rewritten as a different architecture before any merge.
*Why:* During plan-cadre re-planning, two facts collapsed the design: (1) Claude Code already ships native worktree primitives (`claude --worktree`, `.worktreeinclude`, `WorktreeCreate` hooks), making most of the custom infrastructure redundant; (2) merge-propagation requires tracking the files anyway, which dissolves the privacy-driven gitignore that motivated the playbook in the first place.
*Implications:* ~140 lines of custom hook code deleted before merging. Reflog preserves the prior tip for 30 days if recovery ever needed.

### ADR-064: Operational state is tracked (2026-04-26)
*Decision:* `.cadre/` and `CLAUDE.md` are un-gitignored and tracked by git. Standard merge propagates edits across worktrees and main. Only `.env*` remains gitignored.
*Why:* Simplest architecture meeting the user's intent (persistent edits, single canonical source). Privacy concern reconsidered — operational state (handoff, todos, ADR log, drafts, research, plans) is lab-notebook category, accepted as public on GitHub. One personal email redacted from the bootstrap plan as part of the pre-tracking scrub.
*Implications:* No playbook concept, no init scripts, no doctrine for "write to main's path." Plain git workflow handles propagation.
*SUPERSEDES:* ADR-014 (TODOS.md and HANDOFF.md gitignored).

### ADR-065: Adopt Claude Code's native worktree primitives (2026-04-26)
*Decision:* Worktrees are spawned via `claude --worktree <name>` (CC native; documented at `code.claude.com/docs/en/common-workflows.md#run-parallel-claude-code-sessions-with-git-worktrees`). Worktrees live at `.claude/worktrees/<name>/` (inside the project). The harness handles branch creation, file checkout, session launch, and cleanup.
*Why:* CC ships first-class support. Adopting it eliminates the custom shell wrapper, the bare-repo-plus-sibling-worktrees pattern, and downstream cleanup work. Aligns with the user's "seamless one-command" intent.
*Implications:* CLAUDE.md doctrine updated under "Git and review architecture." The harness branches from `origin/HEAD` by default; verifying a specific PR's content from a fresh worktree requires fast-forwarding the branch to the PR's head after creation (recipe noted in doctrine).
*SUPERSEDES:* ADR-021 (worktrees at `cadre.worktrees/<branch>`).

### ADR-066: Reddit-style `.claude/` restructure deferred to PR #2 (2026-04-26)
*Decision:* The proposed Reddit-style `.claude/` restructure (`rules/`, `hooks/`, `commands/`, `agents/`, plus `*.local` convention for personal vs team config) is deferred. PR #4 ships only the load-bearing simplification.
*Why:* Brooks reflection during plan-cadre identified the restructure as anticipatory polish, not load-bearing. Smaller PR with focused mission, easier to revert if needed.
*Implications:* Captured as TODO #28. Triggers when felt-need warrants (folder rot, scaling pressure, specific guidance that wants its own home in `rules/`).

### ADR-067: SCRATCH.md per-worktree scratchpad concept abandoned (2026-04-26)
*Decision:* The proposed per-worktree gitignored SCRATCH.md (templated stub for branch-local thinking, surfaced via the alternative-design proposal during this session) is abandoned.
*Why:* With operational state tracked and propagated via merge, branch-local thinking already has natural homes in commits and PR descriptions. SCRATCH.md was a workaround for the gitignored architecture — irrelevant once tracking landed.
*Implications:* No file template needed; no gitignore line added.

### ADR-068: `.claude/` Reddit-style scaffolding adopted; content migration deferred (2026-04-26, TODO #28)
*Decision:* Scaffold the structured `.claude/` layout from the broader CC community: `.claude/{rules, hooks, commands, skills, agents, worktrees}/`. Empty subdirs (`.gitkeep`); `skills/` and `worktrees/` already populated. Personal-config siblings split via `*.local.md` / `*.local.json` (added to `.gitignore`). CLAUDE.md gets a brief "**`.claude/` directory shape**" entry describing the layout. The stale `.claude/references/` directory (leftover from a prior session's move to `.cadre/references/`) is removed.
*Why:* Pre-shape the namespace so future primitives slot in cleanly without reorganizing churn. Anticipatory but cheap.
*Out of scope:* Content migration from CLAUDE.md to `rules/` deferred — no specialized guidance feels crowded yet, so YAGNI. Namespace cleanup `.cadre/references/` → `.cadre/references/` deferred — design references and operational state are different content categories that benefit from separate top-level dirs.

### ADR-069: Branches are the default flow; worktrees for parallel sessions only (2026-04-26)
*Decision:* Default workflow for changes is plain branch + PR (`git checkout -b <name>`, edit, commit, push, PR, merge). Worktrees are reserved for cases that require a parallel Claude session (verifying a PR while continuing other work, long background tasks, parallel feature development). CLAUDE.md "Worktrees" doctrine entry refined accordingly: leads with "Default flow: branch + PR," followed by "Worktrees: parallel Claude sessions" as the called-out exception.
*Why:* The three-review gates (commit / push / merge) fire on git operations and have zero dependency on worktrees. Defaulting to worktrees implied complexity that wasn't load-bearing for the most common case (sequential single-session solo work). The earlier doctrine framing ("spawn via `claude --worktree`") was true but read as prescriptive when it should have been conditional.
*Implications:* No supersession of ADR-065 — the worktree spawn mechanism (CC native, `.claude/worktrees/<name>/` location) is unchanged. This ADR refines the *when* without touching the *how*.

### ADR-070: Auto-merge mechanics — human decides; orchestrator enables `gh pr merge --auto` (2026-04-26)
*Decision:* The merge mechanic uses GitHub's auto-merge feature. Workflow: orchestrator opens PR → checks fire (CI, stranger swarm, risk-class detection — when those layers exist) → orchestrator synthesizes the human dashboard → **human decides yes/no on merging** → on yes, orchestrator runs `gh pr merge --auto` → gates complete (or already green) → GitHub auto-merges. On gate failure, the dashboard surfaces context for human re-decision; orchestrator does not retry without explicit human direction.
*Why:* Reconciles ADR-010's "human decides every merge" with the directive that "checks fire and merge happens automatically once human decides yes." Human stays the decision-maker; mechanics automate after the decision. The orchestrator no longer runs direct `gh pr merge` commands post-decision — it enables auto-merge mode.
*Implications:* Refines TODO #14's merge-review design — "No auto-merge" phrasing replaced with the auto-merge-mechanics flow. Today's PRs (#5, #6, #7, #8) used direct merges because no CI exists yet; once CI/swarm land, the canonical path is `--auto`. The dashboard's role shifts from "primary gate" to "context surface for the human's decision and for failure-case diagnostics."
*CROSS-LINK:* ADR-010 (the substance — human decides — is unchanged; ADR-070 specifies the operational mechanic).

### ADR-071: Operational-metadata exception to branch+PR default (2026-04-26)
*Decision:* Trivial mutations to `.cadre/todos.md`, `.cadre/handoff.md`, or the ADR log can land directly on main. Branch+PR remains the default for code, behavior, or doctrine changes (including this ADR itself).
*Why:* Surfaced when a 27-line TODO addition (PR #9) got the full branch+PR ceremony — overkill for queueing future work. Operational-metadata edits don't carry the review value that justifies the branch+PR cost; the three-review gates exist to catch behavioral risk that isn't present in task-board / handoff / ADR appends.
*Implications:* Refines ADR-069 (branches are the default) without superseding it — the default still holds for substantive changes. Doctrine changes themselves are not in scope of this exception, since they ARE behavioral (they shape future orchestrator behavior).

### ADR-072: handoff-mx-cadre — boundary-synthesizer architecture (Shape D) (2026-04-26, TODO #12)
*Decision:* Build handoff-mx-cadre as a boundary-triggered synthesizer subagent dispatched by lifecycle hooks. Logger hook (UserPromptSubmit / PostToolUse / Stop) appends events to `.cadre/session-events.log` (fast, non-blocking). SessionStart (matchers: `startup|resume|clear|compact`, two actions: synthesizer agent then surface command) and SessionEnd (drain) dispatch the synthesizer. Synthesizer reads events log + handoff, archives prior entries to `.cadre/handoffs/<ISO-date>.md`, writes new four-section entry (Narrative ≤200 lines / Decisions / Active Items / Changes) as sole content of `.cadre/handoff.md`, clears events log via rename-based atomic consume.
*Why:* `"type": "agent"` hook config blocks synchronously (verified live via claude-code-guide); no native background dispatch. Threshold-triggered mid-session integration would cause visible 5–30s pauses every ~5 min during active work. Boundary-triggered concentrates the block at session-boundary moments (already context-reset; block is acceptable). Logger captures everything; subagent gets deterministic input (events log) at boundaries — solves the orchestrator-briefing-overhead objection that earlier blocked the subagent path. Aligns with LSM-tree memtable-and-compaction analog from prior-art research (`.cadre/research/2026-04-26-handoff-mx-prior-art.md`).
*Implications:* TODO #12 implemented this session. Closes prior architectural options: A (no subagent, orchestrator-side inline maintenance — rejected for context-bloat); B-with-threshold (subagent + mid-session threshold — rejected for visible blocks); C (skill priming — same A context-bloat issue). Will refined four times during planning (Brooks loop-backs); final shape settled as Shape D. CLAUDE.md doctrine entry was DROPPED during planning — orchestrator doesn't need to know how handoff is maintained; mechanics are entirely worker-side.
*SUPERSEDED BY:* ADR-073 (dispatch mechanism — `"type": "agent"` hook empirically broken; orchestrator-dispatch via Agent tool replaces it).
*CROSS-LINK:* TODO #12 (handoff-mx agent) — DONE.

### ADR-073: Synthesizer dispatch shifts to orchestrator (hook→agent broken in CC build) (2026-04-26, TODO #12)
*Decision:* The synthesizer subagent is dispatched by the orchestrator (main Claude Code session) as its first action on session start, NOT by a SessionStart hook. The SessionStart hook is now a thin `"type": "command"` Bun script (`.claude/hooks/handoff-mx-prime-cadre.ts`) that injects an orientation instruction via `additionalContext` telling the orchestrator to dispatch the handoff-mx-cadre subagent (Agent tool, `subagent_type: "handoff-mx-cadre"`) and read the synthesized `.cadre/handoff.md` before responding to the user. Synthesizer agent has `permissionMode: bypassPermissions` so its file ops don't prompt mid-dispatch.
*Why:* Two consecutive live-fire tests confirmed `"type": "agent"` hooks fail silently in current CC build — no error, no dispatch, no `.processing-*` rename, events log untouched. Per GitHub Issue #39184, agent-type hooks reportedly fail across SessionStart, UserPromptSubmit, and PostToolUse. SessionEnd is independently restricted to `command`/`mcp_tool` per docs. ADR-072's Shape D rested on hook→agent dispatch which is structurally broken in this build. The Agent tool (orchestrator→subagent) is the harness's primary dispatch mechanism and works reliably; it returns asynchronously when the subagent completes — fine for synthesis, since the orchestrator awaits and then reads the freshly-written handoff before responding to the user.
*Implications:* ADR-072's *architectural intent* (logger captures events; synthesizer integrates at session start; clean separation) is preserved; only the *dispatch mechanism* changes from hook to orchestrator. CLAUDE.md stays clean — priming is ephemeral additionalContext per session, not permanent doctrine. Failures become visible (orchestrator sees subagent errors directly, no silent miss). Verified end-to-end via live-fire test on 2026-04-26: 17 events from 3 test sessions integrated into a four-section entry, 2 prior entries archived (`.cadre/handoffs/2026-04-23.md` and `.cadre/handoffs/2026-04-26.md`), crash-recovery branch exercised in practice — a `.processing-*` left over from a partial prior run was caught and consumed cleanly. First-run cost was ~8 minutes against a 26KB existing handoff; steady-state runs against a single prior entry should be substantially faster.
*SUPERSEDES:* ADR-072 (dispatch mechanism only — boundary-synthesizer intent preserved).
*CROSS-LINK:* TODO #12 (handoff-mx agent) — DONE; TODO #15 (engram revival) — adjacent, the prime hook is engram-class but specific to handoff orientation; TODO #31 (events-log filtering — added this session per live-fire size observation).

### ADR-074: task-mx-cadre — board-curator with single-writer + deterministic-script split (2026-04-27, TODO #3)
*Decision:* `task-mx-cadre` owns `.cadre/todos.md` end-to-end. Architecture: (1) **Single-writer / inbox-shard discipline** — orchestrator writes ONLY to `.cadre/task-mx/inbox/<ts>-<slug>.md` shards; agent is the SOLE writer of `.cadre/todos.md`, eliminating write races by construction. (2) **Deterministic-script split** — `.claude/agents/task-mx-cadre.score.ts` (Bun) handles polynomial scoring, Kahn topological sort, cycle detection, critical-path DP, and three-section markdown render; agent reduces to NL → frontmatter extraction, rich-expansion, conflict resolution. (3) **Three-hook ecosystem** — trigger (PostToolUse, in-body path-discrimination loop-guard), surface (UserPromptSubmit, debounce-floor + flag injection), prime (deferred). (4) **Schema** — YAML frontmatter (id/title/status/priority/due/scheduled/blockers/tags/project/impact/effort/created/updated/closed) + free-form prose body. (5) **Scoring** — Taskwarrior polynomial with default coefficients, stored in `.cadre/task-mx/weights.json`. (6) **Display** — three-column Index regenerated each fire (`## Ready` / `## Blocked` / `## In Progress`); top of `## Ready` is canonical pull-next; orchestrator-side O(1) read, no dispatch. (7) **Aging** — single archive on DONE to `.cadre/task-mx/archive/<YYYY-MM>.md`. (8) **Migration (day-1)** — `--migrate-dry-run` + user review checkpoint before live integration; pre-migration sha captured for rollback. (9) **File footprint consolidated** under `.cadre/task-mx/`; only `.cadre/todos.md` lives at `.cadre/` root.
*Why:* Mutation rate is ~10× handoff-mx's, requiring quiescence debounce and atomic write-race elimination. LLMs are weak at deterministic arithmetic (Dziri *Faith and Fate*); cleaving polynomial + topological sort + critical-path DP into `score.ts` collapses LLM tokens 60–80% and wall-clock 40–60%. Single-writer pattern via inbox shards gives crash-recovery for free (mirrors `handoff-mx-prime`'s atomic-rename pattern). User intent ("nothing is overkill — LLM does this, not a human") justifies Taskwarrior polynomial over simpler alternatives. The wedge nobody else has: LLM extracts axes from natural-language brain-dump.
*Implications:* Second `-mx-` agent. Mirrors handoff-mx-cadre architectural shape (subagent + three hooks + parse/score script + atomic write) but cost-profile-aware (debounce, in-body path-discrimination instead of matcher-based loop-guard, Windows-aware atomic rename). PR #N implements. Plan: `.cadre/plans/design-and-implement-task-mx-cadre-ticklish-lerdorf.md`. Pre-migration sha for rollback: `f9ea114be50e71e8d5f6eca5daf5e806a21f5843` (last commit touching `.cadre/todos.md` before migration). Recovery: `git show f9ea114be50e71e8d5f6eca5daf5e806a21f5843:.cadre/todos.md > .cadre/todos.md`.
*CROSS-LINK:* TODO #3 (taskboard runner agent) — DONE; TODO #15 (engram revival) — schema is engram-adjacent; TODO #14 (three-review architecture) — task-mx is the queue surface for those reviews; ADR-072 (boundary-synthesizer pattern), ADR-073 (orchestrator-dispatch via Agent tool) — both reused.

---

*Append-only log. New ADRs added at the bottom, numbered sequentially. Supersession links bidirectional.*
