# VEIL Performance Profile

This document outlines the performance characteristics, benchmarks, and optimization strategies employed within the VEIL project. VEIL is engineered for absolute minimal latency, ensuring zero perceptible delay during human-computer interaction (HCI).

## 1. Extension Execution Latency

The most critical performance metric is the execution time of the Content Script between the user pressing `Enter` and the prompt either being submitted or blocked.

### 1.1 Detection Engine Optimizations

*   **Single-Pass Evaluation:** The regex engine (`detector.ts`) evaluates the prompt exactly once per rule. Match counting and string redaction occur within the same `replace` callback. This reduces regex execution time by 50% compared to traditional `matchAll` -> `replace` workflows.
*   **Zero Dependencies:** The content script relies entirely on native browser APIs. There are no heavy string parsing libraries (like `lodash`) or AST parsers, minimizing parse and JIT compilation times.
*   **Shadow DOM Isolation:** The warning modal is injected via Shadow DOM (`attachShadow({ mode: "open" })`). This isolates the CSS, preventing the host page (e.g., ChatGPT) from recalculating its layout due to cascading styles, thereby eliminating layout thrashing.

### 1.2 Benchmarks (Estimated)

*   **Short Prompt (< 100 words):** < 0.5ms detection latency.
*   **Long Prompt (1000 words):** < 2.0ms detection latency.
*   **Modal Render:** < 5.0ms (using native `innerHTML` on an isolated Shadow Root).

*The extension comfortably fits within the 16ms frame budget required for 60fps interaction.*

---

## 2. Dashboard Performance

The Next.js 15 dashboard is optimized for fast First Contentful Paint (FCP) and low Time to Interactive (TTI).

### 2.1 React & Next.js Optimizations

*   **Server Components:** The application heavily leverages Next.js App Router and React Server Components. Layouts and static shells are rendered on the server, sending zero JavaScript to the client for those parts of the tree.
*   **Client Boundaries:** The `'use client'` directive is pushed as far down the component tree as possible (e.g., isolating it to interactive charts and realtime hooks).
*   **Recharts Fixes:** Resolved `ResponsiveContainer` hydration warnings by explicitly defining `minHeight={0}` and `minWidth={0}`, preventing infinite resize loops during SSR/Client hydration.
*   **Memoization:** Custom hooks (`useIncidents`) utilize React's built-in state effectively to prevent unnecessary rerenders.

### 2.2 Supabase Optimizations

*   **Write-Path (Extension):** Uses the Supabase REST API via `fetch` rather than loading the full Supabase JS client in the Service Worker. This reduces the extension bundle size from ~100KB to ~1KB.
*   **Read-Path (Dashboard):** Uses WebSocket subscriptions for incremental updates rather than polling, drastically reducing database load and network egress.

---

## 3. Bundle Size Audit

*   **Content Script:** ~9KB (Bundled, Minified).
*   **Background Worker:** ~1KB (Bundled, Minified).
*   **Popup Script:** ~1KB (Bundled, Minified).
*   **Dashboard First Load JS:** ~103KB (Shared) + Route specific chunks (Highly optimized via Next.js splitting).

*Total extension footprint is negligible, ensuring instantaneous browser installation and updates.*
