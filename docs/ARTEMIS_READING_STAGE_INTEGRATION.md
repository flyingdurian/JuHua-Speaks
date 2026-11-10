# JuHua Speaks — Gate D Artemis reading stage handoff
## Review branch: `dev/juhua-active` / draft PR #19

### Implemented in this build

1. Gate C14 does **not** auto-enter Artemis after the third peek.
2. The new `BEGIN READING` CTA remains unavailable until the three original chosen Tarot cards have each reached 98.5% physical reveal.
3. Clicking the CTA plays a 1.85-second celestial handoff overlay, with a zero-duration reduced-motion alternative.
4. The fullscreen `Your Reading` stage displays the exact three selected RWS illustrations, preserving card identity, position and upright/reversed orientation.
5. Artemis's dialogue panel uses the existing deterministic `buildDemoReading` module, so no AI request is transmitted or misrepresented as a live reading. Five chapter positions: welcome, Past, Present, Future, combined reading.
6. **No generated portrait**: the hero shows the explicit `ILLUSTRATED PORTRAIT PENDING` notice until a consistent illustrated image set is delivered.
7. The old `ritual.html` v0.7 flow remains unchanged for compatibility; Gate C14 is the isolated current review route.

### Art Director drop-in contract

Expected root: `assets/artemis/`. The canonical filenames are mapped in `preview/gate-c14/reading-stage.mjs` as `ARTEMIS_ART_DIRECTOR_FILES`. They include:

- `artemis_idle.png` (transparent illustrated character)
- `artemis_warm_welcome.png`, `artemis_explaining.png`, `artemis_reflective.png`, `artemis_focused.png`
- `bg_artemis_reading_stage_main.png`, `bg_artemis_transition_gate.png`
- `fx_artemis_halo_ring.png`, `fx_artemis_sigils_soft.png`, `fx_artemis_particles_gold.png`, `fx_artemis_particles_violet.png`
- `fx_reading_glow_base.png`, `fx_card_spread_glow.png`
- `ui_reading_frame_panel.png`, `ui_artemis_nameplate.png`, `ui_your_reading_titleplate.png`, `ui_begin_reading_button.png`, `ui_continue_button.png`

**Do not flip** `ARTEMIS_ASSET_READY` from `false` until the Art Director package is present, asset rights and filename mapping are verified, render paths load cleanly, and visual identity is approved. Some named asset slots are reserved and not yet dynamically placed; finishing their layer placement is an art-integration task, not a reason to invent substitutes.

Reading shell:
- `preview/gate-c14/reading-stage.mjs` — pure state gate and markup (no DOM dependency)
- `preview/gate-c14/reading-stage.css` — full-screen composition and handoff motion
- `preview/gate-c14/gate-c14.mjs` — actual Gate C reveal, CTA, handoff, reading controls
- `test/artemis-reading-stage.test.mjs` — pure assertions and source wiring guards

### Review instructions

From the repository:

```sh
npm test
npm run preview:gate-b
```

Open `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`. Proceed through the actual Gate B handoff and Gate C full-screen sphere. Select three distinct cards; reveal all with a corner/edge drag or the keyboard `End` key. The `BEGIN READING` CTA should become visible only after the third fully revealed card. Click it to enter `Your Reading`. Use the three cards or chapter controls to navigate the deterministic reading.

To inspect only the Gate C scene, open `http://127.0.0.1:4184/preview/gate-c14/` (standalone review uses a shuffled deck and a generic local test question, not a resumed private handoff).

### Outstanding and gate

- Art Director illustration and background assets are pending.
- A full visual playback audit of this specific new layout, including mobile and narrow-screen captures, has **not** been completed.
- New tests are committed but GitHub Actions has not yet reported a check for this head SHA. No passing status is asserted.
- PR #19 stays **draft**, and **main remains unchanged**. Do not merge or deploy until visual signoff.
