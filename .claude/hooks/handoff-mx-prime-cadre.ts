#!/usr/bin/env bun
// Cadre hook: handoff-mx-prime-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
// Side effects:
//   - emits hookSpecificOutput.additionalContext via stdout — injects an
//     orientation instruction telling the orchestrator to dispatch the
//     handoff-mx-cadre subagent as its first action (synthesizer runs there,
//     not in a hook, because `"type": "agent"` hooks fail silently in current
//     CC build at SessionStart per GitHub Issue #39184)
//   - appends operational status to `.cadre/logs/handoff-mx/prime.log`
// Failure mode: any error → empty additionalContext + log; exit 0 (never gate harness).

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const HOOK_LOG = ".cadre/logs/handoff-mx/prime.log";

const PRIME_INSTRUCTION = `SESSION ORIENTATION (auto-injected by handoff-mx hook on session start):

Before responding to the user, take this one-time priming action:

1. Dispatch the **handoff-mx-cadre** subagent via the Agent tool with:
   - \`subagent_type\`: \`handoff-mx-cadre\`
   - \`prompt\`: "Execute your integration SOP against current state."

   The subagent reads \`.cadre/logs/handoff-mx/events.log\` + \`.cadre/handoff.md\`, synthesizes a four-section handoff entry from accumulated events, archives prior entries to \`.cadre/handoffs/<entry-date>.md\`, writes the new entry as sole content of \`.cadre/handoff.md\`, and clears the events log. Idempotent on empty log (no-op return).

2. After the subagent returns, Read \`.cadre/handoff.md\` to orient yourself with the synthesized handoff entry.

3. Then proceed with the user's actual request — fully oriented and with the handoff freshly current.

This is a one-time priming per session (do NOT repeat for subsequent turns within the same session).`;

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

try {
  ensureDir(HOOK_LOG);
  appendFileSync(HOOK_LOG, `${ts} primed orientation instruction\n`);

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
