# CMS · CRM · ERP — a friendly starter kit

This repository is a practical, easy-to-play-with example of a full-stack app combining a CMS, CRM, and simple ERP features. The backend is built with NestJS + Prisma (Postgres) and the frontend uses React + Vite. It’s meant for learning, prototyping, and trying out real workflows like publishing content, managing leads, and processing orders.

---

## What you get

- A modular NestJS backend with Auth, Users, CMS, CRM and ERP-style modules.
- Type-safe database access via Prisma + PostgreSQL.
- A modern React + Vite frontend (TypeScript, MUI, React Query, Zustand).
- JWT-based auth and simple role checks.
- An API that uses pagination and returns helpful metadata.
- A ready-to-run seed script that fills the DB with realistic demo data.
- A clear automation roadmap (order processing, billing, inventory, CRM flows).

---

## Repo layout

- `backend/` — the NestJS API (includes `prisma/` with schema & seed script)
- `frontend/` — React + Vite single-page app
- Top-level helpers like `.gitignore` and this `README.md`

---

## Quick start (local)

What you need:

- Node.js 18+ (or newer)
- Docker & Docker Compose (recommended for Postgres and optional Redis)
- npm / pnpm / yarn

Install dependencies (from project root):

```powershell
cd "C:\Users\Nishith Soni\Desktop\CMS Project"
cd backend; npm ci
cd ..\frontend; npm ci
```

Create a `.env` for the backend (example):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cms_database
JWT_SECRET=your_jwt_secret
PORT=3000
```

Start a local Postgres (if you don't have one already):

```powershell
docker compose up -d
```

Run migrations and the seed script (backend):

```powershell
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

The seed creates a demo admin you can use to log in:

- Email: admin@cms.local
- Password: Admin@123

Run the apps in development mode:

Backend:
```powershell
cd backend
npm run start:dev
```

Frontend:
```powershell
cd frontend
npm run dev
```

Open the frontend at http://localhost:5173 and the API at http://localhost:3000/api.

---

## Production notes & Docker tips

- Build the frontend: `cd frontend && npm run build`
- Build the backend: `cd backend && npm run build`
- For production, use multi-stage Dockerfiles and serve the frontend from a static host or CDN.
- For background processing, add Redis + BullMQ and run workers in separate containers.

---