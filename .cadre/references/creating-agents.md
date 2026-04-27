# Creating Agents (Cadre patterns)

Cadre-specific patterns and decision criteria for authoring Claude Code agents. Authoritative syntax should be verified against live Claude Code docs at creation time (use Explore subagent on `https://code.claude.com/docs/`); this file captures Cadre conventions and decision frameworks layered on top of the harness.

For research-grounded technique ranking (position, format, context volume, instruction density, etc.), see `creation-techniques.md` — that file is the north star for instruction-following reliability.

---

## What an agent is

An agent is a process with its own context window, defined by a flat file at `.claude/agents/<name>.md`. Subdirectories are NOT supported — the harness only scans `.md` files directly in `.claude/agents/`. The same definition file format covers both modes:

- **Subagent mode** — fire-once dispatch via the Agent tool. Starts blank (only inherited context is the dispatch prompt), runs the task, returns a single artifact. No mid-task communication with the parent or peers.
- **Teammate mode** — member of an agent team (Claude Code's cross-session coordination pattern). Can send and receive direct peer messages during work via a shared task list at `~/.claude/tasks/{team-name}/`. Spawned by a team lead, not the orchestrator directly.

The mode is declared in the agent's frontmatter and constrains what the SOP can include: a subagent-mode SOP must be fully self-sufficient; a teammate-mode SOP can include peer-messaging steps.

## Modes: subagent vs teammate

The mode is the most important up-front decision because it determines what the SOP can rely on for input.

**Choose subagent mode when:**
- The task is self-contained and all input can be specified upfront in the dispatch prompt
- Output is a single artifact returned to the parent
- No mid-task input from peers or user is needed
- The orchestrator handles any interactive context-gathering before dispatching
- Examples: research briefs, single-pass code review, content generation, schema validation

**Choose teammate mode when:**
- The task genuinely requires coordination with other agents (not just the orchestrator)
- Peer dialog is load-bearing — e.g., adversarial review where reviewer A challenges reviewer B's findings, multi-perspective deliberation, dependency negotiation between specialists
- The agent will be spawned by a team lead (not dispatched directly via the Agent tool)
- Examples: deliberative review members, debating specialists in a research swarm, cross-functional product team members

**When in doubt, default to subagent.** Subagent mode is simpler, cheaper, more predictable. Teammate mode requires CC's agent-teams infrastructure, scales costs linearly with team size, and only adds value when the peer interaction itself is essential (not merely convenient). The orchestrator-mediated round pattern (orchestrator dispatches subagents in sequence, passing prior outputs forward) often satisfies what looks like a teammate need without paying the team-mode tax.

## When to choose an agent (vs a skill or hook)

Choose an agent (either mode) when:
- The work should run in an isolated context window (heavy research, long-running, parallelizable)
- The work should run backgrounded so the orchestrator stays free
- The output is an artifact (file, brief, definition) rather than inline conversation
- The role is specialized enough to warrant clean-slate dispatch

Choose a skill instead when the work needs to happen in the orchestrator's context. Choose a hook instead when the action should fire automatically on a harness event.

## Cadre conventions

- **Naming:** `<name>-cadre` suffix per project naming convention. Disambiguates from harness-native subagents (general-purpose, Explore, Plan, etc.).
- **Path:** `.claude/agents/<name>-cadre.md` (single flat file).
- **Mode declaration:** declare `mode: subagent` or `mode: teammate` in frontmatter (or in a top-of-body marker if frontmatter doesn't support custom fields — verify against live docs).
- **References:** since subdirs aren't supported, reference material either inlines into the agent body OR lives in a sibling location (e.g., `.cadre/references/`) that the agent reads at runtime. Both are valid; tradeoff is token-cost-upfront vs runtime-Read-overhead.
- **I/O:** declare what the agent reads, what it writes (file footprint), what it produces (output artifact), what it accepts (input schema in dispatch prompt). Per CLAUDE.md doctrine.
- **Dispatch-clean (subagent mode):** subagent prompts seed the entire context. Avoid named authors/works/frameworks unless the agent should specifically attend to them — seeded context can poison the search space (see CLAUDE.md doctrine; bootstrap session empirical demo).
- **Team-context-aware (teammate mode):** declare which other agents the teammate expects in its team and what messages it sends/receives. Without this, teammate-mode dispatch drifts.

## Frontmatter (verify current syntax via Explore)

Minimum required:
```yaml
---
name: agent-name-cadre
description: When to delegate to this agent (triggers delegation logic).
mode: subagent  # or "teammate"
---
```

Commonly used optional fields (verify each against live docs):
- `tools` — comma-separated allowlist (e.g., `Read, Grep, Glob, Bash, WebSearch`)
- `disallowedTools` — denylist
- `model` — `sonnet` / `opus` / `haiku` / `inherit` (default inherit)
- `maxTurns` — agentic turn limit
- `skills` — list of skill names whose content gets injected
- `effort` — `low` / `medium` / `high` / `xhigh` / `max`
- `isolation` — e.g., `worktree` for git-isolated work
- `color` — UI tag color
- `hooks` — per-agent hook configuration

If `mode` isn't supported as a frontmatter field by the current harness version, declare it as the first line of the body (e.g., `**Mode:** subagent`) so it's still part of the agent's identity.

Always verify the canonical list of supported fields against live docs before shipping; the harness adds and renames fields over time.

## Description authoring (the delegation surface)

The description determines whether the harness delegates to this agent. Treat it with the same rigor as a skill description — it is the most load-bearing surface in the entire definition.

**Dual-register.** Mix formal terminology with colloquial language. For every formal trigger phrase, write 2-3 colloquial equivalents. Single-register descriptions either undertrigger or trigger but produce generic output.

**Pushy about delegation.** Current models undertrigger by default. Aggressively claim the agent's territory: include the domain AND specific dispatch scenarios AND adjacent contexts. Make it obvious when this agent should be dispatched.

**Explicit exclusions.** Include "Do NOT use for X" lines for adjacent territory the agent should NOT claim.

## Body structure (attention-optimized order)

Body IS the system prompt. The order of sections is optimized for the U-shaped attention curve (per `creation-techniques.md` Technique 1) — beginning and end get the most attention.

1. **Mode marker** (if not in frontmatter) + **Brief role identity** (under 50 tokens; no flattery; real job title)
2. **Expert Vocabulary Payload** (15-30 terms in 3-5 clusters) — primes the routing signal
3. **Anti-Pattern Watchlist** (5-10 named anti-patterns) — checked before behavioral execution
4. **Behavioral Instructions** (imperative, IF/THEN, OUTPUT lines)
   - **For teammate mode:** include explicit steps for receiving peer messages, sending peer messages, and resolving disagreements. Name the team context (which other agents are expected, what their roles are).
   - **For subagent mode:** all steps must be executable from the dispatch prompt alone. No "ask peer X" steps.
5. **Output Format**
   - **Subagent mode:** single artifact returned to parent.
   - **Teammate mode:** may include intermediate messages to peers as well as a final artifact.
6. **Examples** (2-3 BAD vs GOOD pairs; most representative LAST per recency bias)
7. **Trigger examples** (less critical than for skills since description drives delegation logic)

Optionally followed by inlined reference material if the agent needs domain knowledge bundled in. Be aware: every dispatch pays the full body token cost. Per `creation-techniques.md` Technique 5, body content always-loaded should stay under ~500 lines where possible; heavier content should be Read on demand from a sibling location.

## Anti-pattern format (detection → resolution)

Every anti-pattern entry follows the same structure:

- **Name** with origin/attribution where one exists
- **Detection signal** — observable in the input or work-in-progress, not subjective
- **Why it fails** — the mechanism that produces bad outcomes
- **Resolution** — concrete action, not vague advice ("be careful")

A flag without a resolution is noise. Every pattern points to a specific next step.

## Read project context

Agents start context-blank (or near-blank in teammate mode, depending on team init). Hardcoding project conventions in the agent body creates brittleness — when conventions evolve, every hardcoded agent needs manual update. Where conventions could change, instruct the agent to read `CLAUDE.md` and relevant `.claude/` files at runtime rather than baking the conventions in.

## Right altitude

Strike the Goldilocks zone:
- Over-specification creates fragility — hardcoded logic that breaks on edge cases
- Under-specification leaves the model guessing and produces high-variance output

Name things precisely (file paths, frameworks, schemas) without dictating every micro-decision the agent should make in execution.

## Self-evaluation fails — separate generation from evaluation

When asked to evaluate its own work, a model confidently praises mediocre output. The agent that generated the output has the same biases when evaluating it. For agents whose output needs validation, separate the generation phase from the evaluation phase — either across two agents or across two distinct phases of one agent's SOP, with deterministic verification (lint, build, test) gating subjective evaluation.

This is why Cadre's three-review architecture (commit/push/merge) places stranger agents in the loop rather than relying on the producer to self-grade.

## Common pitfalls

- **Mode/SOP mismatch** — agent declared `mode: subagent` but SOP includes peer-messaging steps (will fail at the peer step), OR declared `mode: teammate` but SOP has no peer interactions (over-claims team infrastructure with no benefit). Detection: scan SOP for "ask peer", "wait for", "coordinate with", "send to teammate" verbs against the declared mode. Resolution: align SOP with mode, or change mode to match SOP intent.
- **Cross-conversation drift assumption** — agent body assumes memory across dispatches. Each dispatch starts blank; "remember what we did last time" is a dead instruction. Use diversity-forcing mechanisms within the prompt (style catalogs, randomization, in-prompt variety) instead.
- **Hallucinated frontmatter fields** — adding fields the harness doesn't support (often a sign of training-data drift or interpolation from other agent frameworks). Verify against live docs.
- **Tools-permission mismatch** — declaring tools the agent's permission scope can't actually grant. Agent fails silently or partially.
- **Bloated system prompt** — every dispatch pays the full body token cost. Trim aggressively; use Read for reference material that's not always needed.
- **Vague delegation description** — fails to trigger when it should, or triggers when it shouldn't. The description is the routing surface.
- **Missing file footprint** — undeclared write paths lead to undocumented side effects (I/O contract violation).
- **Self-grading sign-off** — agent's own SOP includes "verify the work is good." Separate the evaluator from the producer.
- **Implicit team context (teammate mode)** — teammate-mode agent doesn't declare which peers it expects, what messages it sends/receives, or what role it plays in the team. Spawning becomes guesswork. Resolution: include a "Team context" section near the top of the body listing expected peers and message protocol.

## Runtime verification

Before producing a final agent definition, dispatch the Explore subagent on Claude Code's subagent and agent-teams documentation to verify current frontmatter fields, mode declaration syntax, and team coordination conventions. Critical for fields that have changed names or behavior across harness versions.
