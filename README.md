# Mere Anju — Bhai Dooj 2026 ❤️

**Live website:** https://bjendermisra-ops.github.io/mere-anju/

A one-of-a-kind personal **brother → sister** celebration, completely transformed from the earlier Diwali/romantic greeting.

## Experience
- First maroon portrait with crimson heart is the cinematic main hero
- Ten authentic Anju photos, in the exact original shared order
- Royal burgundy × antique gold hero, bold editorial typography, responsive layouts
- 3D photo carousel (swipe + drag), full-screen swipe/zoom lightbox and thumbnails
- Animated intro diya, festival particles, natural-sounding synthesized chimes and optional licensed Hare Krishna kirtan
- Code terminal joke, 4 flip secrets, sibling chaos meter, 5 diya promises
- New virtual Bhai Dooj rituals: tilak → aarti → mithai → digital gift
- Secret heartfelt letter, native share sheet (with copy-link fallback)
- No backend, no analytics, no sign-in, no personal data collection

## Add the photos using Android phone (one ZIP upload)

The site expects `assets/photos/sister-01.webp` to `sister-10.webp`. Until the photo archive is committed, custom decorative fallbacks appear rather than showing the previous recipient.

1. Download the supplied `anju-bhaidooj-photos.zip` bundle.
2. Open [GitHub upload](https://github.com/bjendermisra-ops/mere-anju/upload/main).
3. Upload this **single ZIP** to repository root, with its exact filename `anju-bhaidooj-photos.zip`.
4. Tap **Commit changes**.

The `.github/workflows/import-photos.yml` workflow automatically checks and extracts the 10 WebP photos into `assets/photos/`, removes the ZIP, and republishes the site via GitHub Pages. Do not unzip manually. Original older images have been removed from the main branch and are not referenced anywhere in the new experience. Hero is `sister-01.webp`.

**Privacy:** this GitHub repository and GitHub Pages site are public. Publish personal photographs only with Anju's permission.

## Source files
- `index.html` — screen content, four rituals, secret letter, 3D gallery and audio controls
- `config.js` — recipient, brother signature, gallery order and messages
- `app.js` — all original motion, canvas particles, carousel, lightbox and other interactions, adapted for Bhai Dooj
- `sister.css` — dark-royal premium responsive redesign
- `sister.js` — rituals, celebration, letter reveal and sharing
- `styles.css`, `audio.js` — original base UI and sound subsystem
- `tests/` — smoke and browser checks

## Test
`node tests/smoke.mjs` and existing browser Playwright tests. Audio unlocks only after the first user tap, respecting browser policy. Background kirtan attribution remains available in the settings panel.
