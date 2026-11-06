# Gate B v8 — Sequence 1-only reconstruction

## Owner direction, 2026-11-06
- **Sequence 1: rejected.** v7.1 numerical proxy pass was not a visual pass.
- **Sequence 2: visually accepted. FREEZE IT.** Approved checkpoint: `checkpoint/gate-b-v7-1-sequence2-approved-2026-11-06` at `ae7deb5479cc7570cc6270f2b23fce64f228653b`.
- Required ±13% **Sequence 1** visual-composition proxy threshold, *plus* actual motion/identity review. No timing stopwatch requirement.
- PR #10 remains draft/unmerged. Gate A production, 78 Tarot identities/draw semantics, three-deck finish and Gate C remain untouched.

## Why the prior implementation looked wrong
The owner reference is not a simple revolving card sphere or fourfold ring. Over the benchmark's ~3.1–4.2s shot, several physical Tarot ribbons appear to recede into a deep spiral, the viewer's perspective changes from looking down the tunnel to observing a *near-edge-on vertical cyclone*, a few real illustrated sheets pass close to the lens, and the rest contract into one complete deck. Atmospheric filaments follow actual physical paths and must not replace them. Earlier geometry-camera combinations caused a broad wreath, a horizontal dumbbell, or a thin empty DNA-like line.

Reference-derived composition: the dominant dark-card field's principal axis advances from ~53° (t3.2) through 70° (t3.5) and 75° (t3.85) to about 83° (t4.1). These are approximations derived from the owner's actual split-screen movie, *not* invented acceptance of perceptual fidelity.

## New stage-one architecture
- `VortexRibbon.mjs` is a new, pure, deterministic physical-sheet transport for the original persistent 78 cards. Three coherent 3D paths (52/18/8), real near/far depth, accelerating angular advection and inward radial compression.
- Stage-one camera **pitches** the physical tunnel from approximately face-on into a tall edge-on cyclone; a spline rail directs the same object without flattening it into a background decal.
- Six real sheets perform continuous, bounded camera flybys near the terminal vacuum surge, exposing rare full illustrated RWS fronts while most distant cards appear as small blue backs.
- `FlowMist.mjs` samples the exact same ribbon material path, never a separate rotating 2D tornado. All trails vanish outside the first sequence.
- Only the `suctionPose` and import in `ReferenceRitual.mjs` changed. Every byte beginning `function pocketPose(` (all following steps, including approved globe choreography) is frozen. Test fingerprint: FNV32 `3b577ed3`.
- No requirement to finish in the old 10.8-second window.

## Review contract
- Fixed seed: `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in` using `npm run preview:gate-b`.
- Record real WebGL2 video and 16 time-coded screenshots with `scripts/capture-gate-b-v8.mjs`.
- `scripts/score-gate-b-v8.py` enforces ±13% on four aligned first-sequence dark-card composition keyframes (coverage, width/height, centroid). Sequence 2 is excluded from re-scoring, since it is already visually approved.
- Composition proxies alone cannot prove ±13% perceptual fidelity or true choreography. The Product Owner retains explicit final visual approval.
- Review reference's physically connected helical arcs, parallax, camera movement, sheet orientation, close passes, collapse and final complete deck. Reject if any visual hallmark remains materially wrong even when CI is green.

## Workflow
Keep detailed screenshots, motion review and CI measurements here and in Actions artifacts. Chat milestone updates remain delta-only. Do not merge PR #10 until explicit approval.
