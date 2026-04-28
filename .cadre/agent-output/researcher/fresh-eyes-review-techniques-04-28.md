# Fresh-Eyes Review Techniques for Pre-Commitment Direction Validation

**Scope:** Named techniques in design / engineering / decision-science literature for "fresh eyes" review of a chosen direction *before* the user signs off on it. Target use: third-reviewer slot in `brooks-review-cadre`, alongside a Brooks rewrite-style reviewer and `staff-engineer-cadre`, after the will phase of the Double Diamond in `brainstorm-cadre`.

**Constraint:** The Brooks "plan to throw one away" test isn't a perfect fit at this stage — Brooks's rewrite test requires implementation experience the user hasn't had yet. We need the design-decision-stage analog.

**Confidence ratings throughout:** high / medium / low based on source corroboration and methodological strength.

---

## Findings by Theme

### 1. Techniques Catalogued (provenance + structural shape)

#### 1.1 Pre-mortem (Klein, 2007) — confidence: HIGH
- **Provenance:** Klein, "Performing a Project Premortem," *Harvard Business Review*, Sept 2007. Builds on Mitchell, Russo, and Pennington (1989), *Journal of Behavioral Decision Making*, who showed prospective hindsight increases reasons-for-outcomes identification by ~30%.
- **Framing question:** "Imagine the project has already failed. Why did it fail?" — shifts from possibility ("might go wrong") to certainty ("did go wrong"), engaging different cognitive machinery.
- **Shape:** Single-team, parallel idea generation, then consolidation. Time-boxed (typically 2 minutes silent generation per participant).
- **Output:** Ranked list of failure modes attributed to specific causes.
- **Evidence requirement:** Plausibility, not proof. Encourages even contrarian voices.
- **Time horizon:** Pre-execution; deliberately positioned at the "go/no-go" gate.
- **Two corroborating sources:** HBR article, Klein's own site (gary-klein.com/premortem).

#### 1.2 Devil's Advocacy (Janis countermeasure, formalized 1970s) — confidence: HIGH
- **Provenance:** Irving Janis, *Victims of Groupthink* (1972) named groupthink and prescribed devil's advocate as one antidote. Schweiger, Sandberg, and Ragan, "Group Approaches for Improving Strategic Decision Making" (*Academy of Management Journal*, 1986) — empirical comparison showed devil's advocacy yielded 33% higher decision quality vs. consensus.
- **Framing question:** "What's wrong with this proposal?" — appointed dissenter critiques the *existing* proposal without offering a counter.
- **Shape:** Sequential — proposal first, then assigned critic. Single voice.
- **Output:** Critique enumerated as objections and risks; original proposal stands or falls on rebuttal.
- **Evidence requirement:** Specific, named flaws. No requirement to propose alternative.
- **Time horizon:** After proposal exists, before commitment.
- **Failure mode:** "Mock dissent" — token critic insufficiently committed, especially when role is rotated rather than chosen for skeptical disposition.

#### 1.3 Dialectical Inquiry (Mason, 1969; Mason and Mitroff, 1981) — confidence: HIGH
- **Provenance:** Richard Mason, "A Dialectical Approach to Strategic Planning," *Management Science* (1969). Mason and Mitroff, *Challenging Strategic Planning Assumptions* (1981). Schweiger et al. (1986) found dialectical inquiry surfaces higher-quality assumptions than devil's advocacy.
- **Framing question:** "What's the *opposite* plan, and which underlying assumptions does the contrast reveal?"
- **Shape:** Parallel — Plan A vs. Plan B (counter-plan) generated from inverted assumptions, then synthesis.
- **Output:** Surfaced assumptions, plus a synthesis that ideally outperforms either alone.
- **Evidence requirement:** Counter-plan must be a *plausible* alternative, not a strawman.
- **Time horizon:** After candidate direction exists, before lock-in.
- **Critical distinction from devil's advocacy:** Requires construction of an alternative, not just critique. Empirically better at surfacing assumptions; comparable on overall quality.

#### 1.4 Reference Class Forecasting / Outside View (Kahneman & Tversky → Kahneman & Lovallo) — confidence: HIGH
- **Provenance:** Kahneman and Tversky (1979) on planning fallacy. Lovallo and Kahneman, "Delusions of Success" (*HBR* 2003) named the inside/outside view distinction. Bent Flyvbjerg formalized reference class forecasting for megaprojects (*APA Journal*, 2005).
- **Framing question:** "Of similar prior efforts, what was the actual distribution of outcomes? Where does this one sit in that distribution?"
- **Shape:** Single-pass analytical — gather distributional data, compare to current case.
- **Output:** Distribution-grounded estimate or risk profile; explicit comparison to inside-view estimate.
- **Evidence requirement:** Reference class must be defensible (genuinely similar); distributional data must be retrieved, not parametric.
- **Time horizon:** Pre-execution.
- **Special LLM consideration:** Reference data must be retrieved (L2 grounding) — vulnerable to confabulation if asked from parametric memory alone.

#### 1.5 Red Team / Team B (DoD, CIA Team B 1976) — confidence: MEDIUM-HIGH
- **Provenance:** CIA Team B (Pipes, Wolfowitz, et al., 1976) instantiated the "outside experts critique inside analysis" pattern. Roots in WWII military "red cell" doctrine. The cybersecurity red-team / blue-team dichotomy descends from this.
- **Framing question:** "If you were trying to defeat this plan, how would you?"
- **Shape:** Parallel adversarial — independent team, often with different priors, generates counter-analysis.
- **Output:** Counter-report; sometimes formal debate before decision-maker.
- **Evidence requirement:** Counter-team should be epistemically independent — same evidence, different model.
- **Time horizon:** Pre-decision review.
- **Caution:** The historical Team B was found to have been ideologically pre-selected, producing a flawed exercise. Selection of the contrarian matters more than the exercise itself — a key constraint when designing an LLM analog.

#### 1.6 Six Thinking Hats (de Bono, 1985) — confidence: MEDIUM
- **Provenance:** Edward de Bono, *Six Thinking Hats* (1985). Widely adopted in product management.
- **Framing question:** Cycles through six modes — White (data), Red (intuition), Black (risks), Yellow (benefits), Green (alternatives), Blue (process).
- **Shape:** Sequential, parallel-thinking — everyone wears the same hat at the same time. Group focuses lens, not roles.
- **Output:** A balanced, multi-lens summary.
- **Evidence requirement:** Soft — each hat surfaces *its* kind of evidence.
- **Time horizon:** Anywhere in process; often used at decision review.
- **LLM fit:** Black hat alone is a strong reviewer prompt. Full hat-cycling is a bit ceremony-heavy for a tight LLM dispatch but maps well to a single-agent multi-pass.

#### 1.7 Design Crit / Charette Critique (Beaux-Arts → modern design schools) — confidence: HIGH
- **Provenance:** Beaux-Arts academy tradition (19th c., Paris). Modern form: studio crit in architecture/industrial design schools. Charette protocol formalized in HTH (High Tech High) and National Charrette Institute frameworks.
- **Framing question:** "Present your work; receive structured feedback from peers and critics in a fixed format."
- **Shape:** Sequential — author presents, panel responds. Often "warm/cool" feedback (what works / what concerns) before recommendations.
- **Output:** Spoken or written critique; author retains final decision.
- **Evidence requirement:** Concrete reference to the artifact; specificity over generality.
- **Time horizon:** At intermediate review points; iterative.
- **Notable structural detail:** Author often doesn't speak during initial feedback round — prevents preemptive defense, which maps interestingly to the orch-worker context-clean pattern.

#### 1.8 Strategic Assumption Surfacing and Testing / Assumption Busting (Mason & Mitroff, 1981; later Lean Six Sigma adoption) — confidence: MEDIUM-HIGH
- **Provenance:** Mason & Mitroff, *Challenging Strategic Planning Assumptions* (1981) — the SAST formalization. Reverse Assumption Analysis (Goldenberg/Mazursky tradition) is a sibling.
- **Framing question:** "What must be true for this plan to succeed? Which of those are we taking on faith?"
- **Shape:** Single-pass enumeration, then ranking by criticality × certainty.
- **Output:** Assumption ledger; flagged critical-uncertain items become validation targets.
- **Evidence requirement:** Assumptions must be made explicit, even obvious ones.
- **Time horizon:** Pre-commitment.
- **LLM fit:** Excellent — single agent, tight artifact, no role-play overhead.

#### 1.9 Steelmanning (Rationalist tradition; Mill antecedent) — confidence: MEDIUM
- **Provenance:** John Stuart Mill, *On Liberty* (1859) anticipates the principle ("he who knows only his own side of the case knows little of that"). The term "steelman" emerged in 2000s rationalist communities (LessWrong) as the inverse of strawman.
- **Framing question:** "What's the strongest possible version of the *alternative* direction we rejected? Now compared to that, does ours still win?"
- **Shape:** Single-pass — formulate the strongest counter, then re-evaluate.
- **Output:** Strongest counter-position; revised confidence in original choice.
- **Evidence requirement:** Counter must be charitably constructed; not a strawman in disguise.
- **Time horizon:** Just before commitment.
- **LLM fit:** Strong — language models are well-suited to constructing alternative arguments. Risk: sycophancy may produce a weak steelman of the option the user didn't pick.

#### 1.10 Nominal Group Technique (Delbecq & Van de Ven, 1971) — confidence: MEDIUM
- **Provenance:** Delbecq, Van de Ven, and Gustafson, *Group Techniques for Program Planning* (1975).
- **Framing question:** Silent generation → round-robin → clarification → ranked vote.
- **Shape:** Highly structured group process; designed to suppress dominant voices and equalize input.
- **Output:** Ranked list (group preference).
- **Evidence requirement:** Ideas, not proof.
- **Time horizon:** During selection or review.
- **LLM fit:** Modest — its core value is human-group-equalization; less directly transferable to a single-user-with-AI-reviewers context.

---

### 2. LLM-as-Reviewer Translation (question 3)

Recent (2024–2026) literature directly addresses multi-agent LLM evaluation:

- **CollabEval / Multi-Agent Meta-Judge** (Amazon Science 2024–25; arXiv:2504.17087): three-phase collaborative evaluation outperforms lone-judge scoring. Three to five judges is the cited sweet spot.
- **Multi-Persona Thinking** (arXiv:2601.15488): single LLM simulating multiple personas improves bias-corrected accuracy from 89% to 92.3%, with diff-bias dropping when self-consistency aggregation is added.
- **Adversarial / Courtroom Multi-Agent Debate** (arXiv:2510.12697, arXiv:2603.28488 PROClaim): structured roles (Plaintiff/Defense/Judge) outperform unstructured debate; unstructured debate shows premature convergence and shared-bias reinforcement.
- **Caveat:** "Agent agreement frequently misinterpreted as correctness" (arXiv multi-agent debate review). Three reviewers agreeing is a *weak* signal when they share a base model — correlated errors per Anthropic's own sycophancy work cited in CLAUDE.md.

**Translation matrix (which technique → which LLM shape):**

| Technique | Best LLM shape | Why |
|---|---|---|
| Pre-mortem | Single agent, structured prompt | The cognitive shift is in the *framing*, not the headcount. One well-prompted agent works. |
| Devil's advocacy | Single agent, persona-loaded | Role is the entire mechanism; ensemble adds little. |
| Dialectical inquiry | Two agents (Plan A defender, Plan B constructor) + synthesis | Mechanism *is* the dialectic; needs the two-side structure. |
| Reference-class forecasting | Single agent + retrieval (L2-grounded) | Crux is the data, not the deliberation. |
| Red team / Team B | Independent agent with different system prompt and (ideally) different priors | The independence is the mechanism. Same model with different prompts gets *some* of the benefit. |
| Six Thinking Hats | Single agent, multi-pass | Hat-cycling is sequential by design. |
| Design crit | Multi-agent (panelists with different lenses) | The *plurality of lens* is the mechanism. |
| Assumption busting / SAST | Single agent | Tight, structural enumeration. |
| Steelmanning | Single agent | Construction of counter-position is the mechanism. |
| NGT | Multi-agent vote | Equalization-by-structure is the point; partial fit. |

---

### 3. Output Format for Re-integration (question 4)

For re-entry into a continuing planning session, the synthesizer (orchestrator) needs an artifact whose shape *matches the user's next decision*: sign off / revise / loop back. That implies a **trichotomous-recommendation output** structure rather than a free-form review.

Recommended artifact shape (per reviewer):
- **Verdict:** `proceed` / `revise` / `revisit-earlier-phase`
- **Verdict confidence:** high / medium / low
- **Top-3 concerns** (concrete, citing the proposal text)
- **One steelman of an alternative direction** (only if verdict ≠ `proceed`)
- **Assumption ledger** (top assumptions this verdict depends on)

Synthesizer combines three reviewers' verdicts via majority + dissent-surfacing (rather than averaging). Critical: surface dissent rather than dissolve it — the *minority* report is often where the framing error lives. This descends from Surowiecki's *Wisdom of Crowds* (independence and aggregation conditions) and matches the Anthropic multi-agent research findings on dissent preservation.

When all three converge on `proceed` with high confidence, surface to user as ready-to-sign. When two say `proceed` and one says `revise`, surface the dissent as a question for the user — not as an averaged "moderate proceed." When even one says `revisit-earlier-phase`, the orchestrator should pause and read out the dissent before any sign-off ceremony.

---

### 4. Recommended Default Reviewer Persona for the Open Slot (question 5)

**Recommendation: Pre-mortem reviewer (Klein, prospective hindsight).** Confidence: HIGH.

Reasoning:

1. **Strongest direct analog to Brooks at the design-decision stage.** Brooks's rewrite test asks "knowing what I learned from building this, what would I scrap?" The pre-mortem asks "imagining I built this and it failed, what went wrong?" Both invert the temporal frame to escape the inside-view trap. The pre-mortem is the version of the rewrite test that *doesn't require having built it yet*, which is exactly the gap stated in the brief.

2. **Empirical evidence is the strongest of any candidate.** Mitchell-Russo-Pennington (1989) measured a ~30% increase in reasons-for-outcomes identification under prospective hindsight. Few other techniques in this literature have a measured cognitive-effect size at all.

3. **Highly compatible with single-agent LLM dispatch.** Unlike dialectical inquiry (which wants two agents) or red team (which wants real independence), pre-mortem's mechanism is a single framing shift. It runs cleanly in one subagent.

4. **Complementary, not duplicative, of the other two reviewers.**
   - `staff-engineer-cadre` is L3 layered optimization — *cross-sectional present-state* analysis (what could be better now).
   - `brooks-review-cadre` would presumably be rewrite-test-flavored — *retrospective-from-completion* analysis.
   - Pre-mortem reviewer is *prospective-failure* analysis — different temporal frame, different cognitive mechanism. Three reviewers, three angles, low correlated error.

5. **Resists the failure modes specifically called out in the brief:**
   - *Framing errors:* Pre-mortem inverts the frame — the original framing is exactly what gets stress-tested.
   - *Anchored thinking:* Forces a counterfactual scenario that breaks anchoring on the chosen direction.
   - *Narrowed-too-fast:* Failure-mode generation is divergent inside a constrained scenario, exactly the corrective pattern.
   - *Motivated reasoning:* The "we already failed" stipulation removes the motivation to defend.

**Persona name suggestion:** `premortem-reviewer-cadre` (or `prospective-hindsight-reviewer-cadre` for technique-precision; the former is shorter and more recognizable).

**Suggested core prompt skeleton (to be refined by `creator-cadre`):**
> The user's chosen direction is documented at <path>. Imagine it is now twelve months later and this direction has failed. The plan was implemented as described and it did not work — the user is reflecting on what went wrong. Generate the most plausible failure narratives, ranked by likelihood, with a specific causal chain for each. Do not hedge with "might" — write "did." Then list the top three assumptions whose failure would cause each narrative. Conclude with a verdict: `proceed` / `revise` / `revisit-earlier-phase`.

**Runner-up worth noting: Dialectical inquiry reviewer.** If you ever want a *fourth* reviewer slot, dialectical inquiry is the strongest "construct-the-counterplan" mechanism and would surface different assumptions than the pre-mortem. But for a *single* slot, pre-mortem is the higher-leverage choice.

**Anti-recommendation: Devil's advocate reviewer.** Tempting given how the role is widely known, but research (Schweiger 1986; Janis follow-ups) shows it underperforms dialectical inquiry on assumption surfacing, and pure critique without a counterproposal tends to produce reactive, not generative, output. Skip it.

---

## Cross-Cutting Notes

### Brooks rewrite test fit (the brief's specific question)
Confirmed: the rewrite test as Brooks framed it (*Mythical Man-Month*, ch. 11, 1975) really does require post-implementation experience — its mechanism is "what I learned from building it." The brief is correct to seek an analog. The pre-mortem is the closest such analog: same temporal-frame inversion, but inverted *forward* (imagined future failure) rather than *backward* (imagined retrospective improvement). Note that Brooks himself softened the rewrite-test position in the 20th-anniversary edition (1995) in light of agile/iterative practice — which is consistent with the broader argument that *iterative* failure-imagination at design-decision stage is preferable to *post-hoc* throwaway rewriting.

### Confidence consideration
Most of these techniques have decades-old psychometric or empirical backing. The newest layer — LLM-as-reviewer translation — is 2024–26 work and still settling. The strongest single recommendation (pre-mortem) doesn't depend heavily on the LLM-translation layer being fully-baked, because its mechanism survives intact in single-agent dispatch.

---

## Knowledge Gaps

1. **No measured comparison of LLM-implemented pre-mortems vs LLM-implemented dialectical inquiry.** The empirical comparison (Schweiger 1986) is for human teams. Whether the rank order holds for LLM reviewers is unverified.
2. **Sycophancy resistance under "imagine it failed" framing.** Anthropic's own work on sycophancy (Sharma et al.) suggests models may soften the failure narrative under user pressure. Not measured for the specific pre-mortem prompt shape.
3. **Selection bias in red-team analog.** The historical Team B failed because of ideological pre-selection. The LLM analog has the same risk if "different perspective" is implemented via a single base model with prompt variation — same training distribution, same blind spots. Mitigation might involve different model providers, but that's outside Cadre's current architecture.
4. **Optimal reviewer count.** Multi-agent debate literature suggests 3–5 reviewers; the brief specifies three. Three is at the low end of the cited range but is structurally clean (majority + minority is well-defined). If three reviewers always converge, that itself is a signal worth tracking — convergence may indicate correlated bias rather than truth.

---

## Recommendations for Further Investigation

- **Pilot run:** Implement `premortem-reviewer-cadre` and run it against three to five completed `brainstorm-cadre` directions (real or synthetic). Measure: does it surface failure modes the user hadn't already considered? If hit-rate is < 30%, the prompt needs work or the role isn't earning its slot.
- **Sycophancy audit:** Test whether the pre-mortem reviewer softens its narrative when the proposal is framed as already user-approved vs. user-tentative. If it softens, escalate prompt anti-sycophancy framing (per Anthropic's prompting guidance).
- **Dissent-preservation in synthesis:** When implementing the orchestrator's three-reviewer synthesis, *do not* average. Surface dissent as first-class output. Validate against a few sessions where reviewers disagree.

---

## Sources

### High-credibility (peer-reviewed, primary, or seminal)
- Klein, G. "Performing a Project Premortem." *Harvard Business Review*, Sept 2007. https://hbr.org/2007/09/performing-a-project-premortem
- Mitchell, D. J., Russo, J. E., Pennington, N. "Back to the future: Temporal perspective in the explanation of events." *Journal of Behavioral Decision Making* 2:25–38 (1989). [referenced via Klein's HBR]
- Janis, I. *Victims of Groupthink* (1972) and *Groupthink* (2nd ed., 1982).
- Mason, R. O. "A Dialectical Approach to Strategic Planning." *Management Science*, 15(8), 1969. https://pubsonline.informs.org/doi/abs/10.1287/mnsc.15.8.B403
- Mason, R. O. & Mitroff, I. I. *Challenging Strategic Planning Assumptions* (Wiley, 1981).
- Schweiger, D. M., Sandberg, W. R., Ragan, J. W. "Group Approaches for Improving Strategic Decision Making: A Comparative Analysis of Dialectical Inquiry, Devil's Advocacy, and Consensus." *Academy of Management Journal* 29(1), 1986. https://journals.aom.org/doi/10.5465/255859
- Lovallo, D. & Kahneman, D. "Delusions of Success." *HBR*, 2003.
- Flyvbjerg, B. "Reference Class Forecasting in Practice." *Journal of the American Planning Association*, 2005. https://en.wikipedia.org/wiki/Reference_class_forecasting
- Brooks, F. P. *The Mythical Man-Month* (1975, 20th anniv. ed. 1995), chap. 11.
- de Bono, E. *Six Thinking Hats* (1985). https://en.wikipedia.org/wiki/Six_Thinking_Hats
- Delbecq, A. L., Van de Ven, A. H. *Group Techniques for Program Planning* (1975).

### Medium-credibility (secondary, contemporary practice, recent arXiv)
- Multi-Persona Thinking for Bias Mitigation. arXiv:2601.15488. https://arxiv.org/html/2601.15488
- Multi-Agent Debate for LLM Judges with Adaptive Stability Detection. arXiv:2510.12697. https://arxiv.org/html/2510.12697v1
- PROClaim Courtroom-Style Multi-Agent Debate. arXiv:2603.28488. https://arxiv.org/html/2603.28488v1
- "When AIs Judge AIs: The Rise of Agent-as-a-Judge Evaluation for LLMs." arXiv:2508.02994. https://arxiv.org/html/2508.02994v1
- "Enhancing LLM-as-a-judge via multi-agent collaboration." Amazon Science. https://www.amazon.science/publications/enhancing-llm-as-a-judge-via-multi-agent-collaboration
- Slack Design, "Fresh Eyes Audits." https://slack.design/articles/fresh-eyes-audits-your-key-to-better-ux-design/
- Wikipedia, "Team B." https://en.wikipedia.org/wiki/Team_B
- Wikipedia, "Nominal group technique." https://en.wikipedia.org/wiki/Nominal_group_technique
- The Charrette Protocol (HTH). https://hthgse.edu/the-charrette-protocol/

### Low-credibility (consultancy / blog / unverified)
- Various Six Thinking Hats summaries on consultancy sites — used for cross-reference of structural shape only, not for primary claims.
- "Steelman" Merriam-Webster slang entry — used only to confirm contemporary usage of the term; the substantive provenance traces to Mill / rationalist community writing which is itself online-native and not peer-reviewed.

### Contradictory / cautionary findings noted
- Team B (CIA 1976) is cited by some as a successful red-team exercise and by others as a methodological failure due to ideological pre-selection (POGO; Center for American Progress critiques). Treated as cautionary precedent in this brief, not as endorsement.
- Brooks himself partially recanted "plan to throw one away" in the 1995 edition. Doesn't undermine the pre-mortem analog — strengthens it, in fact, since the recantation favors iterative failure-imagination over post-hoc throwaway rewriting.
