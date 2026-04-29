import { test, expect } from "bun:test";

// Trivial first test — flips check:test-exists from red to green and unblocks
// the board's branch-protection task. Asserts the package.json setup landed by
// the CI bootstrap PR rather than picking a no-op.

test("package.json shape is intact", async () => {
  const pkg = await Bun.file("package.json").json();
  expect(pkg.name).toBe("cadre");
  expect(pkg.private).toBe(true);
  expect(pkg.type).toBe("module");
  expect(typeof pkg.scripts).toBe("object");
  expect(pkg.scripts["check:all"]).toBeTruthy();
});
