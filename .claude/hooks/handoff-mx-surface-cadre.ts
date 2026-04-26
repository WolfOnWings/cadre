#!/usr/bin/env bun
// Cadre hook: handoff-mx-surface-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
//   This is Action 2 of 2; Action 1 is the synthesizer agent that runs first
//   (assuming serial execution within the hooks array — verified pre-ship).
// Side effects:
//   - reads .cadre/handoff.md
//   - emits hookSpecificOutput.additionalContext via stdout for context injection
//   - appends operational status to .cadre/logs/hooks/handoff-mx-surface.log
// Failure mode: missing/empty handoff.md = empty additionalContext;
//   any error → empty additionalContext + log; exit 0 (never gate harness).

import { readFileSync, existsSync, appendFileSync, mkdirSync } from "node:fs";
import { dirname } from "node:path";

const HANDOFF = ".cadre/handoff.md";
const HOOK_LOG = ".cadre/logs/hooks/handoff-mx-surface.log";

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();

try {
  let additionalContext = "";

  if (existsSync(HANDOFF)) {
    additionalContext = readFileSync(HANDOFF, "utf-8");
  }

  const out = {
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext,
    },
  };

  ensureDir(HOOK_LOG);
  appendFileSync(HOOK_LOG, `${ts} surfaced ${additionalContext.length} chars\n`);

  console.log(JSON.stringify(out));
  process.exit(0);
} catch (err) {
  try {
    ensureDir(HOOK_LOG);
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {}
  // Empty additionalContext on error — graceful degrade
  console.log(JSON.stringify({
    hookSpecificOutput: { hookEventName: "SessionStart", additionalContext: "" },
  }));
  process.exit(0);
}
