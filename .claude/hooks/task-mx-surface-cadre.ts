#!/usr/bin/env bun
// Cadre hook: task-mx-surface-cadre
// Triggers on: UserPromptSubmit
//
// Behavior:
//   - if `.cadre/task-mx/logs/pending.flag` exists AND its timestamp is older than
//     DEBOUNCE_MS (~3s) ago: emit `additionalContext` instructing the orchestrator
//     to dispatch task-mx-cadre, then delete the flag.
//   - if flag exists but is too recent (within debounce window): no-op; revisit
//     on the next UserPromptSubmit. This coalesces intake bursts.
//   - if flag absent: no-op.
//
// The orientation text instructs the orchestrator to:
//   1. Dispatch task-mx-cadre via the Agent tool with prompt
//      "Execute integration SOP against inbox state."
//   2. After dispatch returns, relay the `reason` field as a one-line status to
//      the user before continuing (mirrors handoff-mx-prime relay pattern).
//
// Failure mode: any error → empty output; exit 0 (never gate harness).

import { existsSync, readFileSync, unlinkSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const FLAG_FILE = ".cadre/task-mx/logs/pending.flag";
const HOOK_LOG = ".cadre/task-mx/logs/surface.log";
const DEBOUNCE_MS = 3000;

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

try {
  // Drain stdin so the harness doesn't hang; payload not consulted.
  await Bun.stdin.json().catch(() => null);

  if (!existsSync(FLAG_FILE)) {
    console.log("{}");
    process.exit(0);
  }

  let flagTs = "";
  try {
    flagTs = readFileSync(FLAG_FILE, "utf-8").trim();
  } catch {
    flagTs = "";
  }

  // Debounce: if mutation happened within DEBOUNCE_MS, leave the flag and let the
  // next prompt revisit. Bursts of intakes coalesce into one dispatch this way.
  const flagMs = Date.parse(flagTs);
  if (!isNaN(flagMs) && Date.now() - flagMs < DEBOUNCE_MS) {
    console.log("{}");
    process.exit(0);
  }

  // Consume the flag.
  try {
    unlinkSync(FLAG_FILE);
  } catch {}

  const additionalContext =
    `[task-mx] Inbox shard pending integration. First action this turn:\n` +
    `1. Dispatch the \`task-mx-cadre\` subagent via the Agent tool with prompt: ` +
    `"Execute integration SOP against inbox state."\n` +
    `2. After the subagent returns, relay its \`reason\` field to the user as a one-line ` +
    `status (e.g., "task-mx: integrated 1 entry; ready=12, blocked=4, in-progress=1") ` +
    `before continuing with the user's request.\n` +
    `3. If the subagent returns \`{ok: false, mode: "migration-preview"}\`, surface the ` +
    `emitted diff to the user for review and ask whether to commit (the user's response ` +
    `gates the next-dispatch with \`mode: migration-commit\`).`;

  console.log(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "UserPromptSubmit",
        additionalContext,
      },
    })
  );
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {}
  console.log("{}");
  process.exit(0);
}
