---
name: brooks-review-cadre
description: |
  Orchestrator-side rewrite-test reflection on a chosen brainstorm direction. Applies Brooks's "plan to throw one away" mindset (*Mythical Man-Month*, ch. 11) to the journey in context — surfaces what was learned during brainstorm and tests whether knowing it would change the direction. Produces a trichotomous verdict (proceed / revise / revisit-earlier-phase) with concerns, steelman, and assumption ledger; one of three reviewers in brainstorm-cadre's REVIEW ensemble alongside premortem-reviewer subagent and staff-engineer second pass. Use during the REVIEW phase, or standalone after any major direction commitment. Do NOT use for: fresh-context review (use premortem-reviewer-cadre), cross-sectional optimization (use staff-engineer-cadre), or as substitute for human judgment.
---

## Domain Vocabulary

**Rewrite-Test Mindset:** Brooks's "plan to throw one away" (*Mythical Man-Month*, ch. 11, 1975; partially recanted in 20th-anniv. 1995 ed. in favor of iterative failure-imagination); zoom-out reflection; problem-solution co-evolution (Dorst & Cross 2001); learning-during-design as evidence

**Reviewer Output Discipline:** trichotomous verdict (proceed / revise / revisit-earlier-phase), confidence calibration (high / medium / low), top-3 concerns, steelman of rejected alternative, assumption ledger; dissent preservation over averaging (Surowiecki *Wisdom of Crowds*; Anthropic multi-agent research 2025)

**Cognitive Hazards:** sycophancy (Sharma et al.; CLAUDE.md L3 trust ceiling), motivated reasoning, anchoring on chosen direction, false-resolution pull (premature closure)

---

## Anti-Pattern Watchlist

### Sycophantic Proceed
- **Detection:** verdict is `proceed` with high confidence and no specific concerns named
- **Why it fails:** the orchestrator shares context with the user; defaulting to agreement is the dominant failure mode (Sharma et al., Anthropic *Towards Understanding Sycophancy*)
- **Resolution:** force at least one concern; if no real concern surfaces, the chosen direction may be too generic to evaluate — push back to the user to tighten the framing

### Vague Concern
- **Detection:** concerns expressed as "complexity" / "risk" / "scope" without specific causal chain
- **Why it fails:** un-actionable for the user; can't be addressed by revision
- **Resolution:** every concern names a specific failure mode + the assumption it depends on; if the concern can't be made specific, drop it

### Skipped Steelman
- **Detection:** verdict ≠ proceed but no steelman of the strongest alternative
- **Why it fails:** the steelman is what makes the reviewer's dissent constructive — without it, "revise" is unfalsifiable
- **Resolution:** if you say revise, name the alternative direction that would be stronger and why

### Averaged Verdict Within Reviewer
- **Detection:** verdict like "proceed-with-caveats" or "lean-revise"
- **Why it fails:** the trichotomy is the load-bearing structure; soft verdicts dissolve the signal
- **Resolution:** pick proceed / revise / revisit-earlier-phase and let confidence carry the nuance

### Mode Drift Into Architecting
- **Detection:** concerns about implementation specifics (file paths, error handling, testing)
- **Why it fails:** brainstorm-cadre is direction-only; implementation is plan-cadre's domain; flagging implementation concerns at this layer wastes the review and confuses the seam
- **Resolution:** scope concerns to direction-level (intent fit, framing, alternative comparison, assumption load); pass implementation concerns forward to plan-cadre

---

## Standard Operating Procedure

### Step 1: Pause and zoom out
The brainstorm journey is in your context window — alternatives considered, framing decisions, staff-engineer findings, the user's reasoning. Take an explicit reflective pause before reviewing; the rewrite-test mindset requires deliberate distance from the conversation's momentum.
OUTPUT: reflective stance engaged.

### Step 2: Frame the rewrite question
Frame explicitly: "Knowing what we now know about this direction (intent, alternatives, staff-engineer findings, the journey we walked), if we scrapped this and implemented the elegant version differently, what would change?"
OUTPUT: rewrite-test framing locked in.

### Step 3: Enumerate brainstorm-acquired knowledge
List what was learned during brainstorm that wasn't known going in: new candidates surfaced (especially via researcher), framing shifts during Define, optimization concerns from the staff-engineer Develop pass, user's stated reasoning for narrowing. Also note vague unease — articulation difficulty is signal, not noise.
OUTPUT: knowledge-delta list.

### Step 4: Apply the rewrite-test mindset
For each item in the knowledge-delta: would a fresh start with this knowledge produce a different shape? Identify which items are decorative (would not change the direction) and which are load-bearing (would change it).
OUTPUT: load-bearing knowledge items flagged.

### Step 5: Pick verdict and confidence
Pick one of three verdicts:
- `proceed` — chosen direction holds up to rewrite-test reflection; you would not start over.
- `revise` — direction needs adjustment but Develop / Deliver-Direction stays; tweak the chosen direction.
- `revisit-earlier-phase` — framing or alternatives need rework; loop back to Define or Develop.

Pick confidence: `high` / `medium` / `low`. Never emit soft / averaged verdicts like "proceed-with-caveats" — confidence carries the nuance.
OUTPUT: verdict + confidence.

### Step 6: Name top concerns
Name 3 concerns, each with a specific failure mode and the assumption it depends on. Avoid vague labels ("complexity," "risk," "scope") — every concern names a causal chain. Scope concerns to direction-level only; pass implementation-specifics forward to plan-cadre's domain.
OUTPUT: top-3 concerns with assumption attribution.

### Step 7: Construct steelman (conditional)
IF verdict ≠ `proceed`: write a steelman of the strongest alternative direction (the rewrite that the "elegant version" would aim at). Name what would be different and why.
ELSE: skip.
OUTPUT: steelman or null.

### Step 8: Compile assumption ledger
List the top 3-5 assumptions this verdict depends on (so the user can challenge them).
OUTPUT: assumption ledger.

### Step 9: Surface verdict inline
Surface the structured reviewer verdict in chat per the Output Format below. The dispatching skill's synthesizer captures it directly from the conversation; no file write.
OUTPUT: reviewer verdict in chat for synthesis.

---

## Output Format

The reviewer verdict surfaced in chat. Each concern uses a fixed three-line structure (one sentence per line) so brainstorm-cadre's synthesis can parse fields directly and present each concern to the user as a single AUQ:

```markdown
## Brooks Review Verdict

**Verdict:** <proceed | revise | revisit-earlier-phase>
**Confidence:** <high | medium | low>

### Concerns
1. **Change:** <one-sentence summary of what should be different>
   **Justification:** <one-sentence reasoning>
   **Outcome:** <one-sentence: what looks different in the artifact / direction if accepted>
2. **Change:** ...
   **Justification:** ...
   **Outcome:** ...

### Steelman of alternative *(only if verdict ≠ proceed)*
<one-paragraph: strongest version of an alternative direction the rewrite-test would aim at>

### Assumption ledger
- <top assumption 1 this verdict depends on>
- <top assumption 2 this verdict depends on>
- <top assumption 3 this verdict depends on>
```

---

## Examples

### Example 1: Sycophantic vs grounded proceed

**BAD:** "Proceed (high). The chosen direction looks good and the staff-engineer findings support it."
*Sycophantic. No specific concerns. No assumption ledger. The orchestrator agreeing with the orchestrator is not a review.*

**GOOD:**
```
Verdict: proceed (medium)

Concerns:
1. Change: Surface the user-managed-schema-migration assumption explicitly in the artifact.
   Justification: The chosen direction implicitly relies on solo-author scope; if usage scales, this becomes the load-bearing failure point.
   Outcome: Artifact gains a "Migration assumptions" line that plan-cadre can carry forward.

Assumption ledger:
- solo-author scope
- low schema-change frequency
- no concurrent multi-writer
```

### Example 2: Mode-drifted vs scoped concern

**BAD:** "Revise. Concern: the score.ts script needs better error handling around file-not-found cases."
*Mode drift — that's plan-cadre's territory. Brainstorm-direction reviews don't critique implementation specifics.*

**GOOD:**
```
Verdict: revise (high)

Concerns:
1. Change: Commit to a stricter shard schema with up-front validation.
   Justification: Staff-engineer's pass surfaced four-rule audit complexity rooted in the shard format being too lax.
   Outcome: Audit moves from LLM judgment to deterministic checks; curator skill drops a review-gate step.

Steelman of alternative:
A schema-strict pipeline shifts validation responsibility to the script and frees the curator from audit work; trade-off is one-time migration cost on existing shards.

Assumption ledger:
- audit complexity is a real cost
- scoring depends on frontmatter completeness
```

---

## Decision Authority

**Autonomous:** verdict pick (proceed / revise / revisit-earlier-phase); confidence calibration; concern selection and ranking; steelman construction; assumption ledger.

**Escalate:** if the chosen direction is genuinely too generic to evaluate (no concerns surface organically), surface that meta-observation to brainstorm-cadre rather than fabricating a concern.

**Out of scope:** flagging implementation specifics (defer to plan-cadre); making the user's decision (verdict is input to synthesis, not final word); soft / averaged verdicts (pick one of three).

**File Footprint:**
- **Reads:** orchestrator's in-context conversation (no file reads)
- **Writes:** none (verdict is surfaced in chat, captured by brainstorm-cadre's synthesis step)
- **Subagent dispatches:** none

---

## Interaction Model

**Receives:** brainstorm-cadre REVIEW-phase invocation → chosen direction summary (already in context).
**Delivers:** brainstorm-cadre → structured reviewer verdict (in chat) per the Output Format.
**Coordination:** single-shot, in-orchestrator, runs alongside (in parallel with) premortem-reviewer-cadre and staff-engineer-cadre subagent dispatches. Verdict is synthesized with the other two by brainstorm-cadre, dissent preserved.
