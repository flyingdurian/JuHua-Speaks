# Gate C — 01–04 owner visual acceptance
Source of truth: **Artemis Tarot Ritual Flow Board.png v2.0** (plus original Artemis Ritual Flow Concept Sheet). Rejected Gate C 3–5 and Gate C/D v2 scenes are not part of this branch.

01 Full-screen illustrated celestial gate. 02 Six-faced dimensional astral cube with orbiting rings, followed by timed entrance into universe. 03 Inward-looking 78-card sphere with drag and slow orbit. 04 Gold halo and physical pull-forward on selecting 1–3 exact deck IDs, followed by a floating selected card and Past/Present/Future dock.

**Boundary:** Stages 05–08 intentionally do not exist in this review. After the third selection the scene stops at 04; users can undo choices. Do not interpret green tests as visual approval.

Run: `npm run preview:gate-c14` then open **http://127.0.0.1:4186/preview/gate-c14/**. The exact preview server is isolated from production and does not serve `/ritual.html`. Optional `?review=sphere` starts directly at stage 03 for repeat comparison.

Review: 1440x900 first, then phone. Compare illuminated architecture of gate, physical six-faced cube, immersive card density and halo pull-forward with concept reference. The user alone grants visual signoff. Keep the branch draft; don't merge or release without approval.

Immutable mechanics: 78 unique IDs, canonical secure shuffle, valid user Gate B handoff if present, orientation assigned only when selected, max three, undo allowed. Preserve approved Gate A and recovered Gate B source.
