# Gate C/D fullscreen sphere and peel — review handoff

## Owner directive
Reject Stage 3 Celestial Chambers. Restore continuous gate progression. Gate C enters a fullscreen inside-out 78-card sphere via a scripted geometric gate-flight inspired by Gate A's square/cube language. Selected cards rise forward with a halo, not an immediate fly-away; a complete three-card lock collapses the other exactly 75 distinct semantic card identities into a vortex. Stage D keeps Past/Present/Future floating with actual RWS faces underneath bendable backs. After all three reveals, invite Artemis.

## Implemented on this isolated branch
- New pure `src/gate-sphere-view.mjs`: no rounded chamber, viewport-sized renderer, overlay HUD, 3 choices, orbit controls and 2D fallback.
- Keep one WebGL sphere mounted when selecting/unselecting; `syncSelection` updates marks while camera animation continues.
- Extend selected lift to 1.42 world units, with original WebGL halo.
- Gate entrance: 2.35s scripted square-depth tunnel using landing geometry language; **not yet a literal reuse of Gate A's GPU model**.
- True 75-ID black-hole DOM visualization with staggered rotation and three persistent highlighted selections; no re-draw, no AI call.
- Three-card peel: real `cardFace`/RWS imagery exposed beneath independently clipped/directionally curled backs. Left/right/top/bottom + all four corners; pointer drag accumulates partial progress, tap adds 23%, optional instant reveal and reduced-motion.
- Artemis: three selectable Japanese-inspired costume/color/motion directions (Shrine, Modern, Storybook); six action/expression states; all are explicitly marked **procedural blocking studies, not final illustration**.
- Preserves local-only scripted reading, immutable card order/orientation and original Gate A / Gate B branches.

## Important fidelity caveats
- The current peel uses CSS 3D folded-edge approximation with a 2D clip mask; it is not a fully cloth/elastic deforming 3D mesh yet. User visual approval is required before promoting it as finished.
- Artemis portrait is a rough procedural prototype, not the completed Japanese-anime illustration; owner art selection and final licensed generated or commissioned image assets remain an open gate.
- Gate entry is a newly scripted cube-like corridor matching the established visual language, not continuity of the exact Gate A WebGL scene.
- Mobile Safari touch, GPU video QA, screenshot comparison and actual visual acceptance remain REQUIRED.
- The reference peek photo was not present as a usable new attachment in this conversation; tune bend silhouette against it before accepting fidelity.

## Manual review
1. Run `npm run preview:gate-b`; open `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`.
2. Start Divination, wait for deck, Finish Shuffling: /ritual.html receives 78 IDs; watch square gate flight into full-screen interior sphere.
3. Look around with drag and arrow controls; select/unselect a card while the sphere keeps rotating and see halo + forward separation.
4. Select three, observe 1850ms undo grace, then 75-card black-hole removal. Confirm Past/Present/Future remain stable.
5. For each, grab a side, corner, or bottom edge and inspect whether artwork is uncovered progressively, and whether partial progress persists. Try instant reveal and keyboard access.
6. All three revealed → Artemis invitation: switch A/B/C styles, try expression/actions; ensure reading only starts when the user explicitly invites her.
7. Test a narrow mobile viewport, keyboard, reduced-motion and 2D fallback.

## Owner visual approval gate
This is a candidate, **not approved or merged**. Do not promote automatically on green tests. Do not merge rejected PR #10 or bypass approved Gate A v7.
