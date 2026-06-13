# VEIL Evaluation & Demo Guide

This guide provides instructions for Kaggle reviewers, technical evaluators, and performance engineers to reproduce the VEIL environment, run the benchmarks, and validate the system's capabilities.

## 1. Local Setup

### 1.1 Prerequisites
*   Node.js >= 20
*   Supabase CLI (optional, if running a local database)

### 1.2 Installation
1.  Clone the repository.
2.  Install dependencies: `npm install`
3.  Copy the environment template: `cp .env.example .env.local`
4.  Configure your Supabase URL and Anon Key in `.env.local` and `extension/.env.example` -> `extension/.env`.

---

## 2. Build & Test Execution

VEIL includes a comprehensive, zero-dependency test suite for the extension that validates detection logic and DOM interception.

```bash
# Run extension tests (Validates Manifest, Detection, Interception, Logging)
npm run extension:test

# Run Next.js Dashboard tests (Lint & Typecheck)
npm run lint
npm run extension:typecheck

# Build the Extension
npm run extension:build
```

---

## 3. Interactive Demo Flow

To manually verify the extension's behavior in a real-world scenario:

1.  **Load Unpacked Extension:**
    *   Open Chrome and navigate to `chrome://extensions/`.
    *   Enable **Developer Mode**.
    *   Click **Load unpacked** and select the `extension/dist` directory.
2.  **Start the Dashboard:**
    *   Run `npm run dev` in the project root.
    *   Open `http://localhost:3000` to view the realtime dashboard.
3.  **Trigger a Violation:**
    *   Navigate to `https://chatgpt.com/`.
    *   In the prompt textarea, type: `My AWS key is AKIA123456789ABCDE and my password is SuperSecret123!`
    *   Press `Enter`.
4.  **Observe the Interception:**
    *   The VEIL Shadow DOM modal will instantly block the submission.
    *   It will display a **Critical** severity and a Risk Score (e.g., > 100).
    *   It will list the detected findings (AWS Key, Password).
5.  **Sanitize:**
    *   Click the **SANITIZE** button.
    *   Observe the ChatGPT textarea; the secrets are replaced with `[REDACTED]`.
6.  **Verify Telemetry:**
    *   Look at the local dashboard (`http://localhost:3000`).
    *   The incident will appear instantly via the Supabase Realtime WebSocket.
    *   Verify the prompt preview shows *only* the sanitized text, proving zero raw data exfiltration.

---

## 4. Evaluation Methodology

When evaluating VEIL, focus on the following metrics:

1.  **False Positive Rate:** Test the detector against clean code snippets to ensure it doesn't overly penalize normal development discussions.
2.  **Latency:** Use Chrome DevTools Performance Profiler while pressing `Enter` on ChatGPT to verify the `handleKeydown` execution time is under 5ms.
3.  **Realtime Synchronization:** Measure the delay between clicking "Sanitize" in the extension and the incident appearing on the dashboard.
