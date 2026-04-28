# Prior-Art Research Brief (Second Pass): Cadre Workflow Principles

**Date:** 2026-04-22
**Scope:** L2 grounding for the 16 Workflow rules queued for `CLAUDE.md`. This brief builds on `2026-04-22-workflow-prior-art.md` (first pass, same date) and focuses on (a) closing the gaps flagged there, (b) adding sources the first pass missed, and (c) stress-testing Cadre-original claims with targeted disconfirming searches.
**Deliverable shape:** per SKILL.md — findings by theme, sources with credibility ratings (high/medium/low), confidence levels per item (high/medium/low), contradictory evidence, novelty flags, knowledge gaps, and recommendations.

Where the first pass's grounding was already high-confidence and triangulated (items 2, 6, 8, 9 main claim, 13, 15, 16 main claim), this pass adds depth only where there is new signal. For items where the second pass finds no meaningful new evidence, I state that explicitly rather than re-litigate the first pass.

---

## Theme 1 — Git and Review Architecture

### 1. Git worktrees — sibling-directory convention, per-feature, multi-session reuse

**New prior art (second pass)**

- `devtoolbox.dedyn.io/blog/git-worktrees-complete-guide` (2026 guide) — explicitly names the sibling-directory pattern as "the most common and practical pattern," recommends `projectname-branchname` naming, and argues for treating worktrees as task-specific spaces removed when work is done. **Medium credibility** (practitioner, but current and explicit).
- `mskadu.medium.com/mastering-git-worktree` and Meziantou's blog — corroborate the sibling pattern and the temporary / per-feature discipline. **Medium credibility.**
- Bare-repo pattern (gist by sellout; dev.to practical guide) — an alternative where a hidden `.bare` directory holds the repo and all worktrees sit as siblings. This is a *stronger* variant of Cadre's convention, not a contradiction. **Medium credibility.**

**Confidence:** High for the sibling-directory + per-task + remove-when-done triple. The second pass converges cleanly on it across multiple independent practitioner sources.

**Contradictory evidence:** Some users place worktrees in `~/worktrees/<repo>-<branch>/` globally rather than adjacent to the repo. Functionally equivalent; the "sibling" norm is the modal choice but not universal.

**Not Cadre-original.** Ground directly; cite the `git-worktree` man page plus two practitioner references.

---

### 2. Plan before execute

**Second pass:** No material new evidence needed. Parnas & Clements 1986 ("A Rational Design Process: How and Why to Fake It"), Brooks 1975 ch. 11 ("Plan to Throw One Away"), and Claude Code Plan Mode (Anthropic, 2025) form a sufficient triangulated basis. **Confidence: High. Not Cadre-original.**

---

### 3. Three-stage review architecture: commit / push / merge, each L1 + judgmental

**New prior art (second pass)**

- Google Engineering Practices (`google.github.io/eng-practices`) and Winters, Manshreck & Wright, *Software Engineering at Google* (O'Reilly, 2020), ch. 9 "Code Review" — codifies *three distinct approvals* per change: correctness (peer), ownership (code-owner), and language readability. The "reviewer count escalates by stage" framing has a direct analog here: a CR gains reviewers as it moves through these phases. **High credibility** (primary Google publication plus their open-sourced doc).
- Cloudflare's "Orchestrating AI Code Review at Scale" (blog.cloudflare.com, 2025) — composable plugin pipeline combining AI review, noise filter, severity classification, and test generation. Concrete example of L1 (deterministic noise filter, severity gates) fused with L3 (LLM review) at CI stages. **Medium–High credibility** (vendor engineering blog with implementation detail).
- Augment Code, Verdent, Braintrust, Propel (2025–2026 guides) — trend data: ~40–60% review-time reduction, 84% developer AI-tool adoption by 2025, ~41% AI-assisted commits by early 2026. Corroborates that *combined deterministic + LLM review in a multi-gate CI pipeline* is becoming industry standard, not a Cadre invention. **Medium credibility** (practitioner/vendor).
- Humble & Farley, *Continuous Delivery* (2010) remains the canonical source for the multi-gate deployment pipeline. **High credibility.**
- Toyota jidoka / andon cord for "stop-the-line" gating. **High credibility.**

**Confidence:** High. The first pass's "partial Cadre-original for the L1+L3 fusion" is *weakened* by the second pass: Cloudflare, Augment, and Propel all describe deterministic-plus-LLM fusion at CI gates, published in 2025. The fusion is now industry convention, not a Cadre innovation.

**Contradictory evidence:** CD literature (Humble & Farley) warns against over-gating as a cycle-time anti-pattern. Google's three-approval model risks the same. Cadre's escalating-reviewer-count (~1 / 2 / N) is reasonable but should carry an explicit review-latency budget.

**Not Cadre-original.** Ground directly; cite Humble & Farley + Winters et al. + Cloudflare AI-review post.

---

### 4. Book metaphor — commit = sentence, push = page, merge = chapter

**New prior art (second pass)**

- Joel Chippindale, "Telling stories through your commits" (blog.mocoso.co.uk) — explicit narrative framing: repository-as-novel, commit-as-sentence, branch-as-subplot. Very close to Cadre's framing. **Medium credibility** (practitioner, but specific).
- `dev.to/rafaeljohn9/the-beauty-of-git-writing-code-stories` — "Every commit is a chapter, every branch is a plot thread, and every merge is where storylines converge." Another literal chapter metaphor, though mapping differs from Cadre's (chapter = commit, not chapter = merge). **Medium credibility.**
- Chris Maiorana, "Let the commits tell the story" (chrismaiorana.com); Cristiano Werner Araújo on Medium — "storytelling with git" as a named practitioner genre. **Medium credibility.**
- GitHub Blog, "Write Better Commits, Build Better Projects" — official-ish position that commit history *is* a narrative artifact. **Medium–High credibility.**
- Tim Pope (tbaggery.com) and Chris Beams (chris.beams.io) on commit message form. **High credibility.**

**Confidence:** Medium–High. The *narrative metaphor for git history* is widespread. What varies is the specific mapping. Cadre's three-tier (sentence/page/chapter → commit/push/merge) is not one I found written verbatim, but the elements — sentence-grain commits, page-grain units of review, chapter-grain releases — appear piecewise across the sources. The trichotomy itself is a Cadre *composition* of pre-existing parts, not a wholesale invention.

**Contradictory evidence:** None against coherence-based sizing. Squash-merge cultures technically erase the sentence grain, but this is a deliberate tradeoff, not a refutation of the metaphor.

**Partial Cadre-original.** The underlying narrative framing and coherence-sizing are grounded. The sentence/page/chapter three-tier mapping is a Cadre packaging of pieces from the storytelling-with-git literature.

---

### 5. Three commit practices: structured messages, "when unsure commit," logical-chunk commits

**Second pass additions**

- **(a) Conventional Commits v1.0.0** — already grounded (first pass). No new source needed. **High credibility.**
- **(b) "When unsure, commit."** No primary source found in this pass attributing "commit early, commit often" specifically to Torvalds. The GitLab "Journey through Git's 20-year history" (2025), the GitHub Blog "Git turns 20: A Q&A with Linus Torvalds" (2025), and the Linux Foundation 10-year interview do not contain that phrase. The adage is community-canonical, not Torvalds-canonical. **Treat as practitioner adage; drop any Torvalds attribution.** The logical substrate is Kent Beck's TCR (Test && Commit || Revert): commit acts as a checkpoint that makes uncertainty cheap. **High credibility** (Beck's own Medium post).
- **(c) Logical-chunk commits** — Beck, *Tidy First?* (2023): the structural-vs-behavioral-change separation is the precise precedent for splitting scaffolding / tests / implementation / refactor into separate commits. **High credibility** (Beck primary).

**Confidence:** High for (a) and (c). Medium for (b) — the *principle* is solid (TCR, checkpoint semantics) but the *quotable framing* is a community adage without a canonical attributable origin.

**Contradictory evidence:** Squash-on-merge culture (GitHub Flow) erases in-progress commits. Not a refutation of Cadre's usage (the checkpoint value is in-flight, not in history), but worth noting.

**Recommendation change from first pass:** Drop the Torvalds attribution. Cite Beck + Conventional Commits + the practitioner adage generically.

---

### 6. End-of-session retros, non-failure-gated

**Second pass additions**

- Norm Kerth, *Project Retrospectives* (2001) and the Prime Directive: confirmed across `retrospectivewiki.org`, `martinfowler.com/bliki/PrimingPrimeDirective.html`, TeamRetro, Ben Linders translations. The Prime Directive text is stable and widely cited. **High credibility.**
- Google SRE's *Postmortem Culture* chapter + Amy Edmondson on psychological safety. **High credibility.**
- Derby & Larsen, *Agile Retrospectives* (2006). **High credibility.**

**Confidence:** High. **Not Cadre-original.**

**Contradictory evidence:** Retro fatigue is a real anti-pattern at tight cadences. Per-session retros are tighter than the Agile norm (per-sprint). Cadre's hierarchical rollup (item 7) is the mitigation, which is coherent.

---

### 7. Base-3 recursive retrospectives

**New prior art (second pass)**

- **Hierarchical summarization / map-reduce** is a named, documented pattern in modern LLM practice: Google Cloud's "Summarization techniques, iterative refinement and map-reduce for document workflows"; LangChain `reduce_documents_chain`; LlamaIndex tree indices; the ICLR 2024 BOOOOKSCORE paper; the ACL 2025 LLM×MapReduce paper; the 2025 "ToM: Tree-oriented MapReduce for Long-Context Reasoning" (arxiv 2511.00489). **High credibility** (vendor docs + peer-reviewed CS research). These validate the *input-compression-up-the-tree* claim directly.
- **Hierarchical Task Analysis (Annett & Duncan, 1967)** — confirmed: uniform redescription rules applied recursively via the P×C rule, same decomposition mechanism at every level. This is the closest methodological precedent for "same template at every altitude." **High credibility** (primary Annett paper reproduced in Aalto coursework and Stanton's HTA review).
- **Scale invariance / self-similarity** as a named mathematical property (Wikipedia "Self-similarity," *Scientific Reports* on fractal topography). Supports the generic claim that some structures admit uniform templates across scales, but this is math/physics prior art, not directly a retro methodology. **Medium credibility** for relevance.
- **SAFe / Scrum of Scrums hierarchical retros** (scrumguides.org, neatro.io on SAFe retros, Scaling Patterns Library multi-team retrospective, `scalingpatterns.org/plays/multi-team-retrospective/`) — existing Agile-scaling literature uses *different templates at different levels* (Iteration Retrospective vs Inspect & Adapt vs PI Planning Retrospective). This is a **direct counter-example** to Cadre's scale-invariant claim. **High credibility.**

**Confidence:** Low–Medium for the specific base-3 + uniform-template combination. The two components (recursive rollup; uniform template) each have prior art (map-reduce for rollup, HTA for uniform-template decomposition), but the Agile-scaling literature specifically goes the *other way* — it prefers level-specific templates. Cadre's scale-invariance bet is defensible but not the norm.

**Contradictory evidence (strengthened this pass):** SAFe Iteration Retro / I&A Retro / PI Planning Retro are three *different* templates at three levels. This is the dominant industry practice. Cadre's uniform-template stance should be explicitly defended, not claimed as settled.

**Partial Cadre-original.** The recursive-rollup mechanic is grounded (map-reduce, HTA). The *base-3 arity* and *scale-invariant template* together appear to be Cadre's synthesis. Consider adding a one-line rationale in `CLAUDE.md` for *why* the same template is better than SAFe's level-specific approach (probably: the input-compression step handles abstraction, so the template doesn't need to).

---

## Theme 2 — Agent Architecture

### 8. Main session as orchestrator

**Second pass:** No material additions. Anthropic's "Building Effective AI Agents" (anthropic.com/research/building-effective-agents, 2024) and the orchestrator-workers cookbook remain the direct source. Spring AI Agentic Patterns (2025) and Cloudflare Agents docs corroborate. **Confidence: High. Not Cadre-original.**

---

### 9. Iron-law agent contract (input schema, output artifact, file footprint)

**New prior art (second pass)**

- **IEEE Xplore (2025), "Preconditions and Postconditions as Design Constraints for LLM Code Generation"** — explicit application of Meyer's DbC to LLM output, with a structured evaluation across six state-of-the-art LLMs showing that explicit pre/post constraints "significantly boost initial generation accuracy." Direct precedent for Cadre's iron-law framing. **High credibility** (peer-reviewed).
- **"Contracts for Large Language Model APIs"** (Hromel et al., tanzimhromel.com) — formal probabilistic contract models for preconditions, postconditions over output distributions, and state-transition rules in the LLM domain. **Medium–High credibility** (academic-style paper, not yet conference-verified in this pass).
- Meyer, *Object-Oriented Software Construction* (1988, 2nd ed. 1997); Hoare logic; McIlroy Unix philosophy; Dijkstra separation of concerns. **High credibility** (first-pass foundations confirmed).

**Confidence:** High, *upgraded* from the first pass. The 2025 IEEE paper is directly on-domain. Cadre's iron-law claim is no longer only a "synthesis of Meyer+McIlroy onto agents" — there is now peer-reviewed LLM-specific prior art.

**Contradictory evidence:** Stateful ReAct-style agents deliberately violate strict I/O contracts for flexibility. Tradeoff, not refutation.

**Not Cadre-original.** Ground directly; cite Meyer 1988 and the 2025 IEEE paper.

---

### 10. Three-tier file namespace (root / `.cadre/` / `.claude/` / product source)

**New prior art (second pass)**

- **XDG Base Directory Specification (verified)** — explicitly defines *five* categories: config (`$XDG_CONFIG_HOME`), data (`$XDG_DATA_HOME`), state (`$XDG_STATE_HOME`), cache (`$XDG_CACHE_HOME`), plus runtime. This is finer-grained than Cadre's three-tier. **High credibility** (freedesktop.org primary). Cadre's layout is coarser, which is fine for a repo-scoped harness (XDG is user-scoped across an entire machine), but the *pattern* of "separate hidden directories by concern" has a direct, published precedent.
- **Ruby on Rails "Convention over Configuration"** (DHH, 2004; rubyonrails.org/doctrine) — confirmed: the `app/controllers`, `app/models`, `app/views` standard layout is the canonical example of an opinionated project-scoped directory taxonomy published as first-class project doctrine. **High credibility.**
- `git`'s own `.git/` and the general *dotfolder-per-tool* convention (Unix tradition; not a single citable spec but ubiquitous). **High credibility** (by ubiquity).
- Emergent architecture literature (Wirfs-Brock; Malan): structure earns its existence by use, not speculation. Connects to item 13. **Medium credibility.**

**Confidence:** High for the separation-of-concerns pattern. Medium for the *specific three-tier layout*. The Cadre split (root for humans, `.cadre/` for operational state, `.claude/` for harness primitives, product source own namespace) is coherent but particular.

**Contradictory evidence:** XDG chooses a four- or five-way split (config/data/state/cache/runtime). Some projects flatten to a single `.config/`. The exact number of tiers is a design choice with no settled answer.

**Partial Cadre-original.** Pattern is grounded; specific cardinality and role-labels are Cadre's design choice. If XDG-compatibility ever matters, note that Cadre's `.cadre/` conflates state + data — acceptable at repo scope, awkward at user scope.

---

## Theme 3 — Working with the Human

### 11. Verbosity calibration: 0–10 "yanking" scale

**New prior art (second pass)**

- **Borg Rating of Perceived Exertion (0–10 CR-10 scale)** — Gunnar Borg, 1960s; canonically cited across Physiopedia, Cleveland Clinic, NASM, and peer-reviewed ergonomics literature. Direct analog for Cadre's scale: a 0-to-10 *subjective* self-report scale with calibration reference points at specific numbers (RPE 3–4 = low, 5–6 = moderate, 8–9 = high). This is a stronger analogy than the first pass had: Borg's CR-10 is specifically designed for subjective calibration of a continuous quality, and it uses anchor descriptions at each level — the same structural idea as "0 = terse / 5 = engaged / 10 = maximal." **High credibility.**
- **Grice, "Logic and Conversation"** (1975) — Maxim of Quantity. **High credibility** (foundational).
- **Giles, Communication Accommodation Theory** (Giles & Coupland 1991; 2023 review in *Journal of Pragmatics*) — explicit convergence/divergence framework for adjusting communicative behavior to match interlocutor. **High credibility.**
- Recent LLM verbosity research: "Verbosity ≠ Veracity" (arxiv 2411.07858), "Precise Length Control" (arxiv 2412.11937, ScienceDirect 2025) — documents LLM *verbosity compensation* as a failure mode and approaches to mitigate it with user-supplied length control. **Medium–High credibility** (preprints and peer-reviewed).

**Confidence:** High, *upgraded*. Borg CR-10 is a direct structural precedent for a 0–10 subjective calibration scale with anchored reference points. The first pass called it "an adjacent analogy worth checking" — this pass confirms it as more than adjacent.

**Contradictory evidence:** None against calibration. The only risk is the familiar Goodhart-style trap where users anchor to the number rather than the underlying feel.

**Partial Cadre-original.** Principle is grounded (Grice + Giles). The specific 0–10 UX scale has a direct structural precedent in Borg's CR-10; the application-to-dialogue-register is Cadre's.

---

### 12. Exchange rhythm — short back-and-forth over monolithic turns

**New prior art (second pass)**

- Sacks, Schegloff & Jefferson, "A Simplest Systematics for the Organization of Turn-Taking in Conversation," *Language* (1974). **High credibility** (canonical).
- Pair-programming driver/navigator literature: Wikipedia "Pair programming," Martin Fowler's "On Pair Programming," Maaret Pyhäjärvi on strong-style pairing, Drovio, Thoughtworks on "Effective Navigation." The *explicit recommendation to swap roles on short intervals (15–20 minutes)* and to "agree on one small goal at a time" is directly parallel to Cadre's short-turn rhythm. **High credibility** (multiple independent practitioner and textbook sources).
- Beck, *Extreme Programming Explained* (1999). **High credibility.**

**Confidence:** High. **Not Cadre-original.**

**Contradictory evidence:** Flow/deep-work literature (Newport, Csikszentmihalyi) — reconciled as before: short turns within a session, long sessions overall.

---

### 13. Refuse to pre-invent taxonomy; "we don't know yet" as valid

**Second pass additions**

- **Poppendieck, *Lean Software Development* (2003)** — "last responsible moment," verified across Jeff Atwood (blog.codinghorror.com), Wirfs-Brock (wirfs-brock.com), Ben Morris, and `agilepainrelief.com`. The phrase is explicitly Poppendieck-originated. **High credibility.**
- Beck, *XP Explained* (1999) — YAGNI. **High credibility.**
- Knuth, "Structured Programming with Go To Statements," *ACM Computing Surveys* (1974) — premature optimization. **High credibility.**
- Wardley doctrine (doctrine.wardleymaps.com) — "deferring important architectural and design decisions until the last responsible moment to prevent unnecessary complexity" is named doctrine. **Medium–High credibility** (Wardley's own site + multiple practitioner interpretations).
- Emergent-design literature: Wirfs-Brock on agile architecture. **Medium credibility.**

**Confidence:** High. One of the most grounded items on the list. **Not Cadre-original.**

**Contradictory evidence:** Parnas (item 2) argues for up-front rational design. The tension is real but resolves on scale: defer *speculative* taxonomy; don't defer *present-structure* thinking. Ben Morris's 2016 post explicitly warns that the last responsible moment is "not a justification for procrastination" — worth citing as a guardrail.

---

### 14. Corrections at earned scope; don't over-generalize a fix

**Second pass additions**

- Peters et al., *Cognitive Science* (2022), "Generalization Bias in Science" — establishes overgeneralization as an *automatic cognitive tendency* in scientific induction; not just a logical fallacy but a documented cognitive bias. **High credibility** (peer-reviewed).
- Hasty generalization fallacy — informal-logic canon (Excelsior OWL, Logically Fallacious, Global Assignment Help). **High credibility** as named fallacy.
- Cognitive-behavioral therapy treats overgeneralization as a recognized cognitive distortion (Beck's CBT framework). **Medium–High credibility.**
- Medium post "Generalization in Software Engineering: Definition, Challenges, and Best Practices" (Kites Software) — applies the concept to software specifically; warns that *both* over- and under-generalization are failure modes. **Medium credibility** (practitioner).

**Confidence:** High for the concept; Medium for the specific software-process application. The specific framing — "when you catch the AI making a narrow mistake, don't over-correct into a blanket rule" — remains a natural application rather than a named pattern in AI-collaboration literature.

**Contradictory evidence:** The precautionary principle favors over-correcting in safety-critical domains. Not applicable to general engineering practice.

**Not Cadre-original in concept; novel as framing applied to human-AI correction dynamics.** Ground directly.

---

### 15. Defer / TBD as achievement

**Second pass additions**

- **Karl Weick, *Sensemaking in Organizations* (Sage, 1995)** — explicitly: "The goal of Weick was not to eradicate ambiguity, rather work alongside it, because it is a necessary aspect of growth." Sensemaking centers plausibility over accuracy, ongoing enactment over closure. This is strong prior art for *productive ambiguity as an active stance*. **High credibility** (primary sociology of organizations).
- Simon, *Models of Man* (1957) — satisficing. **High credibility.**
- Keats, 1817 letter — Negative Capability. **High credibility.**
- Feynman, *The Pleasure of Finding Things Out* — "I can live with doubt." **High credibility.**
- Poppendieck, "last responsible moment" (see item 13). **High credibility.**

**Confidence:** High, *upgraded*. The first pass called Weick "unverified"; this pass verifies Weick directly and adds sensemaking's explicit productive-ambiguity stance. **Not Cadre-original.**

**Contradictory evidence:** Decision-theory purists view indefinite deferral as failure. Cadre's "at the *right level*" framing anticipates this; Ben Morris's last-responsible-moment commentary (item 13) reinforces it.

---

### 16. Creative drilling with externalized tab stack

**Second pass additions**

- **Zeigarnik effect + Ovsiankina effect** — confirmed across multiple sources (super-productivity.com, nerdsip.com, right attitudes, wikipedia). The key nuance: the *memory* advantage has been questioned in recent meta-analyses, but the *resumption tendency* (Ovsiankina) is robust. Both support the "track parent branches; surface them when the current resolves" design. **High credibility.**
- **Baumeister & Masicampo (2011)** — cited as showing that a *concrete plan* for an unfinished task satisfies the brain's closure need. Direct support for the externalize-and-surface design: explicit parent-branch tracking *is* the concrete plan that closes the loop without completing the task. **Medium–High credibility** (peer-reviewed, cited in several secondary sources this pass).
- **Allen, *Getting Things Done* (2001)** — "open loops" and "psychic RAM" as a named design motif: offload unclosed items to a trusted external system. **High credibility.**
- **Engelbart, "Augmenting Human Intellect" (SRI, 1962)** — cognitive augmentation via external artifacts. **High credibility.**
- **Miller, Galanter, Pribram, *Plans and the Structure of Behavior* (1960)** — introduced "working memory" term, set up the TOTE (Test-Operate-Test-Exit) unit: a precursor to stack-based control structures in psychology. **High credibility.**
- **Russell & Norvig, *AIMA*** — DFS with an explicit open/closed list. **High credibility** (already cited in Cadre).
- **LLM conversational topic-tracking literature** — DiagGPT (2023, arxiv), OnGoal (ACM UIST 2024/2025), AgentCore Memory — recent systems that maintain conversational topic state across turns and surface unresolved goals. **Medium credibility** (mostly vendor/academic but on-point for the LLM-specific angle).

**Confidence:** High. Cadre's approach has unusually rich grounding: Zeigarnik/Ovsiankina for the *why*, Allen + Engelbart for the *externalization design*, Baumeister & Masicampo for *what actually closes the loop*, Miller et al. for the *control-structure roots*, AIMA for the *algorithmic model*, and 2024–2025 LLM conversational-tracking systems for *on-domain implementations*. **Not Cadre-original.**

**Contradictory evidence:** Flow-state literature argues against tangents. Reconciled: the practice of tracking-and-resuming *is* the anti-tangent discipline — tangents are permitted only when they close or are explicitly parked.

---

## Summary Changes vs First Pass

| Item | First-pass status | Second-pass status |
|------|-------------------|---------------------|
| 3 (three-stage review) | Partial Cadre-original on L1+L3 fusion | Re-classified: *not* Cadre-original. 2025 CI/LLM literature (Cloudflare, Augment, Propel) documents the fusion. |
| 5 (Torvalds attribution) | Unverified | Dropped. No primary source exists. Attribute the adage generically. |
| 7 (base-3 recursive retro) | Cadre-original (likely) | Partial Cadre-original. Recursive rollup grounded in map-reduce + HTA; base-3 + scale-invariant template is Cadre's synthesis and runs counter to SAFe's level-specific practice. |
| 9 (iron-law agent contract) | Not Cadre-original | Upgraded. 2025 IEEE paper applies DbC to LLM output directly. |
| 11 (0–10 verbosity scale) | Partial Cadre-original, pain-scale analogy | Upgraded. Borg CR-10 is a direct structural precedent for 0–10 subjective calibration with anchored reference points. |
| 15 (defer/TBD) | Weick unverified | Verified. Sensemaking confirmed as explicit productive-ambiguity prior art. |

---

## Knowledge Gaps

Residual gaps after the second pass:

1. **The specific base-3 arity for recursive retros (item 7).** Rule-of-three cognitive chunking (Miller's 7±2 / working-memory literature) gives a reason to prefer small grouping sizes, but no retrospective-methodology literature I found specifies 3 as the branch factor. Branching factor of 3 is defensible, not settled prior art.
2. **Cadre's particular three-tier directory layout (item 10).** Pattern is grounded; the specific (root / `.cadre/` / `.claude/` / product) cardinality is a design choice. Worth briefly stating *why* three rather than XDG's four/five in the doctrine.
3. **Overgeneralization as an AI-correction-dynamics specific pattern (item 14).** The cognitive-science prior art is solid but I did not find a named "correction-scope discipline" in human-AI-interaction literature. Cadre's framing is a novel application of an old concept.
4. **"When unsure, commit" (item 5b).** Practitioner adage without a canonical attribution. Kent Beck's TCR is the closest principled grounding; cite Beck and avoid attributing the quoted phrase.

## Recommendations

**Safely groundable (direct citations):** items 1, 2, 3, 5a, 5c, 6, 8, 9, 10 (pattern level), 12, 13, 14, 15, 16. High-confidence prior art triangulated across 2+ independent sources.

**Ground with adjacent precedents and flag the Cadre synthesis:**
- **Item 4** (sentence/page/chapter). Cite storytelling-with-git literature; flag the three-tier mapping as Cadre's packaging.
- **Item 7** (base-3 recursive retro). Cite map-reduce + HTA; acknowledge SAFe's level-specific counter-pattern; flag base-3 uniform-template as a Cadre design choice.
- **Item 11** (0–10 verbosity). Cite Grice + Giles + Borg CR-10 as the structural precedent; flag the application to dialogue as Cadre's.
- **Item 10** (three-tier namespace). Cite XDG + Rails; briefly justify the specific cardinality.

**Drop / revise:**
- **Item 5b**: drop the Torvalds attribution for "commit early, commit often." Cite Kent Beck's TCR for the underlying principle.

**Deeper investigation not warranted at this stage.** The remaining gaps are either Cadre design choices (not missing research) or named-concept-missing cases where Cadre's framing is a natural, defensible application of an old idea.

---

## Related but Out of Scope

- Mission Command / commander's intent, state-space search (Russell & Norvig), orchestrator-worker (Anthropic), RAG faithfulness (RAGAS, Lewis et al.), sycophancy (Sharma et al., Panickssery et al.) — already cited in existing `CLAUDE.md` doctrine; not re-grounded here.
- Anthropic Claude Code sub-agent system + hooks + slash commands reference docs — vendor primary sources already used implicitly; not part of the 16-item workflow grounding.
