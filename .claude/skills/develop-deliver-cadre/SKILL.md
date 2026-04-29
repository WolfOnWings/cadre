---
name: develop-deliver-cadre
description: Diamond 2 of the Cadre Double Diamond workflow. Takes a chosen-direction artifact at `.claude/plans/<slug>.md` (from discover-define-cadre) and produces a fully actionable, pseudocode-decomposed implementation plan at `.cadre/plans/<slug>.md` that an implementing LLM can walk mechanically with no in-moment judgment. Runs in Claude Code plan mode; ends with ExitPlanMode after final user signoff. Use whenever the user wants to turn a brainstorm into an executable plan, decompose a direction into tasks, draft pseudocode for review, prepare work for an implementing session — "plan this," "let's plan it," "develop the plan," "make a plan from this brainstorm," "turn this into tasks," "what's the implementation plan." Do NOT use for: open-ended exploration of a problem (use discover-define-cadre upstream), executing an already-approved plan (just implement from it), trivial single-step changes, ad-hoc TODO entries (use task-mx-cadre), or fresh research without a prior direction (use researcher-cadre).
---

## Domain Vocabulary

**Pseudocode-as-spec:** stepwise refinement (Wirth, CACM 1971), literate programming (Knuth, *The Computer Journal* 1984), Pseudocode Programming Process (McConnell, *Code Complete* ch. 9), level of intent vs mechanics, named-chunk completeness, structured design (Yourdon and Constantine, 1975)

**Plan decomposition:** task granularity bar (≤ single-function or single-file scope; Augment empirical ~87% vs ~19% accuracy), dependency sequencing, traceability link, acceptance criteria, done-criteria, granularity self-audit

**Double Diamond Diamond 2:** Develop / Deliver phases (UK Design Council, 1995/refresh 2019), strict handoff from Diamond 1, direction → executable plan transition, two-signoff staged gate (pre-review + post-review)

---

## Anti-Pattern Watchlist

### Granularity Drift
- **Detection:** drafted task description spans multiple files or modules without an explicit escape-hatch flag
- **Why it fails:** Augment empirical data shows ~81% accuracy drop on multi-file tasks vs single-function/single-file scope; multi-file tasks force in-moment judgment from the implementing LLM, which is exactly what develop-deliver-cadre exists to prevent
- **Resolution:** post-draft granularity self-audit step flags any task crossing the bar; user must explicitly approve oversized tasks via AUQ before proceeding

### Pseudocode Altitude Slip
- **Detection:** pseudocode describes implementation mechanics (loop counters, intermediate state mutations, parser internals) rather than the level of intent
- **Why it fails:** mechanics-altitude pseudocode collapses the abstraction the user is reviewing; it forces the user to verify implementation correctness instead of intent correctness, defeating "quick user review"
- **Resolution:** pseudocode stays at intent altitude per McConnell (PPP, *Code Complete* ch. 9: "describe what the design does, not how it does it"); F-style format — prose narration in Python-tagged code blocks, control-flow keywords syntax-colored

### Single-Signoff Bypass
- **Detection:** skipping signoff #1 and dispatching the reviewer trio directly after drafting
- **Why it fails:** signoff #1 is the user's check on plan structure before triggering 60-90 seconds of parallel reviewer work; bypassing burns reviewer time on a structurally wrong draft
- **Resolution:** always render inline + ask for signoff #1 before dispatching trio; the dispatch is gated on explicit user confirmation

### Reviewer Anchoring
- **Detection:** dispatch prompts to brooks / premortem / staff-engineer / researcher contain the orchestrator's hypotheses, "things to look at," "specific questions to interrogate," enumerated patterns, or framing of expected findings
- **Why it fails:** subagents start context-blank and the prompt is their total world; anchoring poisons fresh-context review, defeats the triangulation value of independent verdicts
- **Resolution:** dispatch prompts contain the artifact pointer plus minimal task framing — enough that two independent runs produce comparable output (no-context kills idempotency), but no enumerated patterns or hypotheses (per CLAUDE.md "Dispatch subagents with the artifact pointer plus minimal task framing"). Distinction: WHAT they're operating on + WHAT JOB you want done = context; WHAT TO FIND or WHERE TO LOOK = anchoring. Meta-role agents (researcher) need more task framing than single-role agents (premortem, staff-engineer); brooks-review-cadre is a skill — its SOP IS the task framing, dispatch needs only the artifact pointer.

### Reinvent-the-Wheel Ignorance
- **Detection:** drafted tasks describe building capabilities that already exist
- **Why it fails:** rebuilds existing infrastructure; multiplies surface area; wastes time
- **Resolution:** dispatch researcher-cadre in background at DEVELOP entry (reinvent-defense scan)

### Synthesis-Without-Concerns
- **Detection:** reviewer concerns and researcher findings folded into plan revisions silently, without per-concern user gate
- **Why it fails:** dissent is where framing errors live (Surowiecki); silent synthesis dissolves the signal and removes the user from the loop on contested decisions
- **Resolution:** every reviewer concern and researcher finding surfaces as its own AUQ in the per-concern pass; user can confirm / deny / type something else per item; track decisions and apply only confirmed changes
  
---

## Standard Operating Procedure

### DEVELOP

#### Step 1: Plan-mode check (FIRST action)
Confirm the session is in Claude Code plan mode. Detection signal: presence of plan-mode system reminders / suspended file-mutation tools in the active environment.
IF plan mode is active: continue silently to Step 2.
IF plan mode is NOT active: invoke the `EnterPlanMode` tool and continue silently.
OUTPUT: plan mode active.

#### Step 2: Load the upstream direction artifact
Read `.claude/plans/<slug>.md` (the discover-define-cadre output named by the user or inferred from session context). IF the user did not name a slug: list the most recent files in `.claude/plans/` and ask which one.
OUTPUT: direction artifact in working memory.

#### Step 3: Dispatch researcher-cadre in background (reinvent-defense)
Invoke Agent tool with `subagent_type: researcher-cadre`, `run_in_background: true`. Dispatch prompt: the artifact pointer plus minimal task framing:

> Read this plan and research to find existing patterns, techniques, or implementations that the plan could lean on. Your role: defense against reinventing the wheel. For each match, bring back source + brief description + justification to either use it directly or borrow from it.

Surface one line to the user: "Dispatched researcher in background for reinvent-defense scan."
OUTPUT: researcher dispatched; one-liner surfaced.

#### Step 4: Draft the full plan
Decompose the chosen direction into ordered tasks. Each task contains: goal (one-line intent statement), pseudocode (F-style — prose narration in Python-tagged code blocks, control-flow keywords syntax-colored), acceptance criteria (behavioral contract verifiable from diff), done-criteria (human-level completion signal), traceability link (back to the direction-artifact section that motivated this task). Wrap the task list in the canonical step-based-planning format from CLAUDE.md (Type / Mode / Scope header, ALL-CAPS phases, `▸` bullets, `═══` rule, INPUT / OUTPUT sentinels). Granularity bar: each task fits ≤ single-function or single-file scope.
OUTPUT: drafted plan in working memory.

#### Step 5: Fold researcher findings as they return
When researcher subagent returns its reinvent-defense brief: integrate prior-art recommendations into the draft after a brief summary surfaced to user for confirmation. Findings naming an existing primitive / library / framework → revise the corresponding task to either lean on the existing thing or borrow from it directly.
IF Draft phase finishes before researcher returns: wait until it returns then do Step 5.
OUTPUT: draft updated with researcher fold-in.

#### Step 6: Post-draft granularity self-audit
Walk the drafted task list. For each task, check: does the description name more than one file? More than one module / package boundary? More than one logical unit of work? IF any task fails the bar: flag it with `[OVERSIZED]` annotation and surface for user awareness. The user can approve oversized tasks explicitly during signoff #1, but the flag must be visible.
OUTPUT: audited draft; oversized tasks flagged.

#### Step 7: Render inline; user signoff #1 via AskUserQuestion
Render the drafted plan inline (so the user reads it in chat, not by opening a file). Surface signoff via the `AskUserQuestion` tool:
- question: "Sign off to dispatch the reviewer trio?"
- option: ["Dispatch trio"]
IF "Dispatch trio": continue to Step 8.
ELSE follow user direction.
OUTPUT: drafted plan signed off.

#### Step 8: Dispatch reviewer trio in parallel
Invoke in a single message:
- Agent tool with `subagent_type: premortem-reviewer-cadre` — dispatch prompt: artifact pointer (path to the rendered draft). No additional task framing — premortem's SOP IS the framing.
- Agent tool with `subagent_type: staff-engineer-cadre` — dispatch prompt: artifact pointer. No additional task framing — staff-engineer's SOP IS the framing.
- Skill tool with `skill: brooks-review-cadre` — orchestrator-side, in-context invocation; the skill's SOP IS the task framing.

While subagents run: brooks-review skill executes in-context.
OUTPUT: three reviewer verdicts in hand (two from subagents, one from in-context skill), each with concerns in {Change, Justification, Outcome} structure.

#### Step 9: Per-concern AUQ pass
Process verdicts in two passes.

**Pass A — verdict triage.**
IF any reviewer's verdict is `revisit-earlier-phase`: pause; surface the dissenting reviewer + their reasoning to the user; ask whether to loop back to discover-define-cadre before processing concerns.
ELIF all reviewers `proceed` with high confidence and zero concerns: forward to Step 10.
ELSE: collect every concern from every reviewer (deduplicating triangulated concerns; noting which reviewers raised each) and proceed to Pass B.

**Pass B — per-concern AUQ.**
Order concerns logically: triangulated (3 reviewers) first; 2-reviewer next; 1-reviewer last. Within each tier, order by implementation altitude (assumption-load first, then framing fits, then optimization tweaks). For each concern, surface a single AUQ in this format:

```
Reviewer(s): <names; mark triangulation if 2+ reviewers raised it>
Suggestion: <Change line from reviewer>
Justification: <Justification line>

Confirm: <one sentence — what the orchestrator will change in the draft if accepted>
```

Track confirmed / denied state per concern. Apply confirmed changes to the in-chat plan draft as you go.
OUTPUT: per-concern decisions; draft updated with confirmed changes.

### DELIVER

#### Step 10: Apply confirmed changes
If any concerns were confirmed in Step 9 but not yet applied: apply them now. Sweep the plan draft for consistency (cross-reference updates, sequencing fixes, traceability link refresh).
OUTPUT: final plan in working memory.

#### Step 11: Deliver complete plan inline
Render the final plan inline — full step-based-planning format with all task-level content. This is the user's last chance to read the post-review version before signoff #2.
OUTPUT: final plan rendered.

#### Step 12: User signoff #2 via AskUserQuestion
Surface signoff via the `AskUserQuestion` tool:
- question: "Sign off to exit plan mode and persist the plan?"
- option: ["Exit and persist"]
IF "Exit and persist": continue to Step 13.
ELSE follow user direction.
OUTPUT: final plan signed off.

#### Step 13: ExitPlanMode
Invoke `ExitPlanMode` (CC-native). The session transitions from proposal mode to execution mode. File mutations are now permitted.
OUTPUT: plan mode exited.

#### Step 14: Persist the plan
Write the final plan to `.cadre/plans/<slug>.md` via the Write tool. The slug matches the upstream direction artifact slug. This step fires AFTER `ExitPlanMode` because plan mode forbids any file write other than the in-memory plan-mode plan itself; the `.cadre/plans/<slug>.md` artifact can only be persisted post-exit. Surface the persisted path one-liner: "Plan persisted at `.cadre/plans/<slug>.md`"
OUTPUT: plan persisted; path surfaced.

---

## Output Format

The persisted executable plan at `.cadre/plans/<slug>.md` follows the canonical step-based-planning format from CLAUDE.md, with task-level content extending each step:

````
<slug>
═══════════════════════════════════════
Type: executable plan
Mode: implementation
Scope: "<one-line scope statement from upstream direction artifact>"

INPUT: .claude/plans/<slug>.md (upstream direction artifact)

<PHASE-NAME>
  ▸ Task 1: <one-line intent statement>
      ```python
      # pseudocode at intent altitude — F-style
      <prose narration with Python-tagged keywords syntax-colored>
      ```
      Acceptance: <behavioral contract verifiable from diff>
      Done-criteria: <human-level completion signal>
      Traceability: <upstream-slug>#<section-name>

  ▸ Task 2: <one-line intent statement>
      ...

<NEXT-PHASE>
  ▸ Task N: ...

CLOSE
  ▸ <terminal verification or handoff actions>

OUTPUT: <final artifact paths or behavior contract>
````

The pseudocode altitude is F-style — prose narration that uses natural English connectors (`for`, `in`, `if`, `not`, `and`, `continue`, `yield`, `return`) inside a Python-tagged code block so the renderer applies syntax color to control-flow words. Indentation follows Python conventions. Real symbol / type / selector names appear inline as backtick code or naturally inside the prose. No mechanics-level detail (loop counters, intermediate state mutations) — keep at intent.

---

## Examples

### BAD: granularity drift, mechanics-altitude pseudocode, no traceability

```
PHASE-1
  ▸ Task 1: Build the user authentication system
      Implement login, signup, password reset, session management,
      OAuth integration, and admin user management.
      Acceptance: auth works.
```

Problems: task spans many files / modules (granularity violation — would fail the post-draft self-audit); pseudocode is absent (no F-style block); acceptance is vague ("auth works"); no done-criteria; no traceability link to the upstream direction. A cold-context implementing LLM has no mechanical way to walk this task.

### GOOD: single-function scope, F-style pseudocode at intent altitude, traceability

````
DEVELOP
  ▸ Task 1: Add backoff-on-rate-limit to the category-page fetcher
      ```python
      # fetch_with_backoff(url, max_retries=3) → str
      attempt fetching the page from url
      if response is rate-limited (429):
          sleep with exponential backoff
          retry up to max_retries
      else if response is success:
          return response body
      else:
          raise FetchFailed(url, status)
      ```
      Acceptance: function returns response body for 200 responses; retries on 429
                  with exponential backoff up to max_retries; raises FetchFailed on
                  other non-2xx statuses.
      Done-criteria: existing test suite green; new test covers 429-then-200 retry
                     path; manual smoke against a known-throttling endpoint succeeds.
      Traceability: design-scrape-products-cadre#DELIVER-DIRECTION (chosen path:
                    "shared fetch helper handles rate-limit retry centrally")
````

Why this works: scope fits inside a single function; pseudocode is at intent altitude (no loop counters, no sleep-duration arithmetic — those are implementation details); acceptance is a behavioral contract verifiable from the diff; done-criteria gives a human-level completion signal; traceability link points to the exact upstream-direction section that motivated this task. Control-flow keywords (`if`, `else`, `return`, `raise`) syntax-color in the rendered Python-tagged block.

---

## Decision Authority

**Autonomous:** drafting plan structure from the upstream direction; pseudocode altitude judgment within F-style; granularity self-audit flagging; researcher dispatch (background) and trio dispatch (parallel) timing; concern ordering for the per-concern AUQ pass; brooks-review-cadre in-context invocation timing; render-inline cadence; phase-and-task numbering.

**User-gated:** signoff #1 (after first draft, before reviewer trio) via `AskUserQuestion`; signoff #2 (after concerns folded, before `ExitPlanMode` + final persist) via `AskUserQuestion`; per-concern decisions in the AUQ pass (each concern is its own gate); explicit approval for any task flagged `[GRANULARITY-OVERSIZED]`.

**Out of scope (refuse):** open-ended exploration of a problem (route to discover-define-cadre upstream); executing the plan after persistence (a separate implementing session does that); any file write other than `.cadre/plans/<slug>.md` in Step 14 (plan mode forbids it during the run; post-exit, the only sanctioned write is the persist); mutating the upstream direction artifact at `.claude/plans/<slug>.md` (read-only); ad-hoc TODO entries (route to task-mx-cadre).

**File Footprint:**
- **Reads:** `.claude/plans/<slug>.md` (upstream direction artifact, required INPUT); `CLAUDE.md` (project doctrine — step-based format, dispatch-clean rule); `.cadre/agent-output/researcher/<slug>-MM-DD.md` (researcher reinvent-defense findings, when returned)
- **Writes:** `.cadre/plans/<slug>.md` (DELIVER Step 14, AFTER `ExitPlanMode` — plan mode forbids non-plan-file writes, so persistence is necessarily post-exit)
- **Subagent dispatches:** researcher-cadre (DEVELOP, background); premortem-reviewer-cadre (DEVELOP, parallel in trio); staff-engineer-cadre (DEVELOP, parallel in trio)
- **Skill invocations:** brooks-review-cadre (DEVELOP, orchestrator-side, in-context, parallel with subagent trio)
- **Tools invoked:** `AskUserQuestion` (DEVELOP Step 7, DELIVER Step 12 — signoffs); `ExitPlanMode` (DELIVER Step 13); `Write` (DELIVER Step 14, post-exit persist)
- Anything outside this footprint is a bug.
