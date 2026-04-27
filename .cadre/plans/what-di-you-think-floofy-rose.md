# Plan: Worktree ergonomics + .claude/ restructure

*Slug: what-di-you-think-floofy-rose. Originally scoped to playbook simplification; widened during plan-cadre intent capture (2026-04-26) to a unified rework covering `.claude/` structure and end-to-end worktree ergonomics.*

## Intent

> Feels like I open terminal and start a new worktree with the `*/cadre claude --worktree` flag command. Then the worktree spins up and comes complete with the context playbook. I don't have to trigger anything beyond starting the worktree. Our `.claude` is nicely structured and logical for you. Any edits to the todos persist in a permanent way, both main and any worktrees are able to look to a canonical source — maybe that should be the convention for all the playbook files? Just want everything seamless for our proposed git workflow.

**Distilled load-bearing properties:**
1. **One command, one action.** `cadre claude --worktree <name>` (or equivalent): worktree created, context populated, Claude session started — no further manual steps.
2. **Permanent persistence for operational state edits.** Edits to todos / playbook files don't die in a feature worktree.
3. **Single canonical source for playbook files.** Main and worktrees all look to the same place. (User's open question: extend this convention to ALL playbook files.)
4. **`.claude/` is logically structured for the orchestrator** — legibility, scalability, no rot.
5. **Seamless** for the git/worktree workflow as a whole.

---

## Should

### State location axis: **A — Canonical at main** (lean, swapped from C)

Playbook files live in main's working tree (current locations: `CLAUDE.md`, `.cadre/handoff.md`, `.cadre/todos.md`, `.cadre/logs/ADR/decision-log.md`). New worktrees get fresh copies via Claude Code's native `.worktreeinclude` mechanism (no custom init script needed).

**Why swapped from C:** With CC native handling worktree creation + file copy, option A becomes radically simpler than it had been. There's no longer a maintenance burden justifying the external-store decoupling. Everything stays under `Projects/cadre/`, mental model is simpler, and `cadre/playbook.json` collapses into `.worktreeinclude`.

**User's revised rationale:** "abandon the canonical location of playbook and just keep it in main because worktreeinclude and just include 'playbook'."

**Tracking sub-decision: A-track-all** (locked, user upgraded from A-track 2026-04-26).

Un-gitignore all of `.cadre/` and `CLAUDE.md`. The entire operational state becomes tracked: handoff, todos, ADR log, drafts, research briefs, plans, citations, archived handoffs, hook logs. Edits flow via standard git merge. The architecture collapses to plain git — no doctrine layer, no `.worktreeinclude` for any of this, no SCRATCH.md, no init scripts, no `cadre/playbook.json`, no playbook concept at all.

**`.gitignore` after this:** `.env*` only. Everything else in `.cadre/` and CLAUDE.md becomes part of the public lab-notebook.

**SCRATCH.md status:** unnecessary. Branch-local thinking lives in commits and PR descriptions.

**CLAUDE.md auto-load wrinkle:** dissolves. CLAUDE.md is tracked, present in every worktree via standard git checkout.

**Pre-tracking scrub:** before un-gitignoring, the current `.cadre/` contents should be scanned for anything genuinely sensitive. Quick architect-phase pass; almost certainly nothing problematic, but cheap to verify.

## Parked (tracking sub-decision)

- **A-track (subset)** — *parked: user upgraded to A-track-all for "single rule, nothing to think about" simplicity.* Steel-man on record: keeps drafts/research private until they're shaped enough to publish; less commitment if anything in those subdirs ever needed to stay private.
- **A-doctrine** — *parked: orchestrator-discipline solution is more moving pieces than tracking now that public-tracking is acceptable.* Steel-man on record: full privacy preserved if any operational state ever needed to be sensitive.

### `.claude/` structure axis: **D — Reddit-style restructure** (lean)

Adopt the post's layout: `CLAUDE.md` + `.claude/{rules, hooks, commands, skills, agents}/` plus the team-vs-personal split via `*.local` siblings. Moves toward the structured cadence proactively.

**User's rationale:** Direct fit with intent property #4 — "`.claude` is nicely structured and logical for you."

## Parked (state location)

- **A. Init-only with write-to-main doctrine** — *parked: discipline-based; user prefers mechanical "everything points to one location."* Steel-man on record: simplest mechanism, no Windows symlink concern, no out-of-repo path decision, just doctrine.
- **B. Symlinks** — *parked: Windows symlink fragility (Developer Mode requirement) creates friction the user wants absent from "seamless."* Steel-man on record: zero discipline; filesystem enforces the rule, orchestrator can never accidentally diverge state.

## Parked (`.claude/` structure)

- **E. Defer / YAGNI** — *parked: user's intent explicitly calls for structured legibility now; deferred restructure would carry forward as latent friction.* Steel-man on record: zero setup cost, only two dirs today, anticipatory rather than need-driven.

### Ergonomic delivery axis: **H — CC native primitives** (lean, supersedes F/G)

User redirect: investigate Claude Code's built-in worktree feature before building custom. claude-code-guide reports the harness ships:

- `claude --worktree <name>` (or `-w`) — creates worktree at `.claude/worktrees/<name>/`, branches as `worktree-<name>`, copies gitignored files per `.worktreeinclude`, launches session, auto-cleans up on exit if no changes. If name omitted, auto-generates random name (e.g., "bright-running-fox").
- `.worktreeinclude` — gitignore-syntax file at project root. Lists gitignored files to copy into new worktrees. **This is literally the init-script functionality we were planning to build.**
- `WorktreeCreate` / `WorktreeRemove` hooks — real harness events for custom setup/teardown logic beyond file copy.
- Slash form — orchestrator can spawn worktrees mid-session via natural language.
- Subagent worktree isolation — `isolation: worktree` frontmatter for clean subagent runs.

**F (custom shell command) and G (auto-healing SessionStart hook) collapse — neither needs custom build.** F is supplanted by the native command; G is supplanted by `.worktreeinclude` + optional `WorktreeCreate` hook.

**Layering against option C (external store):**
- `.worktreeinclude` lists `CLAUDE.md` (and any other file that benefits from worktree-local presence). CC copies natively at creation, resolving sub-decision C-3.
- Operational state files (handoff, todos, ADR log, decision log) live at `~/.cadre/<project>/state/` and are accessed by the orchestrator via absolute path. No worktree-local copies.
- `WorktreeCreate` hook reserved for any extra setup beyond file copy.

**Doctrine divergence to resolve:** CC native uses `.claude/worktrees/<name>/` (inside project). Current Cadre CLAUDE.md doctrine says sibling `cadre.worktrees/<branch>/`. Adopting native means CLAUDE.md updates to reflect the new path convention.

## Parked (ergonomic delivery)

- **F. Custom shell command** — *parked: CC native already does this.* Steel-man on record: customization beyond what `claude --worktree` provides.
- **G. Auto-healing SessionStart hook** — *parked: `.worktreeinclude` + `WorktreeCreate` already handle init.* Steel-man on record: covers manual/forgotten flows where someone runs `claude` outside the native command path.

## Will

Split into two PRs per Brooks reflection. PR #1 is the load-bearing simplification; PR #2 is the anticipatory restructure (deferred).

### PR #1 — Load-bearing simplification (current `feat/playbook-cadre` branch, amended)

1. **Pre-tracking scrub.** Scan current `.cadre/` content for anything genuinely sensitive before un-gitignoring. Cheap insurance.
2. **Un-gitignore everything operational.** `.cadre/` and `CLAUDE.md` become tracked. Only `.env*` stays gitignored.
3. **Delete the bidirectional sync infrastructure.** All four files from commit `1345135` removed: `cadre/playbook.json`, `.claude/hooks/playbook-sync-cadre.ts`, `.claude/hooks/worktree-init-cadre.ts`, `.claude/settings.json`.
4. **Adopt CC native worktree primitives.** `claude --worktree <name>` is the spawn command. Worktrees live at `.claude/worktrees/<name>/`.
5. **Update CLAUDE.md doctrine** to reflect: new worktree convention (CC native + path), operational state is tracked (no playbook concept survives).
6. **Branch rename** (architect picks honest name; `feat/playbook-cadre` is now misleading). Force-push amend per earlier decision.
7. **CC native verification** — 60-second sanity check that `claude --worktree foo` behaves as docs describe before committing the architecture to it.

### PR #2 — Anticipatory restructure (separate, after PR #1 lands)

1. **`.claude/` Reddit-style restructure.** Create `rules/`, `hooks/`, `commands/`, `agents/` (skills/ already exists).
2. **`*.local` convention** for personal vs team config.
3. **CLAUDE.md becomes terser**; specialized guidance migrates to `rules/`.
4. **Possible namespace cleanup:** `.cadre/references/` → `.cadre/references/` for one canonical namespace (or split into its own PR if scope warrants).

**Last Responsible Moment check:** deciding now because we need to ship something coherent. PR #1 is genuinely load-bearing; PR #2 is anticipatory and could even be deferred indefinitely if the team-vs-personal split never bites. No axis benefits from longer optionality on PR #1's content.

## Brooks Reflection

Five candidate shifts surfaced; one resulted in a meaningful Will adjustment.

1. **Scope split (Will-level shift, applied):** un-gitignore + native worktrees ships as PR #1; `.claude/` restructure ships as PR #2 or later. Cleaner historical artifact, smaller blast radius per PR, easier to revert if anything goes wrong.
2. **Branch identity (deferred to architect):** `feat/playbook-cadre` is now misleading (playbook concept is being deleted). Architect phase picks an honest name.
3. **CC native verification (deferred to architect):** docs-based research; live sanity check is cheap and catches any drift.
4. **Two `cadre/` namespaces (deferred to PR #2 or its own PR):** `.cadre/references/` + `.cadre/` both tracked but doing different things. Cleanup opportunity, not load-bearing.
5. **Pre-tracking scrub (folded into PR #1 as step 1):** explicit step to scan `.cadre/` before un-gitignoring.

**No further loop-back to Could/Should.** Reflection confirms the high-level shape; the split is a Will refinement, not a re-opening.

## Action Plan (PR #1 — crystal-clear)

### Phase A: Verify & scrub (cheap pre-checks, ~10 min)

**A1. Live-test CC native worktree.** From the main worktree (`C:\Users\duham\Projects\cadre`):
- Run: `claude --worktree test-cadre-native`
- Confirm: CC creates `.claude/worktrees/test-cadre-native/`, branches as `worktree-test-cadre-native`, launches a new session.
- In the test session: `pwd`, `git branch --show-current`, verify expected location and branch name.
- Exit the test session. CC should auto-clean (no changes were made).
- From main: `git worktree list` — confirm `test-cadre-native` is gone.
- Document any drift from the docs-based report.

**A2. Scrub `.cadre/` for sensitive content.**
- Inventory: list every file in `.cadre/` (Glob pattern `.cadre/**/*`).
- Skim each by category:
  - `handoff.md`, `todos.md`, `handoffs/`, `logs/ADR/decision-log.md` — doctrine/lab-notebook (expected fine).
  - `drafts/`, `research/`, `citations/`, `plans/` — read each for credentials, unredacted PII, embarrassing third-party content.
- Pass criterion: nothing problematic.

### Phase B: Reset `feat/playbook-cadre` to main

In the feature worktree at `C:\Users\duham\Projects\cadre.worktrees\feat-playbook-cadre`:
- `git fetch origin`
- `git reset --hard origin/main`
- Confirms: commit `1345135` is dropped from the branch; `cadre/playbook.json`, `.claude/hooks/playbook-sync-cadre.ts`, `.claude/hooks/worktree-init-cadre.ts`, `.claude/settings.json` disappear from working tree.
- Reflog preserves the prior tip for 30 days in case of recovery need.

### Phase C: Track operational state

**C1. Modify `.gitignore` in the feature worktree:**
- Remove line: `.cadre/`
- Remove line: `CLAUDE.md`
- Keep line: `.env*`

**C2. Stage and commit:**
- `git add .gitignore CLAUDE.md .cadre/`
- `git status` — verify expected files (no `.env*`, no `.git/` content).
- Commit: `chore(state): track operational state directly in git` — body explains the simplification, replaces the playbook concept entirely.

### Phase D: Update CLAUDE.md doctrine

**D1. "Worktrees" entry** under "Git and review architecture" — replace the sibling-directory description with: spawn via `claude --worktree <name>` (CC native), worktrees at `.claude/worktrees/<name>/`, CC handles branch/checkout/launch/cleanup, auto-generated `worktree-<random>` branch name as placeholder until scope clears.

**D2. Remove the "The playbook" entry** (added earlier this session). Replace with a brief "**Operational state is tracked.**" rule: `.cadre/` and `CLAUDE.md` are tracked by git; edits propagate via standard merge; no separate canonical-source mechanism.

**D3. Commit:** `docs(claude.md): update worktree convention; track operational state`

### Phase E: Rename branch

- New name: `refactor/track-operational-state` (Conventional Commits prefix; descriptive of the rework).
- `git branch -m refactor/track-operational-state` (in the feature worktree).

### Phase F: Push

- `git push -u origin refactor/track-operational-state`
- `git push origin --delete feat/playbook-cadre`

### Phase G: PR + verify + merge

**G1. Open PR via `gh pr create`:**
- Title: `refactor: track operational state directly; adopt CC native worktrees`
- Body: summary of architectural simplification, CC-native pivot, tracked-state decision, list of Phase A verification checks performed.

**G2. Verify end-to-end in a fresh worktree:**
- From main: `claude --worktree verify-cadre-native`
- In the new worktree: confirm CLAUDE.md is auto-loaded (orchestrator should know the doctrine), `.cadre/handoff.md` and `.cadre/todos.md` are present, doctrine reflects new conventions.
- Edit `.cadre/handoff.md` (add a marker line); commit; push.
- Confirm the edit appears on the PR diff.

**G3. Merge** if verification clean. Auto-cleanup of the `verify-cadre-native` worktree happens on session exit.

### Rollback

- Pre-push: `git reflog` + `git reset --hard <prior-sha>` recovers the prior branch state.
- Post-merge: `git revert <merge-sha>` on main reverses the un-gitignore. Note: post-revert, `.cadre/` would be re-gitignored but the files would still exist in the working tree (untracked) — manual cleanup may be needed.

## PR #2 — Anticipatory restructure (deferred)

Captured as a TODO entry post PR #1 merge. Out of scope for this plan's execution. Will receive its own plan-cadre session when felt-need warrants.

## Verification (success criteria for this plan)

After PR #1 merges:
1. `claude --worktree foo` from main creates a worktree, launches a session, has CLAUDE.md auto-loaded, has `.cadre/` content present.
2. Editing a tracked file in the worktree, committing, pushing, and merging propagates the edit to main without any custom sync logic.
3. Worktree auto-cleanup on session exit works as documented.
4. `cadre/playbook.json`, `.claude/hooks/`, `.claude/settings.json` all absent from the codebase.
5. CLAUDE.md doctrine reflects the new conventions (no playbook references, new worktree path).

## Could

Seven candidates on the table — set-based, no narrowing yet. Each is a distinct shape; some compose with others (e.g., a state-location choice + a `.claude/` structure choice + an ergonomic-delivery choice can stack).

**State location / persistence shape:**

- **A. Init-only with write-to-main doctrine** — main is canonical; worktrees get a snapshot at birth; orchestrator writes to main's absolute path. Discipline-based. (Detailed below in "Prior thinking.")
- **B. Symlinks (mechanical canonical-source)** — each worktree symlinks playbook files to main. Edits anywhere = edits main automatically. No discipline needed. Caveat: Windows symlinks require Developer Mode or admin.
- **C. External canonical store** (e.g., `~/.cadre/<project>/state/`) — playbook files live outside the repo entirely. Main and worktrees both reference via absolute path. Decouples state from repo location, pre-empts machine portability if ever needed.

**`.claude/` structure shape:**

- **D. Reddit-style restructure** — adopt the post's pattern literally: CLAUDE.md + `rules/`, `hooks/`, `commands/`, `skills/`, `agents/`, with formal team-vs-personal split (`*.local`).
- **E. Defer the `.claude/` restructure (YAGNI)** — leave as-is for now. Reddit pattern is anticipatory; no crowding yet. Revisit when actual rot appears.

**Ergonomic delivery (the "one command" feel):**

- **F. Custom shell command** (e.g., `cadre claude --worktree <name>`) — wraps `git worktree add` + init + Claude launch in a single command users invoke.
- **G. Auto-healing SessionStart hook** — every Claude session starting in a worktree checks for playbook files, runs init if missing. Makes plain `claude` self-bootstrap — answers "do we even need a custom command?"

**Cross-cutting question (raised in intent):**

- **H. Universal canonical-source convention** — apply whichever state-location approach is chosen (A / B / C) to ALL playbook files, no exceptions. Currently a property to apply, not an alternative.

---

## Prior thinking (now one Could-phase candidate, equivalent to option A above)

What follows below is the previous draft of this plan — scoped only to playbook simplification, equivalent to option A. With scope now widened to include `.claude/` restructure and the one-command ergonomic vision, this content should be treated as ONE input to the Could phase, not the answer.

## Evaluation of the alternative proposal

Quick honest read on each piece:

| Proposal item | Verdict for Cadre | Notes |
|---|---|---|
| **Track CLAUDE.md on main, edit only when behavior changes, merge via PR** | ❌ Doesn't fit | CLAUDE.md doctrine evolves rapidly mid-session (we just added the playbook entry). PR-merge cadence on every doctrine tweak adds heavy friction. Also: user has stated privacy preference for `.cadre/` and CLAUDE.md. |
| **Use `~/notes/<project>-todos.md` or GitHub Issues** | 🟡 Partial | `~/notes/` is just relocated gitignore — fine but doesn't dissolve the problem. GitHub Issues = public, conflicts with stated privacy preference. |
| **Per-worktree gitignored SCRATCH.md for in-flight thinking** | ✅ Adopt (modified) | Captures intent at session start, dies with branch. Genuinely good. Add to init script as a generated template. |
| **Skip the sync script — friction of writing > friction of `cat`-ing** | ✅ Mostly adopt | Skip the *bidirectional auto-sync* script. Keep the *init* script. Compromise: discipline replaces automation. |
| **WorktreeCreate hook seeds SCRATCH.md, prompts Claude to fill it in first** | ✅ Adopt (adapted) | No native WorktreeCreate event in Claude Code. Closest equivalent: extend the manual init script to also stub SCRATCH.md. SessionStart hook could nudge Claude to fill it in. |

The proposal's load-bearing insight is **"capturing context at the moment intent is clearest beats syncing it after the fact."** This is correct and Cadre should absorb it.

The proposal's load-bearing weakness is **assuming CLAUDE.md and TODOs evolve slowly enough for PR-merge cadence.** In Cadre's actual rhythm, doctrine and todos churn every session.

## Recommended architecture: init-only + write-to-main

**Single canonical source: main worktree.** All operational state (CLAUDE.md, handoff, todos, ADR log) lives in main's filesystem. Always. Period.

**Worktrees get a snapshot at birth.** The init script populates a fresh worktree with copies of the playbook files from main. This serves two purposes:
1. Claude Code auto-loads `CLAUDE.md` from the project root at session start — the worktree needs a copy for that to work.
2. Convenience: `Read .cadre/handoff.md` works without remembering main's absolute path during initial orientation.

**All writes go to main's absolute path.** Doctrine in CLAUDE.md tells the orchestrator: when in a worktree, edit playbook files at `<main>/<relpath>`, never the local copy. Local copies are stale-by-design after birth — context-load fodder, not state.

**Worktree-local copies become read-only fossils.** They're stale after the first edit anywhere. That's fine — they were only ever for initial orientation.

**Per-worktree SCRATCH.md is born-fresh, dies-with-branch.** Each worktree gets a templated SCRATCH.md (Feature / Goal / Out of scope) at init. Lives only in that worktree, gitignored, gone when the branch merges and the worktree is removed.

**No sync hook. No PostToolUse machinery. No bidirectional anything.**

### Why this is better than what we built

1. **Zero race conditions** — only one writer (orchestrator writing to main). Concurrent worktrees can't collide on the same file.
2. **No infinite-loop risk** — no propagation, nothing to loop.
3. **No "stale snapshot" surprise** — local copies are explicitly fossils, not "live mirrors." Mental model is honest.
4. **Reversible** — if discipline fails and writes drift to local copies, we add the sync hook later. Cheap to reintroduce; expensive to debug a buggy bidirectional propagation.
5. **Less code** — kill ~100 lines of sync logic. Keep ~50 lines of init logic.

### Why the trade-off is acceptable

The cost is **discipline**: orchestrator must remember to write to main's absolute path. Three mitigations:

1. **CLAUDE.md doctrine entry** (load-bearing for orchestrator behavior).
2. **Path resolver convention** — `git -C <wt> worktree list --porcelain` returns main as the first entry. Doctrine can say "if uncertain, run this command." Or hardcode the path in CLAUDE.md (acceptable for solo-dev).
3. **Future linter (optional)** — a SessionStart hook could check "am I in a worktree? if so, remind orchestrator of the doctrine in the system prompt." Don't build now.

## Concrete changes

### Keep (from commit `1345135`)

- `cadre/playbook.json` — config still useful as the canonical list.
- `.claude/hooks/worktree-init-cadre.ts` — init script, slight extension (see below).

### Remove

- `.claude/hooks/playbook-sync-cadre.ts` — delete the auto-sync hook.
- `.claude/settings.json` — delete the PostToolUse wiring (or, if we want to keep settings.json for future hooks, replace contents with `{}`).

### Modify

- **`cadre/playbook.json`** — no schema changes. Same shape.
- **`.claude/hooks/worktree-init-cadre.ts`** — extend to also generate a templated `SCRATCH.md` in the new worktree's root. Simple stub:
  ```markdown
  # Scratch — <branch-name>

  **Feature:** ___
  **Goal:** ___
  **Out of scope:** ___

  ---

  (in-flight thinking lives here; dies with the branch)
  ```
- **`CLAUDE.md`** — replace the just-added "**The playbook**" doctrine entry with a new one matching this architecture. Key rules:
  - Operational state (CLAUDE.md, handoff, todos, ADR log) is canonical at main.
  - In a worktree, treat local playbook files as **read-only context snapshots from session start**. Do not edit them.
  - All edits to playbook files go to **main's absolute path**.
  - Resolve main's path via `git worktree list --porcelain` (first entry) or the hardcoded path `C:\Users\duham\Projects\cadre`.
  - SCRATCH.md is the per-worktree scratchpad for in-flight feature thinking. Edit locally; dies with branch.

### Add to `.gitignore`

- `SCRATCH.md` (per-worktree scratchpad, never tracked).

## Files touched

- `C:\Users\duham\Projects\cadre.worktrees\feat-playbook-cadre\.claude\hooks\playbook-sync-cadre.ts` — delete.
- `C:\Users\duham\Projects\cadre.worktrees\feat-playbook-cadre\.claude\settings.json` — delete (or empty `{}`).
- `C:\Users\duham\Projects\cadre.worktrees\feat-playbook-cadre\.claude\hooks\worktree-init-cadre.ts` — extend with SCRATCH.md generation.
- `C:\Users\duham\Projects\cadre.worktrees\feat-playbook-cadre\.gitignore` — add `SCRATCH.md`.
- `C:\Users\duham\Projects\cadre\CLAUDE.md` — rewrite the "**The playbook**" doctrine entry. (Manually mirror to worktree until merge.)
- `C:\Users\duham\Projects\cadre\.cadre\todos.md` — update TODO #27 status. (Manually mirror.)

## Verification

After making the changes (in a fresh session, after merge):

1. **Init test.** From main, create a new worktree:
   ```
   git worktree add ../cadre.worktrees/feat-test -b feat/test
   bun run .claude/hooks/worktree-init-cadre.ts ../cadre.worktrees/feat-test
   ```
   Confirm: CLAUDE.md, .cadre/handoff.md, .cadre/todos.md, .cadre/logs/ADR/decision-log.md, and SCRATCH.md all exist in the new worktree.

2. **Discipline test.** Start Claude in the new worktree. Ask it to read CLAUDE.md, identify the playbook doctrine, and confirm "writes go to main's absolute path." Make an edit to handoff via Edit pointed at main's path; confirm main updates and (per design) worktree's local copy stays stale.

3. **Cleanup test.** Remove the test worktree (`git worktree remove ../cadre.worktrees/feat-test`); confirm SCRATCH.md vanishes with it (it lived only there) and main is untouched.

## Risks / open questions

- **Doctrine fragility.** If the orchestrator forgets to write to main's path, state diverges silently. Detection requires a linter or audit. **Mitigation:** strong, prominent CLAUDE.md doctrine; consider an audit subagent later.
- **Worktree-init UX.** Manual `bun run` is friction. **Possible upgrade later:** wrap `git worktree add` in a `cadre worktree add` shell function that runs init automatically. Not now.
- **SessionStart hook for orientation.** Claude Code may have a SessionStart hook event that could remind the orchestrator of the doctrine on every worktree session start. **Verify before relying on it** — claude-code-guide can confirm event identifier and payload.
- **Existing branch handling: amend in place (decided).** The committed code (`1345135`) on `feat/playbook-cadre` will be reset and rewritten. The branch will be force-pushed once the simplified version is staged. The bidirectional commit disappears from history as if it never happened. Safe because nothing else builds on the bidirectional commit and no PR was opened against it.

## Out of scope

- Cross-machine sync. Cadre is solo-dev, single-machine. If a second machine ever happens, revisit then.
- Public-vs-private re-evaluation of CLAUDE.md / `.cadre/`. User has stated privacy preference; respect it. Re-litigate in a future session if priorities shift.
- The handoff-mx-cadre agent (TODO #12). That's the original target of this branch. After this rework lands, create a fresh worktree for it.
