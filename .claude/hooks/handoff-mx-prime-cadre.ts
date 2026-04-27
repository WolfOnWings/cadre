#!/usr/bin/env bun
// Cadre hook: handoff-mx-prime-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
// Side effects:
//   - writes a SessionStart sentinel event to `.cadre/logs/handoff-mx/events.log`
//     so the synthesizer can slice prior-session events from current-session leakage
//   - if events.log has prior content beyond the sentinel: atomically renames
//     events.log → events.log.processing-<ts> and writes the path to processing.lock.
//     This pre-stages the consume so the synthesizer skips Phase 1 of its SOP.
//   - emits hookSpecificOutput.additionalContext via stdout — terse orientation
//     telling the orchestrator to dispatch the synthesizer subagent (subagent runs
//     there, not in a hook, because `"type": "agent"` hooks fail silently in current
//     CC build per GitHub Issue #39184)
//   - appends to `.cadre/logs/handoff-mx/prime.log` on error only
// Failure mode: any error → empty additionalContext + log; exit 0 (never gate harness).

import { appendFileSync, mkdirSync, existsSync, renameSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const AGENT_NAME = "handoff-mx-cadre";
const EVENTS_LOG = ".cadre/logs/handoff-mx/events.log";
const LOCK_FILE = ".cadre/logs/handoff-mx/processing.lock";
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

  // Pre-stage consume: if there's prior content (more than just our sentinel) and
  // no existing lock, rename events.log → processing-<ts> and record the path in
  // processing.lock. The synthesizer reads the lock instead of doing discovery +
  // rename itself (Phase 1 of its SOP collapses to a single Read).
  //
  // Crash-recovery semantics preserved: if the lock already exists, the prior
  // run's processing file is still pending integration — leave it alone.
  let dispatch = false;
  if (existsSync(LOCK_FILE)) {
    dispatch = true;
  } else {
    const content = readFileSync(EVENTS_LOG, "utf-8");
    const lineCount = content.split("\n").filter((l) => l.trim()).length;
    if (lineCount >= 2) {
      const processingPath = `${EVENTS_LOG}.processing-${ts.replace(/[:.]/g, "-")}`;
      renameSync(EVENTS_LOG, processingPath);
      writeFileSync(LOCK_FILE, processingPath);
      dispatch = true;
    }
  }

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: dispatch ? PRIME_INSTRUCTION : "",
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
