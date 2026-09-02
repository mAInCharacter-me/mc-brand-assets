#!/usr/bin/env node
// build-manifest.mjs — record every published asset with its SHA-256.
//
// Usage:
//   node scripts/build-manifest.mjs [--check] [--version 1.1.0]
//
// Writes manifest.json at the repo root. With --check, exits 1 if the
// committed manifest differs from what the working tree produces (CI guard).
// Detects SVGs that wrap a raster <image> so the manifest tells the truth
// about which files are true vectors. No dependencies. Node 18+.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { execSync } from "node:child_process";

const args = process.argv.slice(2);
const check = args.includes("--check");
const vIdx = args.indexOf("--version");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ASSET_DIRS = ["logo", "wordmark", "icon", "favicon", "header", "tokens", "marks"];
const ROOT_FILES = ["site.webmanifest"];

function git(cmd) {
  try {
    return execSync(`git ${cmd}`, { cwd: root, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
  } catch {
    return "";
  }
}

const version =
  vIdx >= 0 ? args[vIdx + 1] : git("describe --tags --abbrev=0") || "0.0.0-untagged";
const commit = git("rev-parse HEAD") || "unknown";

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p)));
    else out.push(p);
  }
  return out;
}

// Git normalizes these to LF on commit (see .gitattributes), so a Windows working tree can
// hold CRLF while the blob everyone downloads holds LF. Hash the canonical LF form, which is
// what a consumer actually receives from raw.githubusercontent or a release archive.
const TEXT_EXT = new Set([".svg", ".css", ".json", ".csv", ".html", ".md", ".webmanifest", ".txt", ".yml", ".yaml"]);

function canonical(rel, buf) {
  if (!TEXT_EXT.has(path.extname(rel).toLowerCase())) return buf;
  return Buffer.from(buf.toString("utf8").replace(/\r\n/g, "\n"), "utf8");
}

function kindOf(rel, buf) {
  const ext = path.extname(rel).toLowerCase();
  if (rel.startsWith("marks/") && ext === ".json") return "manifest";
  if (ext === ".svg") {
    const text = buf.toString("utf8");
    return /<\s*image\b/i.test(text) ? "raster-in-svg" : "vector";
  }
  if ([".png", ".ico", ".jpg", ".jpeg", ".webp"].includes(ext)) return "raster";
  if ([".css", ".json", ".csv", ".webmanifest"].includes(ext)) return "tokens";
  return "other";
}

const files = [];
for (const d of ASSET_DIRS) {
  for (const p of await walk(path.join(root, d))) {
    const rel = path.relative(root, p).split(path.sep).join("/");
    const raw = await fs.readFile(p);
    const buf = canonical(rel, raw);
    files.push({
      path: rel,
      bytes: buf.length,
      sha256: createHash("sha256").update(buf).digest("hex"),
      kind: kindOf(rel, buf),
    });
  }
}
for (const f of ROOT_FILES) {
  try {
    const buf = canonical(f, await fs.readFile(path.join(root, f)));
    files.push({ path: f, bytes: buf.length, sha256: createHash("sha256").update(buf).digest("hex"), kind: "tokens" });
  } catch {}
}
files.sort((a, b) => a.path.localeCompare(b.path));

const deprecated = files.filter((f) => f.kind === "raster-in-svg").map((f) => f.path);
for (const f of files) if (deprecated.includes(f.path)) f.deprecated = "raster wrapped in SVG; does not scale. Use icon/png at the size you need, or marks/mc-a-dot.svg once published.";

const summary = {};
for (const f of files) summary[f.kind] = (summary[f.kind] || 0) + 1;

const manifest = {
  name: "mc-brand-assets",
  title: "mAInCharacter public brand assets",
  version,
  commit,
  generated: new Date().toISOString().slice(0, 10),
  owner: "mAInCharacter Advisory LLC",
  license: "LICENSE.md (trademark permission, not an open-source license)",
  guidelines: "BRAND-GUIDELINES.md",
  verify:
    "Download a file, run sha256sum on it, and compare with the entry below. A file whose hash is not here is not an official mAInCharacter asset.",
  officialChannels: ["https://main-character.me", "https://github.com/mAInCharacter-me", "@main-character.me"],
  counts: summary,
  files,
};

const target = path.join(root, "manifest.json");
const next = JSON.stringify(manifest, null, 2) + "\n";

if (check) {
  let current = "";
  try {
    current = await fs.readFile(target, "utf8");
  } catch {}
  const strip = (s) => s.replace(/"generated": "[^"]*",?\n/, "").replace(/"commit": "[^"]*",?\n/, "").replace(/"version": "[^"]*",?\n/, "");
  if (strip(current) !== strip(next)) {
    console.error("manifest.json is stale. Run: node scripts/build-manifest.mjs");
    process.exit(1);
  }
  console.log(`manifest.json matches the working tree (${files.length} files).`);
  process.exit(0);
}

await fs.writeFile(target, next, "utf8");
console.log(`manifest.json written: ${files.length} files, version ${version}, commit ${commit.slice(0, 7)}`);
for (const [k, v] of Object.entries(summary)) console.log(`  ${String(v).padStart(3)}  ${k}`);
if (deprecated.length) console.log(`  ${deprecated.length} file(s) flagged deprecated (raster-in-svg)`);
