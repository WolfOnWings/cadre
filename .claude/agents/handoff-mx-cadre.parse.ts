#!/usr/bin/env bun
// Cadre script: handoff-mx-cadre.parse
// Invoked by: handoff-mx-cadre subagent (Step 1 of SOP)
// Usage: bun .claude/agents/handoff-mx-cadre.parse.ts <processing-file>
//
// Behavior:
//   1. Reads the processing file (renamed events.log).
//   2. Finds the most-recent SessionStart sentinel.
//   3. Re-emits at-or-after-sentinel lines back to .cadre/logs/handoff-mx/events.log
//      (these are current-session leakage — they belong in the live log).
//   4. Aggregates before-sentinel events into a structured summary by category
//      (user_prompts / writes / agents / skills / tasks / bash / adr_refs / stops).
//   5. Prints JSON summary to stdout for the synthesizer.
//
// Replaces the inline Python event-parsing sweep that previously cost 6 separate
// Bash calls in Phase 3 of the SOP. Single invocation, structural extraction —
// the synthesizer reads stdout and goes straight to narrative work.

import { readFileSync, appendFileSync, existsSync } from "node:fs";

const EVENTS_LOG = ".cadre/logs/handoff-mx/events.log";
const SKIP_TOOLS = new Set(["Read", "Glob", "Grep"]);
const ADR_RE = /\b(ADR[-\s]?\d+|decision-log)\b/i;

interface PriorSummary {
  user_prompts: { ts: string; prompt: string }[];
  writes: { ts: string; tool: string; file_path: string }[];
  agents: { ts: string; subagent_type: string; description: string }[];
  skills: { ts: string; skill: string; args?: string }[];
  tasks: { ts: string; tool: string; [k: string]: unknown }[];
  bash: { ts: string; command: string; description?: string }[];
  adr_refs: { ts: string; tool: string; match: string }[];
  stops: { ts: string }[];
  session_starts: { ts: string }[];
  unknown: number;
}

const path = process.argv[2];
if (!path) {
  console.error(JSON.stringify({ ok: false, reason: "missing processing-file argument" }));
  process.exit(1);
}
if (!existsSync(path)) {
  console.error(JSON.stringify({ ok: false, reason: `processing file missing: ${path}` }));
  process.exit(1);
}

const raw = readFileSync(path, "utf-8");
const lines = raw.split("\n").filter((l) => l.trim());

// Find most-recent SessionStart sentinel. Reverse scan so we stop at the first hit.
let sentinelIdx = lines.length;
for (let i = lines.length - 1; i >= 0; i--) {
  try {
    const obj = JSON.parse(lines[i]);
    if (obj.event === "SessionStart") {
      sentinelIdx = i;
      break;
    }
  } catch {
    /* malformed line, skip */
  }
}

const priorLines = lines.slice(0, sentinelIdx);
const currentLines = lines.slice(sentinelIdx);

if (currentLines.length > 0) {
  appendFileSync(EVENTS_LOG, currentLines.join("\n") + "\n");
}

const summary: PriorSummary = {
  user_prompts: [],
  writes: [],
  agents: [],
  skills: [],
  tasks: [],
  bash: [],
  adr_refs: [],
  stops: [],
  session_starts: [],
  unknown: 0,
};

for (const line of priorLines) {
  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(line);
  } catch {
    summary.unknown += 1;
    continue;
  }
  const ev = obj.event as string | undefined;
  const ts = (obj.ts as string) ?? "";

  // ADR / decision-log mentions can appear anywhere (prompts, commit messages,
  // edits to decision-log.md, etc.). Scan the whole serialized event.
  const adrMatch = line.match(ADR_RE);
  if (adrMatch) {
    summary.adr_refs.push({ ts, tool: ev ?? "", match: adrMatch[0] });
  }

  if (ev === "UserPromptSubmit") {
    summary.user_prompts.push({ ts, prompt: (obj.prompt as string) ?? "" });
    continue;
  }
  if (ev === "Stop") {
    summary.stops.push({ ts });
    continue;
  }
  if (ev === "SessionStart") {
    summary.session_starts.push({ ts });
    continue;
  }
  if (ev !== "PostToolUse") {
    continue;
  }

  const tool = (obj.tool as string) ?? "";
  if (SKIP_TOOLS.has(tool)) continue;
  const inp = (obj.tool_input as Record<string, unknown>) ?? {};

  if (tool === "Write" || tool === "Edit") {
    summary.writes.push({ ts, tool, file_path: (inp.file_path as string) ?? "" });
  } else if (tool === "Agent" || tool === "Task") {
    summary.agents.push({
      ts,
      subagent_type: (inp.subagent_type as string) ?? "",
      description: (inp.description as string) ?? "",
    });
  } else if (tool === "Skill") {
    summary.skills.push({ ts, skill: (inp.skill as string) ?? "", args: inp.args as string | undefined });
  } else if (tool === "TaskCreate" || tool === "TaskUpdate") {
    summary.tasks.push({ ts, tool, ...inp });
  } else if (tool === "Bash" || tool === "PowerShell") {
    summary.bash.push({
      ts,
      command: (inp.command as string) ?? "",
      description: inp.description as string | undefined,
    });
  }
}

const result = {
  ok: true,
  processing_file: path,
  sentinel_line: sentinelIdx + 1,
  prior_count: priorLines.length,
  current_count: currentLines.length,
  prior: summary,
};

console.log(JSON.stringify(result, null, 2));
process.exit(0);
