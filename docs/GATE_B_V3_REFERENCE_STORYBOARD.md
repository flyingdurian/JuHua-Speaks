# Gate B v3 — Choreography reset and visual acceptance

**Status:** Unmerged visual review candidate; user rejected v1 and v2. Only the automatic **Start Divination → Finish Shuffling** ritual is in scope. Cosmic, Riffle, Wash are withheld from the browser interface and postponed. Production Gate A v7 remains untouched.

## Reference evidence

Source: the existing 30.906s synchronized 1720×720 / 30fps video, **Side by side comparison_Chatarot and Gate B.mp4**, ChatARot on left and JuHua v1.1 on right. Re-inspected the left reference at each second 0–12 and contrasted it with the visible right-hand behavior. The user reported Gate B v2 looked nearly identical to v1, despite its revised sampler.

### What the reference actually shows

| Reference time | Visual event | Critical fidelity rule |
| --- | --- | --- |
| 0–2 seconds | Landing orbit accelerates toward the viewer into a broad, rushing helical formation with multiple depth layers and near-frame motion | **Large camera-space spectacle**, not an immediate central cluster |
| ~2–3 seconds | Cards continue winding toward a compact point; a brief convergence follows | A large moving system visibly contracts |
| ~3–4 seconds | **Small suspended deck** alone in nearly empty space; a deliberate breath after the first rush | A distinct size/negative-space change |
| ~4.5–7 seconds | Cards burst outward into a **second, very large irregular rotating globe** with many backs, a few historical faces, and edge-on profiles | A second independent spectacle **several times larger than the pocket deck** |
| ~7.5–9.5 seconds | Globe breaks into separated visible sub-stacks and shuffles between them | Piles have screen-space separation, not an indistinguishable clump |
| ~10–11 seconds | All groups coalesce into a small physically layered edge-visible deck, floating gently; Finish Shuffling appears | Actual stack (78 identities), restrained text/button, no large slab |

The left video does **not** include the three optional shuffle variants; do not claim equivalence to reference footage we do not have.

## Architectural correction: no more monolithic cluster trajectories

**New file:** \`src/ritual-world/ReferenceRitual.mjs\`. The automatic ritual has been replaced with a **new sampler** and a 10-beat cinematic timeline, not retuned old v2 helix/globe animations. It shares the persistent Gate A v7 world, the immutable 78 RWS card entities, the same camera, and the existing actual front/back mesh geometry. No shader, frame-loop or cloud changes to production.

| Beat | Seconds | Camera-space composition |
| --- | --- | --- |
| approach | 0–1.40 | Orbit cards stream toward the viewer, accelerating into a broad rotating helix with variable depth |
| vortex | 1.40–2.65 | **Large** several-radius helical rush, fast angular motion, near-camera passes, predominantly backs |
| implosion | 2.65–3.30 | Entire helix collapses rapidly into a small suspended **pocket deck** |
| suspension | 3.30–4.40 | Pocket deck holds its place, slight physical rotation, open negative space |
| detonation | 4.40–5.25 | Pocket deck bursts into a second large spherical formation |
| globe | 5.25–7.25 | **Full-size rotating sphere** with real near/far depth, about 16 authentic RWS faces and many navy backs |
| dispersal | 7.25–8.05 | Globe transforms into **three physically separated 26-card piles** |
| three_piles | 8.05–8.55 | Three distinct piles hold, complete card identities preserved |
| pile_shuffle | 8.55–9.45 | Outside pile centres visibly swing in and out with different depth/height trajectories; no hollow ring |
| consolidation | 9.45–10.80 | Three piles feed staggered streams into the original **78-layer compact physical deck**, with a visible thin edge |

### Fundamental composition checks

The full 78-card projection in an 860×720 view with a 58° camera field has these **card-center** horizontal envelopes (not card-edge bounds):

| Beat (sample time) | Approximate projected width |
| --- | ---: |
| Vortex / first grand spectacle, 1.9s | 508 px |
| Small deck, 3.65s | 41 px |
| Large globe / second spectacle, 5.7s | 510 px |
| Three separate piles, 8.3s | 411 px |
| Finished compact deck, 10.8s | 37 px |

These are analytic geometry results, **not screenshots from a GPU browser**, and are intended to prevent the previously reported compact-cluster regression. When all 78 identities are inside the sphere, the full mesh extent also includes card widths and heights. No new card IDs or deck textures are generated.

### Physical/technical safeguards

- Preserve actual front/back RWS textures and physical normals; globe presents deliberate mixed face/back profiles (16 fronts out of 78 at the stable sample).
- Restore genuinely stacked card-edge thickness \`0.0145\`, roughly matching the packed layer spacing \`0.0145\`. The stone-like Gate A landing cards keep their existing geometry because this option applies only to Gate B \`PHYSICAL_CARD\`.
- Use smooth positional and spherical orientation interpolation across stage boundaries. All 78 vertices remain finite and physically valid; rendering is tested through the real mesh builder, not only the animation state.
- Respect the actual landing entrance orientation (inside-out or outside-in), even if Start Divination is pressed while landing entry is underway.
- The renderer still uses one persistent WebGL canvas, Canvas2D fallback, one camera and 78 original artworks. The AI, session DB, draw probabilities, Exodia, Step 6 and production are untouched.
- The optional shuffle samplers remain in source for future independent work but **are not exposed in the v3 review UI**. Do not devote Gate B visual QA to them now.

## Visual review requirements

1. Run \`npm run preview:gate-b\` from \`feat/v083-gate-b-physical-shuffle\`. Open \`http://127.0.0.1:4184/preview/gate-b/\`.
2. Press **START DIVINATION**. Within 1–2s, you should see an **energetic near-camera orbital rush**, not cards simply flying into a little egg-shaped column.
3. Watch an obvious **small, mostly empty, suspended-deck pause** at ~3–4s. The next beat should **explode outward into a globe much larger than the pause stack**, around ~5–7s.
4. The globe must be a convincing 3D arrangement, showing some historical card faces, backs, edge profiles, and near/far positions. A dense featureless pile of 78 blue backs is an automatic failure.
5. At ~8–9s, there must be **three visibly separated piles** moving between one another, followed by a staggered, physically legible consolidation into the complete 78-card deck. The final card stack should be small with visible edge thickness, never one single fake face.
6. The only post-formation user CTA is **FINISH SHUFFLING**. There are deliberately **no Cosmic/Riffle/Wash buttons** in this review; that work is postponed. The button reports that Gate C is not yet built.
7. Inspect performance in Chrome/Edge GPU and mobile fallback; no missing artwork, disappearing cards, broken texture orientation, sharp temporal jumps, excess allocations or errors. CI checks spatial envelopes, XYZ mesh validity and beat continuity; **visual fidelity requires an actual browser review**.
8. Do not merge, deploy, or begin Gate C until the Product Owner approves the visual performance. Gate A v7 and the separate friend review remain untouched.

**Video assessment discipline:** Compare equivalent points in the **automatic** ritual only, not user-created optional shuffle screenshots. Passing calculations/CI is necessary but not proof of a satisfying cinematic. If the visual still looks clustered, prioritize correcting physical screen-space distribution and camera composition—not adding superficial particles or more UI.
