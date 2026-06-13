<<<<<<< HEAD
# VEIL

AI Security Layer for Enterprise AI Usage

## Problem

Employees increasingly use AI tools such as ChatGPT, Gemini, and Claude.

Sensitive information including API keys, credentials, customer data, and internal documents are frequently pasted into these systems, creating security and compliance risks.

## Solution

VEIL acts as a real-time AI security layer.

Before information reaches an AI platform, VEIL:

* Detects sensitive information
* Calculates a risk score
* Warns the user
* Sanitizes sensitive content
* Logs incidents for security teams
=======
<div align="center">
  <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/shield.svg" alt="VEIL Logo" width="80" height="80">
  <h1 align="center">VEIL</h1>
  <p align="center">
    <strong>AI Prompt Protection & Data Loss Prevention for Generative AI</strong>
  </p>
</div>

---

## 🚀 Project Overview
>>>>>>> e030ded (Final hackathon submission)

VEIL is an enterprise-grade, real-time cybersecurity intercept layer. It is designed to detect and intelligently redact sensitive information (secrets, PII, API keys, credentials) *before* it ever leaves the employee's browser and reaches third-party AI platforms like ChatGPT, Claude, and Gemini.

<<<<<<< HEAD
* Real-time prompt inspection
* AWS key detection
* API key detection
* Email detection
* Phone number detection
* Risk scoring engine
* Security operations dashboard
* Incident management
* Analytics and reporting
* Chrome Extension support
* Supabase integration

## Tech Stack

Frontend:

* Next.js 15
* TypeScript
* Tailwind CSS

Backend:

* Supabase

Deployment:

* Vercel

Browser Extension:

* Manifest V3

## Architecture

Browser Extension
↓
Detection Engine
↓
Risk Scoring
↓
Supabase
↓
VEIL Dashboard

## Future Roadmap

* Slack Integration
* Teams Integration
* Enterprise SSO
* DLP Policies
* AI Governance Controls
* Compliance Reporting

## Authors

Team VEIL
=======
### Why This Problem Matters (Market Opportunity)

The explosive adoption of Generative AI in the enterprise has created a massive Data Loss Prevention (DLP) blind spot. Employees routinely (and often accidentally) paste proprietary source code, customer databases, and cloud infrastructure keys into LLM prompts. 

Once this data leaves the corporate network, it is:
1. Logged by the provider.
2. Potentially used for model training.
3. Exposed to third-party data breaches.

Traditional network edge DLP solutions fail to inspect TLS-encrypted WebSocket and HTTP/2 traffic reliably without breaking end-to-end encryption. **VEIL shifts the interception point to the browser DOM**, solving this problem at the source.

---

## 🏗️ Solution Architecture

VEIL operates on a zero-trust model, functioning seamlessly across two execution environments:

### 1. The Interceptor (Chrome Extension)
A Manifest V3 extension injected directly into supported AI domains.
* **Local-Only Evaluation:** Prompts are evaluated locally. Raw sensitive data never leaves the user's machine.
* **Zero-Latency:** Utilizing a highly optimized, single-pass regex engine, VEIL achieves sub-millisecond detection times, ensuring zero perceptible lag during human-computer interaction.
* **Intelligent Sanitization:** Context-aware redaction (e.g., `[REDACTED AWS KEY]`) preserves the prompt's structural integrity while neutralizing the threat.

### 2. The SOC Dashboard (Next.js 15)
An executive-friendly, real-time Security Operations Center (SOC) dashboard.
* **Realtime Telemetry:** Sanitized incidents are securely logged to a Supabase backend and instantly visualized.
* **Enterprise Features:** Search, sort, filter, CSV export, and detailed incident drawer views.
* **Actionable Analytics:** Risk scoring, threat timelines, and severity distribution charts.

---

## 🔒 Key Security Features

* **DOM Isolation:** The warning modal is injected via Shadow DOM, preventing the host page from reading the modal's contents or layout.
* **Row Level Security (RLS):** Supabase RLS policies guarantee that the extension has write-only access, completely eliminating the risk of historical data exfiltration if the extension is compromised.
* **Zero External Dependencies:** The content script relies entirely on native browser APIs, preventing supply-chain attacks.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js 15, React 19, Tailwind CSS, Framer Motion, Recharts
* **Backend:** Supabase (PostgreSQL), Realtime WebSockets
* **Extension:** Manifest V3, TypeScript, DOM APIs

---

## 📦 Installation Guide

### Prerequisites
* Node.js >= 20
* Supabase Account (for telemetry)

### 1. Dashboard Setup
```bash
git clone https://github.com/your-org/veil.git
cd veil
npm install

# Configure Environment
cp .env.example .env.local
# Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Run the development server
npm run dev
```

### 2. Extension Setup
```bash
# Compile and build the extension
npm run extension:build
```
*Load the `extension/dist` folder into Chrome via `chrome://extensions` (Developer Mode > Load Unpacked).*

---

## 🎮 Demo Walkthrough

1. Load the extension and start the dashboard (`localhost:3000`).
2. Navigate to ChatGPT and type: `My AWS key is AKIA123456789ABCDE`.
3. Press `Enter`.
4. Observe the instant Shadow DOM modal blocking the prompt.
5. Click **SANITIZE** and watch the key be replaced with `[REDACTED AWS KEY]`.
6. Look at your local dashboard; the incident will appear instantly via the Supabase Realtime WebSocket.

---

## ⚡ Performance Optimizations

* **Single-Pass Regex:** The detection engine evaluates the prompt exactly once per rule. Match counting and string redaction occur within the same `replace` callback, reducing execution time by 50%.
* **SPA Mutation Resilience:** The extension uses a throttled `MutationObserver` to cache the editor node, ensuring consistent interception even across React hot-reloads and virtual DOM mutations.
* **Bundle Size:** The entire compiled extension content script is ~11KB.

---

## 🔮 Future Roadmap & Business Potential

VEIL is positioned to be a highly lucrative enterprise SaaS offering.
* **Q3 2026:** Integration with Okta/Azure AD for user-specific risk profiling.
* **Q4 2026:** Machine Learning-based contextual analysis to detect intellectual property (beyond regex).
* **Q1 2027:** Enterprise policy enforcement (e.g., block all code pasting for specific departments).

### Competitive Advantages
Unlike existing solutions that rely on proxy servers (which introduce latency and privacy concerns) or network-level deep packet inspection, VEIL's browser-native approach is faster, more secure, and perfectly tailored for the modern encrypted web.
>>>>>>> e030ded (Final hackathon submission)
