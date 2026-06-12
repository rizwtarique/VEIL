# Veil

Veil is a hackathon-ready, real-time cybersecurity incident dashboard built with Next.js 15, TypeScript, Tailwind CSS, Recharts, and Supabase.

It also includes a Manifest V3 Chrome extension that detects and redacts secrets before prompts are submitted to ChatGPT, Gemini, or Claude.

## Features

- Total, critical, and medium incident KPIs
- 24-hour risk distribution chart
- Severity exposure profile
- Live incident feed
- Supabase initial data fetch and Postgres realtime updates
- Responsive dark cybersecurity interface
- Demo telemetry when Supabase credentials are not configured
- Chrome extension prompt interception, local secret detection, sanitization, and incident logging

## Chrome Extension

The complete extension source is in [`extension`](extension), and its detailed setup and hackathon demo guide is in [`extension/README.md`](extension/README.md).

```bash
npm run extension:typecheck
npm run extension:test
npm run extension:build
```

Load the generated `extension/dist` directory through `chrome://extensions` using **Load unpacked**.

## Local Installation

Requirements: Node.js 20.9 or newer and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Add your Supabase anon key to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://duijlqusviazcvixxgcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Use the public anon key from **Supabase Dashboard > Project Settings > API**. Never expose the service role key in this frontend.

## Supabase Setup

1. Open the Supabase SQL Editor.
2. Run [`supabase/schema.sql`](supabase/schema.sql).
3. Confirm `incidents` appears in **Database > Tables**.
4. Confirm `incidents` is enabled under **Database > Replication**.
5. Add incident rows through your scanner, an Edge Function, or the SQL editor.

The dashboard expects:

```text
incidents(id, created_at, website, severity, risk_score, findings, prompt_preview)
```

`findings` may be a JSON array, JSON object, plain string, or null. Severity should be one of `critical`, `high`, `medium`, or `low`.

## Production Check

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Push this project to GitHub, GitLab, or Bitbucket.
2. In Vercel, select **Add New > Project** and import the repository.
3. Keep the detected framework preset as **Next.js**.
4. Add these environment variables:

```text
NEXT_PUBLIC_SUPABASE_URL=https://duijlqusviazcvixxgcy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your Supabase anon key>
```

5. Click **Deploy**.

For CLI deployment:

```bash
npm i -g vercel
vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel --prod
```

## Security Notes

- Only the Supabase anon key belongs in `NEXT_PUBLIC_*`.
- Keep the service role key server-side.
- The included RLS policy allows anonymous reads for a public demo. For production, replace it with an authenticated policy.
- Insert and update operations should come from a trusted backend, Supabase Edge Function, or authenticated role.
