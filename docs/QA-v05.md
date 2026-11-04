# v0.5 QA — Inside the Stars · 菊花说

## Implementation acceptance

- [x] Version badge visible in both masthead and footer, generated from `src/version.mjs` and unit-tested against `package.json` (`v0.5.0`).
- [x] Default 3D camera is **inside** a 6.4-unit celestial shell, not outside a rotating object. Card backs arranged in six even latitude bands of 13 cards each (78 total) for navigability. Real-time ray-plane picking is evaluated from the viewer's center. Browser WebGL2 with transparent background and low-overdraw operation; no replacement art on card faces.
- [x] Fallback is a genuinely **flat, scrollable 78-card tabletop grid**, not the old CSS sphere. The same shuffled deck and selections persist when switching modes.
- [x] Card-reveal screen is interactive per card, from concealed to revealed. Mouse/touch drag right-to-left and two-finger pinch, with progress retained. Keyboard Left/Right/Home/End and explicit reveal button. All three reveals are required before entering reading.
- [x] Meaning-based foil remains on untouched original 1909 RWS card face scans.
- [x] Genuine Chinese Tarot artwork is linked to U.S. Games Systems (publisher) and Benebell Wen's photographed deck review. No third-party scans embedded or redistributed. Private 78-card image import loads into memory (`URL.createObjectURL`) for local session-only viewing and reading preview. Strict filename mapping validation. AI endpoint disabled for private deck; a rights-cleared future public pack remains a release gate.
- [x] Local test suite: 16 Node tests, covering manifest, cryptographic shuffle, reading validation, API backend boundaries, geometric picking, reveal gesture progress, version consistency, and private images.
- [x] Chromium fallback navigation smoke test through full 6-stage reading flow and deck modal; no JS console exceptions. **Environment block**: browser automation sandbox could not expose WebGL2 or navigate localhost, so actual GPU output still requires device QA.

## Device QA after CI deployment

1. Open site on Windows Chrome, macOS Safari and Android Chrome; verify visible `v0.5.0` in the masthead (not only GitHub release metadata).
2. Select a question → Shuffle → Enter the sphere. The center must feel **inside a sky of cards**. Drag a full circle horizontally; cards should be placed in six ordered bands, and taps should only pick visible cards. Use the center reticle as aiming guide.
3. Switch to flat 2D. Confirm 78 visible backs in a scrollable rectangular grid, **not** a flattened 3D ball, and that the already chosen card count persists.
4. Select three distinct cards. Go to reveal. Slowly drag the gold edge left; stop in the middle, then complete. Also test 2-finger inward pinch on Android, keyboard arrow keys, and explicit `Turn this card over`. Confirm role/orientation/artwork display.
5. Revisit an earlier revealed card in the tray, then proceed to the next. Reading is blocked until all three are revealed.
6. Open Decks. Tap official Chinese Tarot sample links, download the filename guide, and (only with images you are authorized to use) import exactly 78 local images. Verify private images appear in gallery/reveal; a refresh clears them. Invalid or incomplete sets must show an error.
7. Ensure `Generate AI reading` does **not** activate for private Chinese deck; the public Pages build remains a labeled local preview until separate AI backend configuration.
8. Check narrow width at 375px and 320px, reduced motion setting, screen reader labels and keyboard focus. Verify no missing RWS images on the deployed build (`npm run assets:audit` in CI).

## Known limitations

- This is a **user-controlled sliding-card peel**, not a cloth-simulated 3D corner fold. It is a pragmatic interaction prototype for later visual polish.
- Current GPU back texture approximates the CSS back design with the same icon/color/borders but is not a byte-identical raster. The **card faces are authentic RWS images** in either mode.
- No licensed full Chinese Tarot image pack is distributed; local private image import requires separate image files supplied by the user and exact names. It does not bypass any copyright/license terms attached to those files.
- Existing question-specific AI backend remains opt-in and separately deployable. This milestone does not activate a model API key or guarantee mainland China accessibility.
