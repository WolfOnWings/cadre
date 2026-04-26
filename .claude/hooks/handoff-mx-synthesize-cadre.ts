#!/usr/bin/env bun
// Cadre hook: handoff-mx-synthesize-cadre
// Triggers on: SessionStart (matchers: startup|resume|clear|compact)
//   This is Action 1 of 2; Action 2 is handoff-mx-surface-cadre (reads the
//   freshly-written handoff and injects via additionalContext).
//
// Workaround for empirical CC behavior: `"type": "agent"` hook config silently
// fails to dispatch at SessionStart in current CC build (verified live during
// the handoff-mx-cadre live-fire test on 2026-04-26 — surface fired but agent
// did not, no .processing-<ts> rename, no archive, events log stayed full).
// This script is a `"type": "command"` hook that spawns `claude --bare -p` to
// run synthesis as a subprocess. `--bare` disables hooks in the spawned
// session (no recursion). `--dangerously-skip-permissions` allows the spawned
// session to perform Read/Edit/Write/Bash without prompting.
//
// Side effects:
//   - on synthesis, all the side-effects declared in the agent contract:
//     `.cadre/handoff.md` rewritten, prior entries archived to
//     `.cadre/handoffs/<ISO-date>.md`, `.cadre/session-events.log` cleared
//   - operational status appended to `.cadre/logs/hooks/handoff-mx-synthesize.log`
// Failure mode: non-blocking — exit 0 on success AND on any error (log to
// operational log; never gate harness).

import { spawnSync } from "node:child_process";
import { appendFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";

const HOOK_LOG = ".cadre/logs/hooks/handoff-mx-synthesize.log";
const SPAWN_TIMEOUT_MS = 180_000; // 3 min — synthesizer typically completes in 30-60s

const PROMPT = `Read \`.claude/agents/handoff-mx-cadre.md\` for your full contract (role identity, anti-patterns, 9-step SOP, file footprint). Execute its integration SOP against the current state: detect any leftover \`.cadre/session-events.log.processing-*\` (crash recovery) or rename \`.cadre/session-events.log\` to \`.cadre/session-events.log.processing-<ISO-timestamp>\` to consume; archive any prior entries in \`.cadre/handoff.md\` to \`.cadre/handoffs/<entry-date>.md\`; write the new four-section entry (Narrative <=200 lines / Decisions / Active Items / Changes) as the sole content of \`.cadre/handoff.md\`; delete the \`.processing-<ts>\` file. Idempotent on empty log. When done, respond with a one-line confirmation.`;

function ensureDir(path: string) {
  const dir = dirname(path);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

const ts = new Date().toISOString();
ensureDir(HOOK_LOG);

try {
  appendFileSync(HOOK_LOG, `${ts} dispatching synthesizer via \`claude --bare -p\`\n`);

  const result = spawnSync(
    "claude",
    [
      "--bare",
      "-p",
      PROMPT,
      "--dangerously-skip-permissions",
      "--output-format",
      "text",
    ],
    {
      stdio: ["ignore", "pipe", "pipe"],
      timeout: SPAWN_TIMEOUT_MS,
      encoding: "utf-8",
    }
  );

  const stdout = (result.stdout ?? "").toString().trim();
  const stderr = (result.stderr ?? "").toString().trim();
  const status = result.status;
  const signal = result.signal;

  appendFileSync(
    HOOK_LOG,
    `${ts} synthesizer returned: status=${status} signal=${signal ?? "none"} stdout=${JSON.stringify(stdout.slice(0, 300))} stderr=${JSON.stringify(stderr.slice(0, 300))}\n`
  );
} catch (err) {
  try {
    appendFileSync(HOOK_LOG, `${ts} ERROR ${(err as Error)?.message ?? err}\n`);
  } catch {}
}

// Empty JSON output — pass-through; we don't gate the harness.
console.log("{}");
process.exit(0);
