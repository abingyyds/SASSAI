# SASSAI Auth Visual Refresh Mission

Working directory: /Users/minihanshi/project/SASSAI

## User feedback
The Login and Register pages still do not match the current premium/high-tech SubRouter/SASSAI visual style. The previous mobile pass improved spacing but not the actual visual design.

## Goal
Redesign only the login and register pages so they feel consistent with the current premium SubRouter brand/site style: high-end SaaS, dark/blue gradient accents, polished cards, product context, trust/quickstart cues, and mobile-friendly layout.

## Hard constraints
- Only Codex should write code. Hermes will review and merge.
- Keep auth logic, API calls, form fields, validation, redirects, affiliate code behavior, toast behavior, and translations intact unless a tiny label is already available via existing translations.
- Do not change backend/API contracts.
- Do not reintroduce Chinese text if current public UI is English-only.
- Do not touch unrelated pages unless absolutely required by shared styling.
- Keep mobile responsive.

## Scope
Files likely in scope:
- src/pages/Login.jsx
- src/pages/Register.jsx
- optionally small shared styling if existing utility classes are insufficient.

## Design direction
- Use the same premium visual language as the updated homepage/console: gradient background, soft glows, glass cards, rounded panels, subtle border/ring, strong hierarchy.
- Prefer a two-column desktop layout:
  - left side: brand/product promise, quick bullets like unified API, model marketplace, enterprise routing, transparent pricing.
  - right side: auth form card.
- On mobile: single-column, form first or compact hero, no overflow.
- Add useful context such as API base URL, model marketplace, playground/console access, but avoid fake claims.
- Login and Register should look like one coherent auth system, not old plain forms.

## Verification
Run:
- npm run build
- git diff --check
- grep regression for Chinese / wrong API base / merchant internals if you touch text.

## Output
Return:
- what changed,
- files changed,
- build result,
- any remaining visual caveats.
