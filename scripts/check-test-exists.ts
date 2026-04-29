#!/usr/bin/env bun
// Cadre check: forcing-function gate for test existence.
// Exits 1 until the first *.test.ts file lands; flips green automatically.
// Replaces a coverage-threshold=0% placeholder, which is decorative (always
// passes) and would never force a real testing decision.

import { Glob } from "bun";

async function check_test_exists(): Promise<number> {
  const glob = new Glob("**/*.test.ts");
  const found: string[] = [];
  for await (const raw of glob.scan({ cwd: ".", onlyFiles: true, dot: true })) {
    const path = raw.replace(/\\/g, "/");
    if (path.startsWith("node_modules/")) continue;
    found.push(path);
  }

  if (found.length === 0) {
    console.error("check-test-exists: no *.test.ts files found (forcing function — write the first test)");
    return 1;
  }

  console.log(`check-test-exists: found ${found.length} test file(s)`);
  return 0;
}

process.exit(await check_test_exists());
