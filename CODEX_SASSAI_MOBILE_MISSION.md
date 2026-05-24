# SASSAI Mobile Polish Mission

Working directory: /Users/minihanshi/project/SASSAI

## Goal
Improve mobile usability across the SASSAI/subrouter UI, especially the pages that still feel cramped or hard to use on phones.

## Current facts
- Main branch is already merged with the latest OpenRouter-style public and console updates.
- Build has passed before.
- The user reports many pages still have weak mobile compatibility.
- Existing styles already include some responsive rules, but more page-specific refinement is needed.

## Hard constraints
- Preserve the existing public OpenRouter-like product abstraction.
- Do not reintroduce merchant/provider internals into public pages.
- Keep the existing console/menu structure; polish behavior and layout only.
- Keep API/backend contracts unchanged.
- Avoid large rewrites unless absolutely necessary for mobile layout stability.
- Keep UI English-only where the current main branch already is English-only.

## Scope
Focus on mobile-specific improvements for:
- auth/login/register surfaces if present
- top navigation and dropdowns
- marketplace/catalog/ranking views
- console/dashboard menus and panels
- tables, cards, filters, buttons, tabs, and chat/terminal-like components
- any page that overflows or becomes awkward below tablet widths

## Non-goals
- No backend changes.
- No feature expansion unrelated to mobile UX.
- No redesign of the entire visual system.

## Recommended first checks
- Inspect responsive CSS breakpoints and shared layout components.
- Identify the worst offending pages by viewport width.
- Apply targeted fixes in shared styles first, then page-specific overrides.
- Run npm run build after each major pass.

## Expected output
Return a concise summary with:
- pages inspected,
- mobile issues fixed,
- any remaining bad breakpoints,
- build verification results,
- files changed.
