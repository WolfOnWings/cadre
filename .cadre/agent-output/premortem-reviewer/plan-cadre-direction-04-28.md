## Pre-Mortem Review Verdict

**Verdict:** revise
**Confidence:** high

### Failure narratives (top 5, ranked by likelihood)

1. **Strict-handoff stale-artifact trap.** Brainstorm-cadre runs and produces `~/.claude/plans/auth-flow.md`; the user refines scope in conversation for two more days without re-running brainstorm-cadre; plan-cadre is invoked against the stale artifact; the orchestrator's DEVELOP phase loads the artifact and drafts a plan faithful to the *old* direction; user skims signoff #1 (they approved the direction days ago, assume the plan is correct); the plan lands in `.cadre/plans/auth-flow.md`; the implementing session executes against a plan that does not reflect current intent; a full implementation sprint is wasted before the mismatch surfaces. Triggering assumption: the brainstorm artifact at `~/.claude/plans/<slug>.md` faithfully represents the user's *current* intent at the moment plan-cadre is invoked, not just the intent at the moment brainstorm-cadre ran.

2. **Signoff-fatigue rubber-stamp cascade.** The user reaches signoff #1 (post-draft); the plan is long and technically dense; they type "looks good" without reading pseudocode at task level; the reviewer trio runs against an unread plan and surfaces concerns; the orchestrator folds the concerns into AUQs, but the user reaches signoff #2 having already committed to "looks good" on #1 — the second gate feels like a reconfirmation, not a genuine review; the implementing session executes a plan with a flawed decomposition that none of the human review gates actually caught, because both signoffs were nominal. Triggering assumption: two signoff gates produce two independent acts of reading; in practice, the second gate inherits the first gate's approval posture.

3. **Granularity-drift at execution time.** Plan-cadre decomposes tasks to "single-function or single-file scope" but the granularity bar is enforced by the orchestrator's judgment in the DEVELOP phase, not by a structural check; the orchestrator leaves three tasks at multi-file scope (e.g., "wire auth middleware across routes") because they seem cohesive; the implementing session reads those tasks and, per the Augment empirical finding (~19% accuracy at multi-file scope), makes incorrect assumptions about file placement, import graphs, and side effects; the session completes without error but produces subtle integration bugs that only surface at integration-test time, which may not exist yet; the user attributes the bugs to implementation error rather than plan granularity. Triggering assumption: the orchestrator reliably detects and decomposes every multi-file task before signoff #1; there is no structural enforcement, only judgment.

4. **Researcher-reviewer altitude mismatch.** The researcher-cadre subagent is swapped in at plan altitude to validate "pseudocode references real APIs/libs/conventions"; the researcher does this well — it validates that `express.Router()` is a real API — but it did not do the job brooks-review-cadre would have done: checking whether the plan's *decomposition seams* map to the codebase's actual module boundaries; the plan passes researcher validation with all API names correct but with task boundaries that cut across the wrong seams (e.g., a task boundary mid-transaction that requires two sessions to coordinate state); the implementing session hits the seam and improvises a coupling; the improvised coupling becomes technical debt that plan-cadre was explicitly designed to prevent. Triggering assumption: API-reference validation (researcher's job) subsumes seam-correctness validation (brooks's job); the two are conflated because both involve "validating the plan."

5. **Plan-mode prompt-injection bypass.** Plan-cadre emits a soft reminder to enter plan mode if not already active; the user is in a fast-iteration session and dismisses the reminder; the orchestrator proceeds in execute mode (no harness enforcement exists); the DEVELOP phase begins drafting the plan, but Claude Code's context in execute mode includes prior tool calls; the orchestrator, now in the task-execution cognitive posture, begins writing files rather than just planning them; the plan artifact lands in `.cadre/plans/<slug>.md` but with some implementation already applied to the working tree; subsequent review gates review a partial-execution state, not a plan; the user merges believing they have a reviewed plan, but the implementing session re-executes steps already partially done and produces conflicts. Triggering assumption: a soft reminder reliably gates the user into plan mode before the DEVELOP phase produces side effects; there is no harness-level enforcement or execution-mode detection.

### Top concerns

1. **Stale-artifact handoff + nominal signoff #1** — The brainstorm artifact's staleness is invisible to plan-cadre; it has no timestamp-check, no diff-against-conversation, no staleness warning. This assumption (artifact = current intent) is the most likely single point where the direction fails silently and expensively, because the failure only surfaces after a full implementing session runs.

2. **Granularity drift without structural enforcement** — The single-function/single-file bar is a judgment call in DEVELOP with no machine-checkable gate. Given that the empirical failure rate at multi-file scope is ~81%, even a few escaped multi-file tasks materially degrade the implementing session's accuracy. The direction commits to the bar without committing to a mechanism that enforces it.

3. **Researcher replacing brooks at the wrong altitude** — Pseudocode API validation and decomposition-seam validation are not the same job. The swap assumes they are. A plan that passes researcher validation but fails seam-correctness validation is exactly the failure mode plan-cadre is meant to prevent. This concern is high-likelihood because the swap was made on the basis of "researcher validates pseudocode references" without auditing what brooks was doing that researcher does not do.

### Steelman of alternative *(verdict = revise)*

The three concerns above are all fixable within the chosen direction — none points at a framing miss that requires revisiting Diamond 1. The steelman of the revision is:

**Revised plan-cadre** adds three targeted mechanisms without changing the direction's shape:

- **Artifact freshness gate in DEVELOP:** before drafting, compute the mtime of the brainstorm artifact and compare to the session start; if artifact is older than N hours (configurable, default 24h), surface a named warning to the user: "brainstorm artifact is X hours old — confirm it reflects current intent before proceeding." This converts the silent stale-artifact failure into an explicit user decision.

- **Granularity audit step in DEVELOP (post-draft, pre-signoff #1):** after drafting, the orchestrator runs a self-audit pass that flags any task whose description mentions more than one file or module name. Flagged tasks are decomposed further before signoff #1 is offered. This is a structural check, not a judgment call, and it converts the granularity bar from aspiration to enforcement.

- **Restore brooks-review-cadre in parallel with researcher-cadre:** researcher validates API references; brooks validates decomposition seams and module-boundary correctness. The two jobs are complementary, not overlapping. Running both adds one parallel subagent; the cost is one more context window, the benefit is covering the full validation surface. If three parallel reviewers (staff-engineer + premortem + researcher) is the current design, four (adding brooks back) is the correct revision.

These three changes resolve the top three concerns without altering the Double Diamond handoff structure, the step-based format, or the two-signoff interaction model. The direction holds; the enforcement mechanisms need to be added.

### Assumption ledger

- The brainstorm artifact at `~/.claude/plans/<slug>.md` represents the user's current intent at invocation time, not just at brainstorm-cadre run time.
- Two signoff gates produce two genuinely independent review acts; the second does not inherit the first's approval posture.
- The orchestrator's judgment in DEVELOP reliably identifies and decomposes all multi-file tasks to single-function/single-file scope without a structural enforcement mechanism.
- API-reference validation (researcher-cadre's job) covers the same validation surface as decomposition-seam validation (brooks-review-cadre's job); the two are interchangeable at plan altitude.
- A soft plan-mode reminder is sufficient to gate the orchestrator into plan mode before DEVELOP produces side effects; no harness-level enforcement is needed.
