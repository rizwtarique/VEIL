# Veil Chrome Extension

Manifest V3 extension that detects sensitive information locally before a prompt is submitted to ChatGPT, Gemini, or Claude.

## Supported Detection

| Finding | Base score | Example |
| --- | ---: | --- |
| AWS key | 90 | `AKIAIOSFODNN7EXAMPLE` |
| API key | 80 | `api_key=abcdefghijklmnopqrstuvwx` |
| Password | 75 | `password=SuperSecret123!` |
| Phone number | 30 | `415-555-2671` |
| Email address | 25 | `ada@example.com` |

Additional occurrences add 10 points each, capped at a 20-point repeated-match bonus per finding type. The total score is capped at 100.

- Low: `0-30`
- Medium: `31-70`
- Critical: `71-100`

## Build

From the repository root:

```powershell
npm install
npm run extension:typecheck
npm run extension:test
npm run extension:build
```

The unpacked Chrome extension is generated at:

```text
extension/dist
```

For automatic rebuilds during development:

```powershell
npm run extension:watch
```

After a rebuild, click the reload icon for Veil on `chrome://extensions`.
Then reload every already-open ChatGPT, Gemini, or Claude tab. Chrome invalidates
the old content-script context when an unpacked extension is reloaded.

## Configure Supabase

The easiest demo setup is through the extension popup:

1. Load the extension in Chrome.
2. Pin Veil from the Extensions menu.
3. Open the Veil popup.
4. Enter the project URL and public anon key.
5. Click **Save Connection**.

Use:

```text
https://duijlqusviazcvixxgcy.supabase.co
```

Alternatively, create `extension/.env` before building:

```env
VEIL_SUPABASE_URL=https://duijlqusviazcvixxgcy.supabase.co
VEIL_SUPABASE_ANON_KEY=your_public_anon_key
```

Only use the public anon key. Never place the service-role key in the extension.

Run the latest [`../supabase/schema.sql`](../supabase/schema.sql) in the Supabase SQL Editor. It includes the constrained anonymous insert policy required by the extension.

## Load Into Chrome

1. Open `chrome://extensions`.
2. Enable **Developer mode** in the top-right corner.
3. Click **Load unpacked**.
4. Select the absolute `extension/dist` folder.
5. Confirm **Veil - AI Prompt Protection** appears and is enabled.
6. Pin Veil from Chrome's Extensions menu.
7. Open its popup and save the Supabase URL and anon key.
8. Refresh any already-open ChatGPT, Gemini, or Claude tabs.

## Test On ChatGPT

1. Open [https://chatgpt.com](https://chatgpt.com).
2. Enter this fake, non-production test prompt:

```text
Email ada@example.com and use password=SuperSecret123!
```

3. Press Enter or click Send.
4. Confirm the Veil modal appears before ChatGPT receives the prompt.
5. Confirm the modal displays:
   - Risk score: `100`
   - Severity: `Critical`
   - Findings: Email Address and Password
6. Click **Cancel** and confirm the prompt remains in the editor.
7. Submit again and click **Sanitize**.
8. Confirm both sensitive values become `[REDACTED]` and the prompt is not automatically sent.
9. Send the sanitized prompt.
10. Open the Veil dashboard and confirm a new `chatgpt.com` incident appears in the live feed.

Use these additional fake test values:

```text
AWS: AKIAIOSFODNN7EXAMPLE
Email: ada@example.com
Password: password=SuperSecret123!
Phone: +1 415-555-2671
API key: api_key=abcdefghijklmnopqrstuvwx
```

Do not use real credentials during a demo.

## Pipeline Diagnostic

Open DevTools on a supported AI site. In the Console execution-context selector,
choose **Veil - AI Prompt Protection**, then run:

```js
await window.testVeilPipeline()
```

A successful response includes:

```js
{
  ok: true,
  requestId: "...",
  incidentId: 123
}
```

The command uses the same production path as a real detection:

```text
content script -> chrome.runtime.sendMessage -> background service worker
-> Supabase REST insert -> acknowledged row ID
```

If the response says the extension context was invalidated, reload the AI tab.
If it reports no background response, open `chrome://extensions`, locate Veil,
and inspect the service worker console.

## Button Behavior

- **Cancel** closes the warning and leaves the original prompt unchanged.
- **Continue** permits the original prompt to be submitted.
- **Sanitize** replaces all detected values with `[REDACTED]`, closes the warning, and leaves the sanitized prompt ready for review.

## Privacy

Detection and redaction run in the content script on the user's device. The extension sends Supabase only:

- Website hostname
- Severity
- Risk score
- Finding labels and counts
- A sanitized prompt preview capped at 240 characters

The raw sensitive values are not included in the incident payload.

## Hackathon Demo Checklist

- [ ] Run `npm run extension:test` and show all checks passing.
- [ ] Build with `npm run extension:build`.
- [ ] Show Manifest V3 and the three supported site permissions.
- [ ] Load `extension/dist` through `chrome://extensions`.
- [ ] Open the popup and show **Protection active**.
- [ ] Keep the Veil dashboard open in another tab.
- [ ] Paste the fake email and password prompt into ChatGPT.
- [ ] Attempt submission and show that Veil blocks it first.
- [ ] Point out the risk score, Critical severity, and two findings.
- [ ] Click Sanitize and show both secrets replaced with `[REDACTED]`.
- [ ] Send the sanitized prompt.
- [ ] Show the new incident arrive in the dashboard through Supabase Realtime.
- [ ] Explain that detection is local and only sanitized telemetry is logged.
- [ ] Demonstrate Continue only if judges ask about user override.

## Troubleshooting

- Modal does not appear: reload the AI site after loading or reloading the extension.
- Incident does not reach the dashboard: save the Supabase URL and anon key in the popup, then rerun `supabase/schema.sql`.
- Chrome reports a manifest error: load `extension/dist`, not the `extension` source directory.
- Site changed its prompt markup: inspect the current editor and send button, then update `src/prompt-adapters.ts`.
