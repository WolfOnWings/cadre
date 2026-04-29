# base-ci-deterministic-stack

**Type:** executable plan
**Mode:** implementation
**Scope:** Greenfield CI for Cadre — wide net of fast deterministic L1 checks; foundation for the three-review architecture

**INPUT:** `.claude/plans/base-ci-deterministic-stack.md` (upstream direction artifact)

---

## #23 ORDERING NOTE (per concern C4)

Branch protection (TODO #23) MUST NOT require `ci-complete` until first `*.test.ts` lands and `check:test-exists` flips green. Otherwise every PR — including the one that adds the first test — is unconditionally blocked (test-exists is a forcing function, not a deadlock).

Suggested sequencing: land this CI plan → merge a PR adding the first `.test.ts` (CI fails on that PR but it's force-mergeable since #23 isn't yet enabled) → THEN enable #23 in a follow-up commit / settings change.

---

## SETUP

### Task 1 — Create `package.json` at repo root with scripted check vocabulary

- File: `package.json` (≤30 lines)
- Metadata: `name="cadre"`, `private=true`, `type="module"`
- DevDependencies: `oxlint`, `knip`, `fallow`, `typescript`
- Scripts (≤80-char inline rule per direction):
    - `"check:typecheck"` → `"tsc --noEmit"`
    - `"check:lint"` → `"oxlint ."`
    - `"check:dead-code"` → `"knip"` *(F1: no `--production`)*
    - `"check:duplication"` → `"fallow audit"` *(F3: CLI everywhere)*
    - `"check:comment-ratio"` → `"bun run scripts/check-comment-ratio.ts"`
    - `"check:todos"` → `"bun run scripts/check-todos.ts"`
    - `"check:loc"` → `"bun run scripts/check-loc.ts"`
    - `"check:test-exists"` → `"bun run scripts/check-test-exists.ts"`
    - `"check:all"` → `"bun run scripts/check-all.ts"` *(C8: fan-out runner)*

**Acceptance:** valid JSON; `bun install` succeeds and produces `bun.lock` (text format per F6, Bun 1.1+); `bun run check:all` invokes all 8 check scripts, collects all exit codes, prints summary, exits non-zero if any failed.
**Done-criteria:** `bun.lock` (not `bun.lockb`) committed; `node_modules/` ignored; `bunx oxlint --version` etc. all respond.
**Traceability:** DEFINE → mechanical sidecars; C8 (fan-out runner)

---

### Task 2 — Create `tsconfig.json` at repo root

- File: `tsconfig.json` (~15 lines)
- `compilerOptions`:
    - `target: "ESNext"`, `module: "ESNext"`
    - `moduleResolution: "bundler"` *(aligns with Bun semantics)*
    - `strict: true`, `skipLibCheck: true`
    - `noEmit: true`, `incremental: true`
    - `tsBuildInfoFile: ".tsbuildinfo"`
- `include: ["**/*.ts"]`
- `exclude: ["node_modules", "dist"]`

**Acceptance:** `bunx tsc --noEmit` runs against existing 7 TS files; produces zero errors today (or surfaces real pre-existing errors as starting baseline).
**Done-criteria:** type check completes; `.tsbuildinfo` produced; `.tsbuildinfo` ignored via `.gitignore`.
**Traceability:** DEFINE → tsconfig.json line

---

### Task 3 — Run `bun install`; verify devDependencies; update `.gitignore`

- Run `bun install`
- Verify `bun.lock` (text format) is created — F6
- Verify `node_modules/` populated with `oxlint`, `knip`, `fallow`, `typescript`
- Add `node_modules/`, `.tsbuildinfo` to `.gitignore`
- Commit `bun.lock` to repo (lockfile policy: commit; reproducibility)

**Acceptance:** `bun install` exits 0; all four `bunx <tool> --version` respond; `bun.lock` exists at repo root.
**Done-criteria:** lockfile committed; `.gitignore` updated.
**Traceability:** DEFINE → devDependencies; F6 lockfile format

---

## CHECKS — CONFIG

### Task 4 — Create `.oxlintrc.json` with namespace-prefixed Lipstyk borrows

- File: `.oxlintrc.json`
- Header comment: "Borrowed from Lipstyk RULES.md (https://github.com/styrene-lab/lipstyk/blob/main/RULES.md). Rule names use oxlint v1+ namespace prefix per C3 (concern A denied: borrow-without-sync; revisit if drift)."
- Rules (C3: ALL namespace-prefixed):
    - `"typescript/no-explicit-any"`: `"error"` *(Lipstyk any-abuse)*
    - `"eslint/no-empty"`: `"error"` *(Lipstyk ts-error-handling)*
    - `"eslint/no-magic-numbers"`: `"warn"` *(with sensible exceptions)*
    - `"eslint/require-await"`: `"error"` *(Lipstyk ts-redundant-async)*
    - `"eslint/prefer-const"`: `"error"`
    - `"eslint/eqeqeq"`: `"error"`
    - `"eslint/max-depth"`: `["warn", 4]` *(F5: Lipstyk ts-nesting-depth)*
    - `"eslint/no-nested-ternary"`: `"error"` *(Lipstyk nested-ternary)*
    - *Extend per Lipstyk RULES.md mapping; commit-message-only sync.*
- C10: `no-warning-comments` REMOVED from oxlint — `// TODO` and `// FIXME` are owned exclusively by `check-todos.ts` at error level. `throw new Error("not implemented")` is uniquely covered there too.
- F4: Type-aware oxlint rules — alpha (2025-12), memory caveats. Enable when stable. See https://oxc.rs/blog/2025-12-08-type-aware-alpha. Commented-out block:
    - `"typescript/no-floating-promises"`: `"error"`
    - `"typescript/no-misused-promises"`: `"error"`
    - `"typescript/await-thenable"`: `"error"`
- `ignorePatterns`: `["node_modules/", ".cadre/agent-output/", ".cadre/research/", ".cadre/handoffs/", ".cadre/drafts/", ".tsbuildinfo"]`

**Acceptance:** `bunx oxlint .` runs without config error; existing 7 TS files lint clean (or surface real issues); rule names verified resolved (no silently-ignored bare names).
**Done-criteria:** commit message contains full Lipstyk → oxlint mapping; namespace prefixes confirmed.
**Zero-state:** lints 7 existing TS files; expected clean unless real issues.
**First-real-failure trigger:** any new TS file with `any`-type abuse, empty catch, magic number, redundant async, max-depth>4, or nested ternary. *(Note: `// TODO` is `check-todos`'s job.)*
**Traceability:** DEFINE → `.oxlintrc.json`; C3 (namespace prefixes); C10 (drop no-warning-comments); F4, F5

---

### Task 5 — Create `knip.json` with skills glob + CLI script handling

- File: `knip.json` (~20 lines)
- F1: `--production` flag dropped; explicit entry/project per Cadre's tooling shape. C1: include `.claude/skills/**/*.ts` (already populated: discover-define-cadre, develop-deliver-cadre); register CLI-invoked agent scripts so Knip doesn't flag their internal symbols as unused.
- `entry`:
    - `".claude/hooks/**/*.ts"`
    - `".claude/agents/**/*.ts"`
    - `".claude/skills/**/*.ts"` *(C1a: skills directory)*
    - `"scripts/**/*.ts"`
    - `".claude/agents/handoff-mx-cadre.parse.ts"` *(C1b: CLI-invoked, entry-only)*
    - `".claude/agents/task-mx-cadre.score.ts"` *(C1b: CLI-invoked, entry-only)*
- `project`:
    - `".claude/hooks/**/*.ts"`
    - `".claude/agents/**/*.ts"`
    - `".claude/skills/**/*.ts"`
    - `"scripts/**/*.ts"`
    - *(CLI scripts deliberately NOT in project per C1b — Knip treats them as leaf entry points, not library modules)*
- `ignore`: `["**/*.test.ts", "node_modules/**", ".cadre/**", ".tsbuildinfo"]`
- `ignoreDependencies`: `[]`
- `ignoreBinaries`: `[]`

**Acceptance:** `bunx knip` runs; reports unused exports / dependencies / files scoped correctly; does NOT flag whole repo as unused; does NOT flag CLI-script internals as unused (verified via `bunx knip --reporter verbose`).
**Done-criteria:** first run produces sensible output; zero false positives expected on current TS files.
**Zero-state:** walks `.claude/{hooks,agents,skills}/` + `scripts/`; reports any genuinely unused exports.
**First-real-failure trigger:** an exported symbol becomes unused, an unlisted dependency is imported, or a TS file becomes unreferenced.
**Traceability:** DEFINE → dead-code job; F1 (drop --production, add config); C1 (skills + CLI handling)

---

## CHECKS — SCRIPTS

### Task 6 — Create `scripts/check-loc.ts` (Bun replacement for shell `wc -l`)

- File: `scripts/check-loc.ts` (single function `check_loc()`)
- Constants: `THRESHOLD = 300`; `EXCLUDE = ["node_modules/", ".cadre/", ".git/", "dist/", "*.lockb", "*.tsbuildinfo", "*.md"]`
- C9: normalize path separators before EXCLUDE matching (`path.replace(/\\/g, "/")`) — closes win32 parity gap
- Logic:
    - For each `*.ts` file in repo (walked via `Bun.Glob` or similar):
        - Normalize path → `/`-separated
        - Skip if matches any EXCLUDE pattern
        - Count lines via `Bun.file(path).text().split("\n").length`
        - If line count > THRESHOLD: collect violation
    - If violations exist: print each `path: count lines (max THRESHOLD)`, exit 1
    - Else: print success, exit 0
- Top-level `check_loc()` invocation

**Acceptance:** invokable via `bun run check:loc`; exit 0 today; exit 1 on synthetic 400-line file. Identical output on win32 AND ubuntu-latest (path normalization closes gap per C9).
**Done-criteria:** cross-platform parity verified; no shell pipes.
**Zero-state:** walks 7 .ts files; all under 300 LOC; exit 0.
**First-real-failure trigger:** any `*.ts` file in scope exceeds 300 lines.
**Traceability:** DEFINE → loc-gate; concern B; C9 (Windows normalization)

---

### Task 7 — Create `scripts/check-todos.ts` (sole owner of TODO/FIXME/stub patterns)

- File: `scripts/check-todos.ts` (single function `check_todos()`)
- C10: SOLE owner of `// TODO`, `// FIXME`, `throw new Error("not implemented")` at error level. oxlint's `no-warning-comments` dropped (Task 4) to avoid double-enforcement.
- Patterns:
    - `/\/\/\s*TODO/`
    - `/\/\/\s*FIXME/`
    - `/throw new Error\(["']not implemented["']\)/`
- Include extensions: `.ts`, `.tsx`, `.js`, `.json`, `.yml`, `.yaml`
- Excludes: `node_modules/`, `.git/`, `.cadre/todos.md`, `.cadre/handoffs/`, `.cadre/research/`, `.cadre/drafts/`, `.cadre/agent-output/`, `*.md`, `*.lockb`
- Logic:
    - Path normalize per C9 (same as check-loc)
    - For each file, for each line, for each pattern: collect `(path, lineno, snippet)` on match
    - If violations: print each, exit 1
    - Else: print success, exit 0

**Acceptance:** invokable via `bun run check:todos`; exit 0 today (no stubs); exit 1 if any pattern added; sole owner of TODO/FIXME enforcement (oxlint no longer fires).
**Done-criteria:** `.cadre/todos.md` and `.md` files excluded; cross-platform parity verified.
**Zero-state:** walks `.ts/.js/.json/.yaml`; expected clean.
**First-real-failure trigger:** any matched pattern in non-excluded source.
**Traceability:** DEFINE → todo-grep; concern B; C10 (sole TODO owner)

---

### Task 8 — Create `scripts/check-comment-ratio.ts` with pinned semantics

- File: `scripts/check-comment-ratio.ts` (single function `check_comment_ratio()`)
- Header doc note (C2): MINIMUM-floor metric (≥10%) — opposite axis from Lipstyk's over-documentation rule (>45% density flagged as AI narration). We measure the floor (under-documentation), not ceiling.
- Denominator semantics (C2b, PINNED): blank lines are EXCLUDED from denominator. `total = code_lines + comment_lines`. Industry standard (SLOCCount, Halstead). A file with many blanks has the same ratio as the same file without blanks.
- Constants:
    - `MIN_RATIO = 0.10` *(per locked spec, concern F)*
    - `SCOPE_GLOBS = [".claude/hooks/**/*.ts", ".claude/agents/**/*.ts", ".claude/skills/**/*.ts", "scripts/**/*.ts"]` *(skills added for consistency with knip)*
    - `EXCLUDE_EXT = [".md", ".json", ".lockb", ".tsbuildinfo"]`
- Logic per file in scope:
    - `code_lines` = count of non-blank, non-pure-comment lines
    - `comment_lines` = count of `//` and `/* … */` lines (incl. doc comments)
    - Blank lines NOT counted in either bucket; not in denominator
    - Skip if `code_lines == 0`
    - `total = code_lines + comment_lines`; `ratio = comment_lines / total`
    - If `ratio < MIN_RATIO`: collect violation
- If violations: print each `path: ratio (min MIN_RATIO)`, exit 1
- Else: print success, exit 0

**Acceptance:** invokable via `bun run check:comment-ratio`. PRE-IMPLEMENTATION step (Task 14): run on all in-scope files BEFORE locking threshold; if multiple files fail, surface to user with three options (lower threshold, comment existing files, exempt) — do not silently land a stalling gate (per C2a baseline audit).
**Done-criteria:** scope correctly limited; threshold ≥10% locked OR adjusted per audit; blank-line semantics pinned in header.
**Zero-state:** walks ~7-9 .ts files in scope; baseline audit at Task 14 determines if threshold passes today.
**First-real-failure trigger:** any in-scope `.ts` file with ratio < threshold.
**Traceability:** DEFINE → comment-ratio job; concern F; C2 (verify + pin); P4 narrative

---

### Task 9 — Create `scripts/check-test-exists.ts`

- File: `scripts/check-test-exists.ts` (single function `check_test_exists()`)
- Logic:
    - List files matching `**/*.test.ts` (excluding `node_modules/`)
    - If count == 0: print "test-exists: no `*.test.ts` files found", exit 1
    - Else: print `test-exists: found N test file(s)`, exit 0

**Acceptance:** invokable via `bun run check:test-exists`; exit 1 today (zero `*.test.ts`); exit 0 once any `*.test.ts` lands.
**Done-criteria:** forcing function holds — first test landing flips green.
**Zero-state:** zero test files; exit 1 by design.
**First-real-failure trigger:** failing today by design until first test lands.
**F7 future-proofing:** when real coverage thresholds are added later, Bun enforces them PER-FILE (not aggregate). Use `coveragePathIgnorePatterns` or stub tests for utility files. Source: bun.com/docs/test/coverage.
**Traceability:** DEFINE → test-exists; concern C; F7

---

### Task 10 — Create `scripts/check-all.ts` (fan-out runner per C8)

- File: `scripts/check-all.ts` (single function `check_all()`)
- C8: replaces `&&`-chain in `package.json check:all`. Runs all 8 checks, collects all exit codes, prints summary, exits non-zero if any failed. Mirrors what CI parallel jobs do; AI iteration sees full failure surface in one local run.
- `CHECKS` list: `[("typecheck", "bunx tsc --noEmit"), ("lint", "bunx oxlint ."), ("dead-code", "bunx knip"), ("duplication", "bunx fallow audit"), ("comment-ratio", "bun run scripts/check-comment-ratio.ts"), ("todos", "bun run scripts/check-todos.ts"), ("loc", "bun run scripts/check-loc.ts"), ("test-exists", "bun run scripts/check-test-exists.ts")]`
- Logic:
    - For each `(name, cmd)` in CHECKS: print header, spawn cmd, capture exit code, append to results
    - Print summary table: `✓` for exit 0, `✗` for non-zero, with name and exit code
    - Exit 1 if any failed, else 0

**Acceptance:** invokable via `bun run check:all`; runs ALL 8 checks even if some fail; prints summary; exits non-zero on any failure. Today's baseline: 7 ✓ + 1 ✗ (test-exists by design) → overall exit 1 with clear summary.
**Done-criteria:** AI iteration sees full failure surface in one local run.
**Zero-state:** 7 ✓ (typecheck, lint, dead-code, duplication, comment-ratio, todos, loc) + 1 ✗ (test-exists by design); exit 1.
**First-real-failure trigger:** any check exit non-zero shows in summary.
**Traceability:** C8 (fan-out runner)

---

## WIRE

### Task 11 — Create `.github/actions/bun-setup/action.yml` (composite action per C5)

- File: `.github/actions/bun-setup/action.yml` (~25 lines)
- C5: extracted setup steps so each job calls one step, not 4
- YAML structure:
    - `name: "Bun Setup"`
    - `description: "Checkout, setup Bun, cache, install"`
    - `runs.using: "composite"`
    - Steps:
        - `actions/checkout@v4`
        - `oven-sh/setup-bun@v2` with `bun-version: latest`
        - `actions/cache@v4` with `path: ~/.bun/install/cache`, `key: bun-${{ runner.os }}-${{ hashFiles('bun.lock') }}`, `restore-keys: bun-${{ runner.os }}-`
        - shell: `bash`, run: `bun install --frozen-lockfile`

**Acceptance:** composite action invokable via `uses: ./.github/actions/bun-setup` from any job; cache hit on second run.
**Done-criteria:** all 9 ci.yml jobs reference it; setup-drift surface eliminated.
**Traceability:** C5 (composite action); F6 (`bun.lock` cache key)

---

### Task 12 — Create `.github/workflows/ci.yml` (composite + actionlint + ci-complete aggregator)

- File: `.github/workflows/ci.yml` (~110 lines, down from 140 thanks to composite)
- Header comment block:
    > To add a check: (1) define a new job using `uses: ./.github/actions/bun-setup` then `run: bun run check:<name>`. (2) add the job's name to the `ci-complete` aggregator's `needs:`. That's it. actionlint will catch typos in `needs:`.
- `name: "CI"`
- Triggers: `pull_request`, `push: branches: [main]`, `workflow_dispatch`
- Jobs (all on `ubuntu-latest`):
    - **`workflow-lint`** *(C7: CI-of-CI)*: `actions/checkout@v4` → `rhysd/actionlint@v1` with `files: ".github/workflows/*.yml"`
    - **`typecheck`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:typecheck`
    - **`lint`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:lint`
    - **`dead-code`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:dead-code`
    - **`duplication`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:duplication` *(F3: CLI not action)*
    - **`comment-ratio`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:comment-ratio`
    - **`todo-grep`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:todos`
    - **`loc-gate`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:loc`
    - **`test`**: `uses: ./.github/actions/bun-setup` → `run: bun run check:test-exists` (gate, exits 1 today) → if pass: `bun test --coverage` (report) → upload coverage as artifact via `actions/upload-artifact@v4`
    - **`ci-complete`** *(aggregator, renamed per C11 — no rename debt)*:
        - `needs: [workflow-lint, typecheck, lint, dead-code, duplication, comment-ratio, todo-grep, loc-gate, test]`
        - `if: always()` *(F2: critical for #23)*
        - `runs-on: ubuntu-latest`
        - Step "Verify all upstream jobs passed":
            ```
            if [[ "${{ contains(needs.*.result, 'failure') }}" == "true" ]]; then
                echo "CI failure"; exit 1
            fi
            if [[ "${{ contains(needs.*.result, 'cancelled') }}" == "true" ]]; then
                echo "CI cancelled"; exit 1
            fi
            echo "CI complete"
            ```

**Acceptance:** workflow YAML validates via actionlint; first PR triggers all 10 jobs; aggregator FAILS (not skips) when upstream fails (F2); `ci-complete` is the final gate name (no rename debt per C11).
**Done-criteria:** PR opens; CI runs; comment-block checklist visible; `if: always()` on aggregator; `ci-complete` is the branch-protection target name.
**Zero-state:** workflow-lint passes; 7 of 8 checks pass (test-exists fails by design); aggregator fails (F2 ensures fail-not-skip).
**First-real-failure trigger:** any check fails → aggregator fails; workflow YAML typo → workflow-lint fails.
**Traceability:** DEFINE; concern G + C5 (composite); C7 (actionlint); C11 (rename); F2, F3, F6

---

### Task 13 — Create `.github/workflows/ci-self-test.yml` + `.cadre/test-fixtures/bad.ts` (automated smoke per C6)

Two artifacts, single coherent unit (replaces manual smoke).

**Fixture file:** `.cadre/test-fixtures/bad.ts` — checked-in fixture with intentional violations covering each check:
- 350+ lines of trivial declarations *(loc-gate trip)*
- `// TODO: implement` *(todo-grep trip; oxlint no longer fires per C10)*
- `let foo: any = 1;` *(oxlint `typescript/no-explicit-any` trip — explicit type annotation per C12, NOT type assertion)*
- `const X = 42;` *(oxlint no-magic-numbers trip)*
- max-depth >4 nested if/for *(oxlint max-depth trip per F5)*
- low comment ratio (<10%) *(comment-ratio trip)*
- File path: in scope for all checks *(e.g., `scripts/test-fixtures/` so it's globbed by check-comment-ratio)*

NOTE: this file must be EXCLUDED from production CI runs (Task 5 knip ignore; Task 8 comment-ratio path glob carefully; etc.) — it lives ONLY in the self-test workflow's runtime evaluation, not normal lint.

**Workflow file:** `.github/workflows/ci-self-test.yml` — runs on `workflow_dispatch`. Each step invokes one check on the fixture and asserts the EXPECTED FAILURE via inverted exit code:
- `uses: ./.github/actions/bun-setup`
- "Assert loc-gate fails on fixture": `! bun run check:loc -- .cadre/test-fixtures/bad.ts || (echo "expected loc-gate to fail" && exit 1)`
- "Assert todo-grep fails on fixture": *similar pattern, inverted exit*
- "Assert oxlint fails on fixture": *similar*
- "Assert comment-ratio fails on fixture": *similar*
- "Assert test-exists fails (no test files)": *similar*
- "Summary": `echo "all expected failures fired correctly"`

**Acceptance:** `workflow_dispatch` run produces all-green steps (each check fails as expected on the fixture, asserted by inverted exit code); fixture file checked-in but excluded from production CI scopes; AI implementer can re-run iteratively.
**Done-criteria:** both files exist; manual `gh workflow run ci-self-test.yml` produces green run; documents the "first intentionally bad PR" success criterion via scripted assertion.
**Traceability:** C6 (automated self-test replacing manual smoke); C12 (precision)

---

## VERIFY

### Task 14 — Pre-implementation comment-ratio baseline audit (per C2a)

Run-once verification BEFORE locking the comment-ratio threshold. Per C2a: spot-check on one file is insufficient.

- Run `bun run scripts/check-comment-ratio.ts` once
- Capture exit code + output
- If exit 0: threshold ≥10% locked; proceed to Task 15
- Elif exit 1 with N violations: surface to user the failing files + how-much-by, and three options:
    - **(a)** Lower threshold to N% (e.g., 5%) accepting weaker gate
    - **(b)** Comment existing files retroactively (scope creep)
    - **(c)** Exempt failing files via path-glob in script's SCOPE list
- DO NOT silently lower threshold or land stalling gate.

**Acceptance:** audit runs; user is informed of any baseline violations with explicit options; threshold either locks at ≥10% or is adjusted with explicit user signoff.
**Done-criteria:** comment-ratio gate landed with sustainable threshold; no stall risk in the implementing session.
**Traceability:** C2a (verify baseline pass)

---

### Task 15 — End-to-end CI verification on a real fresh PR

Beyond Task 13's automated self-test, do an end-to-end on a real PR that lands the first test:

- Open a PR adding a clean `*.test.ts` (one trivial passing test)
- Verify CI runs:
    - `workflow-lint`: green
    - All 8 checks: green *(test-exists now passes!)*
    - `ci-complete`: green
- Merge the PR (assuming user approval)
- Per C4 ordering note, follow-up work then enables TODO #23 branch protection requiring `ci-complete`

**Acceptance:** every check fires correctly on the real test-landing PR; `ci-complete` gates correctly; #23 ordering deadlock avoided per C4 sequencing note.
**Done-criteria:** real CI run captured (run URL); first test landed; `ci-complete` green; downstream #23 unblocked.
**Traceability:** DEFINE → success criteria; C4 (#23 ordering)

---

## CLOSE

- ExitPlanMode *(Cadre Step 13)*
- Persist this plan to `.cadre/plans/base-ci-deterministic-stack.md` *(Cadre Step 14)*
- Surface handoff: ready for an implementing session to walk this plan top-to-bottom

---

## OUTPUT

`.cadre/plans/base-ci-deterministic-stack.md` *(post-ExitPlanMode persistence)*

**14 implementation artifacts:**
- `package.json`
- `tsconfig.json`
- `.gitignore` *(modified)*
- `.oxlintrc.json`
- `knip.json`
- `scripts/check-loc.ts`
- `scripts/check-todos.ts`
- `scripts/check-comment-ratio.ts`
- `scripts/check-test-exists.ts`
- `scripts/check-all.ts`
- `.github/actions/bun-setup/action.yml`
- `.github/workflows/ci.yml`
- `.github/workflows/ci-self-test.yml`
- `.cadre/test-fixtures/bad.ts`

**Verification:** comment-ratio baseline audit (Task 14); end-to-end CI green on first-test PR (Task 15).
