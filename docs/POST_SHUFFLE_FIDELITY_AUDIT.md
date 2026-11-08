# Gate C Post-Shuffle Continuity — measured reference audit / development contract

**Owner change:** Delete separate Celestial Gate (old Stage 1) and Cube Entry (old Stage 2). The reviewed experience begins when Gate B's `FINISH SHUFFLING` is selected and should run as one continuous cinematic shot into the 78-card sphere. No automatic black-hole/reveal until separate approval.

## Visual evidence, not speculative mechanics

Source: user's 37.477 s, 1720×720, 30 fps side-by-side recording `Side by side comparison_Chatarot and Gate C1-4 v1.mp4`. **Only the left 860×720 ChatARot panel** was used for this audit. The right panel is an unsynchronized rejected Gate C build; its timeline is not a trustworthy timing reference.

The Finish control is visibly engaged at approximately video 5.0–5.3s. Relative times below are **inferred from displayed frames** and should be used as rough timing landmarks, not claims about ChatARot internals:

| Video absolute | Relative to Finish | Reference visual event | Required output |
|---|---:|---|---|
| 0–5s | pre-Finish | A small, narrow finished deck sits against almost completely black space. | Preserve deck identity and handoff; no second shuffle |
| 5.5–6.5s | +0.3–1.3s | The deck recedes to a tiny object and lifts through deep black stars. | Small compact stack moving into space; do not introduce a gate/cube |
| 7–8s | +1.8–2.8s | Cards scatter and begin orbiting a shared center; faces and backs flash with different orientations. | Animate 78 physically oriented surfaces from one stack; centrifugal dispersion |
| 8.5–10.5s | +3.3–5.3s | Rapidly rotating spherical distribution, visibly approaching the camera; external view contains authentic RWS faces and navy backs. | Full fast-spinning 3D sphere, synchronized camera approach, public-domain RWS faces |
| 10.5–12s | +5.3–6.8s | Camera enters the shell; nearest cards sweep by and appear large. | Perspective camera crosses sphere boundary; do not crossfade to separate card grid |
| 12–14s | +6.8–8.8s | Looking out from inside; mostly navy backs on black starfield and subtle smoky lavender/grey nebulae, while cards rotate gently. | Remain inside same 3D scene, gentle auto orbit + manual look/drag |
| 15–23s | later interactive | Tapping selected cards creates brief pale reflective lift/halo; top text counts 0 to 3. | Stable 78 IDs, max three choices, selected card remains in world, undo and orientation stable |
| 24s+ | out of scope | Three-card tableau and peel reveal. | Do not implement in this gate |

## Fidelity tolerance definition

“±20” is treated as a **design acceptance target**. Timing: each major landmark measured from user click should be within ±20% of its reference elapsed duration, but the source is compressed and manually filmed; do not claim precise frame-perfect truth. For the camera entry at approximately 6.8s, a preliminary timing band is **5.4–8.2 seconds**. Visual composition is assessed against sampled left-half frames for black-background proportion, card-scale distribution, motion continuity and absence of the former Gate/Cube. There is no valid single scalar visual-fidelity score without owner-approved measurements.

## Architecture

- `preview/post-shuffle/geometry.mjs`: pure deterministic 78-card map; launch/scatter/camera timing; exact selection identity checks.
- `preview/post-shuffle/scene.mjs`: WebGL2 draws 78 real two-sided, inward-pointing 3D surfaces with texture atlas for RWS faces and original navy backs; keeps one world and animates camera into it. No CSS card-wall impostor.
- `preview/post-shuffle/post-shuffle.css`: minimalist ChatARot-like black celestial environment; stage metadata kept peripheral, selected halo only for selected cards.
- Gate B's `FINISH SHUFFLING` directly mounts this scene in the **same document** after storing its existing private one-time handoff: **no route navigation / no new draw / no hidden reshuffle**.
- Dedicated `preview/post-shuffle/` quick-start screenshot route exists only for accelerated review; production Gate A and Gate B sequences are untouched until Finish is clicked.
- Public-domain face assets: existing `npm run assets:sync` should be run if local JPEGs are absent. The app attempts Wikimedia fallback, and explicit labeled placeholders only if both are unavailable; a missing visual asset is not acceptance-ready.

## Anti-bloat rules (binding)

- Each iteration: only changed implementation, exact test URL/checklist, blocker/decision and important warning in chat. Do not repeat historical context, large QA tables, prior gate summaries, or GitHub log blocks.
- Detailed frame maps, quality gates, screenshots, test logs and migration notes stay in `docs/` and GitHub Actions artifacts.
- New iteration replaces the same draft PR review branch; no successive branches/PRs for minor fixes. Do not claim approval from unit or browser test results.
- Explicit reviewer signoff needed before black-hole collapse, true peel/reveal, or Artemis reading.
