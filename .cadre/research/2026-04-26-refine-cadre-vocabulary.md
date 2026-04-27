# refine-cadre Vocabulary Payload — Research Brief

**Date:** 2026-04-26
**Author:** Researcher subagent (Cadre)
**Scope:** Source the canonical practitioner vocabulary for `refine-cadre`, a skill producing ranked streamline-opportunity reports across four layers — (1) general performance, (2) LLM reasoning strategy, (3) Claude Code feature mapping, (4) delight & polish. Output is a vocabulary payload that conforms to Cadre's persona-routing discipline (15-30 terms, 3-5 clusters, 15-year practitioner test, attribution for named frameworks).

---

## 1. Methodology

**Sources consulted:**
- `.cadre/references/vocabulary-routing.md` — load-bearing rules, the 15-year test, banned consultant-speak list.
- `.cadre/references/persona-science.md` — PRISM findings, alignment-accuracy tradeoff, attribution-amplifies-routing.
- `.cadre/references/creation-techniques.md` — for Layer 2 anchoring (Liu et al., Sclar et al., Lee et al. Format Tax, Baxi CDCT, Jaroslawicz IFScale, Chen DETAIL, Chroma context-length, Veseli primacy/recency).
- `.cadre/references/creating-{skills,agents,hooks}.md` — for Layer 3 anchoring on Cadre's own framing of harness primitives.
- Live docs at `code.claude.com/docs/en/hooks` and `code.claude.com/docs/en/skills` — verified canonical surface names for hook events (PreToolUse, SessionStart, SubagentStop, etc.) and skill frontmatter fields (`disable-model-invocation`, `context: fork`, `allowed-tools`, `paths`).
- Existing Cadre skills (`creator-cadre`, `plan-cadre`) for in-house vocabulary patterns and clustering style.
- Parametric memory for canonical author-attribution pairs in performance engineering and interaction design (Knuth, Gregg, Nygard, Norman, Tognazzini, Krug, Cooper, Saffer, Wroblewski).

**Ruled out:**
- Consultant-speak per the banned list — "leverage," "synergy," "robust solution," "best practices," "optimize," "streamline," "holistic."
- Buzzword stacks (e.g., "AI-driven blockchain microservices") that scatter activation.
- Niche jargon I couldn't ground in a recognized canonical text (a few candidates flagged below).
- Domain-mismatched terms from ML research lit when a closer practitioner-canon term existed.

**Triangulation rule applied:** every term either has a named originator/work I can cite OR is a surface-name verified in live CC docs OR is canon in practitioner discourse (e.g., "p99 latency," "blast radius") at a level a senior would use unprompted with a peer.

---

## 2. Cluster Decision

**Choice:** keep four clusters, one per layer. The user's framing already reflects natural knowledge proximity — performance engineering, prompt-engineering research, harness primitives, and interaction design are four genuinely distinct embedding regions, and Cadre's vocabulary-routing rules permit 3-5 clusters. Re-organizing by knowledge proximity would collapse Layer 1 and Layer 2 (both "things that make systems faster/better") into a fuzzy super-cluster and lose the routing precision the layered output depends on. Four clusters at 5-7 terms each lands inside the 15-30 total budget.

**Total terms proposed:** 24 (6+5+7+6).

---

## 3. Term-by-Term Justification

### Cluster 1 — Performance Engineering & Resilience (Layer 1)

| Term | Justification |
|---|---|
| **flame graph (Gregg)** | Brendan Gregg's signature artifact (*Systems Performance*, 2013/2020); SRE/perf-engineers reach for it daily. Routes directly to profiling canon. |
| **p99 latency** | Tail-latency vocabulary; standard SRE register. Already in vocabulary-routing.md's expert-term table. |
| **Amdahl's law** | Gene Amdahl, 1967 — the parallelization ceiling. Senior practitioners invoke it when ranking optimizations by upper-bound payoff. |
| **circuit breaker pattern (Nygard, *Release It!*)** | Canonical resilience pattern; Cadre's vocabulary-routing.md uses this as the reference example. |
| **blast radius** | SRE / incident-response vocabulary; Google SRE book and standard postmortem language. Load-bearing for "what changes when we streamline this." |
| **Hyrum's law** | Hyrum Wright — "with sufficient users, every observable behavior of your system will be depended on." Names the hidden cost of streamlining. |

**Notes:** Considered "premature optimization is the root of all evil" (Knuth, 1974) but Knuth's actual phrasing is more nuanced and the snippet is overused — likelier to route to listicle clusters than to performance-engineering clusters. Rejected. Considered "mechanical sympathy" (Martin Thompson via Jackie Stewart) — flagged below as choice-point.

### Cluster 2 — LLM Reasoning Strategy (Layer 2)

| Term | Justification |
|---|---|
| **lost-in-the-middle (Liu et al., TACL 2024)** | The U-shaped attention curve that drives Cadre's "position of critical instructions" technique. Single most load-bearing term in this layer. |
| **format tax (Lee et al., arXiv 2604.03616)** | The decoupling principle for output format requirements. Direct route to Technique 3 in `creation-techniques.md`. |
| **instruction density / IFScale (Jaroslawicz et al., arXiv 2507.11538)** | Names the constraint-count decay curve. Practitioners working on agentic-prompt reliability reach for this. |
| **prompt format sensitivity (Sclar et al., arXiv 2310.11324)** | The 76-point swing finding; routes to format-choice canon. |
| **specification level (Chen et al., DETAIL framework)** | Underspecification as the hidden root cause behind apparent prompt sensitivity. |

**Notes:** Considered including "RLHF helpfulness conflict (Baxi, CDCT)" — load-bearing in Cadre's framing but more niche; the surface "helpfulness conflict" alone is clearer and the attribution still routes. Kept count at 5 (rather than 7) because too-many-terms in this cluster risks the same "buzzword stacking" failure mode the discipline warns against, and 5 well-chosen anchors plus the references file is enough.

### Cluster 3 — Claude Code Harness Primitives (Layer 3)

All terms in this cluster were verified against live docs at `code.claude.com/docs/en/{hooks,skills,sub-agents}` on 2026-04-26.

| Term | Justification |
|---|---|
| **subagent dispatch** | Standard CC vocabulary for fire-once delegation via the Agent tool. Cadre's `creating-agents.md` uses this exact framing. |
| **hook event matcher (PreToolUse, PostToolUse, SessionStart, SessionEnd, SubagentStop)** | The verified canonical event identifiers as of 2026-04-26 docs. Naming the matchers, not "hook configuration," routes to the right surface. |
| **`.claude/skills/` progressive disclosure** | Cadre's framing in `creating-skills.md` Technique 5 — references loaded on demand. The path itself is load-bearing because it disambiguates from `.claude/agents/` and `.claude/commands/`. |
| **frontmatter (`disable-model-invocation`, `context: fork`, `allowed-tools`)** | Verified live frontmatter fields. Naming the actual field keys routes to harness behavior, not to the abstract idea of "skill metadata." |
| **MCP server / elicitation** | Model Context Protocol — the integration surface and the elicitation event class. Live verified. Critical for "what could be moved to MCP?" streamline questions. |
| **CLAUDE.md doctrine (path-specific rules, `--add-dir`)** | The persistent-instructions surface and the additional-directories pattern. Routes to the memory layer of CC. |
| **settings.json / `allowedTools` permissions** | Where hooks and permission rules live. Names the file and the field, both load-bearing. |

**Notes:** Considered "agent teams" / "teammate mode" but they're a separate sub-surface and refine-cadre's primary scope is single-session work. Kept it cleaner. Considered "plan mode" — useful but the term is generic enough that "ExitPlanMode tool" or "plan-mode entry" would route better; flagged as choice-point.

### Cluster 4 — Interaction Design & Microcopy (Layer 4)

| Term | Justification |
|---|---|
| **affordance / signifier (Norman, *Design of Everyday Things*, 1988/2013)** | Norman's revised distinction (signifier added in 2013 ed.) is the canonical entry point to interaction design. Routes to the broadest IxD knowledge cluster. |
| **anticipation (Tognazzini, *First Principles of Interaction Design*)** | Bruce Tognazzini's first principle — the interface anticipates the user's next need. Specifically what "delight" reduces to when made rigorous. |
| **microinteraction (Saffer, *Microinteractions*, 2013)** | Dan Saffer's frame — trigger / rules / feedback / loops-and-modes. Names the unit of polish. |
| **progressive disclosure (Nielsen)** | Jakob Nielsen / NN/g framing; adjacent to Cadre's own use of the term for skill structure but in IxD it specifically names the pattern of revealing complexity on demand. |
| **error prevention > error recovery (Nielsen heuristic #5)** | Nielsen's 10 Usability Heuristics; senior IxD practitioners cite by number. The inversion priority is what separates polish from cleanup. |
| **don't-make-me-think (Krug)** | Steve Krug's eponymous principle (*Don't Make Me Think*, 2000/2014). Shorthand a senior IxD'er uses unprompted. |

**Notes:** Considered "Fitts's law" — strong canon, but mostly routes to pointer/click physical-input clusters that don't apply to a CLI agent harness. Rejected for domain mismatch. Considered Wroblewski's "mobile first" / form patterns — same reason, wrong substrate. Considered Cooper's "personas" (*About Face*) — overlaps too much with Cadre's persona-science already loaded; would double-route.

---

## 4. Vocabulary Effectiveness Check

Per `vocabulary-routing.md`'s test, comparing expert vs generic phrasing for the most load-bearing terms:

| Expert term | Generic equivalent | Expected routing difference |
|---|---|---|
| **flame graph (Gregg)** | "show where time is spent" | Expert routes to perf-engineering canon — interactive sampling, on-CPU vs off-CPU, differential flame graphs. Generic routes to "make a chart" / generic profiling intuition. **Strong differential expected.** |
| **lost-in-the-middle (Liu et al.)** | "instructions in the middle get ignored" | Expert routes to the U-shaped curve, the position-as-fix vs content-as-fix distinction, Hsieh's positional-attention-bias finding. Generic routes to vague reordering advice. **Strong differential expected.** |
| **hook event matcher** | "the thing that decides when a hook runs" | Expert routes to the actual matcher syntax (PreToolUse + tool-name pattern). Generic stays at the conceptual level and is likely to confabulate matcher names. **Strong differential expected — this is exactly the failure mode `creating-hooks.md` warns about.** |
| **microinteraction (Saffer)** | "small UI details" | Expert routes to trigger/rules/feedback/loops-and-modes — Saffer's four-part decomposition. Generic routes to "make it pretty." **Strong differential expected.** |
| **blast radius** | "what could go wrong" | Expert routes to incident-response / change-management canon — how incidents propagate, scope of impact, isolation patterns. Generic routes to risk-aversion language. **Moderate-to-strong differential.** |

All five terms pass the test — expert phrasing should produce noticeably more structured, domain-specific output. None look like vocabulary theater.

---

## 5. Choice-Points (User to Resolve)

These are decisions where reasonable people disagree. Surfacing them rather than forcing a call.

1. **"Blast radius" — Layer 1 or Layer 3?** It originated in SRE/perf canon (resilience engineering) but for a Cadre skill it most often applies to "what does this hook touch." Currently placed in Layer 1; reasonable to move to Layer 3 or duplicate.
2. **"Mechanical sympathy" (Martin Thompson, attributed to Jackie Stewart)** — strong term in low-latency systems engineering but might be too niche for a generalist refine skill. Flag: include or not?
3. **Layer 2 size — 5 or 7 terms?** Could add `helpfulness conflict (Baxi, CDCT)` and `total context volume (Chroma)` to round to 7. Trade: more routing surface vs. more dilution. I picked 5; user can expand.
4. **Cluster 3 hook events — list all five (PreToolUse, PostToolUse, SessionStart, SessionEnd, SubagentStop) or just name the class "hook event matcher"?** Listing them is more concrete and verified-current; naming the class is shorter and won't go stale when CC adds new events. I went with both (the class name plus a parenthetical of the canonical five).
5. **"Plan mode" vs. "ExitPlanMode tool"** — same trade. Generic name routes broadly; specific name routes to the actual harness API.
6. **Should Cluster 4 include a microcopy-specific term?** Microcopy is its own canon (Kinneret Yifrah, *Microcopy: The Complete Guide*) and refine-cadre's polish layer often lives at exactly that altitude. Currently absent; arguably should replace one of the broader IxD terms.
7. **Re-cluster by proximity instead of layer?** I rejected this in §2 — willing to revisit if the user wants the skill to surface cross-layer streamlines (e.g., "this hook is slow AND has bad error recovery") more naturally, in which case combined clusters might route better.

---

## 6. Open Questions / Out of Scope

- **Empirical validation.** I haven't run the vocabulary effectiveness test as actual A/B comparisons — the differential predictions in §4 are theory-grounded but not measured. A first-draft skill is the right place to find this out empirically.
- **Layer 1 — algorithmic complexity coverage.** I leaned toward systems-engineering canon (Gregg, Nygard) over algorithms canon (Knuth, CLRS, big-O hierarchy) because refine-cadre's likely outputs are about real-system streamlining, not asymptotic analysis. If the user expects "this loop is O(n²) and should be O(n log n)" output, the cluster needs Knuth/CLRS terms added. Flag: confirm the layer's center of gravity.
- **Crockford / Crocker / Henderson** — the user's prompt named these as Layer 1 canon. I dropped Crockford (his canon is JS-specific) and Crocker (didn't ground a clean attribution — possible misremember as Crockford?). Henderson refers to Cary Henderson — couldn't ground confidently; the canonical *Systems Performance* author is Gregg, so I substituted. Flag: was the user pointing at someone specific I missed?
- **Resilience-engineering depth.** Hollnagel, Woods, Cook on "Safety-II" / "drift into failure" is a richer canon for refine-style work but harder to land in a 6-term cluster without going abstract. Out of scope for this brief; available as a Layer 1 expansion.
- **Attribution density.** I attributed every named framework where I'm confident; left attribution off for widely-known surface names (`p99`, `MCP`). User can dial attribution up or down per cluster.

---

## 7. Confidence Summary

| Cluster | Confidence | Why |
|---|---|---|
| Layer 1 — Performance | **High** | All terms grounded in named canon; flame graph / Amdahl / Nygard / Hyrum's are practitioner-fluent. Knuth-vs-Gregg debate is the only soft spot. |
| Layer 2 — LLM Reasoning | **High** | Anchored to Cadre's own `creation-techniques.md` synthesis; arXiv citations verified by file. |
| Layer 3 — Claude Code | **High** | Live-verified against current docs as of 2026-04-26. The one risk is harness churn — re-verify before shipping. |
| Layer 4 — Delight & Polish | **Medium-high** | Norman/Tognazzini/Saffer/Krug/Nielsen are canonical, but IxD canon for *agent harness* polish is thinner than for GUI polish — some terms may route to GUI-IxD clusters that don't fully apply. |

---

## Revision 2 — broaden L2 and L3

**Date:** 2026-04-26 (same day, second pass)
**Trigger:** user feedback — "Layer 2 and 3 are much too narrow. What are the strengths of LLMs and how can they be used? not just prompts..."

### 1. What "too narrow" means

Restating to verify against the user's framing:

- **L2 v1** anchored on *prompt-engineering / instruction-following research* (Liu, Sclar, Lee, Jaroslawicz, Chen). That cluster activates "how to write prompts that get followed" — a *technique* surface. The user wants the *capability* surface: where LLM judgment itself adds leverage (avoid the banned word — call it: where LLM judgment earns its keep), what kinds of work LLMs excel at, what should be *moved into* LLM judgment from elsewhere. A refine skill needs to recognize "this manual classification step is exactly the work an LLM beats hand-written rules at" — v1 vocabulary doesn't route there.

- **L3 v1** anchored on *Claude Code primitives as a feature list* (event matchers, frontmatter keys, settings.json paths). That activates "what knobs exist." The user wants the *orchestration* surface: when work belongs in a hook vs. an agent vs. a skill vs. CLAUDE.md vs. main-context — the architectural reasoning under the knobs. The Cadre intent is "composition of primitives" (CLAUDE.md §intent); v1 vocabulary names the primitives but not the composition.

The shared failure: v1 routed to *implementation* clusters (how to write a prompt; what fields a hook accepts) when the skill needs *judgment* clusters (when does this work belong here at all).

### 2. Revised Layer 2 — LLM Capability Surface

Proposed 6 terms:

| Term | Justification |
|---|---|
| **LLM-as-kernel / Software 3.0 (Karpathy)** | Karpathy's "kernel process of a new OS" framing (X, 2023) and his Software 3.0 talk (2025) — the canonical re-framing of LLMs as the orchestrator of tools, modalities, retrieval, and memory rather than a chat completion. Routes the skill toward "what should the LLM be running, not just answering" — the central refine question for an agent harness. |
| **LLM-as-judge (Zheng et al., MT-Bench, NeurIPS 2023)** | The paper that named the pattern; already load-bearing in CLAUDE.md's L1/L2/L3 trust hierarchy. Routes to fuzzy/semantic evaluation work (rubric grading, preference comparison) that LLMs do well and rule-engines don't. |
| **emergent capabilities (Wei et al., 2022; Bubeck et al., *Sparks of AGI*, 2023)** | The capability-elicitation literature — what LLMs can do that wasn't explicitly trained, and how task framing surfaces or hides those capabilities. Routes the skill to "is there latent capability here we're not eliciting?" |
| **agentic loop / tool use (Schluntz & Zhang, *Building Effective Agents*, Anthropic 2024)** | The augmented-LLM frame: model + retrieval + tools + memory in a loop. Names what a refine pass is actually evaluating when it asks "should this become an agent." |
| **judgment under ambiguity** | The class of work LLMs handle where deterministic rules fail — fuzzy classification, intent extraction, semantic matching, summarization with taste. Plain-English term but a 15-year practitioner uses it unprompted; activates the right cluster without requiring a niche citation. |
| **anti-strengths: arithmetic, exact recall, true novelty** | The inverse cluster. LLMs are weak at deterministic arithmetic (Dziri et al., *Faith and Fate*, NeurIPS 2023), brittle on exact recall without retrieval (Lewis et al., RAG 2020 — already cited in CLAUDE.md), and don't invent genuinely out-of-distribution structure. Names what *not* to delegate. Critical for the skill — without it, every refine recommendation drifts toward "make it an agent." |

**Choice-points (L2):**
1. **Keep "format tax" / "lost-in-the-middle" / "IFScale" or move them out entirely?** Recommendation: move out. They belong in `creation-techniques.md` (the tactical reference); the L2 cluster should stay at the capability altitude. The skill body's Step 6 can still cite them — but as references, not as routing vocabulary.
2. **Cite Karpathy as a tweet/talk or just by name?** Tweet-and-talk attribution is unusual but he's the originator and the framing is well-known under his name. Keep parenthetical attribution.
3. **6 vs. 7 terms?** Could add **RAG / retrieval-augmented (Lewis et al., NeurIPS 2020)** as a seventh — already cited in CLAUDE.md grounding section, fits the cluster, names a specific composition pattern. Lean: include. Surfaced as a choice rather than picked.

### 3. Revised Layer 3 — Harness Architecture & Orchestration

Proposed 6 terms:

| Term | Justification |
|---|---|
| **orchestrator-worker pattern (Schluntz & Zhang, *Building Effective Agents*)** | The pattern Cadre is built on (CLAUDE.md §intent cites it directly). Routes the skill to the central composition question — what's main-context, what's a worker. Replaces "subagent dispatch" which was a verb where the user needed an architecture. |
| **Lead Researcher pattern (Anthropic, *How we built our multi-agent research system*, 2025)** | The concrete instantiation: one orchestrator, parallel subagents, artifacts as the I/O contract. Already cited in CLAUDE.md's agent-architecture section. Routes the skill to fan-out questions (could this be N parallel subagents instead of one sequential pass?). |
| **context economy / principle of least privilege (Saltzer & Schroeder, 1975)** | Cadre's framing in CLAUDE.md §orch-worker contract — every piece of context must earn its place. Routes the skill to "what context is this carrying that it doesn't need" — the most common refine finding for prompts and agents. |
| **tool-use loop / augmented LLM** | The unit of agentic work: model decides → tool runs → result returns → loop. Standard practitioner vocabulary post-Schluntz/Zhang. Routes to "should this be a tool the agent calls vs. instructions the agent follows." |
| **memory layering (CLAUDE.md / skill / session / sub-context)** | The harness's memory surfaces — persistent doctrine in CLAUDE.md, on-demand expertise in skills, ephemeral state in session, isolated state in subagents. Naming the *layering* (not the individual files) routes to "what altitude does this knowledge live at" — the routing question that v1's "CLAUDE.md doctrine" gestured at but didn't name. |
| **plan-mode discipline / spec-before-execute (Spec-Driven Development; GitHub Spec Kit 2025)** | CLAUDE.md cites it as the workflow primitive. Routes the skill to "is this work proposing, reviewing, or executing — and are those separated?" Catches the common refine miss where a skill conflates the three. |

**Choice-points (L3):**
1. **Hook vocabulary entirely dropped?** Yes — "hook event matcher (PreToolUse, ...)" is a feature list, lives better in `creating-hooks.md`. The skill's Step 7 still asks "could this become a hook?"; the cluster name "harness architecture" routes there without enumerating events.
2. **"Agent fleet topology" — include?** Considered. Names the topology question (single agent, parallel fan-out, hierarchical, mesh) per beam.ai's "6 Multi-Agent Orchestration Patterns" (2026). Reasonable add as a 7th if the skill should reason about team shape; lean: skip until needed (YAGNI per CLAUDE.md), `Lead Researcher pattern` already covers the most common topology.
3. **MCP — keep?** Drop from the routing cluster. MCP is a protocol/integration surface; it's about *where tools come from*, not *what work goes where*. The skill's Step 7 can still ask "could MCP elicitation replace this prompt?" without MCP being in the vocabulary payload.

### 4. What was rejected from the prior cluster

| Term | Reason for removal |
|---|---|
| `lost-in-the-middle (Liu)` | Tactical — belongs in `creation-techniques.md`, not the capability cluster. |
| `format tax (Lee)` | Same. |
| `instruction density / IFScale` | Same. |
| `prompt format sensitivity (Sclar)` | Same. |
| `specification level (Chen, DETAIL)` | Same. |
| `subagent dispatch` | Verb, not architecture. Subsumed by `orchestrator-worker pattern`. |
| `hook event matcher (PreToolUse, ...)` | Feature list. Lives in `creating-hooks.md`. |
| `.claude/skills/ progressive disclosure` | File-system path. Subsumed by `memory layering`. |
| `frontmatter (disable-model-invocation, ...)` | Feature list. |
| `MCP server / elicitation` | Integration surface, not orchestration. Skill body keeps the check; vocabulary doesn't. |
| `CLAUDE.md doctrine (path-specific rules, --add-dir)` | Subsumed by `memory layering`. |
| `settings.json / allowedTools permissions` | File path. Subsumed by `context economy / principle of least privilege`. |

The rejections collapse two layers (instruction-following research; CC feature surface) into the references files where they were always going to live anyway. The vocabulary payload reclaims the slots for capability and orchestration routing.

### 5. Effectiveness check (per `vocabulary-routing.md`)

| Expert term | Generic equivalent | Expected routing differential |
|---|---|---|
| **LLM-as-kernel (Karpathy)** | "use the LLM as the main thing" | Expert routes to the kernel-as-orchestrator framing — modality I/O, tool dispatch, embedding memory, code execution as primitives the LLM coordinates. Generic stays at "use the model" without the OS analogy that suggests *what to compose*. **Strong differential.** |
| **context economy / least privilege (Saltzer & Schroeder)** | "don't pass too much context" | Expert routes to the security-canon framing — every grant must be justified, default-deny, principle as design discipline. Generic routes to "trim the prompt" with no principle behind the trim. **Strong differential** — and matches the framing CLAUDE.md already uses, so the routing aligns with project doctrine. |
| **anti-strengths: arithmetic, exact recall, true novelty** | "things LLMs aren't great at" | Expert routes to specific failure-mode literature — Dziri's compositional-arithmetic findings, retrieval-as-fix-for-recall (RAG), the distribution-shift / true-novelty limit. Generic routes to vague hedging ("LLMs make mistakes"). **Strong differential** — and load-bearing for preventing over-delegation, which is the most likely failure mode for a refine skill biased toward "more LLM." |

Three load-bearing terms, three strong differentials. None look like vocabulary theater.

### 6. Confidence calibration (revised clusters)

| Cluster | Confidence | Rationale |
|---|---|---|
| **L2 — LLM Capability Surface** | **High** | Karpathy framing is canonical and recent (Software 3.0 talk, 2025); Schluntz & Zhang directly cited in CLAUDE.md; Bubeck/Wei emergent-capabilities literature is foundational; anti-strengths grounded in named papers (Dziri, Lewis). The one soft spot: "judgment under ambiguity" is plain-English rather than canon — kept because senior practitioners use it unprompted, but it's the lightest-attribution term in the cluster. |
| **L3 — Harness Architecture & Orchestration** | **High** | Every term either originates in or is directly cited by CLAUDE.md (orchestrator-worker, Lead Researcher, least privilege, plan-mode/Spec-Driven, memory layering as a Cadre coinage built on the surfaces CLAUDE.md names). Routing aligns with project doctrine — the strongest possible grounding for a Cadre skill. |
| **L1, L4** | Unchanged from Revision 1. |

**Total terms after revision:** 6 (L1, unchanged) + 6 (L2, revised) + 6 (L3, revised) + 6 (L4, unchanged) = 24. Still inside the 15-30 budget.

**Sources added in this revision:**
- Karpathy, "LLMs as kernel process of a new OS" (X post, 2023; Software 3.0 talk, 2025) — [x.com/karpathy/status/1707437820045062561](https://x.com/karpathy/status/1707437820045062561)
- Bubeck et al., *Sparks of Artificial General Intelligence: Early experiments with GPT-4*, arXiv 2303.12712 (2023) — [arxiv.org/abs/2303.12712](https://arxiv.org/abs/2303.12712)
- Schluntz & Zhang, *Building Effective Agents*, Anthropic (2024) — [anthropic.com/research/building-effective-agents](https://www.anthropic.com/research/building-effective-agents)
- Anthropic, *How we built our multi-agent research system* (2025) — [anthropic.com/engineering/multi-agent-research-system](https://www.anthropic.com/engineering/multi-agent-research-system)
- Saltzer & Schroeder, "The Protection of Information in Computer Systems" (1975) — already cited in CLAUDE.md.
- Lewis et al., RAG, NeurIPS 2020 — already cited in CLAUDE.md.
- Dziri et al., *Faith and Fate: Limits of Transformers on Compositionality*, NeurIPS 2023 — for anti-strengths attribution; verify before final.

---

## Revision 3 — L2 deep dive (LLM use cases and design practices for SWE)

**Date:** 2026-04-26 (third pass)
**Trigger:** Pull L2 anchors out of a generic-LLM frame and into the SWE-specific literature. The current cluster (Karpathy, Zheng, Wei/Bubeck, Schluntz & Zhang, Lewis, Dziri) routes well to *general* LLM capability; it underweights the *coding-specific* canon a 15-year LLM-assisted SWE would actually reach for.

### 1. Methodology

**arxiv categories scanned:** `cs.SE` (software engineering), `cs.CL` (NLP — for code-LM lineage), `cs.AI` (agentic systems), `cs.PL` (program languages — fault localization, repair), `cs.CR` (security — vuln-detection LLMs).

**Corpus discipline:** every paper below was retrieved by direct arxiv ID lookup or first-result arxiv search — no parametric-memory citations. arxiv IDs verified in this session.

**Ruled out:**
- *Survey papers* (e.g., Fan et al. "LLMs for SE", Hou et al.): inventory the field but don't anchor a vocabulary term — surveys route to other surveys.
- *Vendor blog posts* (Aider, Cursor, Cody): not arxiv.
- *Pre-Codex code-LM lineage* (CodeBERT, GraphCodeBERT, CodeT5): pre-LLM-as-kernel framing, not what a senior practitioner reaches for in 2026.
- *Generic chain-of-thought / planning papers* with no SWE specificity (Wei CoT, ReAct): foundational but already implicit in `agentic loop`.

**Triangulation rule:** every recommended term (§4) has either (a) a named originator with a verified arxiv anchor, or (b) practitioner-canon status in SWE-LLM discourse a senior would invoke unprompted.

### 2. Specific use cases surfaced (5 clusters with anchors)

| # | Use-case cluster | Canonical anchor(s) | Vocabulary candidates |
|---|---|---|---|
| 1 | **Functional code generation from spec** — docstring/NL → working program, sampled-and-filtered | Chen et al., *Evaluating LLMs Trained on Code* (Codex / HumanEval), arXiv [2107.03374](https://arxiv.org/abs/2107.03374); Li et al., *AlphaCode*, arXiv [2203.07814](https://arxiv.org/abs/2203.07814) | **HumanEval / pass@k**, **sample-and-filter**, **functional correctness** |
| 2 | **Repository-scale issue resolution** — multi-file edits driven by a GitHub issue | Jimenez et al., *SWE-bench*, arXiv [2310.06770](https://arxiv.org/abs/2310.06770); Zhang et al., *AutoCodeRover*, arXiv [2404.05427](https://arxiv.org/abs/2404.05427); Xia et al., *Agentless*, arXiv [2407.01489](https://arxiv.org/abs/2407.01489) | **SWE-bench**, **issue → patch**, **fault localization (file → class → hunk)**, **agentless localize-then-repair** |
| 3 | **Conversational program repair** — patch / re-test / revise loop using execution signal | Xia & Zhang, *ChatRepair*, arXiv [2304.00385](https://arxiv.org/abs/2304.00385); Chen et al., *Self-Debug*, arXiv [2304.05128](https://arxiv.org/abs/2304.05128) | **automated program repair (APR)**, **rubber-duck debugging (Chen)**, **execution-feedback loop** |
| 4 | **LLM-driven test generation and fuzzing** — unit-test synthesis, edge-case input generation, mutation/repair of failing tests | Xie et al., *ChatUniTest*, arXiv [2305.04764](https://arxiv.org/abs/2305.04764); Deng et al., *TitanFuzz*, arXiv [2212.14834](https://arxiv.org/abs/2212.14834); Liu et al., *EvalPlus / HumanEval+*, arXiv [2305.01210](https://arxiv.org/abs/2305.01210) | **LLM-as-fuzzer**, **test-case mutation**, **execution-grounded eval (HumanEval+)** |
| 5 | **Static-analysis augmentation for security** — LLM as a verifier on top of a deterministic analyzer (UBI bugs, taint, etc.) | Li et al., *LLift / Hitchhiker's Guide to Program Analysis*, arXiv [2308.00245](https://arxiv.org/abs/2308.00245) | **analyzer-in-the-loop**, **LLM-as-triage**, **post-constraint guided analysis** |

Two adjacent clusters considered and skipped for L2 (live in references): (a) code review automation — strong literature but routes to "review" not "capability"; (b) repo-level retrieval as its own cluster — folded into design-pattern §3.

### 3. Design practices surfaced (6 patterns with anchors)

| # | Design pattern | Canonical anchor(s) | Vocabulary candidates |
|---|---|---|---|
| A | **Iterative self-feedback** — single LLM as generator + critic + refiner, no external signal required | Madaan et al., *Self-Refine*, arXiv [2303.17651](https://arxiv.org/abs/2303.17651) | **self-refine loop**, **generator-critic-refiner triad** |
| B | **Verbal reinforcement / episodic reflection** — task signal compressed to text, written to memory, replayed next episode | Shinn et al., *Reflexion*, arXiv [2303.11366](https://arxiv.org/abs/2303.11366) | **verbal RL**, **episodic reflection**, **reflection memory** |
| C | **Execution as ground truth** — compiler / interpreter / test runner closes the loop deterministically | Chen et al., *Self-Debug* [2304.05128](https://arxiv.org/abs/2304.05128); Wang et al., *CodeAct*, arXiv [2402.01030](https://arxiv.org/abs/2402.01030) | **execution-grounded verification**, **interpreter-in-the-loop**, **code as action space (CodeAct)** |
| D | **Agent-Computer Interface (ACI)** — interfaces designed *for* LM agents, not retrofitted human IDEs | Yang et al., *SWE-agent*, arXiv [2405.15793](https://arxiv.org/abs/2405.15793); Wang et al., *OpenHands / OpenDevin*, arXiv [2407.16741](https://arxiv.org/abs/2407.16741) | **agent-computer interface (ACI)**, **agent-shaped tooling** |
| E | **Repo-level RAG (iterative retrieve-generate)** — retrieval informed by partial generation, AST/structure-aware | Zhang et al., *RepoCoder*, arXiv [2303.12570](https://arxiv.org/abs/2303.12570); Wang et al., *CodeRAG-Bench*, arXiv [2406.14497](https://arxiv.org/abs/2406.14497) | **repo-level RAG**, **iterative retrieve-generate**, **structure-aware retrieval** |
| F | **Multi-agent SWE roles / role separation** — programmer / tester / reviewer / executor as distinct agents | Huang et al., *AgentCoder*, arXiv [2312.13010](https://arxiv.org/abs/2312.13010); Qian et al., *ChatDev*, arXiv [2307.07924](https://arxiv.org/abs/2307.07924); Hong et al., *MetaGPT*, arXiv [2308.00352](https://arxiv.org/abs/2308.00352) | **role-separated agents (programmer / tester / executor)**, **assembly-line SOP (MetaGPT)** |
| G | **Process supervision / step-level verification** — reward / verify each reasoning step, not just outcome | Lightman et al., *Let's Verify Step by Step*, arXiv [2305.20050](https://arxiv.org/abs/2305.20050) | **process reward model (PRM)**, **step-level verification** |
| H | **Search over thoughts** — branching reasoning with self-evaluation and backtracking | Yao et al., *Tree of Thoughts*, arXiv [2305.10601](https://arxiv.org/abs/2305.10601) | **tree-of-thoughts**, **branch-and-evaluate** |

Eight cells listed (the brief asked 5-8) — `G` and `H` are weaker SWE-specifically than A-F, included because process supervision underlies o1-style coder models and ToT shows up in agent planners.

### 4. Recommended additions to L2 vocabulary

Current L2 has 7 terms. Cluster has *capability* anchors (Karpathy, Zheng, Wei/Bubeck, Schluntz & Zhang, Lewis) and *anti-strengths* (Dziri) but no *SWE-specific design-pattern* anchors and no *execution-grounded verification* term. Below: 4 strongest candidates.

| # | Term | Attribution | One-sentence justification | Knowledge cluster activated (vs. current) | Recommendation |
|---|---|---|---|---|---|
| 1 | **execution-grounded verification** | Chen et al. *Self-Debug* arXiv [2304.05128](https://arxiv.org/abs/2304.05128); Wang et al. *CodeAct* arXiv [2402.01030](https://arxiv.org/abs/2402.01030); Liu et al. *EvalPlus* arXiv [2305.01210](https://arxiv.org/abs/2305.01210) | Names the load-bearing distinction between L1 verification (compiler/test runner) and L3 verification (LLM judge) for code; the core lever the current cluster gestures at but doesn't name. | Routes to interpreter-in-the-loop, test-driven agent design, EvalPlus-style ground-truth augmentation — concrete primitives the current `agentic loop` term elides. | **ADD** as 8th term. High-leverage for a refine skill: most LLM-misuse findings reduce to "this should be verified by execution, not by a critic prompt." |
| 2 | **self-refine / Reflexion (iterative self-critique)** | Madaan et al. arXiv [2303.17651](https://arxiv.org/abs/2303.17651); Shinn et al. arXiv [2303.11366](https://arxiv.org/abs/2303.11366) | Names the canonical LLM-internal feedback loop without external signal — the design pattern Cadre's three-review architecture composes against. | Routes to *when self-critique works* (Madaan) and *when episodic memory of failure helps* (Shinn) — current `LLM-as-judge` covers grading but not iterative refinement. | **ADD** as 9th term. Directly cited in many Cadre composition decisions; senior practitioners use both names interchangeably. |
| 3 | **agent-computer interface (ACI)** | Yang et al. *SWE-agent* arXiv [2405.15793](https://arxiv.org/abs/2405.15793) | Names the design discipline of building *agent-shaped* tools rather than adapting human IDEs — directly relevant to refining Cadre primitives (skills, hooks, MCP tools). | Routes to tool-design canon for agents (file-edit affordances, navigation primitives) — current `agentic loop / tool use` is the loop, ACI is the *interface design* inside the loop. | **ADD** as 10th term, OR **REPLACE** the trailing "/ tool use" in `agentic loop / tool use` with `/ ACI design (Yang et al.)`. Lean: ADD as separate term — they activate different clusters. |
| 4 | **repo-level RAG (iterative retrieve-generate)** | Zhang et al. *RepoCoder* arXiv [2303.12570](https://arxiv.org/abs/2303.12570); Wang et al. *CodeRAG-Bench* arXiv [2406.14497](https://arxiv.org/abs/2406.14497) | Names the SWE-specific RAG variant — retrieval informed by partial generation, structure-aware over file/class hierarchy — distinct from Lewis-et-al. document RAG. | Routes to AST-aware retrieval, file-level vs hunk-level chunking, retrieval-as-fault-localization — current `RAG / retrieval-augmented` is too generic for repo work. | **REPLACE** existing `RAG / retrieval-augmented generation (Lewis et al., NeurIPS 2020)` with `RAG / repo-level RAG (Lewis et al. 2020; Zhang et al. RepoCoder 2023)` — keeps Lewis as the foundational anchor, adds the SWE-specific term that earns its keep in this skill. |

**Optional 5th** (lean: skip until evidence): **multi-agent role separation (programmer / tester / executor)** with AgentCoder/ChatDev/MetaGPT anchors. Reason to add: refine-cadre will frequently surface "should this be N agents instead of 1." Reason to skip: orchestrator-worker (Schluntz & Zhang) in L3 already covers the abstract pattern; the SWE specialization is implicit. Tag as **OPTIONAL**.

### 5. Anti-strengths additions

Current sub-cluster: `arithmetic, exact recall, true novelty (Dziri)`. SWE-specific failure modes worth adding:

| Failure mode | Anchor | Why include |
|---|---|---|
| **Package / API hallucination** | Spracklen et al., *We Have a Package for You!*, arXiv [2406.10279](https://arxiv.org/abs/2406.10279) | Empirically grounded: 5.2% commercial / 21.7% open-source hallucinated package names. Directly relevant to "should we let the LLM `import` without retrieval?" Routes to documentation-grounded generation as the fix. |
| **Benchmark contamination / overfitting** | Liu et al., *EvalPlus*, arXiv [2305.01210](https://arxiv.org/abs/2305.01210); Jain et al., *LiveCodeBench*, arXiv [2403.07974](https://arxiv.org/abs/2403.07974) | The HumanEval-pass-rate-is-misleading finding (HumanEval+ drops pass@k by 19-28%). Important refine-skill check: a recommendation that "the model is good at X" must check whether the evidence is from a contaminated benchmark. |
| **Lost in the middle (long-context degradation)** | Liu et al. arXiv [2307.03172](https://arxiv.org/abs/2307.03172) | Already present in `creation-techniques.md` but worth surfacing in L2 anti-strengths because at *repo scale* it becomes a capability ceiling, not a tactical issue. |

**Recommendation:** expand current single-line anti-strengths into a small sub-list:
> **anti-strengths:** arithmetic, exact recall, true novelty (Dziri *Faith and Fate* 2023); **package / API hallucination** (Spracklen et al. 2024); **benchmark-contamination over-claim** (Liu *EvalPlus* 2023; Jain *LiveCodeBench* 2024); **long-context degradation at repo scale** (Liu *Lost in the Middle* 2023)

### 6. Confidence calibration

| Recommendation | Confidence | Rationale |
|---|---|---|
| ADD `execution-grounded verification` | **High** | Three independent canonical anchors (Self-Debug, CodeAct, EvalPlus); maps cleanly to Cadre's L1/L2/L3 trust hierarchy; load-bearing for refine findings. |
| ADD `self-refine / Reflexion` | **High** | Two canonical NeurIPS/ICLR-tier anchors; widely cited; senior practitioners use both names interchangeably. |
| ADD `agent-computer interface (ACI)` | **Medium-high** | Single anchor (Yang et al. SWE-agent NeurIPS 2024) but the term is becoming canonical in agent-tooling discourse and directly applies to refining Cadre's hook/skill/MCP surfaces. Soft spot: term may be edged out if a more general successor emerges in 2026 literature. |
| REPLACE `RAG` with `repo-level RAG` | **Medium-high** | RepoCoder + CodeRAG-Bench are strong; but Lewis-et-al. as the foundational anchor is non-negotiable, hence the "keep both" framing. Risk: term may read as redundant to readers who already know RAG. |
| ADD package-hallucination / contamination / lost-in-the-middle to anti-strengths | **High** for the first two, **medium** for the third (lost-in-the-middle is more of a tactical concern than a capability ceiling — reasonable to keep it in `creation-techniques.md` only). |
| OPTIONAL multi-agent role separation | **Low-medium** | Three anchors but the abstraction is already covered by L3 `orchestrator-worker`; risk of double-routing. |

### 7. Out of scope / open questions

- **Code review as its own L2 cluster.** Strong literature (Tufano et al., RovoDev, RevMate) but the user's L2 framing is *capability*, not *task*. Code review fits better as a use-case the skill body's Step 3 considers, not as a vocabulary anchor. Flagged for user judgment.
- **AlphaCode's sample-and-filter** as a vocabulary term. Strong canon but the technique is largely subsumed by `pass@k` and modern agent loops; arguable whether senior practitioners still reach for it unprompted in 2026. Skipped.
- **o1-style "test-time compute" / process-supervised reasoning.** Lightman et al. *Let's Verify Step by Step* is foundational; recent o1/o3 lineage extends it. Currently out of scope for L2 as written, but if Cadre's refine recommendations should reason about reasoning-effort tuning (test-time compute as a refine knob), this becomes a candidate. Flag for future revision.
- **Empirical validation gap.** None of the recommended additions have been A/B-tested in actual refine-skill runs — the routing-differential predictions are theory-grounded only, same caveat as Revision 1 §6.
- **Layer 2 size budget.** Adding 3 (high-confidence) recommendations brings L2 from 7 to 10 terms. Cluster ceiling per `vocabulary-routing.md` is ~7. Trade: tighter cluster (force-pick top 3) vs. fuller surface (allow 10). User decision.

**Sources added in this revision (all verified arxiv IDs, 2026-04-26):**
- Chen et al., *Self-Debug*, arXiv [2304.05128](https://arxiv.org/abs/2304.05128)
- Madaan et al., *Self-Refine*, arXiv [2303.17651](https://arxiv.org/abs/2303.17651)
- Shinn et al., *Reflexion*, arXiv [2303.11366](https://arxiv.org/abs/2303.11366)
- Jimenez et al., *SWE-bench*, arXiv [2310.06770](https://arxiv.org/abs/2310.06770)
- Yang et al., *SWE-agent*, arXiv [2405.15793](https://arxiv.org/abs/2405.15793)
- Wang et al., *OpenHands/OpenDevin*, arXiv [2407.16741](https://arxiv.org/abs/2407.16741)
- Zhang et al., *AutoCodeRover*, arXiv [2404.05427](https://arxiv.org/abs/2404.05427)
- Xia et al., *Agentless*, arXiv [2407.01489](https://arxiv.org/abs/2407.01489)
- Xia & Zhang, *ChatRepair*, arXiv [2304.00385](https://arxiv.org/abs/2304.00385)
- Chen et al., *HumanEval / Codex*, arXiv [2107.03374](https://arxiv.org/abs/2107.03374)
- Li et al., *AlphaCode*, arXiv [2203.07814](https://arxiv.org/abs/2203.07814)
- Liu et al., *EvalPlus / HumanEval+*, arXiv [2305.01210](https://arxiv.org/abs/2305.01210)
- Jain et al., *LiveCodeBench*, arXiv [2403.07974](https://arxiv.org/abs/2403.07974)
- Zhang et al., *RepoCoder*, arXiv [2303.12570](https://arxiv.org/abs/2303.12570)
- Wang et al., *CodeRAG-Bench*, arXiv [2406.14497](https://arxiv.org/abs/2406.14497)
- Wang et al., *CodeAct*, arXiv [2402.01030](https://arxiv.org/abs/2402.01030)
- Xie et al., *ChatUniTest*, arXiv [2305.04764](https://arxiv.org/abs/2305.04764)
- Deng et al., *TitanFuzz*, arXiv [2212.14834](https://arxiv.org/abs/2212.14834)
- Li et al., *LLift*, arXiv [2308.00245](https://arxiv.org/abs/2308.00245)
- Huang et al., *AgentCoder*, arXiv [2312.13010](https://arxiv.org/abs/2312.13010)
- Qian et al., *ChatDev*, arXiv [2307.07924](https://arxiv.org/abs/2307.07924)
- Hong et al., *MetaGPT*, arXiv [2308.00352](https://arxiv.org/abs/2308.00352)
- Lightman et al., *Let's Verify Step by Step*, arXiv [2305.20050](https://arxiv.org/abs/2305.20050)
- Yao et al., *Tree of Thoughts*, arXiv [2305.10601](https://arxiv.org/abs/2305.10601)
- Liu et al., *Lost in the Middle*, arXiv [2307.03172](https://arxiv.org/abs/2307.03172)
- Spracklen et al., *Package Hallucinations*, arXiv [2406.10279](https://arxiv.org/abs/2406.10279)

---

## Revision 4 — L1 deep dive (performance engineering use cases and design practices)

**Date:** 2026-04-26 (parallel pass with Revision 3 L2 deep-dive)
**Trigger:** Layer 1 currently has 6 terms heavily systems-engineering-canon (Gregg, Nygard) with one tail-latency anchor (`p99`) and one parallelism-ceiling anchor (Amdahl). Open question from prior brief: is algorithmic-complexity vocabulary missing? Broader question: what knowledge clusters does the current 6-term set fail to activate?

### 1. Methodology

**Venues scanned:**
- arXiv `cs.PF` (performance), `cs.DC` (distributed), `cs.OS` (operating systems) for performance regression detection, LLM serving, eBPF-era profiling.
- ACM canon: CACM, ACM Queue, OSDI, SOSP, SIGCOMM — where systems-performance work concentrates (and where arXiv coverage is thinner than ML).
- Practitioner canon: Gregg (*Systems Performance*; *BPF Performance Tools*), Nygard (*Release It!*), Allspaw (*Capacity Planning*), Beyer et al. (*SRE Book*), Kleppmann (*DDIA*), Thompson (LMAX).
- Practitioner blogs treated as L2 (Gregg's site, Thompson's mechanical-sympathy blog, Wilkie at Grafana, Polar Signals) — verified against authored books / talks where possible.

**Ruled out:**
- ML-research lit on training-side performance (FlashAttention, MoE routing) — wrong domain for a generalist "is your code slow" cluster; the inference-serving side (PagedAttention) is closer and surfaced as OPTIONAL only.
- Algorithm-canon big-O / CLRS terms — `.cadre/references/vocabulary-routing.md` already catalogs "horizontal scaling, sharding strategy" at the cluster level; algorithm-canon vocabulary routes to interview-prep clusters, not perf-engineering clusters. Recommendation deferred to §7.
- Niche kernel-tuning vocabulary (NUMA balancing, transparent hugepages, page coloring) — passes 15-year test for kernel engineers, fails it for the generalist tier `refine-cadre` targets.
- Web-frontend perf canon (Core Web Vitals, LCP/INP/CLS) — strong canon but domain-mismatched for a CLI agent harness; flagged in §5 as elevatable if the skill ever targets web stacks.

**Triangulation rule:** every candidate term needs (a) a named originator citable to a paper / book / talk, (b) practitioner usage in conference / blog discourse, AND (c) routing differential from generic phrasing. Two-of-three downgrades to "OPTIONAL."

### 2. Specific use cases surfaced

| Cluster | Canonical anchor | Vocabulary candidates |
|---|---|---|
| **Tail-latency reduction** | Dean & Barroso, *The Tail at Scale*, CACM 2013 ([dl.acm.org/doi/10.1145/2408776.2408794](https://dl.acm.org/doi/10.1145/2408776.2408794)) | tail at scale (Dean & Barroso); hedged requests; tied requests; **p99 already covered** but anchored to the metric, not the systemic phenomenon |
| **Continuous profiling** | Polar Signals / Parca (2022–); Pyroscope / Grafana (2024–); precursor: Gregg, *BPF Performance Tools* (Addison-Wesley 2019) | continuous profiling; **eBPF profiling** (~1% overhead canonical); always-on profiling. Continuous flame graphs are a distinct sub-cluster from the snapshot artifact. |
| **Performance regression detection** | "Risk-Aware Batch Testing for Performance Regression Detection," arXiv 2604.00222; "Optimized Benchmarking Platform for CI/CD Pipelines," arXiv [2510.18640](https://arxiv.org/abs/2510.18640) | continuous benchmarking; performance regression; A/B perf testing. Active 2024–2026 lit. |
| **Queueing & saturation** | Little, "A Proof for the Queuing Formula L = λW," *Operations Research* 1961; Gunther, *Universal Scalability Law* (CMG 1993; arXiv [0808.1431](https://arxiv.org/abs/0808.1431)) | **Little's law** (L = λW); **Universal Scalability Law / USL** (Gunther) — extends Amdahl with a coherence term (concurrency / contention / coherency). |
| **Backpressure & overload control** | Welsh et al., SEDA (SOSP 2001); Cherkasova & Phaal, "Session-based admission control" | **backpressure**; **load shedding**; **admission control**. The triplet is canonical overload-control vocabulary. |
| **Database query optimization** | Postgres / Stonebraker lineage; ORM / Hibernate community canon | **N+1 query problem**; query plan / EXPLAIN ANALYZE. N+1 is *the* practitioner shibboleth — a senior backend engineer uses it unprompted weekly. |
| **Network performance** | RFC 9000 (QUIC, 2021); Cardwell et al., BBR (CACM 2017) | **head-of-line blocking** (HOL); BBR congestion control. HOL has crisp routing — TCP-stream vs HTTP/2-stream vs QUIC-stream layered semantics. |
| **LLM serving performance** | Kwon et al., *PagedAttention / vLLM*, SOSP 2023, arXiv [2309.06180](https://arxiv.org/abs/2309.06180); Yu et al., *Orca*, OSDI 2022 | **continuous batching**; **PagedAttention / KV cache**; **speculative decoding**. Modern, post-2023 canon; passes 15-year test for ML-platform engineers. |

### 3. Design practices surfaced

| Pattern | Canonical anchor | Vocabulary candidates |
|---|---|---|
| **USE method** | Gregg, "Thinking Methodically about Performance," ACM Queue 2012 / CACM 2013 ([brendangregg.com/usemethod.html](https://www.brendangregg.com/usemethod.html)) | **USE method** (Utilization / Saturation / Errors). Resource-side checklist. |
| **RED method** | Wilkie (Grafana / Weaveworks), 2015–2018 ([grafana.com/blog/the-red-method-how-to-instrument-your-services/](https://grafana.com/blog/the-red-method-how-to-instrument-your-services/)) | **RED method** (Rate / Errors / Duration). Service-side complement to USE. |
| **Four golden signals** | Beyer et al., *Site Reliability Engineering* (O'Reilly 2016), Ch. 6 | **golden signals** (Latency / Traffic / Errors / Saturation). Google-SRE canon, peer of USE/RED. |
| **Mechanical sympathy** | Thompson (LMAX, 2011–); via Jackie Stewart (F1, 1960s); Fowler, *LMAX Architecture* ([martinfowler.com/articles/lmax.html](https://martinfowler.com/articles/lmax.html)) | **mechanical sympathy** — hardware-aware code (cache lines, false sharing, branch prediction, memory order). Routes to low-latency / HFT / lock-free canon. |
| **Latency numbers** | Dean (2010 talk); Norvig ("Teach Yourself Programming in Ten Years," 2001) | **latency numbers every programmer should know** — L1 / L2 / RAM / SSD / network ladder. Forces order-of-magnitude reasoning. |
| **Capacity planning** | Allspaw, *The Art of Capacity Planning* (O'Reilly 2008; 2nd ed. with Kejariwal, 2017) | **capacity planning**; headroom; saturation forecasting. |
| **Performance budgeting** | Lighthouse / Core Web Vitals lineage (Google, 2020–); Marcotte (responsive perf) | **performance budget** — pre-committed limits enforced in CI. Frontend-canon; the budget-as-gate idea generalizes. |
| **Observability evolution** | Majors et al., *Observability Engineering* (O'Reilly 2022) | high-cardinality observability; trace + metric + log + **profile** (the 4th pillar, post-2023 with continuous profiling). |

### 4. Recommended additions to L1 vocabulary

The current 6-term cluster is strong on profiling artifact (flame graph), tail-latency metric (p99), parallelism ceiling (Amdahl), resilience pattern (circuit breaker), incident scope (blast radius), and ecosystem coupling (Hyrum's law). What it does **not** activate: queueing / saturation reasoning, observability *methodology* (vs artifact), hardware-aware code, or systemic tail-latency *canon* (the paper, not just the metric).

| Term | Attribution | Justification | Cluster activated (vs current) | Recommendation |
|---|---|---|---|---|
| **USE method (Gregg)** | Gregg, ACM Queue 2012 / CACM 2013 | Names a *checklist methodology*, not an artifact — flame graph is the artifact, USE is the discipline. Senior SREs reach for it when triaging an unknown system. Pairs naturally with golden signals / RED. | Performance methodology / first-principles triage. Distinct from "look at a flame graph." | **ADD** — high confidence. |
| **Little's law (L = λW)** | Little, *Operations Research*, 1961 | The only formula in queueing theory most senior practitioners actually use. Activates throughput-vs-latency-vs-concurrency reasoning that Amdahl alone doesn't reach. Routes to capacity-planning canon (Allspaw, Gunther). | Queueing / capacity / saturation reasoning — currently absent. | **ADD** — high confidence. |
| **tail at scale (Dean & Barroso, CACM 2013) — p99/p999** | Dean & Barroso, CACM 2013 | Citation form of `p99 latency` that activates the *systemic* canon — fan-out amplification, hedged requests, tied requests. Currently `p99` routes to the metric; the paper title routes to the design-pattern catalog for tail-tolerance. | Distributed-systems tail-latency *design* (not just measurement). | **REPLACE** "p99 latency" with the citation form. Strict superset — keeps the metric, gains the canon. High confidence. |
| **mechanical sympathy (Thompson, via Stewart)** | Thompson (LMAX, 2011–); Fowler write-up | Routes to hardware-aware code — false sharing, cache lines, lock-free, NUMA. The current cluster has *no* low-level vocabulary; mechanical sympathy is the umbrella term that opens the whole region without enumerating subterms. | Hardware-aware / low-latency / mechanical layer — currently absent. | **ADD** — medium-high confidence. (Choice-point from Revision 1 — recommendation now: include.) |

Suggested L1 (post-revision):

> flame graph (Gregg, *Systems Performance*), **USE method (Gregg, ACM Queue 2012)**, **Little's law (L = λW)**, **tail at scale (Dean & Barroso, CACM 2013) — p99/p999 latency**, Amdahl's law, **mechanical sympathy (Thompson, via Stewart)**, circuit breaker pattern (Nygard, *Release It!*), blast radius, Hyrum's law

That's 9 terms — one above the 3-8 cluster guideline. Two ways to land: (a) drop `Hyrum's law` (most ecosystem-coupling-oriented; least about *making things faster*) for a clean 8; (b) keep at 9 — `vocabulary-routing.md` calls the rule a guideline, not a hard cap, and `Hyrum's law` is resilience-adjacent which the cluster name explicitly covers. Lean: **keep 9**. Surfaced as a choice-point in §7.

### 5. Modernization check (post-2020 additions)

| Candidate | Recommendation | Rationale |
|---|---|---|
| **eBPF profiling / continuous profiling** | OPTIONAL — leave in references | Strong post-2020 modernization (Pyroscope, Parca). But "flame graph (Gregg)" already routes to the profiling cluster; "eBPF" specifies a *tool*, not a *concept*. If `refine-cadre` outputs frequently recommend "use a continuous profiler," elevate; otherwise the parametric model knows eBPF from the flame-graph anchor. |
| **PagedAttention / continuous batching / KV cache (vLLM)** | OPTIONAL — Layer 2 fit, not Layer 1 | LLM-serving-specific. Layer 2 already covers `agentic loop / tool use`; if a future skill targets ML platforms specifically, spin a sub-cluster. For a generalist refine pass: out of scope. |
| **HOL blocking + QUIC** | OPTIONAL — leave in references | Network-stack-specific; too narrow for the cluster budget. Mention in skill body's network-perf check, not in vocabulary. |
| **Performance budget (Lighthouse / Core Web Vitals)** | OPTIONAL — domain-specific | Frontend-canon. If `refine-cadre` ever targets web stacks, elevate; for now, `Little's law` and the budget-as-gate idea generalize without the web-specific term. |
| **Observability "fourth pillar" (profile alongside metric / trace / log)** | OPTIONAL | Genuinely new framing (Majors et al., 2022; OpenTelemetry Profiling SIG, 2024–). Conceptually subsumed by USE + flame graph already in cluster. |

**Net modernization recommendation:** the proposed additions (USE, Little's law, tail at scale, mechanical sympathy) cover the missing classical canon. Post-2020 additions are real but better held in `.cadre/references/` until a target stack demands them — keeps L1 generalist.

### 6. Confidence calibration

| Recommendation | Confidence | Rationale |
|---|---|---|
| ADD `USE method (Gregg, ACM Queue 2012)` | **High** | Verified canon; passes 15-year test trivially; activates a cluster the current 6 don't reach (resource-checklist methodology). Pairs well with the existing flame-graph anchor — both are Gregg, which tightens the cluster's center of gravity. |
| ADD `Little's law (L = λW)` | **High** | 65-year-old result, used unprompted by senior practitioners in capacity / queueing discussions; activates a large knowledge region (queueing theory, throughput analysis, capacity planning) currently absent. |
| REPLACE `p99 latency` with `tail at scale (Dean & Barroso, CACM 2013) — p99/p999` | **High** | Citation form is strict superset — keeps the metric, gains the systemic-canon routing. Dean / Barroso paper is foundational with ~1,800 citations. |
| ADD `mechanical sympathy (Thompson, via Stewart)` | **Medium-high** | Term is real and used, but practitioner concentration is in low-latency / HFT / game-engine subdomains. For a generalist refine skill, the cluster it activates may be narrower than the others. Worth including for the missing low-level surface; soft on inclusion if user prefers tighter generalist focus. |
| Drop `Hyrum's law` to cap at 8 | **Low-medium** | Stays well within the budget at 9. The case for dropping is "this cluster is *performance*, not *evolution*" — but `vocabulary-routing.md` calls the cluster "Performance Engineering & Resilience" and Hyrum's is resilience-adjacent. Recommend keeping at 9 unless tightening is forced. |

### 7. Out of scope / open questions

- **Algorithm canon (CLRS / big-O).** Confirmed the prior brief's rejection — algorithmic-complexity vocabulary routes to interview-prep / coursework clusters, not perf-engineering clusters. If the user expects `refine-cadre` to flag "this is O(n²) and should be O(n log n)" outputs, that's a separate sub-skill — don't pollute L1 to cover it. Open question: confirm the rejection holds.
- **SRE-book golden signals vs USE vs RED.** Surfaced all three; recommended USE only. RED and golden signals are real canon but adding all three over-specifies a cluster that should remain general. If the user does a lot of microservice-specific work, RED becomes a worthwhile add.
- **Resilience canon depth (Hollnagel, Woods, Cook, "Safety-II").** Mentioned in Revision 1 §6 as out-of-scope; confirmed — too abstract for a cluster of this size, lives better in a future `incident-cadre` skill.
- **arXiv ID dates.** IDs like `2604.00222` and `2510.18640` follow arXiv's YYMM scheme and are real (the year wraps after 2024). Cited where surfaced; verify in final pass before the skill ships.
- **Choice-point for user:** L1 cluster size 8 vs 9. The vocabulary-routing rule (3-8 per cluster) prefers 8; Cadre's prior cluster was already at 6, so 9 is a soft overshoot but `Hyrum's law` earns its slot. Equivalent question for L2 in Revision 3 — consistency between layers worth confirming.

---

## Revision 5 — L4 deep dive (UX streamlining and interaction design)

**Date:** 2026-04-26 (parallel pass with Revisions 3 and 4)
**Trigger:** L4 was rated medium-high confidence in Revision 1 with the noted weakness "IxD canon for *agent harness* polish is thinner than for GUI polish — some terms may route to GUI-IxD clusters that don't fully apply." Substrate-correctness check: refine-cadre runs against agent harnesses, CLIs, dev tools, APIs — not consumer GUIs. Goal: pull the L4 cluster toward agent-UX / CLI-UX / AI-UX canon without losing the IxD foundations.

### 1. Methodology

**Venues scanned:** ACM CHI 2019/2024/2025 proceedings (human-AI interaction track); arXiv `cs.HC` for explanation / trust / mixed-initiative; Nielsen Norman Group articles (response times, progressive disclosure, error messages, cognitive load); practitioner canon (Norman *DOET* 2013 ed.; Krug; Saffer; Tognazzini; Wroblewski; Yifrah); CLI/TUI canon (clig.dev; Charm.sh; lucasfcosta CLI patterns).

**Ruled out:**
- *Web-form / mobile-touch / icon-design canon* — substrate mismatch. Wroblewski's inline-validation work is foundational but routes to form-UX clusters that don't apply to agent harnesses.
- *Pure visual-design canon* (Frost *Atomic Design*, Oppermann design tokens) — relevant for component-system work, out of scope for a CLI-and-agent skill.
- *Generic "UX" / "user-centered design" textbook terms* — fail the 15-year practitioner test (a senior wouldn't say "improve UX" unprompted; they'd name the heuristic).
- *GenAICHI 2024/2025 design-principles papers* (Weisz et al. IBM 2024; Springer 2025 11 guidelines) — surveyed; recommendations summarized in §5 but the umbrella-principle vocabulary (`Design for Imperfection`, `Design for Co-Creation`) is too workshop-fresh to pass the 15-year test cleanly. Amershi 2019 is the load-bearing CHI anchor that does pass.

**Triangulation:** every recommended term has (a) a named originator with a verified canonical anchor, (b) substrate-fit for agent / CLI / dev-tool surfaces (not consumer-GUI-only), AND (c) a routing differential vs the term it adds to or replaces.

### 2. Streamlining use cases surfaced

| # | Cluster | Canonical anchor | Vocabulary candidates |
|---|---|---|---|
| 1 | **Cognitive load reduction** | Sweller, *Cognitive Load During Problem Solving*, Cognitive Science 1988; Sweller / Paas / van Merriënboer ed. psych canon | **intrinsic / extraneous / germane load**; the lever a refine pass acts on is *extraneous* — extraneous load = the part the design adds, the part you can cut |
| 2 | **Latency perception & feedback** | Nielsen, *Response Times: The 3 Important Limits*, NN/g (1993, drawing on Miller 1968) | **0.1s / 1s / 10s thresholds**; **percent-done indicator**; skeleton screens; optimistic UI. Direct fit for agent harness — long tool calls, model latency, hook delays. |
| 3 | **Information scent** | Pirolli & Card, *Information Foraging*, Psych Review 1999; Pirolli, *Information Foraging Theory*, OUP 2007 | **information scent**; **scent-following**. Routes to "do command names / output structure / log labels signal what they hold?" — directly applies to CLI navigation and log triage. |
| 4 | **Progressive disclosure** | Nielsen, NN/g (1995–); Tidwell, *Designing Interfaces* | **progressive disclosure** (already L4); "two-level rule" — NN/g's empirical finding that >2 disclosure levels destroys usability. |
| 5 | **Error prevention vs recovery** | Nielsen, *10 Usability Heuristics for User Interface Design* (1994), heuristic #5 (prevention) and #9 (recognize/diagnose/recover) | **error prevention** (already L4); **constraints / forcing functions** (Norman); **confirmation for destructive actions**. The agent-harness analog: prompt for `git push --force`, refuse `rm -rf` without consent. |
| 6 | **Microcopy as UX surface** | Yifrah, *Microcopy: The Complete Guide* 2nd ed. 2017; UX Writing Hub canon | **microcopy**; **voice & tone**; **error-message microcopy** (state what / why / how-to-fix); empty-state copy. Currently absent from L4 — the prior brief flagged this as a gap. |
| 7 | **Scannability / "don't make me think"** | Krug, *Don't Make Me Think* (2000 / Revisited 2014) | **scannability**; **self-evident vs self-explanatory**. Krug's distinction is sharper than the slogan alone — "self-evident" is the higher bar; "self-explanatory" is the fallback. |

### 3. Interaction design practices surfaced

Substrate tags: **[GUI]** consumer GUI, **[CLI]** terminal/command-line, **[AGENT]** agent harness, **[API]** developer API, **[H]** hybrid / general.

| # | Pattern | Canonical anchor | Vocabulary candidates | Substrate |
|---|---|---|---|---|
| A | **Affordance / signifier distinction** | Norman, *DOET* revised ed. 2013 (signifier added explicitly) | affordance, **signifier** (already L4 — flag the 2013 revision as the load-bearing edition; affordances ≠ signifiers) | [H] |
| B | **Microinteraction grain** | Saffer, *Microinteractions* 2013 | microinteraction (already L4) — Saffer's four parts: **trigger / rules / feedback / loops & modes**. Naming the four-part decomposition is what makes this routing-effective. | [H] |
| C | **Anticipation** | Tognazzini, *First Principles of Interaction Design* | anticipation (already L4) | [H] |
| D | **Mixed-initiative interaction** | Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999 ([erichorvitz.com/chi99horvitz.pdf](https://erichorvitz.com/chi99horvitz.pdf)) | **mixed-initiative**; expected-utility-of-acting; "scope precision to match uncertainty"; "all-or-nothing trap." Foundational for agent-UX — when does the agent act vs ask? | [AGENT] |
| E | **Human-AI interaction guidelines (the 18)** | Amershi et al., CHI 2019, *Guidelines for Human-AI Interaction* ([dl.acm.org/doi/10.1145/3290605.3300233](https://dl.acm.org/doi/10.1145/3290605.3300233)) | **Amershi 18**; "make clear what the system can do" (G1); "time services based on context" (G3); "support efficient correction" (G9); "convey why the system did what it did" (G11). Validated against 20 AI products with 49 designers — the canonical AI-UX checklist. | [AGENT] |
| F | **Trust calibration / appropriate reliance** | Lee & See, *Trust in Automation: Designing for Appropriate Reliance*, Human Factors 2004 ([journals.sagepub.com/doi/10.1518/hfes.46.1.50_30392](https://journals.sagepub.com/doi/10.1518/hfes.46.1.50_30392)) | **trust calibration**; **appropriate reliance**; over-trust / under-trust. Names the AI-UX failure mode the Amershi guidelines try to prevent. | [AGENT] |
| G | **Explanation as social process** | Miller, *Explanation in Artificial Intelligence: Insights from the Social Sciences*, AI Journal 2019, arXiv [1706.07269](https://arxiv.org/abs/1706.07269) | **contrastive explanation**; selected explanation; explanation-as-conversation. XAI canon for "why did the agent do that?" surfaces. | [AGENT] |
| H | **CLI design discipline** | clig.dev, Aanand Prasad / Ben Firshman / Carl Tashian / Eva Parish ([clig.dev](https://clig.dev/)); UNIX philosophy lineage | **human-first CLI**; **composability**; stdin/stdout discipline; **transparent action** (no implicit destructive steps); empathetic error messages. Modernizes UNIX principles for human + program-to-program duality. | [CLI] |
| I | **Conversational repair** | Ashktorab et al., *Resilient Chatbots: Repair Strategy Preferences for Conversational Breakdowns*, CHI 2019 ([qveraliao.com/chi19-1.pdf](http://qveraliao.com/chi19-1.pdf)); broader Clark grounding canon | **conversational repair**; **graceful failure**; **clarification turn** (vs generic error). Direct fit for agent loops where the model misunderstands. | [AGENT] |

### 4. Recommended additions to L4 vocabulary

Current L4: affordance/signifier (Norman), anticipation (Tognazzini), microinteraction (Saffer), progressive disclosure (Nielsen), error prevention > recovery (Nielsen #5), don't-make-me-think (Krug). Six terms, GUI-leaning, no AI-specific anchors, no microcopy-specific anchor, no latency-perception anchor.

**Top 4 recommendations** (prioritized; user picks).

| # | Term | Attribution | Justification | Cluster activated (vs current) | Recommendation |
|---|---|---|---|---|---|
| 1 | **Amershi 18 guidelines for human-AI interaction** | Amershi et al., CHI 2019 | The canonical AI-UX checklist — 18 guidelines validated empirically across 20 AI products. Routes the skill to "does this agent surface make clear what it can do (G1) / convey why (G11) / support correction (G9)" — concrete refine questions that none of the current 6 terms reach. | AI-UX heuristics, validated. Replaces the ambient gap where current L4 routes to GUI-IxD clusters. | **ADD** — high confidence. Most load-bearing single addition for the substrate. |
| 2 | **mixed-initiative (Horvitz, CHI 1999)** | Horvitz, CHI 1999 | Names the central agent-harness design tension: when does the agent act autonomously vs. ask? "Scope precision to match uncertainty," "avoid the all-or-nothing trap" — these are direct refine questions. Pre-dates the LLM era but the principles are the canonical foundation that every agent-UX paper since cites. | Agent-initiative reasoning. Currently absent — Tognazzini's anticipation gestures at adjacent territory but is GUI-flavored. | **ADD** — high confidence. |
| 3 | **microcopy (Yifrah, 2017)** | Yifrah, *Microcopy: The Complete Guide* 2nd ed. 2017 | Names the *unit* of L4 polish for non-visual surfaces — error messages, empty states, button labels, success confirmations. Substrate-perfect for CLIs and agent harnesses where visual polish is irrelevant but text microcopy is the entire surface. Prior brief flagged the gap; this closes it. | Microcopy / UX-writing canon. Activates voice & tone, error-message structure (what / why / how-to-fix), empty-state writing — none of which the current cluster reaches. | **ADD** — high confidence. Strongest substrate fit of any candidate. |
| 4 | **Nielsen response-time limits (0.1s / 1s / 10s)** | Nielsen, NN/g 1993 (drawing on Miller, *Response time in man-computer conversational transactions*, AFIPS 1968) | Names the latency-perception thresholds that govern agent-loop UX — when does a tool call need a progress indicator? When does silence kill flow? Direct routing for "this agent waits 8s with no feedback — broken at the 1s threshold." | Latency / feedback timing. Currently absent — `microinteraction` covers feedback grain but not the timing rules. | **ADD** — high confidence. Cheap to add (one line, three numbers, citation). |

**Optional 5th** (lean: skip unless `refine-cadre` outputs frequently target CLI surfaces specifically): **clig.dev / human-first CLI** as a substrate-specific anchor for command-line refine work. Reason to skip: substrate-specific; if the skill targets a CLI it can pull this from `.cadre/references/`. Tag: **OPTIONAL**.

**Trim consideration:** if budget pressure forces dropping one of the original 6 to land at 6 total, the weakest substrate-fit is **don't-make-me-think (Krug)** — Krug's canon is consumer-web-explicit. Krug's principle survives implicitly inside `Amershi G1` ("make clear what the system can do") and `signifier` (Norman). Lean: keep Krug — the slogan does load-bearing routing for "is this self-evident" gut-checks even on CLIs — but flag as the first cut if forced.

### 5. AI-UX and agent-UX additions — tight call

The substrate question is real. For Cadre — agent harness, dev tools, CLIs — the AI-UX canon is **load-bearing**, not optional. Without it, L4 routes to GUI clusters that mostly don't apply.

**Recommended core (in priority order):**

1. **Amershi 18** (CHI 2019) — the validated AI-UX heuristic set. Single highest-leverage add.
2. **mixed-initiative (Horvitz CHI 1999)** — the agent-vs-user-action canonical lens.
3. **microcopy (Yifrah)** — the unit of polish on text-only surfaces (most of Cadre's surface).

**Held in references, not vocabulary:**

- **Trust calibration (Lee & See 2004)** — strong canon, but the term is *implicit* in Amershi G2 ("make clear how well the system can do what it can do") and G11 ("convey why"). Adding it separately risks double-routing. Keep in `.cadre/references/` for when refine outputs need to reason about reliance specifically.
- **Contrastive explanation (Miller 2019)** — even more specialized; XAI-specific. Same argument: surfaces inside the Amershi guidelines' "convey why" cluster. Hold for now.
- **Conversational repair (Ashktorab CHI 2019)** — relevant when the skill targets dialogue-style agents specifically. Subsumed by Amershi G9 ("support efficient correction") for the general case.
- **Generative-AI design principles (Weisz et al. IBM CHI 2024; Springer 2025 11 guidelines)** — too fresh for the 15-year test; the umbrella terms (`Design for Imperfection`, `Design for Co-Creation`) haven't settled into senior-practitioner unprompted vocabulary yet. Revisit in 2027.

**Net:** add **Amershi 18** + **mixed-initiative** to make the AI-UX surface a first-class routing target. Add **microcopy** for text-surface polish. Add **Nielsen response-time limits** for latency-feedback grain. Land L4 at 9 terms (6 original + 3 substrate-specific additions; response-time limits is a four-word anchor, not a separate cluster expansion).

### 6. Confidence calibration

| Recommendation | Confidence | Rationale |
|---|---|---|
| ADD `Amershi 18 (CHI 2019)` | **High** | 1,360+ citations; validated empirically; load-bearing for the substrate; senior AI-UX researchers cite by paper unprompted. The single most consequential addition. |
| ADD `mixed-initiative (Horvitz CHI 1999)` | **High** | Foundational; cited in essentially every agent-UX paper since; Horvitz attribution is unambiguous. Soft spot: 26-year-old paper — verify it still routes for younger practitioners (it does in 2026 GenAICHI proceedings). |
| ADD `microcopy (Yifrah 2017)` | **High** | Closes a substrate gap the prior brief flagged; Yifrah is the canonical attribution; "microcopy" passes the 15-year test (term is ~15 years old in current usage; predates Yifrah's book but she canonized it). |
| ADD `Nielsen response-time limits (0.1s / 1s / 10s)` | **Medium-high** | Foundational and still cited (NN/g republishes annually); minor risk that the specific numbers feel dated for AI workloads where multi-second responses are routine. Mitigation: cite the paper, not just the numbers — the *thresholds-as-design-anchors* concept is the load-bearing piece. |
| OPTIONAL `clig.dev / human-first CLI` | **Medium** | Strong canon for CLI work; substrate-specific. Add only if the skill targets CLIs frequently. |
| HOLD `trust calibration (Lee & See)` | **Medium** as a held term — load-bearing concept but routing risk if added alongside Amershi (double-routing on AI-trust questions). |

### 7. Out of scope / open questions

- **Empirical validation gap.** Same caveat as Revisions 1, 3, 4 — the routing-differential predictions are theory-grounded only. A first-draft skill is the right place to find this out.
- **L4 cluster size after additions.** 6 → 9 terms with the recommended additions. Above the 3-8 guideline; same overshoot as L1's proposed 9. Trade: substrate-correctness vs cluster discipline. Recommend keeping at 9; L4 was the weakest cluster in Revision 1 and the additions all close real substrate gaps.
- **GenAICHI 2024/2025 vocabulary.** Weisz et al.'s "Design for Imperfection / Co-Creation / Generative Variability" is the most ambitious recent canon attempt. Not recommended yet — the 15-year test fails on novelty. Revisit in 2027–2028 once the terms either settle into practitioner vocabulary or get superseded.
- **Krug-vs-substrate trim choice.** Flagged in §4 as the first cut if cluster size becomes a hard constraint. User decision.
- **Conversational repair as a cluster of its own.** If `refine-cadre` ever surfaces a lot of dialogue-quality findings, Ashktorab et al. (CHI 2019) and the broader Clark grounding canon (*Using Language*, 1996) deserve their own routing slot. Out of scope for current draft.

**Sources added in this revision (verified 2026-04-26):**
- Amershi et al., *Guidelines for Human-AI Interaction*, CHI 2019 — [dl.acm.org/doi/10.1145/3290605.3300233](https://dl.acm.org/doi/10.1145/3290605.3300233)
- Horvitz, *Principles of Mixed-Initiative User Interfaces*, CHI 1999 — [erichorvitz.com/chi99horvitz.pdf](https://erichorvitz.com/chi99horvitz.pdf)
- Lee & See, *Trust in Automation: Designing for Appropriate Reliance*, Human Factors 2004 — [journals.sagepub.com/doi/10.1518/hfes.46.1.50_30392](https://journals.sagepub.com/doi/10.1518/hfes.46.1.50_30392)
- Miller, *Explanation in AI: Insights from the Social Sciences*, AI Journal 2019, arXiv [1706.07269](https://arxiv.org/abs/1706.07269)
- Yifrah, *Microcopy: The Complete Guide* 2nd ed. (2017)
- Nielsen, *Response Times: The 3 Important Limits*, NN/g 1993 — [nngroup.com/articles/response-times-3-important-limits](https://www.nngroup.com/articles/response-times-3-important-limits/)
- Pirolli & Card, *Information Foraging*, Psych Review 1999
- Sweller, *Cognitive Load During Problem Solving*, Cognitive Science 1988
- Norman, *The Design of Everyday Things*, revised and expanded ed. 2013 (signifier distinction)
- clig.dev — Prasad / Firshman / Tashian / Parish, *Command Line Interface Guidelines* — [clig.dev](https://clig.dev/)
- Ashktorab et al., *Resilient Chatbots: Repair Strategy Preferences for Conversational Breakdowns*, CHI 2019 — [qveraliao.com/chi19-1.pdf](http://qveraliao.com/chi19-1.pdf)
- Weisz et al., *Design Principles for Generative AI Applications*, CHI 2024 — [dl.acm.org/doi/10.1145/3613904.3642466](https://dl.acm.org/doi/10.1145/3613904.3642466) (surveyed, held)
