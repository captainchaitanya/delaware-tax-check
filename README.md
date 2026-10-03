# Founder Desk

A compliance cockpit for Indian founders running a Delaware C-corp — often with an Indian subsidiary. It keeps the next filings in one calm place: a calendar of candidate dates, a document inbox you review before anything is saved, and a franchise tax checker that compares Delaware’s two methods with exact arithmetic.

**Educational tool, not tax or legal advice.** Nothing here files, pays, or certifies anything. Recheck every date and rate against official sources before you act. See [VERIFY.md](VERIFY.md).

## Who it is for

Founders and operators who live in India (or split time) and need a quiet desk for:

- Delaware franchise tax and annual report
- US federal forms that commonly apply to a foreign-owned C-corp
- Indian subsidiary and ODI / FEMA reporting, when those facts are true

Sample data uses fictional names only (Northbridge Labs, Cedar Peak Ventures).

## Screenshots

Add captures here after you walk the app locally:

- `docs/screenshots/dashboard.png` — greeting, next dates, quarter ring, cost strip
- `docs/screenshots/calendar.png` — list and month views
- `docs/screenshots/inbox.png` — sample notice on the review screen
- `docs/screenshots/franchise-tax.png` — Authorized vs APVC result

## The three tools

1. **Calendar** — profile-aware candidate deadlines for the next 12 months, with list/month views, notes, mark-as-done, and a hand-rolled `.ics` export. Statutory dates stay primary. Weekend/holiday handling is per rule (`next_business_day` / `none` / `unknown`).
2. **Document Inbox** — paste a notice, extract structured fields, then confirm before saving. “Add deadline to calendar” creates a custom item labeled *From your document* (`rollConvention: none`, editable). Share classes can be sent to the tax checker after you confirm. Works in **Demo mode** with no API key.
3. **Franchise Tax Checker** — Authorized Shares vs Assumed Par Value Capital, using exact rationals so par values like `0.00001` do not drift. Prefills from the company profile when share data exists.

## Architecture

- **Rules engine** (`lib/deadlines`) — typed rule config plus `generateDeadlines(profile, today)`. Dates are civil `{year,month,day}` values, not `Date` objects, so IST vs US Pacific cannot shift a day. Custom deadlines merge in without rolling.
- **Exact-arithmetic tax engine** (`lib/rational.ts`, `lib/franchiseTax.ts`) — BigInt rationals for par and APVC math. Config and verification flags live in `lib/taxConfig.ts`.
- **Provider-agnostic AI** (`lib/llm`) — `extractDocument(text)` with Gemini, Anthropic, or mock. Missing keys fall back to mock. The model output is Zod-validated and never applied until the founder reviews it. Keys stay on `/api/extract`.
- **Local state** — one `localStorage` module (`founder-desk-v1`) with try/catch, plus Export / Import / Reset in Settings. No auth, database, or payments.

## Testing

`npm test` (Vitest) covers tax math, civil-date edge cases, roll conventions, mock extraction, provider fallback, custom deadlines, and analytics helpers. `npm run build` type-checks the App Router app. Tests never call a real model.

## Reliability

Live Inbox extraction is written for a free Gemini key:

- **Retries** — 503 / UNAVAILABLE and network timeouts retry up to twice, with about 1s then 3s backoff. 400 / 401 / 403 / 404 and Zod validation failures are not retried. 429 returns a quota message and is not retried.
- **Fallback model** — set `GEMINI_FALLBACK_MODEL` to a second free-tier model. If the primary is still 503 after retries, that model is tried once. `npm run check:ai -- --probe` lists models that work with your key.
- **Quota cap** — successful live extractions are capped app-wide (default 15/day via `AI_DAILY_CAP`) in addition to 5 requests per minute per IP. Sample documents never call the live model.
- **Friendly errors** — a busy or exhausted model keeps the pasted text and tells the founder to wait, try again, or use a sample.

## Verification

US deadline rules in this repo were checked against official sources in October 2026. India rules are reviewed or unverified. See [VERIFY.md](VERIFY.md) for each rule’s status, last-checked date, and source links.

## What I cut, and why

- **Command palette** — the five-item nav is enough; a palette would have slowed the shell.
- **Framer Motion** — listed as optional; the desk stays still on purpose.
- **PDF upload** — paste-text is reliable; client-side PDF extraction was not worth a new library.
- **India holiday calendar** — not modeled. India rules use `rollConvention: none`.
- **Chatbot, accounts, billing** — out of scope for a local educational tool.

## What’s next

- Recheck [VERIFY.md](VERIFY.md) before filing season. US rules were verified in October 2026; India rules are still reviewed or unverified.
- Add `GEMINI_API_KEY` when you want live extraction.
- Deploy on Vercel when the dates are checked.
- Optional: more cost lines, a real India holiday source, PDF text extraction.

## How I built this

Built in Cursor with Claude, in phased passes: tax engine → calculator UI → app shell and profile → calendar → inbox → this dashboard and case-study wrap. Each phase stopped for review. The interesting constraints were exact money math, timezone-safe dates, and never acting on model output without a human confirm.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Copy `.env.example` to `.env.local` only if you want a live model or PostHog. The app runs fully without either key (Inbox shows **Demo mode**; analytics stay off).

```
LLM_PROVIDER=gemini
GEMINI_API_KEY=
GEMINI_MODEL=
GEMINI_FALLBACK_MODEL=
AI_DAILY_CAP=15
ANTHROPIC_API_KEY=
ANTHROPIC_MODEL=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
NEXT_PUBLIC_SITE_URL=
```

## Rename the GitHub repo and update the remote

Do this on GitHub first, then locally. Do not force-push.

1. GitHub → the current repo → **Settings** → **General** → **Repository name** → `founder-desk` → rename.
2. Update the remote (adjust the owner if yours differs):

```bash
git remote -v
git remote set-url origin https://github.com/captainchaitanya/founder-desk.git
git remote -v
```

If the repo uses SSH:

```bash
git remote set-url origin git@github.com:captainchaitanya/founder-desk.git
```

3. Push the current `main` after the rename (ordinary push, not `--force`):

```bash
git push -u origin main
```

## Deploy on Vercel (when you are ready)

These are the steps. This repo has not been deployed as part of this phase.

1. [Import the GitHub repo](https://vercel.com/new) (Framework Preset: Next.js). Root directory is the repo root.
2. Set environment variables in the Vercel project (Production + Preview as needed):

| Name | Notes |
|---|---|
| `LLM_PROVIDER` | `gemini` (falls back to mock if the key is empty) |
| `GEMINI_API_KEY` | Add when you want live Inbox extraction |
| `GEMINI_MODEL` | Optional; defaults in code if blank |
| `GEMINI_FALLBACK_MODEL` | Optional second model if the primary returns 503 |
| `AI_DAILY_CAP` | Optional. Daily cap on successful live extractions (default 15) |
| `ANTHROPIC_API_KEY` | Only if you set `LLM_PROVIDER=anthropic` |
| `ANTHROPIC_MODEL` | Optional |
| `NEXT_PUBLIC_POSTHOG_KEY` | Leave empty to keep analytics off |
| `NEXT_PUBLIC_POSTHOG_HOST` | e.g. `https://us.i.posthog.com` |
| `NEXT_PUBLIC_SITE_URL` | Optional. Your public origin, e.g. `https://founder-desk.vercel.app`, for Open Graph URLs |

3. Deploy. Confirm the Inbox still works with no Gemini key (Demo mode) and that PostHog does not load when the public key is empty.
4. After you verify dates in [VERIFY.md](VERIFY.md), you can flip `verified` flags in config — not before.

## Disclaimer

Founder Desk is an educational project. It is **not tax, legal, or accounting advice**, and it is not affiliated with the State of Delaware, the IRS, MCA, RBI, or GST authorities. Each rule ships with a verification status in [VERIFY.md](VERIFY.md). You are responsible for checking the official source before you file or pay.
