# JuHua Speaks — Private AI reading service (v0.4 foundation)

**Status:** Implementation and unit tests complete. The Worker is **not deployed**; the frontend intentionally retains a transparent local preview until the service, budget limits and privacy policy are set up. GitHub Pages cannot securely store an LLM API key.

## Architecture

1. The browser renders a local demo on GitHub Pages. It never silently sends questions to a model. If and only if `index.html` contains a configured HTTPS `<meta name="juhua-reading-endpoint" content="https://YOUR-WORKER.example/api/reading">`, a clearly labeled **Generate my AI reading** button appears.
2. Clicking that button sends the exact question, explicit A/B choices, spread, lens, language, and **three card IDs + orientations** to the server. No user account or cookie is sent.
3. `worker/index.mjs` validates all inputs against `src/deck.mjs` and reconstructs names, original card meanings, and spread positions **server-side**, never trusting client-supplied card descriptions. Only the complete original RWS deck is accepted; the copyrighted Chinese illustrated deck remains disabled pending a license.
4. The Worker demands a fixed `ALLOWED_ORIGIN`, a Worker secret `OPENAI_API_KEY`, and an `AI_RATE_LIMITER` binding. It then calls the OpenAI **Responses API** with `store:false` and strict structured JSON output. The response is validated against the exact three card IDs before it reaches the browser.
5. The browser displays the card-specific answer, synthesis, evidence questions, reflection prompt and two practical next steps. A failed request displays an error and retains the local preview.

## Deploy after approval of provider, costs and privacy terms

This service is **not automatically deployed from GitHub Actions**. Its origin and provider are separate from static Pages hosting.

1. Set up a Cloudflare account and an approved region/domain. Review whether your intended users can legally and reliably reach the hosting and model services; do not assume mainland China accessibility.
2. Deploy the Worker using a current Wrangler CLI from the repository root. Configuration: `worker/wrangler.toml`. Adjust the name, rate-limit namespace, and production domain as needed.
3. Add environment variable `ALLOWED_ORIGIN=https://flyingdurian.github.io`, with no trailing slash or repository path, and `OPENAI_MODEL` set to a Responses/structured-output-capable model. **Never put `OPENAI_API_KEY` in source control, GitHub Pages files or a normal public env variable.** Create it as a Worker secret with `wrangler secret put OPENAI_API_KEY --config worker/wrangler.toml`.
4. Enforce a strict server-side budget cap, bot protection, appropriate moderation and alerting before enabling public usage. The built-in per-IP Cloudflare rate-limiter is approximate and may be harsh for shared/mobile IPs. It is an **alpha defense**, not a full financial or abuse protection system.
5. After validating TLS, CORS, real-world availability and privacy disclosures, update the meta tag in `index.html` to the approved HTTPS `/api/reading` URL. Deploy and test the workflow. **Do not skip explicit user opt-in.**

## Prompt contract and tests

`src/reading-contract.mjs`: request schema (4–600 character question; exactly three distinct enabled cards; allowed orientations, spread, language and perspective), response schema (three card readings, exact IDs/order, long-form synthesis and actionable reflection). `test/v04.test.mjs` runs both client-side and mocked Worker paths without incurring real API charges.

**No guaranteed forecasts.** The model is directed to respond to the question rather than repeat generic card encyclopedia text; reflect on multiple interpretations, evidence and tradeoffs. Treat legal, medical, financial and crisis-sensitive prompts responsibly. The Worker has no storage or analytics and sets `Cache-Control: no-store`, but the configured model provider processes the transmitted question; disclosures and retention terms must be verified for the real launch region. The model API is for interpretive entertainment, not professional advice.

## References checked November 2026

- OpenAI Responses API: https://developers.openai.com/api/reference/resources/responses/methods/create
- OpenAI structured outputs guide: https://developers.openai.com/api/docs/guides/structured-outputs
- Cloudflare Workers rate limiter: https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
