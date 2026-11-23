# Smart Skill Passport (SSP)

Next.js App Router application for students, college administrators, and recruiters to manage verifiable credentials, skills evidence, and shareable digital passports.

## Stack

- **Next.js 15** (App Router) · **React 19** · **TypeScript**
- **Supabase** (Auth, Postgres, Storage, RLS)
- **Tailwind CSS 4** · **Recharts** · **Vitest**

## Quick start

1. Copy `.env.example` to `.env.local` and fill values from `npx supabase status` after local start:

   ```bash
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   JOB_WORKER_SECRET=dev-worker-secret
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. Start Supabase and reset schema (requires Docker):

   ```bash
   npx supabase start
   npx supabase db reset
   ```

3. Seed demo users:

   ```bash
   node --env-file=.env.local scripts/seed-demo-users.mjs
   ```

4. Run the app:

   ```bash
   npm run dev
   ```

5. Process certificate jobs (in another terminal):

   ```bash
   curl -X POST http://localhost:3000/api/jobs/process -H "x-job-secret: $JOB_WORKER_SECRET"
   ```

### Demo accounts

| Role           | Email               | Password            |
|----------------|---------------------|---------------------|
| Student        | `student@demo.edu`  | `DemoStudent123!`   |
| College admin  | `admin@demo.edu`    | `DemoAdmin123!`     |
| Recruiter      | `recruiter@demo.edu`| `DemoRecruiter123!` |

## App areas

| Route prefix   | Audience        | Purpose                                      |
|----------------|-----------------|----------------------------------------------|
| `/student`     | Students        | Certificates, skills, projects, passport     |
| `/admin`       | College admins  | Verification queue, roster, analytics, audit |
| `/recruiter`   | Recruiters      | Search shared passports, shortlist           |
| `/passport/[token]` | Public     | Hashed share-token passport view             |

## Demo mode (no Supabase)

When `DEMO_MODE=true` (default in `.env.local` placeholders), sign in with demo accounts and use cookie-based learning preferences. Certificate verification adapters still never invent issuer-verified stamps.

## Admin Student Intelligence

- `/admin` — KPI overview (branch/batch, certificates, training, placement eligibility, support)
- `/admin/students` — searchable, sortable, paginated directory with CSV/Excel export
- `/admin/students/[id]` — Student 360° (Overview · Academics · Skills · Certificates · Training · Assessments · Projects · Placement · Activity)
- Migration: `supabase/migrations/20260324000001_admin_intelligence.sql`
- Reference placement UI was login-gated; this build follows the product requirements, not pixel-copy

## Sprint 1 — Skill Journey

- `/student/onboarding` — career path, skills, weekly commitment
- `/student/journey` — personalized milestone roadmap
- `/student` — next-action dashboard
- Migration: `supabase/migrations/20260323000001_sprint1_journey.sql`

## Verification principles

- **`issuer_verified` is never set from UI forms** — only trusted issuer adapters or audited backend pipelines may set it.
- Institutional review (`institution_reviewed` / `rejected`) is available to college admins when issuer checks are unavailable.
- Passport share tokens are stored as **SHA-256 hashes**; raw tokens are shown once when created.

## Scripts

| Command              | Description                |
|----------------------|----------------------------|
| `npm run dev`        | Development server         |
| `npm run build`      | Production build           |
| `npm run typecheck`  | TypeScript                 |
| `npm test`           | Vitest unit tests          |
| `npm run db:reset`   | Reset local Supabase DB    |

## Documentation

- [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md) — OCR, issuer adapters, and background jobs