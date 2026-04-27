#!/usr/bin/env bun
// Cadre hook: handoff-mx-surface-cadre
// Triggers on: UserPromptSubmit
// Side effects:
//   - if `.cadre/logs/handoff-mx/handoff-fresh.flag` exists: reads `.cadre/handoff.md`,
//     emits hookSpecificOutput.additionalContext (L1 trust: orchestrator gets the
//     freshly-synthesized handoff as data, not as a "remember to read" instruction),
//     and deletes the flag (single-use).
//   - if flag absent: no-op (vast majority of turns).
//   - appends to `.cadre/logs/handoff-mx/surface.log` on error or anomaly only.
// Failure mode: any error → empty output; exit 0 (never gate harness).
//
// Pairs with handoff-mx-cadre.md SOP final step (touches the flag) and
// handoff-mx-prime-cadre.ts (deletes any stale flag at SessionStart, since
// SessionStart already injects handoff.md and same-session re-injection would
// double up).

import { existsSync, readFileSync, unlinkSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const FLAG_FILE = ".cadre/logs/handoff-mx/handoff-fresh.flag";
const HANDOFF_FILE = ".cadre/handoff.md";
const HOOK_LOG = ".cadre/logs/handoff-mx/surface.log";

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

  let handoffContent = "";
  if (existsSync(HANDOFF_FILE)) {
    try {
      handoffContent = readFileSync(HANDOFF_FILE, "utf-8");
    } catch {
      handoffContent = "";
    }
  }

  // Consume the flag whether or not handoff.md was readable. Single-use
  // semantics: a flag set with no readable handoff is a synthesizer bug,
  // not state to recover from on every subsequent prompt.
  try {
    unlinkSync(FLAG_FILE);
  } catch {}

  if (!handoffContent.trim()) {
    try {
      ensureDir(HOOK_LOG);
      appendFileSync(HOOK_LOG, `${ts} WARN flag set but handoff.md unreadable or empty\n`);
    } catch {}
    console.log("{}");
    process.exit(0);
  }

  const additionalContext =
    `[handoff-mx] Freshly-synthesized session handoff. Primary orientation — supersedes any prior handoff context.\n\n` +
    handoffContent.trim();

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
