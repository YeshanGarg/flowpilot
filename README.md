# FlowPilot

FlowPilot is an AI-powered workflow approval platform that helps organizations automate business processes with reusable workflow templates, structured approvals, audit trails, and AI-assisted decision support.

Built using Express, Next.js, PostgreSQL, AMD Developer Cloud, vLLM, and Qwen3-0.6B.

> Built for the AMD Developer Hackathon using:
> - **AMD Developer Cloud** — hosted GPU inference
> - **vLLM** — OpenAI-compatible serving layer
> - **Qwen3-0.6B** — fast local review model
> - **OpenAI-compatible inference API** — drop-in provider integration

## Screenshots

> Add three visuals here for maximum impact (drop images into `docs/`).

### Dashboard

![Dashboard](docs/dashboard.png)

### AI Review

![AI Review](docs/ai-review.png)

### Workflow Timeline

![Timeline](docs/workflow.png)

## Problem FlowPilot Solves

Most internal business requests are still handled by email, chat threads, and spreadsheet tracking. That creates three recurring problems:

- Process sprawl: every team builds a different request flow.
- Poor visibility: no single source of truth for status, blockers, and ownership.
- Slow decisions: approvers do not get structured context or risk signals quickly.

FlowPilot solves this with a generic workflow engine plus AI-assisted review, so teams can run consistent, auditable request workflows without writing request-specific backend logic.

## How It Works (Product Flow)

```
Organization
      │
      ▼
Workflow Template
      │
      ▼
Workflow Instance
      │
      ▼
Step Execution
      │
      ▼
AI Review
      │
      ▼
Approve / Reject
      │
      ▼
Audit Log
```

## Why the AI Matters

The AI assistant analyzes every workflow request and provides structured recommendations across:

- Security
- Compliance
- Operational Risk
- Cost
- Final Recommendation

This gives approvers additional context before making approval decisions while keeping business logic deterministic. The AI advises — humans (and the workflow engine) still decide.

## Potential Use Cases

FlowPilot can be adapted for:

- Infrastructure change approvals
- Procurement requests
- Security exception workflows
- Employee onboarding
- Access requests
- Finance approvals
- Legal reviews

## Features

- Generic workflow engine with template-driven execution.
- Organization and user management (create/list/get).
- Workflow templates (create/list/get).
- Workflow lifecycle:
  - create workflow from template
  - transactional step execution generation
  - approve active step
  - reject active step
  - completion tracking
- Audit events for key lifecycle transitions:
  - `WORKFLOW_CREATED`
  - `STEP_APPROVED`
  - `STEP_REJECTED`
  - `WORKFLOW_COMPLETED`
- AI workflow review endpoint (`POST /ai/review`) for risk and recommendation support.

## Architecture

FlowPilot follows a feature-based modular architecture in a pnpm monorepo.

- Monorepo orchestration: Turbo + pnpm workspaces
- API app: Express + TypeScript + Prisma
- Web app: Next.js + React + Tailwind
- Persistence: PostgreSQL

Design principles:

- Everything is a workflow.
- Workflow engine is the source of truth.
- AI assists decisions but does not own core business logic.
- Modules own their own routes, controllers, services, repositories, and types.

```mermaid
flowchart LR
    UI[Next.js Web] --> API[Express API]
    API --> WF[Workflow Engine]
    API --> DB[(PostgreSQL via Prisma)]
    API --> AI[AI Module]
    AI --> VLLM[vLLM OpenAI-Compatible Endpoint]
```

## AI Workflow

The AI review path is implemented end-to-end in the API:

`AIController -> AIService -> ContextBuilder -> Prompt Builder -> VLLMProvider -> ResponseParser -> BusinessRules`

```
Frontend
      │
      ▼
Express API
      │
      ▼
Workflow Engine
      │
      ▼
AI Service
      │
      ▼
vLLM
      │
      ▼
Qwen3-0.6B
      │
      ▼
Structured JSON Review
```

At runtime:

1. `POST /ai/review` receives structured workflow context.
2. `AIService` validates required fields and builds prompt context.
3. `VLLMProvider` calls an OpenAI-compatible vLLM endpoint (`VLLM_URL`).
4. Response is parsed and normalized.
5. `BusinessRules` applies deterministic post-processing before returning results.

## AMD Developer Cloud + vLLM + Qwen3-0.6B

FlowPilot is designed to use a self-hosted vLLM inference endpoint, including deployment on AMD Developer Cloud.

- Inference server: vLLM
- Default model in API provider: `Qwen/Qwen3-0.6B`
- Provider type: OpenAI-compatible Chat Completions API

### Why Qwen3-0.6B

Qwen3-0.6B was selected because it provides fast local inference suitable for workflow review while running efficiently on AMD Developer Cloud through vLLM. Its small footprint keeps review latency low and cost near zero, which matters when every workflow step can trigger a review.

Configure API to use your AMD Developer Cloud vLLM endpoint:

```bash
export VLLM_URL="https://<your-amd-dev-cloud-endpoint>/v1/chat/completions"
export VLLM_MODEL="Qwen/Qwen3-0.6B"
```

Optional connectivity check:

```bash
curl -L "https://<your-amd-dev-cloud-endpoint>/v1/models"
```

If vLLM is unavailable, only AI review fails; core workflow APIs continue to operate.

## Tech Stack

- Backend: Node.js, Express, TypeScript, Prisma ORM, PostgreSQL
- Frontend: Next.js 15, React 19, TailwindCSS
- AI serving: vLLM (OpenAI-compatible API) with `Qwen/Qwen3-0.6B`
- Monorepo/build tooling: pnpm workspaces, Turbo
- Runtime utilities: Zod, Pino, CORS, Helmet, JWT

## Setup Instructions

### 1. Prerequisites

- Node.js 20+
- pnpm 11+
- PostgreSQL 16+ (or Docker)

### 2. Install Dependencies

From repo root:

```bash
pnpm install
```

### 3. Configure Environment

Create `apps/api/.env` with at least:

```env
PORT=3000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flowpilot
VLLM_URL=http://127.0.0.1:8000/v1/chat/completions
VLLM_MODEL=Qwen/Qwen3-0.6B
```

And for web (`apps/web/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Prepare Database

```bash
cd apps/api
pnpm prisma:generate
pnpm prisma:push
pnpm prisma:seed
```

Note: this project uses `prisma db push` for rapid iteration. `pnpm prisma:migrate` is available if you want versioned migrations locally.

### 5. Run in Development

From repo root (runs API + Web):

```bash
pnpm dev
```

Or run individually:

```bash
pnpm api:dev
pnpm web:dev
```

### 6. Run with Docker Compose

From repo root:

```bash
docker compose -f docker/docker-compose.yml up --build
```

The API container runs `prisma:generate`, `prisma:push`, and `prisma:seed` automatically after Postgres becomes healthy.

### 7. Service URLs

- API: http://localhost:3000
- API Health: http://localhost:3000/health
- Web: http://localhost:3001

## Key API Endpoints

- `POST /organizations`
- `GET /organizations`
- `GET /organizations/:id`
- `POST /users`
- `GET /users`
- `GET /users/:id`
- `POST /workflow-templates`
- `GET /workflow-templates`
- `GET /workflow-templates/:id`
- `POST /workflows`
- `GET /workflows`
- `GET /workflows/:id`
- `POST /workflows/:id/approve`
- `POST /workflows/:id/reject`
- `POST /ai/review`

## Demo

- Video: _add link_
- Live Demo: _add link_
- Slides: _add link_

## Future Improvements

- Multi-agent workflow reviewers
- Human feedback learning
- Slack and Microsoft Teams integration
- Role-aware AI reviewers
- Workflow analytics dashboard
