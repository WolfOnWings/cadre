#!/usr/bin/env bun
// Cadre check: comment-density floor.
//
// Measures the FLOOR (under-documentation), opposite axis from Lipstyk's
// over-documentation rule (>45% density flagged as AI narration).
//
// Denominator: code_lines + comment_lines. Blank lines are EXCLUDED from
// both numerator and denominator (industry standard: SLOCCount, Halstead).
// A file with many blanks has the same ratio as the same file without blanks.

import { Glob } from "bun";

const MIN_RATIO = 0.10;

const SCOPE_GLOBS = [
  ".claude/hooks/**/*.ts",
  ".claude/agents/**/*.ts",
  ".claude/skills/**/*.ts",
  "scripts/**/*.ts",
];

const EXCLUDE_SUFFIXES = [".md", ".json", ".lockb", ".tsbuildinfo"];
const EXCLUDE_PREFIXES = [".cadre/test-fixtures/"];

interface FileStat {
  path: string;
  code: number;
  comment: number;
  ratio: number;
}

function classify(line: string, inBlockComment: boolean): { code: boolean; comment: boolean; nowInBlock: boolean } {
  const trimmed = line.trim();
  if (trimmed.length === 0) return { code: false, comment: false, nowInBlock: inBlockComment };

  if (inBlockComment) {
    if (trimmed.includes("*/")) {
      const after = trimmed.slice(trimmed.indexOf("*/") + 2).trim();
      const stillCode = after.length > 0 && !after.startsWith("//");
      return { code: stillCode, comment: true, nowInBlock: false };
    }
    return { code: false, comment: true, nowInBlock: true };
  }

  if (trimmed.startsWith("//")) return { code: false, comment: true, nowInBlock: false };

  if (trimmed.startsWith("/*")) {
    const closes = trimmed.includes("*/");
    if (closes) {
      const before = trimmed.slice(0, trimmed.indexOf("/*")).trim();
      const after = trimmed.slice(trimmed.indexOf("*/") + 2).trim();
      const hasCode = before.length > 0 || (after.length > 0 && !after.startsWith("//"));
      return { code: hasCode, comment: true, nowInBlock: false };
    }
    return { code: false, comment: true, nowInBlock: true };
  }

  const blockStart = trimmed.indexOf("/*");
  const lineCommentStart = trimmed.indexOf("//");
  const hasInlineComment = blockStart >= 0 || lineCommentStart >= 0;
  if (hasInlineComment) {
    return { code: true, comment: true, nowInBlock: blockStart >= 0 && !trimmed.includes("*/", blockStart + 2) };
  }

  return { code: true, comment: false, nowInBlock: false };
}

async function check_comment_ratio(): Promise<number> {
  const seen = new Set<string>();
  const stats: FileStat[] = [];

  for (const pattern of SCOPE_GLOBS) {
    const glob = new Glob(pattern);
    for await (const raw of glob.scan({ cwd: ".", onlyFiles: true, dot: true })) {
      const path = raw.replace(/\\/g, "/");
      if (seen.has(path)) continue;
      seen.add(path);

      if (EXCLUDE_SUFFIXES.some((s) => path.endsWith(s))) continue;
      if (EXCLUDE_PREFIXES.some((p) => path.startsWith(p))) continue;

      const text = await Bun.file(path).text();
      let code = 0;
      let comment = 0;
      let inBlock = false;
      for (const line of text.split("\n")) {
        const r = classify(line, inBlock);
        if (r.code) code++;
        if (r.comment) comment++;
        inBlock = r.nowInBlock;
      }

      if (code === 0) continue;
      const total = code + comment;
      const ratio = total === 0 ? 0 : comment / total;
      stats.push({ path, code, comment, ratio });
    }
  }

  const violations = stats.filter((s) => s.ratio < MIN_RATIO);

  if (violations.length > 0) {
    console.error(`check-comment-ratio: ${violations.length} file(s) below ${(MIN_RATIO * 100).toFixed(0)}%`);
    for (const v of violations) {
      const pct = (v.ratio * 100).toFixed(1);
      console.error(`  ${v.path}: ${pct}% (${v.comment} comment / ${v.code} code lines)`);
    }
    return 1;
  }

  console.log(`check-comment-ratio: ${stats.length} file(s) >= ${(MIN_RATIO * 100).toFixed(0)}%`);
  return 0;
}

process.exit(await check_comment_ratio());
