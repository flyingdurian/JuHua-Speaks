# Gate B v7 — Reference-fidelity review protocol (2026-11-06)

**Visual status: REJECTED UNTIL PROVEN OTHERWISE.** No automatic promotion, no Gate C, no production deployment. This supersedes v5/v6 coverage-only acceptance checks.

## Footage and actual diagnosis
User's updated 14.13s 1720×720 @30fps split-screen **Side by side comparison_Chatarot and Gate B v6.mp4** (ChatARot on left, v6 on right), examined frame-by-frame. Source remains outside GitHub.

**Sequence 1 — reference, film timestamps ~2.9–4.5s:**
- At ~3.15–3.65s, multiple receding, tilted spiral layers rotate through a dark *interior tunnel*, with intermittent close Tarot faces crossing the viewer. The outer helix moves offscreen while inner, smaller cards remain visible at different depths.
- At ~3.9–4.2s, the physical field contracts rapidly, including foreground size changes. Faint curved, translucent atmospheric filaments follow the vortex; they are not a stationary spinning tornado texture.
- ~4.4–5.1s: the cards rapidly form a single small physical deck against generous black negative space.

**Sequence 2 — reference ~5.8–8.3s:**
- The tiny suspended deck erupts into a visually round, mostly hollow globe of distinct near/far sheets.
- Exterior silhouette remains legibly spherical while individual illustrations, backs, and edge-on cards turn with varied local attitudes. Near hemisphere has large, identifiable RWS fronts; deeper back cards create layered volume.
- Three physical deck stacks and final consolidation follow; there is no requirement to match exact playback seconds.

**V6 failure:** a shallow swarm, early oversized backs, overdraw and an occluding central 3D pile; an atmospheric effect could not mask the motion deficit.

**V7 initial GPU failure:** independently advected geometry still produced early giant cards and a later rotating wreath. Thus v7 added a compensated virtual camera dolly, reduced near-throat dwelling and card scale, and replaced quasi-random distribution with four ordered helical transport filaments, shared by rendered gas streaks.

## Acceptance standard: meaningful ±10% tolerances
The Product Owner requested visual deviation no worse than ±10%. This must be *measured on reference-aligned visual beats* rather than falsely declaring a single invented pixel similarity percentage:
- **Spatial envelope:** normalized 2D card-field width, height, centroid and circle/shell aspect ratio within ~10% of hand-identified reference keyframe envelopes.
- **Card-size distribution:** near-card projected sizes, median visible size, and ratio of far tiny cards to oversized close cards within ~10%, after matching semantic keyframes instead of wall-clock times.
- **Depth motion:** independently moving near/middle/far cards must show visual parallax and coherent spiral direction, including a recognizable dark throat; no ring of fixed-depth billboards.
- **Globe occupancy:** legible circular silhouette, comparable negative space, mixed illustrated fronts/backs/edges, no flat pile. Compare coverage, projected shell occupancy and edge activity to reference with ±10% tolerances where metrics are measurable.
- **Qualitative human judgment:** a reviewer must recognize both sequences as the same *kind of spatial performance* as ChatARot without explanation. These four numeric proxies are necessary, **not sufficient**. Do not claim 90% fidelity from code tests or CI.

## Current architecture
- `TunnelDynamics.mjs`: one time-dependent 3D material field with axial transport, depth and angular motion, virtual camera dolly and a few bounded near passes.
- `ReferenceRitual.mjs`: cards sample the material field; globe is a rotating Fibonacci-distributed shell with independently varied card attitude.
- `FlowMist.mjs`: multiple small motes and thin filaments sample the *same* material field. No old rotating decorative tornado.
- Browser WebGL2 proof: `.github/workflows/gate-b-visual.yml` captures a full ~17s ritual recording and 16 true time-sampled screenshots. Compare to the owner's source video, not geometry tests.
- `RITUAL_DURATION=16.55` is a creative choice for this draft only, **not a hard timing acceptance constraint**.

## Release discipline
Branch `feat/v083-gate-b-physical-shuffle`, PR #10 draft, production Gate A v7 untouched. Rollback anchor `checkpoint/gate-b-v6-rejected-2026-11-06`. Do not merge until the owner *explicitly* visually approves and the reference-aligned comparison contract passes. Preserve the 78 RWS IDs, deterministic draw, AI/session systems and three-deck finish.
