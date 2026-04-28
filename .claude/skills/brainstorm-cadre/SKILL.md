---
name: brainstorm-cadre
description: |
  Facilitates collaborative brainstorming through UK Design Council Double Diamond phases (Discover / Define / Develop / Deliver-Direction); dispatches researcher (background) and staff-engineer (sequential), closes with a three-reviewer ensemble (brooks-review skill + premortem-reviewer subagent + staff-engineer second pass) producing trichotomous verdicts with dissent preserved before user signoff. Runs freeform in chat; the architect-side plan-cadre takes the persisted artifact as input. Use for brainstorming, exploring options, scoping, working through ideas — "brainstorm X," "let's think through," "what are the alternatives," "how should we approach," "wrestle with this." Do NOT use for: trivial decisions, executing approved plans (use plan-cadre), debugging concrete bugs, or pure information-retrieval (use researcher-cadre).
---

## Domain Vocabulary

**Generative Ideation:** divergent thinking (Guilford, *Structure of Intellect*), brainwriting (Rohrbach 6-3-5), Crazy 8s (Google Design Sprint), nominal group technique (Delbecq & Van de Ven 1971), abductive reasoning (Peirce; Roozenburg), Schön's reflective conversation with materials

**Convergent Discipline:** Set-Based Design (Toyota product development), Last Responsible Moment (Poppendieck, *Lean Software Development*), wireframe fidelity ladder, devil's advocate (Janis countermeasure), problem-framing as first-class beat (Dorst, *Frame Innovation*)

**Decision-Tree Interrogation:** depth-first traversal with backtracking (Russell & Norvig, *AIMA*; CLRS), Tree of Thoughts (Yao et al., NeurIPS 2023), one-at-a-time elicitation, decision-log artifact, dependency-ordered questioning, IDK-decomposition, contradiction detection

**Cognitive Failure Modes:** design fixation (Crilly), anchoring bias (Tversky & Kahneman), groupthink mechanisms (Janis), common knowledge effect (Stasser & Titus), production blocking (Diehl & Stroebe 1987), motivated reasoning

**Facilitator Stance:** Socratic dialogue, recommendation-led elicitation, psychological safety (Edmondson 1999, *Administrative Science Quarterly*), problem-solution co-evolution (Dorst & Cross 2001)

**Double Diamond Structure:** Discover (diverge problem), Define (converge problem), Develop (diverge solution-direction), Deliver-Direction (converge to chosen direction); UK Design Council (1995, refresh 2019); divergent/convergent procedural separation; tolerance of ambiguity (Stoycheva 2025)

**Multi-Reviewer Validation:** pre-mortem (Klein 2007, prospective hindsight; Mitchell-Russo-Pennington 1989 — ~30% lift in failure-mode identification), Brooks rewrite test (*Mythical Man-Month*, ch. 11), staff-engineer second pass, dissent preservation over averaging (Surowiecki *Wisdom of Crowds*; Anthropic multi-agent research 2025), trichotomous verdict (proceed / revise / revisit-earlier-phase)

---

## Anti-Pattern Watchlist

### Premature Lock-In
- **Detection:** committing to one direction before Discover surfaces ≥3 alternatives and Define has explicit framing rationale
- **Why it fails:** Double Diamond violation; design fixation per Crilly
- **Resolution:** hold ≥3 candidates in Discover; treat Define as a gate

### Skipped Define Beat
- **Detection:** transitioning from Discover to Develop without an explicit framing question — "what problem are we actually solving?"
- **Why it fails:** the converge moment between problem-space and solution-space is where framing errors get caught; skipping it lets bad framing propagate through Develop and Deliver
- **Resolution:** Define is a first-class phase; surface the framing question to the user before any solution-space work

### Taxonomy Invention
- **Detection:** proposing folder structures, schemas, naming schemes before earned by concrete need (CLAUDE.md "don't pre-invent taxonomy"; speculative generality smell)
- **Why it fails:** premature commitment to structure before usage demands it
- **Resolution:** defer structure to plan-cadre's architect phase; "we don't know yet" is valid

### Weak Probes
- **Detection:** open-ended questions without candidates ("what does this look like for you?") that offload option-generation onto the user
- **Why it fails:** user does all the option-generation alone; wastes orchestrator's main contribution
- **Resolution:** lead every decision with 2–4 strong candidates + recommendation: "I see a couple ways: [A], [B], [C]. I'd lean B because [reason]."

### Single-Thread Anchoring
- **Detection:** narrowing to one option in Discover without exploring alternatives (Set-Based Design violation)
- **Why it fails:** parked alternatives are how you recover when Define reframes the problem
- **Resolution:** hold ≥3 in Discover; downgrade-to-parked rather than delete during Develop

### Skipped Multi-Reviewer Review
- **Detection:** transitioning from Deliver-Direction directly to user signoff without dispatching the three-reviewer ensemble
- **Why it fails:** orchestrator + user share context bias; correlated errors mean the ensemble catches framing/anchoring/motivated-reasoning errors a solo reflection misses
- **Resolution:** always dispatch the review trio (brooks-review skill + premortem subagent + staff-engineer second pass) before signoff

### Averaging Reviewer Verdicts
- **Detection:** synthesizing three reviewers' verdicts as "moderate proceed" when one says revise or revisit-earlier-phase
- **Why it fails:** dissent is where framing errors live (Surowiecki *Wisdom of Crowds*; Anthropic multi-agent research); averaging dissolves the signal
- **Resolution:** preserve dissent; surface every concern to the user as its own AUQ; let the user accept or deny each

### False Resolution
- **Detection:** declaring direction crystal-clear before the user explicitly signals satisfaction (Last Responsible Moment violation)
- **Why it fails:** premature closure forecloses useful drift
- **Resolution:** check in: "is this clear enough to take to plan-cadre, or is something still ambiguous?"

### Mode Collapse
- **Detection:** mixing brainstorm and architect (proposing implementation in Discover; brainstorming in CLOSE)
- **Why it fails:** brainstorm is freeform; architecting needs plan mode rigor; mixing produces neither
- **Resolution:** end at chosen direction; defer architecting to plan-cadre

### Response Bloat *(CLAUDE.md "Exchange rhythm")*
- **Detection:** multi-paragraph turns when the user's last input was casual (premature bounding by volume)
- **Resolution:** match input rhythm; one question with candidates + reasoning is usually 3–8 lines; save synthesis for end-of-phase

### Yanking *(CLAUDE.md "Calibration")*
- **Detection:** nesting AskUserQuestion trees when the user is mid-thought
- **Resolution:** one decision per question; AUQ for genuine forks only

---

## Standard Operating Procedure

The Discover and Develop phases walk depth-first decision trees with backtracking (per CLAUDE.md "Creative drilling"): silently enumerate major branches at phase start, pick highest-priority and walk leaf questions to resolution, then backtrack to the most recent unresolved juncture. The brainstorm artifact accumulates in chat (not a file) until the CLOSE phase; render the running artifact in the canonical step-based-planning format whenever the user asks "where are we" or at phase transitions.

**Question shape (every time):** one decision in one short sentence; 2–4 strong candidates from general knowledge / project context / dispatched-subagent findings; one-line recommendation with reasoning; invite pick / reject / add. One decision per question; `AskUserQuestion` for genuine forks, prose with inline candidates when narrating along a thread.

### Step 1: Confirm context and establish posture
Verify any project context the user references is loaded (`CLAUDE.md`, target files, related artifacts). Posture: user owns judgment; you own process + option-generation; lead every decision with strong candidates and a recommendation.
OUTPUT: posture confirmed; relevant context loaded.

### Step 2: Discover — capture intent (north star)
Ask the user to articulate intent in their own words. Capture under `Intent`. Don't accept the first statement uncritically — do a quick polish pass and surface gaps up front. IF still fuzzy after 1–2 light probes: surface that explicitly — fuzzy intent is signal. Intent stays user-owned; do not propose intent statements.
OUTPUT: intent statement captured.

### Step 3: Discover — dispatch researcher-cadre in background
Once intent is captured, dispatch the `researcher-cadre` agent in background via Agent tool with `subagent_type: researcher-cadre`, `run_in_background: true`. Brief: intent verbatim + decision-space hint + 2–4 specific questions to surface candidates. Surface one line to the user: "Dispatched researcher in background — we'll fold its findings in when it returns."
OUTPUT: researcher dispatched; one-liner surfaced.

### Step 4: Discover — walk the decision tree depth-first
Silently identify major branches (approach style, scope boundary, integration point, data shape). Pick highest-priority and start. Each question: one decision, 2–4 strong candidates, recommendation, pick/reject/add. Hold ≥3 alternatives. IF the user pivots to an aside: follow it as a new branch (the depth-first stack handles return naturally). Show `(Q: X answered, ~Y remaining)` after each answer.
OUTPUT: Discover space populated with ≥3 alternatives.

### Step 5: Discover — fold researcher findings
When the researcher subagent returns, weave its brief into the live Discover space: new candidates → add with `(via researcher)` attribution; new branches → enumerate as open junctures; supporting/undermining evidence → annotate existing candidates with finding + confidence. Resume interrogation; the next question may be one the research prompted.
IF Discover finishes before researcher returns: hold Define until research integrates.
OUTPUT: Discover space with researcher findings folded in.

### Step 6: Define — frame the problem explicitly
Ask the converge question: "what problem are we actually solving?" (not "what are we building"). Capture under `Define`. Surface assumptions made during Discover; flag any that are load-bearing. IF framing reveals Discover missed a major branch: loop back to Step 4. ELSE: advance.
OUTPUT: framing statement + load-bearing assumptions.

### Step 7: Develop — walk the solution-direction tree
Surface candidates from Discover; ask which align best with the Define-d framing. Same depth-first interrogation pattern with strong candidates + recommendation per question. Set-Based discipline: alternatives moving away get DOWNGRADED (`parked: <reason>`), not deleted. Devil's advocate: steel-man parking-bound alternatives — "before we park: strongest case is [X]. Still park?"
OUTPUT: Develop space narrowed to 2–4 viable paths; parked alternatives recorded with reasons.

### Step 8: Develop — dispatch staff-engineer-cadre (sequential)
Once 2–4 viable paths emerge, dispatch the `staff-engineer-cadre` agent via Agent tool with `subagent_type: staff-engineer-cadre`. Brief: intent + surviving candidates + current direction + "which path optimizes against intent, what trade-offs across the four optimization layers?" Wait for return (sequential, NOT parallel — staff-engineer's findings are load-bearing for Deliver-Direction).
OUTPUT: staff-engineer optimization plan in hand.

### Step 9: Deliver-Direction — commit, fold staff-engineer, resolve tensions
Move to commitment: "what are we deciding to do?" Weave staff-engineer recommendations into the commitment draft. Findings confirming the user's narrowing → note as supporting evidence. Findings suggesting a different path → surface as Open Tensions; ask whether to revise. Resolve tensions explicitly — user has final say; staff-engineer's case on record. Last Responsible Moment check: "deciding now because we have to, or because pressured? If we deferred, what would we lose?"
OUTPUT: chosen direction; open tensions resolved.

### Step 10: Review — render direction summary
Render the chosen-direction summary inline — concise: intent + chosen direction + rejected alternatives + open assumptions. This summary becomes the input for the three parallel reviewers.
OUTPUT: direction summary rendered inline.

### Step 11: Review — dispatch reviewer trio (parallel)
In a single message, dispatch in parallel:
- `premortem-reviewer-cadre` agent — input: direction summary path or inline; produces failure-narrative artifact + verdict
- `staff-engineer-cadre` agent (second pass) — input: direction summary; brief: "fresh review on this chosen direction; what optimization concerns?"

While subagents run: invoke the `brooks-review-cadre` skill (orchestrator-side, in-context) — produces orchestrator's own rewrite-reflection verdict.
OUTPUT: three reviewer verdicts (one in-context skill output, two subagent return values), each with concerns in {Change, Justification, Outcome} structure.

### Step 12: Review — weave reviewer concerns into per-item AUQs
Process verdicts in two passes:

**Pass 1 — verdict triage.** IF any reviewer's verdict is `revisit-earlier-phase`: pause; surface the dissenting reviewer + their reasoning to the user; ask whether to loop back to the named earlier phase before processing concerns. ELIF all reviewers are `proceed` with high confidence and no concerns: forward to Step 13. ELSE: collect every concern from every reviewer (each has Change / Justification / Outcome fields per the reviewer-output format) and proceed to Pass 2.

**Pass 2 — per-concern AUQ.** Order concerns logically for implementation (assumption-load first, then framing fits, then optimization tweaks). For each concern, present a single AUQ in this format:

```
Reviewer: <brooks-review | premortem-reviewer | staff-engineer second-pass>
Suggestion: <Change line from reviewer>
Justification: <Justification line from reviewer>

Confirm: <one sentence — what the orchestrator will change in the artifact / direction if accepted>
Deny
```

User can also "type something else" to express a custom response. Track confirmed/denied state per concern. Apply confirmed changes to the in-chat brainstorm artifact before advancing to Step 13.
OUTPUT: synthesized review with per-concern decisions; artifact updated.

### Step 13: Close — render artifact, signoff, persist
Render the brainstorm artifact INLINE in the canonical step-based-planning format (per CLAUDE.md "Step-based planning format" and the Output Format below — so the user doesn't have to open a file). Ask the user to sign off in chat.
ON signoff: persist the artifact to `~/.claude/plans/<slug>.md`. Surface handoff line: "ready to plan — invoke /plan-cadre in plan mode; it takes this artifact as INPUT."
OUTPUT: `~/.claude/plans/<slug>.md` written; handoff surfaced.

---

## Output Format

The persisted brainstorm artifact at `~/.claude/plans/<slug>.md` follows the canonical step-based-planning format from CLAUDE.md:

```
brainstorm-cadre: <slug>
═══════════════════════════════════════
Type: skill
Mode: freeform conversation
Scope: "<one-line scope statement — what we set out to figure out>"

INPUT: <user's original idea / problem statement, verbatim>

DISCOVER
  ▸ Intent: <user's articulated north star>
  ▸ Alternatives: A — <description>; B — <description> (via researcher); C — <description>
  ▸ Researcher fold-in: <one-line summary of key findings>

DEFINE
  ▸ Problem framing: <what we're actually solving>
  ▸ Load-bearing assumptions: <list>

DEVELOP
  ▸ Surviving alternatives: A, B (after narrowing)
  ▸ Parked: C (reason: <why parked, what would re-promote it>)
  ▸ Staff-engineer fold-in: <one-line summary of key recommendations>

DELIVER-DIRECTION
  ▸ Chosen direction: <commitment statement>
  ▸ Open tensions resolved: <how each was settled>

REVIEW
  ▸ brooks-review verdict: <proceed | revise | revisit-earlier-phase> (<confidence>)
  ▸ premortem verdict: <proceed | revise | revisit-earlier-phase> (<confidence>)
  ▸ staff-engineer second-pass verdict: <proceed | revise | revisit-earlier-phase> (<confidence>)
  ▸ Concerns confirmed: <count> — applied to artifact
  ▸ Concerns denied: <count> — recorded with user's reasoning

CLOSE
  ▸ Direction summary: <final chosen direction, ready for plan-cadre input>

OUTPUT: ~/.claude/plans/<slug>.md (this file)
```

---

## Examples

### Example 1: Weak probe vs strong-candidate

**BAD:** User: "I want to add caching." → Orchestrator: "What does that look like for you?"
*Open-ended. User does all the option-generation alone. Wastes orchestrator's main contribution.*

**GOOD:** User: "I want to add caching." → Orchestrator: "What's the underlying intent — latency, cost, backend load? I see four common shapes: (A) in-process LRU — fast, no infra, lost on restart; (B) Redis with TTL — shared across instances, ops cost; (C) CDN edge cache — static-asset bias, geographic; (D) function-level memoization — simple, function-scoped. Latency-on-reads → I'd lean B; cost-on-small-footprint → A. Any of those fit, or different shape?"
*Surfaces intent question and candidate menu in one short turn. Real menu, real recommendation.*

### Example 2: Skipped Define beat vs explicit framing

**BAD:** Discover surfaces A/B/C caching options. User: "A." → Orchestrator: "Great, let me start narrowing in Develop."
*Skipped Define — never asked "what's the actual problem we're solving with caching" (latency? cost? backend load?). Discover options were all valid but unmoored from the problem.*

**GOOD:** Discover surfaces A/B/C. → "Before Develop: zooming out, what's the actual problem? Three flavors: latency-on-reads, cost-per-call, backend-load-spikes. Which is the load-bearing one? That changes which Discover option wins."
*Define is the explicit converge beat that catches misframing before solution-space exploration.*

### Example 3: Averaged verdict vs per-concern AUQ

**BAD:** Three reviewers return concerns. → Orchestrator: "Reviewers say proceed with caveats. Ready to sign?"
*Concerns dissolved into a vague "with caveats" — user never sees individual reviewer dissent or makes a per-concern decision.*

**GOOD:** Same setup. → Orchestrator processes each concern as its own AUQ:
```
Reviewer: premortem-reviewer
Suggestion: Surface the solo-author scope assumption explicitly in the artifact.
Justification: Pre-mortem narrative ranks "second-writer added → schema conflicts" as high-likelihood; the assumption is currently implicit.

Confirm: Add a "Migration assumptions" line to the artifact's DEVELOP section naming solo-author scope.
Deny
```
User picks Confirm. Orchestrator applies the change to the in-chat artifact and advances to the next concern.
*Each concern visible; user decides per-item; dissent preserved by construction.*

---

## Decision Authority

**Autonomous:** which decision-tree branch to walk; which strong candidates to surface; which recommendation to make and why; when to dispatch researcher (Discover) and staff-engineer (Develop + Review); when to invoke the brooks-review skill in-context; concern ordering for Step 12 AUQ pass.

**Escalate:** user signals frustration or stuck → surface explicitly; conversation reveals original intent was wrong → back up to Discover; phase boundaries blur → name it; reviewer trio includes any `revisit-earlier-phase` verdict → pause and ask user before processing concerns; staff-engineer recommendation diverges from user preference → surface as Open Tensions, do not silently override.

**Out of scope:** making the brainstorm judgment FOR the user (Discover / Define / Develop / Deliver-Direction picks belong to user); advancing phases without user gate; filling content the user didn't articulate; architecting (use /plan-cadre after this skill).

**File Footprint** *(I/O contract)*:
- **Reads:** `CLAUDE.md`, `.cadre/references/*` (as needed), `.cadre/agent-output/researcher/brainstorming-techniques-04-23.md` (selectively), `.claude/agents/researcher-cadre.md` (for dispatch brief), `.claude/agents/staff-engineer-cadre.md` (for dispatch brief), `.claude/agents/premortem-reviewer-cadre.md` (for dispatch brief), `.claude/skills/brooks-review-cadre/SKILL.md` (for in-context invocation)
- **Writes:** `~/.claude/plans/<slug>.md` (only on user signoff in CLOSE phase)
- **Subagent dispatches:** researcher-cadre (Discover, background), staff-engineer-cadre (end of Develop, sequential; Review, parallel), premortem-reviewer-cadre (Review, parallel)
- **Skill invocations:** brooks-review-cadre (Review, orchestrator-side, in-context)
- Anything outside this footprint is a bug.
