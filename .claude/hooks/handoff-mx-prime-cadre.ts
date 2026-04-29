#!/usr/bin/env bun
// Cadre hook: handoff-mx-prime-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
// Side effects:
//   - writes a SessionStart sentinel event to `.cadre/logs/handoff-mx/events.log`
//     so the synthesizer can slice prior-session events from current-session leakage
//   - if events.log has prior content beyond the sentinel: atomically renames
//     events.log → events.log.processing-<ts> and writes the path to processing.lock.
//     This pre-stages the consume so the synthesizer skips Phase 1 of its SOP.
//   - emits hookSpecificOutput.additionalContext via stdout — three-part composition:
//     (a) the active handoff.md entry (L1 trust: orchestrator has prior-session
//         context as data, not as a "remember to read" task)
//     (b) terse orientation telling the orchestrator to dispatch the synthesizer
//         subagent for prior-session integration (subagent runs there, not in a
//         hook, because `"type": "agent"` hooks fail silently in current CC build
//         per GitHub Issue #39184)
//     (c) the dispatch instruction
//   - deletes `.cadre/logs/handoff-mx/handoff-fresh.flag` if present (stale-flag
//     cleanup: SessionStart already injects handoff.md, so the surface hook
//     should not re-inject the same content on the first UserPromptSubmit)
//   - appends to `.cadre/logs/handoff-mx/prime.log` on error only
// Failure mode: any error → empty additionalContext + log; exit 0 (never gate harness).

import { appendFileSync, mkdirSync, existsSync, renameSync, readFileSync, writeFileSync, unlinkSync } from "node:fs";
import { dirname } from "node:path";

const AGENT_NAME = "handoff-mx-cadre";
const EVENTS_LOG = ".cadre/logs/handoff-mx/events.log";
const LOCK_FILE = ".cadre/logs/handoff-mx/processing.lock";
const FLAG_FILE = ".cadre/logs/handoff-mx/handoff-fresh.flag";
const HANDOFF_FILE = ".cadre/handoff.md";
const HOOK_LOG = ".cadre/logs/handoff-mx/prime.log";

function buildContext(handoffContent: string | null, dispatchNeeded: boolean): string {
  const parts: string[] = [];
  if (handoffContent && handoffContent.trim()) {
    parts.push(
      `[handoff-mx context] Active handoff entry (your session pickup context):\n\n${handoffContent.trim()}`
    );
  }
  if (dispatchNeeded) {
    parts.push(
      `[handoff-mx prime] Prior-session events are pending integration. First action this session:\n` +
        `1. Dispatch the \`${AGENT_NAME}\` subagent via the Agent tool with prompt "Execute integration SOP against current state."\n` +
        `2. Surface a one-line confirmation to the user from its \`reason\` field (e.g., "Synthesized N events; new entry: '<descriptor>'") before proceeding.\n` +
        `3. Then handle the user's actual request. One-time per session.`
    );
  }
  return parts.join("\n\n---\n\n");
}

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

  // Read handoff.md and inject as L1 context. The active entry is the
  // orchestrator's session-pickup context — surfacing it via additionalContext
  // means the orchestrator has it as data, not as an instruction to follow.
  let handoffContent: string | null = null;
  if (existsSync(HANDOFF_FILE)) {
    try {
      handoffContent = readFileSync(HANDOFF_FILE, "utf-8");
    } catch {
      handoffContent = null;
    }
  }

  // Stale-flag cleanup: SessionStart already injects handoff.md content above,
  // so a leaked handoff-fresh.flag from the prior session would cause the
  // surface hook to re-inject the same content on the first UserPromptSubmit
  // of this session. Drop it here.
  try {
    if (existsSync(FLAG_FILE)) unlinkSync(FLAG_FILE);
  } catch {
    // Stale-flag cleanup is best-effort; non-fatal if unlink fails.
  }

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "SessionStart",
        additionalContext: buildContext(handoffContent, dispatch),
      },
    })
  );
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {
    // Hook-log write is best-effort; never gate the harness on operational logging.
  }
  console.log(
    JSON.stringify({
      hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" },
    })
  );
  process.exit(0);
}
