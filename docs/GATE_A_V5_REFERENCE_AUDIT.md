# Gate A v5 — Evidence-led Spherical Composition Correction

**Status:** DRAFT / unmerged visual review candidate. Public v0.8.2 remains untouched. Gate B blocked.

## Source evidence
User-provided 20.178-second, 1720×720 synchronized video: **Without CTA side by side comparison_Chatarot and Gate A v4.mp4**. The reference is in the left 860×720 half; JuHua v4 is on the right. Original video is retained in the conversation, not copied into the repository. Sampled frames at 0.5, 2, 4, 6, 8, 10, 12, 14, 16, 18 and 19.5s were compared.

### Direct observations
- At **4s**, the reference has a dense, recognizably rounded card chamber with dozens of discernible cards; v4 has a much looser and less readable card field.
- At **6s**, the reference has a large near-camera illustrated card at the lower left while a dense central sphere remains. JuHua shows **no cards**; its status says original artwork is still loading (49/78). The renderer explicitly blocked drawing until all 78 scans were available.
- At **12s**, reference maintains a visible round formation with near/far depth; JuHua's status says 78 faces loaded, but its cards are still tiny and spread across nearly the whole viewport. A two-shell composition is needed, not one enormous shell.
- The reference has a clear **primary sphere plus a sparser outer orbit**, rather than one shell extending from almost touching the camera to far behind the entire scene.

### v4 code root causes
- One sphere: radius 28.55, center depth −32.55. Its front can come to depth −4, but the sphere's apparent silhouette is much larger than the 860×720 view: **most cards move outside the frustum**. At its center, the same 1.2×2 world-unit card projects to only ~24×40 px, and many far cards are smaller.
- Its 78 cards are spread into eight distant latitude bands across the same enormous radius, creating a sparse middle.
- Both `RitualWorld.tick` and `CanvasOrbit.tick` return early when `loadedCount !== 78`, freezing the entire entrance until every historic JPEG finishes decoding.
- The v4 shader/geometry is suitable to reuse; no reason to reintroduce fake foreground keyframe orbits.

## Gate A v5 solution

### Geometry and framing (initial review calibration)
Two **rigidly and continuously rotating** shells share the same angular speed and no card ever leaves its own orbit:

| Field | Count | Radius | Center depth | Purpose |
|---|---:|---:|---:|---|
| Inner / primary | 62 | 8.0 units | −23.5 | Readable round sphere, always obvious |
| Outer / secondary | 16 | 23.5 units | −28.0 | Sparse natural near/far passes |

Both rotate at 0.034 rad/s. Core projection, for a 720px tall view and 58° vertical FOV, has an expected screen radius of about **235px**, versus a far-overflowing projected radius for v4. Core card sizes target approximately 20–65px apparent height depending on depth. Outer cards are larger and can cross near the viewport naturally without any radial interpolation.

Two outer cards have seeded *initial orbital longitudes* that bring one close to the camera in the first ~6 seconds and another ~14 seconds. Their IDs vary with the randomized session permutation. This is **position assignment, not a scripted push/pull**: both continue moving at the same constant angular speed and radius for their entire lifetime.

### Artwork and launch timing
- Display the floating sphere immediately with the existing navy/obsidian backs while front artwork downloads/decompresses. For a card whose genuine RWS face is not ready, show its **back texture** in the front slot until the correct scan arrives; never present a fake illustrated substitute.
- The 78 front JPEGs continue to load by unique RWS ID and display naturally as they become available. Status explicitly separates **ORBIT ACTIVE** from **LOADING RWS ART X/78**.
- Keep asset manifest verification and the 256×448 atlas with premium rounded thin cards and real front/back/edge materials.
- Entrance remains brief and exits to the stable orbit. Once complete, all positions are immutable-radius functions of time.

## Automated acceptance checks
1. Exactly 62 unique inner IDs and 16 unique outer IDs; 78 total.
2. Orbital radius invariance for *both* layers from 2 seconds to 150 seconds, with no `passIndex` or radial tween.
3. A 720px-high 58° FOV test projects **≥53 of the 62 inner card surfaces** on screen at 2, 6, 10, 14, 18 and 20 seconds. Core apparent radius should be about 195–285px.
4. The secondary orbit places at least one large (>130px tall) card in view at ~5.5 seconds and again ~14.5 seconds through ordinary rigid rotation.
5. Visual card fronts and backs remain mixed; no forced billboard normals.
6. Both WebGL and Canvas start rendering before 78 images are loaded, using obsidian backs for artwork that has not yet loaded. Production read flow and Exodia remain untouched.

## Manual visual acceptance
1. On the **draft v5** branch run `npm run preview:gate-a` and open `http://127.0.0.1:4183/preview/gate-a/`.
2. Watch and record at least 20 seconds CTA **off**, directly against the user's reference, then 20 seconds CTA **on**. Press H to hide/show without recreating the world.
3. Confirm core remains a clearly readable globe throughout, not one that vanishes after entering.
4. Confirm outer cards naturally pass close at several points, while other cards continue orbiting the compact inner sphere. No yo-yo movement, sudden snaps, or giant card pile.
5. Confirm premium card geometry, alternating backs/fronts, 78 real RWS faces eventually available, desktop/mobile responsiveness, and no long artwork-loading blank screen.
6. Run a repeat review on a few different randomized refresh seeds; core and outer behavior must remain coherent.
7. Capture **actual GPU-enabled Chrome/Edge output** before Product Owner approval. No automated test or schematic preview can certify reference-level visual fidelity.

The only qualified achievement is a code-implemented v5 candidate. **No production merge or Gate B development** is authorized until the Product Owner accepts the visual result.
