#!/usr/bin/env bun
// Cadre check: line-count gate.
// Bun replacement for shell `wc -l`; closes win32/Linux parity gap by
// normalizing path separators before EXCLUDE matching.

import { Glob } from "bun";

const THRESHOLD = 300;

const EXCLUDE_PREFIXES = [
  "node_modules/",
  ".cadre/",
  ".git/",
  "dist/",
];

const EXCLUDE_SUFFIXES = [".lockb", ".tsbuildinfo", ".md"];

// Known-oversize files predating this gate. Each entry is debt to split, not a
// permanent exemption. Add a board entry before adding paths here.
const EXEMPT_OVERSIZED: ReadonlyArray<string> = [
  ".claude/agents/task-mx-cadre.score.ts",
];

async function check_loc(): Promise<number> {
  const glob = new Glob("**/*.ts");
  const violations: { path: string; count: number }[] = [];

  for await (const raw of glob.scan({ cwd: ".", onlyFiles: true, dot: true })) {
    const path = raw.replace(/\\/g, "/");

    if (EXCLUDE_PREFIXES.some((p) => path.startsWith(p))) continue;
    if (EXCLUDE_SUFFIXES.some((s) => path.endsWith(s))) continue;
    if (EXEMPT_OVERSIZED.includes(path)) continue;

    const text = await Bun.file(path).text();
    const count = text.split("\n").length;

    if (count > THRESHOLD) {
      violations.push({ path, count });
    }
  }

  if (violations.length > 0) {
    console.error(`check-loc: ${violations.length} file(s) exceed ${THRESHOLD} lines`);
    for (const v of violations) {
      console.error(`  ${v.path}: ${v.count} lines (max ${THRESHOLD})`);
    }
    return 1;
  }

  console.log(`check-loc: all .ts files <= ${THRESHOLD} lines`);
  return 0;
}

process.exit(await check_loc());
