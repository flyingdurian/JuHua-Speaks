# Gate B v5 — Cosmic Vacuum and Tumbling Tarot Globe

**Draft, unmerged, unapproved visual candidate.** Keep production Gate A v7 and the friend-review snapshot unchanged. The optional Cosmic/Riffle/Wash choices remain hidden.

## Reference evidence

The 15.813-second, 1720×720, 30 fps uploaded video named Side by side comparison_Chatarot and Gate B v4.mp4 shows ChatARot **left** and JuHua Gate B v4 **right**. We inspected the whole video through 0.5–15.0-second contact sheets plus the two user-supplied screenshots. The reference itself is not copied into the repository.

## Actual motion differences and rebuilt behavior

| Moment | ChatARot benchmark | V4 deficiency | V5 implementation |
| --- | --- | --- | --- |
| 1.5–2.5s | Luminous multi-lane cosmic tornado, deep movement into its throat, negative space | Stationary decorated ring of navy backs in a flat purple gradient disc | Four **advecting** helical streams, 2.65 turns in genuine Z depth, accelerating angular rotation, open center; seeded organic silver/green/violet gas backdrop |
| 2.7–3.3s | Some huge natural near-lens fronts/backs whip past, then the whole field funnels into a deck | Cards were uniformly small and did not travel convincingly through the camera | A **small subset** of cards makes individually timed close passes; all 78 converge into distinct physical stack layers |
| 3.6–4.4s | Small suspended deck surrounded by mostly empty space | Acceptable | Preserve the complete small real 78-layer deck and minimal meditation UI |
| 4.5–7.1s | Large, dense, violently tumbling 3D globe of historic illustrated fronts, backs and side silhouettes | Too sparse, neat, single-radius and distant | 39-card outer shell + 25 inner cards + 14 roaming foreground cards; varied sizes, depths, phase velocities and independent full 3-axis spins; rapid early detonation |
| 7.1–10.8s | 3 physical decks exchange cards and settle into one compact deck | 3 groups remained too mechanical | Three real 26-card subdecks with staggered per-sheet transfers, fanned intermediate deck and gentle consolidation |

## Changes and safeguards

- The automatic choreography remains isolated in src/ritual-world/ReferenceRitual.mjs and shares the persistent Gate A camera, RWS textures, 78 original card objects and the WebGL/Canvas fallback.
- The funnel is now physically **advecting**, rather than cards turning in place around fixed assigned depths. Far cards stay small, the smoke remains visible between them, and only a few near-lens whips briefly cover large screen areas.
- A separate VortexAtmosphere.mjs generates a 4-arm, noise-textured, smoky silver-green spiral once per load at 512×512 desktop or 352×352 low-power. CSS rotates one composited image; there are no JavaScript repaint loops or extra WebGL contexts. The old purple conic-gradient discs are disabled.
- The sphere uses three real 3D depth families with independently tumbling historical fronts/backs; the user can see inner layers, outer cards and near passes.
- No new Tarot draw logic, backend requests, AI calls, user history schema, changed odds, or Step 6 changes.
- The optional shuffle options remain out of scope. The only post-ritual action is Finish Shuffling, which marks the next Gate C feature boundary.

## Hard visual-density regression tests

Tests project the actual four oriented corners of each physical card onto the benchmark-sized 860×720 camera and count overlapping sampled pixels. **These are numerical projections, not actual GPU screenshots.** They guard against previous CI false positives that measured card-center span alone.

| Phase | V5 sampled screen coverage | Maximum card-on-card overlap |
| --- | ---: | ---: |
| Helical vacuum 1.9s | 14.7% | 3 |
| Deep funnel 2.4s | 15.8% | 5 |
| Brief near-camera sweep 3.05s | 40.7% | 12 |
| Small completed deck 3.7s | 1% | Intentional 78-layer stack |
| Early explosive globe 4.7s | 43.2% | 6 |
| Tumbling dense globe 5.8s | 54.8% | 6 |
| Tumbling globe 6.5s | 52.5% | 6 |
| Three decks 8.3s | 3% | Intentional 26-layer stacks |
| Final 78-card deck 10.8s | 1% | Intentional layered stack |

The exact polygon and orientation tests also verify the funnel's near/far distribution, short-lived giant passes, 3×26 physical decks, actively transferring individual cards, final canonical deck, full XYZ GPU vertices, and no jumps exceeding the acceptable high-speed motion envelope. A mocked Canvas test verifies organic gas alpha, four drawn spiral streamlines, and zero painting every frame.

## Browser review

From feature branch feat/v083-gate-b-physical-shuffle run:

    git fetch origin
    git switch feat/v083-gate-b-physical-shuffle
    git pull --ff-only origin feat/v083-gate-b-physical-shuffle
    npm run preview:gate-b

Open http://127.0.0.1:4184/preview/gate-b/ and hard-refresh. Verify the header displays Gate B v5. The main checks:

1. At 1.5–2.5s, a dynamic **cosmic suction tunnel** with deep receding card paths and grey-green smoky vortex; not a card ring.
2. Near 3s, huge foreground cards sweep past the camera before a small, complete deck forms.
3. Around 4.7–7.1s, the second performance blooms rapidly into a layered, irregular, violently tumbling sphere; historical fronts, backs and edges are clearly mixed.
4. After 7.1s, three separate physical decks exchange individual cards, then settle into one compact, gently suspended deck.
5. Only Finish Shuffling appears; optional shuffles are postponed. No missing art or invisible mesh in WebGL or Canvas fallback.

**Acceptance policy:** CI green and numerical screen-space analysis are necessary but not sufficient. No GPU browser recording has yet been verified by the assistant for v5. Keep PR #10 draft, unmerged and undeployed until the Product Owner approves the actual visual choreography. Gate C remains blocked.
