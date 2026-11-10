# Gate D: Artemis reading on the current Gate BC v3.4

**Review branch**: `feat/gate-d-artemis-on-bc-v34` (draft PR #24). **Base**: `feat/gate-b-deck-instances-gate-c-continuity` (draft PR #21). Do not use `dev/juhua-active` to review the latest camera and tableau code.

## Latest ritual pipeline

Gate A preserved → Gate B current v3.4 shuffle / 78 physically separated card deck → FINISH SHUFFLING → same-document continuous camera inside 78-card sphere → 3 physical card choices → same-screen selection handoff → original RWS art tableau / flip three → user-triggered **BEGIN READING** → celestial transition → **Your Reading**.

No older Gate C14 page, no replacement deck, no fake card illustration, and no automatic Artemis transition. Selection identities and orientations flow directly from the v3.4 sphere to tableau and Artemis spread.

## Four provisional portraits now in the repo

All four approved-for-preview images are alpha-preserving WebP encodes of the uploaded Art Director PNGs, encoded at quality 87 and deliberately **not upscaled**:

| State | GitHub browser asset | Source Art Director upload | Reading placement |
| --- | --- | --- | --- |
| warm welcome | `assets/artemis/artemis_warm_welcome.webp` | `Artemis’s Warm Celestial Welcome-2.png` | initial welcome (chapter -1) |
| welcoming gesture | `assets/artemis/artemis_welcoming_gesture.webp` | `Artemis, Celestial Moonlit Enchantress-3.png` | Past card (chapter 0) |
| thinking | `assets/artemis/artemis_thinking.webp` | `Artemis, Celestial Purple Sorceress-1.png` | Present card (chapter 1) |
| reflective | `assets/artemis/artemis_reflective.webp` | `Artemis’ Celestial Tarot Reading-4.png` | Future and combined meanings (chapters 2, 3) |

All are derived from 1024 × 1536 RGBA uploads; original **PNG files are preserved in the conversation's Artemis_Provisional_GateD_4_Portraits.zip** and can be placed at `assets/artemis/artemis_warm_welcome.png`, `artemis_welcoming_gesture.png`, `artemis_thinking.png`, `artemis_reflective.png` for archival masters.

These are **provisional**, not signed-off character identity masters. Real differences in hairstyle placement, costume ornament and framing remain; there may also be low-opacity bright edge halos. No artificially retouched faces, stylistic repaint or cutout masks have been imposed on original image content.

## Code layout and drop-in asset slots

- `preview/post-shuffle/reading-stage.mjs`: pure renderer/asset manifest, exact card identity and five-chapter interpretation.
- `preview/post-shuffle/reading-stage.css`: responsive layout, cinematic transition, image presentation.
- `preview/post-shuffle/TarotTableau.mjs`: after the third flip settles, reveals the **BEGIN READING** CTA. Before then CTA is inaccessible. All existing v3.4 foil-overlay modes remain.
- `preview/post-shuffle/scene.mjs`: transition and reading stage are mounted in the same document; selection never navigates to old `ritual.html`.
- `preview/gate-b/gate-b.mjs`: passes the actual user question to the new stage.
- `assets/artemis/`: four provisional WebP portraits.

### Art still pending

Full reading-chamber background; optional transition plate; standalone 3D halo / sigils; gold and violet atmospheric particles; decorated nameplate / lower panel / chapter title and CTA frames; and remaining expressive portrait states. Those slots return `null` from `assetUrl` and are rendered as neutral CSS structural scaffolding, not substitute character art. The four committed portraits render now.

### Art Director source QC

Check consistent face geometry, earrings, crescent ornament, flower arrangement, collar silhouette, costume, wrist adornments and lighting. Check transparent edges on a **dark navy** and a **violet** stage, not only white checkered preview. The supplied masters are 1024 × 1536, short of requested 2048 × 3072 ideal for future high-density crops.

## Test recipe

```sh
npm test
npm run preview:gate-b
```

Review `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`.

Finish shuffle, choose three different cards, then reveal all three real RWS faces. `BEGIN READING` should not be present until the third reveal finishes. Click and watch the celestial transition. Verify the welcome portrait, then advance through Past / Present / Future / combined to confirm the correct four images, the unchanged actual card IDs and orientations, the original question, the rendered scripted readings and mobile scale.

Non-deploying GPU Chromium CI: `.github/workflows/gate-b-physical-review.yml`. The script `scripts/smoke-post-shuffle.mjs` now records two extra Artemis frame captures. Reference image style parity, smoothness and final UI art integration still require owner visual acceptance. Keep PR #24 draft and unmerged. Main / approved Gate A are unchanged.
