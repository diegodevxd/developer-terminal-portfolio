# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Two static sites in one repo, deployed together on Vercel, sharing no build step (no bundler, no `package.json`, no transpilation):

1. **`/` — Cyberpunk portfolio** (`index.html`, `styles.css`, `script.js`, `retro.js`, `retro.css`, `bg3d.js`): Diego Mancera's personal portfolio.
2. **`/servicios/` — Services landing + paid-checkout funnel** (`servicios/index.html`, `brutalism.css`, `servicios.js`, `checkout.js`): sells three web-dev packages (Básico/Profesional/Premium) with a real Stripe payment flow backed by Supabase.

There's also `/admin/` (a private KPI dashboard for the services funnel) and `/supabase/` (Edge Functions + schema) — both excluded from the Vercel deploy via `.vercelignore` but present in git.

## Running locally

No install/build step. Serve the repo root as static files:

```bash
python -m http.server 8000
# or
npx http-server -p 8000
```

Open `http://localhost:8000` for the portfolio, `http://localhost:8000/servicios/` for the services site, `http://localhost:8000/admin/` for the dashboard (needs a Supabase admin account to log in). There is no test suite, linter, or build/typecheck command in this repo.

Edge Functions (`supabase/functions/*`) run on Supabase, not Vercel — the deployed site is 100% static. Redeploy a function with:
```bash
supabase functions deploy crear-checkout
supabase functions deploy stripe-webhook --no-verify-jwt
```

## Architecture

### Portfolio (`/`)
- `script.js` drives the "digital rain" canvas background, the ES/EN i18n system (`data-i18n` attributes on elements, language persisted in `localStorage`), and scroll-reveal/nav-highlight behavior.
- `bg3d.js` is an ES module (resolved via an import map in `index.html`, pinned to a CDN Three.js build) that renders a floating-hardware 3D scene over the canvas. It self-disables (falls back to the matrix rain from `script.js`) when WebGL isn't supported or on reduced-motion/mobile.
- `retro.js` + `retro.css` implement an optional "Retro 2010" easter-egg theme toggle (Winamp widget, cursor sparkles, 88x31 badges), stored in `localStorage` under `retro2010` and applied via a `.retro-mode` class on `<html>`. An inline script in `<head>` restores this class before first paint to avoid a flash of the wrong theme. `bg3d.js` listens for a custom `retromode` event to recolor the 3D scene.

### Services funnel (`/servicios/`)
This is the part of the repo with real business logic — a full contracting funnel, not just a landing page:

**Flow:** click a package's "Contratar" button → modal opens (`checkout.js`) → Supabase Auth login/signup → fill contact form → accept 50% deposit + terms → insert a row into `solicitudes` (Postgres) → invoke the `crear-checkout` Edge Function → redirect to Stripe Checkout for the deposit → Stripe redirects to `gracias.html` → `stripe-webhook` Edge Function marks the request paid and logs it in `contrataciones`.

**Where package prices/names live — these three places must be changed together, or Stripe will charge a different amount than the site displays:**
- `servicios/index.html` — displayed prices/copy in the pricing cards and the comparison table.
- `servicios/checkout.js` — `PAQUETES` object (`total`/`anticipo` in whole MXN pesos) used for the on-page price summary shown before checkout.
- `supabase/functions/crear-checkout/index.ts` — `PAQUETES` object (amounts in **centavos**, i.e. ×100) — this is the source of truth Stripe actually charges. The client-side amounts are cosmetic only; the server recomputes everything from `sol.paquete` looked up server-side.

**Data model** (`supabase/schema.sql`):
- `solicitudes` — every lead that completes the form (RLS: a user can only insert/select their own rows; Edge Functions use the service-role key to bypass RLS and update `pago_estado`).
- `contrataciones` — an append-only ledger of confirmed payments, written only by the `stripe-webhook` function (service role); no public RLS policies, so it's unreadable from the client.

Supabase project ref `jdjemlyvrafzoqtgrmuk` and its anon key are hardcoded in `servicios/checkout.js` and `admin/admin.js` (this is expected — it's the public anon key, safe to expose; write access is gated by RLS policies, not by the key).

### Admin dashboard (`/admin/`)
Read-only KPI view over `solicitudes`/`contrataciones` (`admin/admin.js`). Access control is entirely in Postgres: a signed-in user must have a row in the `admins` table (checked client-side after login, enforced by RLS) or they're bounced back to the login screen. Uses Supabase Realtime (`postgres_changes` on `contrataciones`/`solicitudes`) plus browser `Notification`/beep for live "new client" alerts, and Chart.js for the revenue/package charts.

## Deploy boundaries

`.vercelignore` keeps `admin/`, `supabase/`, and `servicios/flyer.html` out of the public Vercel deploy even though they're tracked in git — don't assume everything in the repo is publicly served. When adding a new Edge Function or admin-only tooling, add it there too.
