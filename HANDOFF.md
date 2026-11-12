# JuHua Speaks — Gate D V4 / Artemis AI Synthesis Handoff

**Updated:** November 11, 2026 — direct visual editor and shared entry baseline  
**Repository:** https://github.com/flyingdurian/JuHua-Speaks  
**Active Branch:** `debug/visual-layout-tuner` (owner calibration only)  
**Review PR:** [Draft PR #28](https://github.com/flyingdurian/JuHua-Speaks/pull/28)  
**Parent branch:** `feat/artemis-ai-synthesis-remake` (PR #28, base commit `b7233cc82a78`); production parent remains `fix/gate-d-v4-reference-table-portrait-mobile` (PR #27).  
**Merge / deployment:** **Not authorized. PR #28 remains draft, unmerged, and awaiting owner visual sign-off.**

> **Continuity rule:** Verify the current GitHub head and workflow status before changing anything. Older Gate D V4 handoffs that identify PR #27 as the *active* branch are superseded by this file. Treat screenshots and owner feedback as the visual authority; passing tests alone do not establish approval.

## Milestone — Direct Visual Editor / Shared Entry Baseline (Nov 11, 2026)

**Owner feedback:** Gate B and standalone post-shuffle screenshots showed different desktop/mobile geometry. The prior tuner applied a second, unconditional stylesheet (fixed grid rows, portrait/card/panel geometry) to the standalone route only. Opening an inspector must not change a composition.

**Current code:** `56987b66321d0b8cdec5908a00ac31bc016da07e` on `debug/visual-layout-tuner`. PR #28 production head remains `b7233cc82a78`; no merge/deploy. Both HTML entry points load the same Gate A/Gate B/Artemis CSS order and tuner module. The original PR #28 root defaults are restored. New CSS consumers are gated by the explicitly edited custom-property names in `data-vlt-edits`; the initial empty set leaves the original scene intact. Previous v1 browser overrides deliberately do not migrate automatically to v2. Use one hostname (127.0.0.1 recommended): localhost and 127.0.0.1 have distinct browser storage.

### Direct editor and asset workshop

- Inspect element: hover outlines a real layer, click filters the panel to its controls; use Scene Layer dropdown for occluded/pseudo-layers. MOVE and corner resize handles edit real CSS variables; three original cards also have independent X/Y/scale/pitch controls. Mobile inspection minimizes to a small toolbar, then docks context controls away from the selected layer. Stop inspecting restores normal app interaction.
- Asset workshop: replace original Artemis reading/focused/conjuring art, reading/chat frames (including mobile/desktop chat variants), chamber, halo/glow/mist, nameplate, navigation/ASK/input artwork and chat avatars. Original PNG/JPEG/WebP/GIF bytes are stored locally in IndexedDB; Restore original resets an asset. 20 MB per image. The original RWS identities are not changed. A baked button or tabletop in an illustration is not a separate DOM object: swap the parent art if its painted pixels must change.
- Save Package ZIP exports all viewport edit profiles, manifest.json, theme-layout-variables.css (baseline declarations plus owner edits), layout-overrides.css (corresponding compiled consumers), asset-overrides.css and original uploaded files. Load Package restores the tuner-created ZIP, including layout and artwork. Review/port approved CSS and asset slots into PR #28, not the debug UI. Copy CSS exports explicit edits only; new properties need their corresponding consumers. Local browser edits are not Git commits.
- Use `http://127.0.0.1:4184/preview/gate-b/?debug=1` for the actual ritual, or `http://127.0.0.1:4184/preview/post-shuffle/?debug=1&layoutPreview=reading` / `chat` / `long` / `thinking` for actual-renderer fixtures. Both routes accept the tuner; fixture messages are scripted, not live AI.

### Verification (latest observed)

[CI run 43150593159](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/43150593159), code `56987b66321d`: source/unit PASS; browser install and RWS sync PASS; previous tuner browser interaction PASS; direct editor/route parity/asset ZIP IN PROGRESS; artifact upload PENDING. A previous attempt at route geometry comparison failed because it measured in-flight entrance animation/opacity; the current regression compares settled scenes (reduced-motion and completed animations). Do not claim pixel or visual acceptance until final checks and owner inspection. The prior selective-layout regression run 43150277726 passed. All logs remain in .artifacts/logs/; no raw/binary dumps. The 19 owner-art PNGs are still absent from the GitHub production branch; art-backed owner visual approval remains open.

## Milestone — Visual Layout Tuner (Nov 11, 2026)

**Owner directive:** Build a dedicated debug branch, not a production merge. Branch `debug/visual-layout-tuner` is based on PR #28's exact `b7233cc82a78d9e3257076449b3aacb63aece5aa` commit. The debug branch's verified code commit is `47babb574f0c04959ad438ee4ed90fcff198efc1`. PR #28 itself is unchanged, draft/unmerged/undeployed.

### Owner usage

```bash
git fetch origin
git switch --track origin/debug/visual-layout-tuner
npm ci
npm run preview:gate-b
```

- `http://localhost:4184/preview/post-shuffle/?debug=1&layoutPreview=reading` — scripted reading/table.
- `http://localhost:4184/preview/post-shuffle/?debug=1&layoutPreview=chat` — ready AI Synthesis HUD.
- `http://localhost:4184/preview/post-shuffle/?debug=1&layoutPreview=long` — long conversation + guidance card.
- `http://localhost:4184/preview/post-shuffle/?debug=1&layoutPreview=thinking` — thinking/progress state.
- `?debug=1` without `layoutPreview` — actual app journey. Shift+D opens/collapses the overlay; on touch, use the collapse and launcher buttons. Hotkey is ignored while editing text inputs.

The fixtures call the actual `renderReadingStage` and `renderSynthesisChat` functions with fixed RWS cards and deterministic sample messages, not a live AI request. In the real journey the existing three RWS card/foil identities and ritual transition are preserved. Debug state is saved locally per **desktop (>720px), mobile (<=720px, >680px high), compact (<=720px, <=680px high)**. Use browser device emulation/resize to change profile. The owner can search 123 controls in seven groups, adjust numeric sliders/exact values, reset a control/group/profile, drag/dock/collapse the panel, use single-control Focus mode, and turn on guides/live collision diagnostics.

**CSS export:** `Copy CSS Variables` exports current computed variable values as a valid `:root { ... }` block. `Copy breakpoint CSS` wraps the same values for the current viewport profile and is preferred for phone-only calibration. Paste at the end of `preview/post-shuffle/theme-layout-variables.css` on the debug branch. Clipboard failure shows selectable text instead. The derived `--panel-padding` and `--chat-panel-padding` aliases use separate top/side/bottom sliders. Keep the legacy CTA setting `--layout-legacy-cta-display: none` for accepted layouts; Inspect is a debug-only reveal of existing retired elements. `display:none` removes their layout, pointer and keyboard exposure while preserving the real ASK composer and guidance card. Do not introduce fake old CTAs into production.

### Implementation / transfer contract

- `preview/post-shuffle/debug/layout-controls.mjs` — one metadata registry for sliders, persistence, validation, export, and responsive profiles.
- `preview/post-shuffle/debug/visual-layout-tuner.mjs` / `.css` — debug-only overlay; actual root CSS updates, localStorage, focus/dock/search/reset, diagnostics, clipboard. `layout-preview.mjs` contains deterministic fixtures using production renderers.
- `preview/post-shuffle/theme-layout-variables.css` — expanded real CSS variables. `preview/post-shuffle/visual-layout-tuning.css` is the last-loaded variable consumer; it controls actual reading/chat DOM, including independent portrait/mist, table/card transforms, HUD frame, scroll region, and input/ASK position. The existing CSS and source-art matte remain intact.
- `preview/post-shuffle/index.html` loads the tuner module and consumer stylesheet only on this branch; overlay activates only through debug=1 or Shift+D. The debug branch intentionally allows layout deviations and should not be merged wholesale.
- After owner signs off on a layout, port only approved CSS declarations **and the corresponding consumer rules** into PR #28 as a clean change, with breakpoint regression tests. Do not copy newly introduced variables alone without their consumers, and do not ship the debug module, fixture, controls or overlay CSS in production.
- CSS variables can tune real artwork only if it is installed. The prior 19 missing original/derived owner synthesis PNGs and manifests are still an art-integration blocker on GitHub; no claim of visual acceptance with fallback artwork. Use actual art-backed local checkout to tune the exact ornament boundary and waist-mask edges.

### Verification

[Debug browser CI run 43146210479](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/43146210479) **PASS**, verified against code commit `47babb574f0c04959ad438ee4ed90fcff198efc1`.

1. Source syntax and registry/unit checks (including existing `npm test`): PASS.
2. Chromium installation and RWS sync: PASS.
3. Real Gate B preview startup: PASS.
4. Browser regression: PASS — hotkey activation, live variable-to-element geometry, table/card pitch, chat transcript/footer/mist, CTA hide/inspect while ASK remains visible, CSS clipboard export, 390×844 / 458×553 / 860×720 profile switching and local persistence.
5. Log/screenshots artifact upload: PASS — `visual-layout-tuner-review` contains `.artifacts/logs/` plus `.artifacts/visual-layout-tuner/` screenshots and geometry JSON. Workflow `.github/workflows/visual-layout-tuner.yml` runs only on this debug branch and does not deploy.

**Visual status:** Functional checks passed; owner art-backed visual tuning and approval remain OPEN. No deployment/merge authorized. This HANDOFF update is documentation-only after verified CI; code remains identical to the tested SHA. Original artwork and production handoff milestones below are retained.

## Current State

The Gate D V4 **two-step reading flow is implemented in source**:

1. After the three original cards have been revealed, **Begin Interpretation** enters the **non-AI scripted reading** (“The cards are ready to speak”), including Past, Present, Future, combined meanings, and Previous/Next controls.
2. On the final scripted chapter, **Ask Artemis** triggers the approximately 2.6-second **portal conjuring ritual**. The original three selected Rider–Waite–Smith (RWS) cards are offered sequentially to a luminous circle, after which the Artemis AI Synthesis chat appears.

Implemented source features include focused/conjuring Artemis image slots, original RWS identity/orientation and DOM foil carryover, an animated thinking/response state, expression-selected avatar thumbnails and derived face-closeup crops, an initial AI synthesis response, and an interactive follow-up that draws one additional guidance card without replacing the original three. The mobile chat uses the dedicated ornamental **nine-slice frame**; desktop has a separate desktop frame. The latest layout work introduced `theme-layout-variables.css` plus a final corrective stylesheet. **Implementation does not mean visual acceptance.**

**Artwork caveat:** The 11 original supplied owner PNGs (two Artemis portraits, eight original chat avatars, mobile panel) and eight derived close-up PNGs were checksum-verified and assembled in local art-backed QA builds, but **have not been committed to the GitHub branch**. The original desktop panel PNG is in GitHub. GitHub's owner-art integration gate is expected to fail until these 19 synthesis PNGs and manifests are committed. Do not present a locally staged image capture as proof of GitHub asset integration.

### Key files

- `preview/post-shuffle/scene.mjs` — card handoff, scripted-reading state and final Ask Artemis trigger.
- `preview/post-shuffle/reading-stage.mjs` — Artemis portrait, table/card stage, scripted chapters and HUD.
- `preview/post-shuffle/SynthesisController.mjs` — staggered portal animation and synthesis/follow-up lifecycle.
- `preview/post-shuffle/SynthesisChat.mjs` — AI chat DOM, avatar selection, question, typing and composer.
- `preview/post-shuffle/ArtemisSynthesisAssets.mjs` — Artemis art slots and avatar mappings.
- `preview/post-shuffle/theme-layout-variables.css` — **primary IDE layout-tuning controls**.
- `preview/post-shuffle/gate-d-layout-corrections.css` — current variable consumers and visual corrective rules.
- `preview/post-shuffle/artemis-synthesis-remake.css`, `artemis-chat-layout-polish.css`, `reading-polish-v4.css` — earlier overlays; check cascade conflicts before adding overrides.
- `assets/artemis/synthesis/` — required original/derived PNGs and their checksum manifests (**not yet committed**).
- `scripts/install-artemis-synthesis-assets.py`, `scripts/verify-artemis-owner-art.py` — install and verify source art.
- `scripts/smoke-artemis-synthesis-remake.mjs`, `scripts/smoke-post-shuffle.mjs` — browser regression and visual capture.

## Milestone — Mobile Table Grounding + IDE Layout Controls (Nov 11, 2026)

**Implementation landed on PR #28, pending actual art-backed visual approval.** The branch remains **draft / unmerged / undeployed**.

- **Single original painted tabletop, mobile:** Re-enabled the existing `.reading-art-table-surface` as a subtle 3D light surface, without painting a second tabletop/rectangle. The existing source chamber `bg_artemis_reading_stage_main.webp` is panned `-56px` on phones to expose its genuine gold-rimmed table. The `.reading-art-hero::after` foreground matte repeats those **exact original bitmap pixels** from `--table-top` downward, matched by the current `scene.mjs` bitmap-cover measurement (`--room-cover-size`, `--room-cover-position`). Original opaque Artemis stays **behind** that foreground layer; all three original RWS/foil nodes remain **in front** at 42°.
- **No panel-over-table overlap:** Removed the older `-54px` mobile dialogue/HUD overlap. The reading panel stays in normal flow below the hero. Mobile hero tuning was adjusted to `390px` at standard phone sizes and `370px` for <=680px-high phones; `--cards-y-offset` becomes `-6px` and `4px`, respectively, so the three cards retain their prior vertical relationship with Artemis. Do not delete or weaken the 458×553 regression asserting the full panel is below the hero.
- **Root-variable IDE control:** `preview/post-shuffle/theme-layout-variables.css` now exposes `:root` values at desktop, <=720px, and <=720px/<=680px height breakpoints. The **five primary knobs** are `--artemis-top`, `--artemis-scale`, `--table-top`, `--cards-y-offset`, and `--panel-padding`. Secondary `--reading-hero-height`, `--reading-panel-height`, `--reading-atmosphere-pan`, `--artemis-portrait-width/height`, `--reading-card-width`, `--reading-spread-bottom`, perspective, spacing and chat controls live there too. The last-loaded `gate-d-layout-corrections.css` consumes those variables. Preserve the **42°** card pitch.
- **Regression guard:** `scripts/smoke-post-shuffle.mjs` adds `14d-mobile-grounding-contract-390x844.json`: verify five nonempty root variables, the synchronized original-room foreground matte, one DOM table with no duplicate background bitmap, and full panel below hero. Existing script validates the original card/foil, contact with the table at 390×844 and vertical separation at 458×553.
- **Logs:** `.github/workflows/artemis-synthesis-remake-review.yml` now redirects the full `npm test`, preview, and both browser-smoke consoles to `.artifacts/logs/` and uploads that directory with screenshots. Emit only concise CI pass/fail messages; never output binary/base64.
- **Checks and caveats at this documentation update:** Source checks and `npm test` **PASS** at [the latest code-only CI run](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/43035426823); browser check was **still running** at inspection, **not a pass claim**. The owner-art integration check **FAILS (expected)** due to 19 original/derived PNGs not present in the GitHub checkout. Latest verified pre-documentation code commit: `5bb0c1f4cd4cf64ec11a956941d2c3e844a3aaa3`. A remote branch/PR head was inspected; **local `git status` could not be verified** because this tool session has no clone and direct GitHub network resolution is blocked.

**Acceptance still required:** Inspect actual 390×844 and 458×553 Chromium screenshot captures **from the final branch HEAD**, plus 860×720 and wider desktop, against owner references. Visually verify table continuity, card-base contact, no doubled rim, portrait/table depth, no overlapping panel, and no text clipping. CSS/DOM assertions and provisional art are **not** owner visual approval. Do not merge or deploy.

## Unresolved Feedback Items

These remain **open for owner visual review**, even where tentative CSS fixes or assertions have been committed:

1. **Mobile table restoration and physical grounding** — `image_124b5a.jpg`. **Source correction committed; visual sign-off still OPEN.** The one original-room matte and DOM table are restored with 42° cards in front and Artemis behind the rim. Confirm actual screenshots show no doubled table, floating portrait, unnatural rim/card overlap, or vertical gaps.
2. **Synthesis portrait cutoff** — `image_12473b.jpg`. Hide hard lower-waist/side cut lines with tasteful **celestial mist, glow and particle atmosphere** while preserving the original opaque character illustration and the full temple chamber. Avoid replacing the scene with flat dark gradients.
3. **Mobile frame ornament safety** — The `ui_reading_frame_panel_mobile.png` nine-slice rendering must leave enough **top/side padding** that “Unified Reading”, the user's question, avatars and messages never collide with gold moon/star flourishes. Keep controls clear of the illustrated bottom cap.
4. **Legacy chat CTA unmount** — `image_124471.jpg`. **Fully unmount or hide old stage controls** such as “THREE CARDS READ” and “Draw Guidance” during the AI chat phase; only the new chat composer/ASK action should be visible. Verify desktop and mobile and prevent overlap with form fields.
5. **IDE-tunable layout variables** — **Root variable controls landed**, with five required direct-consumption knobs: `--artemis-top`, `--artemis-scale`, `--table-top`, `--cards-y-offset`, `--panel-padding`; reading dimensions, mobile source-room pan, card spacing/scale and chat geometry are also exposed. **Further legacy stylesheet consolidation remains optional follow-up** after screenshot approval. Scene JS still sets only measured bitmap offsets, not primary layout knobs.
6. **Desktop synthesis composition** — `image_124f3c.jpg`. Eliminate black side blocks, duplicate chamber/table imagery and default-looking rounded inputs. Use the correct desktop frame `ui_reading_frame_panel.png` (not the mobile PNG).
7. **Verify genuine art integration** — Commit all 19 original/derived synthesis PNGs with their manifests, rerun checks against the actual GitHub checkout and capture new real-build screenshots before requesting visual sign-off.

### CI status at handoff

**Latest inspected pre-handoff head:** `849fd044fdf10a0e2120ed41cfd8f9991d503fd9`. The commit created by this handoff changes the head; always re-query the branch.

- [CI run 43025283917](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/43025283917): **source PASS; browser FAIL** during the retained `smoke-post-shuffle.mjs` mobile-layout regression. The specific failing assertion was **“Full-height dialogue panel must remain below the three-card stage”** at line 590. Investigate actual mobile hero, panel and footer rectangles and fix the visual layout/instrumentation honestly; do not simply suppress the assertion.
- [Owner-art gate](https://github.com/flyingdurian/JuHua-Speaks/actions/runs/43025283813): **FAIL as expected**, because the 19 owner/derived synthesis PNGs are not present in GitHub.
- Local/staged visual captures and some prior browser workflows have passed, but are **not substitutes for current-head CI and screenshots with the real owner assets**.

## Immediate Next Actions

1. Verify the **latest post-handoff PR #28 HEAD** and its source/Chromium status. Download `.artifacts/logs/` from the latest CI artifact. Confirm the new 390×844 grounding-contract assertion and the original 458×553 panel-separation regression both pass; investigate any failure rather than bypassing it. Use the owner's four marked screenshots for comparison.
2. Refine the actual reading-stage table/card/portrait/panel geometry, with the variables file as the layout source of truth. Test 390×844 mobile, 458×553 short mobile and 860×720 desktop at minimum, plus a wider desktop.
3. Verify AI synthesis has the correct chamber artwork, masked portrait boundaries, readable question/header, separate ornamental desktop/mobile assets, and **no retired CTA DOM**.
4. Install and commit owner PNGs plus derived face crops and manifests (when authenticated GitHub binary transfer is available). Run `python scripts/verify-artemis-owner-art.py` **in the actual checked-out GitHub branch**.
5. Rerun `npm test`, `node scripts/smoke-artemis-synthesis-remake.mjs` and `node scripts/smoke-post-shuffle.mjs`, then inspect/capture real desktop and mobile screenshots.
6. Keep PR #28 draft. Obtain owner **visual** approval before merge or deployment.

**Run local preview:** `npm run preview:gate-b`, then open `http://localhost:4184/preview/post-shuffle/?skip=selection` for rapid card-selection testing. Preserve the original three RWS cards and their foil/42° pose through the entire reading.

## Developer Workflow Rules

These rules are **permanent** for subsequent development sessions.

1. **Concise Terminal Output:** Save full test traces, builds, browser logs and console output to **`.artifacts/logs/`** in the working checkout. **Never** dump raw logs, long traces, base64 strings, or large binary payloads into chat responses. Report test/build outcomes in **only five brief pass/fail summary lines**, with detailed log artifact paths or CI links for investigation. Do not misrepresent skipped, incomplete or failed checks as passed.
2. **Handoff Maintenance:** **Update this root `HANDOFF.md` at every completed PR milestone or major bugfix pass**, with the actual branch, test results, visual review status, outstanding issues and next steps. Keep it authoritative and avoid duplicative status dumps elsewhere.
3. **Clean-Slate PR Merges:** **Delete feature branches immediately after their changes are merged into `main`** (local and remote, as appropriate and permitted), only after confirming a successful merge and that no open dependent stacked PR requires that branch. **Do not delete the current PR #28 branch while it is draft/unmerged.**

**Never conflate a clean CI pass with visual approval; do not merge or deploy unapproved owner-facing visuals.**
