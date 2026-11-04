# Milestone 8.0 — Master Implementation Directive
Approved: 2026-11-04 | Begin Phase 8.1 immediately | Owner: JuHua Speaks (temporary project name)

## Product principles
- JuHua Speaks / 菊花说 is a temporary working title. Brand names, navigation labels, card-back type and headings must come from BrandConfig; API route IDs and data keys stay brand-neutral.
- Preserve the 78 authentic Rider–Waite–Smith illustrations. No recreated/vector face artwork. The future Chinese/Eastern mythology pack is 78 custom user-generated and approved illustrations; never publish unlicensed Jui Guoliang scans.
- Artemis is the default reader. Dynamic ReaderDefinition supports alternatives (Cassiel, Selene, Orion, Lian, Mnemosyne); surface only a small tested set at v1. Phase 8.4 decides whether to prune to 2–3.
- Default spread: three cards with positions Past, Present, Future. Choice spread remains available optionally. No rigged draw odds or paid rarity.
- Question intent classification is local until explicitly configured otherwise. Real final AI reading cannot start until the user CONFIRMS three cards, preserving an authentic user choice.
- The public site stays a clearly labeled scripted reading until a production-grade AI/permissions review. Exodia remains opt-in on the user's Windows localhost.

## Named session state machine
Canonical pure reducer: src/ritual-machine.mjs. Existing numerical step UI is a temporary compatibility projection, not a second source of truth.

State | Accepted event → next state | Main rule
landing | SUBMIT_QUESTION → question_submitted | 3–600 chars and stable deck/reader snapshot
question_submitted | COLLAPSE_COMPLETE → shuffle_ritual | preflight local intent classification; no full AI
shuffle_ritual | MIN_SHUFFLE_ELAPSED → deck_formed | 5–8 sec shuffle gate; user cannot skip
deck_formed | FINISH_SHUFFLING → sphere_selection | 78 backs burst from deck
sphere_selection | TOGGLE_CARD stays, CONFIRM_THREE → three_locked | 0–3 distinct cards; unselect allowed; lock only at exactly 3
three_locked | VORTEX_COMPLETE → three_reveal | immutable IDs/order/orientation; trigger full AI once when enabled
three_reveal | REVEAL_CARD stays, ALL_REVEALED → reader_invitation | click/drag/pinch; all 3 required
reader_invitation | INVITE_READER → main_reading | Artemis default with original cards above table
main_reading | START_GUIDANCE → guidance_prompt, ASK_FOLLOWUP stays | per-card + synthesis
guidance_prompt | SUBMIT_GUIDANCE_QUESTION → guidance_selection | preflight new question only
guidance_selection | LOCK_GUIDANCE_CARD → guidance_reveal | 1 new card, excludes original 3; start guidance AI on lock
guidance_reveal | REVEAL_GUIDANCE → guidance_reading | display general card meaning first
guidance_reading | ASK_FOLLOWUP stays, RESET → landing | guidance leads; previous 3 inform second half

Global RESET cancels animations, timers and stale async responses. Session/request IDs guard results. No implicit rerolls, no silent reorder and no background network calls without user opt-in. Guidance never changes the original three cards.

## Phase 8.1 rendering and timing
1. Landing: obsidian-black full-viewport star field with multi-depth orbiting **authentic** RWS card faces and lacquered backs, occasionally approaching camera. Center question and Start Divination. Visible optional deck/spread controls; reduced motion and 2D fallback.
2. Submit: 0.8–1.3 s visual convergence of existing near/far cards to a chaotic cloud. Capture question + deck + reader + locale and run **cheap local preflight** only. No final reading with unknown cards.
3. Mystical shuffle: 5–8 s (default ~6.5 sec); 'Please meditate on your question'; swirling circle of jumbled cards resolves into floating deck. Enable Finish Shuffling only after minimum time. Fisher–Yates secure shuffle once, independent of animations.
4. Finish: 0.8–1.5 sec deck burst to inward-facing WebGL sphere of 78 backs. Auto-orbit + drag/keyboard. Cards remain visible with luminous cloudy glow on selection; any selected card can be deselected before confirmation.
5. Confirm 3: one atomic three_locked event. 75 unselected cards get sucked into black-hole vortex while 3 selected cards fly toward Past, Present, Future. Then show 3 face-down large cards, preserving the v0.7 interactive peel until Phase 8.2.
6. Accessibility: 2D full-deck fallback, pointer hit-testing tied to painted frame, reduced-motion instant transitions, focus, screen-reader progress, cleanup when tab hides or component unmounts.

## Two-stage AI contracts (design, not public activation)
Preflight from submitted question:
{
 "version":1, "sessionId":"UUID", "question":"...", "locale":"en",
 "spreadId":"past-present-future", "deckId":"rws", "readerId":"artemis",
 "options":[], "consentToSendQuestion":false
}
Expected:
{"intent":"career|love|growth|decision|general","contextTags":[],"safetyFlags":[],"modelRequired":false}

Main reading ONLY on three_locked:
{
 "version":1,"requestId":"UUID","sessionId":"UUID","kind":"main",
 "preflight":{"intent":"career"},"question":"...", "locale":"en",
 "deckId":"rws","readerId":"artemis","spreadId":"past-present-future",
 "cards":[
  {"cardId":"major-00","position":"past","orientation":"upright"},
  {"cardId":"cups-02","position":"present","orientation":"reversed"},
  {"cardId":"major-09","position":"future","orientation":"upright"}
 ],"options":[],"history":[]
}
Response must contain three distinct ID-matched card readings, per-card shortMeaning + interpretation + evidenceQuestion, cross-card relationships, holistic synthesis, grounded nextSteps, reflection, disclaimer. Response validation is server-side against immutable selected IDs/positions/orientations. Unstructured Exodia output is labeled experimental, never claimed to be validated structured per-card output.

Guidance request ONLY on guidance-card lock: same sessionId, original question, original 3 card objects and main reading summary, NEW guidance question and ONE new guidance card, reader profile and bounded recent turns. Guidance response: new card and question first, linkage to prior three second, practical reflection last. Exodia creates isolated conversations; resend relevant context every task.

Local Exodia generation remains serialized: one POST at a time, minimum five-second gap after completed task before the next POST, sequential GET polling every 1–2 seconds, no automatic retries.

## DeckConfig, textures and meaning dictionary
DeckConfig: id, displayName[locale], rightsStatus, cardIds[78], faceAsset(cardId), backStyle, backTexture, semanticDictionaryId, available, localOnly, attribution. Semantic card IDs remain stable across all visual decks; artwork and meaning metadata are separate. Texture loaders resolve via the selected deck config, not hardcoded RWS file paths. Future Eastern mythology art must be a complete custom licensed set before public enablement; private local image import remains session-only.

## Dynamic readers
ReaderDefinition registry: id, localized name, portraitAsset, promptTemplateId, specialty, styleGuidelines, supportedLocales, enabled flag, sortOrder. Artemis primary. Alternative readers influence emphasis and voice but not objective card identity or factual claims. User testing at Phase 8.4 decides whether to consolidate roster to 2–3.

## SQL and long-term history
Reference migration: db/postgres/001_milestone8_schema.sql. PostgreSQL is a proposed design target; NO live DB, user login or analytics in Phase 8.1. Tables include deck_catalog, reader_catalog, sessions, readings, reading_cards, guidance, intent_metadata, and session_events. Persist only on explicit Save consent. Records include deck/reader version, exact immutable locked cards and orientation, reading payload and chronology; optional coarse intent tags for future Thread Observations. No detailed profiling/recurrence inference without opt-in. Provide export/delete and strict per-user authorization before shipping persistence. Avoid storing sensitive question text in analytics.

## Rollout
Phase 8.1 NOW: front-half visuals + named machine + deck/brand/reader config + SQL/doc scaffolding.
Phase 8.2: true hand-peek reveal, Artemis table, smoke and staged reading.
Phase 8.3: tarot-professional per-card curation, valid structured AI, optional local Exodia.
Phase 8.4: 1-card guidance ritual, contextual secondary AI, evaluate/prune reader roster.
Phase 8.5: consent-based saved history, authenticated SQL backend, privacy/delete/export; optional future Thread Observations.

## Phase 8.1 acceptance
- Version v0.8.1 visible; brand text uses centralized config. No endpoint renaming needed for future rebrand.
- Landing has actual RWS face cards approaching camera, dark star field, centered question and Start Divination.
- Submit starts local preflight + visible converge; shuffle lasts 5–8 seconds and cannot be skipped; Finish Shuffling reveals deck/sphere only after gate.
- WebGL interior sphere and 2D fallback retain 78 unbiased card backs. Users may select/unselect up to three; no drawn card becomes immutable before Confirm 3 Cards.
- Confirm executes exactly one lock; unselected 75 disappear in vortex; selected trilogy moves in order into Past/Present/Future and existing reveal still works.
- Deck registry exposes RWS and future custom Chinese configuration without shipping scans; reader registry supports future dynamic personas.
- npm tests and CI pass including fairness, guards, lock idempotence, timer cancellation, low-motion fallback and legacy Exodia mock. No automatic live generation.
- QA handoff: implemented, test URL + exact checks, blockers, warnings; details in repository docs.
