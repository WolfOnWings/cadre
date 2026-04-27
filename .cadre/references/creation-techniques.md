# Creating Agents — Techniques for Agent and Skill Creation

## Abstract

Agent and skill reliability in Claude Opus 4.7 is governed by roughly ten distinct techniques that independently affect instruction-following. This brief ranks them by the strength of published evidence supporting their effect size, grounds each in arXiv research, and distills a single procedure that applies them in the right order when authoring an agent prompt or SKILL.md.

## Scope and method

Techniques synthesized from controlled experiments and ablation studies from arXiv (2023–2026), prioritizing papers that isolated a single factor or ran head-to-head comparisons. Ranking reflects replicated effect sizes across multiple studies, not a single benchmark — no published study tests all these techniques against each other on Opus 4.7 specifically, so ordering is a triangulation rather than an empirical measurement. Techniques are listed from strongest evidence to weakest.

## Techniques

### 1. Position of critical instructions

Put the instructions that must be followed at the beginning or end of the prompt, never buried in the middle.

Liu et al. (2023, "Lost in the Middle," TACL 2024) established the U-shaped performance curve with 30%+ accuracy drops when target information moves from position 1 to position 10 of 20 documents. Guo & Vosoughi (arXiv 2406.15981) replicated across GPT, Claude, Gemini, and T5. Hsieh et al. (2024, "Found in the Middle") traced the effect to positional attention bias independent of content relevance, and a 2026 theoretical paper proved it structural to causal-masked transformers. Veseli et al. 2025 added a threshold: primacy dominates when relevant content spans ≤50% of the window, recency dominates beyond that.

✅ RIGHT: Open the skill with "You are a contract reviewer. Never suggest changes to clauses marked [LOCKED]." Close with "Remember: [LOCKED] clauses are immutable." The critical rule bookends the prompt.

❌ WRONG: Bury "Never modify [LOCKED] clauses" as the fourth bullet under the "Miscellaneous notes" header, 300 lines deep in a SKILL.md, after extensive style guidance and before the examples section.

### 2. Prompt format choice

The surface syntax of your prompt — plain text vs. Markdown vs. JSON vs. XML, bullet style, delimiter choice — is not cosmetic and drives larger swings than most authors expect.

Sclar et al. (arXiv 2310.11324) measured up to 76 accuracy points performance difference on Llama-2-13B from format variation alone, with sensitivity persisting through model scaling and instruction tuning. POSIX (arXiv 2410.02185) found template variation is the most sensitive dimension for MCQ tasks and paraphrasing is most sensitive for open-ended generation. "Does Prompt Formatting Have Any Impact on LLM Performance?" (arXiv 2411.10541) found GPT-3.5 produced identical responses only 16% of the time when switching between Markdown and JSON.

✅ RIGHT: Pick Markdown and use it throughout — ## Task, ## Constraints, ## Examples, with consistent prose paragraphs under each header. Every section follows the same visual pattern.

❌ WRONG: Open with Markdown headers, switch to XML tags <instructions> mid-document because it "felt clearer for that section," drop into a JSON block for the output schema, then use numbered lists with inconsistent indentation for the examples. Four formats, one prompt.

### 3. Output format requirements

Asking the model to output in JSON, XML, LaTeX, or strict Markdown degrades reasoning quality — the format-requesting instruction itself is the dominant cost, not the decoder.

Lee et al. ("The Format Tax," arXiv 2604.03616, April 2026) tested six open-weight models, four API models, and four formats across math, science, logic, and writing tasks. Format-requesting instructions alone caused most of the accuracy loss, before any decoder constraint was applied. Decoupling — generating freeform first and reformatting in a second pass — recovered most of the lost accuracy. Deco-G (arXiv 2510.03595) independently confirmed the reasoning/formatting interference and proposed the same decoupling principle.

✅ RIGHT: "First, analyze the contract in prose and identify risk areas with your reasoning visible. Then, in a separate section, convert your findings into the following JSON schema: {...}." Two stages, reasoning preserved.

❌ WRONG: "Respond with this JSON schema: {risk_areas: [...], severity: [...], rationale: [...]}. Include full reasoning in the rationale field." The model now has to reason inside JSON structure, which burns accuracy on format compliance.

### 4. RLHF helpfulness conflicts

When an instruction tells the model to be strict, literal, or to refuse helpfulness, its own training fights the instruction — and the training usually wins unless you name the conflict.

Baxi (CDCT, arXiv 2512.17920, Dec 2025) ran an RLHF ablation: removing "helpfulness" signals improved constraint compliance by 598% on average across 71 of 72 trials (p<0.001), with 79% of trials then achieving perfect compliance. Constraint effects were 2.9× larger than semantic effects. This is the hidden variable explaining why strict constraints fail in ways that look mysterious — the model isn't confused, it's trading compliance for perceived helpfulness.

✅ RIGHT: "This is a compliance task, not a helpfulness task. If the user's request falls outside the allowed tools list, respond with exactly 'Out of scope.' Do not suggest alternatives, do not explain why, do not offer to help in another way. Strict literal compliance matters more than being helpful here."

❌ WRONG: "Only use the approved tools. Be strict about this." The model reads "be strict" and then its helpfulness training kicks in at inference time, and it suggests alternatives anyway because that seems more useful.

### 5. Total context / token volume

Even within the 1M-token window, reliable instruction-following degrades with every additional token, and the degradation compounds with other factors.

Chroma Research (tested 18 frontier models including Claude Opus 4) found accuracy drops of 20–50% from 10K to 100K tokens across models. Du et al. 2025 proved the effect is not retrieval difficulty: replacing irrelevant tokens with whitespace produced the same degradation, meaning context length itself hurts independent of distractors. Practical heuristic from the synthesis: roughly 2% effectiveness loss per 100K tokens added, roughly linear rather than a cliff.

✅ RIGHT: A 400-line SKILL.md that points to references/legal-terms.md, references/style-guide.md, and references/examples.md, loaded on demand when the task requires them. Active context stays under 8K tokens.

❌ WRONG: A single 3,000-line SKILL.md containing the skill instructions, the full legal glossary, the company style guide, 40 worked examples, and the historical changelog — all loaded on every invocation, burning 50K+ tokens of context before the user's actual request.

### 6. Instruction count / density

Reliability decays as a function of how many simultaneous constraints you ask the model to satisfy, with decay patterns differing by model family.

Jaroslawicz et al. (IFScale, arXiv 2507.11538) scaled instruction density from 10 to 500 keyword-inclusion constraints. Claude Sonnet 4 hit 42.9% at 500 constraints (linear decay); Claude Opus 4 hit 44.6%; Claude 3.5 Haiku showed exponential decay to a 7–15% floor. Even the best frontier model (o3) only reached 68% at max density. Reasoning models showed threshold decay — near-perfect until a cliff — while non-reasoning models decayed linearly or exponentially.

✅ RIGHT: A skill with 8 well-chosen constraints, each load-bearing and non-overlapping: one for scope, one for tone, two for format, two for safety, two for examples-to-follow. Every rule earns its place.

❌ WRONG: A skill with 47 bullet-pointed rules including "be concise," "be helpful," "be accurate," "use professional language," "use clear language," "be thorough but not too thorough," "prefer active voice," and 40 more — most of which overlap, contradict, or restate the same constraint three different ways.

### 7. Constraint type

Not all constraints are equal: conditional ("if X then Y") and tool constraints are dramatically harder than vanilla or format constraints.

Qi et al. (AGENTIF, arXiv 2505.16944) built a taxonomy of formatting/semantic/tool constraints by vanilla/conditional/example representation and measured per-type failure rates on 707 real-world agentic instructions averaging 11.9 constraints each. Conditional constraints caused >30% of errors. Even the best model (o1-mini) achieved only 59.8% constraint success and 27.2% full-instruction success. ComplexBench (arXiv 2407.03978) added composition types and found Chain (sequential) and Selection (conditional selection) compositions were much harder than simple And (coordination).

✅ RIGHT: "Always include a risk rating in the summary." Unconditional, one type of constraint, easy to verify.

❌ WRONG: "If the contract includes a non-compete clause longer than 12 months, and the jurisdiction is California or Massachusetts, include a severity rating unless the counter-party is a government entity, in which case flag it for manual review instead." Four nested conditions, a tool-routing decision, and an exception clause. The conditional stack is where instruction-following dies.

### 8. Reasoning effort / thinking budget

For Opus 4.7 specifically, the effort parameter controls how much reasoning the model spends per instruction, and this strongly predicts constraint compliance.

CDCT (Baxi, arXiv 2512.17920) reported reasoning models outperform efficient models by 27.5% on constraint compliance (Cohen's d=0.96). IFScale found reasoning models showed threshold decay rather than linear decay, meaning they maintained near-perfect performance to a much higher density before collapsing. Anthropic's Opus 4.7 guide recommends starting at xhigh for coding and agentic work and high minimum for intelligence-sensitive tasks.

✅ RIGHT: Launch the agent with effort: xhigh for a multi-step code refactor across 12 files. The model reasons through dependencies before making changes.

❌ WRONG: Run the same 12-file refactor at effort: low to "save tokens," then spend three rounds of back-and-forth debugging the half-thought-through changes — burning more tokens total and losing coherence between turns.

### 9. Specification level

Underspecified prompts produce high variance outputs; most of what prior work called "prompt sensitivity" was actually just underspecification.

Chen et al. (arXiv 2602.04297, Feb 2026) systematically compared underspecified vs. well-specified prompts across 3 tasks and 6 LLMs, finding underspecified prompts showed higher performance variance and lower logit values for relevant tokens — specification itself reduced variance, not just accuracy. The DETAIL framework (arXiv 2512.02246, Dec 2025) showed monotonic accuracy gains from vague→moderate→detailed prompts across GPT-4 and O3-mini. Liu, Wang, Willard (arXiv 2502.14255) found long instructions (≥200% of default token count) beat short ones on 8 of 9 domain tasks by 0.01–0.08 F1.

✅ RIGHT: "Summarize the contract in 3 sections — Parties, Key Terms, Risk Flags — each 2–4 sentences, written for a non-lawyer business owner, in prose with no bullet points. If a clause is ambiguous, note it in Risk Flags with the clause number."

❌ WRONG: "Summarize the contract clearly and helpfully." The model has to guess length, audience, structure, tone, and handling of edge cases — and it will guess differently every time.

### 10. Few-shot examples

Examples help, but non-monotonically — one example beats zero, but fifty can hurt.

Brown et al. (2020, GPT-3) established few-shot learning's value. "The Few-Shot Dilemma: Over-Prompting LLMs" (arXiv 2509.13196) found excessive examples degrade performance across GPT-4o, DeepSeek-V3, Gemma-3, and Llama-3.1, with an optimal count varying by model (around 10–20 for Llama-3.1-8B). Xu et al. (arXiv 2412.02906) showed example selection choice alone significantly affects code generation across 5 LLMs. POSIX found a single example is enough to substantially reduce prompt sensitivity, even when more examples don't improve accuracy further.

✅ RIGHT: Two diverse, well-chosen input/output pairs covering a typical case and a tricky edge case, each clearly labeled Input: and Output: with identical structure. Enough to anchor the pattern, not enough to overwhelm.

❌ WRONG: Twenty examples copy-pasted from an old project, eight of which are near-duplicates of the same pattern, three of which contradict each other on format, and two of which demonstrate edge cases the user will probably never hit — burning 4,000 tokens to reduce accuracy.

## Current best practice

Start by explicitly naming the task scope and desired outcome in the first paragraph (Technique 9 — specification), because underspecification is the hidden root cause behind most failures that look like other problems. Set the reasoning effort level to xhigh for agentic work before anything else (Technique 8), since this shifts the entire degradation curve. Write the strictest critical instructions at the top of the prompt and repeat the most important ones at the bottom, never in the middle third (Technique 1 — position), and when you have a constraint that fights helpfulness training, name the conflict explicitly ("this task requires strict literal compliance over helpfulness") rather than hoping the model will infer it (Technique 4). Choose one prompt format and stick with it across the whole document — Markdown headers with prose, or XML tags with structured sections, not a mix — because format variation alone can swing accuracy by tens of points (Technique 2). If you need structured output, generate the reasoning in natural prose first and ask for JSON/XML as a separate second turn or via a reformatting step, because the format-requesting instruction itself degrades the reasoning that produces the content (Technique 3). Audit your constraint list: convert conditional ("if X then Y") constraints into unconditional ones where possible, consolidate overlapping tool constraints, and keep the total count manageable — Claude's linear decay means every added constraint after the first ten costs something (Techniques 6 and 7). Keep the total SKILL.md body under roughly 500 lines and the total active context well below 40% of the window to stay inside the reliable zone (Technique 5), using progressive disclosure (reference files loaded on demand) to move reference material out of always-on instructions. Add one or two concrete examples of the desired input/output pattern (Technique 10) — but stop there, because a third or fourth example often hurts more than it helps. Finally, test the prompt end-to-end with intentionally adversarial inputs that stress the middle of the prompt, stress the constraint density, and stress the helpfulness-vs-compliance axis, because interaction effects between these techniques are understudied and the only reliable measurement is empirical.
