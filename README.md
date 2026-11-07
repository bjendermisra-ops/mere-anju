# Mere Anju — Diwali for Malik 🪔✨

**Live website:** https://bjendermisra-ops.github.io/mere-anju/

A white, rose-pink and metallic-gold maximalist Diwali greeting website for Malik, with 40 custom SVG assets. The site is static, with no backend, account tracking, analytics or ad code.

## Replace Malik's photos (on Android, directly in GitHub)

1. Open `config.js` in the repository.
2. Tap the pencil (Edit) icon.
3. Replace each `https://example.com/images/image_00X.jpg` URL with a **direct public HTTPS image URL** ending in JPG, PNG, JPEG or WebP whenever possible. There is 1 hero and 8 gallery photos.
4. Commit to `main`. GitHub Pages automatically redeploys via `.github/workflows/pages.yml`.

The example.com links intentionally remain untouched for you. Until replaced, a designed photo-card fallback appears instead of broken-image icons.

**Privacy:** This is a public repository and a public website. Only upload photos with permission from the people shown. A public URL means others with the link can view the images.

## Source files

- `index.html`: all original user-facing page sections and accessible UI
- `styles.css`: complete responsive ivory-and-rose maximalist design
- `app.js`: intro, rangoli, lantern lights, 3D rotating carousel, lightbox, zoom, flip cards, typed terminal, heat meter, five diya wishes, fireworks, scroll progress, particles and keyboard interactions
- `config.js`: the only file you need to edit for names, texts and image links
- `assets/`: 40 individually editable custom SVGs: 4 florals, 4 lanterns, 5 diyas, 3 gifts, 2 sweets, 2 arches, 3 rangolis, 4 mandalas, 3 torans, 4 paisleys, 2 hearts, 2 photo frames and 2 sparkle designs
- `tests/`: static checks and Playwright interactions across 320px, 390px and 1440px screens

## Deployment

GitHub Pages publishes automatically whenever `main` changes, using `.github/workflows/pages.yml`. If your repository settings are ever reset, use **Settings → Pages → Build and deployment → Source: GitHub Actions** and re-run the Pages workflow. Deployment history and test screenshots appear in **Actions**.

## Tests

The repository runs `.github/workflows/quality.yml` for syntax, assets and feature regression checks and `.github/workflows/browser.yml` for real Chromium click, slider, lightbox, intro, diya, keyboard/UI and overflow tests with screenshot artifacts.

Enjoy your special Diwali surprise. ♡

## Festive audio and licensed Hare Krishna kirtan

`audio.js` starts after the visitor's first tap, respecting browser autoplay
restrictions. The `Sound` panel controls mute, volume, background kirtan,
and original synthesized firework effects separately. The chant is streamed
from Wikimedia Commons, not committed to this repository; an offline/network
failure falls back to a gentle synthesized melody.

**Background kirtan recording:** *Hare Kṛṣṇa Kīrtana and purport*, 1966,
by **A. C. Bhaktivedanta Swami Prabhupada**, source **BBT International**,
distributed via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Hare_K%E1%B9%9B%E1%B9%A3%E1%B9%87a_K%C4%ABrtana_and_purport.ogg),
under [Creative Commons Attribution-ShareAlike 3.0 Unported](https://creativecommons.org/licenses/by-sa/3.0/).
The site plays the original recording unchanged, looping within the kirtan portion
(before the spoken purport), without modifying or redistributing the recording.
Sound effects and synthesized fallback melody are original website code and
not part of the licensed recording. Credits do not imply endorsement.
