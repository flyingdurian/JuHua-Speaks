# Gate C — stage 3–5 concept-fidelity review (visual sign-off REQUIRED)

**Branch:** feat/gate-c-3-5-concept-fidelity. This is a from-scratch replacement for the rejected Gate C/D prototype. The reference is the owner's "Artemis Tarot Ritual Flow Board.png" v2.0 and "Artemis Ritual Flow Concept Sheet.png". This gate deliberately reviews ONLY stages 03–05; do not interpret it as approval of stages 01–02 or 06–08.

## Launch from GitHub checkout

\`npm run preview:gate-c\`

Open \`http://127.0.0.1:4185/preview/gate-c/\`.

It starts directly **inside the sphere** for efficient owner inspection. If a valid same-tab Gate B handoff envelope exists, its exact 78-card order is consumed once; otherwise use one crypto-secure shuffle. No second secret shuffle after Gate B.

## What the owner should assess

1. **03 / Inside the sphere** — full-viewport Japanese-fantasy celestial observatory, gold astrolabe, depth and actual 78 interactive Tarot backs. Drag to look around; tap a visible card (not a UI card).
2. **04 / Select** — first click must succeed; selected card blooms with golden halo and advances toward camera; Past, Present and Future fill independently. Undo works; no fourth card; all card IDs and upright/reversed states preserved.
3. **05 / Lock-in** — after 3 picks, press **Seal the Three**. Exactly 75 non-chosen identities spiral into the actual painted black hole and disappear. Only the three chosen back cards remain in foreground. **Revisit Sphere** restarts this Gate C review; not a new divination.

**Art:** \`assets/gate-c/sphere.webp\` and \`collapse.webp\` are original artwork created for this iteration; both are committed to the GitHub branch, not remote placeholders. Drawn layers and filigree cards remain interactive over that image, with no fake Tarot face data.

## Tests and evidence

\`npm test\` runs Gate C source/asset/HTTP isolation checks. \`scripts/smoke-gate-c.mjs\` uses real Chromium pointer clicks, then screenshots all three visual beats; \`.github/workflows/gate-c-visual.yml\` uploads them as workflow artifacts. Neither CI nor screenshots equal visual approval: owner must compare directly with v2.0 board.

## Boundaries

No merge or production deploy. Gate A/approved Gate B choreography untouched, and no changes to the protected Sequence 2. This phase intentionally stops at beat 05; the next review covers 06–08 (tableau, physical peek, and expressive illustrated Artemis).
