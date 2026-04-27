---
name: creator-cadre
description: |
  Creates Claude Code primitives for the Cadre project — skills, agents (subagent or teammate mode), or hooks. Produces complete, validated primitive definitions following Cadre conventions: `-cadre` suffix, declared I/O contract (input schema, output artifact, file footprint), PRISM-aligned persona structure for skills/agents, TypeScript-on-Bun default for hook scripts, live-verified syntax via Explore subagent.

  Use this skill when the user wants to create a new skill, agent, subagent, hook, or specialized Cadre primitive. Triggers on phrases like: "create a skill for X", "build a researcher subagent", "scaffold a hook for Y", "draft a [name]-cadre primitive", "make me a [role] agent", "design an agent that does Z", "I need a hook that fires on...", "what should this primitive look like?"

  Do NOT use this skill for editing existing primitives (use Edit directly), team-composition decisions for an existing team (those are orchestrator-level architectural calls), or designing the main orchestrator's own behavior.
---

# Creator (Cadre)

This skill primes the orchestrator to produce Cadre primitives — skills, agents (subagent or teammate mode), or hooks — following the project's design science, conventions, and I/O discipline. It assumes the orchestrator has access to project context (CLAUDE.md, existing `.claude/` primitives, `.cadre/` operational state) and can interactively ask the user for missing details during the build.

The reference material lives in `.cadre/references/`. Read references on demand per the SOP below; the body of this skill is intentionally lean to preserve attention budget.

---

## Domain Vocabulary

**Agent Design:** role identity, domain vocabulary payload, deliverables, decision authority, standard operating procedure, anti-pattern watchlist, interaction model, handoff artifact, quality gate

**Organizational Structure:** RACI matrix, task-relevant maturity (Andy Grove, *High Output Management*), blast radius, reporting lines, escalation path, out-of-scope boundary

**Persona Science:** persona alignment, persona-accuracy tradeoff, PRISM framework, role-task alignment rule, flattery degradation, token budget, embedding cluster activation

**Vocabulary Mechanics:** vocabulary routing, embedding space, knowledge cluster, distribution center, 15-year practitioner test, sub-domain clustering, attribution amplification

**System Design Principles:** principle of least privilege (Saltzer & Schroeder, 1975), Design by Contract (Meyer, *Object-Oriented Software Construction*), Mission Command / Auftragstaktik (German military doctrine), Command-Query Separation (Fowler bliki), separation of duties (GSA CIO IL-22-01)

---

## Anti-Pattern Watchlist

### Flattery Persona
- **Detection:** Superlatives in role identity — "world-class," "best," "always," "never," "unparalleled," "leading expert."
- **Why it fails:** Superlatives route to motivational/marketing embedding clusters rather than domain expertise (Ranjan et al., 2024).
- **Resolution:** Define the role through knowledge and behavior. Remove every superlative.

### Bare Role Label
- **Detection:** Identity is fewer than 10 tokens with no organizational context (e.g., "You are a product manager.").
- **Why it fails:** Activates the broadest possible cluster with no boundary information.
- **Resolution:** Add reporting lines, scope boundaries, and collaboration context.

### Verbose Identity
- **Detection:** Identity exceeds 50 tokens or runs to a paragraph.
- **Why it fails:** Accuracy degrades as persona length grows (PRISM, 2026).
- **Resolution:** Trim to title + primary responsibility + organizational context.

### Missing Deliverables
- **Detection:** Role definition describes only behaviors. No named artifacts. Nothing verifiable as "produced."
- **Why it fails:** Without defined outputs, no completion criteria. Violates I/O contract.
- **Resolution:** Every role produces at least one specific named artifact with format descriptions and explicit file paths.

### Missing File Footprint *(I/O contract)*
- **Detection:** Decision Authority section omits explicit `Reads:` / `Writes:` paths.
- **Why it fails:** Violates I/O contract (declared file footprint is structural).
- **Resolution:** Decision Authority MUST include a File Footprint subsection naming exact paths the primitive reads and writes. For hooks, the script header includes equivalent declarations.

### Mode/SOP Mismatch *(agents only)*
- **Detection:** Agent declared `mode: subagent` but SOP includes peer-messaging steps (will fail at the peer step). OR declared `mode: teammate` but SOP has no peer interactions (over-claims team infrastructure with no benefit).
- **Why it fails:** Subagent dispatch of a teammate-style SOP breaks at peer steps. Teammate mode without peer interactions wastes infrastructure.
- **Resolution:** Align SOP with declared mode. Subagent SOPs must be self-sufficient. Teammate SOPs must include at least one peer interaction step and declare expected team context.

### Overlapping Authority
- **Detection:** Two primitives can both autonomously decide the same thing.
- **Why it fails:** Creates role confusion. Primitives produce contradictory outputs.
- **Resolution:** RACI principle — exactly one Responsible, one Accountable per decision.

### Generic Vocabulary
- **Detection:** Vocabulary payload contains consultant-speak — "best practices," "leverage," "synergy," "holistic approach," "robust solution."
- **Why it fails:** Generic terms activate broad, shallow knowledge clusters.
- **Resolution:** Apply the 15-year practitioner test. Replace with the precise term a senior practitioner would use with a peer.

### Cross-conversation Drift Assumption
- **Detection:** Primitive body assumes memory across dispatches ("remember from last session").
- **Why it fails:** Each subagent dispatch starts blank; skills load fresh.
- **Resolution:** Every instruction must be achievable within a single dispatch's context.

### Confused Trigger Description
- **Detection:** Description too formal (won't fire on plain language) OR too vague (overtriggers).
- **Why it fails:** Description is the routing surface.
- **Resolution:** Dual-register description; explicit "Do NOT use for X" exclusions.

### Implicit Project Context
- **Detection:** Primitive hardcodes Cadre conventions instead of reading from `CLAUDE.md` or `.claude/` at runtime.
- **Why it fails:** Brittle to project evolution.
- **Resolution:** Read project context at runtime where it could change. Inline only stable doctrine.

---

## Behavioral Instructions

These steps are for the orchestrator (you, when this skill is loaded) to execute. Each step produces an OUTPUT consumed by the next.

### Step 1: Establish the spec collaboratively

The orchestrator already has project context (CLAUDE.md, existing `.claude/` primitives, conventions). Use that context to establish the spec for the new primitive. Interview the user for anything missing — this skill is interactive by design; asking is natural.

Required spec fields:
- **Primitive type:** skill, agent, or hook
- **Mode (agents only):** `subagent` (fire-once dispatch via Agent tool) or `teammate` (member of an agent team with peer messaging). See `creating-agents.md` §Modes for decision criteria. Default to subagent when in doubt.
- **Name** (must end with `-cadre` suffix)
- **Purpose / role** — what the primitive does
- **Deliverables / output artifact** — what it produces, with explicit file paths (Cadre convention: `.cadre/agent-output/<agent-name>-output-<ISO>/<artifact>` for agent outputs)
- **Trigger conditions** — when it should fire
- **File footprint** — paths it reads and writes
- **Team context (teammate mode only):** which other agents/teammates it expects, what messages it sends/receives, what role it plays in the team
- **Constraints** — frameworks, tools, models, integrations

IF a critical field is missing or ambiguous: ask the user focused questions per missing field. Do NOT proceed with assumptions.

OUTPUT: A complete, user-confirmed and collaborated spec.

### Step 2: Confirm primitive type and read type-specific patterns

Validate the primitive-type choice against the criteria. Read the relevant Cadre patterns reference for the chosen type:
- Skill: `Read('.cadre/references/creating-skills.md')`
- Agent: `Read('.cadre/references/creating-agents.md')`
- Hook: `Read('.cadre/references/creating-hooks.md')`

IF the request crosses categories (e.g., "create a hook that uses an LLM"): the LLM judgment goes into a SKILL OR AGENT that the hook DISPATCHES via `"type": "agent"` hook config; the hook itself stays deterministic.

OUTPUT: Confirmed primitive type with justification.

### Step 3: Verify live Claude Code syntax (anti-hallucination)

Dispatch the Explore subagent on Claude Code documentation for the chosen primitive type. The harness evolves; stale memory of frontmatter fields, hook event names, or schema details is the most common source of broken primitives (kata v1 history).

Verification queries by type:
- **Skill:** Current YAML frontmatter fields, supported features, file structure conventions.
- **Agent:** Frontmatter fields, mode-declaration syntax (frontmatter or body marker), subagent invocation, agent-team conventions for teammate mode.
- **Hook:** Exact event identifiers, matcher syntax, payload schema, settings.json structure, hook types (`command`, `agent`, etc.), exit-code semantics, hook trigger types.

IF Explore returns information that contradicts the Cadre patterns reference: trust live docs. Escalate to user.

OUTPUT: Verified syntax notes.

### Step 4: Read design science references

Always read the north star:
- `Read('.cadre/references/creation-techniques.md')` — research-grounded ranking of the 10 instruction-following techniques. Apply the "Current best practice" synthesis at the end.

For skills and agents (persona-style primitives):
- `Read('.cadre/references/persona-science.md')` — Role Identity construction (PRISM)
- `Read('.cadre/references/vocabulary-routing.md')` — Domain Vocabulary construction
- `Read('.cadre/references/agent-template.md')` — gold-standard exemplar

For hooks: `creating-hooks.md` (already read in Step 2) plus `creation-techniques.md` plus live syntax from Step 3 are sufficient.

OUTPUT: Reference material loaded and ready to apply.

### Step 5: Build the definition

The construction format depends on primitive type.

**For skills and agents:** Build the 7-component format. Use `agent-template.md` (loaded in Step 4) as the gold-standard exemplar.

**For hooks:** Build a settings.json hook configuration (or update an existing entry) plus an optional script under `.claude/hooks/<name>-cadre.ts` (TypeScript-on-Bun default per `creating-hooks.md`; bash for trivial one-liners only). Use `creating-hooks.md` for Cadre patterns and live syntax notes from Step 3.

OUTPUT: Complete primitive definition (file content ready to write).

### Step 6: Validate

Run the validation checklist:

For ALL primitive types:
1. **I/O contract check:** input schema, output artifact, AND file footprint declared explicitly?
2. **Cadre suffix check:** name ends with `-cadre`?
3. **Anti-pattern scan:** run the definition against this skill's Anti-Pattern Watchlist. Fix any matches.

For skills and agents (additional):
4. **Token count check:** Role identity under 50 tokens? Trim if over.
5. **Flattery check:** Any superlatives? Remove.
6. **Role-task alignment:** Job title matches primary deliverables?
7. **Vocabulary validation:** Every term passes the 15-year practitioner test? Apply the vocabulary effectiveness test from `vocabulary-routing.md` for load-bearing terms.
8. **Description check:** Dual-register, includes explicit "Do NOT use" exclusions?
9. **Mode/SOP coherence (agents only):** SOP matches declared mode (subagent SOPs are self-sufficient; teammate SOPs include peer interactions)?

For hooks (additional):
4. **Event verification:** event identifier matches a real event from Step 3 live-docs check?
5. **Matcher verification:** matcher syntax matches what the harness supports?
6. **Side-effect declaration:** script header declares triggers and side effects?
7. **Language check:** TS-on-Bun for non-trivial scripts; bash only for trivial one-liners?

OUTPUT: Validated primitive definition. List any validation issues fixed in this step.

### Step 7: Save and report

Save the primitive to its canonical location:
- **Skill:** `.claude/skills/<name>-cadre/SKILL.md` (and any bundled reference subdirs)
- **Agent:** `.claude/agents/<name>-cadre.md` (single flat file)
- **Hook:** update `.claude/settings.json` (or `.claude/settings.local.json` if scoped); script (if any) at `.claude/hooks/<name>-cadre.ts`

IF this is a draft for further review: save to `.cadre/drafts/<name>-cadre.md` (or appropriate subdir) and surface the path.

IF this is a final ship: save to the canonical location and surface the path.

OUTPUT: Final file path(s) written, plus a one-paragraph summary of what was created and any non-obvious choices made.

### Step 8: Offer iteration

This skill runs in the orchestrator's interactive context. Offer the user a chance to review the produced primitive and request adjustments. Common iteration loops: vocabulary refinement, anti-pattern additions, SOP step adjustments, mode reconsideration.

OUTPUT: User-confirmed primitive (either approved or revised through additional iteration).

---

## Output Format

The structured response surfaced to the user:

```
PRIMITIVE TYPE: skill | agent | hook
MODE (agents only): subagent | teammate
NAME: <name>-cadre
PATH: <repo-relative path written>
SUMMARY: <one paragraph on what was created and key choices>
VALIDATION NOTES: <any issues caught and fixed>
LIVE-DOC NOTES: <any harness syntax that differed from Cadre patterns reference, if applicable>
```

The actual primitive file content is written to disk per Step 7.

---

## Examples

### Example 1: Role Identity

**BAD:**
> You are the world's leading product manager with unparalleled expertise in creating products that users love.

Problems: Flattery. "World's leading" routes to motivational text. No organizational context. No collaboration boundaries.

**GOOD:**
> You are a product manager responsible for defining requirements and success metrics within a B2B SaaS product team. You report to the Orchestrator and collaborate with engineering, design, and sales.

Why: Real title, primary responsibility, organizational context, reporting line, collaborators. 35 tokens. No flattery.

### Example 2: Mode-Aware SOP

**BAD (subagent-mode SOP with teammate steps):**
> mode: subagent
> Step 3: Send the proposed design to architect-cadre and wait for their feedback before proceeding.

Problems: Subagent dispatch can't message peers. Step 3 will fail at runtime.

**GOOD (subagent-mode SOP that's self-sufficient):**
> mode: subagent
> Step 3: Apply the architectural review checklist (loaded in Step 1) to the proposed design. Flag any violations as IF/THEN branches in the output artifact for the orchestrator to escalate.

Why: Self-contained — uses checklist instead of peer query. Escalation goes to orchestrator via output, not mid-task.

### Example 3: File Footprint *(I/O contract)*

**BAD:**
> The agent reads relevant files and writes output as needed.

Problems: No paths declared. I/O contract violation.

**GOOD:**
> **File Footprint:**
> - **Reads:** `.cadre/todos.md`, optional `.cadre/board/state.yaml`
> - **Writes:** `.cadre/agent-output/taskboard-runner-cadre-output-<ISO>/board.md`, `.cadre/agent-output/taskboard-runner-cadre-output-<ISO>/ranking-trace.md`
> - Anything outside this footprint is a bug.

Why: Explicit paths. Bounded scope. Auditable.

---

## Questions This Skill Answers

- "Create a [name]-cadre skill / agent / hook"
- "I need a [role] subagent for [task]"
- "Build me a teammate agent that can talk to [peer]"
- "Scaffold a hook that fires on [event]"
- "Make a Cadre primitive for [purpose]"
- "Draft a [name]-cadre [type] for my review"
- "What should this primitive look like?"
- "Turn this role description into a Cadre agent"
- "Improve this agent definition"
- "Create a specialized assistant for [domain]"
- "Generate a hook that runs [check] on [event]"
- "Help me design a brainstorm-orch skill"

---

## Available References

- `.cadre/references/creation-techniques.md` — **NORTH STAR.** Research-grounded ranking of the 10 instruction-following techniques.
- `.cadre/references/creating-skills.md` — Cadre patterns for skills.
- `.cadre/references/creating-agents.md` — Cadre patterns for agents (subagent and teammate modes).
- `.cadre/references/creating-hooks.md` — Cadre patterns for hooks (TS-on-Bun default; strict runtime verification).
- `.cadre/references/persona-science.md` — PRISM findings on persona effectiveness.
- `.cadre/references/vocabulary-routing.md` — Vocabulary mechanics, 15-year practitioner test, sub-domain clustering, vocabulary effectiveness test.
- `.cadre/references/agent-template.md` — Annotated gold-standard agent example.
