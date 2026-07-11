# FlowPilot

FlowPilot is an AI-powered workflow automation platform with a reusable workflow engine.

## Stack

- Backend: Node.js, Express, TypeScript, Prisma, PostgreSQL
- Frontend: Next.js, React, TailwindCSS
- Monorepo: pnpm workspace + Turbo

## Features Implemented

- Organizations: create/list/get
- Users: create/list/get
- Workflow Templates: create/list/get
- Workflows:
  - create with transactional step execution generation
  - list/get
  - approve active step
  - reject active step
- Audit logs:
  - WORKFLOW_CREATED
  - STEP_APPROVED
  - STEP_REJECTED
  - WORKFLOW_COMPLETED

## Local Development (without Docker)

1. Install dependencies:
   - `pnpm install`
2. Start PostgreSQL (local or Docker).
3. Configure env in `apps/api/.env` from `.env.example`.
4. Generate Prisma client:
   - `cd apps/api && pnpm prisma:generate`
5. Create the database schema:
   - `cd apps/api && pnpm prisma:push`
6. Seed data:
   - `cd apps/api && pnpm prisma:seed`
7. Start API:
   - `cd apps/api && pnpm dev`
8. Start Web:
   - `cd apps/web && pnpm dev`

> Note: the project uses `prisma db push` (no migration history) for fast hackathon setup. `pnpm prisma:migrate` is available if you prefer generating migrations locally.

## Docker Deployment

From repo root:

1. Build and run everything with a single command:
   - `docker compose -f docker/docker-compose.yml up --build`

The API container waits for Postgres to be healthy, then automatically runs
`prisma generate`, `prisma db push`, and `prisma:seed` before starting. No manual
migration step is required.

Optional (for AI review), run a vLLM server and export its URL before running:
   - `export VLLM_URL=http://127.0.0.1:8000/v1/chat/completions`

Services:

- API: http://localhost:3000
- Web: http://localhost:3001
- Health: http://localhost:3000/health

## API Endpoints

### Organizations
- `POST /organizations`
- `GET /organizations`
- `GET /organizations/:id`

### Users
- `POST /users`
- `GET /users`
- `GET /users/:id`

### Workflow Templates
- `POST /workflow-templates`
- `GET /workflow-templates`
- `GET /workflow-templates/:id`

### Workflows
- `POST /workflows`
- `GET /workflows`
- `GET /workflows/:id`
- `POST /workflows/:id/approve`
- `POST /workflows/:id/reject`

### AI
- `POST /ai/review` (requires a running vLLM server)

## Environment Variables

| Variable | Scope | Description |
| --- | --- | --- |
| `PORT` | API | API port (default 3000) |
| `DATABASE_URL` | API | PostgreSQL connection string |
| `VLLM_URL` | API | vLLM OpenAI-compatible chat endpoint, used by `POST /ai/review` |
| `NEXT_PUBLIC_API_URL` | Web | Base URL the frontend calls |

## AI Module

The AI pipeline (Controller → Service → ContextBuilder → PromptBuilder → LLMProvider → ResponseParser → BusinessRules) is fully wired. The vLLM provider calls an OpenAI-compatible endpoint (`VLLM_URL`); if the vLLM server is unreachable, `POST /ai/review` returns a clear error while the rest of the app is unaffected.

## Known Limitations

- Uses `prisma db push` instead of versioned migrations (hackathon speed).
- No authentication/authorization (intentionally out of scope).
- Approve/reject use transactions but no row-level locking, so highly concurrent approvals on the same workflow are not serialized.
- `BusinessRules` is a passthrough placeholder; deterministic guardrails are not yet enforced.
- AI review depends on an external vLLM server being reachable at `VLLM_URL`.

## Future Improvements

- Versioned Prisma migrations.
- Optimistic concurrency on step transitions.
- Deterministic business rules over AI output.
- Authentication, RBAC, and rate limiting.
- Notifications and background workers.
