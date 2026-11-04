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
