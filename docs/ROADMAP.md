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

## Milestone v0.4 — real engine and frontend quality

1. Replace CSS-3D-only sphere with optimized WebGL/Three.js scene and touch-friendly, deterministic camera controls. Preserve a no-WebGL accessible fallback. Profile low-end Android and iOS.
2. Add a **private, server-side** LLM adapter. Never put API keys in frontend code. Include structured prompts containing **exact user question + options + card IDs + orientations + spread roles + lens**, with card-wise interpretation and spread synthesis. Backend should validate inputs and implement rate controls.
3. Add consent, content safety boundaries (not professional advice), and meaningful self-reflection/follow-up chat. Tests must detect generic canned responses.
4. Build real illustrations into mobile-friendly, first-party image packs with hashes and preload budgets; QA image legibility/quality of all 78.
5. Test deploy and browser automation (keyboard, mobile touch, reverse cards, language changes, repeated shuffles).

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
