# Gate B v4 — The Cosmic Vacuum / Card Globe Rebuild

**Status:** DRAFT / not deployed. Gate A v7 production remains untouched. This is a fourth automatic-ritual candidate after the Product Owner rejected v1–v3 for consistently appearing as compact clusters. Cosmic, Riffle, and Wash remain out of the preview.

## Recorded evidence

The newly supplied video is \`Side by side comparison_Chatarot and Gate B v2.mp4\`, **15.371 seconds**, 1720×720 at 30fps: reference ChatARot **left**, JuHua **right**. It was sampled at 0.75-second intervals, with close inspection of the left reference at 2.20s and 5.80s. This is a different local file from the older 30.906s comparison; do not conflate their durations.

- **~1.4–2.6 seconds, reference:** a broad visible *cosmic vacuum* funnels cards through a huge luminous spiral with multiple near/far paths, sparse silhouettes, occasional historical illustrations, and striking natural empty space at the center. **JuHua v2:** cards all rush into a dense wall of uniformly sized backs.
- **~2.8–4 seconds:** cards rapidly converge into a small suspended physical deck. There is deliberate negative space while it rests.
- **~4.4–6.8 seconds:** the pocket deck blossoms into a large, irregular *open* spherical collection: many physically turning individual Tarot cards, some historic RWS faces, some navy backs, some edges. It is **not** a pile of 78 giant card rectangles on the same plane. JuHua v2 showed a mostly solid, clustered clump here.
- **~7–9 seconds:** groups collapse into three physically separated sub-decks and shuffle to a combined stack; the final silhouette is a small, gently hovering blue-backed deck.
- **~10–15 seconds:** the reference holds the small deck with Finish Shuffling. The example does not show optional Cosmic/Riffle/Wash; those features have been intentionally excluded from this gate.

## Why previous passing tests were insufficient

The previous "wide enough" tests used ONLY the projected **center-to-center spread** (e.g. a 500px envelope). They never accounted for the widths, heights, attitudes, or overlap of the actual cards. So 78 oversized faces could have distant centers while still forming an opaque mass.

V4 fixes the scene geometry, not merely the tests:

1. **5-turn spatial vacuum:** 78 cards are distributed over an approximately 30-unit Z range, moving rapidly around a tapered helix with actual close, medium and far layers. This produces a visible central funnel instead of a wall at one depth. Individual card scale depends on Z: some giant near-camera passes, many small distant cards. Back/front orientation and roll vary with physical turning motion.
2. **Compact real deck:** each card follows an accelerated funnel path into its distinct physical stack slot, with layer spacing matching its geometry thickness. The pocket deck briefly holds in almost empty space.
3. **Immediately explosive second expansion:** the pause deck rapidly erupts into a Fibonacci-distributed spherical arrangement. The sphere radius is **7.8 world units** (larger than v3's 5.2), located **-21 Z** (instead of v3's -14.7); individual cards scale **0.69–0.85** instead of approximately **1.13–1.31**. The sphere's surface occupancy is much lower, leaving significant air between cards and creating visible separate front, back and edge silhouettes.
4. **Three real 26-card decks:** cards resolve into three separated stacks. During the quick shuffle, cards leave the two outer decks **one at a time at staggered delays**, interleave toward the center and join a fanned intermediate 78-layer deck; the last beat gently settles the fan into the same canonical floating deck. The three piles never act merely as rigid props.
5. **Secondary atmospheric cue:** a faint rotating lilac vacuum light exists *behind* the full 3D cards only during the first cosmic funnel. It stops during the globe/deck beats, adds no new WebGL context, is CSS composited, and is static under reduced-motion preference. This reinforces the actual helical motion, not a replacement for it.
6. **Scope and compatibility:** Same persistent renderer, camera, existing 78 Rider–Waite–Smith IDs, valid atlas textures, single session/draw model and historical card art. No changes to production Gate A, Step 6 reading, AI/Exodia, guidance, odds, or session database. The three optional shuffle buttons are still hidden.

## New acceptance instrument: true-card screen overlap

\`test/ritual-world-gate-b-v4.test.mjs\` rasterizes **the four projected corners of every real physical card** into a 100×80 occupancy grid, using the existing reference camera 860×720 / 58° FOV. It checks overlap and population, not just center spread. All results below are analytical projections of genuine sampler geometry, **not browser video claims**.

| V4 point | Derived result | Meaning |
| --- | --- | --- |
| Vacuum at 1.9s | 6.1× near/far depth; 16 near, 27 far; center overlap 0; max overlap 6; average overdraw 1.72× | Large deep open spinning tunnel, not a compact wall |
| Pocket deck at 3.7s | ~0.9% of screen sampled coverage | Required breathing room and scale contrast |
| Detonation at 4.7s | ~16.6% sampled coverage; only 1 projected card at center | **Already expanded** rather than staying a compact clump |
| Globe at 5.8s | ~16.0% sampled coverage; only 3 max overlapping cards; average overdraw 1.15×; 16 front-facing illustrated cards | Airy, readable card sphere |
| Three decks at 8.3s | Exactly 26 cards per deck | Real layers, not three single props |
| Transfer at 8.9s | Simultaneously waiting, moving, and arrived cards | Actual shuffle action, not three rigid stacks |
| Finished deck at 10.8s | Same physical deckPose on all 78 entities | Deterministic and replayable |

Screen raster tests also check that the initial vortex covers a substantial area without filling it as a solid wall, that far and near cards coexist, and that the early explosion increases visible coverage sharply.

## Browser review (hard gate)

1. Fetch and check out \`feat/v083-gate-b-physical-shuffle\`, \`npm run preview:gate-b\`, then open \`http://127.0.0.1:4184/preview/gate-b/\`. Hard refresh after updating the branch. Version label should read **Gate B v4**.
2. Press **START DIVINATION**. For the first ~2.6s verify a physically broad cosmic helix with empty central funnel, near-camera size changes, far-off cards and fast rotation. **Automatically reject** a cohesive face-up/back-up card-wall clump.
3. Confirm every card flows into the small visible layered deck, then the second formation promptly balloons into a **large sparse sphere** with obvious gaps and many differently oriented historical illustrations/backs.
4. The sphere splits into **three physically separated stacks**, then individual cards animate across the piles. The final assembly is gentle, a small full deck, not one single oversized face.
5. Only **FINISH SHUFFLING** is offered. The optional shuffles remain postponed. Do not confuse the temporary Gate B review with Gate C sphere-selection implementation.
6. Inspect actual Chrome/Edge GPU motion at normal speed (and optionally 0.25× recorded speed), Canvas fallback, mobile, reduced motion and resource usage. **Only Product Owner approval of browser imagery completes Gate B**. CI passing and screen-raster tests do not prove visual choreography quality.

**Rollback:** Gate B v3 is preserved in branch history at \`51541c0a400a8e9c31d792a8b85a722f77d541b0\`. Public Gate A v7 is unchanged; PR #10 remains DRAFT and UNMERGED. Gate C remains blocked.
