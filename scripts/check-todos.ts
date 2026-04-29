#!/usr/bin/env bun
// Cadre check: deferred-work-marker gate. Sole owner of three stub patterns
// (see PATTERNS below). oxlint's no-warning-comments is intentionally NOT
// enabled to avoid double-enforcement. Cross-platform via path normalization.
// (This file self-excludes via SELF_PATH so the patterns above can be defined.)

import { Glob } from "bun";

// The three deferred-work signals this gate enforces. Block-comment forms
// (/* TODO */) are intentionally not matched — the convention is the line form.
const PATTERNS: { name: string; re: RegExp }[] = [
  { name: "TODO", re: /\/\/\s*TODO/ },
  { name: "FIXME", re: /\/\/\s*FIXME/ },
  { name: "not-implemented", re: /throw new Error\(["']not implemented["']\)/ },
];

// Source file types in scope. Excludes Markdown — prose is the wrong place
// for this gate (use the board for tracked deferrals).
const SCAN_GLOBS = ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.json", "**/*.yml", "**/*.yaml"];

// Operational and generated areas — never enforced; deferral markers are
// expected in handoffs, drafts, agent output, and the board itself.
const EXCLUDE_PREFIXES = [
  "node_modules/",
  ".git/",
  ".cadre/handoffs/",
  ".cadre/research/",
  ".cadre/drafts/",
  ".cadre/agent-output/",
  ".cadre/test-fixtures/",
  ".cadre/task-mx/inbox/",
  ".cadre/task-mx/archive/",
  ".cadre/task-mx/logs/",
  ".cadre/logs/",
  ".cadre/plans/",
  ".claude/plans/",
];

const EXCLUDE_PATHS = [".cadre/todos.md"];

const SELF_PATH = "scripts/check-todos.ts";
const EXCLUDE_SUFFIXES = [".md", ".lockb", ".tsbuildinfo"];

interface Hit {
  path: string;
  lineno: number;
  pattern: string;
  snippet: string;
}

async function check_todos(): Promise<number> {
  const seen = new Set<string>();
  const hits: Hit[] = [];

  for (const pattern of SCAN_GLOBS) {
    const glob = new Glob(pattern);
    for await (const raw of glob.scan({ cwd: ".", onlyFiles: true, dot: true })) {
      const path = raw.replace(/\\/g, "/");
      if (seen.has(path)) continue;
      seen.add(path);

      if (EXCLUDE_PREFIXES.some((p) => path.startsWith(p))) continue;
      if (EXCLUDE_PATHS.includes(path)) continue;
      if (EXCLUDE_SUFFIXES.some((s) => path.endsWith(s))) continue;
      if (path === SELF_PATH) continue;

      const text = await Bun.file(path).text();
      const lines = text.split("\n");
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? "";
        for (const p of PATTERNS) {
          if (p.re.test(line)) {
            hits.push({ path, lineno: i + 1, pattern: p.name, snippet: line.trim() });
          }
        }
      }
    }
  }

  if (hits.length > 0) {
    console.error(`check-todos: ${hits.length} match(es) found`);
    for (const h of hits) {
      console.error(`  ${h.path}:${h.lineno} [${h.pattern}] ${h.snippet}`);
    }
    return 1;
  }

  console.log("check-todos: no TODO / FIXME / not-implemented stubs found");
  return 0;
}

process.exit(await check_todos());
