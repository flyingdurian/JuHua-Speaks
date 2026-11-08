# Post-Finish v2 — rejection audit and development gate
**Source video:** `Side by side comparison_Chatarot and Gate C1-4 v1.mp4` (37.477 s, 1720×720). Left 860×720 = ChatARot. Right is an unsynchronized rejected version. Review includes owner's 2026-11-08 screenshot of V1 interior.

## Observation, frame anchored (left footage)
| Absolute video time | Relative to Finish press (~5.6s) | Visible ChatARot behavior |
|---|---:|---|
| 0–5.6s | before press | Narrow deck is stable in near-black space, Finish Shuffling button visible |
| 5.6–6.4s | 0–0.8s | Button disappears; the compact deck visibly departs to tiny projected size; NOT a static floating single card |
| 7.2–8.0s | 1.6–2.4s | Detached individual faces and backs gather into a rapidly spinning small globe |
| 8.8–9.6s | 3.2–4.0s | Globe becomes large/near; authentic RWS faces are plainly visible on the outside |
| 10.4–11.2s | 4.8–5.6s | Globe sweeps past camera. Camera passes through a continuous 3D shell with distinct near/far parallax |
| 12.0–13.6s | 6.4–8.0s | Interior takes over. Cards are mostly navy-backed, consistent medium/small scale, about 30–35 across view, subtle smoke and mostly black space. “Please select 3 cards...” is at top |
| 15–23s | interactive | Slow continuous orbit. A chosen card receives a brief reflective light; count changes. 78 identities preserved |
| 24s+ | out of scope | Lock-in and reveal remain deferred |

Times are approximate readings of an externally captured movie. They are not an assertion of access to the reference's source or exact private animation timeline.

## Why v1 was rejected
1. **No real propulsion:** `cardWorld()` started with a deck centered at z≈1 and moved it only to z≈0 while the camera was fixed at z≈12.6. It *necessarily* looked suspended and tiny, no matter how strong the glow.
2. **Wrong inner sphere scale:** perspective projection lets near-tangent cards get huge. User screenshot shows massive foreground slabs and distracting rectangular glows, not the reference's calm, readable surrounding field.
3. **Visual grammar:** Too-bright near-white edges, simple circle emblem, too little celestial engraving on the card backs; reference has delicate navy astronomical art and occasional reflective glints.
4. **UI continuity:** The previous app rendered “Please select” during launch, even though selection is not available yet. It also required replaying 5–10 seconds of Gate B on every test unless the tester manually knew a separate URL.
5. **No numerical acceptance:** Prior CI proved 78 stable IDs and 3 clicks but did not measure launch displacement, interior card size or video beat timing.

## v2 correction (code)
- `deckLaunchZ(t)` now starts the actual 78-card stack near the camera at z=10.25 and sends it **10.45 world units** into space in 1.25 s, with ease-in/ease-out translation, not a shader/opacity trick.
- Assembly is delayed until the deck has receded. Genuine exterior RWS artwork and navy backs are rendered on the **same 78 WebGL2 card surfaces**. Fast orbital motion remains attached to world geometry.
- Camera begins moving at 2.65 s and enters the sphere at ~6.85 s (interactive after 7.05 s). These major timing marks are consistent with approximate ±20% target bands, but **visual fidelity is not automatically certified**.
- Near-tangent interior cards receive physical-size attenuation rather than becoming giant slabs. No new fake copies or hidden re-shuffle.
- UI hides the selection prompt until the cards begin to distribute. Three restrained propulsion streaks belong to the departing deck only; *not all 78 cards* get trails.
- The card-back atlas gains dense, low-contrast stars, lunar geometry and restrained silver-blue engraving.
- Fast review route: from Gate B's `SKIP TO FINISH SHUFFLING` control, or direct `/preview/gate-b/?demo=finish`, or `/preview/post-shuffle/?start=finish`; click Finish, then press **R** to replay the **same deck** / **I** to jump inside. The normal Gate B Finish control still mounts this sequence inline, without navigation.

## Browser/acceptance tests
- `test/post-shuffle.test.mjs`: deck distance, stage time, camera dolly, identity and selection invariants.
- `scripts/smoke-post-shuffle.mjs`: video landmarks (0.08, 0.78, 1.37, 2.65, 4.0, 7.5 s), **near/far deck projected width ratio >2**, three actual pointer selections, no-delay shortcut and same-deck replay.
- Compare at least [Finish + 0.1 s, +0.8 s, +2.4 s, +4 s, +6.4 s, inside after +7s] against the reference **left** frames. Do not visually equate unsynchronized split-screen instants.

## Decision gate and context budget
Only **Finish → launch → globe assembly → camera entry → inner selection** may change in this PR. Old Gate/Cube stay retired. Do not implement black-hole lock-in, physical peek, or Artemis until owner approves. Do not merge or deploy based only on green CI. Subsequent chat updates are **delta only:** changed behavior, exact test route/steps, blockers, warnings. Store evidence, timestamps and logs in repo docs/artifacts; amend this one branch/PR for corrections rather than multiplying chat transcripts or branches.
