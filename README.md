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

## Current update — v0.6.0: Orbiting Card Universe

- The interior universe slowly rotates automatically (4°/second, ~90 seconds/revolution); a pause/resume control and keyboard/manual rotation remain available. Dragging temporarily suspends auto-orbit.
- In WebGL, picking is synchronized to the **last painted frame** of the moving sphere to avoid tapping a card that's already moved on screen.
- Selecting a card triggers a flare and a curved card-back flight **from the stars into the next hand slot**. The slot fills only after the card reaches it. Rapid taps during the flight cannot cause duplicate cards. Flat 2D shares the same hand animation.
- Paused tabs don't cause large rotation jumps. `prefers-reduced-motion` disables ambient rotation and the flight animation; unsupported WebGL2 still falls back to the flat 2D tabletop.
- Version `v0.6.0` is visible in masthead and footer. Existing original Rider–Waite–Smith illustrations, Chinese artwork licensing constraints, and optional private AI Worker remain unchanged.

Read [v0.6 QA](docs/QA-v06.md). Full mobile/GPU browser QA is outstanding because the local browser sandbox disallowed navigation. The deployed workflow checks the complete tests and imports/audits all 78 historical card scans.

## Current update — v0.7.0: The Reading Comes Alive (scripted demo only)

After revealing three cards, you now enter a cinematic reading with **genuine RWS illustrated faces** lifted from the hand into a celestial spread, clickable individual spotlights, staggered transitions, previous/next chapters, and a whole-spread synthesis. Meaning-based foil is an overlay, not an alteration of the source scans.

A **deterministic, local-only demonstration engine** (`src/demo-reading.mjs`) now offers context-dependent scripts in English and Simplified Chinese based on your exact question, two path labels, the three card identities/orientations and cultural lens. The synthesis opens a scripted follow-up conversation with suggested prompts and up to 12 custom questions. UI labels explicitly say **SCRIPTED DEMO — NOT LIVE AI**. The conversation is kept only in tab memory, not sent to a service or included when explicitly saving the spread.

**Per request, live AI connection is on hold.** The future private Worker and its validation tests are retained but the v0.7 frontend no longer calls it. Do not add a public API key to GitHub Pages or misrepresent sample interpretations as real AI output.

See [v0.7 QA](docs/QA-v07.md) for a concise device test plan. The Chinese Tarot remains opt-in only with user-supplied authorized local images pending public digital rights; mainland-China hosting and real AI remain future gates.


## v0.7.1 — Optional Local Exodia AI on port 4173

The browser now detects a loopback-only Node proxy when the app runs at http://127.0.0.1:4173. On GitHub Pages, the local mode is absent and the scripted demonstration stays the default.

### Try it on your Windows computer

1. Keep Exodia running locally on http://127.0.0.1:8765.
2. In your clean JuHua-Speaks clone, pull the latest main and run npm run dev.
3. Open http://127.0.0.1:4173 and complete a three-card reading.
4. At the reading screen, choose Local Exodia AI, advance to the final synthesis, then click Generate with local Exodia. One generation task is submitted; expect about 20–60 seconds.
5. Ask a follow-up. JuHua resends the original question, both options, exact card IDs, positions and orientations, initial response and up to eight previous exchanges in every task.

The initial Exodia result is displayed as returned text. The cinematic individual-card chapters above remain scripted. This is NOT a production structured AI reading. Local mode is explicitly opt-in: clicking Generate or Ask submits that information to the signed-in ChatGPT session controlled by Exodia.

Safety: The Node adapter binds to 127.0.0.1 and refuses other origins. It accepts only same-origin JSON with a required custom header, rejects external Exodia URLs and blocks overlapping generation tasks. It enforces a five-second wait after each completed task before submitting another generation POST. Polling GET requests remain sequential at 1.5-second intervals. Timeout or failure NEVER causes an automatic regeneration. The Node server serves only web assets, not its own source scripts, secrets or Git files. Do not expose or port-forward either service.

The automated tests use simulated Exodia responses to verify serialization, cooldown, prompt context, URL safeguards and same-origin browser requests. They send ZERO real ChatGPT requests and consume no credits.


## Phase 8.1 — Milestone 8.0 overhaul

The current release targets **v0.8.1: The Celestial Ritual**, with a new question-centered orbiting-card landing, gated 5–8-second shuffle, explicit floating deck finish, reversible three-card selection with glow, and black-hole cleanup of unselected cards. Original three-card reveal and reading remain in place.

Brand labels come from src/brand-config.mjs (name is temporary); DeckConfig and ReaderDefinition registries allow future user-created Eastern mythology decks and Artemis-led reader variants. Full design, phased implementation and AI timing are documented in [Milestone 8.0 master directive](docs/MILESTONE_8_MASTER_DIRECTIVE.md). SQL persistence is reference-only pending login, consent, permission policies and migrations. [Phase 8.1 QA](docs/QA-8-1.md).

No new real model requests are triggered automatically. The local Exodia path stays experimental and opt-in after the original three cards are locked, while structured production AI curation is a later phase.


## v0.8.2 — Video-guided cinematic ritual (Phase 8.1B)

A frame-by-frame study of the user's 40-second reference recording now informs the front half of the experience. Full-screen landing uses orbiting original 1909 RWS face textures through WebGL2; the time-based shuffle animates tornado → collapsed pack → mini globe → three deck piles → floating deck. Optional cosmic/riffle/wash shuffles restart a secured fair draw and minimum-duration gate. The deck then travels through a star field into the existing interior card sphere. Hover/pick adds depth and gold aura; users can undo a three-card selection during a short lock window. Reveal now shows all three cards side by side and supports click, edge, or corner peek using a physical 3D card rotation rather than a 2D wipe.

The existing cinematic scripted Past/Present/Future interpretation stage and optional local Exodia adapter remain unchanged. Source: [VIDEO_RITUAL_FIDELITY.md](docs/VIDEO_RITUAL_FIDELITY.md). Full device GPU/touch QA remains a manual release gate.


## v0.8.3 Gate A — persistent landing universe (visual review, unmerged)

On branch `feat/v083-gate-a-persistent-world`, run `npm run preview:gate-a` and open `http://127.0.0.1:4183/preview/gate-a/`. This isolated preview replaces the rejected v0.8.2 landing renderer with one persistent WebGL2 world, a durable camera and 78 distinct Tarot entities with original RWS front texture sources, gold-edged backs and thickness. A Canvas2D perspective fallback handles WebGL restrictions. **Only the landing is in scope; shuffle, sphere and reveal gates remain blocked until visual approval.** Production stays v0.8.2; see `docs/GATE_A_WORLD_REBUILD.md`.

**Gate A refinement 2:** The landing cards fly outward from the camera and settle into one huge orbital shell. All 78 show their original RWS face images and a randomized upright/reversed mix. Initial arrangement and close-pass cards change every refresh. The Gate A preview now audits/downloads the 78 verified artwork JPEGs before launching. This remains a draft, unmerged visual gate.

## Gate A v4 — Persistent physical sphere (DRAFT / UNMERGED)

The landing visual preview on `feat/v083-gate-a-persistent-world` now uses one rigidly rotating 78-card spherical shell, with **no artificial close-pass tween**. All card normals and edges rotate with that same shell, naturally revealing genuine RWS faces, backs and edges. The WebGL renderer uses a rounded, substantially thinner card body, redesigned polished obsidian back, and higher-quality 256×448 historical face atlas tiles (2× dimension over v3); 384×664 face previews support the Canvas fallback. Launch with `npm run preview:gate-a`; the preview checks/imports original RWS scans before starting. The draft PR is not merged into production. See [Gate A v4 visual QA](docs/GATE_A_V4_VISUAL_QA.md). Real GPU fidelity is still an acceptance gate.

## Gate A v5 — Compact core sphere + sparse outer orbit (DRAFT)

A synchronized 20-second CTA-off comparison exposed that the v4 sphere was almost entirely outside the viewing frustum and that the renderer blocked all animation until 78 JPEGs had finished decoding. The new visual candidate uses a 62-card core shell with clearly readable ~235px projected radius and a 16-card secondary orbit with natural close passes. Both use one constant shared angular velocity and no radial lunge. Obsidian backs appear immediately; authentic RWS fronts replace the back-only fallback as they load. **Do not merge/deploy without actual GPU visual approval.** See [Gate A v5 video audit](docs/GATE_A_V5_REFERENCE_AUDIT.md).

## Gate A v6 — Cinematic orbit polish (DRAFT, unmerged)

Following a 30-second reference comparison, the landing preview adds opaque card materials, four related rigid orbital scales (50 core + 12 halo + 10 middle + 6 flyby; still exactly 78 cards), seeded restrained nebulae and bottom-edge glow, and two distinct refresh/QA-selectable entrance rituals. **Do not merge or deploy without visual sign-off.** Run `npm run preview:gate-a` on the feature branch, press **H** to hide CTA, then use **SWITCH ENTRY** / **REPLAY** to compare both entrance styles. [Evidence and acceptance checks](docs/GATE_A_V6_VIDEO_REVIEW.md).

## Gate A v7 — Reference-calibrated landing polish (DRAFT / UNMERGED)

After a synchronized 40-second Chatarot vs Gate A v6 video, this candidate moves five cards from the primary core/halo into the middle-distance orbit (**46 core, 11 halo, 15 middle, 6 unchanged flybys**) and sets the main sphere slightly farther from camera. The previous outside-in Star Assembly's screen-plane slide has been replaced with staggered, curved 3D trajectories that assemble onto stable orbital slots over approximately 4.75 seconds. A mostly black starfield with two procedural smoky nebulae, twinkling stars, faint lower-edge light and slow parallax replaces the solid navy gradients; sky textures are generated once per resize, not every frame. The existing Core Expansion, true RWS assets, 78 fixed IDs, solid cards, Step 6 and Exodia are preserved. See [Gate A v7 video analysis and tests](docs/GATE_A_V7_VIDEO_AUDIT.md). Do not merge/deploy until the Product Owner approves the actual GPU browser result.
