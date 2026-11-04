# VIDEO-REFERENCED RITUAL FIDELITY — Phase 8.1B

Reference: user-provided 40.147-second recording, 1792 × 720 @ ~29.97fps (November 4, 2026).
Video analyzed from sampled frames and the user's detailed interaction notes; source media remains in the conversation and is **not** copied or distributed into the GitHub repository. User-provided screenshots were also considered. The reference is a UX benchmark; reproduce the *experience* using original code and rights-cleared historical art, not the reference website's proprietary shaders, sound, design assets or screenshots.

## Observed temporal sequence (approximate, not a rigid user timer)

| Time | Visible reference event | Fidelity requirement |
|---|---|---|
| 0–2s | Huge, deep-space orbiting card shell behind a centered, populated question | Full viewport, near/far camera depth, RWS face and ornate obsidian backs; dynamic nebula hue each reload |
| 2–5s | Rapidly spinning cosmic vortex/spiral collapsing inward | GPU tornado animation; visibly accelerate, don't simply crossfade stages |
| 5–9s | Miniature messy globe, face-up cards tumbling in differing directions | Deterministic non-planar card trajectories and mixed back/front images |
| 9–13s | Mixed cards settle into three interleaved pile/deck lanes, then one neat suspended stack | Distinct pile choreography; final deck slowly rotates instead of disappearing |
| 13–14s | Finish Shuffling action | Explicit user trigger; other shuffle modes allowed after basic duration gate |
| 14–20s | Deck shoots through cosmic filaments and re-expands into a giant shell seen from inside | Camera-relative depth flight; 78 cards reconstructed, real pickable interior space |
| 20–29s | Interior sphere slowly rotates; user looks around and selects 3 | Hover gloss, selected card moves physically forward with glowing gold aura; precise hit-test; undo |
| 29–32s | Remaining 75 disappear, selected trio in Past / Present / Future positions | Last choice auto-confirms after brief undo grace period; black-hole cleanup, trio arrives |
| 32–37s | Individually clickable flipping cards reveal RWS face + orientation + short traits | Three cards simultaneously visible; physical double-sided 3D turn, edge/corner peek, no linear wipe |
| 37–40s | Completed spread, ready for reader | Preserve v0.7's larger interactive card-by-card reading UI and optional scripted local responses |

**Our specific improvement over the reference:** the final three are real interactive 3D double-sided card surfaces. Clicking is instant; pulling from left/right/top/bottom or a corner reveals progressively, and users may stop and resume. Reader persona/artwork architecture and real AI curation are **not** changed in this release.

## Implementation
- src/ritual-cinema.mjs: GPU WebGL2 textured card quads; 12 original RWS scanned faces sampled from DeckConfig in an atlas, remaining cards use decorative navy backs; 78 distinct card geometry objects; simple deterministic keyframe functions (pure, testable). Landing, tornado, collapse, mini-sphere, 3 piles, one deck, launch and assembly all use 3D perspective. We did not publish altered or generated card face assets.
- src/ritual-views.mjs: optional repeat shuffle controls — Cosmic, Riffle, Celestial Wash — only after a completed minimum shuffle duration. Every replay cryptographically shuffles the deck again and resets the timer.
- src/webgl-sphere.mjs: selected card remains *in* the sphere instead of disappearing; GPU hover/selected vertex flags, gentle forward lift and gold/pearl shimmer. Visual position follows the same sphere layout; selection identity and order stay in the reducer.
- src/physical-reveal.mjs: physical flip stage rendered simultaneously for all three chosen cards, with accessible click/keyboard and pointer edge/corner peeking.
- src/app.mjs: mounted/disposed cinematic canvas with the existing screen lifecycle; session and render-request guards; automatic lock after 1.85-second undo interval (Confirm Now still available), then existing vortex and reading stages. Per-reload decorative hue does not affect randomness.
- src/styles.css: near/full viewport presentation, nebula animation, physical card transforms and mobile/reduced motion fallback.

## Manual QA gate — must be performed on desktop/mobile
1. Check **v0.8.2** in the header. Landing shows hundreds-of-meters-feeling depth, genuine RWS faces orbiting from far to near; question box stays editable. Reload 3x to see different nebula colors. Compare the orbit size/speed with the reference.
2. Submit the question. Observe five **distinct** beats (tornado, collapse, globe, three piles, single deck). Shuffle should last a minimum of 5 seconds before a user can finish; around 7+ total seconds is expected. Do not accelerate into the sphere merely because a network response arrived.
3. Finish. Confirm apparent travel away from the camera, cosmic streaks and a large sphere forming around the inside viewpoint. Cards should remain within the GPU camera, not turn into tiny static thumbnails.
4. Move mouse over any visible sphere card: it should lightly shimmer and lift. Click: selected card stays in the scene, comes forward, gold aura. Click it again to deselect, then repeat using the available Undo button and 2D fallback.
5. Select three. The last click starts a short undo grace interval; deselect within it to cancel auto-lock. If unchanged, see the 75 others disappear into the black hole, then the three chosen backs settle in Past/Present/Future order.
6. Reveal one card by click. On another, drag from left or right edge, pause midway and release, then resume. Try top/bottom and diagonal corner drag on the third. No flat clipping/wiping should be visible. Confirm upright/reversed and card summary. Keyboard Enter/Space reveals immediately.
7. Open the reading. Large original illustrations and selected-card spotlight interactions from v0.7 must remain unchanged. Both scripted demo and local-only Exodia still work, and **no API request** happens automatically before user opts in.
8. Test iOS Safari/Android touch, screen sizes 320–1920px, reduced-motion preferences, browser tab switching, WebGL2-unavailable fallback, and graphics memory. Watch for disappearing cards, orientation jumps, accidental drag vs click, duplicated generation, and stuck overlays.

## Important limits
- This is a fidelity **iteration**, not a claim of pixel-perfect reproduction; lighting, camera motion and shader art direction still require hands-on device review.
- GPU card backs are procedural and independent of actual art cards. Only the historical RWS face assets are used for fronts; there is no Chinese deck public license change.
- A fallback CSS scene is present for non-WebGL2 devices. Performance budgets must be verified with recordings, not inferred from passing Node tests.
- Phase 8.2 (Artemis table and post-reveal smoke) remains gated until this ritual-fidelity experience is accepted.
