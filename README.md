# mAInCharacter — Brand Assets (Web CDN)

Path: `G:\Shared drives\mAInCharacter_TEAM\2. Digital Resources\mAIn Website\REFINED LOGO\mc-brand-assets-github`

A streamlined, web-optimized subset of the master logo asset pack — built to be
published to GitHub and referenced by URL from any HTML page, hosted site, or
email signature. Logos, wordmarks, icons, favicons, headers, and tokens — no
source masters, no illustrations, no platform-upload exports, only what a web
surface actually links to.

Open `index.html` (the live Pages home) to browse everything in the mAInCharacter
design system — swatches and a one-click **Copy URL** on every asset.

> **The mark system lives in its own repo:** [`mc-marks`](https://github.com/mAInCharacter-me/mc-marks)
> — 28 line-geometry marks with the gold client node. Kept separate so the mark
> library can grow on its own.

---

## Two ways to reference (both point at this repo)

The repository is privately owned by the `mAInCharacter-me` organization and is
named `mc-brand-assets`.

**1. GitHub Pages** — clean, correct MIME types, Fastly-backed, always-latest:

```
https://mAInCharacter-me.github.io/mc-brand-assets/<path>
```

**2. jsDelivr CDN** — versioned and globally cached (recommended for production):

```
https://cdn.jsdelivr.net/gh/mAInCharacter-me/mc-brand-assets@main/<path>
```

Pin a release instead of `@main` for stability, e.g. `@v1.0.0`.

### Example — logo in an HTML page

```html
<!-- SVG, scales crisply at any size -->
<img src="https://mAInCharacter-me.github.io/mc-brand-assets/logo/mc-logo-gold.svg"
     alt="mAInCharacter" height="40">

<!-- or via jsDelivr, version-pinned -->
<img src="https://cdn.jsdelivr.net/gh/mAInCharacter-me/mc-brand-assets@v1.0.0/logo/mc-logo-gold.svg"
     alt="mAInCharacter" height="40">
```

### Example — favicons + brand tokens in `<head>`

```html
<link rel="icon" type="image/png" sizes="32x32"
      href="https://mAInCharacter-me.github.io/mc-brand-assets/favicon/favicon-32.png">
<link rel="apple-touch-icon"
      href="https://mAInCharacter-me.github.io/mc-brand-assets/favicon/apple-touch-icon-180.png">
<link rel="manifest"
      href="https://mAInCharacter-me.github.io/mc-brand-assets/site.webmanifest">
<meta property="og:image"
      content="https://mAInCharacter-me.github.io/mc-brand-assets/favicon/og-image-1200x630.png">
<link rel="stylesheet"
      href="https://mAInCharacter-me.github.io/mc-brand-assets/tokens/mc-brand-tokens.css">
```

Open `index.html` (the live Pages home page) to browse every asset with a
one-click **Copy URL** button — the URLs are computed live from wherever the
repo is published, so you never guess a path.

---

## What's inside

| Folder | Contents | Best for |
|---|---|---|
| `logo/` | 5 horizontal-lockup SVGs + 11 PNG @2048w (on-background and transparent) | Site headers, hero, email, docs |
| `wordmark/` | `mAIn` and `CHARACTER` component SVGs, 5 colors each | Custom typographic lockups |
| `icon/` | A-dot + stacked SVGs, square PNGs @1024, transparent @2048, small 128/256/512, circle-safe profiles | App icons, avatars, favicons at large size |
| `favicon/` | favicon 16/32/48/64, apple-touch 180, web-app 192/512, OG image 1200×630 | `<head>` tags, social cards |
| `header/` | Responsive header exports @360/720/1200w (dark-gold, light-charcoal, white-overlay) | `srcset` responsive navs |
| `tokens/` | Design-system tokens (`mc-ds-tokens.css` — **use this for web**), logo-pack tokens `.css`/`.json`, contrast checks `.csv` | Color variables, design linking |

### The mark system → `mc-marks`

The 28-mark system (Arc-stage marks, segment/nav marks, seals) is maintained as
a separate library so it can grow independently: **[mc-marks](https://github.com/mAInCharacter-me/mc-marks)**.
Each mark uses `stroke="currentColor"` with the client node fixed at gold
`#C9A227`. Reference them the same way — Pages or jsDelivr — from that repo.

### Two token files — which to use

- **`tokens/mc-ds-tokens.css`** — the live Design System Canon values
  (charcoal `#121110`, gold `#D4AE50`). **Use this for any web surface.**
- `tokens/mc-brand-tokens.css` / `.json` — the original logo-pack values
  (charcoal `#0B0B0A`, gold `#C3A469`). Kept for provenance and print alignment.

### Naming convention

`mc-<type>-<variant>[-<size>].<ext>` — e.g. `mc-logo-gold-on-black-2048.png`,
`mc-icon-charcoal.svg`. SVGs are unsized (vector). PNG sizes are pixel width for
lockups/headers, pixel square for icons.

Color rules carried from the master pack: gold-on-black and transparent-gold are
primary; charcoal-on-ivory is the dense-copy pairing; **do not** use gold for
body text on ivory or cream.

---

## Publishing to GitHub

From this folder (`mc-brand-assets-github`):

```bash
git init
git add .
git commit -m "mAInCharacter web brand assets v1.0.0"
git branch -M main
git remote add origin https://github.com/mAInCharacter-me/mc-brand-assets.git
git push -u origin main
git tag v1.0.0 && git push --tags   # enables version-pinned jsDelivr URLs
```

Then on github.com: **Settings → Pages → Source: `main` / root** → Save.
Pages goes live at `https://mAInCharacter-me.github.io/mc-brand-assets/` within a minute.

`.nojekyll` is included so GitHub Pages serves every folder untouched.

---

## Provenance

Derived from the master pack (files copied and given short web-safe names — see
`SOURCE_MAP.md` for the exact mapping):

Path: `G:\Shared drives\mAInCharacter_TEAM\2. Digital Resources\mAIn Website\REFINED LOGO\((MASTER_mCr_logo_asset_pack`

The master pack remains the single source of truth. Regenerate this web subset
from it rather than editing assets here directly.
