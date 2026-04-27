#!/usr/bin/env bun
// Cadre hook: handoff-mx-logger-cadre
// Triggers on: UserPromptSubmit, PostToolUse, Stop (registered in .claude/settings.json)
// Side effects:
//   - appends one newline-delimited JSON line to `.cadre/logs/handoff-mx/events.log`
//   - appends to `.cadre/logs/handoff-mx/logger.log` ONLY on error (success path is silent)
// Failure mode: non-blocking — exit 0 on append AND on any error (log to operational log; never gate harness).

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const EVENTS_LOG = ".cadre/logs/handoff-mx/events.log";
const HOOK_LOG = ".cadre/logs/handoff-mx/logger.log";
const TRUNCATE_AT = 4096; // chars; cap on individual fields to bound entry size
// Tools whose tool_response is recoverable from re-reading and not narrative-load-bearing.
// Skipping them cuts events-log bloat (TODO #31).
const RECOVERABLE_TOOLS = new Set(["Read", "Glob", "Grep"]);

function trunc(s: unknown, n = TRUNCATE_AT): string {
  if (s == null) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  return str.length > n ? str.slice(0, n) + "…[truncated]" : str;
}

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

// Top-level try/await — the alternative pattern (`async function main(); main().catch(...)`)
// causes `Bun.stdin.json()` to hang silently in some Bun versions; this pattern is verified.
try {
  const payload = await Bun.stdin.json();
  const event: string = payload.hook_event_name ?? "unknown";

  const entry: Record<string, unknown> = {
    ts,
    event,
    session_id: payload.session_id ?? null,
  };

  // Event-specific fields. Field names per live CC docs (verified at impl time;
  // see plan's hook-payload verification step).
  switch (event) {
    case "UserPromptSubmit":
      entry.prompt = trunc(payload.prompt);
      break;
    case "PostToolUse":
      const toolName = payload.tool_name ?? null;
      entry.tool = toolName;
      entry.tool_input = trunc(payload.tool_input);
      if (!RECOVERABLE_TOOLS.has(toolName)) {
        entry.tool_response = trunc(payload.tool_response);
      }
      break;
    case "Stop":
      // Stop is a turn-boundary marker. transcript_path lets the synthesizer
      // read full session prose if needed for narrative reconstruction.
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    case "SessionEnd":
      // SessionEnd marker — integration runs at next SessionStart's synthesizer
      // (SessionEnd hook type doesn't support `agent` per CC docs, so we record
      // a marker here and let the next session integrate).
      entry.reason = payload.reason ?? null;
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    default:
      // Unknown event — capture what we have for diagnostics, don't crash.
      entry.raw_payload = trunc(payload);
  }

  ensureDir(EVENTS_LOG);
  appendFileSync(EVENTS_LOG, JSON.stringify(entry) + "\n");

  // logger.log is error-only — success path stays silent. Catch block below logs failures.

  // Empty JSON output — pass-through; don't inject context, don't decide.
  console.log("{}");
  process.exit(0);
} catch (err) {
  // Non-blocking: log error, exit 0. Never gate the harness.
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {
    // last-resort swallow — we cannot fail this script
  }
  console.log("{}");
  process.exit(0);
}
