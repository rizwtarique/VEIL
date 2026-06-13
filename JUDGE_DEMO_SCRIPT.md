# VEIL: Hackathon Judge Demo Script

**Total Time:** 3 Minutes
**Goal:** Prove zero-latency interception, intelligent redaction, and enterprise realtime telemetry.

---

### Step 1: The Setup (0:00 - 0:30)
**Action:** Open ChatGPT and place it side-by-side with the VEIL Next.js Dashboard.
**Script:**
> "Welcome to VEIL, the enterprise solution for the Generative AI blind spot. Employees are pasting proprietary data into LLMs every day, and traditional network proxies can't stop TLS-encrypted traffic. VEIL solves this by shifting security directly to the browser DOM. Let me show you."

### Step 2: The Interception (0:30 - 1:15)
**Action:** In ChatGPT, type: `My deployment is failing. Here is my AWS key: AKIA123456789ABCDE and my db password is SuperSecret123!`
**Action:** Press Enter.
**Script:**
> "I'm an engineer trying to debug an issue. I paste my AWS key and password. When I hit enter... *[Hit Enter]*... VEIL instantly intercepts the event. 
> Notice the Shadow DOM modal. It executed in under 2 milliseconds, evaluating our single-pass regex engine locally. The raw data never left my machine."

### Step 3: Intelligent Redaction (1:15 - 2:00)
**Action:** Click the **SANITIZE** button.
**Script:**
> "I can't submit the raw keys, but I still need AI help. I'll click Sanitize. 
> VEIL doesn't just block me; it intelligently replaces the secrets with semantic placeholders—`[REDACTED AWS KEY]` and `[REDACTED PASSWORD]`. It uses native DOM event emulation to update ChatGPT's internal React state perfectly."

### Step 4: Enterprise Telemetry (2:00 - 2:45)
**Action:** Point to the VEIL Next.js Dashboard.
**Script:**
> "While that happened, VEIL securely logged the incident to our SOC dashboard. 
> As you can see via Supabase WebSockets, the incident appeared instantly. The CISO can see the platform used, the exact threat categories, and the risk score—but notice the preview: the dashboard only receives the *sanitized* text. The raw keys are mathematically destroyed."

### Step 5: The Conclusion (2:45 - 3:00)
**Action:** Highlight the Analytics tab.
**Script:**
> "With VEIL V2.0, we provide a persistent Chrome messaging port, strict Row Level Security, and a flawless React 19 architecture. It's production-ready Data Loss Prevention for the AI era. Thank you."
