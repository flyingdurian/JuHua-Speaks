# Gate A v7 — 40-second video audit and acceptance

**Status:** DRAFT and unmerged visual candidate. Public v0.8.2 remains unchanged. Gate B is blocked.

**Evidence:** The uploaded video `Side by side comparison_Chatarot and Gate A v6.mp4` is 40.356s, 1720×720, 30fps. Left: ChatARot with CTA. Right: JuHua Gate A v6 without CTA. Compare motion, topology and sky rather than the CTA-obscured center as if they were equal.

## Observations and causes

- At 0.2–3.4s, the reference's core is readable and its card field looks farther away. Gate A v6's Star Assembly uses screen-plane offsets from final positions; this is the mural-like effect the Product Owner rejected.
- At 3.4s the v6 close-foreground pass is convincingly large. Preserve the 6 far-flyby cards, their world radius/center and the rigid orbit.
- From 6–12s JuHua's primary sphere is attractive but slightly crowded/close; its middle orbit is underpopulated. Transfer a few cards into the middle rather than inflate the scene or increase the count.
- At 16–28s the reference has strong gray smoke-like vapor drifting across the lower and sometimes central view. The v6 screen is substantially more uniform navy with fewer perceptible stars. A simple stack of additional radial gradients would make this worse.
- The submitted recording includes user-triggered entry/replay activity on the JuHua side; brief empty views during replay are not by themselves proof of an intermittent graphics crash.

## v7 geometry — still exactly 78 authentic RWS cards

| Orbital scale | v6 count | v7 count | Radius | Center Z |
|---|---:|---:|---:|---:|
| Primary core | 50 | **46** | 7.9 | -25.1 |
| Transitional halo | 12 | **11** | 10.1 | -25.7 |
| Middle-distance orbit | 10 | **15** | 18.0 | -28.1 |
| Approved near-flyby | 6 | **6** | 23.5 | -28.5 |

The main core moves slightly farther away. All four shells use their existing shared angular velocity of 0.034rad/s. Six near-flyby placements and their radial distance are preserved. Cards move in real 3D orbital trajectories after entry; no radial yo-yo. Their unique RWS IDs and Tarot draw outcomes remain independent of the visit's visual seed.

## Star Assembly rebuilt from 3D orbital arrival paths

The old v6 entrance used a screen-plane slide: start was essentially destination plus a large XY offset. v7 instead uses staggered arrivals from outside the camera frustum at varied Z depths, with curved cubic-Bezier approach controls and tangential flight direction. Individual delays span ~2.85 seconds with travel times around 0.87–1.79 seconds; the final late cards settle around 4–5s. Each card remains opaque. It is invisible before its scheduled entrance instead of fading as a translucent slab. Every card joins exactly its assigned continuously orbiting slot. The approved v5/v6 **Core Expansion** is unchanged and both entrances share the same final 78-card world.

## Sky rebuilt rather than recolored

- Mostly black base (#010103), about 950 distant fine stars and 130 nearer twinkling stars drawn once per resize.
- Two independently seeded, low-resolution turbulent cloud textures with organic holes, wispy edges, and muted gray/slate/violet palettes. Concentration toward lower edges, with some drifting through the central area.
- Slow CSS-only cloud drift, parallax and shimmer, plus faint bottom-edge light. No new WebGL context, particle simulation, per-frame canvas redraw or video textures.
- Bounded cloud texture sizes: 320×190 pixels each on typical desktops and 240×144 on mobile, reduced-motion or low-memory hardware. Static sky canvases are reused; a resize event is the only reason to repaint.
- Refresh seed varies the star placement, cloudy arrangement, palette and selected entrance. Historical Tarot face assets and reading logic are unchanged.

## Acceptance criteria and exact checks

1. On the feature branch run `npm run preview:gate-a` and open `http://127.0.0.1:4183/preview/gate-a/`. Wait for all 78 RWS fronts to load while the orbit remains active.
2. Use **H** to hide CTA. Compare 40 seconds against the submitted footage: the core should be a little farther away and less crowded; the 15-card middle layer should fill the gap without making the 6 closest flybys more numerous or changing their path.
3. Force `?entrance=outside-in` or use SWITCH ENTRY, then REPLAY. Cards should spiral/arc in through real depth and settle progressively on a spherical formation. No flat mural slide, no dense face-up pile, no disappearing orbit after assembly.
4. Force `?entrance=inside-out` and verify its approved expansion motion is preserved. Both modes must settle into exactly the same physical 78-card orbital arrangement for the same visual seed.
5. The background should read as open black space with thousands-of-stars *impression*, nuanced glittering points, drifting smoke-like interstellar clouds, and a small bottom-edge spill of light—not a flat blue wall or decorative solid gradients.
6. Refresh three times to check different palettes, cloud positions, star constellations, card placements and entrance modes. All card surfaces remain opaque and all 78 genuine RWS illustrations remain accessible.
7. Check GPU Chrome/Edge, mobile GPU and the Canvas fallback; ensure no additional graphics context, poor FPS, memory spike, resize issue, or violation of reduced-motion settings.
8. Confirm the preview remains independent from production, Exodia and Step 6. CI passing is necessary but does not certify visual fidelity.

## Release policy

Hold as Draft PR #9. Do not merge or deploy until the Product Owner accepts an actual GPU-browser recording. The v6 rollback point is commit `d1e07dc3c0fcb00e6e1d60da51d81ec91b759d54`. Gate B has not started.