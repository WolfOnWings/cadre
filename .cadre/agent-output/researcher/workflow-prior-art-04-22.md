# Prior-Art Research Brief: Cadre Workflow Principles

**Date:** 2026-04-22
**Scope:** L2 grounding for 16 Workflow rules slated for `CLAUDE.md`.
**Deliverable:** Named prior art per item, with credibility/confidence ratings, contradictory evidence, and Cadre-original flags where warranted.

Sources are verified via web search conducted for this brief. Items flagged "unverified — requires confirmation" are recalled but not re-checked against primary sources in the search window.

---

## Theme 1 — Git and Review Architecture

### 1. Git worktrees — sibling-directory convention, per-feature, multi-session
**Prior art**
- `git-worktree` documentation (git-scm.com). The command itself is the primary source; worktree semantics and the suggestion that worktrees be outside the main working tree are on the man page. **High credibility.**
- Practitioner conventions around `projectname-branchname/` sibling layout: Nick Nisi (nicknisi.com), DataCamp worktree tutorials, DEV.to practical guides. These are consistent with each other on the "sibling directory, one per feature, descriptive name" pattern. **Medium credibility** (practitioner blogs, not a formal standard).
- Scott Chacon, "GitHub Flow" (2011): per-feature short-lived branch norm that worktrees naturally accommodate. **High credibility** (Chacon is git co-founder/early GitHub).
- Paul Hammant, *Trunk-Based Development*: short-lived feature branches (≤1–2 days) as the discipline worktrees support. **High credibility** (primary proponent of TBD).

**Confidence:** Medium–High. The worktree primitive and GitHub Flow/TBD workflows are authoritative. The specific *sibling-directory* convention is a strong community consensus rather than a canonical spec — confidence is medium on the convention, high on the underlying primitives.

**Contradictory evidence:** Some teams nest worktrees inside the repo, some use a dedicated `~/worktrees/` pool rather than siblings. No authoritative standard picks one.

**Not Cadre-original** — well-grounded in git itself plus GitHub Flow / TBD literature.

### 2. Plan-before-execute (propose / review / execute as separate acts)
**Prior art**
- David L. Parnas & Paul Clements, "A Rational Design Process: How and Why to Fake It" (IEEE TSE, 1986). Explicitly argues design documents precede code; even when the design process is iterative in reality, you fake the rational sequence after the fact. **High credibility** (seminal paper).
- Fred Brooks, *The Mythical Man-Month* (1975, anniversary 1995), ch. 11 "Plan to Throw One Away" — plan for the throwaway deliberately rather than shipping the pilot. **High credibility.**
- Anthropic, Claude Code Plan Mode (official docs + community writeups, 2025). Plan mode codifies the propose-then-approve-then-execute separation as a first-class harness feature — direct prior art for what Cadre is doing. **High credibility** (vendor spec).

**Confidence:** High. Parnas supplies the philosophical grounding; Claude Code plan mode supplies the direct operational precedent.

**Contradictory evidence:** "Cowboy coding" and some XP readings de-emphasize up-front planning in favor of emergent design (see item 13). The tension is resolved by keeping plans lightweight and at the right altitude rather than abandoning them.

**Not Cadre-original.**

### 3. Three-review architecture: commit + push + merge gates, each L1+L3
**Prior art**
- Jez Humble & David Farley, *Continuous Delivery* (Addison-Wesley, 2010). The deployment pipeline is explicitly a *sequence of gates* (commit stage, acceptance stage, capacity, manual, production), each a stronger filter. **High credibility.**
- Pre-commit vs pre-push hook convention (Husky, lint-staged, Prettier docs). Fast checks at commit, heavier checks at push. **Medium credibility** (tooling docs, community-codified).
- Defense-in-depth: originally NSA/military doctrine (Wikipedia, Palo Alto Networks, Imperva). Redundant independent layers so no single failure is catastrophic. **High credibility** as a named pattern — though most sources are cybersecurity-focused, not software-review-focused.
- Toyota jidoka / andon cord (Toyota global site, Lean Enterprise Institute). "Stop the line" as an operator-triggered quality gate embedded in the process. **High credibility** (primary Toyota sources + LEI).

**Confidence:** High for the *multi-gate* pattern. Medium for the specific *L1+L3 fusion at every gate* framing — that combination appears to be Cadre's synthesis; each layer is grounded but the pairing is a design choice, not a cited pattern.

**Contradictory evidence:** Some practitioners argue single-gate PR review is sufficient; adding gates has compliance/latency cost. CD literature itself notes over-gating as an anti-pattern.

**Partial Cadre-original** — the *fusion discipline* (deterministic+judgmental at every gate) is Cadre's framing. Gate architecture itself is thoroughly grounded.

### 4. Book metaphor: commit = sentence, push = page, merge = chapter
**Prior art**
- Tim Pope, "A Note About Git Commit Messages" (2008, tbaggery.com) — the 50/72 rule, commit messages as small narrative units. **High credibility** (the community-canonical reference).
- Chris Beams, "How to Write a Git Commit Message" (chris.beams.io, widely cited). The seven rules, including "use imperative mood" and "explain why" — commit-as-small-rhetorical-act framing. **Medium–High credibility** (practitioner-canonical).
- Linus Torvalds's widely circulated guidance that a commit should explain itself well enough that a future bisecting maintainer can understand the change (quoted in the Subsurface README; reproduced in Matthew Hudson gist). **Medium credibility** (quoted from a primary source, widely reproduced but worth verifying against the current README).
- Test && Commit || Revert (Kent Beck + Barlindhaug et al.): tiny commits as units of thought, driven by tests. **High credibility** (Beck's own Medium post).

**Confidence:** Medium. The underlying idea — commits-as-narrative, coherence-based rather than line-count-based sizing — is strong prior art. The *specific three-tier sentence/page/chapter mapping onto commit/push/merge* appears to be Cadre's own literary frame. I did not find that specific trichotomy named in commit-hygiene literature.

**Contradictory evidence:** None found against coherence-based sizing. The counterposition is "atomic commits are fetishistic" — I did not find serious prior art defending it.

**Partial Cadre-original** — the literary trichotomy itself looks novel; commit-as-narrative-unit is grounded.

### 5. Commit norms: Conventional Commits + "when unsure commit" + logical-chunk commits
**Prior art**
- Conventional Commits v1.0.0 (conventionalcommits.org), derived from AngularJS commit guidelines. **High credibility** (published spec, wide adoption).
- Kent Beck, *Extreme Programming Explained* (1999) + Beck's TCR writeup (Medium). Tiny, test-validated commits as the unit of progress. **High credibility.**
- "Commit early, commit often" is a ubiquitous git-community adage; I did *not* find a primary-source Torvalds quote saying exactly that in the search window. Closest grounded version: Torvalds's commit-message guidance in the Subsurface README. **Unverified — requires confirmation** for the exact "commit early, commit often" attribution.
- Logical-chunk separation (scaffolding / tests / implementation / refactor): aligns with Kent Beck's separate-structural-from-behavioral-change principle in *Tidy First?* and is implicit in TCR practice. **Medium credibility.**

**Confidence:** High for Conventional Commits and TDD-cadence claims. Medium for the "commit when unsure" framing — this aligns with TCR's fail-safe philosophy but I did not find a single authoritative source that articulates it as a rule.

**Contradictory evidence:** Some teams squash relentlessly and consider many small commits noise; GitHub Flow actually encourages squashing on merge. This doesn't conflict with Cadre's use (each commit is a checkpoint during work; merge-stage is a separate concern).

**Not Cadre-original** — each piece is grounded; the synthesis is novel but uncontroversial.

### 6. Retros at end of every session, non-failure-gated
**Prior art**
- Norman L. Kerth, *Project Retrospectives* (Dorset House, 2001). Origin of the Prime Directive and the modern retro form. **High credibility.**
- Esther Derby & Diana Larsen, *Agile Retrospectives: Making Good Teams Great* (Pragmatic Bookshelf, 2006). Foreword by Ken Schwaber. Canonical Agile-era retro handbook. **High credibility.**
- Google SRE Book, *Postmortem Culture* chapter. Blameless postmortems; explicitly generalizes to "not just when things fail." **High credibility.**
- Amy Edmondson on psychological safety (referenced in multiple SRE/retro sources). **High credibility.**

**Confidence:** High. Retrospectives are among the most deeply grounded Agile practices. The "non-failure-gated" framing — do them always, not just after incidents — is explicit in Kerth and in Google SRE's post-incident-review-versus-postmortem distinction.

**Contradictory evidence:** "Retro fatigue" is a known anti-pattern (see practitioner writing); cadence/quality can degrade if retros become rote. Cadre's per-session cadence is very tight and invites this risk.

**Not Cadre-original.**

### 7. Base-3 recursive retro (L1 from 3 handoffs → L2 from 3 L1s → Ln from 3 L(n-1)s)
**Prior art**
- Annett & Duncan, Hierarchical Task Analysis (1967). Tasks decompose into sub-goals recursively, with uniform re-description rules at each level. The *methodological* precedent for "same template at every altitude." **High credibility.**
- Fractal cognition / recursive hierarchical embedding literature (MDPI 2025; *Cerebral Cortex* 2023 on fractal brain organization). Scale-invariant structure in cognition. **Medium credibility** (primary research, but speculative re: applied practice).
- Anthropic's orchestrator-worker pattern + hierarchical summarization in LLM practice (long-context research). "Input compression up the stack" is established in LLM summarization and in map-reduce synthesis. **Medium credibility.**
- The base-3 arity specifically: I found **no established prior art.** Three-as-a-grouping appears in management ("rule of three") and in B-tree branching factors but not as a codified retro arity.

**Confidence:** Low–Medium. Hierarchical retros are a natural extension of HTA thinking and map-reduce synthesis, but I could not find the specific pattern of "base-3 recursive retro with uniform template" documented in the retrospective literature.

**Contradictory evidence:** Some nested-retro literature (e.g., Spotify "guild" retros, SAFe "inspect and adapt") uses different branching arities and different templates at each level — the *scale-invariance* Cadre asserts is not universal.

**Cadre-original (likely).** The base-3 uniform-template recursion looks like Cadre's own synthesis. Ground the adjacent ideas (HTA, hierarchical summarization) but mark this item as a Cadre innovation.

---

## Theme 2 — Agent Architecture

### 8. Main session as orchestrator; specialized subagents when scope justifies
**Prior art**
- Anthropic, "Building Effective AI Agents" (anthropic.com/research/building-effective-agents, 2024) and the orchestrator-workers cookbook notebook (anthropic/claude-cookbooks). Central LLM decomposes and delegates; workers execute; orchestrator synthesizes. **High credibility** (vendor primary source).
- Spring AI "Agentic Patterns" (spring.io blog, 2025) — cites Anthropic directly. **Medium credibility** (implementation of the pattern).
- Cloudflare Agents docs re-publishing Anthropic patterns. **Medium credibility.**

**Confidence:** High. This is the central pattern Cadre is composed around, and the direct vendor source exists.

**Contradictory evidence:** Single-agent architectures (ReAct, self-reflective agents) argue against orchestrator-worker for latency/cost reasons. Not a refutation — a tradeoff.

**Not Cadre-original.** Directly grounded in Anthropic.

### 9. Iron law: declared (input schema → output artifact) contract with file footprint
**Prior art**
- Bertrand Meyer, *Object-Oriented Software Construction* (1988; 2nd ed. 1997). Design by Contract: preconditions, postconditions, invariants. **High credibility.**
- Tony Hoare, Hoare logic (the formal foundation Meyer builds on). **High credibility.**
- Doug McIlroy's Unix philosophy (1978 summary at Bell Labs): "do one thing well; work together; handle text streams." Explicit interface discipline. **High credibility** (primary McIlroy quote preserved in Wikiquote and Unix philosophy literature).
- Dijkstra, "On the Role of Scientific Thought" (1974): separation of concerns. **High credibility.**

**Confidence:** High. The input→output contract frame is directly Meyer's DbC; the "one thing well" is directly McIlroy; both are foundational.

**Contradictory evidence:** Hidden-state / stateful agents (e.g., long-running ReAct loops) deliberately violate strict input/output contracts for flexibility. Again, a tradeoff, not a refutation.

**Not Cadre-original.** Synthesis of Meyer + McIlroy onto agents is Cadre-novel but uncontroversial.

### 10. Three-tier file namespace: root / `.cadre/` / `.claude/` / product source
**Prior art**
- XDG Base Directory Specification (freedesktop.org). Canonical pattern for per-namespace hidden directories with role-separated contents (config/data/state/cache). **High credibility** (published spec).
- Dijkstra's separation of concerns (1974, as above). **High credibility.**
- Ruby on Rails "convention over configuration" (DHH, 2004; Rails 1.0 Dec 2005). Convention-driven directory layout as an assumed developer contract. **High credibility.**
- Git's own `.git/` convention — hidden-namespace-per-tool is precedent.

**Confidence:** High for the *pattern*; medium for Cadre's specific three-tier layout. The pattern of "hidden directory per subsystem, human-facing at root" is so common it barely needs citation, but the *specific three-way split* (operational vs. harness-primitive vs. product) is Cadre's refinement.

**Contradictory evidence:** Some projects flatten everything into a single `.config/` or conversely scatter across many dotfolders. The three-tier specifically is a design choice.

**Partial Cadre-original.** The pattern (dotfolder-per-concern, root for humans) is grounded. The specific `.cadre/` vs `.claude/` vs product-source split is Cadre's synthesis.

---

## Theme 3 — Working with the Human (Human–AI Collaboration)

### 11. Verbosity calibration (0–10 "yanking" scale; target ~5)
**Prior art**
- Howard Giles, Communication Accommodation Theory (CAT) — originally Speech Accommodation Theory, 1970s; Giles & Coupland 1991. Convergence/divergence in linguistic style to interlocutor. **High credibility** (foundational social psychology).
- Paul Grice, "Logic and Conversation" (1975). Maxim of Quantity: "make your contribution as informative as required; no more, no less." Maxim of Manner: brevity, orderliness. **High credibility** (philosophy-of-language foundation).
- LLM response-length control literature (ScienceDirect 2025 on length-difference positional encoding; Claude prompting best-practices docs). **Medium credibility** (recent, vendor + research).

**Confidence:** High on the *principle* of calibrated verbosity. The specific 0–10 numeric scale and "~5" target are Cadre's operationalization; I found no prior art for that exact scale (analogous to 1–10 pain scales in healthcare — an adjacent analogy worth checking but not a direct precedent).

**Contradictory evidence:** None found against calibration itself. Calibration disciplines are well-grounded.

**Partial Cadre-original.** Principle is grounded (Grice + CAT). Scale numeric is Cadre's UX invention.

### 12. Exchange rhythm: short back-and-forth (1-2-3-4-5) vs monolithic (1-2 bloat)
**Prior art**
- Sacks, Schegloff & Jefferson, "A Simplest Systematics for the Organization of Turn-Taking in Conversation," *Language* 50 (1974). The founding paper on turn-taking analysis. **High credibility.**
- Kent Beck, *Extreme Programming Explained* (1999). Short feedback cycles, pair programming turn-switching. **High credibility.**
- Martin Fowler, "On Pair Programming." **Medium credibility** (practitioner-canonical essay).
- XP's "minimal delay between action and feedback is critical to learning." **High credibility** (Beck).

**Confidence:** High. The underlying claim — short turns produce better collaborative output than long monologues — is grounded in conversation analysis (Sacks et al.) and XP (Beck, Fowler).

**Contradictory evidence:** Deep-work / flow literature (Cal Newport, following Csikszentmihalyi) argues for *longer* uninterrupted sessions. Reconciled by scale: short turns within a session, long sessions for the whole.

**Not Cadre-original.**

### 13. Don't pre-invent taxonomy; "we don't know yet" as a valid answer
**Prior art**
- Kent Beck, *Extreme Programming Explained* (1999). YAGNI ("You Aren't Gonna Need It") originated in a conversation between Beck and Chet Hendrickson on the C3 project; formalized in the XP book. **High credibility.**
- Donald Knuth, "Structured Programming with Go To Statements," *ACM Computing Surveys* (1974): "premature optimization is the root of all evil." Knuth quotes and builds on Hoare here. **High credibility** (primary source verified).
- Martin Fowler, "Yagni" (martinfowler.com/bliki). **Medium credibility** (practitioner-canonical gloss).
- Mary & Tom Poppendieck, *Lean Software Development* (2003). The "last responsible moment" principle — defer decisions until deferring would foreclose options. **High credibility.**
- Eric Ries, *The Lean Startup* (2011). Build-measure-learn; MVP as "just enough to learn." **High credibility.**
- Emergent design literature (Rebecca Wirfs-Brock on agile architecture, Ruth Malan). **Medium credibility.**

**Confidence:** High. This is one of the most thoroughly grounded items on the list.

**Contradictory evidence:** Parnas (item 2) argues *against* YAGNI-as-license-for-no-thinking; good design still needs up-front thought. These are compatible: don't invent *speculative* taxonomy, but do think carefully about present structure.

**Not Cadre-original.**

### 14. Corrections at earned scope; don't over-correct a narrow mistake into a blanket rule
**Prior art**
- Hasty generalization / overgeneralization fallacy — informal-logic canon (Scribbr, Logically Fallacious, Wikipedia "Faulty generalization"). **High credibility** as a named fallacy; medium-prestige sources.
- Cognitive-distortion literature (Beck's CBT framework, PsychologyTools) treats overgeneralization as a recognized distortion. **Medium–High credibility.**
- Behavioral-science "overcorrection" literature (Hobbs & Foxx 1970s-era ABA work, *Rehabilitation Psychology* 1976): overcorrection as a learning-theory phenomenon. **Medium credibility** — note this is the *behavioral-modification* sense, distinct but related.
- Bias-correction overshoot: recent arXiv (2025) paper on overcorrection in racial-bias contexts — demonstrates the overshoot-in-the-opposite-direction effect is empirically real. **Medium credibility** (preprint).

**Confidence:** Medium–High. The fallacy is canonically named. The specific *software-process* framing ("don't promote a one-off correction to a blanket rule") does not have a named locus that I found, but it's a natural application.

**Contradictory evidence:** None directly. One could argue the precautionary principle favors over-correcting, but that applies to safety-critical domains, not general engineering practice.

**Not Cadre-original** in concept; novel in its explicit application to human-AI correction dynamics.

### 15. Defer / TBD as achievements — parking questions at the right level
**Prior art**
- Herbert A. Simon, *Models of Man* (1957), "A Behavioral Model of Rational Choice" (1955). Satisficing and bounded rationality. **High credibility** (Nobel-laureate primary source).
- John Keats, letter to George and Thomas Keats, 22 December 1817. Negative Capability: "capable of being in uncertainties, mysteries, doubts, without any irritable reaching after fact and reason." **High credibility** (primary letter text is public; Wikipedia and Poetry Foundation both quote it consistently).
- Richard Feynman, *The Pleasure of Finding Things Out* (collected interviews/essays). "I can live with doubt and uncertainty and not knowing." **High credibility** (book + documentary, multiple corroborating quote aggregators).
- Mary & Tom Poppendieck, "last responsible moment" (item 13). **High credibility.**
- Karl Weick / high-reliability organizing: productive ambiguity, sensemaking under uncertainty. **Unverified — requires confirmation** for specific claims; not searched in depth here.

**Confidence:** High. Satisficing + Negative Capability + Feynman on uncertainty is a strong trio.

**Contradictory evidence:** Decision-theory purists would argue that indefinite deferral is a failure mode. Cadre's framing ("at the *right level*") anticipates this: defer is not neglect.

**Not Cadre-original.**

### 16. Creative drilling / open-tabs stack — depth-first with tracked parent branches
**Prior art**
- Bluma Zeigarnik, *Psychologische Forschung* (1927). The Zeigarnik effect: interrupted/unfinished tasks remain more cognitively accessible. **High credibility** (primary psychology source). Note: a 2025 meta-analysis found the memory advantage inconsistent, but the *tendency to resume* (Ovsiankina effect) holds — both support the "tracked parent branches" framing.
- David Allen, *Getting Things Done* (2001). "Open loops" and externalizing unfinished items into a trusted system to free working memory. **High credibility.**
- Douglas Engelbart, "Augmenting Human Intellect: A Conceptual Framework" (SRI report, 1962). External artifacts as cognitive scaffolding — the foundational exocortex concept. **High credibility** (primary SRI/AFOSR report).
- Tony Buzan, mind maps / radiant thinking (1974 BBC *Use Your Head*). Tree-structured note-taking. **Medium credibility** (popular rather than rigorous, but widely adopted).
- Miller, Galanter & Pribram, *Plans and the Structure of Behavior* (1960): introduced the "working memory" term. **High credibility.**
- Russell & Norvig, *AIMA* — depth-first search and backtracking with a stack. The CS-algorithmic analog of "follow the branch, unwind, resume." **High credibility** (already cited in Cadre's current `CLAUDE.md`).

**Confidence:** High. The ensemble — Zeigarnik on why open loops nag, Allen on how to externalize them, Engelbart on cognitive augmentation, AIMA on stack-based DFS — gives strong coverage.

**Contradictory evidence:** Flow-state literature (Csikszentmihalyi) argues interruptions and tangents *degrade* performance. Reconciled: the practice is to permit asides *only when they close*; the stack discipline itself is the anti-interruption mechanism.

**Not Cadre-original.**

---

## Knowledge Gaps

Items with thin or partially-Cadre-original findings:

- **Item 4 (literary commit metaphor).** The specific sentence/page/chapter mapping onto commit/push/merge is unsourced. The underlying "commits as units of thought" is solid.
- **Item 7 (base-3 recursive retro).** Uniform-template recursion and the base-3 arity specifically appear Cadre-original. Hierarchical summarization and HTA are adjacent, not identical.
- **Item 11 (0–10 verbosity scale).** The principle is grounded; the numeric operationalization is Cadre's. An analogy to 1–10 pain scales in medical UX is suggestive but not a direct citation.
- **Item 5 ("commit early, commit often" Torvalds attribution).** Could not verify in this search. Safer to drop the attribution or cite the community adage generically.
- **Item 14 (overcorrection in human-AI correction dynamics).** General concept is grounded; the specific application to LLM interaction appears to be novel framing. Acceptable to claim the concept and apply it.

## Recommendations

**Safe to ground directly (13 of 16):** Items 1, 2, 3 (partial), 5, 6, 8, 9, 10 (partial), 12, 13, 14, 15, 16. These have high-credibility, triangulated prior art.

**Mark as Cadre-original, with adjacent grounding:**
- **Item 7** (base-3 recursive retro). Cite HTA and hierarchical summarization as inspiration; flag the base-3 uniform-template recursion as Cadre's synthesis.
- **Item 4** (literary commit metaphor). Cite Pope/Beams/TCR for the commit-as-narrative root; flag the sentence/page/chapter mapping as Cadre's literary framing.
- **Item 11** (verbosity scale numeric). Cite Grice + Giles for the principle; flag the 0–10 scale as Cadre UX.

**Deeper investigation worth doing before merging:**
- The Torvalds "commit early, commit often" quote (item 5) should be sourced or dropped.
- Item 3's *fusion* of deterministic+judgmental review at every gate could benefit from a check against Google's internal review literature (Google Engineering Practices public docs) and AI-assisted-review CI/CD sources beyond what this pass covered.
- Item 10's three-tier layout could be stress-tested against XDG's four-category split (config/data/state/cache) — does Cadre's split align or diverge?

## Related but Out of Scope

- **Mission Command doctrine** (commander's intent): already cited in existing `CLAUDE.md`; not part of the 16-item workflow brief.
- **Russell & Norvig state-space search**: already cited in `CLAUDE.md`; referenced above only where item 16's DFS analogy is load-bearing.
- **Anthropic sycophancy/self-preference papers** (Sharma et al., Panickssery et al.): already cited for L3 framing in `CLAUDE.md`; not re-grounded here.
- **RAGAS / Lewis et al. on RAG faithfulness**: already cited in `CLAUDE.md` grounding section.

These belong to the L2 layer of the *non-workflow* sections of `CLAUDE.md` and are outside this brief's scope.
