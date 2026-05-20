# Joy Quotient (JQ) Assessment

An interactive web app for the **Joy Quotient Assessment** from _The Alchemy of
Joy_ by Brent Freeman. Users create an account, take the 10-question JQ quiz,
save their score, and track how their joy grows over time on a personal
dashboard.

## Features

- 10-question JQ Assessment with a guided, one-question-at-a-time flow
- Automatic scoring (10–50) with the four JQ bands: Low, Moderate, High, Very High
- Accounts with email + password, plus optional Google sign-in
- Personal dashboard with a score-over-time chart, trend, and full history
- Optional notes saved with each check-in
- Self-contained SQLite database — no external services required

## Tech stack

- Next.js 16 (App Router) + React 19
- Tailwind CSS v4
- SQLite via `better-sqlite3`
- `bcryptjs` password hashing, cookie-based sessions

## Getting started

```
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

The SQLite database is created automatically at `./data/jq.db` on first run.
This folder is git-ignored.

## Configuration

Copy `.env.example` to `.env`. All values are optional:

- `DATABASE_PATH` — override the SQLite file location.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — enable "Continue with Google".
  Create OAuth credentials in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
  and set the authorized redirect URI to `<your-app-url>/api/auth/google/callback`.
  If these are blank, the Google button is hidden and email/password still works.
- `NEXT_PUBLIC_APP_URL` — public URL of the app, used for OAuth redirects in
  production. Auto-detected in local dev.

## Notes on hosting

`better-sqlite3` writes to a local file, so data persists on a long-running
server or VPS. On serverless platforms (e.g. Vercel) the filesystem is
ephemeral and data will reset — use a persistent host or swap in a hosted
database if you deploy there.

## Commands

```
npm run dev     # start the dev server
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
```
