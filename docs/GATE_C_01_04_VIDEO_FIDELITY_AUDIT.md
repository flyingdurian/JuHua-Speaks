# JuHua Gate C — User 37.477-second side-by-side audit and v2 implementation

**Source:** owner's 1720×720 / 30fps video, “Side by side comparison_Chatarot and Gate C1-4 v1.mp4”; left = ChatARot.ai; right = rejected Gate C stages 1–4 v1. Date reviewed: 2026-11-07.

## Important comparison limitation

**The halves are not synchronized by stage.** The reference shows a post-shuffle deck on black at 0–5 sec while our build is showing the ornate full-screen Gate and Cube. Direct claims about Gate 1/2 fidelity cannot be made from this video. Use the owner's “Artemis Tarot Ritual Flow Board v2.0” as the visual *composition* benchmark for Gate and Cube, and the recorded ChatARot footage as the **behavior + atmosphere** benchmark for sphere and selection. No invented numerical “±20% fidelity” score.

## Observed evidence and failures

| Recording time | ChatARot on the left | Rejected v1 on the right | Rebuild action |
| --- | --- | --- | --- |
| 00:00–00:05 | Sparse little stack on a predominantly black background, with small “Finish shuffling” control | Full illuminated gold architecture then cube | Stage mismatch; preserve concept-inspired full-screen Gate and real six-faced Cube, not claim side-by-side parity |
| 00:06–00:10 | Cards emerge from a small, loose central 3D cluster and camera moves into it; some physical faces are briefly seen | Instant high-contrast purple architectural spherical surface | Implement continuous compact-to-interior card move with eased 2.2s camera expansion and reduce decorative enclosure to zero inside |
| 00:10–00:16 | Deep black with dim grey-lavender smoke and separate stars; varied card sizes, locations, tilts and apparent depths | Bright circular purple shell, nearly regular rows, giant ornament and fixed tableau below | Reuse approved Gate A v7 two-noise-layer black sky; deterministic Fibonacci sphere with small angle/radius variation and real perspective |
| 00:16–00:24 | Chosen card gets reflective white-silver sheen, softly brighter rim, mild forward motion; selection count stays at top; other cards remain floating | Large gold/purple card teleports to permanent center display, bottom dock dominates, selected card disappears from world | **Never hide selected world card**; minimal glint and transient light-lift; small unobtrusive dock with Undo; retain user-selected 3 card IDs and orientation |
| 00:24–00:28 | Three selected cards form before the user while others recede/vanish | Still at an illuminated dome with permanent center card | This is Gate 05+ boundary and is deliberately deferred until owner approves 01–04 |
| 00:30–00:37 | Three isolated cards progressively reveal genuine Rider–Waite-style artwork | v1 remains at Stage 04 | Reveal is Gate D, deliberately deferred |

## Architectural decisions for this gate

1. Preserve **one cryptographically shuffled 78-card identity order** from the Gate B envelope (or local secure shuffle); never re-shuffle on scene entry. Keep upright/reversed assignments immutable once selected.
2. Gate 1/2 follow the ornate concept board; the 3D Cube contains six actual faces, and the transition moves the camera toward/through it, not a hard jump.
3. Gate 3 must have an **interior camera** (viewer at sphere center) and no visible purple room/frame. Object perspective must change card size as cards pass nearer/farther.
4. Gate 4 is the **same world instance**, not a newly mounted second sphere. Allow tap, undo via tap or accessible Undo, and selection of no more than three identities. Selected cards remain physically visible in the sphere; glint and temporary lift are accents, not replacement objects.
5. Gate 05–08, live AI, Artemis portrait and tarot reveal remain out of scope. This is **owner-visual-review only**. Green CI proves logic and screenshot capture, not ChatARot parity.

## Acceptance screenshots

GitHub Action “Gate C video fidelity v2” captures:
- 01 full-screen gate, 02 real cube, 02 fly-through,
- 03 entry cloud before expansion, 03 dark interior after expansion,
- 04 glint/halo after real pointer tap, 04 exactly three selected before Stage 05.

Compare to the supplied video especially near **8 s, 17 s, 24 s** on the **left**, not to unsynchronized right timestamps. The owner alone decides fidelity acceptance. Production and the original Gate A/Gate B baseline are not changed.
