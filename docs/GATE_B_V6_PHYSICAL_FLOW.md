# Gate B v6 — Physical-card vacuum rebuild (draft, visual acceptance pending)

## Ground truth and scope
- Benchmark: original 15.813s / 1720×720 split-screen comparison; ChatARot occupies left 860×720, Gate B v4 on right.
- Reference re-inspected in this session from the original library movie, especially ~1.0–4.5s.
- Branch-only experiment. **No production deployment, Gate A edits, draw-odds edits or Gate C work.**
- Prior v5 is visually rejected; this document does not claim reference parity.

## Failure corrected
The v5 suction function coupled a card's fixed orbit slot to its static depth and geometric radius. Global angular motion spun those spatial placements into a ring-like image, while a separately rotating 512² textured tornado carried much of the perceived movement. The user correctly reported a background-image tornado rather than cards caught in an atmospheric twister.

## V6 approach
Each of the original 78 Tarot sheets now has its own continuous time-parametrized motion through three interacting components:
1. **Axial suction**: release-dependent travel increases nonlinearly with normalized time; near/far depth changes within a sheet, not only across sheet indices.
2. **Angular advection**: each card rotates through a continuously accelerating azimuth, with individual phase offsets.
3. **Radial collapse**: radial displacement contracts during motion; skew and transverse perturbations prevent a synchronized mechanical doughnut.
4. **Foreground passes**: a small deterministic subset executes smooth camera-directed arcs that join the main flow without teleporting.
5. **Card attitude**: per-sheet pitch, yaw and roll vary continuously over the sweep. These are actual source meshes and RWS faces, not sprites for the tornado.

The independently rotating vortex Canvas is no longer instantiated and its DOM layer is hidden. The approved background sky and one persistent GPU card renderer remain. Existing suspension, second globe, three 26-card decks and canonical final deck are retained to limit regression risk. The globe remains subject to the user's separate visual approval.

## Validation
- Branch unit suite includes tests for individual increasing near-camera depth, XY travel, 78 distinct objects, 78-layer finish, exact timeline seams, physical mesh orientation, and full GPU vertex finiteness.
- A dedicated PR-triggered GitHub Actions workflow starts the preview in Chromium with WebGL2/SwiftShader, captures ten timecoded 860×720 PNG frames plus a complete WebM browser recording, and uploads artifacts for manual comparison.
- **Passing automated screenshot capture is not visual approval.** A human must compare the reference and the recorded motion, especially high-speed orbital travel and deck collapse. Manual review should also check 3.1s card passes and 5–7s globe.

## Reviewer playback
```sh
git fetch origin
git switch feat/v083-gate-b-physical-shuffle
git pull --ff-only
npm run preview:gate-b
```
Open http://127.0.0.1:4184/preview/gate-b/ ; header must say **GATE B v6**. Choose Start Divination. Judge whether the **cards** rush, tumble and converge into the deck, with no decorative tornado disk. Then inspect the dense globe, three-deck interleave and final consolidation.

## Acceptance gate
PR #10 stays draft and unmerged until Product Owner reviews actual footage. Gate C and optional shuffle variants remain frozen.
