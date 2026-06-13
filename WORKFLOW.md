# VEIL Workflow Documentation

## 1. Overview
VEIL is designed to intercept sensitive data before it reaches third-party AI providers. The entire flow happens in real-time, executing within milliseconds to ensure a seamless user experience.

## 2. Detection Flow
1. **User Types Prompt**: A user interacts with a platform like ChatGPT, Claude, or Gemini.
2. **Event Interception**: The VEIL Content Script, observing via `MutationObserver` and global event listeners, catches `keydown` (Enter) or `click` events on submit buttons.
3. **Prompt Analyzed**: The `detector.ts` engine evaluates the text locally. No data leaves the browser yet.
4. **Sensitive Data Detected**: The engine uses highly optimized regex patterns to identify secrets like AWS Keys, OpenAI Keys, Passwords, etc.
5. **Confidence Scoring**: Each finding is scored (low, medium, high) and weighted. A total risk score determines the incident severity.

## 3. Sanitization Flow
1. **Modal Displayed**: If the severity is > 0, the original submission is immediately stopped (`event.preventDefault()`, `event.stopImmediatePropagation()`). A Shadow DOM modal appears.
2. **User Decision**: The user can choose to `CANCEL`, `CONTINUE`, or `SANITIZE`.
3. **Action Executed**:
   - **CANCEL**: The modal closes, and the prompt remains unsent.
   - **CONTINUE**: A bypass timer is set, and the original event is re-dispatched to allow the prompt to send.
   - **SANITIZE**: The original sensitive strings are swapped for context-aware placeholders (e.g., `[REDACTED AWS KEY]`). The editor's internal state (React/ProseMirror) is updated via `document.execCommand` and `InputEvent` dispatching.

## 4. Incident Logging Flow
1. **Telemetry Generated**: Regardless of the user's choice, a sanitized payload (containing *only* the redacted text and metadata) is generated.
2. **Background Worker**: The payload is sent via `chrome.runtime.sendMessage` to the extension's Background Service Worker.
3. **Supabase Insert**: The Background Worker uses an anonymous REST call to `POST` the data to the Supabase `incidents` table. Row Level Security (RLS) ensures write-only access.

## 5. Realtime Dashboard Flow
1. **Postgres Logical Replication**: Supabase detects the `INSERT` and broadcasts it over a WebSocket channel.
2. **Dashboard Subscription**: The Next.js dashboard, using the `useIncidents` hook, listens for `postgres_changes`.
3. **Optimistic UI Update**: The new incident is immediately prepended to the React state, updating the Overview charts and Incidents table instantly without requiring a full page refresh.
