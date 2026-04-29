design-develop-deliver-cadre
═══════════════════════════════════════
Type: skill (brainstorm artifact → develop-deliver-cadre design)
Mode: freeform conversation
Scope: "Design develop-deliver-cadre — Diamond 2 of the Double Diamond, paired with discover-define-cadre."

INPUT: User intent — "[skill] runs in plan mode and produces a clean, tested, well-structured plan that's fully actionable; nothing sizable left to in-the-moment judgement by the implementing LLM; all code/programs decomposed to pseudocode for quick user review."

DISCOVER
  ▸ Intent: north-star captured above (user-articulated).
  ▸ Decisions:
      - Naming: develop-deliver-cadre (verb pair after Double Diamond Diamond 2 phases; pairs with discover-define-cadre as Diamond 1).
      - Artifact decomposition: D — hybrid step-based wrapper + task-level content (goal + pseudocode + acceptance + done-criteria + traceability).
      - Scope boundary: A — strict handoff (discover-define-cadre artifact required as INPUT).
      - Interaction: C — mixed (forks ping-pong with user; mechanical decomposition drafted top-down by orchestrator).
      - Plan-mode mechanics: B — soft enforce (silent if active; remind + exit if not; check is FIRST action of SOP).
      - Phase structure: DEVELOP / DELIVER (2 phases, Diamond 2 of Double Diamond).
      - Two signoff gates: pre-review (after first draft) + post-review (after concerns folded in).
  ▸ Researcher fold-in: 50-year pseudocode lineage (Wirth 1971; Knuth 1984; McConnell PPP; Yourdon/Constantine 1975); modern SDD (Kiro, GitHub Spec Kit, Cursor, Roo Code, Cline); Augment empirical ~87% vs ~19% accuracy (single-function vs multi-file scope) — load-bearing failure mode is granularity; plan mode is prompt-injection-enforced not architectural (Ronacher analysis); altitude rule = "level of intent, not mechanics" (McConnell).

DEFINE
  ▸ Problem framing: an LLM executing implementation drifts from intent because in-moment judgment calls accumulate; user catches drift only after, by debugging output. develop-deliver-cadre's job is to precommit all sized judgment calls to a reviewable artifact, so the implementing session walks it mechanically and drift is caught at plan-review time.
  ▸ Load-bearing assumptions:
      1. Pseudocode at intent-altitude is unambiguous enough (Fowler non-determinism finding bounds this risk).
      2. Granularity cap (≤ single-function/single-file) is achievable; structural audit added.
      3. discover-define-cadre output is sufficient context (strict handoff).
      4. Soft-enforced plan mode is enough (first-action check — silent if active, remind + exit if not).

DEVELOP
  ▸ Surviving direction: develop-deliver-cadre as a 2-phase skill (DEVELOP + DELIVER) running in CC plan mode; takes `.claude/plans/<slug>.md` (discover-define-cadre artifact) as INPUT; produces executable plan at `.cadre/plans/<slug>.md`.
  ▸ Reviewer trio: brooks-review-cadre + premortem-reviewer-cadre + staff-engineer-cadre (researcher-cadre relocated to DEVELOP as a background reinvent-defense scan; NOT in trio).
  ▸ Pseudocode altitude: code-shaped prose-narration in Python-tagged code blocks; control-flow keywords (for / in / if / not / and / continue / yield / return) syntax-colored by renderer.
  ▸ Parked alternatives: 3-phase restructure (DEVELOP/REVIEW/DELIVER); 4-reviewer ensemble (brooks + premortem + staff-engineer + researcher); hard plan-mode enforcement.
  ▸ Staff-engineer + premortem fold-in: split draft step into named sub-beats; specify task-schema field semantics; first-action plan-mode check; persist before ExitPlanMode; granularity self-audit; signoff anticipation cue.

DELIVER-DIRECTION
  ▸ Chosen direction (the develop-deliver-cadre skill's structure):

      develop-deliver-cadre
      ═══════════════════════════════════════
      Type: skill
      Mode: plan mode
      Scope: "Diamond 2 of the Double Diamond — direction → executable plan, reviewed and delivered."

      INPUT: .claude/plans/<slug>.md (artifact from discover-define-cadre)

      DEVELOP
        ▸ plan-mode check (FIRST action — silent if active; remind + exit if not)
        ▸ load discover-define-cadre artifact
        ▸ dispatch researcher-cadre in background (reinvent-defense scan)
        ▸ draft full plan in CLAUDE.md step-based format — code-shaped pseudocode at intent altitude (Python-tagged blocks; keywords syntax-colored)
        ▸ fold researcher findings as they return (integrate prior-art into draft)
        ▸ post-draft granularity self-audit (flag tasks spanning >1 file/module)
        ▸ render inline; user signoff #1 ("Confirming starts 3 parallel review passes — expect 60-90s")
        ▸ on signoff: dispatch trio in parallel — brooks-review-cadre + premortem-reviewer-cadre + staff-engineer-cadre
        ▸ fold concerns into per-concern AUQ

      DELIVER
        ▸ apply confirmed changes
        ▸ deliver complete plan inline
        ▸ user signoff #2
        ▸ persist to .cadre/plans/<slug>.md
        ▸ ExitPlanMode

      OUTPUT: .cadre/plans/<slug>.md

  ▸ Open tensions resolved:
      - Reviewer composition: triangulated review favored brooks restoration; user kept researcher-cadre in develop-deliver-cadre but as a DEVELOP-phase background scan (reinvent-defense), not in the review trio.
      - Phase count: kept 2 phases (DEVELOP / DELIVER) for Double Diamond fidelity; denied 3-phase restructure.
      - Schema fields (acceptance / done-criteria / traceability): deferred to a new agent (test-designer / TDD / SDD primitive) — out of develop-deliver-cadre's scope.
      - ExitPlanMode mode-shift signifier: denied — already CC-native.
      - Stale-artifact freshness gate: denied.

REVIEW
  ▸ premortem-reviewer-cadre verdict: revise (high)
  ▸ staff-engineer-cadre verdict: revise (10 findings across L2 / L3 / L4)
  ▸ researcher-cadre (reinvent-defense lens) verdict: revise (high)
  ▸ Note: brooks-review-cadre was NOT run for this brainstorm — researcher-cadre was substituted in the third reviewer slot (per user's reinvent-defense framing). All three reviewers independently converged on `revise` with substantial overlap.
  ▸ Concerns confirmed (8): restore brooks-review-cadre to develop-deliver-cadre's trio; relocate researcher-cadre to DEVELOP phase as reinvent-defense scan; granularity self-audit sub-step; plan-mode check as FIRST action of SOP; persist before ExitPlanMode; live-fire test of plan-mode tool dispatch (TODO gating SOP publication); anticipation cue on signoff #1; pseudocode altitude pinned to F-style (Python-tagged prose-code blocks).
  ▸ Concerns denied (4): stale-artifact freshness gate; 3-phase restructure; two-signoff fatigue mitigation; ExitPlanMode mode-shift signifier (CC-native).
  ▸ Concerns redirected (1): task-schema field spec → new agent (test-designer / TDD / SDD primitive) — out of develop-deliver-cadre scope.

CLOSE
  ▸ Direction summary: develop-deliver-cadre captured above; ready for skill build-out via creator-cadre. Pair with discover-define-cadre rework (Diamond 1) for full Double Diamond workflow.
  ▸ Side-tasks for follow-on:
      1. Rename + rework brainstorm-cadre → discover-define-cadre (DISCOVER / DEFINE two phases mirroring develop-deliver-cadre's shape; drop first staff-engineer pass; reviewer trio stays brooks + premortem + staff-engineer).
      2. Live-fire test plan-mode tool dispatch — verify Agent tool dispatches and skill invocations work inside CC plan mode (gates develop-deliver-cadre SOP publication).
      3. New agent: test-designer / TDD / SDD primitive (owns task-level schema — acceptance, done-criteria, traceability — invoked by develop-deliver-cadre during DEVELOP).

OUTPUT: .claude/plans/design-develop-deliver-cadre.md (this file)
