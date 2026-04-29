## Pre-Mortem Review Verdict

**Verdict:** revise
**Confidence:** medium

### Failure narratives (top 3-5, ranked by likelihood)

1. **2-minute wall-clock guarantee collapses under first real dependency.** The direction locked in 8 parallel GitHub Actions jobs and declared the success criterion "runs to green within 2 min wall-clock at greenfield size." Within six weeks of landing, the first product-code dependency (a native Bun module or a large type-check target) did not exist at decision time; `bun install` cold-cache time on the GitHub-hosted runner ate 45-60 seconds; the TS incremental cache was not persisted across runs because `tsconfig.json`'s `incremental` output path was not matched by the Actions cache key; the `tsc --noEmit` job regularly hit 90 seconds; the 2-minute SLO was breached; the user began ignoring red CI instead of fixing the underlying speed issue; CI became advisory rather than blocking. Triggering assumption: 8 parallel jobs finish under 2 min at greenfield repo size *on cold GitHub-hosted runners* — an assumption whose falsity is entirely outside this direction's control.

2. **Lipstyk rule-borrow rots silently as Lipstyk evolves.** The direction borrowed Lipstyk's rule taxonomy into the oxlint config with the note "mapping documented." Lipstyk's RULES.md taxonomy changed (rules renamed, deprecated, or reclassified) at month 4; the borrowed mapping was not machine-checked against an upstream source; the oxlint config silently continued to pass while omitting the renamed rules; the CI appeared green for the changed rules' failure modes; the pre-commit hook and CI disagreed on a PR that introduced exactly the pattern the renamed rule was meant to catch; the discrepancy was discovered only when a manual audit found the gap. Triggering assumption: Lipstyk's RULES.md taxonomy is stable enough to borrow without a sync mechanism.

3. **Local/CI parity breaks on Windows developer path.** The direction required every check executable via `bun run check:<name>` with "identical output" to CI. The LOC shell check (`wc -l`) and TODO grep used Unix shell syntax in the `package.json` scripts; the Cadre project targets `win32` (per env context); Bun on Windows does not transparently forward Unix shell built-ins inside npm scripts; the `wc -l` and `grep` invocations failed silently (returned 0 or errored) on Windows rather than producing counts; the developer's local run showed green, CI showed red or vice versa; the parity guarantee — the load-bearing claim that justified scripting over a task runner — did not hold. Triggering assumption: `wc -l` and `grep` in `package.json` scripts produce identical output on the developer's platform and on the Linux GitHub runner.

4. **Coverage threshold=0% placeholder never gets raised.** The direction included `bun test --coverage` with `threshold=0%` explicitly labeled a "forcing function." Twelve months on: product code grew; the coverage job continued passing at 0%; no process forced the threshold upward; the "forcing function" was never triggered because CI never failed the coverage job; coverage remained purely informational; a regression shipped that was detectable by a test that had not been written. Triggering assumption: the `threshold=0%` placeholder generates sufficient friction to produce an actual threshold decision; no mechanism in the direction enforces that decision.

5. **Aggregator job masks per-job signal in PR review.** The direction specified a single `ci.yml` with 8 parallel jobs plus an aggregator job, `fail-fast: false`. The aggregator job became the only check watched by the PR author; individual job names scrolled off the default GitHub UI summary; a reviewer (or the author in self-review mode) merged a PR where the `comment-ratio` job had failed with an exit code masked by the aggregator's "required checks" configuration; the failure went undetected for two commits before the next clean run surfaced it. Triggering assumption: the aggregator job correctly surfaces per-job failures as blocking signals in the GitHub PR UI without manual configuration of per-job branch-protection rules.

### Top concerns

1. **Wall-clock SLO on cold runners** — the 2-minute guarantee is the primary success criterion, but it depends entirely on runner cold-cache behavior and module install time, which are not controlled by this direction. If the assumption fails, CI becomes advisory before any product feature lands.

2. **Windows shell-built-in parity gap** — the direction is being built on a `win32` host; `wc -l` and `grep` in `package.json` scripts do not behave identically on Windows and Linux runners. The "identical output" claim in the success criteria is the load-bearing assertion, and it did not hold.

3. **Lipstyk borrow without sync mechanism** — "mapping documented" is not a sync mechanism. Borrowing a taxonomy without a machine-checkable link to the upstream source introduces silent drift that will not surface until a real violation is missed.

### Steelman of alternative *(only if verdict != proceed)*

The parked alternative "separate workflow files per check" plus a minimal `package.json` without scripts would eliminate the Windows/CI parity gap entirely: each check's invocation lives in the YAML and runs exclusively on the Linux runner, with no cross-platform shell-built-in contract. The `bun run check:<name>` parity surface would then be explicitly partial (developer convenience, not canonical source of truth), removing the false-guarantee that currently makes the Windows path a latent failure mode. The aggregator-masking concern also shrinks because per-file workflow status is surfaced directly in the GitHub UI without custom aggregator configuration. The tradeoff is ergonomic (no single-command local run), but the chosen direction already implicitly accepts the ergonomic cost on Windows.

### Assumption ledger

- 8 parallel jobs finish under 2 min wall-clock on cold GitHub-hosted runners at greenfield repo size.
- `wc -l`, `grep`, and other Unix shell built-ins in `package.json` scripts produce identical output on the developer's `win32` host and on the Linux GitHub runner.
- Lipstyk's RULES.md taxonomy is stable enough to borrow without a machine-checkable sync mechanism.
- The `threshold=0%` coverage placeholder generates a process or friction strong enough to produce an actual threshold decision before coverage becomes meaningless.
- The aggregator job surfaces per-job failure signals as blocking in the GitHub PR UI without additional branch-protection rule configuration per job.
