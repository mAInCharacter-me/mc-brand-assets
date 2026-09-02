# mAInCharacter Brand Guidelines — public assets

These rules apply to every file in this repository. `LICENSE.md` says who may
use the marks and for what. This page says how.

## The marks

| Mark | Files | Use |
|---|---|---|
| Primary lockup | `logo/*.svg`, `logo/png/*` | The horizontal wordmark. First choice wherever the brand appears. |
| A-dot | `icon/`, `favicon/` | The compact mark: an open A with a gold dot nested low in its crook. Favicons, app icons, avatars, small spaces. |
| Wordmark components | `wordmark/*.svg` | The two halves, `mAIn` and `CHARACTER`. Only for building the approved stacked lockup: A-dot above, `mAIn` over `CHARACTER`. |

## The name

Write `mAInCharacter` exactly so: one word, lowercase m, uppercase A and I,
lowercase n, uppercase C. Not Main Character, not MainCharacter, not mAIn
Character. Use it as a name, never as a verb or a plural.

## Color

- Published colorways: gold, charcoal, ivory, black, white. Pick a file; do not
  recolor.
- Primary pairings: gold on black or charcoal. For dense copy on light
  surfaces: charcoal on ivory or cream.
- Gold sits on `mAIn` only, never on `CHARACTER`.
- Gold is never body text on ivory or cream. It fails contrast.

## Size and space

- Clear space: at least 1X on every side, where X is the diameter of the
  A-dot. Files named `clearspace` already carry 1X inside the canvas. SVG files
  and files named `tight` do not; give them the space yourself.
- Minimum width for the horizontal lockup on screen: 120 px. Below that, use
  the A-dot instead.
- Do not stretch, rotate, skew, outline, shadow, animate or add effects.

## Do

- Use an unmodified file from this repository, at a release-pinned URL.
- Place the mark on a plain background with sufficient contrast.
- Carry the lockup, not a typed-out wordmark, wherever the brand appears.

## Do not

- Combine the marks with other marks, text or symbols into a new mark.
- Use the wordmark halves for anything other than the approved stacked lockup.
- Recompose, recolor, crop or trace the marks.
- Use the marks as your own avatar, app icon, favicon, product name, domain or
  handle.
- Imply endorsement, partnership or sponsorship that does not exist.
- Show the marks more prominently than your own.
- Use them in training data or datasets.

## Which file

| Need | Use |
|---|---|
| Website header on a dark surface | `logo/mc-logo-gold.svg` |
| Website header on a light surface | `logo/mc-logo-charcoal.svg` |
| Email signature or a document | `logo/png/mc-logo-gold-on-black-2048.png` or `logo/png/mc-logo-charcoal-on-ivory-2048.png` |
| Favicon and app icons | `favicon/` files and `site.webmanifest` |
| Square avatar or profile image | `icon/png/mc-profile-*-1024.png` (circle-safe) |
| Social preview card | `favicon/og-image-1200x630.png` |
| A vector A-dot | `marks/mc-a-dot.svg` once published. Until then, use `icon/png/` at the size you need; the `icon/*.svg` files wrap a raster image and do not scale. |

## Verifying a file

Every published file is listed in `manifest.json` with its SHA-256. A file whose
hash is not in the manifest is not an official mAInCharacter asset.

```bash
sha256sum mc-logo-gold.svg
```

Compare the output with the entry for `logo/mc-logo-gold.svg` in `manifest.json`.

## Permission and questions

Anything outside `LICENSE.md` needs written permission first:
geeks@main-character.me.
