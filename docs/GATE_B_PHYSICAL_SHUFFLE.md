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
