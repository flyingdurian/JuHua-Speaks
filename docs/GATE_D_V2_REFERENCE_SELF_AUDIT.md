# Gate D Artemis v2 — reference-fidelity review gate

Status: **DRAFT / NOT VISUALLY APPROVED. Do not merge or deploy.**

## Scope of this corrective pass

- Reviewer-only `?skip=selection&seed=2165840022` and visible **Skip to Card Selection** shortcut. Deterministic 78-card order; normal divination remains unchanged.
- Third-pick atomic `selection-lock`: snapshot IDs and camera transform; disable the 3D selection surface; avoid reuse of off-screen positions.
- Third-pick phantom-card fix: each CSS/WAAPI ghost is assigned its proper initial transform **before insertion into the DOM**, avoiding a 256×448 tile at viewport origin.
- Four reversible foil finishes within the RWS front face, not detached slabs: Celestial Filigree, Constellation Foil, Arcane Lattice, Starlight Engraving. Slow 13–21s color-restrained glints.
- Begin Reading transition is a full-screen, asset-backed celestial summon rather than a flat intermediary text card.
- New `reading-fidelity-v2.css` loaded last in both preview routes. Cards use a 42° X-axis tabletop tilt, localized soft shadows, an integrated luminous table, masked/unobstructed portrait, and a unified ornate HUD. Chapter text scrolls inside a fixed-size narration panel so the room geometry cannot jump between chapters.
- Browser capture now includes a 458×553 reference-proportion screenshot and exact geometry export.

## Reference numerical targets

Authoritative concept screenshot: **458×553 px**, Reading Stage (Final). Before production approval, browser review at **458×553** must meet all:

| Measurement | Reference | Allowed delta |
| --- | ---: | ---: |
| Title/header boundary | ~61 px | ±15% |
| Start of lower HUD | ~405 px | ±15% |
| Three cards | Side-by-side across the chamber, above the HUD | No clipping / overlap |
| Physical tabletop pitch | 35–45° | 42° target |
| Face/body layering | No card covers Artemis's face | No overlap |
| Reader UI | Single ornamental lower panel | No detached UI cards |
| Stable 5 chapters | Same hero, table, panel rectangles | <20 px hero-height drift |

Reference screenshots are produced by `scripts/smoke-post-shuffle.mjs`:
`artifacts/post-shuffle/09-artemis-warm-welcome.png`,
`12-artemis-fidelity-458x553.png` and
`12-artemis-fidelity-458x553.json`.

These metrics are **necessary but not sufficient** for ±15% visual fidelity: compare the actual screenshot with the approved concept for Artemis scale/crop, composition, lighting, table plausibility, foil subtlety and portrait identity. An automated green check cannot substitute for visual approval.

## Critical art-pack blocker

This GitHub branch **does not currently contain the verified 31-image Artemis pack**. `preview/post-shuffle/artemis-assets-ready.mjs` still exports an empty map. Four earlier provisional portrait WebPs are present, but the approved chamber background, transition background, FX and ornamental panel art are not; CSS fallbacks are not a production-fidelity replacement.

The existing owner-provided `JuHua_GateD_Artemis_Optimized_Preview_V1.zip` is a repo-relative package (31 WebPs, `asset-provenance.json`, and the generated registration map). From a checkout of this **same review branch**, unzip that archive **at repo root** preserving paths, then commit all of `assets/artemis/*.webp`, `assets/artemis/asset-provenance.json`, and `preview/post-shuffle/artemis-assets-ready.mjs` together. Source master PNGs remain the archival originals. No missing image is reported as installed until this commit is actually present.

Local review:
```bash
npm test
npm run preview:gate-b
# open http://127.0.0.1:4184/preview/gate-b/?skip=selection&seed=2165840022
```

## Self-audit checklist

- [x] Direct seeded skip entry implemented on review route
- [x] Frozen third-card pick and origin-ghost preposition fixes committed
- [x] Four restrained animated foil patterns attached to original RWS front faces
- [x] Source-level summon transition replaces text-card intermediary
- [x] Tabletop, portrait, and unified HUD structural layout implemented
- [x] Automated source and browser geometry checks authored
- [ ] Full 31-image asset pack committed and decoded in Chromium
- [ ] CI source and real WebGL browser checks green on final commit
- [ ] Visual screenshot comparison confirms **≤15%** disparity with concept
- [ ] Owner visual approval

**Never mark this build visually accepted, merge, or deploy while any required item is unchecked.**
