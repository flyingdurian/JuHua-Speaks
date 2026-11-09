# Gate BC v3.2 — owner rejection recovery

**Status:** corrective code committed to draft PR #21; not GPU/visually approved, not merged or deployed. Main and accepted Gate A v7 are unchanged.

## Defects confirmed from owner screenshot and source

- The three card backs remain visible even while the card meanings are already shown. Earlier browser tests counted img nodes without proving image decoding or correct front-facing 3D flips.
- Huge blank space separates the card's lower edge from its interpretation because of a flexible grid middle row that expands within a 65vh layout.
- The former mist was animated radial CSS gradients, not a procedural flowing smoke field; no genuine eddies.
- The previous stack used seven packet positions, but the GPU still rendered 78 microscopic individual side ribbons with PCF shadow sampling, a potential source of noisy granite or barcode aliases.
- A CSS drop-shadow filter on the transform-preserving flip inner is a 3D flattening hazard.

## Corrective implementation

1. **Flat seven-packet side material:** Keep 78 separate authentic art-bearing card faces. Remove the 78 individual side-face ribbons from the visible stack and draw exactly seven packet-side sleeves, one per real packet. Each sleeve is matte off-white RGB (.866,.870,.864) without side texture, atlas lookup, PCF shadow, normal/bump map or per-card tint. Preserve the six macro gaps.
2. **Readings immediately under cards:** Use an auto-height card row followed by an 82px reserved interpretation row, not an expanding flex middle row. Each role, card and interpretation remain center-aligned, without a layout shift after reveal.
3. **Real front-facing flip and slight tilt:** Remove filter from the preserve-3d ancestor. Use separate back/front planes, a modest Y -6 degree and X +2.4 degree resting tilt, and a correct 174-degree rotated finish.
4. **Artwork gate:** Disable each reveal button until the true original RWS JPEG has decoded with nonzero natural dimensions. Local scanned assets come first; Wikimedia Commons source fallback second. If both fail, visibly warn on the card back instead of revealing blank space.
5. **Two-layer smoke:** Procedural curl-warped advected noise fields animate in two independently moving translucent canvases attached to each unrevealed back. Warm gold diffuse border aura is separate. This is visual fluid-like motion, not a claimed Navier–Stokes simulation.
6. **Foil:** Keep four randomized session foil treatments above the actual original card face. Strengthened illumination becomes inspectable only when the CSS 3D flip is correct.

## Strict validation

- Source suite must verify 78 individual faces + 7 packet sleeves, distinct free gaps, flat side material, moving procedural noise and artwork fail-closed behavior.
- Chromium GPU review must assert all three original RWS images decode, the actual front faces the camera post-flip (matrix check), the vapor canvas has nonempty pixels, and reading gap is under 29 CSS pixels.
- Card positions must remain unchanged within 1.6 CSS pixels after each reveal. Screenshot must visibly show artwork, foil, smoke and the clean deck; element counts alone are never sufficient.
- Owner side-by-side fidelity approval and latest CI pass remain **outstanding**.

This corrective subset does not imply that all eleven stages of the broader development plan are complete. Artemis is outside the current scope.