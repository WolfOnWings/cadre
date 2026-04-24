# Creating Hooks (Cadre patterns)

Cadre-specific patterns and decision criteria for authoring Claude Code hooks. **Authoritative syntax MUST be verified against live Claude Code docs at creation time** (use Explore subagent on `https://code.claude.com/docs/`); hook event names, triggers and configuration schema are areas where hallucination has historically caused real failures.

---

## What a hook is

A hook is a shell command that the harness executes automatically in response to a specific harness event (tool call, prompt submission, agent completion, etc.). Hooks are configured declaratively — typically in `.claude/settings.json` or `.claude/settings.local.json` — and run with the user's shell environment. They are paramount in the trust hierarchy: deterministic, binary pass/fail, zero AI judgment.

## Cadre conventions

- **Naming:** hook names should be concise and understandable at a glance. Good = "save-observation". Bad = "get-last-observation-from-transcript". Bad = "get-last".
- **Language — TypeScript-on-Bun default; polyglot at the contract layer.** The hook contract is language-neutral (JSON over stdin, exit code, optional JSON over stdout — matching pre-commit, lefthook, and Claude Code's own hook protocol). The default *implementation* language for non-trivial hooks is TypeScript executed via Bun: Bun ships with Claude Code (Anthropic acquired Bun in Dec 2025; Claude Code itself runs as a Bun executable), giving native TS without ts-node, ~5-15ms cold start, type safety, and structured-data ergonomics. Bash is acceptable for trivial one-liners but is demonstrably broken on Windows for non-trivial work (per open issues in `anthropics/claude-code`; Anthropic's own docs recommend Node-based hooks for cross-platform). Other languages (Python, Go, etc.) are allowed at the contract layer when domain-justified.
- **Hook scripts:** if a hook runs a non-trivial command, write it as a script under `.claude/hooks/<name>-cadre.ts` (or `.sh` for trivial one-liners; other extensions when justified) and have the hook configuration call the script. Keeps the settings.json clean.
- **I/O:** hooks have an event trigger (input) and a side effect (output). Declare both in a comment header at the top of the hook script. The "file footprint" for a hook is what it touches when it runs.
- **Trust hierarchy:** hooks are deterministic. Don't stuff LLM-as-judge into a hook (e.g., "have the hook decide whether the commit is good"). If AI judgment is needed, the hook can dispatch an agent (`"type": "agent"` hook config; verify against live docs) and gate on the agent's structured output.

## Settings configuration (verify current syntax via Explore)

Hook configuration lives in `.claude/settings.json` (committed) or `.claude/settings.local.json` (per-developer). Format and supported events have evolved across harness versions — DO NOT trust training-data memory for event names.

Common categories of events the harness has supported (verify exact names and schema for the current version):
- Tool-call lifecycle (before/after a tool runs)
- Prompt submission (before the harness sends a user prompt to the model)
- Agent completion (when a subagent finishes)
- Session lifecycle (start, stop, compaction, etc.)
- Notification events (for system-level signals)

**The exact event identifiers, payload schema, and matcher syntax must be verified at creation time.** Past sessions have hallucinated events like `OnFileSave`, `BeforeCommit`, `AfterAgentSpawn` that are NOT in the harness — these failures cost real time. Always Explore the docs first.

## Body / script structure

Hook scripts should be:
- Minimal — do one thing
- Fast — hooks block the harness; slow hooks degrade the experience
- Idempotent where possible — replays should be safe
- Logged — write to a known location (`.cadre/logs/hooks/<name>.log`) for debuggability
- Non-blocking on failure UNLESS the hook is meant as a gate

Script header convention (TypeScript-on-Bun default):
```typescript
#!/usr/bin/env bun
// Cadre hook: <name>
// Triggers on: <event name from live docs>
// Side effects: <what files / state this touches>
// Failure mode: <what happens if this returns non-zero>

// Read JSON payload from stdin if the hook expects structured input:
const payload = await Bun.stdin.json();
// ...
```

Bash variant (acceptable for trivial one-liners only; not for non-trivial work — Windows-fragile):
```bash
#!/usr/bin/env bash
# Cadre hook: <name>
# Triggers on: <event name from live docs>
# Side effects: <what files / state this touches>
# Failure mode: <what happens if this returns non-zero>
set -euo pipefail
# ...
```

## Common pitfalls (kata v1 history)

- **Hallucinated event names** — e.g., inventing `BeforeCommit` when the actual event is `PreToolUse` with a Bash matcher. Always verify against live docs.
- **Hallucinated matcher syntax** — patterns/regex/glob behavior that doesn't match what the harness actually supports.
- **Wrong payload schema** — assuming the hook receives data in a structure that doesn't match the harness's actual payload.
- **Slow hooks** — running heavy commands (full test suite, network-dependent calls) inline in a frequently-fired event. Move heavy work to an agent or background process.
- **Silent failures** — hook fails but the harness reports nothing. Always log to a known file.
- **Confusing global vs project settings** — placing a hook in user-level settings when it should be project-level (or vice versa).

## Runtime verification (REQUIRED for hooks)

Before producing a final hook configuration, **dispatch the Explore subagent on Claude Code's hooks documentation**. Specifically verify:
- The exact event identifier (case-sensitive)
- The matcher syntax (regex? glob? exact?)
- The payload schema the hook receives via stdin or env
- Whether the hook's exit code matters (gate vs fire-and-forget)
- Settings.json schema (top-level field name, nesting structure)

Hooks are the area where stale knowledge causes the most rework. Treat live docs as the source of truth on every creation.
