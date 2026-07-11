# FlowPilot

> AI-powered Workflow Automation & Approval Platform

---

# Elevator Pitch

FlowPilot is an AI-powered workflow automation platform that eliminates bureaucratic delays inside organizations.

Instead of employees manually chasing approvals through emails, Slack messages, tickets and reminders, FlowPilot automatically routes requests, follows up with approvers, escalates delays, executes automatable tasks and keeps everyone informed.

Examples:

- Repository Access
- Laptop Procurement
- Leave Requests
- Expense Reimbursement
- Vendor Approval
- Procurement
- Finance Approval
- HR Requests
- IT Support
- Security Reviews

The platform is generic and supports any workflow through configurable workflow templates.

---

# Primary Goal

Build a reusable workflow engine.

AI should enhance the workflow instead of replacing it.

The workflow engine is the product.

AI is the accelerator.

---

# Tech Stack

Backend

- Node.js
- Express
- TypeScript
- Prisma
- PostgreSQL

Frontend

- Next.js
- React
- TailwindCSS

Future

- Redis
- Docker
- AI SDK
- Queue Workers

---

# Folder Structure

apps/

api/

web/

---

# Backend Structure

src/

core/

config/

database/

middleware/

logger/

errors/

modules/

organization/

user/

workflow-template/

workflow/

audit/

shared/

---

# Current Database Schema

Organization

- id
- name
- createdAt
- updatedAt

Relations

- users
- workflowTemplates
- workflows

---

User

- id
- name
- email
- organizationId
- managerId

Relations

- organization
- manager
- reports

---

WorkflowTemplate

Represents reusable workflow definitions.

Example

Repository Access

Manager Approval

IT Approval

Security Approval

Completed

Fields

- id
- name
- description
- organizationId

Relations

- steps
- workflows

---

WorkflowTemplateStep

Represents one step in a workflow template.

Example

Step 1

Manager Approval

Step 2

Finance

Step 3

IT

Fields

- order
- type
- name

---

Workflow

Represents a running workflow instance.

Fields

- id
- title
- description
- status
- createdBy
- organization
- workflowTemplate

Relations

- executions
- audit logs

---

WorkflowStepExecution

Represents runtime execution.

Tracks

- current status
- timestamps
- completion

---

AuditLog

Stores every action.

Example

Workflow Created

Approved

Rejected

Escalated

Reminder Sent

AI Suggestion

---

# Layered Architecture

Route

↓

Controller

↓

Service

↓

Repository

↓

Prisma

---

Responsibilities

Repository

Only database operations.

Never business logic.

---

Service

Business rules.

Validation.

Workflow logic.

AI integration.

---

Controller

HTTP only.

Read request.

Call service.

Return response.

---

Routes

Endpoint registration only.

---

# DTO Pattern

Example

CreateOrganizationDto

CreateUserDto

CreateWorkflowDto

ApproveWorkflowDto

UpdateWorkflowDto

---

# Current Progress

Infrastructure

✅ Project Created

✅ TypeScript

✅ Express

✅ Prisma

✅ PostgreSQL

✅ Prisma Client

✅ Database Connected

✅ Schema Pushed

Organization Module

✅ Repository

✅ Service

✅ Controller

✅ Routes

User Module

⬜ Repository

⬜ Service

⬜ Controller

⬜ Routes

Workflow Template

⬜ Pending

Workflow Engine

⬜ Pending

AI Integration

⬜ Pending

Docker

⬜ Pending

Deployment

⬜ Pending

Presentation

⬜ Pending

---

# API Roadmap

Organization

POST /organizations

GET /organizations

GET /organizations/:id

---

Users

POST /users

GET /users

GET /users/:id

---

Workflow Templates

POST /workflow-templates

GET /workflow-templates

GET /workflow-templates/:id

---

Workflow

POST /workflows

GET /workflows

GET /workflows/:id

POST /workflows/:id/approve

POST /workflows/:id/reject

POST /workflows/:id/escalate

POST /workflows/:id/remind

---

# Workflow Lifecycle

Employee creates request

↓

Workflow created

↓

Step 1 becomes ACTIVE

↓

AI analyzes request

↓

Approver receives notification

↓

Approve

↓

Next step becomes ACTIVE

↓

Repeat

↓

Workflow COMPLETED

---

# AI Features

Priority Detection

Urgency Classification

Risk Assessment

Approval Recommendation

Workflow Summary

Smart Reminder Generation

Escalation Recommendation

Approval Delay Detection

Duplicate Request Detection

Policy Suggestions

Natural Language Workflow Search

Conversation Assistant

---

# Stretch Goals

Slack Integration

Email Integration

GitHub Integration

Jira Integration

Calendar Integration

Teams Integration

WhatsApp Notifications

---

# Future Improvements

Redis

Background Workers

BullMQ

Rate Limiting

Caching

JWT Authentication

RBAC

Departments

Attachments

Comments

SLA Tracking

Analytics Dashboard

Audit Dashboard

Workflow Metrics

AI Analytics

---

# Response Format

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

---

# Coding Standards

- Feature-based architecture
- Repository pattern
- DTOs
- TypeScript strict mode
- Single responsibility
- Reusable services
- No business logic inside controllers
- No database queries inside controllers
- Keep modules independent
- Prefer composition over duplication

---

# Development Philosophy

1. Make it work.
2. Make it clean.
3. Make it reusable.
4. Make it scalable.

Ship the MVP first.

Optimize later.

---

# Remaining Work (Priority)

## High Priority

- User Module
- Workflow Template Module
- Workflow Engine
- Approval Engine
- AI Integration
- Frontend Integration
- Docker
- Deployment

## Medium Priority

- Audit Logs
- Error Middleware
- Validation
- Logging

## Low Priority

- JWT
- Redis
- Queue Workers
- Notifications
- Analytics