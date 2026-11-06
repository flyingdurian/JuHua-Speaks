# Gate A v7 — Production release and friend review

Approved by Product Owner. Freeze SHA: `7e9e3960666ee89c5dbdda5fa65f265ad67a3fc6` on `review/gate-a-v7-approved`.

## Deployment behavior
- Root `/index.html` contains the approved fullscreen Gate A v7 celestial orbit, same scene modules as the preview, branded as v0.8.3.
- `/preview/gate-a/` preserves the isolated Gate A-only browser walkthrough for friends. Review buttons (Hide CTA, Switch Entry, Replay, Pause Orbit) remain in that preview; its Start Divination action intentionally does not proceed to unfinished Gate B.
- The public root Start Divination sends the question to `/ritual.html` via same-origin `sessionStorage` and the existing setup flow continues with the question prefilled. No question goes in URL parameters. Storage failure leaves the original setup able to accept the question manually.
- Legacy `/ritual.html` retains the v0.8.2 ritual steps for continuity while Gate B is under development. This is explicitly an interim transition, not the final seamless in-world shuffle.
- `.github/workflows/ci.yml` copies `preview`, `ritual.html`, `src`, original licensed art, and the new homepage into the same GitHub Pages artifact.
- Hosting a separate GitHub Pages URL from a different branch in the same repo is not supported by the existing one-site publishing configuration; do not claim the review branch itself has a separately deployed site.

## Quality gates
- v0.8.3 version numbers in app and package are consistent.
- Static contract tests verify the new landing, question handoff, image source paths, friend-preview route, and production packaging.
- Production can be released only if main-branch GitHub Actions verifies and deploys successfully.
- Gate B must be developed on an isolated feature branch with a dedicated preview; the approved landing and immutable review branch are preserved for rollback.
