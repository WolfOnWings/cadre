# Handoff-MX-Cadre: Prior-Art Research Brief

**Date:** 2026-04-26
**Author:** Researcher subagent (Cadre)
**Intended location:** `.cadre/research/2026-04-26-handoff-mx-prior-art.md`
**Note on file location:** Plan mode was active when this brief was generated, restricting writes to this plan path. The content is the deliverable; relocate to the intended path on plan exit, or accept it where it is.

---

## Scope

Survey six prior-art domains and extract patterns applicable to handoff-mx-cadre — the lifecycle-hook + CLAUDE.md system that maintains a session-handoff document automatically (live mutation, session-end seal, session-start surfacing, archive-on-age, per-commit narrative excluded). Architecture is settled; this brief informs implementation choices, not the architectural decision.

---

## 1. Spaced-repetition session loops (Anki, SuperMemo)

### Patterns

**SM-2 separates per-item state from per-session state.** SuperMemo's SM-2 algorithm tracks three values per item: E-Factor (difficulty, 1.3–2.5, persistent), repetition number `n`, and inter-repetition interval `I` in days. State carried across sessions is per-item, not per-session: "EF':=EF+(0.1-(5-q)*(0.08+(5-q)*0.02))" updates at review, and intervals follow `I(n):=I(n-1)*EF` for n>2 ([Wozniak, SM-2](https://super-memory.com/english/ol/sm2.htm)). The session itself is ephemeral; the durable artifact is the per-item curve. **Failure mode solved:** loss of item-specific learning history when sessions are treated as the unit of state.

**Anki's three-queue gather order with daily caps.** Anki gathers cards in priority order: intraday learning, interday learning, review, then new ([Anki: Deck Options](https://docs.ankiweb.net/deck-options.html)). New cards are throttled by a daily cap ("controls how many new cards can be introduced each day") and reviews by a max-per-day limit. The cap prevents one heavy session from blowing through the deck and starving future ones. **Failure mode solved:** unbounded daily firehose; fatigue-driven abandonment.

**Burying as soft archive.** "Bury New Siblings" / "Bury Review Siblings" delay related cards until the next day without removing them from the schedule ([Anki: Studying](https://docs.ankiweb.net/studying.html)). Suspending is the longer-term version: "Hides a card or all of the note's cards from review until they are manually unsuspended." Burying is automatic, scoped, time-boxed; suspending is manual, indefinite, reversible. Neither deletes. **Failure mode solved:** redundant or noisy items dominating attention without losing the data.

### Applicability to handoff-mx-cadre

- **Strong:** the bury/suspend distinction maps directly onto archive triggers. Aged handoffs should be *buried* (rolled out of the active surfacing window, still indexed) before being *suspended/archived* (moved out of the live tree). Never delete.
- **Strong:** daily caps inform surfacing limits — at session start, surface only the most recent N entries, not the entire history.
- **Weak:** SM-2's E-Factor analog has no obvious mapping; handoffs aren't graded.

---

## 2. LSP lifecycle event semantics

### Patterns

**Two-phase shutdown (`shutdown` then `exit`).** LSP separates "stop accepting new requests and clean up" from "actually terminate." The spec: "The `shutdown` request is sent from the client to the server. It asks the server to shut down, but to not exit (otherwise the response might not be delivered correctly to the client)" ([LSP 3.17 Specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)). The `exit` notification finalizes termination after the shutdown response is sent. **Failure mode solved:** premature termination losing the seal-confirmation message.

**`initialize` is one-shot and gates all other traffic.** "If the server receives a request or notification before the `initialize` request it should act as follows: For a request the response should be an error with `code: -32002`." Until `initialize` resolves, no work is permitted ([LSP 3.17](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)). **Failure mode solved:** race conditions where state-dependent operations run before state is established.

**`willSave` vs. `didChange` — two flavors of mutation event.** `didChangeTextDocument` fires continuously during edit; `willSaveTextDocument` fires once before persistence and can participate in the save (`willSaveWaitUntil` lets the server modify text before save commits). The split lets servers distinguish "transient mutation" from "durable commit." **Failure mode solved:** writing every keystroke to disk.

### Applicability to handoff-mx-cadre

- **Very strong:** the two-phase shutdown maps onto session-end. The `Stop` hook (per turn) plays `didChange`'s role of transient mutation reminder; `SessionEnd` plays `willSave` + `exit` — last chance to seal the live entry, then terminate. The decision to use SessionEnd as the seal trigger is well-grounded.
- **Strong:** `initialize`-gates-traffic argues that SessionStart must complete its surfacing read before any orchestrator behavior runs that depends on prior context. If hooks are async, this is a sequencing concern worth addressing explicitly.
- **Moderate:** `willSaveWaitUntil` (server can rewrite document before save) suggests SessionEnd hook could optionally normalize/condense the live entry before sealing — but adds complexity; defer until usage warrants.

---

## 3. Memex-class state patterns

### Patterns

**Memex associative trails — name-and-recall-later.** Vannevar Bush's 1945 essay describes a user "build[ing] a trail of his interest through the maze of materials available to him" and later retrieving it by name ([Bush, *As We May Think*, Atlantic, 1945](https://www.w3.org/History/1945/vbush/vbush7.shtml)). The trail is a first-class artifact, named, persistent, and shareable: "wholly new forms of encyclopedias will appear, ready-made with a mesh of associative trails running through them." **Failure mode solved:** re-discovering yesterday's path through the same material.

**Daily Notes as default-capture surface (Roam, Logseq, Obsidian).** Roam Research treats the Daily Note as the default landing page — "each day an empty page awaits you. If there is a thought you want to jot down, and you don't quite know where to place it, you can simply write it there" ([Sweet Setup, Roam guide](https://thesweetsetup.com/a-thorough-beginners-guide-to-roam-research/)). Logseq makes journals the default page on every open ([Logseq Discuss: How to get started with Logseq's Journals page](https://discuss.logseq.com/t/how-to-get-started-with-logseqs-journals-page/8432)). Obsidian's Daily Notes plugin creates one note per calendar day with a date-based filename like `2026-04-26.md` ([Obsidian Help: Daily notes](https://help.obsidian.md/plugins/daily-notes)). **Failure mode solved:** capture friction — "where does this go?" blocks entry.

**Linked-references panel as auto-surfacing of prior context.** Roam's bidirectional links automatically populate a Linked References panel on every page. "Each page also detects and shows 'Unlinked' references, places where a string appears without an explicit link" ([Sweet Setup, Roam guide](https://thesweetsetup.com/a-thorough-beginners-guide-to-roam-research/)). Logseq's daily journal shows the same: "in the linked references of each day's Journals page you'll see the mentions of that day's date" ([Logseq Discuss: Journals](https://discuss.logseq.com/t/how-to-get-started-with-logseqs-journals-page/8432)). Prior-day content surfaces *automatically* when the current day's content references it. **Failure mode solved:** prior context invisible without active recall.

### Applicability to handoff-mx-cadre

- **Very strong:** the daily-note pattern is the closest analog to the handoff doctrine. Per-session file with date-based naming (`YYYY-MM-DD.md` or `YYYY-MM-DD-<slug>.md`) is conventional and precedent-grounded. Surfaces no taxonomy decision at write time.
- **Strong:** linked-references-as-auto-surfacing argues SessionStart should not just present the most recent handoff but should also surface any older handoff that references the current branch / current files. This is a deferred capability — note it as future-state, don't pre-build.
- **Moderate:** Bush's named trails suggest that handoff entries should be addressable (filename or anchor) so future sessions can reference them.

---

## 4. Agent-system handoffs / continuity

### Patterns

**LangGraph checkpointer + thread_id.** State persists at every graph step as a checkpoint, organized into threads. "Each thread has a unique thread_id and keeps its own set of checkpoints, so its execution history stays separate" ([LangChain: LangGraph Persistence](https://docs.langchain.com/oss/python/langgraph/persistence)). The checkpointer interface defines `.put`, `.get_tuple`, `.list`, `.delete_thread()`. State is a typed object, not freeform text. **Failure mode solved:** lost mid-run state on crash; ability to resume or time-travel.

**OpenAI Assistants API — auto-truncation under pressure.** Threads persist conversation history with up to 100,000 messages per thread. "Once the size of the Messages exceeds the context window of the model, the Thread will attempt to smartly truncate messages, before fully dropping the ones it considers the least important" ([OpenAI Developer Community: Thread Persistence](https://community.openai.com/t/clarifying-thread-persistence/497505)). Truncation strategy can be `auto` or `last_messages` (fixed-recency window). **Failure mode solved:** context-window overflow killing long sessions.

**CrewAI unified memory with recency decay and importance.** CrewAI uses "a single `Memory` class" with hierarchical scopes. Retrieval ranks by semantic similarity, "recency decay (exponential with configurable half-life)," and importance. Consolidation merges near-duplicates above a similarity threshold ([CrewAI Memory docs](https://docs.crewai.com/concepts/memory)). **Failure mode solved:** stale memory dominating retrieval; duplicate accumulation.

**AutoGen TeachableAgent + per-session vs. cross-session split.** AutoGen distinguishes short-term memory (conversation buffer in `ListMemory`) from long-term (vector DB via TeachableAgent). "AutoGen chat history stores raw messages in-session, but it doesn't extract facts, doesn't generalize, and disappears when the conversation ends" ([Memorilabs: AutoGen Multi-agent Conversations Memory](https://memorilabs.ai/blog/autogen-multi-agent-conversation-memory)). Persistence requires explicit teachability. **Failure mode solved:** mistaking conversational scratchpad for durable knowledge.

**Anthropic Agent Skills — progressive disclosure on filesystem.** Skills load in three levels: metadata always (~100 tokens, ~name+description in YAML frontmatter), SKILL.md body when triggered (<5k tokens), bundled resources only when referenced ([Claude Docs: Agent Skills overview](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview); [Anthropic engineering blog, *Equipping agents for the real world with Agent Skills*](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)). Filesystem is the unbounded backing store; context is the working set. **Failure mode solved:** loading-everything-upfront context exhaustion.

### Applicability to handoff-mx-cadre

- **Very strong:** the LangGraph thread_id model maps well — each session is a thread, the live handoff entry is the latest checkpoint. The seal-on-SessionEnd is a `.put` of the final checkpoint.
- **Very strong:** CrewAI's recency-decay and consolidation directly inform archive policy. Old handoffs decay in surfacing weight; near-duplicate entries (same branch, same scope) consolidate rather than accumulate.
- **Strong:** Agent Skills progressive disclosure argues handoff itself should layer — a thin metadata block always-surfaced (most recent date, active branch, top-of-mind), full content only when needed. CLAUDE.md doctrine should encode this.
- **Strong:** Auto-truncation under pressure (OpenAI threads) is the wrong model for handoff. Handoffs should *archive*, not *truncate*; archiving preserves the artifact, truncation discards it. This is a clear anti-pattern boundary.
- **Moderate:** AutoGen's short-term/long-term split argues against a single flat handoff file in the long run — there's likely a pressure toward "today's handoff" (live, in `.cadre/handoff.md`) vs. "history" (archived). The architecture already does this; the lesson is to keep the line clean.

---

## 5. OS session/state mechanisms

### Patterns

**tmux: server-process detach with full continuation.** tmux's session model: a server process holds session state; clients attach and detach. "Each session is persistent and will survive accidental disconnection" — running processes continue, panes/windows preserve layout, paste buffer persists ([tmux man page, man7.org](https://man7.org/linux/man-pages/man1/tmux.1.html)). What does *not* persist: "the visible position is a property of the client not of the window" — the client's scroll position resets on reattach. **Failure mode solved:** loss of work on disconnect; state divorced from the connection.

**GNU screen autodetach on hangup.** screen's autodetach (default on) "saves all your running programs until they are resumed with a screen -r command" when the terminal hangs up ([GNU Screen User's Manual](https://www.gnu.org/software/screen/manual/screen.html)). Detach is the default response to disruption, not termination. **Failure mode solved:** termination on transient connection loss.

**Mosh State Synchronization Protocol — sync state, not bytes.** Mosh maintains "a snapshot of the current screen state" on both ends and synchronizes objects, not byte-streams. Sessions survive IP changes, network drops, sleep/wake ([mosh.org](https://mosh.org/)). The protocol regulates synchronization rate based on conditions and skips intermediate frames. **Failure mode solved:** byte-stream protocols can't recover from gaps.

**Linux suspend-to-disk (hibernation) — atomic full-state snapshot.** The kernel freezes processes, snapshots memory, writes to swap, powers down. On resume, "we load the image into unused memory and then atomically copy it back to its original location" ([kernel.org: swsusp.txt](https://www.kernel.org/doc/Documentation/power/swsusp.txt)). Cost: image ≤ ½ RAM. **Failure mode solved:** loss of full system state on power loss; faster wake than cold boot.

### Applicability to handoff-mx-cadre

- **Very strong:** tmux's "running processes survive, scroll position resets" maps onto handoff content survival vs. transient cursor state. Live mutation is the equivalent of running processes; the user's "visible position" (which file open, exact line) is properly *not* in handoff.
- **Strong:** Mosh's sync-state-not-bytes is the right model for live mutation. The handoff should track *what state means* (active scope, decisions, blockers), not *every event* that produced it.
- **Strong:** screen's autodetach-on-hangup argues for the seal-on-SessionEnd model — disruption is the normal case, not the exceptional one. Stop hook firing every turn is the heartbeat that makes the seal robust.
- **Moderate:** Hibernation's "image ≤ ½ RAM" cost is a useful caution: a full state dump is expensive. Handoff is closer to "what would I tell tomorrow's me" — compressed semantic summary, not memory image.

---

## 6. IDE workspace patterns

### Patterns

**VSCode workspace state vs. user state vs. global state.** Workspace state lives in `.vscode/settings.json` or `<name>.code-workspace` (multi-root). User state is per-user, machine-wide. Global state is per-installation. Workspace settings *override* user settings. Restored across restart: open files, editor layout, settings, tasks, debug configs ([VSCode Docs: Workspaces](https://code.visualstudio.com/docs/editor/workspaces)). **Failure mode solved:** project-specific config polluting other projects.

**IntelliJ `.idea/workspace.xml` — user-specific, project-scoped, do-not-share.** workspace.xml stores "change list information, run configurations, updated run configuration templates, some Maven settings, breakpoints" plus window arrangement and layout ([JetBrains: Workspaces](https://www.jetbrains.com/help/idea/workspaces.html); [Baeldung: What Is the .idea Directory?](https://www.baeldung.com/intellij-idea-directory)). Explicitly excluded from version control by convention because it is user-specific. The `.idea` folder splits files into project-shareable (`vcs.xml`, `codeStyles/`) and user-specific (`workspace.xml`). **Failure mode solved:** sharing workstation-specific state across the team.

**Untitled-workspace persistence.** "Untitled workspaces are automatically maintained as `untitled.code-workspace` until explicitly saved" ([VSCode Docs: Workspaces](https://code.visualstudio.com/docs/editor/workspaces)). Even unnamed work survives. **Failure mode solved:** loss of in-progress organization that user hasn't yet committed to a name.

### Applicability to handoff-mx-cadre

- **Strong:** the IntelliJ project-shareable / user-specific split aligns with Cadre's gitignore doctrine (`.cadre/` and `CLAUDE.md` tracked; `*.local.md` / `*.local.json` gitignored). Handoff is *team-shareable* operational state — tracked, mergeable, not personal.
- **Strong:** "untitled workspace persistence" argues against requiring the user to name the handoff. The session always has a date; that's the auto-name. Don't gate persistence on a naming decision.
- **Moderate:** "what's restored is editor layout + open files + run configs" is *not* what belongs in handoff. Handoff is closer to a release-note / commit-message register at session scope, not workstation-state restoration. Useful boundary for what to exclude.

---

## Synthesis: applicable patterns

### Five patterns most directly applicable

1. **Two-phase session-end (LSP `shutdown` + `exit`).** The Stop hook firing per turn is the per-edit nudge (`didChange` analog); SessionEnd is the seal-then-terminate (`shutdown` + `exit`). This justifies why SessionEnd, not Stop, owns the seal. Stop is the heartbeat; SessionEnd is the commit. ([LSP 3.17 spec](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/))

2. **Daily-notes default-capture surface (Roam, Logseq, Obsidian).** Per-session file with date-based name, no taxonomy decision required at capture time, prior days remain in the vault and surface via references. This is the closest direct analog to handoff-mx's per-session-handoff model. The settled architecture already aligns; the lesson is to keep the file naming dumb and date-driven, not semantic. ([Roam guide](https://thesweetsetup.com/a-thorough-beginners-guide-to-roam-research/); [Logseq Journals](https://discuss.logseq.com/t/how-to-get-started-with-logseqs-journals-page/8432); [Obsidian Daily Notes](https://help.obsidian.md/plugins/daily-notes))

3. **Bury before suspend before delete — never delete (Anki).** Aging handoffs should *bury* (drop out of session-start surfacing window, still indexed) before *suspending/archiving* (move to `handoffs/archive/`), and *never delete*. Each step is reversible. ([Anki: Studying](https://docs.ankiweb.net/studying.html))

4. **Progressive disclosure on filesystem (Anthropic Skills).** Surfacing should layer: SessionStart shows a thin always-loaded summary (last session date, active branch, top-of-mind one-liner); the full handoff body loads only on read. This avoids context-window bloat from a fat handoff. ([Anthropic Agent Skills overview](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview); [engineering blog](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills))

5. **Recency decay + consolidation (CrewAI).** When a new handoff entry would near-duplicate the active one (same branch, scope unchanged, no decisions added), *consolidate* in place rather than accumulate a near-empty new entry. Older handoffs decay in surfacing weight; only the most recent N (e.g., 3) remain in the active surface. ([CrewAI Memory](https://docs.crewai.com/concepts/memory))

### Anti-patterns to avoid

1. **Auto-truncate under pressure (OpenAI Assistants).** Truncation discards the artifact when the context window pressures it. Handoff is durable record-of-session, not LLM-conversation buffer. *Archive, don't truncate.* If the live handoff grows unwieldy, the answer is session-end seal + new file, not in-place trimming. ([OpenAI threads](https://community.openai.com/t/clarifying-thread-persistence/497505))

2. **Workstation-state restoration (IntelliJ workspace.xml).** Don't store editor layout, open files, cursor positions, or other transient personal state. Cadre's handoff is team-shareable session-level operational state, parallel to release notes — not parallel to `workspace.xml`. The latter is explicitly user-specific and gitignored for good reason; copying its content model would muddy what handoff is for. ([JetBrains: Workspaces](https://www.jetbrains.com/help/idea/workspaces.html))

3. **Naming-gated capture (UI patterns that block until a title is given).** Per VSCode's `untitled.code-workspace` and Roam's empty-page-awaits, never block writes on the user choosing a name. Date is the auto-name. Slug is a later refinement. ([VSCode Workspaces](https://code.visualstudio.com/docs/editor/workspaces))

### Concrete recommendations for design choices

**Archive triggers.**
- Bury (drop from active surface, keep in main file/dir): handoff entries older than the most-recent-N (start with N=3; tune from retros).
- Suspend (move to archive subdirectory): on calendar boundary — e.g., end of week or month — buried entries roll into `.cadre/handoffs/archive/YYYY-MM/`. Reversible by file move.
- Delete: never. Per Cadre doctrine and Anki's bury/suspend/delete asymmetry, archive is the floor.

**Surfacing mechanism.**
- SessionStart hook reads the most recent live handoff entry (the one not yet sealed, or the most recent sealed one if no live entry exists) and prepends a compressed summary to the orchestrator's working context.
- Two-tier: always-loaded thin metadata (last date, active branch, top-of-mind), full body on `Read` of the handoff file. Mirrors Agent Skills levels 1–2.
- Don't surface the entire archive at start. Older entries surface only on explicit reference — analog to Roam's linked-references panel, deferred capability.

**Write cadence.**
- Live mutation: orchestrator-side, inline, as in-session events occur (per CLAUDE.md doctrine). No hook needed; doctrine handles it.
- Stop hook: fires per turn, simple "Update the handoff" reminder — engram-class discipline anchor.
- SessionEnd: hook seals the live entry (timestamp, marks complete) then the session terminates. Two-phase like LSP `shutdown` + `exit`.
- *Do not* tie writes to commits. Per-commit narrative belongs in commit messages; handoff is session-level.

**What belongs in handoff.**
- Session intent (what was the goal entering the session?).
- Decisions made and their rationale (especially deferred or "TBD" decisions — per CLAUDE.md, defer/TBD are achievements).
- Blockers, surfaced misalignments with intent, open trees in the orchestrator's "open tree" stack at session-end.
- Pointers (file paths, branch names, PR URLs) for fast recovery.
- The *why* of the session, not the *what* of every action.

**What does not belong in handoff.**
- Per-commit narrative — that's commit messages.
- Workstation state (cursor positions, open files, editor layout).
- Conversation transcript or chat-log dump — that's LLM-conversation buffer territory.
- Knowledge that should live in CLAUDE.md, skill files, or ADRs. If it's reusable doctrine, surface it to its proper home; handoff is session-ephemeral until sealed.

---

## Reference list

- Anki Manual. *Background.* [docs.ankiweb.net/background.html](https://docs.ankiweb.net/background.html)
- Anki Manual. *Deck Options.* [docs.ankiweb.net/deck-options.html](https://docs.ankiweb.net/deck-options.html)
- Anki Manual. *Studying.* [docs.ankiweb.net/studying.html](https://docs.ankiweb.net/studying.html)
- Anthropic. *Agent Skills overview.* Claude Documentation. [docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview](https://docs.anthropic.com/en/docs/agents-and-tools/agent-skills/overview)
- Anthropic Engineering. *Equipping agents for the real world with Agent Skills.* [anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- Baeldung. *What Is the .idea Directory?* [baeldung.com/intellij-idea-directory](https://www.baeldung.com/intellij-idea-directory)
- Bush, Vannevar. *As We May Think.* The Atlantic, July 1945. (Section 7 mirrored at) [w3.org/History/1945/vbush/vbush7.shtml](https://www.w3.org/History/1945/vbush/vbush7.shtml)
- CrewAI. *Memory.* [docs.crewai.com/concepts/memory](https://docs.crewai.com/concepts/memory)
- GNU Project. *GNU Screen User's Manual.* [gnu.org/software/screen/manual/screen.html](https://www.gnu.org/software/screen/manual/screen.html)
- JetBrains. *Workspaces (IntelliJ IDEA Documentation).* [jetbrains.com/help/idea/workspaces.html](https://www.jetbrains.com/help/idea/workspaces.html)
- LangChain. *LangGraph Persistence.* [docs.langchain.com/oss/python/langgraph/persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
- Linux Kernel Documentation. *swsusp.txt — Software Suspend.* [kernel.org/doc/Documentation/power/swsusp.txt](https://www.kernel.org/doc/Documentation/power/swsusp.txt)
- Logseq Discuss. *How to get started with Logseq's Journals page.* [discuss.logseq.com/t/how-to-get-started-with-logseqs-journals-page/8432](https://discuss.logseq.com/t/how-to-get-started-with-logseqs-journals-page/8432)
- Memorilabs. *AutoGen Multi-agent Conversations Memory.* [memorilabs.ai/blog/autogen-multi-agent-conversation-memory](https://memorilabs.ai/blog/autogen-multi-agent-conversation-memory)
- Microsoft. *Language Server Protocol Specification 3.17.* [microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification](https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/)
- Mosh project. *mosh: the mobile shell.* [mosh.org](https://mosh.org/)
- Obsidian. *Daily notes plugin.* [help.obsidian.md/plugins/daily-notes](https://help.obsidian.md/plugins/daily-notes)
- OpenAI Developer Community. *Clarifying Thread Persistence.* [community.openai.com/t/clarifying-thread-persistence/497505](https://community.openai.com/t/clarifying-thread-persistence/497505)
- Sweet Setup. *A Thorough Beginner's Guide to Roam Research.* [thesweetsetup.com/a-thorough-beginners-guide-to-roam-research](https://thesweetsetup.com/a-thorough-beginners-guide-to-roam-research/)
- tmux. *Manual page (man7.org).* [man7.org/linux/man-pages/man1/tmux.1.html](https://man7.org/linux/man-pages/man1/tmux.1.html)
- Visual Studio Code. *Workspaces.* [code.visualstudio.com/docs/editor/workspaces](https://code.visualstudio.com/docs/editor/workspaces)
- Wozniak, Piotr. *Algorithm SM-2 used in SuperMemo 2.0–4.0.* [super-memory.com/english/ol/sm2.htm](https://super-memory.com/english/ol/sm2.htm)
