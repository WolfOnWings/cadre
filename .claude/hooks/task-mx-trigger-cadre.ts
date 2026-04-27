#!/usr/bin/env bun
// Cadre hook: task-mx-trigger-cadre
// Triggers on: PostToolUse (matcher: Write|Edit) — registered in .claude/settings.json
//
// Behavior:
//   - In-body path discrimination: only fires when tool_input.file_path lives under
//     .cadre/task-mx/inbox/ (CC's PostToolUse matcher is tool-name, not path-glob —
//     filtering must happen here).
//   - Loop guard: agent's writes to .cadre/todos.md do NOT match the inbox prefix,
//     so they don't re-trigger this hook.
//   - On match: write `.cadre/task-mx/logs/pending.flag` with current ISO timestamp.
//     Surface hook (UserPromptSubmit) reads this flag with a debounce floor.
//
// Failure mode: non-blocking — exit 0 on success AND on any error.

import { writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const PENDING_FLAG = ".cadre/task-mx/logs/pending.flag";
const HOOK_LOG = ".cadre/task-mx/logs/trigger.log";
const INBOX_PREFIX = ".cadre/task-mx/inbox/";

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

try {
  const payload = await Bun.stdin.json();
  const event: string = payload.hook_event_name ?? "unknown";
  if (event !== "PostToolUse") {
    console.log("{}");
    process.exit(0);
  }

  const tool = payload.tool_name ?? "";
  if (tool !== "Write" && tool !== "Edit") {
    console.log("{}");
    process.exit(0);
  }

  const filePath: string = (payload.tool_input?.file_path as string) ?? "";
  // Normalize Windows backslashes for cross-platform matching.
  const normalized = filePath.replace(/\\/g, "/");
  if (!normalized.includes(INBOX_PREFIX)) {
    console.log("{}");
    process.exit(0);
  }
  // Don't fire on writes to the .rejected/ subdirectory (those are agent's own writes).
  if (normalized.includes(INBOX_PREFIX + ".rejected/")) {
    console.log("{}");
    process.exit(0);
  }

  ensureDir(PENDING_FLAG);
  writeFileSync(PENDING_FLAG, ts, "utf-8");
  console.log("{}");
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {
    // last-resort swallow — never fail this script
  }
  console.log("{}");
  process.exit(0);
}
