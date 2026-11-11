# MOTKI.EXE — Roshani's Bhai Dooj Surprise ❤️😂

**Live website:** https://bjendermisra-ops.github.io/mere-anju/

Real name: **Roshani**. Her brother's affectionate nickname: **Motki**. The source code is in the existing `mere-anju` repository, but the experience and every visible greeting now feature Roshani/Motki.

## This sibling surprise now includes

- Royal burgundy + champagne-gold cinematic hero, using **the real first maroon-and-heart photo**, not AI
- Ten original sister photos in gallery, 3D rotating ring, zoomable full-screen lightbox and captions
- Six playful sibling complaint files to open
- Twelve rotating Motki roasts plus a sweet virtual hug button
- Four-question Bhai–Behen trivia game with feedback and score
- Eight funny flip cards, the original animated terminal and sibling chaos meter
- Five diya promises, four virtual Bhai Dooj rituals and handwritten-style secret letter
- Lifetime sibling contract with interactive signature, celebratory confetti and a five-tap secret
- Accessible controls, reduced-motion support and responsive 320px/390px/desktop styles

### Import the **10 authentic portraits** (required for images)
The original photographs have been provided by the site owner; the site does not generate a replacement face. The website intentionally references assets/photos/sister-01.webp to sister-10.webp and will show tasteful placeholders until imported.

1. Download **roshani-motki-photos.zip**, containing `assets/photos/sister-01.webp` through `sister-10.webp`.
2. Open the GitHub repo **Add file → Upload files** and upload the ZIP to the **root** of the repository as `roshani-motki-photos.zip`. Do not upload the ZIP inside the assets folder.
3. Commit on main. The `.github/workflows/import-photos.yml` Action validates and extracts the 10 WebP images, commits them into `assets/photos/`, removes the ZIP and auto-deploys through GitHub Pages.

**Important:** This is a PUBLIC GitHub repo and public webpage. Publish the photos only with Roshani's permission.

### Technical layout
`index.html`, `config.js`, `app.js`, `styles.css` and `audio.js` form the core site. `sister.css`/`sister.js` add the Bhai Dooj experience. `motki.css`/`motki.js` add the new nickname-based interaction and maximalist design. This keeps the proven 3D gallery, native audio settings and firework canvas intact.

### Test
Run `node tests/smoke.mjs` locally or view `Actions` in GitHub. Photo absence prints a warning rather than pretending that images exist. Gallery becomes photo-complete only when all ten images are uploaded.
