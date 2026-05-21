# Joy Quotient (JQ) Assessment

An interactive web app for the **Joy Quotient Assessment** from _The Alchemy of
Joy_ by Brent Freeman. Users create an account, read a short introduction,
take the 10-question JQ quiz, see their score against the full rubric, and
track how their joy grows over time on a personal dashboard.

## Features

- Introduction screen explaining what the Joy Quotient is and how it works
- 10-question JQ Assessment with a guided, one-question-at-a-time flow
- Automatic scoring (10–50) with the four JQ bands, shown as a rubric on results
- Accounts with email + password, plus optional Google sign-in
- Personal dashboard with a score-over-time chart, trend, and full history
- Optional notes saved with each check-in

## Tech stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- PostgreSQL via `pg`
- `bcryptjs` password hashing, cookie-based sessions

## Getting started

```
npm install
```

Set `DATABASE_URL` to a PostgreSQL connection string (see Configuration), then:

```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Tables are created
automatically on first run.

## Configuration

Copy `.env.example` to `.env`:

- `DATABASE_URL` — **required.** A PostgreSQL connection string. On Vercel,
  the Neon/Postgres integration sets this for you.
- `NEXT_PUBLIC_APP_URL` — the deployed URL, used for Google OAuth redirects.
  Auto-detected per request; safe to leave blank.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enable "Continue with Google".
  Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  with redirect URI `<your-app-url>/api/auth/google/callback`. If blank, the
  Google button is hidden and email/password still works.

## Deploying to Vercel

1. Push the repo to GitHub and import it at [vercel.com/new](https://vercel.com/new).
2. In the Vercel project, open **Storage** and create a **Neon Postgres**
   database — Vercel wires `DATABASE_URL` into the project automatically.
3. Deploy. The app builds and runs with no further configuration.

The session cookie uses `SameSite=None` in production, so the app also works
embedded in an `<iframe>` on another domain.

## Commands

```
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
```
