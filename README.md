# mAInCharacter — Brand Assets

Public, web-ready brand assets for mAInCharacter: the primary lockup, the A-dot
icon, favicons, header exports and design tokens. Reference them by URL from a
website, an email signature or a document.

Before using any mark, read [`BRAND-GUIDELINES.md`](BRAND-GUIDELINES.md) for
the rules and [`LICENSE.md`](LICENSE.md) for the terms. These files are
trademarks, not open-source software.

Browse every asset with a one-click URL:
https://maincharacter-me.github.io/mc-brand-assets/

## Official channels

mAInCharacter publishes from these places and no others:

| Channel | Address |
|---|---|
| Website | https://main-character.me |
| GitHub organization | https://github.com/mAInCharacter-me |
| Email | addresses ending in `@main-character.me` |

A page, account, repository or message that carries these marks and is not on
this list is not ours. Report it: [`SECURITY.md`](SECURITY.md).

## Every file says whose it is

Each asset carries its own ownership record, so a file that travels away from
this repository still names its owner and terms.

- **SVG** — a comment header, `<title>`, `<desc>`, and a Dublin Core and XMP
  Rights block. Open any `.svg` in a text editor and read it.
- **PNG** — `tEXt` chunks (Title, Author, Copyright, Source, Software, Comment)
  that Windows Explorer, macOS Preview, ImageMagick and exiftool all show, plus
  an XMP packet on files over 32 KB for Adobe tools. Favicons carry a two-field
  short form so a 400-byte icon does not gain 2 KB of metadata.

```bash
exiftool -Copyright -Rights logo/png/mc-logo-gold-on-black-2048.png
```

Pixel data and vector geometry are untouched: the metadata sits in ancillary
chunks and elements. `scripts/stamp-metadata.mjs` writes it and CI refuses any
asset that lacks it.

This is provenance, not protection. Anyone determined can strip it. Its jobs
are that an honest recipient can read the terms, a careless reuse carries the
notice along, and a stripped file is evidence of intent.

## Verifying that an asset is official

Every file here is listed in [`manifest.json`](manifest.json) with its SHA-256.
Download a file, hash it, and compare:

```bash
sha256sum mc-logo-gold.svg
```

A file whose hash is not in the manifest is not an official mAInCharacter asset.
Release tags (`v1.0.0`, `v1.1.0`, ...) are immutable; `main` moves.

## Two ways to reference

**GitHub Pages** — correct MIME types, always the latest `main`:

```
https://maincharacter-me.github.io/mc-brand-assets/<path>
```

**jsDelivr CDN** — versioned and globally cached. Pin a release tag in
production; use `@main` only for previews:

```
https://cdn.jsdelivr.net/gh/mAInCharacter-me/mc-brand-assets@v1.0.0/<path>
```

### Example — logo in a page

```html
<img src="https://cdn.jsdelivr.net/gh/mAInCharacter-me/mc-brand-assets@v1.0.0/logo/mc-logo-gold.svg"
     alt="mAInCharacter" height="40">
```

### Example — favicons and tokens in `<head>`

```html
<link rel="icon" type="image/png" sizes="32x32"
      href="https://maincharacter-me.github.io/mc-brand-assets/favicon/favicon-32.png">
<link rel="apple-touch-icon"
      href="https://maincharacter-me.github.io/mc-brand-assets/favicon/apple-touch-icon-180.png">
<link rel="manifest"
      href="https://maincharacter-me.github.io/mc-brand-assets/site.webmanifest">
<meta property="og:image"
      content="https://maincharacter-me.github.io/mc-brand-assets/favicon/og-image-1200x630.png">
<link rel="stylesheet"
      href="https://maincharacter-me.github.io/mc-brand-assets/tokens/mc-ds-tokens.css">
```

## What is inside

| Folder | Contents | Best for |
|---|---|---|
| `logo/` | 5 horizontal-lockup SVGs and 11 PNGs at 2048 px wide, on-background and transparent | Site headers, hero, email, documents |
| `wordmark/` | `mAIn` and `CHARACTER` component SVGs, 5 colorways each | The approved stacked lockup only. See the guidelines. |
| `icon/` | A-dot and stacked icons: square PNGs at 1024, transparent at 2048, small 128 / 256 / 512, circle-safe profiles | App icons, avatars, large favicons |
| `favicon/` | favicon 16 / 32 / 48 / 64, apple-touch 180, web-app 192 / 512, OG image 1200 by 630 | `<head>` tags, social cards |
| `header/` | Header exports at 360 / 720 / 1200 px wide, dark, light and overlay | `srcset` responsive navigation |
| `tokens/` | `mc-ds-tokens.css` (web canon, use this), logo-pack tokens `.css` and `.json`, contrast checks `.csv` | Color variables, design linking |
| `marks/` | Vector marks published by workflow from the private mark-system repository, with their own `manifest.json` | Appears after the A-dot vector is signed off |
| `manifest.json` | SHA-256 of every file above | Verifying authenticity |

### Deprecated, kept for URL stability

The eight `icon/*.svg` files wrap a raster PNG inside an SVG container. They are
55 to 62 KB each and do not scale. They stay at their paths so existing links
keep working, and `manifest.json` marks them `deprecated`. Use `icon/png/` at
the size you need, or `marks/mc-a-dot.svg` once it is published. They will be
removed at the next major version.

### Two token files

- `tokens/mc-ds-tokens.css` — the live web values (charcoal `#121110`, gold
  `#D4AE50`). Use this for any web surface.
- `tokens/mc-brand-tokens.css` and `.json` — the logo-pack values (charcoal
  `#0B0B0A`, gold `#C3A469`). Kept for print alignment and provenance.

## Versioning and deprecation

- Paths on `main` are never renamed or deleted within a major version.
  Deprecated files stay in place and are listed above until the next major.
- Every release is tagged. Pin production to a tag.
- Changes are listed in [`CHANGELOG.md`](CHANGELOG.md).

## Naming

`mc-<type>-<variant>[-<size>].<ext>`, for example `mc-logo-gold-on-black-2048.png`
or `mc-icon-charcoal.svg`. SVGs are unsized. PNG sizes are pixel width for
lockups and headers, pixel square for icons.

## Provenance

These files are derived from the mAInCharacter master logo pack;
[`SOURCE_MAP.md`](SOURCE_MAP.md) maps each web file to its master name. Files
under `marks/` are published by an automated workflow from the private
mark-system repository, which holds the source of truth and is not public. Do
not edit assets here; regenerate them from the masters.

© 2026 mAInCharacter Advisory LLC. mAInCharacter, the A-dot and the mark system
are trademarks of mAInCharacter Advisory LLC. See [`LICENSE.md`](LICENSE.md).
