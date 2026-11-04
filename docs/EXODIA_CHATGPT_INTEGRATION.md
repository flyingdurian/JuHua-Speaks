# Exodia ChatGPT Integration for JuHua Speaks

This is an **optional, local-only experimental integration**, not an active replacement for the deployed v0.7 scripted reading. It uses Exodia's signed-in ChatGPT browser session. Do not activate it on GitHub Pages.

## Local architecture

```text
JuHua browser
    -> JuHua Node server
        -> Exodia API at http://127.0.0.1:8765
            -> signed-in ChatGPT browser
```

Do not call Exodia directly from browser JavaScript. JuHua runs on port `4173`
and Exodia runs on port `8765`, so a direct request is cross-origin. It would
also expose Exodia's mutation header to every browser user. Put the Exodia calls
in JuHua's Node server and expose a same-origin JuHua endpoint such as
`POST /api/reading`.

This setup is local-development only. A GitHub Pages deployment cannot securely
reach a private Exodia process on another machine. Production requires a
private authenticated backend running alongside Exodia.

## Services

Start Exodia:

```powershell
cd C:\Users\TFBOSS\Documents\GitHub\exodia-tower\orchestrator
.\.venv\Scripts\python.exe main.py
```

Start JuHua:

```powershell
cd C:\Users\TFBOSS\Documents\GitHub\JuHua-Speaks
npm run dev
```

Useful addresses:

- Exodia API: `http://127.0.0.1:8765`
- Exodia interactive API documentation: `http://127.0.0.1:8765/api/docs`
- JuHua: `http://127.0.0.1:4173`

## Run the local compatibility probe

Cloud and remote coding agents cannot test your Windows loopback service:
their `127.0.0.1` refers to their own isolated machine. Run the checked-in
probe from a local terminal instead:

```powershell
cd C:\Users\TFBOSS\Documents\GitHub\JuHua-Speaks
npm run api:test
```

The probe checks the Swagger page and the presence of task POST/GET operations in OpenAPI. It then submits **one** bilingual Tarot-reading generation and polls using separate GET intervals (1.5 seconds by default). It does **not** test multiple simultaneous generations, semantic reading quality, or follow-up continuity. To inspect only the API
contract without consuming a ChatGPT request:

```powershell
npm run api:test -- --dry-run
```

Optional settings:

```powershell
$env:EXODIA_URL = "http://127.0.0.1:8765"
$env:EXODIA_TEST_INTERVAL_MS = "5000"       # conservative spacing for docs/POST requests
$env:EXODIA_TEST_POLL_INTERVAL_MS = "1500"  # only status GET polling
$env:EXODIA_TEST_REQUEST_TIMEOUT_MS = "25000"
$env:EXODIA_TEST_TIMEOUT_MS = "180000"
npm run api:test
```

## Exodia endpoints

### Create an automatic ChatGPT task

```http
POST http://127.0.0.1:8765/api/command/tasks
Content-Type: application/json
X-Exodia-Client: exodia-dashboard
```

```json
{
  "model_choice": "chatgpt",
  "agent_id": "kiko",
  "prompt": "Interpret this Tarot spread...",
  "web_research": false
}
```

The request returns HTTP `201` immediately. Save the returned `id`.

### Pull task state and result

```http
GET http://127.0.0.1:8765/api/command/tasks
```

Find the task with the saved `id`. Continue polling while its state is
`opening`, `typing`, `submitting`, or `waiting_for_reply`.

Terminal states:

- `answered`: use `answer` and optional `media`.
- `failed`: show `error` and allow the user to retry manually.

## Node 20 client

The following code belongs on JuHua's Node server, not in `src/app.mjs`:

```js
const EXODIA_URL = process.env.EXODIA_URL || 'http://127.0.0.1:8765';
const EXODIA_HEADERS = {
  'Content-Type': 'application/json',
  'X-Exodia-Client': 'exodia-dashboard',
};

export async function requestChatGptReading(prompt, {
  timeoutMs = 180_000,
  pollMs = 1_000,
} = {}) {
  const created = await fetch(`${EXODIA_URL}/api/command/tasks`, {
    method: 'POST',
    headers: EXODIA_HEADERS,
    body: JSON.stringify({
      model_choice: 'chatgpt',
      agent_id: 'kiko',
      prompt,
      web_research: false,
    }),
  });

  if (!created.ok) {
    throw new Error(`Exodia task creation failed: HTTP ${created.status}`);
  }

  const taskId = (await created.json()).id;
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    const response = await fetch(`${EXODIA_URL}/api/command/tasks`);
    if (!response.ok) {
      throw new Error(`Exodia task polling failed: HTTP ${response.status}`);
    }

    const listing = await response.json();
    const task = listing.tasks.find(item => item.id === taskId);
    if (!task) throw new Error('Exodia task disappeared from the recent list');

    if (task.state === 'answered') {
      return {
        taskId,
        answer: task.answer,
        media: task.media || [],
        metrics: task.metrics || {},
      };
    }

    if (task.state === 'failed') {
      throw new Error(task.error || 'ChatGPT browser task failed');
    }

    await new Promise(resolve => setTimeout(resolve, pollMs));
  }

  throw new Error('ChatGPT browser task timed out');
}
```

Do not automatically submit a second task after a timeout. The browser may have
accepted the first prompt even when the result was not captured.

## Tarot prompt construction

Send only the information needed for the selected reading. Do not ask ChatGPT
to draw replacement cards; JuHua's secure shuffle remains authoritative.

```js
export function buildTarotPrompt({
  locale,
  question,
  spread,
  lens,
  optionA,
  optionB,
  picks,
  positions,
}) {
  const cards = picks.map((pick, index) => ({
    position: positions[index],
    card: pick.card.name,
    orientation: pick.orientation,
  }));

  return [
    'You are providing a reflective Tarot reading for entertainment.',
    'Do not claim certainty, supernatural proof, or professional advice.',
    `Reply language: ${locale === 'zh' ? 'Simplified Chinese' : 'English'}.`,
    `Question: ${question}`,
    `Spread: ${spread}`,
    `Interpretation lens: ${lens}`,
    optionA ? `Path A: ${optionA}` : '',
    optionB ? `Path B: ${optionB}` : '',
    `Cards: ${JSON.stringify(cards)}`,
    'Relate every card to its position and the user question.',
    'Conclude with one practical reflection question.',
  ].filter(Boolean).join('\n');
}
```

Keep JuHua's existing disclaimer visible: Tarot is reflective entertainment,
not deterministic prediction or medical, legal, financial, or mental-health
advice.

## Recommended JuHua endpoint

JuHua's Node server should expose:

```http
POST /api/reading
Content-Type: application/json
```

Request:

```json
{
  "locale": "en",
  "question": "Should I accept the new job offer?",
  "spread": "crossroads",
  "lens": "western",
  "options": ["Accept the offer", "Stay"],
  "deckId": "rws",
  "picks": [
    {"id": "major-00", "orientation": "upright"},
    {"id": "cups-02", "orientation": "upright"},
    {"id": "major-09", "orientation": "reversed"}
  ]
}
```

The server must resolve `picks[].id` against JuHua's own `BY_ID` deck map, following `src/reading-contract.mjs`. Never
trust card names or meanings supplied by the browser.

Response:

```json
{
  "answer": "The generated reading text...",
  "media": [],
  "taskId": "81cfe3a9-b6c5-4045-a99d-48c5fd185799"
}
```

## Operational limitations

- Exodia and its signed-in ChatGPT browser must remain running.
- Browser selectors can change and should be treated as fallible.
- Current Exodia task creation is asynchronous; the JuHua server performs the
  polling.
- Each automatic ChatGPT task uses an isolated conversation tab. For a
  follow-up question, JuHua must include the original question, selected cards,
  prior reading, and new follow-up in the next prompt.
- Keep Exodia bound to localhost. Do not port-forward `8765`.
- Add real authentication, per-user rate limits, request size limits, and
  privacy controls before any public deployment.

## Probe interpretation and production gates (reviewed with v0.7)

- The developer reported a live `PASS` in approximately 20 seconds, but this is **not independently reproducible** from a remote runner without access to the Windows loopback server. CI uses a **local mocked Exodia server** and submits no real ChatGPT generation.
- **Generation POSTs** must be serialized by the future JuHua backend. This probe submits exactly one POST; it cannot prove production cross-session queueing or a five-second inter-generation gap. The probe keeps conservative pre-request spacing and configurable faster GET polling.
- The worker examples in this document describe a *proposed* local adapter. They are **not deployed** or connected to the public web app. Follow-ups require the full original question, spread, chosen card IDs and orientations, first reading, and a bounded history in every new Exodia prompt.
- A successful probe confirms interface connectivity and presence of card names, **not** strict JSON structure, semantic accuracy, user privacy, reliability, or safe public access. Keep Exodia on localhost and never expose it on public GitHub Pages.


## v0.7.1 — Optional Local Exodia AI on port 4173

The browser now detects a loopback-only Node proxy when the app runs at http://127.0.0.1:4173. On GitHub Pages, the local mode is absent and the scripted demonstration stays the default.

### Try it on your Windows computer

1. Keep Exodia running locally on http://127.0.0.1:8765.
2. In your clean JuHua-Speaks clone, pull the latest main and run npm run dev.
3. Open http://127.0.0.1:4173 and complete a three-card reading.
4. At the reading screen, choose Local Exodia AI, advance to the final synthesis, then click Generate with local Exodia. One generation task is submitted; expect about 20–60 seconds.
5. Ask a follow-up. JuHua resends the original question, both options, exact card IDs, positions and orientations, initial response and up to eight previous exchanges in every task.

The initial Exodia result is displayed as returned text. The cinematic individual-card chapters above remain scripted. This is NOT a production structured AI reading. Local mode is explicitly opt-in: clicking Generate or Ask submits that information to the signed-in ChatGPT session controlled by Exodia.

Safety: The Node adapter binds to 127.0.0.1 and refuses other origins. It accepts only same-origin JSON with a required custom header, rejects external Exodia URLs and blocks overlapping generation tasks. It enforces a five-second wait after each completed task before submitting another generation POST. Polling GET requests remain sequential at 1.5-second intervals. Timeout or failure NEVER causes an automatic regeneration. The Node server serves only web assets, not its own source scripts, secrets or Git files. Do not expose or port-forward either service.

The automated tests use simulated Exodia responses to verify serialization, cooldown, prompt context, URL safeguards and same-origin browser requests. They send ZERO real ChatGPT requests and consume no credits.
