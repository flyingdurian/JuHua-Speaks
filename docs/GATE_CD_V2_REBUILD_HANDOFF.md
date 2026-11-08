# Gate C / D — Concept-sheet reconstruction v2

**Owner directive:** reject and scrap the previous Gate C/D scene and the simplified Artemis. No modifications to approved Gate A, recovered Gate B, PR #10 or production.

**Exact eight beats:** Gate fullscreen → landing-cube entrance → inside 78-card sphere → halo/pull-forward selection of three → 75-card black-hole collapse → face-down Past/Present/Future tableau → physical side/corner/bottom peek revealing authentic original RWS art → premium Artemis reading stage.

**Illustration requirement:** Artemis is a consistent celestial Japanese-inspired anime portrait and eight expression + eight action pose illustrations sourced from `Artemis Ritual Flow Concept Sheet.png` and `Artemis: Celestial Tarot Ritual Showcase.png`. No simplified vector avatar and no mandatory character animation. `src/ritual-v2/portrait-manifest.mjs` defines the accepted asset contract; 26 cropped prototype assets are available in the separate review bundle but **have not yet been uploaded to this branch**. Do not declare this branch itself visually complete until those files are installed.

**Code state:** pure 8-stage state machine in `src/ritual-v2/flow.mjs`, progressive artwork peek clipping and ordered 75-card complement. Node model tests in `test/ritual-v2-flow.test.mjs`; standalone browser prototype and staged art in review bundle. The prototype executed from first gate to reading in isolated Chromium with zero page exceptions, preserving the three selected IDs. Browser had no external Wikimedia access; correct real tarot JPEG art still requires `npm run assets:sync` or authorized local assets.

**Non-negotiable QA:** fullscreen at 1440×900 and phone view; gateway should not look like bordered widget; no interfering header/selected cards; three selected cards remain immutable; only 75 other cards vanish; ability to partially expose actual artwork from both side/corner/bottom; no click auto-flip on drag; no placeholder vector Artemis; 8 portrait / 8 pose files; reading beats update appropriate state. No live AI.

**Approval:** draft-only. Motion, visual fidelity and final portrait art require explicit owner review before any merge or deployment.
