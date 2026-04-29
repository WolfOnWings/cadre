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

// Read/Glob/Grep are pure mechanism — file lookup, no arc signal. Skipped at the
// write boundary so the synthesizer reads less. Bash retained because git/test/build
// commands carry arc signal that's not feasible to filter by command-string parsing.
const SKIP_TOOLS = new Set(["Read", "Glob", "Grep"]);

// tool_response is kept only for narrative-load-bearing tools — those whose return
// value carries session-arc signal (decisions, subagent results, user choices).
// All others (Bash/Edit/Write/etc.) get tool_input only — the response
// is recoverable from re-read, git, or transcript if needed.
const NARRATIVE_TOOLS = new Set(["TodoWrite", "Skill", "Task", "Agent", "AskUserQuestion"]);

function trunc(s: unknown, n: number): string {
  if (s === null || s === undefined) return "";
  const str = typeof s === "string" ? s : JSON.stringify(s);
  return str.length > n ? str.slice(0, n) + "…[truncated]" : str;
}

// Per-tool structural extraction — preserves identifying fields (file_path, command,
// pattern, subagent_type) while truncating bulky payloads (content, stdout, prompt).
// Replaces the previous serialize-then-truncate-blob approach which stripped
// load-bearing fields when the input was long.
function compactInput(tool: string | null, input: unknown): unknown {
  if (input === null || input === undefined) return null;
  const i = input as Record<string, unknown>;
  switch (tool) {
    case "Read":
      return { file_path: i.file_path, offset: i.offset, limit: i.limit };
    case "Glob":
      return { pattern: i.pattern, path: i.path };
    case "Grep":
      return { pattern: i.pattern, path: i.path, output_mode: i.output_mode, glob: i.glob, type: i.type };
    case "Edit":
      return { file_path: i.file_path, replace_all: i.replace_all };
    case "Write":
      return { file_path: i.file_path };
    case "Bash":
    case "PowerShell":
      return { command: trunc(i.command, 512), description: i.description };
    case "Task":
    case "Agent":
      return { subagent_type: i.subagent_type, description: i.description };
    case "AskUserQuestion":
    case "TodoWrite":
    case "TaskCreate":
    case "TaskUpdate":
      return i;
    default:
      return trunc(input, 512);
  }
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

  switch (event) {
    case "UserPromptSubmit":
      entry.prompt = trunc(payload.prompt, 1024);
      break;
    case "PostToolUse":
      const toolName = payload.tool_name ?? null;
      if (SKIP_TOOLS.has(toolName)) {
        console.log("{}");
        process.exit(0);
      }
      entry.tool = toolName;
      entry.tool_input = compactInput(toolName, payload.tool_input);
      if (NARRATIVE_TOOLS.has(toolName)) {
        entry.tool_response = trunc(payload.tool_response, 1024);
      }
      break;
    case "Stop":
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    case "SessionEnd":
      entry.reason = payload.reason ?? null;
      entry.transcript_path = payload.transcript_path ?? null;
      break;
    default:
      entry.raw_payload = trunc(payload, 512);
  }

  ensureDir(EVENTS_LOG);
  appendFileSync(EVENTS_LOG, JSON.stringify(entry) + "\n");

  console.log("{}");
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {
    // last-resort swallow — we cannot fail this script
  }
  console.log("{}");
  process.exit(0);
}
