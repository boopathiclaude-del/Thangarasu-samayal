# Thangarasu Samayal

Marketing website for **Thangarasu Samayal** — traditional Kongunadu & Chettinad catering from Appakudal, Erode, serving celebrations since 1999.

Built with **Next.js 15 (App Router)**, **React 19**, and **TypeScript**. Includes a full-screen video hero, an infinite-scroll gallery with parallax, and an AI concierge chat widget (streaming, agentic) powered by OpenRouter.

## Local development

```bash
npm install
cp .env.local.example .env.local   # then paste your real OpenRouter key
npm run dev
```

Open http://localhost:3000.

### Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `OPENROUTER_API_KEY` | Yes (for chat) | Your key from https://openrouter.ai/keys. Server-side only — never exposed to the browser. Without it the chat shows a friendly "call us" fallback. |
| `OPENROUTER_MODEL` | No | Model slug. Defaults to `openrouter/auto`. Use a `:free` or router model to keep chat at $0. Tool-calling requires a model that supports tools. |

`.env.local` is gitignored — your real key is never committed. `.env.local.example` is the safe template.

## The chat concierge

- Lives entirely inside the Next.js app at `app/api/chat/route.ts` — no separate backend.
- Streams replies token-by-token (falls back to a normal response if the model doesn't support streaming).
- Agentic tool loop: recommends menus, explains packages, and prepares enquiry **drafts**.
- `capture_enquiry` never auto-sends — it builds pre-filled WhatsApp / email / call links the guest taps to send themselves.

## Deploying to Vercel

The free **Hobby** plan is fine to launch on. (Vercel's Hobby tier is licensed for non-commercial use; for a live business site their **Pro** plan ~$20/mo is the compliant option, and it's a one-click upgrade later — no code change, same URL.)

**1. Set your local secret** (skip if already done):

```bash
cp .env.local.example .env.local   # then paste your OpenRouter key
```

**2. Push to GitHub:**

```bash
git init
git add -A
git commit -m "Initial commit: Thangarasu Samayal site"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/<repo>.git
git branch -M main
git push -u origin main
```

Before pushing, confirm `git status` does **not** list `.env.local` — it's gitignored.

**3. Import into Vercel:**

- vercel.com → **Add New → Project** → import the GitHub repo.
- Framework preset: **Next.js** (auto-detected). Leave build settings at their defaults.
- Add **Environment Variables**:
  - `OPENROUTER_API_KEY` = your key
  - `OPENROUTER_MODEL` = e.g. `openrouter/auto`
- Click **Deploy**.

**4. After deploy:** test the chat widget on the live URL. Check **Vercel → Logs** (look for `[openrouter]`) if a reply fails.

Every `git push` triggers an automatic redeploy.

### Keeping the free tier

The Hobby plan includes **100 GB/month** bandwidth. The `public/*.mp4` videos (~29 MB total) are the main consumer — compressing them (e.g. HandBrake, H.264, ~1080p) is the biggest lever for staying free as traffic grows. OpenRouter usage is billed separately by OpenRouter (kept at $0 with a free/router model).

## Project structure

```
app/
  layout.tsx          Root layout + metadata
  page.tsx            Renders <Experience/>
  icon.svg            Favicon (TS monogram)
  globals.css         All styles
  api/chat/route.ts   Streaming agentic chat endpoint
components/
  Experience.tsx      The full landing page
  ChatWidget.tsx      Concierge chat UI (streaming client)
public/               Videos & images
```

