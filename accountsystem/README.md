# Saraya Accounts Console

A Next.js App Router control plane for Saraya platform accounts. It aligns Supabase auth, Prisma models, and Tailwind-powered UI for operations teams.

## Stack

- Next.js 14 (App Router) + React 18
- Tailwind CSS with Space Grotesk for bold typography
- Prisma ORM targeting Supabase Postgres
- Supabase Auth + Storage integration helpers
- Framer Motion, Lucide icons for motion-rich admin UI

## Single Sign-On Layer

The Accounts service now brokers cross-app SSO via `https://accounts.saraya.solutions`:

- `POST /api/auth/sso-link` — called from any frontend immediately after login to seed the browser with an `accounts.` Supabase session cookie. Requires `access_token` and `refresh_token` in the body. CORS is restricted to `SSO_ALLOWED_ORIGINS` and must be invoked with `credentials: 'include'`.
- `GET /sso?redirect_uri=<url>&state=<nonce>` — top-level redirect that verifies the central cookie, creates a short-lived SSO code, and bounces the user back to the requesting app with that `code`.
- `POST /api/auth/exchange` — server-side call that redeems the code for Supabase tokens plus account metadata.

### Required tables / SQL

Create the `sso_codes` table inside the Supabase project that powers Accounts:

```sql
create table if not exists public.sso_codes (
   code text primary key,
   account_id text not null,
   access_token text not null,
   refresh_token text not null,
   session_expires_at timestamptz,
   redirect_uri text,
   state text,
   user_agent text,
   ip_address text,
   expires_at timestamptz not null,
   used_at timestamptz default null,
   created_at timestamptz not null default now()
);

create index if not exists sso_codes_expires_idx on public.sso_codes (expires_at);
create index if not exists sso_codes_account_idx on public.sso_codes (account_id);
```

### Environment variables

Add the following keys (see `.env.example` for defaults):

```
SSO_ALLOWED_REDIRECTS=comma-separated list of full URLs or hostnames
SSO_ALLOWED_ORIGINS=origins allowed to POST to /api/auth/sso-link
SSO_COOKIE_DOMAIN=.saraya.solutions
SSO_COOKIE_NAME=sb-auth-token
SSO_CODE_TTL_SECONDS=90
```

Each consuming app should, after a successful login, `fetch('https://accounts.saraya.solutions/api/auth/sso-link', { method: 'POST', credentials: 'include', body: JSON.stringify({ access_token, refresh_token }) })`. When an app loads without a local session, redirect the browser to `https://accounts.saraya.solutions/sso?redirect_uri=${encodeURIComponent(currentUrl)}&state=${nonce}` and then POST the returned `code` to `/api/auth/exchange` to obtain fresh Supabase tokens without forcing another credential prompt.

> **Why are localhost:3000, 3004, and 3005 in the defaults?**  
> Those ports map to the dev servers for Saraya Quiz (`3000`), RewardsCenter (`3004`), and the Accounts console itself (`3005`). They stay in `SSO_ALLOWED_REDIRECTS/ORIGINS` so engineers can test SSO flows locally without editing env vars each time.

## Getting Started

1. Copy `.env.example` to `.env` and fill in the Supabase + platform secrets supplied by infrastructure.
2. Install dependencies:
   ```pwsh
   npm install
   ```
3. Generate the Prisma client (after ensuring `DATABASE_URL` is set):
   ```pwsh
   npx prisma generate
   ```
4. Run the dev server:
   ```pwsh
   npm run dev
   ```
5. Visit `http://localhost:3000/admin` and provide an `x-admin-email` header that matches `ADMIN_EMAILS` when calling the APIs (Supabase session tokens are used in production).

## Database Schema

The Prisma schema (`prisma/schema.prisma`) defines:
- `Account` core profile referencing Supabase user ids
- `CoinWallet` + `XpProfile` singletons per account
- `Platform`, `PlatformMembership` for entitlements / API key rotation
- `ActivityEvent` and `AdminAuditLog` for observability

Run migrations with your preferred workflow (`prisma db push`, `prisma migrate dev`, or managed by Supabase SQL editor).

## API Surface

| Route | Method | Description |
| --- | --- | --- |
| `/api/accounts` | GET | Admin list of accounts + related wallet/xp data |
| `/api/accounts` | POST | Admin account creation + platform enrollment |
| `/api/accounts/[id]` | PATCH/DELETE | Update status, balances, or soft delete |
| `/api/platforms` | POST | Platform-facing hook to append activity + adjust balances |
| `/api/admin` | GET | Dashboard metrics + latest activity |

All admin endpoints expect either a Supabase bearer token or an `x-admin-email` header that matches `ADMIN_EMAILS` (useful for secure service-to-service calls).

## Frontend Experience

- Landing page markets the platform value prop with gradient surfaces.
- `/admin` renders a dynamic dashboard (Framer Motion cards, account table, create form, activity feed) pulling from the API endpoints above.
- Tailwind config (`tailwind.config.ts`) defines brand colors, glassmorphism surfaces, and a card shadow used consistently.

## Scripts

- `npm run dev` – Next.js dev server
- `npm run build` – production build
- `npm run start` – run compiled output
- `npm run lint` – lint with ESLint
- `npm run prisma:generate` – generate Prisma client
- `npm run prisma:push` – push schema to DB
- `npm run prisma:migrate` – apply migrations in production

## Deployment Notes

- Deploy via Coolify, ensuring environment variables are injected at deploy time.
- Supabase service role key must remain server-side only; never expose it to the browser.
- Rotate platform API keys and update corresponding env vars, then trigger `POST /api/platforms` calls to sync hashed values if needed.
