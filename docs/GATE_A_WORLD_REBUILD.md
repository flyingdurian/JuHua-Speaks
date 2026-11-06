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
4. Refresh three times: the atmosphere, card layout, visible orientations and close-pass candidates change; semantic card identities remain stable during one visit.
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

## Gate A refinement 2 — Screenshot-based corrections (2026-11-04)

**User observations:** The first candidate resembled a horizontal card wall rather than a coherent celestial sphere; very few historical fronts were shown, and those visible appeared incorrectly reversed. The reference screenshot shows a vast orbital shell, all illustrated faces, randomized formation, and an initial burst away from the visitor.

### Implemented corrections
- **Entry (0–2.65 seconds):** 78 cards fly outward from near the viewer with staggered release and opacity; they settle into ONE huge slowly orbiting ellipsoid rather than preassigned depth bands.
- **3D geometry:** golden-angle sphere distribution, seeded per-refresh permutation, small angle and location jitter; a coherent slow orbit (~0.016 rad/s). Five seeded cards take occasional near-camera passes toward screen edges, leaving the question readable.
- **Original artwork:** all 78 canonical RWS cards have individual front texture slots and are intentionally front-facing. The old right-vector inversion was removed. About 27% receive a deliberate 180-degree visual rotation; the rest remain upright. Decorative landing orientation NEVER changes Tarot draw probabilities.
- **Every refresh random:** secure visual seed changes starting arrangement, upright/reversed mix, near-pass identities, and atmospheric hue. The seed remains stable during one visit, avoiding mid-orbit rerolls.
- **Asset readiness:** Git intentionally ignores RWS JPEGs. The updated preview command audits 78 locally installed originals; when missing, it calls the existing license-checked Wikimedia importer, then audits again. The import preserves the tracked manifest to avoid GitHub Desktop conflicts. Missing art stops the preview rather than silently showing fake or empty fronts.
- **Renderer parity:** GPU atlas updates one card tile per loaded image instead of uploading the whole atlas 78 times. Canvas2D fallback caches smaller face textures and uses the same seed and orbit equation.

### Exact acceptance checks
1. Run npm run preview:gate-a. First run may need internet while verified historical scans download. Open http://127.0.0.1:4183/preview/gate-a/; lower-left status must reach 78 FACES LOADED.
2. Refresh and watch the first three seconds: cards should fly outward from the viewer before assembling into a wide spherical formation, not remain arranged as a picture wall.
3. Watch continuously for fifteen seconds: slow coherent orbit, most cards distant, occasional large card near an edge without obscuring the question.
4. **All visible cards should display distinct historical RWS illustrations**, a mixed upright/reversed sample, and no field of default blue backs or repeated placeholder faces.
5. Refresh three times: verify different initial positions, close-passing identities, reversed mix and atmospheric hue.
6. Check desktop/mobile fullscreen, pause/resume, responsive resizing, input usability, no GPU context issues, and that Start Divination intentionally does not initiate Gate B.
7. In DevTools, window.__ritualGateA.diagnostics() should show loaded:78, frontFacing:78, and normally at least 60 distant cards after the entrance settles.

**Status:** Pure code tests and numerical projection QA passed. Real-GPU/browser visual capture is NOT verified here: the available Chromium environment rejects navigation to both local URLs and file pages. The older Gate A video represents the superseded first candidate and must not be used as evidence for this revision. Product Owner signoff on a fresh GPU browser recording is still required. Do not merge or proceed to Gate B.
