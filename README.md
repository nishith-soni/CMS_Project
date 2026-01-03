# CMS + CRM + ERP (React + NestJS + TypeScript)

>A production-style, full-stack content management, CRM and ERP sample application built with NestJS (backend), Prisma + PostgreSQL (database), and React + Vite (frontend). This repo is designed for learning and rapid prototyping of real-world workflows: content publishing, leads & deals, products, customers and order processing.

---

## Key Features

- Modular backend: Auth, Users, CMS, CRM, ERP modules (NestJS)
- Type-safe database access with Prisma (PostgreSQL)
- Modern React frontend (Vite + TypeScript + MUI)
- JWT authentication and role-based access
- API patterns with pagination and metadata
- Seed script to populate realistic dummy data
- Ready for automation: order processing, invoices, inventory, lead workflows

---

## Repository Layout

- `backend/` — NestJS API server, Prisma schema and seed script
- `frontend/` — React + Vite SPA (TypeScript, MUI, React Query, Zustand)
- `prisma/` — schema and migrations (inside backend)
- `.gitignore`, `README.md` — top-level project files

---

## Quick Start (Local)

Prerequisites:

- Node.js 18+ (recommended)
- Docker & Docker Compose (for Postgres & Redis if used)
- npm (or pnpm/yarn)

1) Clone and install

```bash
cd "C:\Users\Nishith Soni\Desktop\CMS Project"
npm ci --workspace=backend || (cd backend && npm ci)
npm ci --workspace=frontend || (cd frontend && npm ci)
```

2) Environment

- Copy env files for backend: `backend/.env` (example variables below)

Required backend env variables (example `.env`):

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/cms_database
JWT_SECRET=your_jwt_secret
PORT=3000
```

3) Start PostgreSQL (Docker Compose recommended)

If you have a `docker-compose.yml` for the project, start Postgres:

```bash
docker compose up -d
# verify container name and port mapping (host:container) e.g. 5433:5432
```

4) Run Prisma Migrate & Seed (backend)

```bash
cd backend
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
```

Seed creates a demo admin account:

- Email: `admin@cms.local`
- Password: `Admin@123`

5) Run backend and frontend (dev)

Backend (dev)
```bash
cd backend
npm run start:dev
```

Frontend (dev)
```bash
cd frontend
npm run dev
```

Open frontend at `http://localhost:5173` and backend API at `http://localhost:3000/api`.

---

## Production Build & Docker tips

- Build frontend: `cd frontend && npm run build`
- Build backend: `cd backend && npm run build`
- Use a multi-stage Dockerfile for the backend and serve the frontend from a static host or container.
- For background jobs use Redis + BullMQ and run worker processes in separate containers.

---

## Automation Roadmap (High Priority Items)

These automation tasks are implemented as background workers, scheduled tasks, and event handlers in recommended order:

1. Order Processor — enqueue `order.process` jobs after order creation:
   - Deduct inventory, create inventory logs, generate invoices, send confirmation emails, notify warehouse.
2. Inventory Automation — low-stock reorder, nightly reconciliation and alerts.
3. Billing Automation — recurring invoices, payment reminders, webhook-based payment reconciliation.
4. CRM Automation — lead scoring, auto-assignment, follow-up scheduling.
5. CMS Automation — scheduled publishing, media processing, SEO suggestions.

Tools suggested: Redis + BullMQ (queues), `@nestjs/schedule` (cron), Nodemailer/SendGrid (email), and event-driven design (emit + worker).

---

## Testing & QA

- Unit & integration tests are not included by default — add Jest for backend and vitest/react-testing-library for frontend.
- Use `prisma studio` to inspect DB: `cd backend && npx prisma studio`

---

## Git & GitHub

- `.gitignore` is included and configured to exclude `node_modules`, `.env` files, build artifacts and local Docker overrides.
- Recommended workflow:

```bash
git init
git add .
git commit -m "Initial commit: CMS + CRM + ERP sample"
git branch -M main
# create remote on GitHub and push (or use `gh repo create`)
git remote add origin <your-repo-url>
git push -u origin main
```

---

## Next Steps & Recommendations

- Add CI (GitHub Actions) to run lint, tests, build and `prisma migrate` on PRs.
- Add Redis and BullMQ for background processing and add a `QueueModule` in backend.
- Add observability: simple logs, Sentry for errors, Prometheus metrics for critical endpoints.
- Add an integration test that runs `docker compose` with Postgres and runs the seed to validate end-to-end flows.

---

## Contributing

Contributions are welcome. Create issues for bugs or feature requests, and open pull requests against `main`.

---

## License

This project contains no license file by default. Add a license (MIT recommended) before publishing if you want to share publicly.

---

If you want, I can:

- Initialize the git repo and make the initial commit here
- Create a GitHub repo and push (I'll need `gh` CLI or your permission/credentials)
- Add a simple `docker-compose.yml` (Postgres + Redis) and a minimal `QueueModule` scaffold for the backend

Tell me which of those you'd like next.