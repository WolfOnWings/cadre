#!/usr/bin/env bun
// Cadre hook: handoff-mx-prime-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
// Side effects:
//   - writes a SessionStart sentinel event to `.cadre/logs/handoff-mx/events.log`
//     so the synthesizer can slice prior-session events from current-session leakage
//   - emits hookSpecificOutput.additionalContext via stdout — terse orientation
//     telling the orchestrator to dispatch the synthesizer subagent (subagent runs
//     there, not in a hook, because `"type": "agent"` hooks fail silently in current
//     CC build per GitHub Issue #39184)
//   - appends to `.cadre/logs/handoff-mx/prime.log` on error only
// Failure mode: any error → empty additionalContext + log; exit 0 (never gate harness).

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const AGENT_NAME = "handoff-mx-cadre";
const EVENTS_LOG = ".cadre/logs/handoff-mx/events.log";
const HOOK_LOG = ".cadre/logs/handoff-mx/prime.log";

const PRIME_INSTRUCTION = `[handoff-mx prime] First action this session:
1. Dispatch the \`${AGENT_NAME}\` subagent via the Agent tool with prompt "Execute integration SOP against current state."
2. Surface a one-line confirmation to the user from its \`reason\` field (e.g., "Synthesized N events; new entry: '<descriptor>'") before proceeding.
3. Then handle the user's actual request. One-time per session.`;

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

try {
  const payload = await Bun.stdin.json();
  const sessionId = payload.session_id ?? null;

  // Sentinel event marks the session boundary so the synthesizer can slice
  // prior-session events from current-session leakage.
  ensureDir(EVENTS_LOG);
  appendFileSync(
    EVENTS_LOG,
    JSON.stringify({ ts, event: "SessionStart", session_id: sessionId }) + "\n"
  );

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: PRIME_INSTRUCTION,
      },
    })
  );
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {}
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" },
    })
  );
  process.exit(0);
}
