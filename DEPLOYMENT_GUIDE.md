# Deployment Guide

## Architecture

This app has 2 deployed parts:

1. The Next.js web app
   Deploy this to Vercel.
2. The backend services
   Use a hosted Supabase project for Auth, Postgres, and the generated API.

You do not deploy a custom Node backend separately here. Supabase is the hosted backend.

## 1. Fix the signup error first

The app expects these public environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
```

Compatibility note:

- `NEXT_PUBLIC_SUPABASE_ANON_KEY` also works in this repo.
- If you copied the newer Supabase "publishable key", that now works too.

Without those variables, signup/login will fail immediately in the browser.

## 2. Create a Supabase project

In the Supabase dashboard:

1. Create a new project.
2. Open the project's `Connect` dialog.
3. Copy:
   - Project URL
   - Publishable key

## 3. Apply the database schema

This repo already contains the SQL migration:

- [20260422000000_init_pulseplan.sql](</home/raoul/Desktop/4GI/2025-2026/Competitions/H24 HACKVERSE/PRE_HACKVERSE_THUNDERSTORM/supabase/migrations/20260422000000_init_pulseplan.sql>)

Fastest way:

1. Open Supabase dashboard.
2. Go to SQL Editor.
3. Paste the migration content.
4. Run it.

That creates:

- `profiles`
- `tasks`
- `fixed_events`
- `preferences`
- `schedule_blocks`

And it also creates RLS policies and the auto-profile trigger.

## 4. Configure Auth in Supabase

In Supabase dashboard:

1. Go to Authentication.
2. Make sure Email auth is enabled.
3. Decide whether email confirmation is required.

For hackathon/demo mode:

- You can disable email confirmation temporarily to make signup/login immediate.

For production:

- Keep email confirmation enabled.
- Configure Site URL and Redirect URLs correctly.
- Configure SMTP if you want branded/reliable production emails.

## 5. Configure URLs

In `Authentication -> URL Configuration`:

- Set `Site URL` to your production frontend URL.
- Add redirect URLs for:
  - `http://localhost:3000/**`
  - your production domain
  - your Vercel preview domain pattern if needed

Recommended production setup:

- `Site URL`: `https://your-app.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://your-app.vercel.app/**`
  - `https://*-your-team.vercel.app/**`

If this is wrong, email confirmation and password reset flows break even if signup technically creates the user.

## 6. Local environment

Create `.env.local` in the repo root:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 7. Deploy the frontend to Vercel

1. Push the repo to GitHub.
2. Import the repo into Vercel.
3. Add the same environment variables in Vercel Project Settings:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_KEY
NEXT_PUBLIC_SITE_URL=https://your-production-domain.vercel.app
```

4. Trigger a deployment.

## 8. Production checklist

After deploy:

1. Open the deployed site.
2. Try signup.
3. Confirm the user appears in Supabase Authentication users.
4. If email confirmation is enabled, verify the link opens the correct frontend URL.
5. After login, call authenticated routes and confirm tables are being used.

## Common failure cases

### Signup throws immediately in the browser

Usually:

- missing env vars
- wrong variable name (`PUBLISHABLE_KEY` vs `ANON_KEY`)

### Signup creates user but confirmation email link is wrong

Usually:

- `Site URL` is still `localhost`
- redirect URLs are not configured

### Login works but server-side routes behave like the user is logged out

Usually:

- missing auth session refresh middleware/proxy

This repo now includes `middleware.ts` for that.

### Emails do not arrive

Usually:

- email confirmation enabled but SMTP/domain/email delivery is not configured

For a hackathon, disabling confirmation is often the fastest path.

