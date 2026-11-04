# 菊花说 · JuHua Speaks

An immersive, bilingual Tarot web application built around **authentic historical Rider–Waite–Smith card illustrations**. The name 菊花说 (*Júhuā Shuō*, “JuHua Speaks”) has a playful double meaning; the visual experience itself stays atmospheric and polished.

## Current milestone: v0.3 — standalone interactive application

The app now has a real deployable codebase rather than a ChatGPT-only prototype. It supports a question-led ritual, two three-card spreads, animated shuffle, draggable **CSS 3D sphere with all 78 card backs**, three unique selections with upright/reversed orientation, question-aware **local preview** reading, bilingual English/简体中文 UI, and independent Western/Chinese-context/universal interpretation lenses. The artwork treatment adds meaning-based light overlays to **real illustrations**, never synthetic substitutes. No rarity, virtual currency or credits.

**Important:** Reading text is a labeled, on-device rule-based **preview**, not live AI. The next phase is a question-specific, private backend with LLM provider choice and dialogue. Tarot is reflective entertainment, not deterministic prediction or professional advice.

## Run locally

Requires Node.js 20+. No npm dependencies are needed.

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
- `src/app.mjs` — accessible stage flow, 3D sphere, gallery, state management
- `src/styles.css` — responsive celestial styling, foil and animation
- `scripts/sync-rws-assets.mjs` — import scans with license/provenance gate
- `scripts/audit-assets.mjs` — ensure all 78 local JPEGs exist
- `docs/DECK_ARTWORK.md` — sourcing and licensing plan, including the Chinese deck
- `docs/ROADMAP.md` — next milestones and QA acceptance criteria

## Safety and privacy

No accounts, ads, tokens or backend yet. Questions are kept in ephemeral in-memory state; clicking “Save on this device” writes an explicit localStorage snapshot. No financial, medical, legal or other high-stakes decision is decided by the app. The future backend must protect prompts and conversations and route them through an authorized region-accessible LLM service.

Artwork provenance and rights: [DECK_ARTWORK.md](docs/DECK_ARTWORK.md). Original images by **Pamela Colman Smith**, 1909, sourced from [Wikimedia Commons TaionWC collection](https://commons.wikimedia.org/wiki/Category:Rider-Waite-Smith_tarot_deck_(TaionWC)). Modern recolorings and Chinese Tarot images are **not** included in the repository.
