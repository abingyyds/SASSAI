# Codex Mission: SASSAI premium SaaS LLM homepage with GSAP

Working directory: /Users/minihanshi/project/SASSAI

Context:
The user wants SASSAI/SubRouter public homepage redesigned into a premium, business-grade SaaS large-model gateway website. They specifically asked to install/use https://github.com/greensock/gsap-skills. Hermes installed GSAP skills locally and loaded the React/timeline/performance guidance. Follow GSAP best practices:
- Use GSAP in React with `useGSAP` from `@gsap/react` if adding GSAP dependency.
- Use scoped refs, `gsap.context()`/useGSAP cleanup, avoid global selectors without scope.
- Prefer transform/opacity animations; avoid layout-heavy animation.
- Use timelines for sequencing, defaults, labels where helpful.
- Respect reduced motion.

Important product constraints from user memory:
- SASSAI/SubRouter public model/ranking pages should feel OpenRouter-like and hide internal provider/merchant routing details.
- API Base URL in docs/examples must be `https://api.subrouter.com/v1`.
- Public prices should use official `/api/pricing` USD prices where shown.
- User wants high-end business SaaS / large-model official site, not a playful generic landing page.
- Keep existing API/backend contracts, routes, auth, console, docs, and Playground intact.

Current repo notes:
- Vite React app.
- Likely public homepage is `src/themes/saas/Home.jsx` under themed layout. Inspect `src/context/ThemeContext.jsx` and current theme wiring before editing.
- There are existing uncommitted changes in `src/pages/Playground.jsx` and `vite.config.js`; do not overwrite unrelated work. Preserve existing changes.
- `package.json` currently has motion and React, but not GSAP. Add `gsap` and `@gsap/react` if needed.

Goal:
Redesign the SASSAI homepage into a premium business SaaS LLM gateway homepage. It should feel like a polished enterprise AI infrastructure product: refined dark/light contrast, strategic copy, credible metrics, enterprise trust, developer quickstart, model marketplace CTA, and smooth subtle GSAP entrance/micro animations.

Scope:
Prefer editing:
- `src/themes/saas/Home.jsx`
- optional small CSS in `src/index.css` if necessary
- `package.json` / lockfile for GSAP dependencies
Avoid touching backend, auth, pricing semantics, Playground internals, Vite proxy behavior unless build requires it.

Homepage UX requirements:
1. Hero:
   - Premium business SaaS large-model gateway positioning.
   - Headline should communicate: one enterprise-grade OpenAI-compatible gateway for production LLM apps.
   - Mention `https://api.subrouter.com/v1` visibly in developer-focused area, not invalid main-site `/v1` URLs.
   - CTAs: Start building / Get API key, Explore models, Open Playground.
   - Use sophisticated visual: command-center card, live model routing cards, code/API card, enterprise status panel, soft gradients/noise/grid.
2. Trust/value sections:
   - Model marketplace/catalog, official pricing visibility, API keys, usage/observability, OpenAI-compatible integrations.
   - Avoid exposing merchant/provider internals in public copy.
3. Developer quickstart:
   - Show curl/JS/Python tabs if already present; keep base URL correct.
   - Make code card premium, copyable if existing component supports it.
4. Model showcase:
   - Use existing public model catalog helpers; keep fallback models.
   - Cards should link to model detail or Playground with selected model.
5. Enterprise-grade polish:
   - Refined typography, spacing, card hierarchy, low-noise animations.
   - Must be responsive/mobile-friendly.
6. GSAP:
   - Add tasteful entrance animation to hero/cells/cards using `useGSAP` and timeline.
   - Animate only opacity/transform; clean up automatically; avoid scroll-heavy complexity unless necessary.
   - If adding GSAP is too risky, report why, but try to implement.

Verification:
- Run `npm install` if dependencies changed.
- Run `npm run build`.
- Search changed files for forbidden/incorrect base URL patterns: `subrouter.com/v1` should not appear as an API base in docs/examples; `api.subrouter.com/v1` should appear.
- Confirm no public homepage copy says merchant/provider routing internals.
- Show `git diff --stat` and changed files.

Output:
Write `/Users/minihanshi/project/SASSAI/.codex-sassai-gsap-homepage-result.txt` summarizing:
- files changed;
- GSAP skill/patterns used;
- homepage sections updated;
- verification results;
- any limitations.

Do not commit or push. Hermes will review, verify, and push if green.
