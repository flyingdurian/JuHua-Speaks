# v0.6 QA — Orbiting Card Universe · 菊花说

## Delivered

- The **inside-the-sphere** WebGL scene now gently rotates in place at 4°/second (one revolution every 90 seconds). The 78 genuine-card selections continue to be evaluated against the exact painted 3D orientation, so the user's tap targets the card currently visible as the universe moves.
- Dragging interrupts automatic rotation immediately; on release the universe waits ~1.1 seconds and resumes. Keyboard/arrows and manual turn buttons also temporarily suspend auto-orbit. The user can explicitly **Pause universe / Resume universe** at any time.
- A chosen card is hidden from the starfield, lifts with a glowing flare, follows a curved screen-space trajectory, shrinks, and arrives in the next of three **Your hand** slots. It is only added to the hand after the ~920ms animation completes, preventing repeated selections or skips mid-flight. Both 3D and flat 2D selection preserve the same shuffled deck and card-back art.
- Each animation is cleaned up when the user navigates elsewhere. No card is silently consumed if an interrupted flight is canceled.
- Reduced-motion mode disables automatic spin and card-flight effects. Users with no WebGL2 retain the accessible flat 2D table, with instant draw available when animations are unsupported.
- No fake or modified card-face artwork is created. All Rider–Waite–Smith scans remain authentic; Chinese Tarot copyright policy and private import are unchanged.

## Automated verification

`npm test` passes 20 checks, including new v0.6 cases for speed, pause semantics, background-tab time caps, rotation-dependent ray picking, card flight reaching the exact hand destination, and UI wiring. `node --check` passes both changed source modules.

## Device testing still required

1. Open **v0.6.0**, create a question, shuffle, enter the **3D universe**. Without touching the screen, watch cards shift slowly across the field; a full orbit should take ~90 seconds. Stars remain in the background.
2. Drag horizontally while cards move. Movement must follow your finger and auto-rotation must pause, then resume after a brief delay. Test **Pause universe / Resume universe** as well as the arrow controls.
3. Tap a visibly passing card. Watch that exact back vanish from the stars, become a bright floating card, and land in hand slot 1. Ensure the slot remains empty until arrival and is filled after. Repeat for slots 2 and 3. Tap rapidly during flight; it must not duplicate picks or skip a slot.
4. Switch to **flat 2D tabletop** before or after a draw. Verify the selected cards persist, and a clicked card also flies to its hand slot. Start a new reading and check shuffling still yields 78 unique cards.
5. Choose three, then go to the existing edge-drag/pinch reveal stage; verify all three card images and orientations remain correct. No extra card is consumed.
6. Check mobile Chrome, iOS Safari, Windows Chrome, keyboard Enter pick, reduced-motion setting, background tab suspension, and narrow widths (320px, 375px).

**Browser environment caveat:** the local automation browser rejected navigation to localhost and file URLs with `ERR_BLOCKED_BY_ADMINISTRATOR`, so this milestone has source-geometry tests and CI but not a verified fresh end-to-end GPU screenshot. Live browser/device QA is required before treating animation timing and feel as polished.
