# AI_CONTEXT.md

> This document defines the architecture, coding conventions and project philosophy for FlowPilot.
>
> Any AI generating code for this project MUST follow these instructions.

---

# Project Overview

Project Name: FlowPilot

FlowPilot is an AI-powered workflow automation platform.

The goal is NOT to build another CRUD application.

The goal is to build a reusable workflow engine capable of automating approval processes inside organizations.

Examples include:

- Repository Access
- Laptop Procurement
- Leave Approval
- Expense Reimbursement
- Vendor Approval
- Procurement
- Finance Requests
- HR Requests
- IT Support
- Security Reviews

Every request should follow the same generic workflow engine.

Never create request-specific implementations unless explicitly instructed.

---

# Project Philosophy

Priority Order

1. Working software
2. Clean architecture
3. Reusable components
4. Scalability
5. Optimization

Never sacrifice simplicity for unnecessary abstraction.

---

# Architecture

Feature-based architecture.

Every feature must live inside its own module.

Example

modules/

organization/

user/

workflow/

workflow-template/

audit/

Every module owns its own

- Routes
- Controller
- Service
- Repository
- Types / DTOs

No module should directly manipulate another module's database layer.

---

# Layer Responsibilities

Routes

Responsible only for registering endpoints.

Never implement business logic.

---

Controller

Responsible for HTTP.

Should only

- Read request
- Call service
- Return response

Never perform database operations.

Never contain business logic.

---

Service

Responsible for business rules.

Examples

Validation

Workflow execution

Approval rules

AI orchestration

Escalation

Notifications

May call multiple repositories.

Never perform raw Prisma queries.

---

Repository

Responsible only for database operations.

Should contain

Create

Update

Delete

Find

Search

Nothing else.

Never perform validation.

Never contain business logic.

---

Database

Prisma ORM.

Repositories communicate with Prisma.

Nothing else should.

---

# DTO Rules

Always use DTOs.

Examples

CreateUserDto

CreateWorkflowDto

ApproveWorkflowDto

UpdateWorkflowDto

Avoid passing multiple primitive arguments.

Prefer

create(data: CreateUserDto)

Instead of

create(name, email, organizationId)

---

# Naming Conventions

Classes

OrganizationService

WorkflowRepository

UserController

WorkflowTemplateService

Interfaces

CreateUserDto

UpdateWorkflowDto

Enums

WorkflowStatus

StepStatus

StepType

Methods

create()

update()

delete()

findById()

findAll()

approve()

reject()

escalate()

Never use inconsistent naming.

---

# API Response Format

Success

{
  "success": true,
  "data": {}
}

Failure

{
  "success": false,
  "message": "..."
}

Every endpoint must follow this format.

---

# Error Handling

Throw errors inside services.

Controllers should not contain business validation.

Global error middleware should eventually format errors.

Avoid repetitive try/catch blocks.

---

# Validation

Validation belongs in services.

Examples

Required fields

Duplicate detection

Business rules

Workflow constraints

Repository should trust validated input.

---

# Dependency Rules

Allowed

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

Forbidden

Controller → Prisma

Route → Repository

Repository → Controller

Service → Express

---

# Code Style

Use TypeScript.

Use async/await.

Prefer early returns.

Keep methods short.

Prefer readable code over clever code.

Avoid deeply nested conditions.

Extract reusable logic.

Use meaningful variable names.

---

# Database Rules

Repositories should return Prisma models unless transformation is required.

Do not duplicate database queries.

Always use relations where appropriate.

Prefer indexes on frequently queried columns.

Keep schema generic.

---

# Workflow Engine Rules

WorkflowTemplate

Defines reusable process.

Workflow

Represents a running instance.

WorkflowTemplateStep

Defines one reusable step.

WorkflowStepExecution

Tracks runtime execution.

AuditLog

Tracks every action.

Never mix template data with runtime data.

---

# AI Rules

AI should assist decision making.

AI should not bypass human approval unless explicitly allowed.

AI may

Summarize requests

Recommend approvers

Suggest urgency

Detect risks

Generate reminders

Recommend escalation

Predict bottlenecks

AI should always explain recommendations.

---

# Development Principles

Prefer reusable code.

Avoid duplication.

Build generic solutions.

Keep modules independent.

Keep functions focused.

Do not over-engineer.

---

# Current Scope

Implement

Organization

User

Workflow Template

Workflow

Approval Engine

Audit Logs

AI Recommendation Engine

Do NOT implement

JWT

RBAC

Redis

Queue Workers

Notifications

Slack

Email

Metrics

Analytics

Unless specifically requested.

---

# When Generating Code

Always

- Follow existing folder structure
- Reuse existing patterns
- Keep naming consistent
- Keep architecture consistent
- Respect separation of concerns

Never introduce a different architecture.

Never invent new folder structures.

Never move existing files.

---

# Output Expectations

Generated code should

Compile immediately.

Use existing imports.

Match project conventions.

Avoid placeholders unless requested.

Be production-quality while remaining concise.

If information is missing, make the simplest reasonable assumption rather than introducing unnecessary complexity.

---

# AI Collaboration Rules

When asked to generate code:

1. Reuse existing project patterns before creating new ones.
2. Follow the repository → service → controller → route architecture.
3. Keep implementations generic and reusable.
4. Explain any assumptions made.
5. If a requested feature conflicts with the architecture, recommend the architectural approach first, then implement it.

The goal is consistency across the entire codebase, regardless of whether code is written by a human or generated by AI.