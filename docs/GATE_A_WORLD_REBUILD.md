# v0.8.3 — Gate A: Persistent 3D Landing Universe

**Status:** Candidate visual demonstration. **Not approved. Not merged. Not publicly deployed.** Production remains v0.8.2.

## Scope and architectural decision

Replace the v0.8.2 `ritual-cinema.mjs` approach. Gate A introduces `src/ritual-world/RitualWorld.mjs` as a durable WebGL2 camera/world manager and `src/ritual-world/CanvasOrbit.mjs` as a true perspective-preserving 2D fallback. The preview intentionally mounts them once and updates the question overlay independently. The state machine and later choreography will drive the same world in Gates B–D, not replace it.

- Exactly **78 unique card entities**, with stable canonical IDs and 78 distinct front-face texture slots.
- Source URLs resolve to `assets/rws/{card.id}.jpg` from the existing RWS deck. Do not substitute generated faces.
- Separate front, back, and four physical edge surfaces; no card is a single paper-thin plane.
- One physical camera at the origin, a single WebGL context and frame loop, deterministic orbital motion, and responsive canvas scaling.
- Most cards orbit far away across an enormous elliptical field. Five accent cards have trajectories that can bring them closer to the camera without keeping the entire screen crowded.
- Atmospheric color is randomized separately from card identity/selection; space gradient, drifting nebula and stars do not rig drawing odds.
- GPU context loss, teardown and reduced-motion/non-WebGL modes are explicit; asset loading is asynchronous and does not alter card IDs.

## Exact local preview steps

```powershell
# From a clean repository clone after checking out the Gate A feature branch
npm run preview:gate-a
```

Open **http://127.0.0.1:4183/preview/gate-a/**.

The Gate A preview is deliberately limited to the landing universe. The `Start Divination` button displays a notice; **shuffle, launch, selection and reveal are not implemented in this preview**. That is intentional: the Product Owner must approve Gate A before Gate B begins.

## Acceptance checks

1. Confirm fullscreen coverage at 1440×810 and 375×812 with no clipped question field.
2. Watch continuously for at least 15 seconds: 78 stable card identities, slow orbit, mostly far-field cards, occasional near passes and an editable centered question.
3. On a normal GPU-enabled Chrome browser, verify that RWS **front faces actually load** where their trajectories show the front. The repository’s RWS asset audit remains authoritative for completeness.
4. Refresh three times: atmosphere hue changes; card trajectories and ID assignments remain deterministic.
5. Pause/resume should freeze and restore motion without removing and recreating the scene.
6. Verify that neither the public GitHub Pages website nor the live Exodia API is changed or contacted.
7. Inspect the 15-second demonstration: use it as a **composition** preview, not proof of browser GPU performance.

## Environment limitations of the submitted recording

The recording was captured in a Chromium execution environment with **WebGL disabled at the system level**. It shows the Canvas2D perspective fallback, which shares the same 78-card identities and orbit equations; it **cannot validate WebGL shading, front texture fidelity, depth-buffer behavior or frame rate on the user's GPU**. The offline recording also could not fetch the repository's genuine RWS JPEG files; the browser preview sourced from the user's clone is needed for that check. Avoid portraying this fallback clip as a passed WebGL visual gate.

## Gate A QA checklist

- [x] New persistent world and texture mapping code.
- [x] 78 unique stable card entities with physical edge surfaces.
- [x] Browser-rendered fallback clip and tests on the orbit composition.
- [x] Separate loopback-only local preview server.
- [ ] Product Owner approves landing scale/orbit composition.
- [ ] Chrome/Edge/Android/iOS GPU captures with genuine artwork loaded.
- [ ] Manual performance, long-term WebGL resource stability and mobile FPS acceptance.

**Gate B is blocked** until the required visual sign-off is received. Do not merge into `main` on CI alone.
