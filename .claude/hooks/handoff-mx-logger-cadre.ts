#!/usr/bin/env bun
// Cadre hook: handoff-mx-logger-cadre
// Triggers on: UserPromptSubmit, PostToolUse, Stop (registered in .claude/settings.json)
// Side effects:
//   - appends one newline-delimited JSON line to `.cadre/session-events.log`
//   - appends operational status to `.cadre/logs/hooks/handoff-mx-logger.log`
// Failure mode: non-blocking — exit 0 on append AND on any error (log to operational log; never gate harness).

import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const EVENTS_LOG = ".cadre/session-events.log";
const HOOK_LOG = ".cadre/logs/hooks/handoff-mx-logger.log";
const TRUNCATE_AT = 4096; // chars; cap on individual fields to bound entry size

function trunc(s: unknown, n = TRUNCATE_AT): string {
  if (s == null) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  return str.length > n ? str.slice(0, n) + "…[truncated]" : str;
}

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function main() {
  const ts = new Date().toISOString();
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
      entry.tool = payload.tool_name ?? null;
      entry.tool_input = trunc(payload.tool_input);
      entry.tool_response = trunc(payload.tool_response);
      break;
    case "Stop":
      // Stop is a turn-boundary marker. transcript_path lets the synthesizer
      // read full session prose if needed for narrative reconstruction.
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    default:
      // Unknown event — capture what we have for diagnostics, don't crash.
      entry.raw_payload = trunc(payload);
  }

  ensureDir(EVENTS_LOG);
  appendFileSync(EVENTS_LOG, JSON.stringify(entry) + "\n");

  ensureDir(HOOK_LOG);
  appendFileSync(HOOK_LOG, `${ts} [${event}] logged\n`);

  // Empty JSON output — pass-through; don't inject context, don't decide.
  console.log("{}");
  process.exit(0);
}

main().catch((err) => {
  // Non-blocking: log error, exit 0. Never gate the harness.
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${new Date().toISOString()} ERROR ${err?.message ?? err}\n`);
  } catch {
    // last-resort swallow — we cannot fail this script
  }
  console.log("{}");
  process.exit(0);
});
