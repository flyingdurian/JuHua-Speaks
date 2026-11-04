# Roadmap · 菊花说 / JuHua Speaks

## Milestone v0.3 — standalone shell (this change)

- [x] Brand and bilingual title: **菊花说 · JuHua Speaks**
- [x] Browser-native deployable web app (zero runtime dependencies)
- [x] Complete authoritative RWS 78-card image manifest sourced from a unified scanned collection
- [x] True image card faces only; no vector or invented card imagery
- [x] CSPRNG Fisher–Yates shuffle with rejection sampling; no rarity or biased draw weights
- [x] Interactive rotating CSS 3D sphere with 78 physical card backs and manual selection
- [x] Shuffle, choose 3, reveal, role-based local reading preview, bilingual UI
- [x] Decorative meaning-based shine, and reduced-motion handling
- [x] Two spread layouts and three interpretation lenses
- [x] Chinese illustrated deck researched, kept locked pending image rights
- [x] CI checks, artwork sync/audit, deployment workflow

## Milestone v0.4 — GPU sphere and private AI contract (this change)

1. [x] Add a GPU WebGL2 sphere with 78 rendered card backs, drag controls and projected click selection, preserving the CSS-3D fallback and a manual 2D switch. [ ] Profile low-end Android and iOS; perform live browser rendering QA.
2. [x] Build an **optional private server-side** AI Worker with secrets, origin validation, rate limits, structured prompts and response verification. [ ] Configure/deploy provider with explicit user opt-in, verified regional availability, moderation and budget controls. Never put API keys in frontend code.
3. [x] Display explicit AI transmission notice and preserve local fallback; introduce evidence questions and reflections. [ ] Add follow-up chat, reviewed safety boundaries and qualitative content tests with real model outputs.
4. [x] Build genuine illustrations into a first-party image pack in GitHub Actions. [ ] Add hashes, preload budgets and visual QA of all 78 for mobile.
5. [x] Add tests for sphere math, card selection and AI contracts. [ ] Browser GPU/mobile touch regression automation and keyboard usability QA.

## Milestone v0.5 — Chinese-market readiness and alternative art

1. Production domain + hosting validated on mainland China devices and networks (including HTTPS, DNS, images, AI endpoint); review regulatory obligations for launch.
2. Obtain a rights agreement and full approved image set for Jui Guoliang's *The Chinese Tarot*, **or** commission a complete original 78-card Chinese-inspired deck with commercial rights. No incomplete art swaps.
3. Chinese Tarot semantic card mapping, localizations reviewed by bilingual Tarot readers, and content moderation/privacy checks.
4. Guided onboarding, optional saved reading history with clear local/cloud storage controls, accessibility and analytics without invasive surveillance.

## Acceptance checks

- `npm test` passes; no missing or duplicated card IDs or source filenames.
- Every image on the 78-card gallery is the original Pamela Colman Smith illustration, never an invented or empty graphic (if asset fails, display an explicit error).
- No repeated card appears in one three-card reading; shuffles do not add rarity weights.
- Every local preview is explicitly labeled **not live AI**; production AI must directly address the exact user question.
- Any Chinese illustrated artwork **must remain disabled** until rights and all 78 images are verified.
- `npm run assets:sync && npm run assets:audit` completes on a network-enabled build worker.

## Milestone v0.5 — Inside the Stars (2026-11-04)

- [x] Persistent version badge `v0.5.0` in web app masthead/footer.
- [x] Rebuild sphere as an inward-facing WebGL chamber, viewer at the center, 78 cards in six latitude bands, ray-plane selection, GPU fallback on unsupported devices.
- [x] Distinct flat 2D tabletop (78-card grid) with identical shuffle order/selected cards.
- [x] Slow, per-card interactive reveal: drag edge, two-finger pinch, progress hold, keyboard and explicit button; reading locked until all three are revealed.
- [x] Genuine Chinese Tarot source/publisher links, digital rights policy, session-only import of 78 user-provided, authorized original illustrations.
- [x] Unit tests plus browser smoke test for the 2D/reveal flow; device GPU QA remains a manual gate.

## Milestone v0.6 — polish and live reading activation

1. Test real WebGL shader rendering/picking in Chrome/Safari/Android (browser sandbox WebGL2 disabled in CI). Polish starfield, camera movement and ease, with consistent back appearance between GPU and 2D.
2. Deploy private AI worker to approved hosting and configure allowed origin, secrets, rate limiting, and explicit read consent; test English and 简体中文 question-specific synthesis and follow-up chat. GitHub Pages alone cannot host this backend.
3. Obtain digital display/reproduction rights for Jui Guoliang Chinese Tarot or a complete 78-card properly licensed alternative before public deployment. Keep private local import isolated.
4. Perf tuning, memory audit, touch gesture and reduced-motion accessibility; visual QA all 78 card scans; review mainland China availability/compliance before distribution.

See [QA-v05.md](QA-v05.md) and [CHINESE_ARTWORK.md](CHINESE_ARTWORK.md).

## Milestone v0.6.0 — Orbiting Card Universe (2026-11-04)

- [x] Slow, continuous ambient rotation inside the 78-card universe, with manual drag takeover and a pause/resume control.
- [x] Selection geometry follows the **last rendered card positions**, preventing clicks from drifting ahead of the visible card as it moves.
- [x] Select a passing card → starburst → floating card-back flies to the next hand slot → hand slot fills. Block fast repeat selection during the animation.
- [x] Matching hand delivery for the flat 2D option; respects reduced motion and WebGL fallback; lifecycle cleanup when navigating away.
- [x] Version badge updated to `v0.6.0`, automated coverage expanded to 20 checks, detailed device test plan in [QA-v06.md](QA-v06.md).
- [ ] Device/browser visual QA of real GPU timing, hit targets and flight trajectory (sandbox browser navigation blocked).
- [ ] Live AI Worker deployment and licensed Chinese Tarot public images are separate, unchanged release gates.

## Milestone v0.7.0 — The Reading Comes Alive (2026-11-04)

- [x] **No live AI connection** per user direction: keep the existing private Worker code dormant and remove the frontend's AI request path while this release is a demo.
- [x] Add cinematic post-reveal sequence with all three authentic card illustrations moving from hand toward a celestial spread, spotlighting the selected card with its meaning-based glow; no re-illustration or vector face substitutes.
- [x] Interactive chapters: opening → individual cards 1–3 → question-specific combined spread. Each card is directly selectable; previous/next navigation and keyboard-accessible buttons included.
- [x] Add a **clearly labeled scripted demo** for readings and a local follow-up conversation: exact question, option names, drawn card IDs/orientations, interpretation lens and EN/简体中文 affect scripted output, with no service calls.
- [x] Add two practical reflection steps and a question-to-check, rather than confident predictions or direct financial/legal/medical advice.
- [x] QA: 25 Node tests, including dummy semantics and API-disabled contract. Reduced motion styles, client-side input length and escaped rendering.
- [ ] True end-to-end browser visual QA of the cinematic sequence on Android, iOS Safari and desktop; browser sandbox may block localhost navigation.
- [ ] Live AI Worker activation, Chinese Tarot public image rights and mainland China hosting remain **future separate release gates**.

See [QA-v07.md](QA-v07.md).


## Milestone 8.0 — Approved master architecture / rollout
Master implementation directive: [MILESTONE_8_MASTER_DIRECTIVE.md](MILESTONE_8_MASTER_DIRECTIVE.md).
Reference SQL schema: [../db/postgres/001_milestone8_schema.sql](../db/postgres/001_milestone8_schema.sql).
**Temporary brand:** all display strings move to BrandConfig. **DeckConfig:** RWS current + future original-art Chinese/Eastern mythology 78-card pack, no unlicensed scans. **Reader registry:** Artemis default, optional dynamic personas and later usage-based pruning. **Thread Observations:** future explicitly consented metadata analysis, not enabled now.

### Phase 8.1 — The Celestial Ritual (v0.8.1)
- [x] Centered question and moving near/far historical RWS illustrated cards.
- [x] Question-submit convergence → 5–8 second automatic mystical shuffle → floating deck → Finish Shuffling.
- [x] Burst into inward 78-card sphere with selectable, visibly glowing cards that can be deselected until explicit three-card lock.
- [x] Black-hole cleanup of the other 75 cards and fly selected trio into Past/Present/Future reveal positions.
- [x] Named state machine with transition guards and two-stage local-preflight/locked-card AI contract scaffolding.
- [x] Brand, visual DeckConfig, reader registry, opt-in SQL reference and master architecture doc.
- [ ] Manual Chrome/Safari/mobile GPU visual QA; CI alone is not a render quality certificate.
- [ ] No premature real AI generation; structured production AI work is scheduled for Phase 8.3.

### Later phases
8.2: Artemis table, card peek/reveal and smoke-to-reading.
8.3: professional structured 3-card interpretation, optional approved local AI adapter, reader style validation.
8.4: extra guidance-card question/draw/reveal/reading with original-trio context; user-testing reader roster.
8.5: saved history with authenticated SQL backend and consent, deletion/export; Thread Observations is future opt-in.
QA document: [QA-8-1.md](QA-8-1.md).
