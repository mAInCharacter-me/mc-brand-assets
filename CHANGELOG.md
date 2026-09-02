# Changelog

## 1.1.0 — unreleased

No asset path changed. Everything at a `v1.0.0` URL still resolves.

### Added
- `LICENSE.md` — a trademark permission with permitted and prohibited uses.
  The repository previously had no license file.
- `BRAND-GUIDELINES.md` — name, color, clear space (1X, X = A-dot diameter),
  minimum width, do and do-not lists, which file to use.
- `SECURITY.md` — official channels and how to report impersonation.
- `manifest.json` — SHA-256 of every published file, with `kind` per file
  (`vector`, `raster-in-svg`, `raster`, `tokens`) and `deprecated` flags.
- Embedded ownership metadata in all 74 assets. SVG: comment header, `<title>`,
  `<desc>`, Dublin Core and XMP Rights. PNG: `tEXt` chunks, plus an XMP packet
  above 32 KB and a two-field short form below 4 KB. Pixel data and vector
  geometry are byte-identical; verified across 51 PNGs and 23 SVGs.
- `scripts/stamp-metadata.mjs`, `scripts/build-manifest.mjs` and
  `scripts/lint-svg.mjs`.
- `.github/workflows/verify-assets.yml` — every push and pull request: no
  executable SVG, no internal paths, every asset stamped, manifest matches the
  tree.
- `.github/CODEOWNERS`.

### Changed
- `README.md` — official channels, verification steps, deprecation policy;
  internal file-system paths and publishing notes removed.
- `SOURCE_MAP.md` — internal file-system path removed.
- `index.html` — two links to a repository that does not exist replaced;
  stat corrected from 23 to 15 true-vector SVGs.

### Deprecated
- `icon/*.svg` (8 files): raster PNG wrapped in an SVG container. Kept at
  their paths for URL stability; removal at 2.0.0.

### Removed
- `website-launch-dns-handoff.html` and `asset-system-test.html` — internal
  launch documents. Moved to the private mark-system repository.

## 1.0.0 — 2026-07-29
- Initial public release: logo, wordmark, icon, favicon, header, tokens,
  GitHub Pages catalog.
