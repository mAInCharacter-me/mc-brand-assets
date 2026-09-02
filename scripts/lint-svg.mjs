#!/usr/bin/env node
// lint-svg.mjs — refuse SVGs that can execute, phone home, or hide raster.
//
// Usage:
//   node scripts/lint-svg.mjs <file-or-dir> [...more] [--strict] [--allow-embedded-raster] [--quiet]
//
// Exit 1 on any FAIL. WARN never fails unless --strict is set.
// No dependencies. Works on Node 18+.

import { promises as fs } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith("--")));
const targets = args.filter((a) => !a.startsWith("--"));
const strict = flags.has("--strict");
const allowRaster = flags.has("--allow-embedded-raster");
const quiet = flags.has("--quiet");

if (targets.length === 0) {
  console.error("lint-svg: give at least one file or directory.");
  process.exit(2);
}

// Each rule: [id, severity, regex, message]
const RULES = [
  ["script", "FAIL", /<\s*script\b/i, "contains a <script> element"],
  ["handler", "FAIL", /\son[a-z]+\s*=/i, "contains an on* event handler attribute"],
  ["js-url", "FAIL", /javascript\s*:/i, "contains a javascript: URL"],
  ["foreign", "FAIL", /<\s*foreignObject\b/i, "contains <foreignObject> (arbitrary HTML)"],
  ["embed", "FAIL", /<\s*(iframe|embed|object|audio|video)\b/i, "contains an embedded document or media element"],
  ["entity", "FAIL", /<!ENTITY\b/i, "declares XML entities (XXE / expansion risk)"],
  ["ext-href", "FAIL", /(?:xlink:)?href\s*=\s*["']\s*(?:https?:)?\/\//i, "references an external URL"],
  ["ext-css", "FAIL", /@import\b|url\(\s*["']?\s*(?:https?:)?\/\//i, "stylesheet pulls an external resource"],
  ["raster", allowRaster ? "INFO" : "WARN", /<\s*image\b/i, "wraps a raster <image> (not a true vector)"],
  ["viewbox", "WARN", /^(?![\s\S]*\bviewBox\s*=)/i, "has no viewBox (will not scale predictably)"],
  ["a11y", "WARN", /^(?![\s\S]*(role\s*=\s*["']img["']|<\s*title\b))/i, "has neither role=img nor <title>"],
];

async function walk(p) {
  let st;
  try {
    st = await fs.stat(p);
  } catch (e) {
    if (e.code === "ENOENT") return []; // a folder that does not exist yet is not a failure
    throw e;
  }
  if (st.isFile()) return p.toLowerCase().endsWith(".svg") ? [p] : [];
  const out = [];
  for (const e of await fs.readdir(p, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".git")) continue;
    out.push(...(await walk(path.join(p, e.name))));
  }
  return out;
}

const files = (await Promise.all(targets.map(walk))).flat().sort();
if (files.length === 0) {
  console.error("lint-svg: no .svg files found under", targets.join(", "));
  process.exit(2);
}

let fails = 0;
let warns = 0;
const rows = [];

for (const f of files) {
  const text = await fs.readFile(f, "utf8");
  const hits = [];
  for (const [id, sev, re, msg] of RULES) {
    if (re.test(text)) {
      hits.push({ id, sev, msg });
      if (sev === "FAIL") fails++;
      if (sev === "WARN") warns++;
    }
  }
  rows.push({ file: f, bytes: Buffer.byteLength(text), hits });
}

if (!quiet) {
  for (const r of rows) {
    const status = r.hits.some((h) => h.sev === "FAIL")
      ? "FAIL"
      : r.hits.some((h) => h.sev === "WARN")
        ? "WARN"
        : "ok";
    const detail = r.hits.map((h) => `${h.sev.toLowerCase()}:${h.id}`).join(" ");
    console.log(`${status.padEnd(4)}  ${String(r.bytes).padStart(7)} B  ${r.file}  ${detail}`);
  }
}

console.log(
  `\nlint-svg: ${files.length} files, ${fails} fail, ${warns} warn` +
    (strict ? " (strict: warnings fail)" : ""),
);

for (const r of rows) {
  for (const h of r.hits) {
    if (h.sev === "FAIL" || (strict && h.sev === "WARN")) {
      console.log(`  ${r.file}: ${h.msg}`);
    }
  }
}

process.exit(fails > 0 || (strict && warns > 0) ? 1 : 0);
