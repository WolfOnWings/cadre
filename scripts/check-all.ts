#!/usr/bin/env bun
// Cadre check: fan-out runner.
// Runs every check, captures every exit code, prints a summary, exits non-zero
// if any failed. Replaces a `&&` chain that would short-circuit on the first
// failure — local AI-iteration sees the full failure surface in one run.

export {};

interface CheckSpec {
  name: string;
  cmd: string[];
}

// Mirrors the parallel jobs in .github/workflows/ci.yml. Order chosen for
// readable output (typecheck/lint first — fastest signal to the iterator).
const CHECKS: CheckSpec[] = [
  { name: "typecheck", cmd: ["bunx", "tsc", "--noEmit"] },
  { name: "lint", cmd: ["bunx", "oxlint", "."] },
  { name: "dead-code", cmd: ["bunx", "knip"] },
  { name: "duplication", cmd: ["bunx", "fallow", "check", "--fail-on-issues"] },
  { name: "comment-ratio", cmd: ["bun", "run", "scripts/check-comment-ratio.ts"] },
  { name: "todos", cmd: ["bun", "run", "scripts/check-todos.ts"] },
  { name: "loc", cmd: ["bun", "run", "scripts/check-loc.ts"] },
  { name: "test-exists", cmd: ["bun", "run", "scripts/check-test-exists.ts"] },
];

interface CheckResult {
  name: string;
  exitCode: number;
}

async function check_all(): Promise<number> {
  const results: CheckResult[] = [];

  // Sequential — running each check serially is fine for local iteration.
  // CI parallelism is the GitHub Actions job graph, not this runner.
  for (const c of CHECKS) {
    console.log(`\n=== ${c.name} ===`);
    const proc = Bun.spawn(c.cmd, { stdout: "inherit", stderr: "inherit" });
    const exitCode = await proc.exited;
    results.push({ name: c.name, exitCode });
  }

  console.log("\n=== summary ===");
  let failed = 0;
  for (const r of results) {
    const mark = r.exitCode === 0 ? "PASS" : "FAIL";
    console.log(`  ${mark}  ${r.name}  (exit ${r.exitCode})`);
    if (r.exitCode !== 0) failed++;
  }
  console.log(`\n${results.length - failed} of ${results.length} passed${failed > 0 ? `; ${failed} failed` : ""}`);
  return failed > 0 ? 1 : 0;
}

process.exit(await check_all());
