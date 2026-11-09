# Gate BC v3.3 — Owner-approved correction / visual acceptance

**Status:** implementation review only; not production approved.
**Branch:** `feat/gate-b-deck-instances-gate-c-continuity`.
**App:** 菊花说 · JuHua Speaks. Historical reference: ChatARot split-screen recordings supplied by the owner.
**Run:** `npm run preview:gate-b` → `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`.

## Gate B: compressed deck

- [ ] A single coherent **matte pale cardstock block** with no giant seven-packet gaps; outer silhouette is compressed and organic, not concrete slabs.
- [ ] **Exactly 78** physical sheet identities persist through the main shuffle, three piles, consolidation, and final suspension. Positive microscopic sheet spacing; no substituted slab for the Tarot imagery.
- [ ] Only slight, diffuse micro-creases suggest individual cards. No zebra bands, heavy shadow dither, exaggerated air gaps or barcode.
- [ ] Midnight-blue card reverse and gold celestial engraving appear on the correct face of the gently turning deck. Original licensed RWS artwork is not redrawn.
- [ ] Deck rests far from the camera against restrained dark starfield. No abrupt enormous dolly-in.

## Gate C: sphere and selection

- [ ] FINISH SHUFFLING stays in the existing document, never redirects to a cube/chamber/legacy ritual.
- [ ] One deterministic deck-to-globe-to-interior sequence maintains all 78 card identities.
- [ ] Drag **left or right through two full 360° revolutions**, with no hard stop at 180°. Keyboard left/right arrows are also unbounded.
- [ ] Genuine 85° vertical camera FOV; no near-plane popping; cards remain physically thin with consistent front/back orientation.
- [ ] Chosen cards move **slightly up and forward**, with a readable, restrained halo; the selected card stays in the scene until three picks complete.
- [ ] Every card is reachable in the 360° interior; no permanent half-sphere of missing cards.

## Gate D: floating Past / Present / Future reveal

- [ ] Three cards appear in a stable layout with authentic RWS art, accurate orientation and names.
- [ ] Reveal **has no detached white flap** and no CSS faux hinged panel. Only a subtle integrated physical card edge is visible.
- [ ] A **veil of swirling ethereal cosmic mist** drifts over the unrevealed midnight-blue card reverse, intermittently revealing intricate celestial engraving. It is neither opaque smoke nor a flat fog gradient.
- [ ] Only transparent diffraction overlays affect the front. Four selectable treatments: **Prismatic / Aurora / Starfield / Glass Spectrum**.
- [ ] Click left/right preview controls to switch styles immediately, including after one or more cards has been turned over, without re-dealing or changing card IDs.
- [ ] On slow/mobile/reduced-motion hardware, the original illustration and interpretation remain legible and visually stable.

## Engineering and review gate

- [ ] `npm test` passes from this exact commit.
- [ ] Actual Chromium WebGL2 integration (deck depth FBO, sphere panorama, click three cards, reveal/cycle styles) passes from this exact commit.
- [ ] Review screenshots/video are recorded at a comparable viewport/elapsed time to the reference.
- [ ] Owner signs off the visuals explicitly **before** any merge/deployment.

**Do not treat green tests, source-only review or prior reference footage as visual acceptance.**
