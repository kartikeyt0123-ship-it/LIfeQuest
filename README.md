# LifeQuest

**Turn your real life into an RPG.** LifeQuest is a gamified personal-progress tracker: your daily tasks become *quests*, your routines become *habits* with streaks, and finishing them earns **XP** and **gold**. XP levels up your character, gold is spent in a reward shop on real-world treats you define, and milestones unlock achievements and "life cards" that mark how far you've come.

It is designed to make consistency visible and rewarding — a quiet system for the work that matters.

## Features

- **Dashboard** – today's quests, current level and XP bar, gold balance, streak, and the next life card to unlock.
- **Quests** – create, edit, and complete one-off or repeating tasks. Each quest has a category (fitness, study, coding, discipline, …), a difficulty, and XP/gold rewards scaled to it.
- **Habits** – daily habits with current and best streaks; toggle them done each day to keep the chain alive.
- **Achievements** – unlockable badges (First Quest, Unstoppable, Quest Master, Scholar, Gold Hoarder, Zen Mind, …) awarded automatically as you progress.
- **Reward Shop** – spend earned gold on rewards you choose for yourself; every purchase is recorded.
- **Character** – your profile, level curve, lifetime XP/gold ledgers, and daily stats.
- **Accounts** – email/password sign-up and login with JWT sessions; every user has their own isolated progress.

## Tech stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, shadcn/ui patterns, `motion` animations, Vercel Analytics |
| Backend   | Node.js, Express, TypeScript, Prisma ORM, JWT auth, bcryptjs |
| Database  | PostgreSQL (via Prisma) |
| Tooling   | pnpm or npm for the frontend, npm for the backend |

## Project structure

```
Life_RPG/
├── frontend/          # Next.js app (UI)
│   ├── app/           # routes: /, /quests, /habits, /achievements, /shop, /character, /login, /signup
│   ├── components/    # UI components
│   └── lib/           # game-context (API client + state), game data, utils
├── backend/           # Express API
│   ├── prisma/        # schema + migrations
│   ├── scripts/       # dev-db.mjs — local PostgreSQL launcher
│   └── src/           # routes, services, middleware
└── run.sh             # starts database, API and UI together
```

### API overview

All routes are prefixed with `/api`. Authenticated routes expect `Authorization: Bearer <token>`.

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/auth/signup` (alias `/auth/register`) | Create an account |
| POST | `/auth/login` | Log in, returns JWT |
| GET  | `/auth/me` | Current user |
| POST | `/auth/logout` | Revoke token |
| GET  | `/state`, `/dashboard` | Full player state / dashboard summary |
| GET/POST | `/quests` · GET/PUT/DELETE `/quests/:id` · POST `/quests/:id/complete` | Quest CRUD and completion |
| GET  | `/habits` · POST `/habits/:id/toggle` | Habits and daily toggling |
| GET  | `/rewards` · POST `/rewards/:rewardId/redeem` | Reward shop |
| GET  | `/health` | Liveness check |

## Running locally

### Prerequisites

- Node.js 18+ (tested on 24)
- No PostgreSQL install required — a local server is bundled via `embedded-postgres`.

### 1. Backend + database

```bash
cd backend
cp .env.example .env      # on Windows: copy .env.example .env
npm install               # also runs `prisma generate`
npm run db                # starts PostgreSQL on localhost:5432 — keep this terminal open
```

In a second terminal:

```bash
cd backend
npx prisma migrate deploy # first time only (creates the tables)
npm run dev               # API on http://localhost:4000
```

`backend/.env`:

```env
# URL-encode special characters in the password (`@` -> `%40`)
DATABASE_URL="postgresql://postgres:Vishal%402006@localhost:5432/lifequest?schema=public"
JWT_SECRET="change-me-in-production"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

To use your own PostgreSQL instead, create a database named `lifequest` and point `DATABASE_URL` at it; skip `npm run db`.

### 2. Frontend

```bash
cd frontend
cp .env.example .env.local   # NEXT_PUBLIC_API_URL=http://localhost:4000/api
npm install                  # or pnpm install
npm run dev                  # http://localhost:3000 (or 3001 if 3000 is busy)
```

Or start everything at once from the repo root with `./run.sh`.

## Deploying

Vercel is built for the Next.js frontend. The Express API is a long-running server that needs a PostgreSQL database, so the recommended production layout is:

| Part | Host |
|------|------|
| Frontend (`frontend/`) | **Vercel** |
| Database | **Neon** / Supabase / Vercel Postgres (any hosted PostgreSQL) |
| Backend (`backend/`) | **Render** / Railway / Fly.io (or Vercel — see the alternative below) |

### Step 1 — Push the repo to GitHub

Commit and push `Life_RPG/` to a GitHub repository. Make sure `.env`, `.env.local`, `.pgdata` and `node_modules` are **not** committed (they are gitignored).

### Step 2 — Create the production database

1. Create a free PostgreSQL database on [Neon](https://neon.tech) (or Supabase / Vercel Storage → Postgres).
2. Copy its connection string, e.g. `postgresql://user:pass@host/dbname?sslmode=require`.
3. Run the migrations against it once from your machine:
   ```bash
   cd backend
   DATABASE_URL="<production connection string>" npx prisma migrate deploy
   ```

### Step 3 — Deploy the backend (Render example)

1. On [Render](https://render.com) → **New → Web Service** → connect the GitHub repo.
2. Settings:
   - **Root directory:** `backend`
   - **Build command:** `npm install && npx prisma generate && npm run build`
   - **Start command:** `npm start`
3. Environment variables:
   ```
   DATABASE_URL = <production connection string>
   JWT_SECRET   = <long random string>
   FRONTEND_URL = https://<your-app>.vercel.app   (fill in after step 4, then redeploy)
   ```
   Render sets `PORT` automatically; the server already reads it.
4. Deploy and note the URL, e.g. `https://lifequest-api.onrender.com`. Check `https://lifequest-api.onrender.com/api/health` returns `{"ok":true}`.

### Step 4 — Deploy the frontend on Vercel

1. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import the GitHub repo.
2. In the import screen:
   - **Root Directory:** `frontend` (click *Edit* and pick the folder)
   - **Framework Preset:** Next.js (auto-detected)
   - Build/output commands: leave defaults.
3. **Environment Variables** — add:
   ```
   NEXT_PUBLIC_API_URL = https://lifequest-api.onrender.com/api
   ```
   (`NEXT_PUBLIC_*` variables are baked in at build time, so set this **before** the first deploy, and redeploy if you ever change it.)
4. Click **Deploy**. Vercel gives you a URL like `https://lifequest.vercel.app`.
5. Go back to the backend host and set `FRONTEND_URL` to that exact origin (no trailing slash) so CORS allows it, then redeploy the backend.

Alternatively, from the CLI:

```bash
npm i -g vercel
cd frontend
vercel                       # first deploy, follow the prompts
vercel env add NEXT_PUBLIC_API_URL production
vercel --prod
```

### Step 5 — Verify

Open the Vercel URL, create an account, complete a quest. If sign-up shows *"Server error … Make sure the API is running"*, check `NEXT_PUBLIC_API_URL` (must end in `/api`) and that `FRONTEND_URL` on the backend matches the Vercel origin.

### Alternative: hosting the backend on Vercel too (already wired up)

`backend/` ships with `api/index.ts` and `vercel.json`, so the Express API can run as a Vercel serverless function and the entire app can live on one Vercel account:

1. **Storage → Create Database → Neon (Postgres)** in your Vercel dashboard, or create one at neon.tech. Copy the *pooled* connection string.
2. Run migrations once from your machine: `DATABASE_URL="<connection string>" npx prisma migrate deploy` (in `backend/`).
3. **Add New → Project** → import the repo → Root Directory **`backend`** → env vars `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL` → Deploy. Note the URL (e.g. `https://lifequest-api.vercel.app`); `/api/health` should return `{"ok":true}`.
4. **Add New → Project** again → same repo → Root Directory **`frontend`** → env var `NEXT_PUBLIC_API_URL=https://lifequest-api.vercel.app/api` → Deploy.
5. Set `FRONTEND_URL` on the backend project to the frontend URL and redeploy it.

Caveats of serverless: cold starts, a 10 s execution limit on the Hobby plan, and the in-memory logout token blacklist does not persist between invocations (tokens still expire after 30 days).

## Notes

- Keep the UI in `frontend/` as the visual source of truth.
- Passwords are hashed with bcrypt; JWTs expire after 30 days.
- Reference data (achievements, rewards, life cards) is created automatically on first sign-up, so no seed step is required.
