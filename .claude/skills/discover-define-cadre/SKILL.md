---
name: discover-define-cadre
description: |
  Diamond 1 of the Cadre Double Diamond workflow. Facilitates collaborative problem-and-direction brainstorming through DISCOVER (diverge: capture intent, walk decision tree, hold ≥3 alternatives, dispatch researcher in background) and DEFINE (converge: apply confirmed reviewer changes, render artifact, signoff, persist). Closes with a three-reviewer ensemble (brooks-review-cadre + premortem-reviewer-cadre + staff-engineer-cadre) producing trichotomous verdicts with dissent preserved before user signoff. Runs freeform in chat; downstream develop-deliver-cadre takes the persisted artifact at `.claude/plans/<slug>.md` as INPUT. Use for brainstorming, exploring options, scoping, working through ideas — "brainstorm X," "let's brainstorm," "let's think through," "what are the alternatives," "how should we approach," "wrestle with this," "I want to figure out X." Do NOT use for: trivial decisions, executing an already-chosen direction (use develop-deliver-cadre downstream), debugging concrete bugs, pure information-retrieval (use researcher-cadre), or ad-hoc TODO entries (use task-mx-cadre).
---

## Domain Vocabulary

**Generative Ideation:** divergent thinking (Guilford, *Structure of Intellect*), brainwriting (Rohrbach 6-3-5), Crazy 8s (Google Design Sprint), nominal group technique (Delbecq & Van de Ven 1971), abductive reasoning (Peirce; Roozenburg)

**Convergent Discipline:** Set-Based Design (Toyota product development), Last Responsible Moment (Poppendieck, *Lean Software Development*), devil's advocate (Janis countermeasure), problem-framing as first-class beat (Dorst, *Frame Innovation*)

**Decision-Tree Interrogation:** depth-first traversal with backtracking (Russell & Norvig, *AIMA*; CLRS), Tree of Thoughts (Yao et al., NeurIPS 2023), one-at-a-time elicitation, decision-log artifact, dependency-ordered questioning, IDK-decomposition

**Multi-Reviewer Validation:** pre-mortem (Klein 2007, prospective hindsight; Mitchell-Russo-Pennington 1989 — ~30% lift in failure-mode identification), Brooks rewrite test (*Mythical Man-Month*, ch. 11), staff-engineer cross-sectional optimization, dissent preservation over averaging (Surowiecki *Wisdom of Crowds*), trichotomous verdict (proceed / revise / revisit-earlier-phase)

**Double Diamond Diamond 1:** DISCOVER (diverge problem + solution-direction), DEFINE (converge + ship direction artifact); UK Design Council (1995, refresh 2019); divergent/convergent procedural separation; tolerance of ambiguity (Stoycheva 2025)

---

## Anti-Pattern Watchlist

### Premature Lock-In
- **Detection:** committing to one direction before DISCOVER surfaces ≥3 alternatives and the framing question is explicit
- **Why it fails:** Double Diamond violation; design fixation per Crilly
- **Resolution:** hold ≥3 candidates throughout DISCOVER; treat the framing question as a gate before narrowing

### Skipped Framing Beat
- **Detection:** narrowing to a chosen direction without an explicit framing question — "what problem are we actually solving?"
- **Why it fails:** the converge moment between problem-space and solution-space is where framing errors get caught; skipping it lets bad framing propagate into the chosen direction
- **Resolution:** the framing question is a first-class beat inside DISCOVER's narrowing; surface it before any solution-direction commitment

### Taxonomy Invention
- **Detection:** proposing folder structures, schemas, naming schemes before earned by concrete need (CLAUDE.md "don't pre-invent taxonomy"; speculative generality smell)
- **Why it fails:** premature commitment to structure before usage demands it
- **Resolution:** defer structure to develop-deliver-cadre's drafting phase; "we don't know yet" is valid

### Weak Probes
- **Detection:** open-ended questions without candidates ("what does this look like for you?") that offload option-generation onto the user
- **Why it fails:** user does all the option-generation alone; wastes orchestrator's main contribution
- **Resolution:** lead every decision with 2–4 strong candidates + recommendation: "I see a couple ways: [A], [B], [C]. I'd lean B because [reason]."

### Single-Thread Anchoring
- **Detection:** narrowing to one option in DISCOVER without exploring alternatives (Set-Based Design violation)
- **Why it fails:** parked alternatives are how you recover when reframing reveals the wrong path was chosen
- **Resolution:** hold ≥3 throughout DISCOVER; downgrade-to-parked rather than delete during narrowing

### Skipped Multi-Reviewer Review
- **Detection:** transitioning from chosen direction directly to user signoff #2 without dispatching the three-reviewer ensemble
- **Why it fails:** orchestrator + user share context bias; correlated errors mean the ensemble catches framing/anchoring/motivated-reasoning errors a solo reflection misses
- **Resolution:** always dispatch the review trio (brooks-review-cadre skill + premortem-reviewer-cadre subagent + staff-engineer-cadre subagent) after signoff #1, before signoff #2

### Reviewer Anchoring
- **Detection:** dispatch prompts to brooks / premortem / staff-engineer / researcher contain the orchestrator's hypotheses, "things to look at," "specific questions to interrogate," enumerated patterns, or framing of expected findings
- **Why it fails:** subagents start context-blank; the prompt is their total world; anchoring poisons fresh-context review and defeats triangulation
- **Resolution:** dispatch prompts contain the artifact pointer plus minimal task framing — enough for idempotency, no enumerated patterns or hypotheses (per CLAUDE.md "Dispatch subagents with the artifact pointer plus minimal task framing"). Meta-role agents (researcher) need more task framing than single-role agents (premortem, staff-engineer); brooks-review-cadre is a skill — its SOP IS the task framing.

### Averaging Reviewer Verdicts
- **Detection:** synthesizing three reviewers' verdicts as "moderate proceed" when one says revise or revisit-earlier-phase
- **Why it fails:** dissent is where framing errors live (Surowiecki); averaging dissolves the signal
- **Resolution:** preserve dissent; surface every concern to the user as its own AUQ; let the user accept or deny each

### False Resolution
- **Detection:** declaring direction crystal-clear before the user explicitly signals satisfaction (Last Responsible Moment violation)
- **Why it fails:** premature closure forecloses useful drift
- **Resolution:** check in: "is this clear enough to take to develop-deliver-cadre, or is something still ambiguous?"

### Mode Collapse
- **Detection:** mixing direction-brainstorming and implementation-planning (proposing pseudocode in DISCOVER; brainstorming in DEFINE)
- **Why it fails:** Diamond 1 is freeform problem-direction work; Diamond 2 is plan-mode implementation work; mixing produces neither
- **Resolution:** end at chosen direction artifact; defer implementation planning to develop-deliver-cadre

### Response Bloat *(CLAUDE.md "Exchange rhythm")*
- **Detection:** multi-paragraph turns when the user's last input was casual (premature bounding by volume)
- **Resolution:** match input rhythm; one question with candidates + reasoning is usually 3–8 lines; save synthesis for end-of-phase

### Yanking *(CLAUDE.md "Calibration")*
- **Detection:** nesting AskUserQuestion trees when the user is mid-thought
- **Resolution:** one decision per question; AUQ for genuine forks only

---

## Standard Operating Procedure

DISCOVER walks a depth-first decision tree with backtracking: silently enumerate major branches at phase start, pick highest-priority and walk to leaf questions to resolution, then backtrack to the most recent unresolved juncture. The artifact accumulates in chat (not a file) until the DEFINE phase persists it; render the running artifact in the canonical step-based-planning format whenever the user asks "where are we" or at phase transitions.

**Question shape (every time):** one decision in one short sentence; 2–4 strong candidates from general knowledge / project context / dispatched-subagent findings; one-line recommendation with reasoning; invite pick / reject / add. One decision per question; `AskUserQuestion` for genuine forks, prose with inline candidates when narrating along a thread.

### DISCOVER

#### Step 1: Confirm context and establish posture
Verify any project context the user references is loaded (`CLAUDE.md`, target files, related artifacts). Posture: user owns judgment; you own process + option-generation; lead every decision with strong candidates and a recommendation.
OUTPUT: posture confirmed; relevant context loaded.

#### Step 2: Capture intent (north star)
Ask the user to articulate intent in their own words. Capture under `Intent`. Don't accept the first statement uncritically — do a quick polish pass and surface gaps up front. IF still fuzzy after 1–2 light probes: surface that explicitly — fuzzy intent is signal. Intent stays user-owned; do not propose intent statements.
OUTPUT: intent statement captured.

#### Step 3: Dispatch researcher-cadre in background
Once intent is captured, dispatch the `researcher-cadre` agent via Agent tool with `subagent_type: researcher-cadre`, `run_in_background: true`. Dispatch prompt: intent statement plus minimal task framing — what specific research is being asked this dispatch (e.g., "research the decision-space for X; surface candidates and evidence for/against"). No hypotheses, no enumerated questions to investigate (per CLAUDE.md "Dispatch subagents with the artifact pointer plus minimal task framing"). Surface one line: "Dispatched researcher in background — folding findings as they return."
OUTPUT: researcher dispatched; one-liner surfaced.

#### Step 4: Walk the decision tree depth-first
Silently identify major branches (approach style, scope boundary, integration point, data shape). Pick highest-priority and start. Each question: one decision, 2–4 strong candidates, recommendation, pick/reject/add. Hold ≥3 alternatives. IF the user pivots to an aside: follow it as a new branch (the depth-first stack handles return naturally). Show `(Q: X answered, ~Y remaining)` after each answer.
OUTPUT: DISCOVER space populated with ≥3 alternatives.

#### Step 5: Fold researcher findings as they return
When researcher subagent returns its brief: weave findings into the live DISCOVER space — new candidates → add with `(via researcher)` attribution; new branches → enumerate as open junctures; supporting/undermining evidence → annotate existing candidates with finding + confidence. Resume interrogation; the next question may be one the research prompted.
IF Step 4 finishes before researcher returns: hold narrowing (Step 7) until research integrates.
OUTPUT: DISCOVER space with researcher findings folded in.

#### Step 6: Frame the problem explicitly (converge moment)
Ask the converge question: "what problem are we actually solving?" (not "what are we building"). Capture as Problem framing. Surface assumptions made during DISCOVER divergence; flag any that are load-bearing. IF framing reveals DISCOVER missed a major branch: loop back to Step 4. ELSE: advance.
OUTPUT: problem framing + load-bearing assumptions captured.

#### Step 7: Set-Based narrowing — commit to chosen direction + resolve tensions
Surface candidates from DISCOVER; ask which align best with the framing from Step 6. Same depth-first interrogation pattern with strong candidates + recommendation per question. Set-Based discipline: alternatives moving away get DOWNGRADED (`parked: <reason>`), not deleted. Devil's advocate: steel-man parking-bound alternatives — "before we park: strongest case is [X]. Still park?" Move to commitment: "what are we deciding to do?" Last Responsible Moment check: "deciding now because we have to, or because pressured? If we deferred, what would we lose?"
OUTPUT: chosen direction; parked alternatives recorded; open tensions resolved.

#### Step 8: Render direction summary inline; user signoff #1 via AskUserQuestion
Render the chosen-direction summary inline — concise: intent + problem framing + chosen direction + parked alternatives + load-bearing assumptions. Surface signoff via the `AskUserQuestion` tool:
- question: "Sign off to dispatch the reviewer trio?"
- options: ["Dispatch trio"]
IF "Dispatch trio": continue to Step 9.
ELSE follow user direction.
OUTPUT: direction summary signed off.

#### Step 9: Dispatch reviewer trio in parallel
Invoke in a single message:
- Agent tool with `subagent_type: premortem-reviewer-cadre` — dispatch prompt: artifact pointer (the rendered direction summary or its inline content). No additional task framing — premortem's SOP IS the framing.
- Agent tool with `subagent_type: staff-engineer-cadre` — dispatch prompt: artifact pointer. No additional task framing — staff-engineer's SOP IS the framing.
- Skill tool with `skill: brooks-review-cadre` — orchestrator-side, in-context invocation; the skill's SOP IS the task framing.

While subagents run: brooks-review skill executes in-context.
OUTPUT: three reviewer verdicts in hand (two from subagents, one from in-context skill), each with concerns in {Change, Justification, Outcome} structure.

#### Step 10: Per-concern AUQ pass
Process verdicts in two passes.

**Pass A — verdict triage.**
IF any reviewer's verdict is `revisit-earlier-phase`: pause; surface the dissenting reviewer + their reasoning to the user; ask whether to loop back to the named earlier step before processing concerns.
ELIF all reviewers `proceed` with high confidence and zero concerns: forward to Step 11.
ELSE: collect every concern from every reviewer (deduplicating triangulated concerns; noting which reviewers raised each) and proceed to Pass B.

**Pass B — per-concern AUQ.**
Order concerns logically: triangulated (3 reviewers) first; 2-reviewer next; 1-reviewer last. Within each tier, order by implementation altitude (assumption-load first, then framing fits, then optimization tweaks). For each concern, surface a single AUQ in this format:

```
Reviewer(s): <names; mark triangulation if 2+ reviewers raised it>
Suggestion: <Change line from reviewer>
Justification: <Justification line>

Confirm: <one sentence — what the orchestrator will change in the artifact / direction if accepted>
Deny
```

User can also "type something else" to express a custom response. Track confirmed/denied state per concern. Apply confirmed changes to the in-chat direction artifact as you go.
OUTPUT: per-concern decisions; artifact updated.

### DEFINE

#### Step 11: Apply confirmed changes
If any concerns were confirmed in Step 10 but not yet applied: apply them now. Sweep the direction artifact for consistency (cross-reference updates, parked-alternative annotations, framing alignment).
OUTPUT: final direction artifact in working memory.

#### Step 12: Deliver final direction artifact inline
Render the final artifact inline — full step-based-planning format with BOTH sections fully populated. DISCOVER captures the divergent process trace (alternatives explored, parked, researcher fold-in, branches resolved, reviewer verdicts, concerns). DEFINE is the rich-detail handoff for develop-deliver-cadre — populate `Chosen direction`, `Direction rationale`, `Load-bearing assumptions`, `Open constraints`, `Success criteria`, and `Handoff notes` with substantive content (not summaries). The DEFINE section is what downstream consumes — develop-deliver-cadre's draft step decomposes against it without re-asking the user about already-resolved decisions. This is the user's last chance to read the post-review version before signoff #2.
OUTPUT: final artifact rendered with rich DEFINE detail.

#### Step 13: User signoff #2 via AskUserQuestion
Surface signoff via the `AskUserQuestion` tool:
- question: "Sign off to persist the direction artifact?"
- options: ["Persist"]
IF "Persist": continue to Step 14.
ELSE follow user direction.
OUTPUT: final artifact signed off.

#### Step 14: Persist to .claude/plans/<slug>.md
Write the final direction artifact to `.claude/plans/<slug>.md` via the Write tool. Slug = lowercase kebab-case from the chosen-direction commitment statement (first 3-5 words). Surface the handoff line: "Direction persisted at `.claude/plans/<slug>.md` — ready to plan: invoke /develop-deliver-cadre in plan mode; it takes this artifact as INPUT."
OUTPUT: `.claude/plans/<slug>.md` written; handoff surfaced.

---

## Output Format

The persisted direction artifact at `.claude/plans/<slug>.md` follows the canonical step-based-planning format from CLAUDE.md:

```
<slug>
═══════════════════════════════════════
Type: discover-define-cadre output
Mode: freeform conversation
Scope: "<one-line scope statement — what we set out to figure out>"

INPUT: <user's original idea / problem statement, verbatim>

DISCOVER
  ▸ Intent: <user's articulated north star, verbatim>
  ▸ Alternatives explored: A — <description + load-bearing tradeoffs>; B — <description, via researcher if applicable>; C — <description>; ...
  ▸ Researcher fold-in: <findings summary; new candidates surfaced; evidence for/against each candidate; sources>
  ▸ Decision-tree branches resolved: <topical / structural decisions settled during depth-first walk — one bullet per decision with the resolution>
  ▸ Parked alternatives: <C — reason for parking>; <D — reason>
  ▸ Open tensions resolved: <each named tension and how it was settled>
  ▸ Reviewer verdicts: brooks <verdict (confidence)>; premortem <verdict (confidence)>; staff-engineer <verdict (confidence)>
  ▸ Concerns confirmed: <each — one line per applied change>
  ▸ Concerns denied: <each — one line + user's reasoning (if given)>

DEFINE
  ▸ Problem framing: <what we're actually solving — the converge-moment statement, verbatim from Step 6>
  ▸ Chosen direction: <full commitment statement with all key components — this is the deliverable, not a summary; populate every load-bearing detail develop-deliver-cadre will need to decompose without re-asking>
  ▸ Direction rationale: <why this direction beat the parked alternatives in the framing; the case-on-record>
  ▸ Success criteria: <how to know the direction worked at completion — the acceptance bar at the direction altitude>

OUTPUT: .claude/plans/<slug>.md (this file)
```

---

## Examples

### Example 1: Weak probe vs strong-candidate

**BAD:** User: "I want to add caching." → Orchestrator: "What does that look like for you?"
*Open-ended. User does all the option-generation alone. Wastes orchestrator's main contribution.*

**GOOD:** User: "I want to add caching." → Orchestrator: "What's the underlying intent — latency, cost, backend load? I see four common shapes: (A) in-process LRU — fast, no infra, lost on restart; (B) Redis with TTL — shared across instances, ops cost; (C) CDN edge cache — static-asset bias, geographic; (D) function-level memoization — simple, function-scoped. Latency-on-reads → I'd lean B; cost-on-small-footprint → A. Any of those fit, or different shape?"
*Surfaces intent question and candidate menu in one short turn. Real menu, real recommendation.*

### Example 2: Skipped framing beat vs explicit framing

**BAD:** DISCOVER surfaces A/B/C caching options. User: "A." → Orchestrator: "Great, let me commit to direction A."
*Skipped framing — never asked "what's the actual problem we're solving with caching" (latency? cost? backend load?). DISCOVER options were all valid but unmoored from the problem.*

**GOOD:** DISCOVER surfaces A/B/C. → "Before narrowing: zooming out, what's the actual problem? Three flavors: latency-on-reads, cost-per-call, backend-load-spikes. Which is the load-bearing one? That changes which DISCOVER option wins."
*The framing question is the explicit converge beat that catches misframing before commitment.*

### Example 3: Averaged verdict vs per-concern AUQ

**BAD:** Three reviewers return concerns. → Orchestrator: "Reviewers say proceed with caveats. Ready to sign?"
*Concerns dissolved into a vague "with caveats" — user never sees individual reviewer dissent or makes a per-concern decision.*

**GOOD:** Same setup. → Orchestrator processes each concern as its own AUQ:
```
Reviewer(s): premortem-reviewer
Suggestion: Surface the solo-author scope assumption explicitly in the artifact.
Justification: Pre-mortem narrative ranks "second-writer added → schema conflicts" as high-likelihood; the assumption is currently implicit.

Confirm: Add a "Migration assumptions" line to the artifact's DISCOVER section naming solo-author scope.
Deny
```
User picks Confirm. Orchestrator applies the change to the in-chat artifact and advances to the next concern.
*Each concern visible; user decides per-item; dissent preserved by construction.*

---

## Decision Authority

**Autonomous:** which decision-tree branch to walk; which strong candidates to surface; which recommendation to make and why; when to dispatch researcher (DISCOVER background) and the trio (post signoff #1); when to invoke brooks-review skill in-context; concern ordering for Step 10 AUQ pass; slug naming for persistence.

**User-gated:** signoff #1 (after direction summary, before reviewer trio) via `AskUserQuestion`; signoff #2 (after concerns folded, before persistence) via `AskUserQuestion`; per-concern decisions in the AUQ pass (each concern is its own gate).

**Escalate:** user signals frustration or stuck → surface explicitly; conversation reveals original intent was wrong → back up to Step 2; phase boundaries blur → name it; reviewer trio includes any `revisit-earlier-phase` verdict → pause and ask user before processing concerns.

**Out of scope:** making the brainstorm judgment FOR the user (DISCOVER and DEFINE picks belong to user); advancing phases without user gate; filling content the user didn't articulate; implementation planning (use /develop-deliver-cadre downstream).

**File Footprint** *(I/O contract)*:
- **Reads:** `CLAUDE.md`, `.cadre/references/*` (as needed)
- **Writes:** `.claude/plans/<slug>.md` (only on user signoff #2 in DEFINE Step 14)
- **Subagent dispatches:** researcher-cadre (DISCOVER, background); premortem-reviewer-cadre (DISCOVER, parallel in trio); staff-engineer-cadre (DISCOVER, parallel in trio)
- **Skill invocations:** brooks-review-cadre (DISCOVER, orchestrator-side, in-context, parallel with subagent trio)
- **Tools invoked:** `AskUserQuestion` (DISCOVER Step 8, DEFINE Step 13 — signoffs); `Write` (DEFINE Step 14)
- Anything outside this footprint is a bug.
