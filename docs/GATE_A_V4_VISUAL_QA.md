# Gate A v4 — Persistent Spherical Orbit / Card Fidelity

Status: **Visual candidate / DRAFT / NOT MERGED** (2026-11-05). This is Gate A only. Public v0.8.2 is untouched; Gate B must not begin before visual approval.

## The four user-reported failures in v3

1. The sphere only looked coherent during entry; later it resembled unrelated scattered cards.
2. Special foreground cards visibly lunged toward the camera and snapped back ("yo-yo").
3. Cards appeared too thick, harsh and vector-like rather than clean, thin and polished.
4. Near illustrated fronts looked blurry and low resolution.

## Gate A v4 implementation

### One rigid orbital shell
- Each of the **78 fixed RWS card IDs** is assigned to one of eight latitude bands on a single spherical shell: 6, 8, 10, 13, 13, 10, 10, 8 = 78.
- Sphere radius ~28.55 world units, center (0,0,-32.55); variation per card <1.5% of radius for organic spacing, not separate foreground lanes.
- A single rotation matrix changes the entire shell at **0.034 radians/second**. The card's position after initial formation is always that same radius from the same orbital center. There is **no** `passIndex`, foreground tween, lunge, radial oscillation or scripted near-camera pass.
- A close card naturally grows and recedes because its longitude rotates through the foreground hemisphere. Orbit continues consistently across any refresh and remains mathematically spherical after entry.
- Random per-visit visual seed changes which semantic cards occupy the shell and their fixed initial orientation, **never** divination outcomes.

### Natural physical fronts/backs
- Each card stores a fixed radial/tangential local attitude. That normal, the card edges and its location all rotate with exactly the same shell transform.
- A card genuinely turns toward or away from the camera as it orbits. The GPU renders a historical front, obsidian back or narrow bevel based on depth and face direction, not a forced billboard.
- Every front texture remains mapped to its individual immutable RWS ID; no generated or vector substitutes for historical illustrations. The original card asset auditor/importer remains the gate to preview startup.

### Thin premium card geometry
- `src/ritual-world/CardSurface.mjs`: physical rounded perimeter with 5 segments/corner, separate face/back surfaces and a narrow bevel.
- Thickness ~0.011 × card width vs the prior thick square-sided slabs. Rounded and softly illuminated obsidian back with restrained engraved celestial design.
- No giant extruded rectangles or prominent blocky borders. Canvas fallback clips into rounded rectangles and reduces fake edge thickness.

### Sharper historical illustration textures
- Each of 78 RWS originals is loaded through the existing license-verified asset pipeline.
- WebGL atlas slots increased from **128×220** to **256×448 pixels**, with a two-pixel inset to reduce atlas bleeding.
- Mipmaps generated once after the 78th real image loads, linear trilinear filtering and optional anisotropic filtering where supported.
- On GPUs that cannot support the 2304×4032 atlas, render the perspective-preserving Canvas fallback rather than silently lowering quality/blanking cards. Canvas fallback card preview scale increased from 192×336 to 384×664.
- This is a 2× per-axis, ~4× pixel-count upgrade, not a claim of native full-resolution rendering for every near image. If real GPU review finds the closest cards still soft, the next improvement will need a bounded hero-texture LOD.

## Four acceptance checks

1. **Sphere persists**: at any point after the ~2.25s entrance the projected cloud must continue to read as one coherent round shell, both CTA visible and hidden; no momentary-only formation.
2. **Near pass is natural**: watch one card for 20 seconds; it may enlarge or recede only along the shared orbital trajectory, never detach toward the screen and return.
3. **Card material**: judge dark back, subtle trim, rounded corners, thin stone edge and card silhouette; no chunky slab appearance.
4. **Genuine artwork**: preview status must show 78 original faces loaded, actual GPU fronts must be the right canonical illustration and look sharper. Check face/back transitions and original orientation.

### Local review

```powershell
git fetch origin
git switch feat/v083-gate-a-persistent-world
git pull --ff-only origin feat/v083-gate-a-persistent-world
npm run preview:gate-a
```

Open http://127.0.0.1:4183/preview/gate-a/. Use **H** to hide/show the CTA. Compare a 20-second CTA-off capture directly against the supplied Chatarot CTA-off recording; record another 20 seconds CTA-on if useful. Check DevTools `window.__ritualGateA.diagnostics()` for loaded:78, separate visual front/back counts, a fixed shell radial range after formation and no failed textures.

## QA / limitations

- Automated tests cover fixed-radius invariants, no special near-pass spline, coherent angular velocity, natural side transitions, valid rounded mesh, real card ID mapping and atlas settings.
- Local test environment blocks GPU WebGL and network-sourced RWS JPEG downloads. A Canvas-only, geometry-driven technical preview can be tested here, **but does not establish real GPU visual fidelity**. Do not substitute test-art thumbnails for genuine illustrations in the reviewed build.
- **No deployment, PR merge or Gate B development until Product Owner visually accepts Gate A v4.** Keep detailed logs and comparisons in this document / repo.

### Image orientation safeguard
The physical front mesh assigns **v=0 to the card's top edge**. Both full-atlas and per-tile Canvas uploads therefore use `UNPACK_FLIP_Y_WEBGL=false`, preventing an unintended global upside-down display. A genuinely reversed card is rotated by its own deliberate 180° visual orientation, never by accidental texture flipping.
