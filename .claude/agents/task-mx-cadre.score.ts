#!/usr/bin/env bun
// Cadre script: task-mx-cadre.score
// Invoked by: task-mx-cadre skill (orchestrator-side).
//
// Usage:
//   bun .claude/agents/task-mx-cadre.score.ts --render-only
//     Read Detail section + inbox/*; emit ranked JSON + rendered markdown. No file mutation.
//
//   bun .claude/agents/task-mx-cadre.score.ts --integrate
//     Read existing Detail + ALL inbox shards. Validate cycle-free (cycles → quarantine
//     implicated shards to inbox/.rejected/). Archive DONE entries to archive/<YYYY-MM>.md
//     and strip from Detail. Atomic-write .cadre/todos.md. Delete consumed shards.
//     Returns {ok, reason, warnings?} JSON.
//
// Algorithms:
//   - Polynomial scoring: urgency = Σ w_i · term_i(entry), Taskwarrior coefficients in
//     .cadre/task-mx/weights.json
//   - Kahn topological sort with cycle detection (cycle → reject implicated shards)
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
  mkdirSync,
} from "node:fs";
import { join } from "node:path";

const TODOS_PATH = ".cadre/todos.md";
const INBOX_DIR = ".cadre/task-mx/inbox";
const WEIGHTS_PATH = ".cadre/task-mx/weights.json";

type Status = "TODO" | "DOING" | "DONE";
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
  for (const rawLine of block.split("\n")) {
    const line = rawLine.replace(/\r$/, ""); // tolerate CRLF line endings (Windows)
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
      if (blocker.status === "DONE") continue; // resolved
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
  const ready = scored.filter((e) => !e.isBlocked && e.status === "TODO");
  ready.sort((a, b) => b.urgency - a.urgency);
  const blocked = scored.filter((e) => e.isBlocked && e.status === "TODO");
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
          try { renameSync(bak, path); } catch {
            // Restore is best-effort; original error wins.
          }
        }
        if (existsSync(tmp)) {
          try { unlinkSync(tmp); } catch {
            // Tmp cleanup is best-effort; original error wins.
          }
        }
        throw e;
      }
    } else {
      renameSync(tmp, path);
    }
  } else {
    renameSync(tmp, path);
  }
}

// ---------- Archive routing (DONE entries → archive/<YYYY-MM>.md) ----------

const ARCHIVE_DIR = ".cadre/task-mx/archive";
const REJECTED_DIR = ".cadre/task-mx/inbox/.rejected";

function archiveDoneEntries(doneEntries: Entry[]): number {
  if (doneEntries.length === 0) return 0;
  if (!existsSync(ARCHIVE_DIR)) mkdirSync(ARCHIVE_DIR, { recursive: true });
  const byMonth = new Map<string, string[]>();
  for (const e of doneEntries) {
    const monthKey = (e.closed ?? new Date().toISOString().slice(0, 10)).slice(0, 7);
    const block = renderArchiveEntry(e);
    if (!byMonth.has(monthKey)) byMonth.set(monthKey, []);
    byMonth.get(monthKey)!.push(block);
  }
  for (const [month, blocks] of byMonth) {
    const path = join(ARCHIVE_DIR, `${month}.md`);
    const existing = existsSync(path) ? readFileSync(path, "utf-8") : `# Archive ${month}\n\n`;
    const next = existing.replace(/\s*$/, "\n") + blocks.join("\n") + "\n";
    writeFileSync(path, next, "utf-8");
  }
  return doneEntries.length;
}

function renderArchiveEntry(e: Entry): string {
  return [
    `## ${e.id}. ${e.title}`,
    "",
    renderEntryFrontmatter(e),
    "",
    e.body.replace(/\n?<!-- urgency:[^>]*-->\n?/g, "").trim(),
    "",
  ].join("\n");
}

// ---------- Cycle quarantine ----------

function rejectShards(shardPaths: string[], reason: string): void {
  if (shardPaths.length === 0) return;
  if (!existsSync(REJECTED_DIR)) mkdirSync(REJECTED_DIR, { recursive: true });
  const ts = new Date().toISOString();
  for (const src of shardPaths) {
    const name = src.split(/[\\/]/).pop()!;
    const dest = join(REJECTED_DIR, name);
    const original = readFileSync(src, "utf-8");
    const header = `# REJECTED: ${reason} @ ${ts}\n\n`;
    writeFileSync(dest, header + original, "utf-8");
    unlinkSync(src);
  }
}

// ---------- Soft audit (warnings, non-blocking) ----------

interface AuditWarning {
  rule: "duplicate-title" | "orphan-blocker";
  detail: string;
}

function auditEntries(entries: Entry[]): AuditWarning[] {
  const warnings: AuditWarning[] = [];
  const ids = new Set(entries.map((e) => e.id));
  const titleMap = new Map<string, number[]>();
  for (const e of entries) {
    const key = e.title.trim().toLowerCase();
    if (!titleMap.has(key)) titleMap.set(key, []);
    titleMap.get(key)!.push(e.id);
    for (const b of e.blockers) {
      if (!ids.has(b)) {
        warnings.push({ rule: "orphan-blocker", detail: `#${e.id} → #${b} (no such entry)` });
      }
    }
  }
  for (const [title, dupIds] of titleMap) {
    if (dupIds.length > 1) {
      warnings.push({ rule: "duplicate-title", detail: `${dupIds.map((n) => `#${n}`).join(", ")}: "${title}"` });
    }
  }
  return warnings;
}

// ---------- CLI ----------

const args = process.argv.slice(2);
const cmd = args[0];

if (cmd !== "--render-only" && cmd !== "--integrate") {
  console.error(JSON.stringify({ ok: false, reason: "missing or unknown command (--render-only | --integrate)" }));
  process.exit(1);
}

const weights = loadWeights();
const detailEntries = readDetailEntries();
const shardEntries = readInboxShards();

// Merge: shard entries with same id replace detail entries; otherwise append.
const byId = new Map<number, Entry>();
for (const e of detailEntries) byId.set(e.id, e);
for (const e of shardEntries) byId.set(e.id, e);
const all = [...byId.values()];

const dag = buildDag(all);

if (dag.cycles && dag.cycles.length > 0) {
  const cyclePath = dag.cycles[0];
  const cycleIds = new Set(cyclePath);
  const cycleStr = cyclePath.map((n) => `#${n}`).join(" → ");
  // On --integrate, quarantine implicated shards. On --render-only, just report.
  if (cmd === "--integrate") {
    const implicatedShards = shardEntries
      .filter((e) => cycleIds.has(e.id) && e.shardPath)
      .map((e) => e.shardPath!);
    rejectShards(implicatedShards, `cycle ${cycleStr}`);
  }
  const result = {
    ok: false,
    reason: `cycle detected: ${cycleStr}${cmd === "--integrate" ? "; implicated shards quarantined" : ""}`,
    cycles: dag.cycles,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(2);
}

const warnings = auditEntries(all);
const blockedSet = new Set(dag.blocked);
const scored = all.map((e) =>
  scoreEntry(e, weights, blockedSet.has(e.id), dag.criticalPathLen.get(e.id) ?? 0),
);

if (cmd === "--render-only") {
  const indexMd = renderIndex(scored);
  const detailMd = renderDetail(scored.filter((s) => s.status !== "DONE"));
  const fullMd = indexMd + "\n" + detailMd;
  const result = {
    ok: true,
    mode: "render-only",
    ready: scored.filter((s) => !s.isBlocked && s.status === "TODO").length,
    blocked: scored.filter((s) => s.isBlocked && s.status === "TODO").length,
    in_progress: scored.filter((s) => s.status === "DOING").length,
    total: scored.length,
    warnings,
    rendered: fullMd,
  };
  console.log(JSON.stringify(result, null, 2));
  process.exit(0);
}

// --integrate: archive DONE → strip from board → atomic-write → cleanup shards
const doneEntries = all.filter((e) => e.status === "DONE");
const activeEntries = scored.filter((s) => s.status !== "DONE");
const archivedCount = archiveDoneEntries(doneEntries);

const indexMd = renderIndex(activeEntries);
const detailMd = renderDetail(activeEntries);
const fullMd = indexMd + "\n" + detailMd;

atomicWrite(TODOS_PATH, fullMd);

// Cleanup consumed shards.
let consumedCount = 0;
for (const e of shardEntries) {
  if (e.shardPath && existsSync(e.shardPath)) {
    try { unlinkSync(e.shardPath); consumedCount++; } catch {
      // Shard cleanup is best-effort; integration result still valid.
    }
  }
}

const ready = activeEntries.filter((s) => !s.isBlocked && s.status === "TODO").length;
const blocked = activeEntries.filter((s) => s.isBlocked && s.status === "TODO").length;
const inProgress = activeEntries.filter((s) => s.status === "DOING").length;
const warnSummary = warnings.length > 0 ? `; warnings=${warnings.length}` : "";
const result = {
  ok: true,
  mode: "integrate",
  reason: `integrated ${consumedCount} shard${consumedCount === 1 ? "" : "s"}; ready=${ready}, blocked=${blocked}, in-progress=${inProgress}, archived=${archivedCount}${warnSummary}`,
  ready,
  blocked,
  in_progress: inProgress,
  archived: archivedCount,
  total: activeEntries.length,
  warnings,
};
console.log(JSON.stringify(result, null, 2));
process.exit(0);
