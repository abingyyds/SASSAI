# Codex Mission: IMPLEMENT SASSAI Playground Cherry-style chat now

Working directory: /Users/minihanshi/project/SASSAI
Target file: `src/pages/Playground.jsx`

Critical correction:
Your previous run only wrote a plan/result and did not implement the requested changes. Grep still shows:
- localStorage: 0
- conversation: 0
- history: 0
- session: 0
This is not acceptable. You must actually modify `src/pages/Playground.jsx` in this run.

User intent:
The user is talking about **SASSAI/SubRouter Playground**, not OpenAsstAI. The Playground must become a real Cherry Studio-inspired chat playground with conversation history and saved sessions. Do not touch `/Users/minihanshi/project/openasstai`.

Cherry Studio reference already cloned:
`/Users/minihanshi/project/reference-cherry-studio`
Inspect these before editing:
- `src/renderer/src/pages/home/Chat.tsx`
- `src/renderer/src/pages/home/Messages/ChatNavigation.tsx`
- `src/renderer/src/pages/home/Messages/ChatFlowHistory.tsx`
- `src/renderer/src/components/ModelSelector.tsx`
- `src/renderer/src/components/ModelSelectButton.tsx`
- `src/renderer/src/services/ConversationService.ts`
Use as UX reference only; do not copy large code.

Current SASSAI Playground:
`src/pages/Playground.jsx` is a request-builder page. It has model/mode/API-key/request preview and execution helpers. Preserve useful request execution/helper logic, but the primary UX must become chat-first.

Must implement in `src/pages/Playground.jsx`:
1. Conversation persistence using localStorage:
   - Key: `sassai.playground.conversations.v1`
   - Store: `id`, `title`, `modelId`, `mode`, `createdAt`, `updatedAt`, `messages`, `settings`
   - Gracefully handle corrupt localStorage.
2. Left history panel:
   - New chat button
   - Search/filter conversations
   - Conversation list with title, last message preview, timestamp, model/mode summary
   - Delete conversation; simple rename optional but preferred.
3. Center chat transcript:
   - Empty state for a new conversation
   - User/assistant/system/error message bubbles
   - Current model badge and mode
   - Composer textarea with Send button
   - Quick prompt chips
   - Copy action for message text using existing `CopyButton`
4. Right inspector/API Preview:
   - Model search/selector from existing public catalog helpers
   - Mode selector (chat/image/video/audio) but chat is the main experience
   - Settings: temperature, max tokens, image/video/audio settings as currently available
   - API key guidance/saved token selector as currently available
   - curl/JS/Python preview using existing `CodeBlock`
   - Existing request builder behavior should live here, not dominate the page.
5. Send behavior:
   - For chat/text mode, if API key exists, call the existing OpenAI-compatible request path through existing browser helper logic where safe.
   - If API key missing, append/show an honest assistant/error guidance message: user needs API key; do not fake a successful model response.
   - Save user and assistant/error messages into the active conversation.
   - Generate title from first user message.
   - For image/video/audio, keep request-preview/run shell honestly; if execution helper supports it, store result summary in messages.
6. Query params:
   - Preserve `?model=` and `?mode=` preselection.
   - Changing active conversation updates active model/mode state.
7. Responsive/mobile:
   - History, chat, inspector should collapse/stack gracefully.

Hard constraints:
- Do not touch OpenAsstAI.
- Do not break existing `/playground` route or `/chat` alias.
- Do not change backend contracts/auth/token APIs/catalog helpers.
- Correct API base URL must remain via `SUBROUTER_API_BASE_URL` / `https://api.subrouter.com/v1`; do not use website `/v1` as API base.
- Do not expose merchant/provider/routing internals in public UI text.
- Avoid adding npm dependencies.
- Do not commit or push.

Verification you must run:
- `npm run build`
- `python3` grep/count proving Playground.jsx now contains `localStorage`, `conversation`, `history`, `messages`, `sassai.playground.conversations`
- scan for wrong API base (`subrouter.com/v1`) in Playground.jsx
- `git diff --stat src/pages/Playground.jsx vite.config.js`

Output:
Write `/Users/minihanshi/project/SASSAI/.codex-sassai-playground-cherry-result.txt` with:
- files changed;
- Cherry files inspected;
- implemented UX features;
- conversation localStorage details;
- verification results;
- limitations.

Do not just describe a plan. Implement the code changes.