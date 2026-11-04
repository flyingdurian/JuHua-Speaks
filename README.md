# 菊花说 · JuHua Speaks

An immersive, bilingual Tarot web application built around **authentic historical Rider–Waite–Smith card illustrations**. The name 菊花说 (*Júhuā Shuō*, “JuHua Speaks”) has a playful double meaning; the visual experience itself stays atmospheric and polished.

## Current milestone: v0.4 — GPU immersion + private AI contract

The app now has a real deployable codebase rather than a ChatGPT-only prototype. It supports a question-led ritual, two three-card spreads, animated shuffle, a real **GPU-rendered WebGL card sphere with all 78 card backs** (plus accessible CSS 3D fallback), three unique selections with upright/reversed orientation, question-aware **local preview** reading, bilingual English/简体中文 UI, and independent Western/Chinese-context/universal interpretation lenses. The artwork treatment adds meaning-based light overlays to **real illustrations**, never synthetic substitutes. No rarity, virtual currency or credits.

**Important:** Reading text is a labeled, on-device rule-based **preview**, not live AI. A **server-side AI reading Worker** and strictly validated frontend integration are implemented but **deliberately not connected/deployed** until credentials, budget controls and launch-region privacy requirements are configured. Follow-up conversation is a later milestone. Tarot is reflective entertainment, not deterministic prediction or professional advice.

## Run locally

Requires Node.js 20+. No npm dependencies are needed for the static app or tests. The Worker is a separate optional deployment.

```bash
npm test
npm run dev
# open http://localhost:4173
```

The developer preview tries `assets/rws/*.jpg` first, then Wikimedia Commons as a fallback. Image fallbacks show **art unavailable**, never fake card art. For consistent standalone delivery, fetch verified public-domain image scans first:

```bash
npm run assets:sync
npm run assets:audit
npm run dev
```

Artwork synchronization needs internet; it validates Wikimedia Commons file metadata and expects 78 authentic JPEGs. The assets are ignored in Git to avoid committing unverified binaries. GitHub Actions fetches them for a self-contained deployment artifact.

## Deployment

`.github/workflows/ci.yml` checks the tests on pull requests and builds/downloads verified art for GitHub Pages on `main`. Enable GitHub Pages with **GitHub Actions** as its source in repository settings; workflow permissions and GitHub Pages hosting must be configured for a deployment URL to appear. GitHub Pages and Wikimedia URLs are **not guaranteed accessible in mainland China**; mainland China hosting, network testing, compliant AI access and privacy requirements are distinct release gates.

## Architecture

- `src/deck.mjs` — authoritative 78-card manifest, original scan filenames, secure shuffle, image paths, deck availability
- `src/reading.mjs` — explicitly non-AI bilingual local reading preview
- `src/app.mjs` — accessible stage flow, WebGL enhancement, gallery, state management
- `src/webgl-sphere.mjs` — dependency-free GPU card-back sphere with projected picking and 2D fallback
- `src/reading-contract.mjs` — validated shared request/response schema for live readings
- `src/ai-client.mjs` — explicit opt-in HTTPS reading client; no frontend secrets
- `worker/index.mjs` — optional **not-yet-deployed** private Responses API Worker with fail-closed rate limiting
- `src/styles.css` — responsive celestial styling, foil and animation
- `scripts/sync-rws-assets.mjs` — import scans with license/provenance gate
- `scripts/audit-assets.mjs` — ensure all 78 local JPEGs exist
- `docs/DECK_ARTWORK.md` — sourcing and licensing plan, including the Chinese deck
- `docs/AI_BACKEND.md` — safe service setup, deployment and unresolved release gates
- `docs/ROADMAP.md` — next milestones and QA acceptance criteria

## Safety and privacy

No accounts, ads, tokens or active remote backend yet. Questions are kept in ephemeral in-memory state; clicking “Save on this device” writes an explicit localStorage snapshot. No financial, medical, legal or other high-stakes decision is decided by the app. The optional Worker backend keeps credentials server-side and only sends questions after an explicit click; it is not live until independently deployed. Its security and mainland-China hosting suitability require further review.

Artwork provenance and rights: [DECK_ARTWORK.md](docs/DECK_ARTWORK.md). Original images by **Pamela Colman Smith**, 1909, sourced from [Wikimedia Commons TaionWC collection](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). Modern recolorings and Chinese Tarot images are **not** included in the repository.

## Current update — v0.5.0: Inside the Stars

- Version number is visible at the top and bottom of every screen.
- The default WebGL2 Tarot experience is now **inside** the card sphere, with the viewer at the center of six orderly bands of 78 card backs. Click/tap visible cards; drag or use arrows to rotate the view. Unsupported GPU devices automatically see the accessible fallback.
- **Flat 2D** is now a real scrollable tabletop grid of 78 cards (not a CSS sphere) and shares the same shuffled deck and picks.
- **Slow reveal** replaces automatic flips: drag from right to left, pinch two fingers inward, use keyboard arrows/Home/End, or press the reveal button. Each of three cards must be revealed before continuing to a reading.
- **The Chinese Tarot** by Jui Guoliang is visually documented with links to the official publisher and independent card photographs, but its copyrighted digital illustrations are not redistributed. A session-only private image importer supports a user-supplied authorized 78-file collection without network upload. Use Decks → filename guide for the exact mapping. No licensed public Chinese pack is currently bundled.

Read [v0.5 QA](docs/QA-v05.md) and [Chinese art sources/rights](docs/CHINESE_ARTWORK.md). Device WebGL validation is still needed. Live AI remains an optional separately hosted backend, not activated by GitHub Pages.
