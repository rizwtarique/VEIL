# VEIL V2.0: System Design Architecture

## 1. The Core Paradigm: Zero-Latency Interception

VEIL is designed with a singular, uncompromising constraint: **The latency equation.**
The total time to intercept, analyze, evaluate, and inject the UI must be less than `500ms`. 

`T_Total = t_intercept + t_detection + t_db_insert + t_ui_render <= 500ms`

To satisfy this constraint, VEIL decouples the **Synchronous Blocking Path** (detection and interception) from the **Asynchronous Telemetry Path** (logging).

## 2. Manifest V3 Interceptor (The Client Sandbox)

The Chrome Extension operates inside a fiercely isolated environment to guarantee security and zero layout shifting (CLS).

### 2.1 The Shadow DOM UI
* The VEIL alert modal is rendered directly into an open `ShadowRoot`.
* **Why?** It completely isolates VEIL’s internal React/CSS logic from the host LLM (ChatGPT/Claude). If OpenAI changes their global CSS to `* { display: none !important; }`, the VEIL modal remains perfectly visible.

### 2.2 The Persistent Port Bridge
* Traditional `chrome.runtime.sendMessage` forces the Chrome Service Worker to spin up from a cold start (taking up to 50ms).
* **Solution:** VEIL uses `chrome.runtime.connect` to establish a persistent WebSocket-like port (`veil-secure-port`).
* **Keep-Alive:** A `setInterval` ping ensures the background worker is never suspended while the user is actively typing, allowing incidents to be logged with `< 5ms` worker latency.

### 2.3 Stateful Emulation (Sanitization)
* Simply overriding `textarea.value` destroys React/ProseMirror internal state.
* **Solution:** VEIL uses `document.execCommand("selectAll")` and `document.execCommand("insertText")`, followed by native `InputEvent` dispatching. This perfectly emulates human keystrokes, fooling the host SPA into accepting the `[REDACTED]` string.

## 3. The Realtime SOC (Next.js 15 App Router)

The Dashboard is engineered as an enterprise-grade Security Operations Center.

### 3.1 Single-Source Realtime Store
* Utilizing Supabase Postgres Logical Replication, the dashboard receives push notifications for every `INSERT`.
* **The Singleton Pattern:** To prevent memory leaks and zombie WebSocket connections across React remounts, the connection logic is isolated in a robust class (`IncidentStore`) via `useSyncExternalStore`.

### 3.2 Row Level Security (RLS)
* **Write Path:** The extension operates with an `anon` key. The Postgres RLS policy restricts `INSERT` payloads, validating data shape and bounds directly at the database layer. The extension **cannot** read historical data.
* **Read Path:** The dashboard operates securely, allowing full `SELECT` capabilities to visualize the data.

## 4. Detection Engine Heuristics

The `detector.ts` uses single-pass regex compilation. Instead of iterating `matchAll` and then replacing, it executes a single `.replace()` pass. This:
1. Tracks match frequency.
2. Applies compounding risk formulas.
3. Generates the sanitized string simultaneously.
*(O(n) complexity vs traditional O(2n))*
