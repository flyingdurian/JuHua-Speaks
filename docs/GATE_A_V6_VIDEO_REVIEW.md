# Gate A v6 — 30-second video review and polish acceptance

**Status:** Unmerged Gate A visual candidate, pending Product Owner GPU-browser approval. No Gate B or production deployment.

**Evidence:** Product Owner uploaded *Without CTA side by side comparison_Chatarot and Gate A v5.mp4*, 30.4 seconds, 1720 × 720, 30 fps, synchronized: ChatARot left, JuHua Gate A v5 right. Reviewed frames at 1, 3, 6, 9, 12, 16, 20, 24 and 28 seconds. The original reference recording remains in the conversation and is **not** copied into the GitHub repository.

## Main findings
- **v5 is successful as a foundation.** At 3 seconds it already displays an obvious rounded main sphere and large near-camera Tarot illustrations; from 9 through 20 seconds it keeps an attractive, readable card field. Preserve its center framing, identity mapping, slow orbital velocity and natural rigid flyby behavior.
- **Opacity defect:** In `RitualWorld.mjs`, the v5 WebGL fragment shader wrote `alpha = base.a * clamp(vLight)` and enabled SRC_ALPHA blending. `vLight` included card brightness/lighting and thus inadvertently made solid cards partially transparent. The Canvas fallback likewise used `ctx.globalAlpha=card.light * landingOpacity`. This particularly affected bright, nearby illustrations and outer-layer silhouettes.
- **Depth distribution:** The reference has what visually appear to be three or four depth scales interleaved within one sphere. JuHua v5 has two fairly distinct radii, making some bands look regimented despite matching the 78-card count.
- **Atmosphere:** The reference keeps a mostly dark, subtly star-lit scene with soft purple/slate-gray cloud filaments. JuHua's per-refresh color is a good feature, but the sky can benefit from a restrained bottom-edge gradient and low-intensity nebula clouds. Keep background from distracting from the Tarot.
- **Landing animation:** The v5 inner-to-outer flyout is worth preserving. The user additionally wants an alternative where cards enter from *outside* the screen and gather into their assigned orbital positions over ~3–5 seconds. Both must end in the same stable 78-card world.

## Implemented v6

### Solid cards
The WebGL fragment shader uses **alpha 1.0** for card surfaces while preserving lighting on RGB. Depth writes remain enabled and blending is disabled. Canvas fallback uses **globalAlpha 1.0** for its cards. This is a true material correction, not just an overlay opacity tweak.

### Four controlled orbital scales — exactly 78 identities
| Layer | Cards | Radius | Center depth | Role |
| --- | ---: | ---: | ---: | --- |
| Core | 50 | 7.8 | -23.5 | Recognizable center sphere |
| Halo | 12 | 10.25 | -24.0 | Slightly expanded intermediate silhouette |
| Orbit | 10 | 18.7 | -27.1 | Sparse middle-distance depth |
| Flyby | 6 | 23.5 | -28.5 | Natural close passes |

There remain **62 primary/halo cards and 16 outer cards**, conserving the visible v5 silhouette and its close/far hierarchy. All four scales share a constant `0.034 rad/s` orbital rotation. Two flyby cards have **seeded starting longitudes** placing a natural close pass at ~5.5s and another at ~14.5s. They are NOT interpolated toward or away from the viewer. Individual card IDs remain immutable and all original RWS fronts continue to load through the verified local asset manifest; decorative seed does not affect Tarot draw odds.

### Two alternative entry rituals
- **Core expansion (inside-out):** Preserves the v5 initial card flight outward from near the viewer, lasting ~1.7s.
- **Star assembly (outside-in):** Cards arrive from outside the visible frame with staggered timing and gather onto their existing orbital slots over ~4.2s.

The seed independently selects one of the styles upon each refresh. QA can force it with `?entrance=inside-out` or `?entrance=outside-in`, and the preview has **SWITCH ENTRY** and **REPLAY** controls that restart the entry while retaining the same persistent world/camera. Changing entry does not change the assigned 78 Tarot identities or final orbital positions.

### Performance-bounded atmosphere
- Background drawn to **one static Canvas2D** when loading/resizing: 460 mostly dim stars, three low-alpha large cloud gradients, 19 soft filament puffs and two faint lower-edge glows.
- A pre-existing CSS nebula drift layer is made softer; no new per-star animation loops, WebGL particle fields, video textures, or extra GPU render passes.
- Per-refresh seeded palette changes the color and position of clouds; reduced-motion and narrow-mobile styles minimize background effects.
- Retain v5's 256×448 historic RWS atlas slots, true rounded geometry, mobile WebGL fallback and asset validation.

## Exact visual gate
1. On the unmerged feature branch, run `npm run preview:gate-a` and open `http://127.0.0.1:4183/preview/gate-a/`. Press **H** to hide CTA and record at least **30 seconds**.
2. Look through near cards: their fronts/backs must be **solid** and must occlude farther cards, with no ghosting or semi-transparency.
3. Confirm the **core sphere remains clearly spherical and readable**. The second slightly larger layer should add spatial richness, not create gaps or scatter. Outer cards should orbit naturally in front and behind; no yo-yo.
4. Refresh three times. The card assignments, paletted cloudy atmosphere, and initial entrance style should vary while retaining a recognizable overall density.
5. Use **SWITCH ENTRY** then **REPLAY**: both ~1.7s inside-out and ~4.2s outside-in must build the **same stable sphere**. Their animations should be perceptually different, smooth, without flashes or blank textures.
6. Verify authentic historical RWS fronts, visible navy backs and thin edge silhouettes. Status progresses from orbit active / loading to 78 faces loaded. No fake faces, no changes to readings, AI, or Exodia.
7. Run GPU Chrome/Edge and mobile Safari/Android review. Observe responsive CTA, pause/resume, visibility/tab switching, and devtools errors or FPS spikes. Performance targets are **qualitative** until device measurements are captured.

## Engineering QA and rollback
Automated tests check four-layer counts, immutable orbital radii, foreground framing, entrance endpoint equivalence, GPU/Canvas opacity and static starfield constraints. Passing tests do not constitute visual acceptance. Draft PR #9 is unmerged; production v0.8.2 is preserved; v5 remains a recoverable earlier feature commit.

**Recording guidance:** For this slow landing loop, synchronized **25–40 second** CTA-off clips at 30fps are generally more informative than 15–20s. Add a separate 5–7s clip showing each entrance. Longer recordings are valuable only to demonstrate a distinct issue (a full orbit, animation reset, performance degradation) instead of repeating unchanged motion.
