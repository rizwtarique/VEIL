# VEIL Architecture Documentation

## 1. System Overview

VEIL is a decoupled, real-time cybersecurity platform consisting of a localized detection engine (Chrome Extension) and a cloud-based Security Operations Center (SOC) dashboard. The architecture is designed for absolute data locality, zero-latency interception, and secure, unidirectional telemetry.

![Architecture Diagram](https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/network.svg)

## 2. Core Components

### 2.1 The Interceptor (Extension)
* **Content Script (`content.ts`)**: Injected into target LLM domains. It uses a `MutationObserver` to cache references to dynamic SPA editors (like ProseMirror). It intercepts `keydown` (Enter) and `submit` events.
* **Detection Engine (`detector.ts`)**: A synchronous, single-pass regex compilation engine. It processes text against weighted rules, assigning confidence scores and calculating overall risk.
* **Modal UI (`modal.ts`)**: Injected via an isolated Shadow DOM (`attachShadow({ mode: "open" })`) to prevent CSS leakage and DOM tampering from the host site.
* **Service Worker (`background.ts`)**: Acts as a secure proxy. It receives sanitized payloads from the content script and dispatches them to Supabase via REST, freeing up the main browser thread.

### 2.2 The Backend (Supabase)
* **PostgreSQL Database**: Stores telemetry data.
* **Row Level Security (RLS)**: Enforces a strict write-only policy for the `anon` role (used by the extension), preventing any historical data exfiltration.
* **Realtime Publisher**: Utilizes Postgres logical replication to broadcast `INSERT` events to connected dashboard clients via WebSockets.

### 2.3 The Dashboard (Next.js 15)
* **App Router & Server Components**: Delivers a fast, SEO-friendly, and secure initial payload.
* **Realtime Hooks (`use-incidents.ts`)**: Maintains an active WebSocket connection to Supabase. When an incident is logged by the extension, the hook receives the payload and optimistically updates the React state, rendering the new incident instantly across all charts and tables.

## 3. Data Flow Diagrams

### 3.1 Threat Detection Flow
1. **User Action**: Types prompt -> Hits Enter.
2. **Interception**: Content script catches event -> Calls `preventDefault()`.
3. **Analysis**: Text passed to `detector.ts`.
4. **Outcome**: 
   - Clean: Event is resumed.
   - Malicious: Event remains blocked -> Modal rendered.

### 3.2 Incident Logging Flow
1. **Sanitization**: `detector.ts` replaces secrets (e.g., `sk-...` -> `[REDACTED OPENAI KEY]`).
2. **Payload Creation**: Risk score, severity, sanitized text, and timestamp are packaged.
3. **Transmission**: Sent via Chrome messaging API -> Background Worker -> `POST` to Supabase REST endpoint.
4. **Broadcast**: Supabase processes `INSERT` -> Broadcasts payload over Realtime channel.
5. **Consumption**: Dashboard receives payload -> UI updates instantly.

## 4. Security Considerations
* **No `eval()` or Dynamic Code Execution**: The extension uses strictly typed, pre-compiled logic.
* **CSP Compliance**: `script-src 'self'` prevents external script injection.
* **Sanitization Guarantee**: Raw text is never assigned to a variable that interacts with an external network request. Only the explicitly returned `sanitizedText` string from the detection engine is packaged into the telemetry payload.
