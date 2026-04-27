#!/usr/bin/env bun
// Cadre script: task-mx-cadre.score
// Invoked by: task-mx-cadre subagent (steady-state) or orchestrator (--render-only / --migrate-dry-run)
//
// Usage:
//   bun .claude/agents/task-mx-cadre.score.ts --render-only
//     Read Detail section + inbox/*; emit ranked JSON + rendered Index. No file mutation.
//
//   bun .claude/agents/task-mx-cadre.score.ts --integrate <shard-path>
//     Read existing Detail + the named shard; validate cycle-free; merge entry; regenerate Index;
//     atomic-write .cadre/todos.md. Returns {ok, reason} JSON.
//
//   bun .claude/agents/task-mx-cadre.score.ts --migrate-dry-run
//     Read existing .cadre/todos.md (assumed legacy/no-frontmatter); emit inferred frontmatter
//     per entry as a structured diff to stdout. NO file mutation.
//
// Algorithms:
//   - Polynomial scoring: urgency = Σ w_i · term_i(entry), Taskwarrior coefficients in
//     .cadre/task-mx/weights.json
//   - Kahn topological sort with cycle detection (refuses on cycle, returns the cycle path)
//   - Critical-path-length DP over the unblocked DAG for ready-set boost
//   - Three-section Index render: ## Ready / ## Blocked / ## In Progress (markdown tables)
//
// Atomic write on Windows: two-step rename (dest → dest.bak; tmp → dest; unlink bak).

import {
  readFileSync,
  writeFileSync,
  readdirSync,
  existsSync,
  unlinkSync,
  renameSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

const TODOS_PATH = ".cadre/todos.md";
const INBOX_DIR = ".cadre/task-mx/inbox";
const WEIGHTS_PATH = ".cadre/task-mx/weights.json";

type Status = "TODO" | "DOING" | "DONE" | "DEFERRED" | "SUPERSEDED";
type Priority = "H" | "M" | "L" | null;

interface Entry {
  id: number;
  title: string;
  status: Status;
  priority: Priority;
  due: string | null; // ISO date
  scheduled: string | null;
  blockers: number[];
  blocking: number[]; // derived
  tags: string[];
  project: string | null;
  impact: number | null;
  effort: number | null;
  created: string | null;
  updated: string | null;
  closed: string | null;
  body: string; // prose body (everything after the YAML block until next ## heading)
  source: "detail" | "shard"; // where it came from
  shardPath?: string;
}

interface Weights {
  next: number;
  due: number;
  blocking: number;
  priority_h: number;
  priority_m: number;
  priority_l: number;
  scheduled: number;
  active: number;
  age: number;
  age_cap_days: number;
  tags: number;
  annotations: number;
  project: number;
  waiting: number;
  blocked: number;
}

interface ScoredEntry extends Entry {
  urgency: number;
  termBreakdown: Record<string, number>;
  isBlocked: boolean;
}

// ---------- YAML frontmatter parsing (minimal, hand-rolled) ----------

// Matches a YAML frontmatter block anywhere in the input. Multiline mode so `^` finds
// "---" at the start of any line (not just the file start), supporting per-entry blocks
// within the Detail section. Captures group 1 = YAML body between the fences.
const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*(?:\n|$)/m;

function parseYaml(block: string): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const line of block.split("\n")) {
    const m = line.match(/^(\w+):\s*(.*)$/);
    if (!m) continue;
    const [, key, rawVal] = m;
    const val = rawVal.trim();
    if (val === "" || val === "null" || val === "?") {
      out[key] = null;
    } else if (val === "true") {
      out[key] = true;
    } else if (val === "false") {
      out[key] = false;
    } else if (/^-?\d+(\.\d+)?$/.test(val)) {
      out[key] = parseFloat(val);
    } else if (val.startsWith("[") && val.endsWith("]")) {
      const inner = val.slice(1, -1).trim();
      if (inner === "") {
        out[key] = [];
      } else {
        out[key] = inner.split(",").map((s) => {
          const t = s.trim().replace(/^["']|["']$/g, "");
          if (/^-?\d+$/.test(t)) return parseInt(t, 10);
          return t;
        });
      }
    } else {
      // strip surrounding quotes
      out[key] = val.replace(/^["']|["']$/g, "");
    }
  }
  return out;
}

function parseEntry(yamlBlock: string, body: string, source: "detail" | "shard", shardPath?: string): Entry | null {
  const fm = parseYaml(yamlBlock);
  if (typeof fm.id !== "number") return null;
  const blockersRaw = fm.blockers as unknown;
  const blockers = Array.isArray(blockersRaw)
    ? (blockersRaw as unknown[]).map((b) => (typeof b === "number" ? b : parseInt(String(b), 10))).filter((n) => !isNaN(n))
    : [];
  const tagsRaw = fm.tags as unknown;
  const tags = Array.isArray(tagsRaw) ? (tagsRaw as unknown[]).map((t) => String(t)) : [];
  return {
    id: fm.id as number,
    title: (fm.title as string) ?? "",
    status: (fm.status as Status) ?? "TODO",
    priority: (fm.priority as Priority) ?? null,
    due: (fm.due as string) ?? null,
    scheduled: (fm.scheduled as string) ?? null,
    blockers,
    blocking: [], // filled later
    tags,
    project: (fm.project as string) ?? null,
    impact: (fm.impact as number) ?? null,
    effort: (fm.effort as number) ?? null,
    created: (fm.created as string) ?? null,
    updated: (fm.updated as string) ?? null,
    closed: (fm.closed as string) ?? null,
    body,
    source,
    shardPath,
  };
}

// ---------- Detail section parsing ----------

function readDetailEntries(): Entry[] {
  if (!existsSync(TODOS_PATH)) return [];
  const raw = readFileSync(TODOS_PATH, "utf-8");
  const detailMatch = raw.match(/^# Detail\s*\n([\s\S]*)$/m);
  const section = detailMatch ? detailMatch[1] : raw; // tolerate pre-migration files (no Index yet)

  // Split on "## NN. ..." headings; for each chunk extract the first frontmatter block + body.
  const entries: Entry[] = [];
  const headingRe = /^## (\d+)\.\s+(.*)$/gm;
  const matches = [...section.matchAll(headingRe)];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : section.length;
    const chunk = section.slice(start, end);
    const fmMatch = chunk.match(FRONTMATTER_RE);
    if (!fmMatch) continue; // legacy entry with no frontmatter — skipped at scoring time, surfaced by migration tool
    const yamlBlock = fmMatch[1];
    const body = chunk.slice(fmMatch[0].length + chunk.indexOf(fmMatch[0])).trim();
    const entry = parseEntry(yamlBlock, body, "detail");
    if (entry) entries.push(entry);
  }
  return entries;
}

function readInboxShards(): Entry[] {
  if (!existsSync(INBOX_DIR)) return [];
  const files = readdirSync(INBOX_DIR)
    .filter((f) => f.endsWith(".md"))
    .map((f) => join(INBOX_DIR, f))
    .filter((p) => statSync(p).isFile());
  const entries: Entry[] = [];
  for (const path of files) {
    const raw = readFileSync(path, "utf-8");
    const fmMatch = raw.match(FRONTMATTER_RE);
    if (!fmMatch) continue;
    const body = raw.slice(fmMatch[0].length).trim();
    const entry = parseEntry(fmMatch[1], body, "shard", path);
    if (entry) entries.push(entry);
  }
  return entries;
}

// ---------- DAG: topological sort + cycle detection + critical path ----------

interface DagResult {
  ready: number[]; // unblocked, topo-sorted
  blocked: number[];
  cycles: number[][] | null;
  criticalPathLen: Map<number, number>; // longest downstream path from each node
}

function buildDag(entries: Entry[]): DagResult {
  const ids = new Set(entries.map((e) => e.id));
  const incoming = new Map<number, Set<number>>(); // id → set of blockers (ignoring missing/closed)
  const outgoing = new Map<number, Set<number>>(); // id → set of blocked-by-this
  for (const e of entries) {
    incoming.set(e.id, new Set());
    outgoing.set(e.id, new Set());
  }
  for (const e of entries) {
    for (const b of e.blockers) {
      if (!ids.has(b)) continue; // orphan blocker; surfaced by self-critique watchlist
      const blocker = entries.find((x) => x.id === b)!;
      if (blocker.status === "DONE" || blocker.status === "SUPERSEDED") continue; // resolved
      incoming.get(e.id)!.add(b);
      outgoing.get(b)!.add(e.id);
    }
  }

  // Populate derived `blocking` field on each entry.
  for (const e of entries) {
    e.blocking = [...(outgoing.get(e.id) ?? new Set())];
  }

  // Initial in-degree snapshot (before Kahn mutates).
  const initialInDeg = new Map<number, number>();
  for (const [id, set] of incoming) initialInDeg.set(id, set.size);

  // Ready-set: entries with zero unresolved blockers RIGHT NOW.
  const ready = entries.filter((e) => (initialInDeg.get(e.id) ?? 0) === 0).map((e) => e.id);
  const blocked = entries.filter((e) => (initialInDeg.get(e.id) ?? 0) > 0).map((e) => e.id);

  // Kahn's algorithm: produce a topological order so we can run critical-path DP.
  const inDeg = new Map<number, number>(initialInDeg);
  const topoQueue: number[] = [...ready];
  const topoOrder: number[] = [];
  while (topoQueue.length > 0) {
    const id = topoQueue.shift()!;
    topoOrder.push(id);
    for (const next of outgoing.get(id) ?? []) {
      inDeg.set(next, (inDeg.get(next) ?? 0) - 1);
      if ((inDeg.get(next) ?? 0) === 0) topoQueue.push(next);
    }
  }

  // Cycle detection: if Kahn didn't visit every node, there's a cycle in the unvisited subgraph.
  let cycles: number[][] | null = null;
  if (topoOrder.length !== entries.length) {
    cycles = findCycles(entries, incoming, outgoing);
  }

  // Critical path: longest downstream chain length from each node. DP on reverse topo order.
  const cpLen = new Map<number, number>();
  for (const id of [...topoOrder].reverse()) {
    let max = 0;
    for (const next of outgoing.get(id) ?? []) {
      const lenNext = cpLen.get(next) ?? 0;
      if (lenNext + 1 > max) max = lenNext + 1;
    }
    cpLen.set(id, max);
  }

  return { ready, blocked, cycles, criticalPathLen: cpLen };
}

function findCycles(entries: Entry[], incoming: Map<number, Set<number>>, outgoing: Map<number, Set<number>>): number[][] {
  // DFS with white/gray/black coloring; report first cycle found per component.
  const cycles: number[][] = [];
  const color = new Map<number, "W" | "G" | "B">();
  for (const e of entries) color.set(e.id, "W");
  const stack: number[] = [];

  function visit(id: number): boolean {
    color.set(id, "G");
    stack.push(id);
    for (const next of outgoing.get(id) ?? []) {
      if (color.get(next) === "G") {
        const start = stack.indexOf(next);
        cycles.push(stack.slice(start).concat(next));
        return true;
      }
      if (color.get(next) === "W" && visit(next)) return true;
    }
    stack.pop();
    color.set(id, "B");
    return false;
  }

  for (const e of entries) {
    if (color.get(e.id) === "W") visit(e.id);
  }
  return cycles;
}

// ---------- Polynomial scoring ----------

function loadWeights(): Weights {
  const raw = JSON.parse(readFileSync(WEIGHTS_PATH, "utf-8")) as Weights & { _comment?: string };
  return raw;
}

function dueCloseness(due: string | null): number {
  if (!due) return 0;
  const days = (new Date(due).getTime() - Date.now()) / 86_400_000;
  // Taskwarrior approximation: -7 days = 1.0, +7 days = 0.0, linear, clamped.
  if (days <= -7) return 1.0;
  if (days >= 14) return 0.0;
  return (14 - days) / 21;
}

function priorityTerm(p: Priority, w: Weights): number {
  if (p === "H") return w.priority_h;
  if (p === "M") return w.priority_m;
  if (p === "L") return w.priority_l;
  return 0;
}

function ageTerm(created: string | null, w: Weights): number {
  if (!created) return 0;
  const days = (Date.now() - new Date(created).getTime()) / 86_400_000;
  if (days < 0) return 0;
  return Math.min(days, w.age_cap_days) / w.age_cap_days;
}

function scoreEntry(e: Entry, w: Weights, isBlocked: boolean, cpBoost: number): ScoredEntry {
  const terms: Record<string, number> = {};
  if (e.due) terms.due = w.due * dueCloseness(e.due);
  if (e.blocking.length > 0) terms.blocking = w.blocking * e.blocking.length;
  const pri = priorityTerm(e.priority, w);
  if (pri !== 0) terms.priority = pri;
  if (e.scheduled) terms.scheduled = w.scheduled;
  if (e.status === "DOING") terms.active = w.active;
  if (e.created) terms.age = w.age * ageTerm(e.created, w);
  if (e.tags.length > 0) terms.tags = w.tags;
  if (e.project) terms.project = w.project;
  if (e.status === "DEFERRED") terms.waiting = w.waiting;
  if (isBlocked) terms.blocked = w.blocked;
  if (cpBoost > 0) terms.critical_path = cpBoost; // boost = number of downstream blockees on the critical path
  const urgency = Object.values(terms).reduce((a, b) => a + b, 0);
  return { ...e, urgency, termBreakdown: terms, isBlocked };
}

function termComment(scored: ScoredEntry): string {
  const parts = Object.entries(scored.termBreakdown).map(([k, v]) => `${k}=${v.toFixed(2)}`);
  return `<!-- urgency: ${parts.join("; ")}; total=${scored.urgency.toFixed(2)} -->`;
}

// ---------- Index render ----------

function renderTable(rows: ScoredEntry[], blockerCol: "blocks" | "blocked-by"): string {
  const header = `| # | title | urgency | ${blockerCol} | tags |\n|---|-------|---------|${"-".repeat(blockerCol.length + 2)}|------|`;
  if (rows.length === 0) return header + "\n| _(none)_ | | | | |";
  const body = rows
    .map((e) => {
      const refs = blockerCol === "blocks" ? e.blocking : e.blockers;
      const refStr = refs.length === 0 ? "—" : refs.map((n) => `#${n}`).join(", ");
      const tagStr = e.tags.length === 0 ? "—" : e.tags.join(", ");
      return `| ${e.id} | ${e.title} | ${e.urgency.toFixed(2)} | ${refStr} | ${tagStr} |`;
    })
    .join("\n");
  return header + "\n" + body;
}

function renderIndex(scored: ScoredEntry[]): string {
  const ready = scored.filter((e) => !e.isBlocked && e.status !== "DOING" && e.status !== "DONE" && e.status !== "SUPERSEDED");
  ready.sort((a, b) => b.urgency - a.urgency);
  const blocked = scored.filter((e) => e.isBlocked && e.status !== "DONE" && e.status !== "SUPERSEDED");
  blocked.sort((a, b) => b.urgency - a.urgency);
  const inProgress = scored.filter((e) => e.status === "DOING");
  inProgress.sort((a, b) => b.urgency - a.urgency);

  return [
    "# Index",
    "",
    "_Generated by `task-mx-cadre.score.ts`. Do not edit by hand — edit the Detail section and let task-mx regenerate._",
    "",
    "## Ready",
    "",
    renderTable(ready, "blocks"),
    "",
    "## Blocked",
    "",
    renderTable(blocked, "blocked-by"),
    "",
    "## In Progress",
    "",
    renderTable(inProgress, "blocks"),
    "",
  ].join("\n");
}

// ---------- Detail section render (preserves prose bodies, refreshes term-breakdown comment) ----------

function renderEntryFrontmatter(e: Entry): string {
  const fmt = (v: unknown): string => {
    if (v === null || v === undefined) return "null";
    if (Array.isArray(v)) return `[${v.map((x) => (typeof x === "number" ? x : `${x}`)).join(", ")}]`;
    if (typeof v === "string" && (v.includes(":") || v.includes("#"))) return `"${v}"`;
    return String(v);
  };
  return [
    "---",
    `id: ${e.id}`,
    `title: ${fmt(e.title)}`,
    `status: ${e.status}`,
    `priority: ${e.priority ?? "null"}`,
    `due: ${fmt(e.due)}`,
    `scheduled: ${fmt(e.scheduled)}`,
    `blockers: ${fmt(e.blockers)}`,
    `tags: ${fmt(e.tags)}`,
    `project: ${fmt(e.project)}`,
    `impact: ${e.impact ?? "null"}`,
    `effort: ${e.effort ?? "null"}`,
    `created: ${fmt(e.created)}`,
    `updated: ${fmt(e.updated)}`,
    `closed: ${fmt(e.closed)}`,
    "---",
  ].join("\n");
}

function renderDetailEntry(scored: ScoredEntry): string {
  // Strip any existing urgency comment from body, then append fresh one.
  const cleanBody = scored.body.replace(/\n?<!-- urgency:[^>]*-->\n?/g, "").trim();
  return [
    `## ${scored.id}. ${scored.title}`,
    "",
    renderEntryFrontmatter(scored),
    "",
    cleanBody,
    "",
    termComment(scored),
    "",
  ].join("\n");
}

function renderDetail(scored: ScoredEntry[]): string {
  const sorted = [...scored].sort((a, b) => a.id - b.id);
  return ["# Detail", "", ...sorted.map(renderDetailEntry)].join("\n");
}

// ---------- Atomic write (Windows-aware) ----------

function atomicWrite(path: string, content: string): void {
  const tmp = path + ".tmp";
  writeFileSync(tmp, content, "utf-8");
  if (process.platform === "win32") {
    if (existsSync(path)) {
      const bak = path + ".bak";
      try {
        renameSync(path, bak);
        renameSync(tmp, path);
        unlinkSync(bak);
      } catch (e) {
        // Cleanup on failure: try to restore .bak if it exists.
        if (existsSync(bak) && !existsSync(path)) {
          try { renameSync(bak, path); } catch {}
        }
        if (existsSync(tmp)) { try { unlinkSync(tmp); } catch {} }
        throw e;
      }
    } else {
      renameSync(tmp, path);
    }
  } else {
    renameSync(tmp, path);
  }
}

// ---------- Migration dry-run (heuristic frontmatter inference for legacy entries) ----------

interface LegacyEntry {
  id: number;
  title: string;
  rawProse: string;
  inferredFrontmatter: Partial<Entry> & { ambiguous: string[] };
}

function readLegacyTodosForMigration(): LegacyEntry[] {
  if (!existsSync(TODOS_PATH)) return [];
  const raw = readFileSync(TODOS_PATH, "utf-8");
  const headingRe = /^## (\d+)\.\s+(.*)$/gm;
  const matches = [...raw.matchAll(headingRe)];
  const entries: LegacyEntry[] = [];
  for (let i = 0; i < matches.length; i++) {
    const m = matches[i];
    const start = m.index!;
    const end = i + 1 < matches.length ? matches[i + 1].index! : raw.length;
    const id = parseInt(m[1], 10);
    const title = m[2].trim();
    const rawProse = raw.slice(start, end);

    // Skip if already has frontmatter (re-running migration is a no-op for new-format entries).
    if (rawProse.match(FRONTMATTER_RE)) continue;

    // Heuristic inference.
    const inferred: Partial<Entry> & { ambiguous: string[] } = {
      ambiguous: [],
    };

    // Status detection: catch both "DONE (date)" and "DONE — modifier (date)" variants.
    // Order matters: SUPERSEDED takes precedence over DONE.
    const statusSupersededM = rawProse.match(/\*\*Status:\s*(?:SUPERSEDED\s*\((\d{4}-\d{2}-\d{2})\)|DONE\s+[—-]\s*superseded\s*\((\d{4}-\d{2}-\d{2})\))/i);
    const statusDoneM = rawProse.match(/\*\*Status:\s*DONE(?:\s+[—-]\s*[\w-]+)?\s*\((\d{4}-\d{2}-\d{2})\)/i);
    const statusDeferredM = rawProse.match(/\*\*Status:\s*DEFERRED\s*\((\d{4}-\d{2}-\d{2})\)/i);

    if (statusSupersededM) {
      inferred.status = "SUPERSEDED";
      inferred.closed = statusSupersededM[1] ?? statusSupersededM[2];
    } else if (statusDoneM) {
      inferred.status = "DONE";
      inferred.closed = statusDoneM[1];
    } else if (statusDeferredM) {
      inferred.status = "DEFERRED";
      inferred.closed = statusDeferredM[1];
    } else {
      inferred.status = "TODO";
    }

    inferred.id = id;
    inferred.title = title;
    inferred.priority = null; inferred.ambiguous.push("priority");
    inferred.due = null;
    inferred.scheduled = null;
    inferred.blockers = []; if (rawProse.match(/Open dependencies:/i)) inferred.ambiguous.push("blockers");
    inferred.tags = [];
    inferred.project = "cadre";
    inferred.impact = null; inferred.ambiguous.push("impact");
    inferred.effort = null; inferred.ambiguous.push("effort");
    inferred.created = null; inferred.ambiguous.push("created");
    inferred.updated = "2026-04-27";

    entries.push({ id, title, rawProse, inferredFrontmatter: inferred });
  }
  return entries;
}

// ---------- CLI ----------

const args = process.argv.slice(2);
const cmd = args[0];

if (!cmd) {
  console.error(JSON.stringify({ ok: false, reason: "missing command (--render-only | --integrate <shard> | --migrate-dry-run)" }));
  process.exit(1);
}

if (cmd === "--migrate-dry-run") {
  const legacy = readLegacyTodosForMigration();
  const result = {
    ok: true,
    mode: "migrate-dry-run",
    count: legacy.length,
    entries: legacy.map((l) => ({
      id: l.id,
      title: l.title,
      inferred_frontmatter: l.inferredFrontmatter,
      ambiguous_fields: l.inferredFrontmatter.ambiguous,
    })),
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

if (cmd === "--render-only" || cmd === "--integrate") {
  const weights = loadWeights();
  const detailEntries = readDetailEntries();
  const shardEntries = cmd === "--integrate" && args[1] ? readSingleShard(args[1]) : readInboxShards();

  // Merge: shard entries with same id replace detail entries; otherwise append.
  const byId = new Map<number, Entry>();
  for (const e of detailEntries) byId.set(e.id, e);
  for (const e of shardEntries) byId.set(e.id, e);
  const all = [...byId.values()];

  const dag = buildDag(all);

  if (dag.cycles && dag.cycles.length > 0) {
    const result = {
      ok: false,
      reason: `cycle detected: ${dag.cycles[0].map((n) => `#${n}`).join(" → ")}`,
      cycles: dag.cycles,
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(2);
  }

  const blockedSet = new Set(dag.blocked);
  const scored = all.map((e) =>
    scoreEntry(e, weights, blockedSet.has(e.id), dag.criticalPathLen.get(e.id) ?? 0),
  );

  const indexMd = renderIndex(scored);
  const detailMd = renderDetail(scored);
  const fullMd = indexMd + "\n" + detailMd;

  if (cmd === "--render-only") {
    const result = {
      ok: true,
      mode: "render-only",
      ready: scored.filter((s) => !s.isBlocked && s.status !== "DOING" && s.status !== "DONE" && s.status !== "SUPERSEDED").length,
      blocked: scored.filter((s) => s.isBlocked && s.status !== "DONE" && s.status !== "SUPERSEDED").length,
      in_progress: scored.filter((s) => s.status === "DOING").length,
      total: scored.length,
      rendered: fullMd,
    };
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  }

  // --integrate: atomic write
  atomicWrite(TODOS_PATH, fullMd);
  const result = {
    ok: true,
    mode: "integrate",
    ready: scored.filter((s) => !s.isBlocked && s.status !== "DOING" && s.status !== "DONE" && s.status !== "SUPERSEDED").length,
    blocked: scored.filter((s) => s.isBlocked && s.status !== "DONE" && s.status !== "SUPERSEDED").length,
    in_progress: scored.filter((s) => s.status === "DOING").length,
    total: scored.length,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

console.error(JSON.stringify({ ok: false, reason: `unknown command: ${cmd}` }));
process.exit(1);

function readSingleShard(path: string): Entry[] {
  if (!existsSync(path)) return [];
  const raw = readFileSync(path, "utf-8");
  const fmMatch = raw.match(FRONTMATTER_RE);
  if (!fmMatch) return [];
  const body = raw.slice(fmMatch[0].length).trim();
  const e = parseEntry(fmMatch[1], body, "shard", path);
  return e ? [e] : [];
}
