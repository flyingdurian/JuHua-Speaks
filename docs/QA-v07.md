# JuHua Speaks v0.7.0 QA · The Reading Comes Alive

## What was implemented

- All previous drawing steps, 78-card RWS JPEG manifest, orbiting universe, card-to-hand flight, slow manual reveal, Chinese private import, and saved spread remain unchanged.
- The final reading screen is rebuilt as a cinematic three-card story. Actual authentic card face images rise into a celestial spread. Clicking any card spotlights that card; Previous/Next and a five-chapter progress control move between introduction, three cards, and full synthesis. Card aura color is symbolic only.
- The local `src/demo-reading.mjs` module supplies deterministic copy with context: **the exact submitted question**, real two-path labels, card names, positions, orientations, one of several question topics, interpretation lens, and bilingual wording. No model, network call or persistence.
- The final synthesis unlocks a sample conversation with three suggested follow-ups and free-text questions (2–280 characters, max 12). Replies reference the existing spread and their own question. Answers are labeled **SCRIPTED DEMO** and do not claim intelligence or predictions. Conversation state is in memory and clears on new reading or change of language or lens. The existing `worker/` service is deliberately not connected.

## Automated checks

From repo root run `npm test`, `node --check src/app.mjs`, and `node --check src/demo-reading.mjs`. All 25 Node checks passed during local development. The new test suite checks context sensitivity across two different topics, exact option labels, three distinct orientations, Chinese language versus cultural lens, history turns, strict validation, and no `requestAiReading()` invocation in the app.

## Manual review on deployed website

1. Verify header/footer version **v0.7.0**. Enter a real English or Simplified Chinese question, choose a spread and lens, shuffle, select three cards in 3D or flat 2D, and slowly reveal all three.
2. When entering the final reading, check the intro layout. Select card 1/2/3 directly and observe a visible focus and meaningful aura. The **original** RWS art must remain unmodified. Review by arrows and chapter dots. The full synthesis should appear only at chapter 4/4.
3. Test two different questions with the **same** cards using local test helpers (or note differences with two full draws); topic phrasing should change. Compare Path A / Path B and the guidance position. Confirm none of the generated text is labeled AI.
4. In synthesis, click one suggested follow-up and submit a custom follow-up. Check that replies reference the drawn cards, appear in the same session only, escape HTML and do not cause a network request to an AI endpoint. Switch language or lens and confirm conversation resets rather than mixing languages.
5. Test at 320px/375px and desktop width, keyboard-only navigation, iOS Safari card image loading, Chrome WebGL performance, and `prefers-reduced-motion`. No auto-scrolling should steal the user's position while reading a reply.
6. Refresh: the chat must disappear. Explicit "Save this spread" should persist only the chosen spread metadata, not the chat transcript or any API key.

## Known limitations

- The browser test harness previously rejected local navigation / timed out. Unit tests and GitHub CI validate code structure, but **hands-on live visual testing remains required**.
- Scripted replies are a constrained prototype, not genuine natural-language reasoning or a model conversation. They may not meaningfully answer arbitrary prompts.
- The Chinese Tarot digital art license remains unresolved for public distribution; session-local authorized import is unchanged.
- API Worker implementation remains in the repository for later; **no AI request is initiated by this release**.
