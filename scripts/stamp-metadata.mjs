#!/usr/bin/env node
// stamp-metadata.mjs — write ownership, license and origin into every asset file itself,
// so a file that travels away from this repository still says whose it is.
//
// Usage:
//   node scripts/stamp-metadata.mjs            # stamp every asset in place
//   node scripts/stamp-metadata.mjs --check    # exit 1 if any asset is unstamped (CI guard)
//   node scripts/stamp-metadata.mjs --quiet
//
// SVG  — an XML comment header, <title>/<desc>, and an RDF/Dublin Core <metadata> block.
//        Human-readable in "view source", machine-readable to anything that parses RDF.
// PNG  — tEXt chunks (Title, Author, Copyright, Source, Comment, Software) that Windows
//        Explorer, macOS Preview, ImageMagick and exiftool all read, plus one iTXt chunk
//        carrying XMP so Adobe and Lightroom show the rights fields.
//
// Pixels and vector geometry are never touched. Chunks go between IHDR and the first IDAT.
// Re-running replaces the previous stamp rather than appending a second one.
//
// This is provenance, not protection. Any of it can be stripped by someone who wants to
// strip it. Its jobs are: an honest recipient can see the terms, a careless reuse carries
// the notice with it, and a stripped file is evidence of intent. The cryptographic answer
// is manifest.json, which records the SHA-256 of every file here.
//
// No dependencies. Node 18+.

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);
const check = args.includes("--check");
const quiet = args.includes("--quiet");
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const YEAR = 2026;
const OWNER = "mAInCharacter Advisory LLC";
const BRAND = "mAInCharacter";
const SITE = "https://main-character.me";
const REPO = "https://github.com/mAInCharacter-me/mc-brand-assets";
const LICENSE_URL = `${REPO}/blob/main/LICENSE.md`;
const GUIDELINES_URL = `${REPO}/blob/main/BRAND-GUIDELINES.md`;
const RIGHTS = `© ${YEAR} ${OWNER}. All rights reserved. Trademark. Not an open-source or Creative Commons license.`;
const TERMS =
  "Use unmodified to refer to mAInCharacter truthfully. Do not alter, recolor, combine with other marks, " +
  "use as your own identity, imply endorsement, or use in training data. Permission: geeks@main-character.me.";

const DIRS = ["logo", "wordmark", "icon", "favicon", "header", "marks"];

// ---------------------------------------------------------------- naming

function describe(rel) {
  const base = path.basename(rel);
  if (/wordmark-main/.test(base)) return `${BRAND} wordmark component: mAIn`;
  if (/wordmark-character/.test(base)) return `${BRAND} wordmark component: CHARACTER`;
  if (/profile/.test(base)) return `${BRAND} circle-safe profile mark`;
  if (/stacked/.test(base)) return `${BRAND} stacked A-dot icon`;
  if (/og-image/.test(base)) return `${BRAND} social preview card`;
  if (/apple-touch|web-app|favicon/.test(base)) return `${BRAND} A-dot app icon`;
  if (/header/.test(base)) return `${BRAND} header lockup`;
  if (/icon|a-dot/.test(base)) return `${BRAND} A-dot icon`;
  if (/logo/.test(base)) return `${BRAND} primary horizontal lockup`;
  return `${BRAND} brand asset`;
}

// ---------------------------------------------------------------- SVG

const SVG_OPEN = "<!-- mc:stamp -->";
const SVG_CLOSE = "<!-- /mc:stamp -->";

function svgStamp(rel) {
  const title = describe(rel);
  return `${SVG_OPEN}
  <title>${title}</title>
  <desc>${title}. ${RIGHTS} Terms: ${LICENSE_URL} Guidelines: ${GUIDELINES_URL} Origin: ${SITE}</desc>
  <metadata>
    <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
             xmlns:dc="http://purl.org/dc/elements/1.1/"
             xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/">
      <rdf:Description rdf:about="${SITE}">
        <dc:title>${title}</dc:title>
        <dc:creator>${OWNER}</dc:creator>
        <dc:publisher>${OWNER}</dc:publisher>
        <dc:rights>${RIGHTS}</dc:rights>
        <dc:type>Trademark</dc:type>
        <dc:source>${SITE}</dc:source>
        <dc:identifier>${REPO}/blob/main/${rel}</dc:identifier>
        <xmpRights:Marked>True</xmpRights:Marked>
        <xmpRights:Owner>${OWNER}</xmpRights:Owner>
        <xmpRights:WebStatement>${LICENSE_URL}</xmpRights:WebStatement>
        <xmpRights:UsageTerms>${TERMS}</xmpRights:UsageTerms>
      </rdf:Description>
    </rdf:RDF>
  </metadata>
  ${SVG_CLOSE}`;
}

function stampSvg(text, rel) {
  // Drop any previous stamp, and any pre-existing bare <title>/<desc> the stamp replaces.
  let out = text.replace(
    new RegExp(`${SVG_OPEN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${SVG_CLOSE.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*`, "g"),
    "",
  );
  out = out.replace(/<title\b[^>]*>[\s\S]*?<\/title>\s*/gi, "").replace(/<desc\b[^>]*>[\s\S]*?<\/desc>\s*/gi, "");

  const header = `<!-- ${describe(rel)} · ${RIGHTS} · ${LICENSE_URL} -->\n`;
  out = out.replace(/^(<\?xml[^?]*\?>\s*)?(<!--[\s\S]*?-->\s*)*/, (m) => (m.match(/<\?xml/) ? m.match(/<\?xml[^?]*\?>\s*/)[0] : ""));
  out = header + out;

  // Insert the stamp immediately after the opening <svg ...> tag.
  const m = out.match(/<svg\b[^>]*>/i);
  if (!m) throw new Error(`${rel}: no <svg> element`);
  const at = m.index + m[0].length;
  out = out.slice(0, at) + "\n  " + svgStamp(rel) + out.slice(at);

  return out.replace(/\r\n?/g, "\n").trimEnd() + "\n";
}

const svgStamped = (t) => t.includes(SVG_OPEN) && t.includes("xmpRights:Owner");

// ---------------------------------------------------------------- PNG

const CRC = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "latin1"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}

// tEXt: keyword \0 latin1-text. Non-latin1 characters are transliterated so the chunk stays legal.
function tEXt(keyword, text) {
  const safe = text.replace(/©/g, "(c)").replace(/·/g, "-").replace(/[^\x20-\x7e]/g, "");
  return chunk("tEXt", Buffer.concat([Buffer.from(keyword, "latin1"), Buffer.from([0]), Buffer.from(safe, "latin1")]));
}

// iTXt: keyword \0 compressionFlag \0 compressionMethod \0 languageTag \0 translatedKeyword \0 utf8Text
function iTXt(keyword, text) {
  return chunk(
    "iTXt",
    Buffer.concat([Buffer.from(keyword, "latin1"), Buffer.from([0, 0, 0, 0, 0]), Buffer.from(text, "utf8")]),
  );
}

function xmpPacket(rel) {
  const title = describe(rel);
  return `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
 <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
  <rdf:Description rdf:about=""
    xmlns:dc="http://purl.org/dc/elements/1.1/"
    xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"
    xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/">
   <dc:title><rdf:Alt><rdf:li xml:lang="x-default">${title}</rdf:li></rdf:Alt></dc:title>
   <dc:creator><rdf:Seq><rdf:li>${OWNER}</rdf:li></rdf:Seq></dc:creator>
   <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">${RIGHTS}</rdf:li></rdf:Alt></dc:rights>
   <dc:source>${SITE}</dc:source>
   <photoshop:Credit>${OWNER}</photoshop:Credit>
   <xmpRights:Marked>True</xmpRights:Marked>
   <xmpRights:Owner><rdf:Seq><rdf:li>${OWNER}</rdf:li></rdf:Seq></xmpRights:Owner>
   <xmpRights:WebStatement>${LICENSE_URL}</xmpRights:WebStatement>
   <xmpRights:UsageTerms><rdf:Alt><rdf:li xml:lang="x-default">${TERMS}</rdf:li></rdf:Alt></xmpRights:UsageTerms>
  </rdf:Description>
 </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const TEXT_TYPES = new Set(["tEXt", "iTXt", "zTXt"]);

function splitPng(buf) {
  if (!buf.subarray(0, 8).equals(PNG_SIG)) throw new Error("not a PNG");
  const chunks = [];
  let off = 8;
  while (off < buf.length) {
    const len = buf.readUInt32BE(off);
    const type = buf.toString("latin1", off + 4, off + 8);
    chunks.push({ type, raw: buf.subarray(off, off + 12 + len) });
    off += 12 + len;
    if (type === "IEND") break;
  }
  return chunks;
}

// The stamp is sized against the file it rides on. A favicon is served on every page
// load, so a 2 KB XMP packet on a 400-byte icon is a real cost for no reader: nothing
// inspects rights metadata on a favicon. Large assets, the ones that get downloaded,
// re-hosted and dropped into decks, carry the full record.
//   under 4 KB   minimal   Copyright and Source only
//   under 32 KB  standard  the six tEXt fields
//   32 KB and up full      tEXt plus the XMP packet Adobe tools read
function pngStampFor(rel, bytes) {
  const title = describe(rel);
  const short = `(c) ${YEAR} ${OWNER}. Trademark. ${LICENSE_URL}`;
  if (bytes < 4096) return [tEXt("Copyright", short), tEXt("Source", SITE)];
  const std = [
    tEXt("Title", title),
    tEXt("Author", OWNER),
    tEXt("Copyright", RIGHTS),
    tEXt("Source", SITE),
    tEXt("Software", `${BRAND} brand assets`),
    tEXt("Comment", `${TERMS} ${LICENSE_URL}`),
  ];
  if (bytes < 32768) return std;
  return [...std, iTXt("XML:com.adobe.xmp", xmpPacket(rel))];
}

function stampPng(buf, rel) {
  const chunks = splitPng(buf);
  const stamp = pngStampFor(rel, buf.length);
  const out = [PNG_SIG];
  let inserted = false;
  for (const c of chunks) {
    if (TEXT_TYPES.has(c.type)) continue; // drop any previous stamp
    out.push(c.raw);
    if (c.type === "IHDR") {
      out.push(...stamp);
      inserted = true;
    }
  }
  if (!inserted) throw new Error(`${rel}: no IHDR`);
  return Buffer.concat(out);
}

function pngStamped(buf) {
  try {
    return splitPng(buf).some(
      (c) => TEXT_TYPES.has(c.type) && c.raw.toString("latin1").includes("mAInCharacter Advisory LLC"),
    );
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- run

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

const targets = [];
for (const d of DIRS) targets.push(...(await walk(path.join(root, d))));

let changed = 0;
let already = 0;
const unstamped = [];

for (const p of targets) {
  const rel = path.relative(root, p).split(path.sep).join("/");
  const ext = path.extname(p).toLowerCase();
  if (ext === ".svg") {
    const text = await fs.readFile(p, "utf8");
    if (svgStamped(text)) {
      already++;
      continue;
    }
    if (check) {
      unstamped.push(rel);
      continue;
    }
    await fs.writeFile(p, stampSvg(text, rel), "utf8");
    changed++;
    if (!quiet) console.log(`svg  ${rel}`);
  } else if (ext === ".png") {
    const buf = await fs.readFile(p);
    if (pngStamped(buf)) {
      already++;
      continue;
    }
    if (check) {
      unstamped.push(rel);
      continue;
    }
    const next = stampPng(buf, rel);
    await fs.writeFile(p, next);
    changed++;
    if (!quiet) console.log(`png  ${rel}  +${next.length - buf.length} B`);
  }
}

if (check) {
  if (unstamped.length) {
    console.error(`stamp-metadata: ${unstamped.length} asset(s) carry no ownership metadata:`);
    for (const u of unstamped) console.error(`  ${u}`);
    console.error("Run: node scripts/stamp-metadata.mjs && node scripts/build-manifest.mjs");
    process.exit(1);
  }
  console.log(`stamp-metadata: all ${already} asset(s) stamped.`);
  process.exit(0);
}

console.log(`stamp-metadata: ${changed} stamped, ${already} already carried a stamp.`);
if (changed) console.log("Regenerate the manifest: node scripts/build-manifest.mjs");
