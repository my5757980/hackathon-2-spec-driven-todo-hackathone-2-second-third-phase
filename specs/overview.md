# Todo App Overview

> **Hackathon II - Evolution of Todo: Spec-Driven Development**

## Purpose

A Todo application that evolves through 5 phases—from a simple Python CLI to a cloud-native deployment with Dapr and Kafka—demonstrating strict Spec-Driven Development where all code is generated from refined specifications (no manual coding).

## Current Phase

**Phase 1: In-Memory Python Console App** (In Progress)

Building the foundation with core task management via CLI. All features implemented through `/sp.specify` → `/sp.plan` → `/sp.implement` workflow.

## Tech Stack

### Phase 1 (Current)
- **Runtime**: Python 3.13+
- **CLI Framework**: Click
- **Storage**: In-memory (list/dict)

### Phase 2 (Planned)
- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI, SQLModel
- **Database**: Neon PostgreSQL
- **Auth**: Better Auth + JWT

### Phase 3 (Planned)
- **AI**: OpenAI Agents SDK, ChatKit
- **Integration**: Official MCP SDK

### Phase 4 (Planned)
- **Containerization**: Docker
- **Orchestration**: Minikube, Helm Charts
- **AI Ops**: kubectl-ai/kagent

### Phase 5 (Planned)
- **Platform**: DigitalOcean DOKS
- **Middleware**: Dapr (Pub/Sub, State, Bindings, Secrets)
- **Streaming**: Kafka (Redpanda Cloud)

## Features

### Basic Level (Phase 1)
- [ ] Add new task
- [ ] View all tasks
- [ ] Update task details
- [ ] Delete task
- [ ] Mark task complete/incomplete
- [ ] Task priorities
- [ ] Search tasks
- [ ] Sort tasks

### Intermediate Level (Phase 2)
- [ ] User authentication (JWT)
- [ ] Task tags/categories
- [ ] Advanced filtering
- [ ] Web UI with responsive design

### Advanced Level (Phase 3+)
- [ ] Recurring tasks
- [ ] Due dates with reminders
- [ ] AI-powered chatbot interface
- [ ] Natural language task creation

### Deployment (Phase 4-5)
- [ ] Docker containerization
- [ ] Kubernetes deployment (Minikube)
- [ ] Helm chart packaging
- [ ] Cloud-native with Dapr
- [ ] Event-driven architecture (Kafka)

## Spec-Driven Approach

All development follows strict SDD principles:

1. **No manual code** — Every feature generated from `@specs/`
2. **Traceability** — All commits reference source specs
3. **Iterative refinement** — Specs refined until output meets acceptance criteria
4. **Constitution-governed** — See `.specify/memory/constitution.md` v1.1.0

## Project Structure

```
todo-app/
├── .specify/           # SpecKit Plus templates & scripts
├── .spec-kit/          # Project configuration
├── specs/              # Feature specifications
│   ├── overview.md     # This file
│   └── features/       # Feature specs (task-crud, auth, etc.)
├── history/
│   ├── prompts/        # Prompt History Records
│   └── adr/            # Architecture Decision Records
├── src/                # Generated source code
├── CLAUDE.md           # Agent instructions
└── README.md           # Setup & usage
```

## Progress Tracking

| Phase | Status | Key Milestone |
|-------|--------|---------------|
| Phase 1 | In Progress | CLI with full CRUD |
| Phase 2 | Planned | Web app with auth |
| Phase 3 | Planned | AI chatbot integration |
| Phase 4 | Planned | Local K8s deployment |
| Phase 5 | Planned | Cloud-native with Dapr |

---

*Last updated: 2026-01-16 | Constitution v1.1.0*
