# VEIL Security & Threat Model

This document outlines the security posture of the VEIL project, including its threat model, data handling practices, and defensive mechanisms. VEIL operates on a zero-trust model regarding third-party AI platforms.

## 1. Threat Model

VEIL is designed to mitigate the following threats:

*   **T1: Accidental Secret Leakage:** An employee unintentionally pastes API keys, credentials, or PII into an AI prompt (e.g., ChatGPT, Claude).
*   **T2: Malicious Exfiltration via AI:** An insider attempts to exfiltrate proprietary source code or customer data by summarizing it via an AI tool.
*   **T3: Extension Compromise:** A malicious actor attempts to read the prompt data collected by VEIL itself.

### 1.1 Mitigations

*   **Against T1 & T2 (The Core Product):** VEIL intercepts key DOM events (`keydown`, `submit`, `click`) to evaluate the input *before* the browser dispatches the HTTP request to the AI platform. It scores the risk and blocks high-risk submissions entirely.
*   **Against T3 (Extension Security):**
    *   **Zero External Dependencies in Content Script:** The detection engine is entirely self-contained. It does not fetch external rulesets at runtime, preventing supply-chain attacks or MITM rule injection.
    *   **Local-Only Execution:** Raw prompt text **never** leaves the browser. Only the *sanitized* text (where secrets are replaced with `[REDACTED]`) is sent to the telemetry server.
    *   **Manifest V3 Limitations:** VEIL adheres strictly to Manifest V3. It requests minimal permissions (`storage`, and specific `host_permissions`). It does *not* request broad `<all_urls>` access.

---

## 2. Supabase Access Patterns & RLS

VEIL uses Supabase for telemetry and dashboard data. The database relies on Row Level Security (RLS) to enforce strict access control.

*   **Write-Only Path (Anon Role):** The Chrome Extension uses the Supabase Anonymous Key to `POST` to the `incidents` table via REST. RLS policies explicitly allow `INSERT` for the `anon` role but **deny** `SELECT`, `UPDATE`, and `DELETE`. The extension cannot read historical incidents.
*   **Read-Only Path (Authenticated Role):** The Dashboard uses authenticated sessions (or a Service Role in a trusted server environment) to `SELECT` from the `incidents` table.

---

## 3. Environment Variable Audit

VEIL requires the following environment variables. They must be strictly managed:

### 3.1 Next.js Dashboard
*   `NEXT_PUBLIC_SUPABASE_URL`: (Public) The URL of the Supabase project. Safe to expose.
*   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (Public) The anonymous key for Supabase. Safe to expose *because RLS enforces security*.
*   `SUPABASE_SERVICE_ROLE_KEY`: (Private/Secret) Used ONLY in secure server contexts (e.g., Next.js API Routes or Server Actions) for administrative tasks. **NEVER** expose to the client.

### 3.2 Chrome Extension
*   The extension uses the public `URL` and `ANON_KEY` embedded during the build process (`scripts/build.mjs`). Since RLS is enabled, exposing the anon key in the extension bundle is safe and standard practice.

---

## 4. Secure Coding Practices

*   **DOM Injection:** When injecting the warning modal, VEIL uses `innerHTML` on an isolated Shadow DOM. The template string does not interpolate raw, unsanitized user input into executable contexts, preventing DOM-based Cross-Site Scripting (XSS).
*   **No `eval()`:** The extension explicitly avoids `eval()` and `new Function()`.
*   **Content Security Policy (CSP):** The extension manifest defines a strict CSP: `script-src 'self'; object-src 'self'`.
