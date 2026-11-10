# Artemis Reading Stage — Art Integration V1

Status: three-phase source implementation on a review branch; original 31 PNG files remain to be committed, and visual QA is not complete.
Base: feat/gate-d-artemis-on-bc-v34 (draft PR #24) on Gate BC v3.4 (draft PR #21). Main is unchanged.

## Phase 1 — unified reading tableau

- The Reading Stage now has aligned art slots for the main room, celestial halo, gold/violet particles, sigils, table/card glow, gold narrative frame, nameplate, titleplate and corner ornaments.
- Artemis is an actual illustrated portrait layer. No vector human rig or geometric face is substituted.
- Exactly three original RWS cards retain their original Past / Present / Future identities and upright/reversed orientations.
- The reading displays each card's canonical meaning under a consistent three-card row, with metallic framing and subtle table glows.
- The bottom narrative panel contains Artemis's name, one live chapter heading, one readable interpretation, a restrained Back action and ONE prominent Next action.
- The original RWS image DOM nodes are physically removed from the revealed Gate C tableau and transplanted into the new stage. No rerender/redeal or replacement Tarot artwork occurs.
- Chapter changes replace only the panel content and crossfade the illustration. Stage decorative layers and three RWS DOM nodes remain mounted.

## Phase 2 — expressive reader

Five chapters and their intended artwork:
1. Welcome — artemis_warm_welcome
2. Past — artemis_explaining
3. Present — artemis_thinking
4. Future — artemis_reading
5. Combined interpretation — artemis_reflective

Until the full pack is installed, chapters safely fall back to the four existing WebP portraits (warm_welcome, welcoming_gesture, thinking, reflective).

All 16 expressive states are in the immutable asset catalogue. The existing reading text is clearly labeled a SCRIPTED DEMONSTRATION; no AI call is falsely claimed.

## Phase 3 — ceremony and responsive polish

- BEGIN READING is a user-triggered option that appears only after all three revealed RWS cards finish their flips.
- The ~1850 ms handoff overlays the revealed tableau, optionally compositing the supplied portal room, sigils and gold particles. Reduced-motion mode immediately changes scenes.
- Responsive layouts cover short desktop viewports, mobile, and narrow phone sizes with explicit image layering and face/card clearance.
- Real browser QA must verify that the card row does not cover Artemis's eyes and that the HUD is readable.

## Source package — 31 genuine PNG assets

The owner-approved archive is Artemis_Asset_Candidates(1).zip.
It contains 16 portrait states, 2 backdrops, 6 FX layers and 7 UI overlays.

The source-file list is preview/post-shuffle/artemis-art-catalog.mjs.
To populate the exact pixels in a local checkout, extract the ZIP and run:

~~~bash
npm run assets:artemis -- "/path/to/Artemis_Asset_Candidates"
~~~

The installer verifies that ALL 31 files exist and have an expected PNG container, reasonable dimensions, portrait alpha and recorded SHA-256, before it copies the originals to assets/artemis/. It then writes assets/artemis/asset-provenance.json and preview/post-shuffle/artemis-assets-ready.mjs. These generated files and all 31 PNGs MUST be committed together to make the full-art state remotely available.

The branch currently contains four authentic, preexisting provisional WebP portraits. All other art slots remain explicitly pending until those original image bytes are actually added. The code intentionally never claims absent artwork is installed.

Known preview-asset QA limitations: portraits are 1024x1536 (below requested 1536x2304); backdrop pixels remain on some portrait RGBA cutouts; backdrops are 1672x941 (below requested 2560x1440); portraits are not pixel-registered for perfect facial crossfades; some UI overlays require clipping checks. V1 review is supported but final production-art fidelity is not certified.

## Preview / tests

~~~bash
npm test
npm run preview:gate-b
~~~

Review URL: http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in

Test sequence: START DIVINATION -> FINISH SHUFFLING -> choose 3 physical sphere cards -> reveal all 3 actual RWS faces -> click BEGIN READING -> step through all five Artemis chapters.

The standalone fast route is /preview/post-shuffle/.

Dedicated workflow .github/workflows/gate-d-art-pack-review.yml runs the full Node suite plus Chromium/SwiftShader WebGL2 screenshot checks without deployment. CI success does NOT mean visual approval.

## Release gate

Keep the pull request DRAFT, do not merge or deploy to main, and require owner review of browser captures at desktop and phone sizes, verified original PNG integration and signoff of the accepted visual composition. No unauthorized edits to Gate A, the original RWS scans, selection probabilities or reference shuffle are included.
