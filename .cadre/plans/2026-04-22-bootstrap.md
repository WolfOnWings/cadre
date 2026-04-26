# Cadre — Git/Workflow Bootstrap Walkthrough

## Context

**Rename.** The project formerly codenamed *Kata* (v1) drifted into monolithic bloat. The v2 rewrite is being renamed to **Cadre** — a small, disciplined unit whose commander orients by intent. Fits the Mission Command doctrine and orchestrator-worker composition that the CLAUDE.md already enshrines. The directory `C:\Users\duham\Projects\kata_v2\` will be renamed; all references follow.

The project directory currently contains only `CLAUDE.md` — no git, no source, no manifest. The user provided a comprehensive chronological checklist of git hygiene, session workflow, and recovery practices, and elected to walk through each item one at a time. For each, Claude offers a short usefulness statement plus a recommendation; the user decides include / skip. Decisions are captured below and become the execution plan.

Legend from the user's list: 🟦 defensive (guardrails, memory, recovery), 🔺 offensive (LLM-powered judgment), ● neutral git hygiene.

## Rename decisions

- Old: `kata` / `kata_v2`
- New: `cadre`
- Project directory target: `C:\Users\duham\Projects\cadre\`
- All instances of "kata" in CLAUDE.md, internal references, and future artifacts to be updated during execution.

## Emergent artifact: `TODOS.md` + taskboard runner agent

During the walkthrough the user introduced a new root artifact: **`TODOS.md`** — a structured task board that will eventually be owned and maintained by a dedicated *taskboard runner agent* (to be built). Unlike `HANDOFF.md` (append-only session log of what happened), `TODOS.md` is the forward-looking board of upcoming work. As decisions produce deferred action items, they land on `TODOS.md` rather than evaporating into scrollback.

Initial `TODOS.md` seed items:
1. Populate `CLAUDE.md` workflow section (from deferred item 7).
2. Write `HANDOFF.md` header + entry template (from deferred item 8).
3. Build the **taskboard runner agent** that owns `TODOS.md`.
4. Create `decisions/` + `decisions/0000-template.md` when the first ADR is about to be written (from deferred item 9).
5. Wire formatter + linter + fast-test subset into pre-commit the moment the runtime/stack is chosen (from split item 11).
6. CI layer — type checking (cadence: week 1 after stack lands).
7. CI layer — secret scanning in CI (cadence: week 2; complements local gitleaks hook).
8. CI layer — dependency audit (cadence: week 3).
9. CI layer — diff-size gate, per-commit *and* per-PR (cadence: week 4). Extended from item 21.
10. CI layer — coverage threshold (cadence: week 5).
11. Rollback drill — deliberate bad commit → `git reset --hard` → reflog recovery, on non-trivial history (from deferred item 15).
12. Build the **handoff maintainer agent** — runs fully autonomous in the background. Contract:
    - **Live mutation during session** — entry is updated continuously as in-session actions occur (not just at session end).
    - **Session-end stamp** — the live entry is sealed into the final record at session end.
    - **Session-start surfacing** — relevant prior handoff content is surfaced into new sessions automatically.
    - **Lifecycle/archive** — handles aging of old entries (subsumes deferred item 42; shape TBD).
    - **User never has to prompt it.** No "update the handoff" or "read the handoff" requests should ever be needed.
    - Per-commit narrative still lives in commit messages (via the commit-review gate), not in handoff. Handoff is session-level.
    (from deferred items 17, 28, 42)
13. **Investigation task** — ADR architecture and Karpathy-style project wiki overlap. Both are structured project self-knowledge surfaced to LLM sessions. Decide: do they coexist? Is one a subset of the other? What's the unified shape? This investigation precedes building the ADR agent / wiki fetcher. Output: an ADR (fittingly) capturing the decision. (from deferred item 18)
14. Design the **three-review architecture** in detail.

    **Deliverables:**
    - Agent-facing review briefs (one per stage) — scope (book metaphor), pass/fail criteria, examples, sizing judgment. Location TBD during design.
    - **Human-facing merge dashboard** — distinct artifact: 10–20-line dashboard (chapter summary / intent served / swarm verdict / risk flags / unresolved questions / human action line). Skimmable in 20–30s. Produced by the merge orchestrator from synthesis of CI, swarm, risk detection, PR description.
    - Gate hooks (pre-commit, pre-push, merge gate) that inject each agent-facing brief just-in-time.
    - Stranger-agent subagent (push review) and stranger-swarm (merge review) implementations.
    - **Merge orchestrator agent** — synthesizes CI results + swarm verdicts + L1 risk flags + PR description → produces human merge dashboard. No auto-merge exists; human is always the decision-maker.
    - Risk-class detection: file-path / diff-size / AST pattern matchers for schema migrations, auth, payments, public API, etc. Outputs go to orchestrator as flags.

    **Architecture context (settled during the bootstrap walkthrough, carried forward):**

    *Three review stages.* Each stage is a structurally identical L1+L3 bundle with escalating weight and reviewer topology:

    | Stage | Gate | Scope (book metaphor) | L1 surface | L3 surface | Reviewer count | Decision-maker |
    |-------|------|----------------------|------------|------------|----------------|-----------------|
    | **Commit review** | pre-commit hook | **Sentence** — one coherent thought | Lint / type / fast test / gitleaks on one commit | Commit-review brief injected into committing agent | 1 (self) | Gate |
    | **Push review** | pre-push hook | **Page** — coherent paragraph(s) | Cumulative lint / type / test over commit range | Push-review brief injected into pushing agent + 1 stranger agent adversarial pass | 2 (self + stranger) | Gate |
    | **Merge review** | CI + PR gate + orchestrator | **Chapter** — complete arc | Full CI suite + risk-class detection | Stranger **swarm** with distinct framings + **merge orchestrator** synthesizes all signals into the human dashboard | N (swarm) + orchestrator | **Human, always** |

    *Merge review flow:* CI runs → stranger swarm runs → L1 risk detection runs → merge orchestrator (main Claude session) synthesizes → human dashboard → human decides. No auto-merge. No bypass.

    *Trust hierarchy:* L1/L2/L3 is orthogonal to reviewer count; each stage fuses L1 and L3, with L2 grounding inside the L3 briefs.

    *Self-audit framing:* the prompt at any stage is **inverted** ("what would make me refuse to merge this?") to counteract self-preference bias (Panickssery et al.).

    *Sizing (book metaphor, no line-count gates):* commit = sentence, push = page, merge = chapter. Coherence, not length, is the judgment criterion. A 100-line rename is still one sentence. Sizing logic lives inside each stage's review brief.

    *Gate discipline:* gates are unconditional — they always fire on their anchored git operation. Agents do not decide whether to invoke a gate; they attempt the operation and the gate decides pass/fail. Mirrors how CI already works.

    *Context economy:* review briefs are delivered just-in-time by each hook into the acting agent's context at the moment of the gate. Not preloaded, not memorized.

    *Frequency model (flow / trickle / drip):* review-stage weight tracks git-event frequency, not intrinsic importance. Commit = flow (many per hour → light gate). Push = trickle (few per day → medium gate). Merge = drip (rare, intentional → heavy gate affordable, including swarm + consensus + vote + artifact). If merges ran hourly the design would be wrong.

    *Merge review as multi-stage artifact flow* — the review *is* the artifact:

    ```
    .cadre/reviews/<pr-id>/merge-review.md    (path TBD)

    ## Individual reviews (stage 1, independent)
    ### architect-reviewer    (input: diff, PR desc, ADRs)
    ### security-reviewer     (input: diff, PR desc, risk flags)
    ### skeptic-reviewer
    …

    ## Consensus (stage 2 — shared-team deliberation)
     — mechanism TBD, pending user's agent-voting paper

    ## Vote (stage 3)
     — mechanism TBD, pending user's agent-voting paper

    ## Final verdict: pass / block / escalate-to-human
    ```

    The main Claude session (orchestrator) reads this artifact and compresses it into the human merge dashboard. The file persists after merge as the permanent record.

    *Consensus + vote mechanism is deferred* pending the user's agent-voting paper. Recorded here as a boundary; implementation waits on that work.
15. **Engram revival** — preresponse attention-point reminders (YAML rule/rationale/examples, injected unconditionally). Target failure modes: premature decision-space bounding, over-specification, response bloat, steering-vs-collaborating. Cadre-proper infrastructure, not a local fix. **Rich context in Appendix A** (full conversation transcript that produced this TODO; transfers verbatim to TODOS.md on execution).

16. **CLAUDE.md addition** — add a note capturing the premature-bounding / response-bloat failure modes as a temp hack ahead of the engram revival (TODO #15). Content and placement TBD.
17. **Pattern library** — versioned library for reusable primitives (agents, skills, prompts, hooks). Canonical current location per primitive; prepend-on-tweak versioning in the library file. Shape TBD. (from item 37)
18. **`cadre bisect`** — orchestrated git bisect runner. User provides time or commit range; orchestrator runs a test command, drives the binary search, reports the breaking commit. (from item 50)
19. **Destructive-git safety hook** — PreToolUse hook on destructive git operations (`reset --hard`, `push --force`, etc.) that auto-snapshots via `git stash` or a safety tag before the operation proceeds. Invisible recoverability. (from item 52)
20. **`cadre recover`** — reflog-based recovery entry point. User invokes; orchestrator surfaces recent HEAD positions with summaries; restores on user confirmation. (from implicit recovery need across items 49/51/52)
21. **Pre-commit framework + hooks** — design and install the pre-commit framework (choice of tool: `pre-commit` vs husky vs lefthook), configure **gitleaks** (secret scanning) and **commitlint** (Conventional Commits enforcement). Base install only; formatter/linter/test hooks come from TODO #5 once stack is chosen. Design review required.
22. **Base CI workflow** — design `.github/workflows/ci.yml`. Runner choice (`ubuntu-latest`?), triggers, base structure. Individual checks layer in via TODOs #6–10. Design review required.
23. **Enable "require CI green" branch protection** — once TODO #22 exists and is green on a test PR, add the required-check rule to branch protection on main.

## Emerging architectural pattern: agent-owned artifacts

User signal ("don't be afraid to think bigger") plus two concrete instances (taskboard runner agent for `TODOS.md`, handoff maintainer agent for `HANDOFF.md`) reveal the real shape Cadre is growing toward: **a fleet of specialized worker agents maintaining the project's self-knowledge and workflow guarantees**, with CLAUDE.md + hooks as the orchestration substrate. The main Claude session *is* the orchestrator (from CLAUDE.md's orch-worker contract) — not a separate "orchestrator agent." Specialized agents are justified by scope, not by role. We can only get so meta before recursion stops buying anything.

This is the orch-worker pattern from CLAUDE.md's doctrine applied *recursively* to Cadre's own housekeeping. Several downstream items on this walkthrough (18 ADR scan, 38 weekly archaeology, 39 monthly doc drift) are strong candidates for the same treatment. Expect them to route into the TODO board as additional agents to build, rather than as CLAUDE.md rules.

Implication: the *taskboard runner* is the first infrastructural agent, because every other agent's work routes *through* the task board. Build order: taskboard runner → handoff maintainer → the rest.

(The iron law of agent-artifact signatures and the file hygiene disciplines this pattern relies on are captured in the CLAUDE.md seed content at the bottom of this plan, for TODO #1. Three-review architecture details live with TODO #14.)

## Day one, once

| # | Step | Decision | Notes |
|---|------|----------|-------|
| 1 | 🟦 `git init` + first (root) commit + `main` as default | **Include** | Root commit = committing `CLAUDE.md`. |
| 2 | 🟦 Configure `user.name`, `user.email`, `pull.rebase=true`, `init.defaultBranch=main` | **Include** | Global. Email per `userEmail`: `<redacted>`. |
| 3 | 🟦 `.gitignore` | **Include — minimal** | One line: `.env*`. Extend reactively when real artifacts appear. Parsimony principle. |
| 4 | 🟦 `.git/info/exclude` for personal ignores | **Include as noted practice** | No file creation now. Record in CLAUDE.md workflow section. |
| 5 | 🟦 Worktrees outside main repo | **Include** | Convention: `C:\Users\duham\Projects\cadre.worktrees\<branch>`. Record in CLAUDE.md. |
| 6 | 🟦 Scaffold | **Include — expanded** | Create `HANDOFF.md` (empty) + `TODOS.md` (seeded). `decisions/` and `prompts/` appear when first content lands. |
| 7 | 🟦 Populate `CLAUDE.md` | **Defer → TODOS.md #1** | Held for a dedicated pass. Seeded as first item on the task board. |
| 8 | 🟦 `HANDOFF.md` header: append-only format + entry template | **Defer → TODOS.md #2** | Held for a dedicated pass. Seeded on the task board. HANDOFF.md itself is created empty in item 6. |
| 9 | 🟦 `decisions/0000-template.md` ADR skeleton | **Defer → TODOS.md #4** | Create folder + template on first real ADR. Parsimony. |
| 10 | ● `git lg` alias | **Include — repo-local** | `git config --local alias.lg "log --oneline --graph --all --decorate"`. Keeps global config minimal. |
| 11 | 🟦 Pre-commit hooks | **Defer → TODO #21** | Framework install + gitleaks + commitlint configs require design review. Formatter/linter/tests as TODO #5 once stack lands. |
| 12 | 🟦 Protect `main` on remote | **Include — create remote + protect now** | Create GitHub repo today, enable: require PR, require CI green, block force-push. Name: `cadre` (owner TBD at execution time). |
| 13 | 🟦 CI layers | **Defer → TODO #22** | Base CI workflow needs design review (TODO #22). 5 layered checks cadenced one/week as TODOs #6–10. Branch protection ships partial (TODO #23 adds CI-green requirement later). |
| 14 | 🟦 Merge queue | **Include — enable now** | Turn on at remote creation. Free hedge; no cost when unused. |
| 15 | ● Rollback drill | **Defer → TODOS.md** | Fire when there's non-trivial history to feel real. |

## Starting a new session (every time)

| # | Step | Decision | Notes |
|---|------|----------|-------|
| 16 | 🟦 Worktree granularity | **Include — per feature/task** | One worktree per feature/task, reused across sessions until the branch merges. Coheres with merge = chapter arc. Encode in CLAUDE.md (TODOS #1). |
| 17 | 🟦 Read last ~20 HANDOFF entries at session start | **Defer → TODOS.md #12** | Owned by a background handoff-maintainer agent rather than a CLAUDE.md rule. Agent-owned artifact pattern. |
| 18 | 🟦 ADR relevance at session start | **Defer → TODOS.md #13** | Architecturally adjacent to Karpathy-style project wiki. Both are structured project self-knowledge surfaced to LLM sessions. Pre-deciding ADR logic in isolation risks wrong shape. Investigate unified architecture first. Likely outcome: two agents (handoff log maintainer, ADR/wiki fetcher) but shape TBD. |
| 19 | 🔺 Plan before non-trivial coding | **Include — CLAUDE.md rule** | "Plan mode for non-trivial work." Harness already enforces when invoked. Rule lives in CLAUDE.md workflow pass (TODOS #1). |
| 20 | 🔺 Test-first bug work | **Out of scope** | Part of a separate testing-workflow initiative; not addressed in this walkthrough. |

## While working within a session

| # | Step | Decision | Notes |
|---|------|----------|-------|
| 21 | ● Logical-chunk commits | **Include — rule + CI linter** | CLAUDE.md rule (workflow pass). CI linter consolidates with TODOS #9 (diff-size gate) — extend that gate to per-commit size, not just per-PR. |
| 22 | ● Conventional Commits | **Include — rule + commit-msg hook** | CLAUDE.md rule + commitlint-style hook. Part of the pre-commit framework install (paired with gitleaks, item 11). |
| 23 | 🟦 Co-Authored-By trailer | **No action — harness default** | Claude Code injects the trailer automatically on commits it creates. Intent already met. |
| 24 | 🟦 Checkpoint branch before risky moves | **Subsumed — skip** | PR workflow (items 12, 14, 16) makes every feature branch a named checkpoint. Main is untouchable; dropped work = `git branch -D`. Residual epic-branch case handled by ordinary commits / `git tag`. |
| 25 | 🔺 Triangulation for hard decisions | **Out of scope — future** | Will be subsumed by existing agents' job scopes (architect / skeptic / security agents consulted when decisions touch their domains). No new primitive needed. |
| 26 | 🟦 Read diff before commit | **Subsumed — pre-commit hot-review hook** | Hot-review checklist requires examining the staged diff to answer; read is implicit in the checklist response. |
| 27 | 🔺 Commit review (the L3 half) | **Include — pre-commit hook + checklist** | Hook injects commit-review checklist into any committing agent's context. Checklist TBD (Brooks rewrite, inverted merge-refusal, intent/concinnity/zoom-out — from CLAUDE.md doctrine). Response lands in commit body. Stage 1 of three-review architecture. |
| 28 | 🟦 HANDOFF entry per change | **Rescoped — session-level, not per-commit** | Commit messages (with hot-review output) carry per-commit narrative. HANDOFF.md entries are *per session*: arc, observations, outstanding items, watch-outs. Written by handoff agent at session end. |
| 29 | 🟦 Push review | **Include — new stage** | Pre-push hook runs cumulative L1 suite over commit range + injects push-review checklist to pushing agent + fires one stranger agent for adversarial pass. Design TBD. Stage 2 of three-review architecture. |
| 30 | ● When unsure, commit | **Include — CLAUDE.md rule** | Self-enforcing heuristic: uncertain agent defaults to committing. Free snapshot; squashable later. |

## Ending a session / merging

| # | Step | Decision | Notes |
|---|------|----------|-------|
| 31 | 🟦 PR description quality | **Subsumed — merge-review brief** | Merge-review brief specifies PR description requirements (summary, alternatives, linked ADRs). Merge gate fails if missing. |
| 32 | 🔺 Cold PR review | **Subsumed — merge-review stranger swarm** | This is exactly merge review's L3 layer. No separate item. |
| 33 | 🟦 Human eye before merge | **Subsumed — human merge dashboard** | Delivered via dashboard-style merge brief. Human-reviewed PR label required by gate for non-auto-merges. Part of TODO #14. |
| 34 | 🟦 Risk-class routing | **Subsumed — orchestrator flags** | Risk detection runs; flags surface on human dashboard. No separate gate. Part of TODO #14. |
| 35 | 🟦 Auto-merge for small PRs | **Eliminated** | No auto-merge in the architecture. Every merge is human-decided. Orchestrator dashboard makes small merges trivially fast for the human. |
| 36 | 🔺 Retro | **Include — end of every session** | Not failure-gated. Scale varies (few exchanges → full conversation). Goal: find what from the session could make Cadre better. Prefers tweaks/reframes over blanket rules. |
| 37 | 🔺 Pattern library | **Defer → TODO** | Versioned library for reusable primitives (agents, skills, prompts, hooks, etc). Each primitive has a canonical *current* location; each tweak prepends the old version into the library file. Shape TBD. |
| 38 | 🔺 Weekly archaeology | **Skip** | Retros (item 36) cover adjacent ground. |

## Weekly / monthly rhythms

| # | Step | Decision | Notes |
|---|------|----------|-------|
| 39 | 🔺 Doc-drift check | **Defer → push/merge review tier** | Candidate gate check: the diff can be inspected for drift against README / CLAUDE.md / ADRs at push or merge. Not a standalone cadence. Folded into TODO #14 scope. |
| 40 | 🔺 Plan-before-execute | **Include — broader form as workflow rule** | CLAUDE.md: "non-trivial sessions start in plan mode; approval precedes execution." The narrow refactor-specific case falls out. |
| 41 | 🟦 Worktree prune | **Include — automate at session-end** | `git worktree prune` runs at session-end. Safe by default (only removes entries whose dirs are gone; leaves state intact). |
| 42 | 🟦 HANDOFF archive/rotation | **Defer → handoff agent scope** | Subsumed into TODO #12 (handoff agent lifecycle responsibilities). |

## Recovery playbook (know these cold)

| # | Command / practice | Decision | Notes |
|---|--------------------|----------|-------|
| 43–49, 51 | ● Recovery-playbook commands (diff, staged-diff, log --graph, restore, stash, reset --soft, reset --hard, reflog) | **No action** | Reframed: the orchestrator (main Claude session) runs these. The user doesn't need muscle memory for commands they won't type. Invoked directly as situations arise. |
| 50 | ● `git bisect` | **TODO: cadre bisect** | Orchestrated binary search. User provides range; Cadre runs test, bisects, reports breaking commit. |
| 52 | 🟦 Destructive-git safety | **TODO: destructive-safety hook** | PreToolUse hook on destructive git (reset --hard, force-push, etc.): auto-snapshot via stash or tag before proceeding. |
| — | 🟦 Recovery entry point | **TODO: cadre recover** | User-invoked reflog-based recovery. Surfaces recent HEADs with summaries; restores on confirmation. |

## Execution order (post-approval)

Execution divides cleanly into **day-one actions** (do now) and **seeded TODOs** (land on `TODOS.md` for subsequent worktree-per-item work).

### Day-one actions (sequenced)

Only mechanical work happens today. Anything requiring design review is a TODO.

1. **Rename directory** `C:\Users\duham\Projects\kata_v2\` → `C:\Users\duham\Projects\cadre\`. (All subsequent paths assume the renamed root.)
2. **`git init`** at the renamed directory.
3. **Global git config** — `user.name`, `user.email` (`<redacted>`), `pull.rebase=true`, `init.defaultBranch=main`.
4. **Repo-local `lg` alias** — `git config --local alias.lg "log --oneline --graph --all --decorate"`.
5. **Create `.gitignore`** with one line: `.env*`.
6. **Create `HANDOFF.md`** (empty placeholder).
7. **Create `TODOS.md`** with the seed items (the TODO list in this plan).
8. **Rename "Kata" → "Cadre"** in `CLAUDE.md` (text-only, no doctrine changes).
9. **Root commit** — stage `CLAUDE.md`, `.gitignore`, `HANDOFF.md`, `TODOS.md`; commit with Conventional-Commits-style message. Manually verify no secrets in the staged content (gitleaks not installed yet).
10. **Create GitHub remote** `cadre` (public/private per your choice), push `main`.
11. **Enable partial branch protection** on `main`: require PR, block force-push. ("Require CI green" deferred — no CI workflow exists yet; see TODO.)
12. **Enable merge queue** on `main` (free hedge for future parallel-session case).

Deferred to TODOs (each requires design review):

- Pre-commit framework install + gitleaks + commitlint configs
- Base CI workflow file (`.github/workflows/ci.yml`)
- Enabling "require CI green" on branch protection once CI exists

### TODOs seeded onto `TODOS.md`

The 23 seed items are the canonical list in the "Emergent artifact: `TODOS.md`" section above. They transfer verbatim into `TODOS.md` during execution (step 7 of the day-one actions). TODO #15's rich context is in Appendix A.

### CLAUDE.md workflow-section content (captured for TODO #1)

When TODO #1 is picked up, the workflow section should encode these decisions made during this walkthrough.

**Workflow rules (concise):**

- Worktree convention: sibling directory `C:\Users\duham\Projects\cadre.worktrees\<branch>`; **per feature/task**, reused across sessions until the branch merges.
- `.git/info/exclude` is the right place for personal ignores (not `.gitignore`).
- Plan mode precedes every non-trivial execution session; approval gates implementation.
- Conventional Commits enforced by commit-msg hook.
- When unsure whether to commit or keep going, commit.
- Three-review vocabulary: commit review / push review / merge review; book metaphor (sentence / page / chapter); hot/cold vocabulary retired.
- Retros end-of-session, non-failure-gated.

**Iron law: every agent has (input schema) → (output artifact).** Structural requirement (not a convention) for every agent in Cadre:

- Declared **input schema** — what data the agent expects to read or receive.
- Declared **output artifact** — a structured, durable file (or piece thereof) the agent produces.
- Declared **file footprint** — which paths the agent reads and writes. Anything outside is a bug.

Applies to every agent named or implied in this project: handoff maintainer, taskboard runner, wiki/ADR fetcher, push-review stranger, merge-review reviewers, risk detector, etc. Every agent-building TODO must include explicit input/output schemas. This is the v1 failure-mode antidote — agents without artifact structure drift into undocumented side effects, produce correlated but invisible errors, and can't be composed or audited.

**File hygiene (first-class architectural concern).**

*Context.* This is the third attempt at this harness. Prior attempts blew up in part because: (1) agents had no artifact structure; (2) git workflow was hacked together; (3) file bloat made `.gitignore` reactive, secrets harder to contain, navigation degraded. These failure modes reinforce each other. File hygiene is not cosmetic — it is load-bearing.

*Three-tier namespace:*

```
<repo root>/
├── CLAUDE.md             # doctrine, human-facing, Claude-auto-loaded
├── HANDOFF.md            # session log, human-facing
├── TODOS.md              # task board, human + agent-facing
├── .env                  # the only place secrets live (gitignored)
├── .gitignore            # minimal (.env* + real artifacts only)
├── .cadre/               # Cadre infrastructure namespace (contents emerge)
└── <project source>/     # product code, namespace TBD at stack choice
```

The three tiers (human-facing root, Cadre infra namespace, product source namespace) are the load-bearing boundary. Everything inside `.cadre/` is deliberately left unspecified.

*Disciplines:*

1. **Namespace boundary** — root holds exactly three human-facing files (CLAUDE.md, HANDOFF.md, TODOS.md) plus `.env` / `.gitignore` / `.cadre/`. Product source is its own namespace. No Cadre infra files at root.
2. **`.cadre/` contents emerge** — subfolders created by whatever agent or infrastructure needs them, at the moment of need. No anticipation folders. Any subfolder justifies its name by what's in it.
3. **Modularity in agent specs, not folder layout** — every agent declares its file footprint (read/write paths). The folder taxonomy inside `.cadre/` emerges from the fleet; the fleet does not conform to a pre-existing taxonomy.
4. **Re-organize reactively** — only when patterns demonstrably emerge across multiple subfolders does a grouping convention earn its place. Until then, no reshuffling.
5. **Naming** — deterministic, greppable.
6. **Secrets** — exactly `.env` / `.env.*`. Nothing else holds secrets. `.gitignore` stays narrow.
7. **Lifecycle** — every artifact type, at the time its folder is created, has a documented retention policy (even if it's "keep forever").
8. **Agent file footprint** — every agent spec declares read/write paths. Outside that footprint = bug.
9. **Pruning is first-class** — owned by an agent or scheduled task, never manual cleanup.

## Verification

After execution:

1. **`git status`** from `C:\Users\duham\Projects\cadre\` — shows clean working tree (only the initial commit).
2. **`git log`** — one commit, scaffold message, Conventional Commits format.
3. **`git config --get user.name` / `user.email` / `pull.rebase` / `init.defaultBranch`** — returns expected values.
4. **`git lg`** (repo-local alias) — renders the graph.
5. **`cat .gitignore`** — one line, `.env*`.
6. **File presence** — `CLAUDE.md`, `HANDOFF.md`, `TODOS.md` at root; nothing else at root except `.gitignore` (and `.env` if it exists).
7. **Remote round-trip** — `git push` succeeds; GitHub shows main branch.
8. **Branch protection sanity (partial)** — attempt a direct push to main from a dummy branch without PR; expect rejection. Attempt a force-push; expect rejection. (CI-green requirement is deferred to TODO #23 and will not be in place yet.)
9. **Merge queue enabled** — visible in GitHub repo settings.
10. **TODOS.md** — contains the 23 seed items with their context intact.
11. **CLAUDE.md** — "Kata" references replaced with "Cadre"; no doctrine changes otherwise.

## Appendix A — TODO #15 rich context (engram revival)

The conversation transcript that produced the engram-revival TODO. Transfers verbatim into TODOS.md on execution (step 7 of day-one actions). Preserved here so the TODO's motivation and constraints aren't lost when the task-board agent eventually compresses the item to a one-liner.

**Conversation transcript — from the `.cadre/` subfolder-taxonomy correction through the meta-diagnosis:**

> **User:** I'm fine designing this now but just know we need to build this for modularity - that p word you kept using applies as well. Idk what we will need eventually as far as file architecture but it needs to be robust enough that things can be added on without breaking. For example - I feel as if the root files have good architecture but that you are bounding the space early by listing folders inside .cadre/ too specifically. What's the diff between logs and reviews? Shouldn't reviews be in logs? Etc. Those questions are rhetorical - but it's a convo we can have

> **Claude:** [Revised `.cadre/` to principle-based — "contents emerge" — rather than prescribed taxonomy. Briefly contrasted logs (time-indexed, append-only) vs reviews (ID-indexed, durable).]

> **User:** You still aren't quite getting it. See your answer - to me that is still inventing taxonomy. Isn't it ok to say here - we don't know yet? Rushing to invent taxonomy restricts the decision space and stifles creativity and clouds true concinnity. Stop

> **Claude:** [Acknowledged and over-corrected with a blanket ban on folder paths / schemas / assignments / structured sections — itself preemptive bounding.]

> **User:** This is a bit meta but - do you see how your response just then was itself a preemptive decision space bounding? Why make a blanket rule that "No folder paths, no file schemas, no agent assignments, no structured sections. Those are design, and design is a later phase" - we have already designed quite a bit and it's been helpful from my perspective. Do you see what I'm saying?

> **Claude:** [Yes. Named the meta-pattern: swung from inventing taxonomy to banning design detail — same failure mode, opposite sign. Acknowledged useful design has already happened.]

> **User:** I do believe you captured the essence of the problem accurately there, but would like to push slightly that I think the problem is a symptom. Of what - IDK. However, I would like you to suggest potential solutions to discourage these early boundings in the future and try to accurately diagnose the actual problem if you can. I'm hesitant to just drop a line in your md file but that may be a temp hack solution. Anyway - what do you think?

> **Claude:** [Diagnosis: weak proprioception of level + training pressure toward helpful completeness + heuristic substitution + scope-of-thought vs scope-of-answer confusion + disincentive against "I don't know." Load-bearing cause: weak proprioception. Proposed interventions: procedural habit (label level before answering), user-side level tags, external prosthetic (hook), adversarial self-check, CLAUDE.md rule (called out as temp hack).]

> **User:** You know - I just realized I tried a huge feature in my v2 harness and it was actually all about stopping this stuff. It was called engram. Each engram was a YAML object - a rule:, rationale:, and examples: - and they were meant to bridge the gap between memories and hooks. Basically to stop stuff like this - inject the engram preresponse to remind claude at the attention point. Idea centered around context priority and reminding. But the implementation was sloppy - I used a semantic hash to fuzzy match user intention and it didn't trigger reliably. Kinda cool though. Anyway - I bring this up to say. This is a big issue and I'd like to solve it. The end result is that I feel like you're steering me - I can't solve problems and design at a high level when you're yanking me around corners with taxonomies and early bounding etc. I think the possible solution may be a claude md addition and a preresponse hook that reminds you not to do this every single turn. Because it does happen a lot. You know, it's a fine line between helping and hurting in the idea generation space I guess. I need you to just work more as a collaborator who helps generate ideas. Maybe I'm asking too much

> **Claude:** [Engram intent was right; failure was the trigger mechanism (semantic hash fuzzy match) not the architecture. Unconditional fire-every-turn is less sophisticated but more reliable. User's real cost: premature bounding colonizes their idea space — they feel steered, can't design at a high level. Two-layer fix: immediate posture shift (fewer "recommendations," more flat options, probes over prescriptions) + durable engram revival. Observation: this is Cadre dogfooding — the engram feature is Cadre-proper, not just a fix for this conversation.]

> **User (second symptom named):** Another symptom I notice is the 1-2 exchange. I say something, you say here's a giant bloat creating response that likely drives us off a cliff. I want more 1-2-3-4-5 exchange. I say something, you propose and add to pass back to me, I add, you add, I say we're good. Not as a blanket rule but would like to move more towards that from what we had the last few minutes.

**Scope of this TODO (high-level, design TBD):**

- Revive the engram concept — YAML rule/rationale/examples, preresponse injection.
- Trigger mechanism: lean unconditional over semantic-match. Reliability > precision.
- Target failure modes include: premature decision-space bounding, over-specification, 1-2 exchange patterns (response bloat), steering vs collaborating.
- This is Cadre-proper infrastructure, not a local fix.
