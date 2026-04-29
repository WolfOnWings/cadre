base-ci-deterministic-stack
═══════════════════════════════════════
Type: discover-define-cadre output
Mode: freeform conversation
Scope: "Greenfield CI for Cadre — wide net of fast deterministic L1 checks; foundation for the three-review architecture"

INPUT: TODO #22 — Base CI workflow. Critical-path; blocks TODOs #6, #7, #8, #9, #10, #23.
User intent (verbatim): "Want to have robust deterministic tooling. Linter, typecheck, maybe even tree sitters for parsing functions or idk. Throw the book at it since everything will run quickly. Also something similiar to this -> https://github.com/styrene-lab/lipstyk/blob/main/RULES.md. Surely there are many other AI dev CI check flows already setup - can just borrow from a lot of those."

DISCOVER
  ▸ Intent: Robust deterministic L1 tooling baseline — wide net of fast checks (linter, typecheck, AST/structural validators, AI-output slop detection, complexity, dead-code, coverage). "Throw the book" because checks run fast and L1 is the trust floor under the three-review architecture.

  ▸ Alternatives explored:
    – Linter: ESLint / **oxlint** / Biome — chose oxlint (Rust-native, 8-12× faster than ESLint, native AI-output rules)
    – Typecheck: **tsc --noEmit** / tsgo — chose tsc (authoritative; Bun skips type-check by design)
    – Dead code: **Knip + Fallow** as complementary stack (Knip: unused exports/deps; Fallow: cross-file duplication)
    – Slop detection: **use Lipstyk binary** / **borrow Lipstyk rules into oxlint config** — chose borrow (avoid single-maintainer + sixth-binary baggage)
    – LOC + TODO checks: **shell built-ins (wc -l, grep)** / **Bun TS scripts** — chose Bun scripts (premortem caught win32 parity gap)
    – Comment-ratio check: **inline JS** / **dedicated Bun TS script** — chose dedicated script
    – Coverage gate: **threshold=0% placeholder** / **check:test-exists** / defer — chose check:test-exists (reviewer trio: threshold=0% isn't a forcing function)
    – Workflow shape: **single ci.yml + parallel jobs** / separate files / matrix — chose single ci.yml (research: matrix is for N×M, not independent checks)
    – package.json: **scripted (`bun run check:*`)** / minimal — chose scripted (local/CI surface parity)
    – Wall-clock SLO: 2-min hard target / **drop entirely** / cache-augmented — dropped (premortem: depends on uncontrolled cold-runner behavior)

  ▸ Researcher fold-in: 8-check stack synthesized — oxlint (14 AI-output rules: no-magic-numbers, no-warning-comments, no-explicit-any, redundant async, etc.), tsc --noEmit (moduleResolution: bundler aligns with Bun semantics), Knip --production (entry-point graph; catches hallucinated imports), Fallow audit (4-mode duplication detection + complexity), Bun built-in coverage (bunfig.toml; per-file thresholds), parallel-jobs gated by aggregator. Sources: oxc.rs (oxlint, type-aware alpha 2025-12), styrene-lab/lipstyk RULES.md, knip.dev, github.com/fallow-rs/fallow, bun.com/docs/test/coverage, oneuptime.com (parallel-jobs idiom). Confidence: high on tool selection; medium on tsgo (alpha); medium on Lipstyk maturity (single-maintainer, no version history).

  ▸ Decision-tree branches resolved:
    – Scope = whole-repo, glob-aware (forward-design for product code)
    – Overlap with pre-commit (#21) = defense in depth (CI is unbypassable canonical against `--no-verify` and agent-disabled hooks)
    – Triggers = pull_request + push to main + workflow_dispatch
    – Lipstyk = borrow rules; no commit-pin or sync trigger (user accepted drift risk)
    – Gap mitigations = all 3 in v1 as Bun TS scripts (LOC, TODO, comment-ratio)
    – Coverage = check:test-exists gate (exit 1 if no *.test.ts); `bun test --coverage` runs separately for the report artifact
    – package.json = scripted; ≤80-char inline rule (larger or control-flow → scripts/)
    – Workflow shape = single ci.yml, 9 parallel jobs (8 checks + aggregator), fail-fast: false
    – Wall-clock SLO = dropped from success criteria
    – Aggregator = renamed "CI complete (bootstrap)" + comment-block checklist for adding new checks

  ▸ Parked alternatives:
    – Lipstyk-as-tool (revisit if matures with versioned releases + plugin arch)
    – ESLint (8-12× slower than oxlint; functionally covered)
    – Matrix strategy (wrong shape — independent checks, not N×M combos)
    – tsgo as authoritative (nightly preview; revisit at TS 7.0 GA, ~mid-2026)
    – Separate workflow files per check (parallel jobs in single file is standard idiom)
    – Minimal package.json without scripts (no upside)
    – threshold=0% coverage (always passes; not a forcing function)
    – wc -l + grep shell built-ins (broke win32 parity)
    – 2-min wall-clock SLO (uncontrolled cold-runner dependency)
    – Lipstyk commit pin + sync mechanism (user accepted borrow-without-sync; revisit if drift)

  ▸ Open tensions resolved:
    – "Throw the book" vs ship-today → parallel-jobs at greenfield substrate makes "all 8" affordable
    – oxlint + Lipstyk rule overlap → oxlint is canonical executor; Lipstyk taxonomy is rule source
    – Greenfield-no-tests vs coverage gate → check:test-exists fails today, flips green when first test lands
    – Local/CI parity on win32 → Bun TS scripts replace shell built-ins (premortem catch)

  ▸ Reviewer verdicts: brooks proceed (medium); premortem revise (medium); staff-engineer 8 findings (L1×5, L2×1, L3×2)

  ▸ Concerns confirmed:
    – B (triangulated): Replace wc -l / grep with Bun TS scripts; adopt ≤80-char inline-vs-script rule
    – C (triangulated): Replace threshold=0% with check:test-exists; coverage report runs separately
    – D (premortem): Drop 2-min wall-clock SLO from success criteria
    – E (brooks): Each job entry in develop-deliver plan documents zero-state behavior + first-real-failure trigger
    – F (staff-eng): Lock comment-ratio spec — ≥10% per TS file, exit 1 below, scope .claude/{hooks,agents}/ + scripts/, exclude generated JSON + *.md
    – G (staff-eng × 2): Comment-block checklist at top of ci.yml + rename aggregator to "CI complete (bootstrap)"

  ▸ Concerns denied:
    – A (triangulated): Lipstyk commit-pin + mapping table + sync trigger — user accepts borrow-without-sync; revisit if drift becomes real

DEFINE
  ▸ Problem framing: Cadre has no L1 trust floor today. The three-review architecture (commit/push/merge gates) presupposes deterministic checks exist; without them every gate runs L3-only and bias cascades through. v1 CI lays the deterministic foundation that #23 (require-CI-green branch protection), #21 (pre-commit framework), and the merge-gate review all rest on.

  ▸ Chosen direction:

    Single `.github/workflows/ci.yml` with 9 parallel jobs on `ubuntu-latest`:
      Triggers: pull_request + push: branches: [main] + workflow_dispatch
      Setup: oven-sh/setup-bun@v2 with lockfile-keyed cache
      fail-fast: false
      Comment-block checklist at top of ci.yml: "To add a check: (1) define new job, (2) add job name to aggregator's needs:"

    Eight check jobs:
      1. typecheck      — `bunx tsc --noEmit`
      2. lint           — `bunx oxlint .` (oxlint config carries borrowed Lipstyk rules; mapping documented in commit message)
      3. dead-code      — `bunx knip --production`
      4. duplication    — `bunx fallow audit`
      5. comment-ratio  — `bun run scripts/check-comment-ratio.ts` (≥10% per TS file in .claude/{hooks,agents}/ + scripts/; exit 1 below; exclude generated JSON + *.md)
      6. todo-grep      — `bun run scripts/check-todos.ts` (Bun replacement for shell grep; excludes node_modules, .git/, .cadre/todos.md, binary extensions; catches `// TODO`, `// FIXME`, `throw new Error("not implemented")`)
      7. loc-gate       — `bun run scripts/check-loc.ts` (Bun replacement for shell wc -l)
      8. test-exists    — `bun run scripts/check-test-exists.ts` (exit 1 if zero *.test.ts files); `bun test --coverage` runs separately for report artifact

    One aggregator job:
      9. ci-complete-bootstrap (label: "CI complete (bootstrap)") — `needs: [typecheck, lint, dead-code, duplication, comment-ratio, todo-grep, loc-gate, test-exists]`; TODO comment to rename when coverage > 0%

    Mechanical sidecars landing alongside ci.yml:
      – package.json: private: true, type: module, devDependencies (oxlint, knip, fallow, typescript), scripts block exposing each check as `bun run check:<name>`; ≤80-char inline rule (larger → scripts/<name>.ts)
      – tsconfig.json: module: ESNext, moduleResolution: bundler, strict: true, skipLibCheck: true, noEmit: true, incremental: true, broad include (whole-repo)
      – oxlint config (.oxlintrc.json): borrows Lipstyk rule taxonomy; mapping documented in commit message (no commit-pin per concern A denial)
      – scripts/ directory: check-loc.ts, check-todos.ts, check-comment-ratio.ts, check-test-exists.ts

    Per-check empty-state + first-real-failure trigger docs land in the develop-deliver plan (one block per job).

  ▸ Direction rationale:
    – Borrow-Lipstyk + oxlint-canonical avoids single-maintainer dependency; oxlint covers ~80% of Lipstyk's taxonomy natively
    – Bun TS scripts for LOC + TODO + comment-ratio close the win32/Linux parity gap while preserving the `bun run check:*` local-CI surface
    – check:test-exists is a real gate (fails today, passes when first test lands) vs. threshold=0% which is decorative
    – Parallel-jobs is the standard idiom for independent-check ensembles (matrix is for combinations)
    – Scripted package.json gives local-CI parity at zero cost and exposes a coherent check vocabulary
    – Greenfield is the cheapest moment to bake a wide check net; user's "throw the book" framing maps directly

  ▸ Success criteria:
    – `.github/workflows/ci.yml` lands on a fresh PR; all 9 jobs run to green (cold-runner timing observed, not gated)
    – All 8 checks executable locally via `bun run check:<name>` with identical output across win32 and ubuntu-latest (Bun scripts ensure parity)
    – First "intentionally bad" PR (TODO stub, magic number, oversized file, missing test) fails the right job(s) cleanly
    – check:test-exists fails today (no *.test.ts exists); first test landing flips it green
    – Aggregator job "CI complete (bootstrap)" gates branch protection on TODO #23 (downstream)
    – New tools pluggable as one-job-add + one needs-list entry; comment-block checklist guards the discipline

  ▸ Load-bearing assumptions:
    – TS-on-Bun stays Cadre's doctrine; Bun behaves identically on win32 and ubuntu-latest for the TS script idioms used (file walks, glob expansion, exit codes)
    – Lipstyk's RULES.md taxonomy is stable enough to borrow without a sync mechanism (acknowledged risk; revisit if drift)
    – Defense-in-depth at CI is right for now; revisit if CI runtime explodes past ~3 min
    – Greenfield substrate = 8 jobs land green vacuously and become real as code grows (zero-state behavior documented per check in develop-deliver plan)
    – oxlint's rule coverage of Lipstyk's 14-rule taxonomy is ~80% (researcher claim, medium confidence); custom comment-ratio script covers the distinctive Lipstyk metric; cross-file duplication covered by fallow

OUTPUT: .claude/plans/base-ci-deterministic-stack.md (this file)
