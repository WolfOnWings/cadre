# Cadre TODOs

Forward-looking task board. Eventually owned by a dedicated taskboard runner agent (TODO #3). For now, maintained by hand during execution.

Source: bootstrap walkthrough plan at `C:\Users\duham\.claude\plans\let-s-start-with-1-peppy-kernighan.md` (2026-04-22).

---

## 1. Populate CLAUDE.md workflow section

**Status: DONE (2026-04-22).** Workflow section appended to CLAUDE.md with L2 (grounded) citations. Three subsections landed: Git and review architecture, Agent architecture, Working with me. Sourcing drawn from isolated research brief at `.cadre/citations/2026-04-22-workflow.md`. Five items marked Cadre-original (sentence/page/chapter ladder, base-3 recursive retro, emerge-as-needed `.cadre/` policy, 0-10 yanking scale, assistant-maintained tab stack). Unverified 2026 citations passed through without live verification — audit-later candidates noted in handoff.

---

Encode the decisions made during the bootstrap walkthrough into CLAUDE.md.

**Workflow rules (concise):**
- Worktree convention: sibling directory `C:\Users\duham\Projects\cadre.worktrees\<branch>`; per feature/task, reused across sessions until the branch merges.
- `.git/info/exclude` is the right place for personal ignores (not `.gitignore`).
- Plan mode precedes every non-trivial execution session; approval gates implementation.
- Conventional Commits enforced by commit-msg hook (once installed — TODO #21).
- When unsure whether to commit or keep going, commit.
- Three-review vocabulary: commit review / push review / merge review; book metaphor (sentence / page / chapter); hot/cold vocabulary retired.
- Retros end-of-session, non-failure-gated.
- **Defer and TBD are achievements, not failures.** The *level of resolution* matters as much as resolution. If the right answer is "we don't know yet" or "this is blocked on X," capture that and move on — don't force premature closure.

**Iron law: every agent has (input schema) → (output artifact).** Structural requirement for every agent in Cadre:
- Declared input schema (what it reads/receives).
- Declared output artifact (a structured, durable file or piece thereof).
- Declared file footprint (which paths it reads and writes). Outside that = bug.

Applies to every agent in the project. Every agent-building TODO must include explicit input/output schemas.

**File hygiene (first-class architectural concern).** Third attempt at this harness; prior attempts blew up partly on file-hygiene decay. Three-tier namespace:
- Root: `CLAUDE.md`, `HANDOFF.md`, `TODOS.md` (human-facing), plus `.env` / `.gitignore` / `.cadre/`.
- `.cadre/` = Cadre infrastructure namespace (contents emerge — no prescribed taxonomy).
- Product source: its own namespace, TBD at stack choice.

**Disciplines:**
1. Namespace boundary — root holds exactly three human-facing files plus `.env` / `.gitignore` / `.cadre/`. No infra files at root.
2. `.cadre/` contents emerge — subfolders created at moment of need. No anticipation folders.
3. Modularity in agent specs, not folder layout — agent file footprint declares read/write paths.
4. Re-organize reactively — only when patterns demonstrably emerge does a grouping earn its place.
5. Naming — deterministic, greppable.
6. Secrets — exactly `.env` / `.env.*`. Nothing else holds secrets. `.gitignore` stays narrow.
7. Lifecycle — every artifact type has a documented retention policy at creation (even if "keep forever").
8. Agent file footprint declares read/write paths. Outside = bug.
9. Pruning is first-class — owned by an agent or scheduled task, never manual cleanup.

---

## 2. Write HANDOFF.md header + entry template

Define the append-only format and the entry template shape. HANDOFF.md itself was created empty during bootstrap. Template needs to support the handoff agent (TODO #12) — live mutation during session, stamped at session end.

---

## 3. Build the taskboard runner agent that owns TODOS.md

First infrastructural agent, because every other agent's work routes *through* the task board. Build order: this → handoff maintainer (TODO #12) → the rest.

Input: task-board file, user/agent updates. Output: maintained TODOS.md with compression / aging / deduplication over time. Must include explicit (input schema) → (output artifact) contract per the iron law.

---

## 4. Create `decisions/` + `decisions/0000-template.md` when first real ADR is being written

Not today — parsimony. ADR template is shape-without-substance until a real ADR is being written. Activates at the first real ADR.

---

## 5. Wire formatter + linter + fast-test subset into pre-commit once stack is chosen

Activates the moment the runtime/stack is chosen. Complements TODO #21's base framework install.

---

## 6. CI layer — type checking

Cadence: week 1 after stack lands. Activates after TODO #22 (base CI workflow) exists.

## 7. CI layer — secret scanning in CI

Cadence: week 2. Complements the local gitleaks hook from TODO #21.

## 8. CI layer — dependency audit

Cadence: week 3.

## 9. CI layer — diff-size gate, per-commit AND per-PR

Cadence: week 4. Extended from source-list item 21 (logical-chunk commits) — gate enforces both per-commit and per-PR sizes.

## 10. CI layer — coverage threshold

Cadence: week 5.

---

## 11. Rollback drill on non-trivial history

Deliberate bad commit → `git reset --hard` → reflog recovery. Fire when there's non-trivial history to feel real; drills on a root commit alone are too artificial.

---

## 12. Build the handoff maintainer agent

Runs fully autonomous in the background. Contract:
- **Live mutation during session** — entry is updated continuously as in-session actions occur (not just at session end).
- **Session-end stamp** — the live entry is sealed into the final record at session end.
- **Session-start surfacing** — relevant prior handoff content is surfaced into new sessions automatically.
- **Lifecycle/archive** — handles aging of old entries (no manual prune; archive, don't delete).
- **User never has to prompt it.** No "update the handoff" or "read the handoff" requests should ever be needed.
- Per-commit narrative lives in commit messages (via the commit-review gate), not in handoff. Handoff is session-level.

Explicit (input schema) → (output artifact) contract required per the iron law.

---

## 13. Investigation — ADR architecture and Karpathy-style project wiki overlap

Both ADRs and a Karpathy-style wiki are structured project self-knowledge surfaced selectively to LLM sessions. Pre-deciding ADR logic in isolation risks the wrong shape.

Decide: do they coexist? Is one a subset of the other? What's the unified shape? This investigation precedes building the ADR agent / wiki fetcher. Output: an ADR (fittingly) capturing the decision.

---

## 14. Design the three-review architecture in detail

**Deliverables:**
- Agent-facing review briefs (one per stage) — scope (book metaphor), pass/fail criteria, examples, sizing judgment. Location TBD during design.
- **Human-facing merge dashboard** — distinct artifact, 10–20 lines (chapter summary / intent served / swarm verdict / risk flags / unresolved questions / human action line). Skimmable in 20–30s. Produced by the merge orchestrator from synthesis of CI, swarm, risk detection, PR description.
- Gate hooks (pre-commit, pre-push, merge gate) that inject each agent-facing brief just-in-time.
- Stranger-agent subagent (push review) and stranger-swarm (merge review) implementations.
- **Merge orchestrator** is the main Claude session (not a separate agent) — synthesizes CI + swarm + risk flags + PR description → produces human dashboard. No auto-merge; human is always the decision-maker.
- Risk-class detection: file-path / diff-size / AST pattern matchers for schema migrations, auth, payments, public API, etc. Outputs go to orchestrator as flags.

**Architecture context (settled during the bootstrap walkthrough, carried forward):**

*Three review stages.* Each stage is a structurally identical L1+L3 bundle with escalating weight and reviewer topology:

| Stage | Gate | Scope (book metaphor) | L1 surface | L3 surface | Reviewer count | Decision-maker |
|-------|------|----------------------|------------|------------|----------------|-----------------|
| Commit review | pre-commit hook | Sentence — one coherent thought | Lint / type / fast test / gitleaks on one commit | Commit-review brief injected into committing agent | 1 (self) | Gate |
| Push review | pre-push hook | Page — coherent paragraph(s) | Cumulative lint / type / test over commit range | Push-review brief injected into pushing agent + 1 stranger agent adversarial pass | 2 (self + stranger) | Gate |
| Merge review | CI + PR gate + orchestrator | Chapter — complete arc | Full CI suite + risk-class detection | Stranger swarm with distinct framings + merge orchestrator synthesizes all signals into the human dashboard | N (swarm) + orchestrator | Human, always |

*Merge review flow:* CI runs → stranger swarm runs → L1 risk detection runs → merge orchestrator (main Claude session) synthesizes → human dashboard → human decides. No auto-merge. No bypass.

*Trust hierarchy:* L1/L2/L3 is orthogonal to reviewer count; each stage fuses L1 and L3, with L2 grounding inside the L3 briefs.

*Self-audit framing:* the prompt at any stage is inverted ("what would make me refuse to merge this?") to counteract self-preference bias (Panickssery et al.).

*Sizing (book metaphor, no line-count gates):* commit = sentence, push = page, merge = chapter. Coherence, not length, is the judgment criterion. A 100-line rename is still one sentence. Sizing logic lives inside each stage's review brief.

*Gate discipline:* gates are unconditional — they always fire on their anchored git operation. Agents do not decide whether to invoke a gate; they attempt the operation and the gate decides pass/fail.

*Context economy:* review briefs are delivered just-in-time by each hook into the acting agent's context at the moment of the gate. Not preloaded, not memorized.

*Frequency model (flow / trickle / drip):* review-stage weight tracks git-event frequency. Commit = flow (many per hour → light gate). Push = trickle (few per day → medium gate). Merge = drip (rare, intentional → heavy gate affordable).

*Merge review as multi-stage artifact flow* — the review IS the artifact:

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

*Consensus + vote mechanism is deferred* pending the user's agent-voting paper. Recorded as a boundary; implementation waits on that work.

---

## 15. Engram revival

Preresponse attention-point reminders (YAML `rule:` / `rationale:` / `examples:`, injected unconditionally). Target failure modes: premature decision-space bounding, over-specification, response bloat (1-2 exchange anti-pattern), steering-vs-collaborating. Cadre-proper infrastructure, not a local fix.

**Rich context (conversation transcript that produced this TODO — from the `.cadre/` subfolder-taxonomy correction through the meta-diagnosis):**

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

**Scope (high-level, design TBD):**
- Revive the engram concept — YAML rule/rationale/examples, preresponse injection.
- Trigger mechanism: lean unconditional over semantic-match. Reliability > precision.
- Target failure modes: premature decision-space bounding, over-specification, 1-2 exchange patterns, steering vs collaborating.
- Cadre-proper infrastructure, not a local fix.

---

## 16. CLAUDE.md addition for premature-bounding / response-bloat failure modes

**Status: DONE (2026-04-22).** Absorbed into TODO #1's workflow-section writeout. "Corrections stay at earned scope," "Exchange rhythm," and "Don't pre-invent taxonomy" items in the Working-with-me subsection cover the premature-bounding and response-bloat failure modes as a temp hack ahead of the engram revival (TODO #15).

---

Temp hack ahead of the engram revival (TODO #15). Content and placement TBD.

---

## 17. Pattern library

Versioned library for reusable primitives (agents, skills, prompts, hooks). Each primitive has a canonical *current* location; each tweak prepends the old version into the library file (so the file IS the progress chart). Shape TBD.

---

## 18. `cadre bisect` — orchestrated git bisect runner

User provides a time or commit range. Orchestrator runs a test command, drives the binary search, reports the breaking commit.

---

## 19. Destructive-git safety hook

PreToolUse hook on destructive git operations (`reset --hard`, `push --force`, etc.) that auto-snapshots via `git stash` or a safety tag before the operation proceeds. Invisible recoverability.

---

## 20. `cadre recover` — reflog-based recovery entry point

User invokes; orchestrator surfaces recent HEAD positions with summaries; restores on user confirmation.

---

## 21. Pre-commit framework + hooks install

Design and install the pre-commit framework (choice of tool: `pre-commit` vs husky vs lefthook), configure gitleaks (secret scanning) and commitlint (Conventional Commits enforcement). Base install only; formatter/linter/test hooks come from TODO #5 once stack is chosen.

**Design review required.**

---

## 22. Base CI workflow

Design `.github/workflows/ci.yml`. Runner choice (`ubuntu-latest`?), triggers, base structure. Individual checks layer in via TODOs #6–10.

**Design review required.**

---

## 23. Enable "require CI green" on branch protection

Once TODO #22 exists and is green on a test PR, add the required-check rule to branch protection on main.

---

## 24. Enable merge queue on main

Blocked on TODO #23. GitHub requires "Require status checks to pass" to be enabled on the branch before merge queue can be configured. Activate simultaneously with TODO #23.

---

## 25. Recursive retro architecture (base-3)

One retro template, applied at every altitude. Abstraction carried by input compression, not prompt engineering. Same questions, different scale.

**Structure:**
- L0 — session handoffs (every session) + ADR log (continuous, per decision). Raw ground truth.
- L1 retro — every 3 sessions. Input: 3 handoffs + ADRs from those sessions.
- L2 retro — every 3 L1s. Input: 3 L1 retros only.
- L3 retro — every 3 L2s. Input: 3 L2 retros only.
- Ln retro — every 3 L(n-1)s. Input: 3 L(n-1) retros only.

Each level sees only the level directly below it. CLAUDE.md is shared context at every level as the alignment anchor. Every retro produces an artifact that becomes input for the next level up. Claims cite the retros that support them — citation chain goes all the way back to raw handoffs.

**Why this shape:**
- Scale-invariance aligns with CLAUDE.md's state-space doctrine — same cognitive operation at different scopes.
- Abstraction emerges from input compression, not altitude-specific prompting. Single template, input-agnostic.
- Base-3 is principled: 3 is the minimum for triangulation (two points make a line, three make a pattern); 3³ = 27 sessions before a single L3, which makes L3s rare enough to be profound but frequent enough to matter.
- Citation chain = L2-trust grounding preserved through compression. A high-altitude claim has receipts all the way down.

**Design dimensions (TBD during this TODO):**

- **The retro template itself** — the set of scale-invariant questions. Needs to work at both session-retro and L5+ altitude. Candidates: *what patterns recurred*, *what worked that wasn't obvious*, *where did we drift from intent*, *what to change at this altitude*. Must be input-agnostic prose that doesn't assume the scope.
- **Trigger mechanism** — mod-3 check. Session-end ritual checks whether we're at a 3-session boundary → runs L1; third L1 triggers L2; etc. Probably a hook + a counter somewhere.
- **Storage shape** — retro artifacts land under `.cadre/` (contents emerge). Immutable after write because the citation chain depends on them. Naming/folder structure emerges when real artifacts appear.
- **Retro-runner agent** — one agent, input-agnostic: "here are 3 level-N artifacts + CLAUDE.md, produce a level-(N+1) artifact in the standard shape." Classic (input schema) → (output artifact) contract per the iron law.
- **CLAUDE.md injection at every level** — main session has it ambient; subagent retro-runner needs it explicitly injected via the agent's brief.
- **Citation format** — how does an L3 retro reference the L2s it synthesizes? Simple `[retro-L2-YYYY-QN]` style or something richer? TBD.
- **Interaction with the master ADR log** — ADRs and handoffs are both L0. Does the master ADR log sit alongside handoffs, or is it derived from them? (Related to TODO #13 — ADR/Karpathy-wiki investigation.)

**Open dependencies:** TODO #13 (ADR architecture) overlaps on the ADR-log side. TODO #12 (handoff agent) owns the L0 layer. This TODO is the L1+ structure on top.


---

## 28. `.claude/` Reddit-style restructure (deferred from PR #4)

Adopt the structured `.claude/` layout from the Reddit post: `CLAUDE.md` + `.claude/{rules, hooks, commands, skills, agents}/` plus `*.local` siblings for personal vs team config. CLAUDE.md becomes terser; specialized guidance migrates to `rules/`. Possible namespace cleanup: `cadre/references/` → `.cadre/references/` for one canonical namespace (or split into its own PR).

**Surfaced 2026-04-26.** Original scope of PR #4 (the tracked-state refactor) included this work, but Brooks reflection during plan-cadre identified the restructure as anticipatory polish, not load-bearing. Split off into this TODO for separate handling when felt-need warrants — folder rot, scaling pressure, or specific guidance that wants its own home in `rules/`.

**Open dependencies:** none. Buildable any time post-PR #4 (now merged).

---

## 27. The Playbook — canonical-state mirroring across worktrees

**Status: DONE — superseded (2026-04-26).** Initial design (bidirectional sync hook + JSON config + worktree-init script) committed on `feat/playbook-cadre` (commit `1345135`) but never merged. Architecture pivoted via plan-cadre to **plain tracking** of `.cadre/` and `CLAUDE.md` (PR #4, merged as `8570e36`); CC native worktree primitives (`claude --worktree`) replace the custom shell wrapper. The "playbook" concept itself dissolves — there is no playbook in the new architecture. Full reasoning in `.cadre/plans/what-di-you-think-floofy-rose.md` and ADRs 063 / 064 / 065 / 067.

---

## 26. Refactor plan-cadre Step 9 into a post-ExitPlanMode hook

A hook on ExitPlanMode would be a cleaner architecture for the persistence — the orchestrator can't always be relied on to remember Step 9 (compaction, context drift). Once Cadre's hook infrastructure is real (TS-on-Bun ready, hook events verified), the persist-to-`.cadre/plans/` move could become an automatic post-exit hook rather than a step the orchestrator has to execute. For now, Step 9 covers it; refactor later.

**Open dependencies:** TODO #21 (pre-commit framework + hooks install) for the underlying hook infrastructure. Verify ExitPlanMode (or equivalent post-plan-mode event) is a real harness hook event before scoping the refactor.
