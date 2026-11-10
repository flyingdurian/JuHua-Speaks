# Gate D Artemis — final visual engineering audit (31-asset integration)

**Review branch:** `feat/gate-d-art-pack-v1-stage-redesign` · **PR:** [#25](https://github.com/flyingdurian/JuHua-Speaks/pull/25) · **Status:** Engineering/geometry PASS, owner visual approval pending. PR remains **DRAFT / DO NOT MERGE OR DEPLOY**.

## 1. Integrated artwork provenance

The missing art-pack gate has been closed: commit [b6c2b17](https://github.com/flyingdurian/JuHua-Speaks/commit/b6c2b17664beb771a0313cfea9c16b5ecb4453ed) installed, in **one Git tree update**:

- **31 source-derived optimized preview WebPs:** 16 portrait/expression states, 2 chamber/transition backgrounds, 6 FX layers, 7 ornamental UI assets.
- `preview/post-shuffle/artemis-assets-ready.mjs`: 31 registered slot/filename pairs, resolving exclusively to shipped assets.
- `assets/artemis/asset-provenance.json`: `imageCount=31` with source tracing and image metadata.

All 31 files passed the source integrity tests (valid RIFF/WEBP headers and actual non-placeholder bytes). Chromium decoded the chapter portraits and six active chamber layers. All 16 portraits retain alpha with consistent **1024×1536** framing; the original master resolution target (at least 1536×2304) is **not** fulfilled by these preview derivatives. Do not re-label them as production-resolution masters.

For the vertical reference crop, commit [2b97b31](https://github.com/flyingdurian/JuHua-Speaks/commit/2b97b31cbea264ade71ed912fc75ba3cdae64a2b) also added **two small alpha-feathered edge crops** of the supplied chamber background to reveal original lantern/sakura content on mobile. These are responsive derivatives, not additional independently registered character art; the 31-artwork catalogue remains unchanged.

## 2. Functional correction pass

- Deterministic reviewer-only `?skip=selection&seed=2165840022` opens directly into Gate C.
- A third pick atomically locks card IDs and camera pose, freezes selection, and only animates valid source cards. Each travelling ghost receives its initial transform **before** insertion, eliminating the CSS left/top-zero flash.
- Four source-preserving gilded foil finishes are attached to actual RWS front planes; faces remain original Rider–Waite–Smith scans.
- Begin Reading uses an asset-backed celestial summon rather than a vector intermediary.
- Three tilted cards are grounded on the shared tabletop beneath Artemis. The full-panel art is now the **only** ornamental frame, avoiding duplicated gold borders and the previously centre-squeezed corner texture.
- Five narrative chapters preserve the same three original face DOM nodes and use a fixed reading-frame layout to prevent scene jumps.

## 3. Executed real-browser audit

**Passing code build:** `2b97b31cbea264ade71ed912fc75ba3cdae64a2b`.

**GitHub Actions:** [Run 42767032269](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/42767032269) — **source PASS + real Chromium WebGL2 browser PASS**.

**Artifacts:** `artemis-art-v1-webgl2-stage-screenshots`, including:

- `06-seamless-three-card-handoff.png` (atomic handoff)
- `08-three-art-overlay-reveals.png` (original RWS faces)
- `09-artemis-warm-welcome.png` (landscape chamber)
- `11-artemis-phone-390x844.png` (portrait responsive)
- `12-artemis-fidelity-458x553.png` (reference-ratio visual)
- `12-artemis-fidelity-458x553.json` (measured geometry)

### Reference-ratio measurements

Approved comparison screenshot: **458×553 px**, `Reading Stage (Final)`. Browser output at the same size:

| Invariant | Reference requirement | Actual Chromium measurement | Result |
| --- | --- | --- | --- |
| Header lower edge | ~61 px, ≤15% deviation | y=66 px, **8.2% delta** | PASS |
| Lower HUD upper edge | ~405 px, ≤15% deviation | y=402 px, **0.7% delta** | PASS |
| Physical card pitch | 35–45° | 42.000° for all three | PASS |
| Card placement | Three on the tabletop, entirely above HUD | Cards occupy x≈33–430, bottom≤392, panel starts y=402 | PASS |
| Artemis title/portrait separation | Portrait does not cover title | Portrait top y=66 = header bottom y=66 | PASS |
| Reader stage continuity | Five chapters, same face images and chamber rectangles | Real-browser smoke PASS | PASS |
| Background/FX/panel assets | Shipped, registered, visible | 31 registered; active layers decoded | PASS |
| Ornamental reading HUD | One integrated readable frame | Full panel art, no duplicate corner overlay | PASS |
| Reference lantern/sakura mood | Visible at compact reference aspect ratio | Source-derived original art edges rendered | PASS |

The **≤15% metric is a spatial-composition acceptance tolerance**, not a claim of ≤15% pixel-wise difference: the reference and runtime use different authored card identities/states and dynamic lighting. The final 458×553 screenshot must still receive owner aesthetic sign-off for portrait emotion, grading, atmosphere, art detail and perceived physicality.

### Review entry

```bash
npm test
npm run preview:gate-b
# http://127.0.0.1:4184/preview/gate-b/?skip=selection&seed=2165840022
```

## 4. Gate checklist

- [x] All 31 WebP source-derived assets committed, registered, provenance checked
- [x] Actual browser decodes active Artemis portrait, backdrop, FX, panel layers
- [x] Direct seeded selection review entry
- [x] Third-pick lock/phantom ghost fix
- [x] Four animated source-preserving gilded overlays
- [x] Ceremonial asset-based transition
- [x] 42° physical tabletop, portrait zoning, contact shadows
- [x] One cohesive full-art panel, chapter-stable layout
- [x] 458×553 layout deltas within the required ±15%
- [x] Source and real Chromium WebGL2 tests passed
- [ ] Owner's final qualitative approval of visual similarity
- [ ] Production master portraits upgraded to at least 1536×2304 if required for production delivery
- [ ] Authorized merge/release

**Engineering and measured-layout audit complete. Keep PR #25 draft; do not infer owner approval or production readiness from green CI.**
