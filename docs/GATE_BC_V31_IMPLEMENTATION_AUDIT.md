# Gate BC v3.1 — systematic owner-scope corrective implementation

**Status:** coded and committed on draft PR #21. **Not visually approved. Not merged. Not deployed.** The accepted Gate A v7 and `main` remain untouched.

## Nine-stage implementation record

1. **Canonical stack:** `OrganicDeck.mjs` uses one physical seven-packet address space for all condensed phases. The 78 unique sheets retain nominal 0.0092 thickness, 0.017 layer steps, and add six macro packet air seams of 0.023. `InstancedDeck.mjs` renders restrained uniform ivory/pearl edge faces instead of the alternating blue/ink barcode shader. The three 26-card piles use six macro packets each.
2. **Continuous sphere flight:** `cameraDistance` moves toward the camera at every frame after launch (no fixed-distance stall). `gyroAttitude` contributes independent pitch and roll around the existing fast orbital yaw. Geometry and card-facing normals use the same transform.
3. **Selection:** projected polygon click targets have bounded 4–11 CSS-pixel tolerance, front/back eligibility, true silhouette priority and nearest-depth resolution; on-card gold shader rim/sweep and genuine forward lift are stronger. The intrusive Past/Present/Future slot HUD is hidden during inside-sphere selection.
4. **Reveal transition:** all 75 unchosen identities travel away on curved tangential/radial paths while losing opacity. Three physical chosen identities retain a smooth foreground glide, then the tableau fades in.
5. **Physical reveal cards:** thick front/back offset, reflected pearl edge side face, foiled inset border, and dimensional cast shadows. Original RWS art is unchanged.
6. **Zero reflow composition:** each of the three tableau grid cells reserves a fixed-height role, card, and reading slot before flip. The `hidden` detail occupies layout space invisibly; toggling visibility cannot insert a new row.
7. **Celestial back vapor:** silver/gray translucent animated cloud layer follows each unrevealed navy card back and is backface-hidden on the revealed artwork side. Reduced-motion static alternative.
8. **Prestige:** retain one securely chosen session-wide foil family out of four; add higher-luminance directional specular sweep and stronger illumination *on the revealed card face*.
9. **Nebula:** reveal-only celestial background gains three colored volumetric cloud layers, fine stars, slow scale/depth drift and reduced-motion fallback.

## Validation contract

- Source tests cover canonical packet depths, all 78 unique identities and preserved positive gaps; non-stalling camera, gyro, and projected card selection; shader and CSS guards.
- Real browser smoke now verifies three successful physical picks, the three RWS flips, vapor visibility, no selection HUD and **all three card rectangle positions/widths/heights unchanged within 1.6 CSS pixels after each reveal**.
- Source and browser smoke checks must pass on the new commit. Previous passing GitHub Actions runs belonged to earlier versions; never cite them as v3.1 certification.
- Direct browser-side reference review remains mandatory for actual packet edge readability, continuous sphere acceleration, hit precision, smoke and foil aesthetics, legibility on mobile, and visual comparison to the two owner videos.

## Reproduce

```bash
npm test
npm run preview:gate-b
```

Review `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in` and click **START DIVINATION**, then **FINISH SHUFFLING**, select three moving cards and reveal each. The push workflow is `.github/workflows/gate-b-physical-review.yml` and uploads browser screenshots and a WebM when it runs.

**Release gate:** Keep PR #21 draft and unmerged. Owner visual approval is required before proceeding to Artemis or touching production.