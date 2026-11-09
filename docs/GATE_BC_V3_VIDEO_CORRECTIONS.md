# Gate BC v3 — owner video corrections and review contract

**Status:** implementation on PR #21 (draft, unmerged); not visually approved. Gate A v7 and main are unchanged.

## Latest reference sources
- Owner recording: `Side by side comparison from START TO FINISH SHUFFLING Gate BC v2.mp4`
- Owner recording: `Side by side comparison from AFTER SHUFFLING TO REVEAL Gate BC v2.mp4`

The ChatARot side of the two recordings establishes the desired motion and visual composition; no copying third-party art or code.

## Delivery delta
1. **Automatic Gate B runtime: 16.55s -> 10.60s (5.95s reduction).** Canonical motion is sampled on a compressed timeline, preserving 10 authored beats and 78 stable card identities.
2. **Single organic sheet system throughout.** `OrganicDeck.mjs` now drives the first condensed stack, three 26-sheet piles, merging deck, and suspended GPU instanced renderer. Physical normal-axis layer step 0.0170, sheet thickness 0.0092; planar rank-cluster offsets and arch/bow avoid barcode stripes. A late independent geometry switch is not permitted.
3. **Sphere physically shuffles before the piles.** Three interwoven time-varying card streams move individual sheets in latitude/longitude, then assemble into three independently layered decks.
4. **FINISH -> inside the universe.** A compact physical stack retreats into deep space, its 78 identities unravel, sphere spins rapidly, camera crosses the sphere in one in-page WebGL transition. No portal/cube/iframe/new shuffle.
5. **Interior composition.** The original 78 3D card identities reposition continuously into a denser inward-looking panorama with real front/back/edge geometry, atmospheric clouds, and horizontal-only pan.
6. **Selection.** The physical card lifts modestly, with specular shimmer and gold edge foil computed on the card's own UV coordinates. No detached DOM halo. Three picks are capped and maintain identity and orientation.
7. **Three-card presentation.** Unselected 75 drift/fade into space; chosen three glide into the foreground, then remain as `01. Past`, `02. Present`, `03. Future` showing navy backs. Each user-selected reveal animates a 3D flip/landing into genuine RWS card art + short card-specific interpretation.
8. **Session foil** is randomly chosen once via `secureRandomInt`: Celestial Holographic Wash, Chroma-Shifting Metallic Sheen, Pearlescent Gloss, or Spectrum Activation Wave. The effect is a translucent dynamic overlay; historic source artwork is not changed.

## Reproducible review
```bash
npm test
npm run preview:gate-b
```

Open `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`.
Run `START DIVINATION`, observe deck & three piles, then `FINISH SHUFFLING`, pan horizontally, physically choose three cards, and flip each of the three.

Workflow: [GitHub Actions run 42653053803](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/42653053803) succeeded (source suite + real Chromium WebGL smoke); it produces source screenshot captures and a WebM of the passage into the sphere. Source and browser passes do **not** mean the owner has accepted reference visual fidelity.

## Review gate
Do not merge or deploy until owner assesses at least: timing, smoothness of compact-stack and three-pile organic sheets, real card circulation in the globe, the deck retreat and camera-through-shell transition, interior card density/depth, selected-card shimmer, three floating backs, and foil reveals plus meanings. Artemis/AI integration remains outside this pass.

**No approval inferred from tests.**