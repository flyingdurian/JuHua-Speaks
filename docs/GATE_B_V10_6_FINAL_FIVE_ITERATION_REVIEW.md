# Gate B v10.6 — Final Five-Iteration Owner Review (Rejected)

**Date:** 2026-11-06 (Vancouver)  
**Scope:** Sequence 1 only; afterimages, trailing tails, layered orbital scales, velocity, banked axis, physical neck.  
**Owner limit:** maximum five GPU-reviewed development iterations, then stop and hand off regardless of result. The limit is reached.  
**PR:** #10 (DRAFT, UNMERGED). **HEAD:** `5cb0d6fd17dc499405f6a9b911e6a4365bea375a`.  
**Prior checkpoint:** `checkpoint/gate-b-v10-1-rejected-before-motion-cycle`.  
**Approved Sequence 2 checkpoint:** `checkpoint/gate-b-v7-1-sequence2-approved-2026-11-06`.

## Final decision
**REJECT Sequence 1.** All four matched semantic visual-composition beats exceed at least one of the owner's ±17% proxy tolerances (plus ±17-degree principal-axis gate). The real Chromium WebGL2 recording succeeds, but this is **not** sufficient for visual acceptance.

### Completed exactly five iterations
1. v10.2: atlas-textured genuine temporal Tarot-card ghosts and path-derived motion trails; GPU reviewed and rejected (velocity cues too faint; old wreath still dominant).
2. v10.3: 40/24/14 independently revolving near/middle/far spherical shells; GPU reviewed and rejected (too much bottom-heavy card mass).
3. v10.4: stronger physical angular acceleration and a banked ~45-degree axis rather than pitching the camera deeply; GPU reviewed and rejected (rings remain apparent, loose card clump).
4. v10.5: phase-staggered material neck, narrowing physical footprint, reducing Z separation, aligning actual card attitudes with pocket/deck; GPU reviewed and rejected (insufficient vortex identity).
5. v10.6: final orbital latitude modulation, sharper visible sheet-linked velocity tails, longer history and improved glow; GPU reviewed and rejected (trails read as persistent decorative orbital lines and several oversized fronts dominate).

No sixth iteration is authorized. **Stop until Product Owner provides new direction.**

### Measured four-beat outcomes (v10.6, fixed seed 2165840022)

| Semantic beat | Card-pixel coverage relative error | Principal-axis deviation | Result |
|---|---:|---:|---|
| Opening | 151.9% | 18.73° | Fail |
| Orbital entrance | 309.2% | 54.20° | Fail |
| Deep spiral | 243.9% | 74.61° | Fail |
| Neck / exit | 171.6% | 28.47° | Fail |

The coverage mask counts card-blue pixels and now includes history/afterimage interactions; it is a **proxy only**, not a 1:1 measure of visual similarity. Reference frames are the user-supplied ChatARot comparison video, left-side image. The scorer's four timestamp alignments are semantic rather than same-clock-time. No claim of ±17% perceptual fidelity is made.

### Engineering integrity
- **Source CI:** Green on latest head, run [#42320783347](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/42320783347).
- **GPU recording:** WebGL2, 78/78 card objects, 78/78 authentic artwork loaded and no page errors; visual scorer rejected in [run #42320783331](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/42320783331). Download the `gate-b-v8-gpu-recording` artifact (historical workflow label).
- **Sequence 2:** Verified byte-for-byte identical from `function pocketPose(` onward to the approved checkpoint; FNV32 `3b577ed3`. Final globe / three 26-card decks / consolidation unchanged.
- **Gate A production:** unchanged. No merge, deployment, or Gate C work.
- **One-click local preview:** `npm run preview:gate-b` then `http://127.0.0.1:4184/preview/gate-b/?seed=2165840022&entrance=outside-in`.

### Observed visual blocker
The current geometry and slow-then-fast history trails create obvious encircling rings, while the reference has unevenly layered, more organic acceleration, brief afterimages attached to fast **individual cards**, a deep dark eye, dynamically changing orientation and a cleaner final neck. Rendering many nearly continuous trail samples may now **hurt** the perceived fidelity by behaving like static orbit artwork. Correcting this would be a *new* development cycle requiring the Product Owner's approval.

The final real-browser video and four-frame side-by-side contact sheet were assembled as conversation files. This Markdown file is the repo-side continuity record. Keep PR #10 draft and do not merge.
