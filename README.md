# LifeQuest

This project keeps the polished v0 frontend in the `ui/` folder and the API in the `backend/` folder.

## Prerequisites

- Node.js 18+
- PostgreSQL running locally

## PostgreSQL setup

1. Create a database named `lifequest`.
2. Update `backend/.env` with your local connection string.

Example:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lifequest?schema=public"
JWT_SECRET="change-me"
PORT=4000
FRONTEND_URL="http://localhost:3000"
```

## Backend

```bash
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## Frontend

```bash
cd ui
npm install
npm run dev
```

The frontend runs on http://localhost:3000 and the API runs on http://localhost:4000.

## Notes

- Keep the UI in `ui/` as the visual source of truth.
- Use `ui/.env.example` for the frontend API base URL.
- The app uses a real API layer, but the existing v0 layouts and components remain intact.
