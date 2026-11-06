# Gate B — Physical Shuffle Preview (v0.8.3, draft)

**Status:** Feature branch only. **Do not merge** until Product Owner approves visual choreography from an actual GPU-enabled browser recording. The approved v7 landing remains in production and the frozen \`review/gate-a-v7-approved\` branch remains untouched.

## First playable Gate B implementation

### Persistent scene
- Uses the existing Gate A v7 \`RitualWorld\` WebGL2 canvas and **the same 78 immutable card identities/textures**; it never mounts a second 3D scene during the ritual.
- A pure, deterministic \`ShuffleChoreography.mjs\` samples positions and attitudes at any time for accurate testing, seeking and future timeline editor support.
- The Canvas2D fallback calls the **same motion sampler**; it renders each physical card back and has the same control lifecycle.
- All shuffle sequences use **one uniform physical Tarot card size** (1.28 × 2.12 world units), unlike Gate A's varying perspective/card presentation sizes. Individual stack layers are distinct; the finished deck has measurable thickness and correct orientation.
- No card receives an invented illustrated front or invisible hitbox; faces are backed by authentic RWS atlas materials, with backs toward the viewer during shuffling.

### Automatic six-beat choreography
1. **Question submit:** Capture the visual positions of the 78 current orbital cards (no re-seeding or replacement).
2. **Recognizable vortex recognition:** Over ~1.15s, cards converge into an orderly helical tornado suspended in the celestial scene.
3. **Held tornado:** Continue coherent rotational motion in a visible 3D column with controlled radius, vertically stratified cards, and dark backs—no uncontrolled front-up piles.
4. **Collapse:** From ~4.55s onward, settle progressively from the tornado into assigned card-deck layers.
5. **Deck formed:** At ~6.6s, all 78 cards occupy one physical, slightly tilted, hovering deck with thickness; no single-card illusion.
6. **Selection of optional shuffle:** Three differentiated choices appear only when the deck has fully formed.

### Mechanically distinct optional shuffles
- **Cosmic:** Separate the deck into two suspended counterlayer rings rotating in a controlled celestial pattern, then return to a complete physical deck.
- **Riffle:** Split into **two distinct 39-card stacks**, bend and interleave with a defined arched bridge, then close/compress into one 78-card deck.
- **Wash:** Spread 78 backs across one shallow plane, circulate in a bounded casino-table wash, then recollect the whole deck.
- Variants take roughly **4.7 / 4.8 / 5.2 seconds** respectively. None performs the same generic explode-and-spin animation.
- The end condition for every sequence is the *same canonical deck pose*. "Finish Shuffling" currently reports Gate B complete; the subsequent cosmic launch and 78-card selection sphere belong to Gate C and are **not fabricated** here.

## How to run Gate B safely

From the \`feat/v083-gate-b-physical-shuffle\` branch:

\`\`\`powershell
npm run preview:gate-b
\`\`\`

Then open \`http://127.0.0.1:4184/preview/gate-b/\`.

The startup command imports and audits original RWS images before preview. The local server binds **127.0.0.1 only**. It cannot affect the production page, public AI, Exodia or Tarot draws.

## Visual acceptance gates

- **B1** — Automatic 78-card tornado, coherent physical shape, no sloppy face-up collage. Capture 10–15 seconds from question submission through deck collapse.
- **B2** — Deck has visible thickness with many layered cards and is clearly one full 78-card object, not one card. Camera may orbit gently, but must never recreate the world or reseed card IDs.
- **B3** — Record all three variants separately. Cosmic must resemble celestial rings, Riffle must show two stacks interleaving and closing, and Wash must resemble bounded physical table mixing. All three must have smooth entry/exit to the canonical deck.
- **B4** — Pause/resume, restart ritual, render on low-power fallback/mobile, check no card artwork missing or rigged selection, verify keyboard/button UX.
- **B5** — Inspect \`window.__ritualGateB.diagnostics()\`: \`shuffle.phase\`, \`shuffle.style\`, \`shuffle.beat\`, \`stackedCards:78\` when deck formed, no lost card identities.
- **B6** — App enters Gate B by explicit question submit only and does not send anything to Exodia, the OpenAI API or an unapproved backend.

### Exit criteria
Passing CI is an engineering gate, **not** a visual-quality judgment. Product Owner approves B1–B3 from actual browser-recorded demonstrations. Gate B stays unmerged until approved. Gate C does **not** begin until Gate B has a stable, satisfactory physical ritual.

## Gate B v1.1 hotfix — Invisible card renderer (2026-11-06)

**User test:** Landing cards are visible, but clicking **START DIVINATION** leaves only stars/CTA; the tornado, deck collapse, and all optional shuffles are visually absent. The UI still advances because a separate status timer runs normally. **This is an actual rendering regression, not a browser-setting issue or a request for a video.**

### Root cause

`ShuffleChoreography.mjs` defined a faulty 3D cross product as an array of two values rather than three. The computed `right` and `up` orientation vectors therefore had no Z component. `CardSurface.appendPremiumCard` uses all XYZ components, so each vertex contained invalid coordinates (NaN) and the GPU discarded the mesh. The Canvas fallback was affected as well. The existing tests checked pose counts and X/Y/Z position, but **failed to verify all three orientation-basis components and generated mesh vertices**.

### Corrective action

- Restore the full `cross(a,b) = [a.y*b.z - a.z*b.y, a.z*b.x - a.x*b.z, a.x*b.y - a.y*b.x]` implementation.
- Before starting each shuffle type, validate all 78 cards' position, orientation basis and scale at representative time points; reject a broken sequence before changing world phase.
- Surface a persistent **SHUFFLE RENDER ERROR** in the preview if preflight fails, rather than proceeding with a blank sky and inaccurate shuffle completion message.
- Add regression tests that generate the **actual GPU vertex arrays** through `appendPremiumCard`, require every coordinate to be finite, every orientation vector to have length three, and confirm deck/tornado centers project into the camera frame.
- Direct reproduction using the exact repository motion and mesh functions: **before** correction: 134,784 non-finite vertex values among 269,568 values per frame; **after** correction: 0 non-finite values across all tested phases and all four shuffle styles. All test phases project at least 70 card centers into a 720p camera reference (most project 78/78).

### Required browser retest

1. Refresh the local Gate B preview after pulling the new branch commit; press **START DIVINATION**. **Within the first second** you must see the same 78 cards visibly converging toward a helical tornado, with no blank frames.
2. Observe the complete ~6.6-second tornado and collapse; the fully formed deck must appear hovering in the center with physically distinguishable thickness.
3. Select Cosmic, Riffle and Wash individually; the cards must stay visible during each sequence and return to the same deck.
4. Check DevTools Console for JavaScript errors and `window.__ritualGateB.diagnostics()` for `stackedCards:78` once the deck has formed. If the fallback renderer is active, it must also remain visible.
5. The visual quality of choreography remains subject to Product Owner approval. Green CI proves valid coordinates and APIs only—not that the motion looks as polished as the reference.

**Release policy:** Keep PR #10 draft and unmerged. Do not modify production Gate A v7 or proceed to Gate C.

---

# Gate B v2 — 30.906-second video choreography audit (November 6, 2026)

**User-provided evidence:** "Side by side comparison_Chatarot and Gate B.mp4", 1720×720, 30fps, 30.906 seconds. ChatARot reference is on the **left** and JuHua Gate B v1.1 is on the **right**. The footage is a local review attachment; do not copy the benchmark video into this GitHub repository.

## Verified visual timeline (approximate video seconds)

| Time | ChatARot benchmark (left) | Gate B v1.1 (right) | Director's correction |
|---|---|---|---|
| 0–2s | Start CTA: existing cosmic orbit surges toward a central region, changing depth and velocity | Cards abruptly converge into one compact card cluster | Use a progressive, visible high-speed helical gather; keep 78 physical entities |
| 2–4s | Depth rush and swirling/helical cloud, intermittent dramatic reframing | A dense column of predominantly blue backs forms and largely holds shape | Maintain coherent multi-depth whirl, no dead-air/static cluster |
| 4–7s | An irregular 3D mini-globe, rotating with a mixture of RWS fronts, blue backs, silhouettes and near passes | The same packed column with limited depth contrast or identity | Explicit spherical rearrangement with modest (~12/78) face visibility |
| 7–10s | Rotating globe resolves into separate card groups/piles, then consolidates into a single compact physical deck | Abrupt collapse to an oversized, front-on card stack around 7–8s | Three 26-card piles before progressive recollection into a small edge-visible stacked deck |
| 10–13s | A small deck floats slowly with its edge turning into view and a minimal Finish Shuffling CTA | A large deck and prominent bordered options overlay dominate | Scale and angle to a slender physically stacked deck; shrink/soften controls and meditate copy |
| 14–18s | Still a small deck; custom shuffles not demonstrated in the reference | Cosmic creates two conspicuous rectangular-looking rows rather than convincing physical card streams | Two 39-card coherent moving halves that unfurl into coordinated trajectories |
| 19–23s | Still a small deck | Riffle panels overlap and separate without a clear physical bend/interleave | Two halves, alternating staggered interleave events, a distinct arch/bridge, and closure |
| 24–30s | Still a small floating deck | Wash makes a hollow ring of backs, leaving an obvious empty middle | Phyllotaxis-based populated center, shallow-plane sliding, restrained overlapping/circulating motion |

**Important:** The benchmark footage contains the ChatARot **automatic** shuffle only; our three optional shuffle variants have no reference equivalent in this video. Their new choreography is an original physical treatment, not a claim to reproduce unavailable reference variants. Video timing may be offset slightly by clicking and recording synchronization.

## Gate B v2 technical implementation

- **Persistent GPU world**: no new renderer, card identities or changes to original 78 RWS artwork.
- **Seven authored automatic beats, 9.45s total:** gather (0–1.30), tornado (1.30–3.05), tornado→globe (3.05–3.90), globe (3.90–5.95), globe→three piles (5.95–6.95), three piles animate (6.95–7.80), staggered three-to-one consolidation (7.80–9.45). The longer duration reflects observed reference choreography and must be judged visually, not only by seconds.
- **Actual starting pose:** use the real current Gate A entrance mode (\`inside-out\` or \`outside-in\`), including users who click while entrance animations are underway; the path begins from existing card positions, not hardcoded stale orbit positions.
- **Compact physical deck:** individual slots still have finite XYZ basis and separate layer thickness; v2 uses thinner card cross sections for the physical paper deck (\`PHYSICAL_CARD.thickness\`), leaving the original stone/slab Gate A rendering geometry unchanged. Deck scale ~1.14 rather than 2.23 and yaw ~1.14 radians rather than ~0.2, producing a smaller edge-visible finish.
- **Cinematic visual hierarchy:** the automatic meditation line remains legible without a large competing title. The controls and replay panel sit below the deck, with reduced size and softer glass. Same pre-existing celestial backdrop from Gate A v7.
- **Cosmic:** split 39/39, unfurl coordinated paired streams, orbit/fan in opposing directions, reconstitute the original complete deck.
- **Riffle:** split 39/39; stagger alternate physical entries across the 78 distinct identities, form a visible arched bridge, then close the deck.
- **Wash:** fill a bounded elliptical tabletop plane, slide cards along shallow overlapping trajectories, and progressively gather to a complete deck; never form an empty central ring.
- **Stable orientation:** spherical interpolation of opposed card normals during transitions avoids sudden flipped orientations; complete orthonormal XYZ basis and finite vertices are validated at many timestamps. No card is a fake single-card deck.
- **Canvas parity:** fallback now shows the true RWS face when a card physically rotates toward the viewer during the globe stage (not just during landing), using the same choreography as WebGL.

## Engineering acceptance and actual browser gate

1. CI must validate 78 persistent IDs, all seven authored beats and their order, 3×26-card temporary pile topology, final 78-card canonical deck, 39/39 Riffle, no hollow wash center, and differentiated paths.
2. A direct 3D check confirmed **zero invalid GPU vertex values** across evaluated key timestamps for automatic/Cosmic/Riffle/Wash; all tested stages project 69–78 of 78 card centers inside an 860×720 comparison viewport. This is **not** proof of attractive or physically collision-free motion.
3. Boundary tests sample either side of each beat transition and bound sudden position jumps, rather than testing the first and last frame only.
4. Re-run \`npm run preview:gate-b\` on the draft branch, watch **the entire automatic 9.45-second performance** before testing optional shuffles. Compare the sequence with the uploaded left/right video: depth rush, energetic spiral, rotating globe, triple deck piles, compact stack.
5. Observe each variant individually: Cosmic should not be two motionless rows, Riffle must visibly alternate and bridge, Wash must not form a hollow wreath. Reassess whether card scale and orientation are natural.
6. Confirm no rendering disappearance, no missing historical art, no resource or device stability regression, and no Step 6/Exodia code changes.
7. Product Owner must approve an **actual GPU browser recording** of Gate B v2 before Gate B merge or Gate C. Passing CI is not visual approval.

**Status:** Gate B v2 is a draft visual candidate. Production Gate A v7 and the approved friend-review branch are protected. GitHub PR #10 remains unmerged. The new choreography is original source code, not a copy of the reference app's code or assets.
