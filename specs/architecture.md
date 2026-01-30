# System Architecture - Todo-app

> **Hackathon II - Evolution of Todo: Spec-Driven Development**

## Overview

The Todo-app architecture evolves through 5 distinct phases—from a simple in-memory Python CLI to a cloud-native, event-driven microservices platform. Each phase builds on the previous, demonstrating progressive complexity while maintaining backward compatibility. All code is generated from specifications using strict Spec-Driven Development (SDD).

## High-Level Components

| Component | Phase Introduced | Purpose |
|-----------|------------------|---------|
| CLI (Click) | Phase 1 | User interaction via terminal |
| Task Service | Phase 1 | Core business logic (reusable across all phases) |
| Next.js Frontend | Phase 2 | Web-based UI |
| FastAPI Backend | Phase 2 | REST API layer |
| Neon PostgreSQL | Phase 2 | Persistent storage |
| Better Auth + JWT | Phase 2 | Authentication |
| OpenAI Agents SDK | Phase 3 | AI-powered chatbot |
| MCP Server | Phase 3 | Tool integration for AI |
| Docker/Helm | Phase 4 | Containerization & orchestration |
| Dapr Sidecars | Phase 5 | Pub/Sub, State, Secrets management |
| Kafka (Redpanda) | Phase 5 | Event streaming |

## Phase-Wise Architecture Evolution

### Phase 1: In-Memory Console CLI

```
┌─────────────────────────────────────────────────┐
│                    USER                          │
│                      │                           │
│                      ▼                           │
│              ┌──────────────┐                    │
│              │   Click CLI   │                   │
│              └──────┬───────┘                    │
│                     │                            │
│                     ▼                            │
│              ┌──────────────┐                    │
│              │ Task Service  │ ◄── Reusable Core │
│              └──────┬───────┘                    │
│                     │                            │
│                     ▼                            │
│              ┌──────────────┐                    │
│              │  In-Memory   │                    │
│              │  List/Dict   │                    │
│              └──────────────┘                    │
└─────────────────────────────────────────────────┘
```

- **Runtime**: Python 3.13+ with Click framework
- **Storage**: In-memory list/dict (non-persistent)
- **Data Flow**: `User Input → CLI Commands → Task Service → Memory`

---

### Phase 2: Full-Stack Web Application

```
┌────────────────────────────────────────────────────────────────┐
│                         BROWSER                                 │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   Next.js Frontend                        │  │
│  │           (App Router + TypeScript + Tailwind)            │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │ REST + JWT                          │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    FastAPI Backend                        │  │
│  │              ┌──────────────────────┐                     │  │
│  │              │    Task Service      │ ◄── Same Core       │  │
│  │              └──────────────────────┘                     │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │ SQLModel                            │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │               Neon PostgreSQL (Serverless)                │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

- **Frontend**: Next.js 16+ (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: FastAPI + SQLModel
- **Database**: Neon PostgreSQL (serverless)
- **Auth**: Better Auth → JWT tokens → Backend verification
- **Data Flow**: `Browser → Next.js → API (JWT) → FastAPI → Task Service → Neon DB`

---

### Phase 3: AI-Powered Chatbot

```
┌────────────────────────────────────────────────────────────────┐
│                      USER (Chat UI)                             │
│                            │                                    │
│                            ▼                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                  OpenAI ChatKit UI                        │  │
│  └────────────────────────┬─────────────────────────────────┘  │
│                           │ User Message                        │
│                           ▼                                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   FastAPI + MCP Server                    │  │
│  │  ┌────────────────┐    ┌────────────────────────────┐    │  │
│  │  │ OpenAI Agents  │◄──►│      MCP Tools             │    │  │
│  │  │     SDK        │    │  add_task, list_tasks,     │    │  │
│  │  └────────────────┘    │  complete_task, delete...  │    │  │
│  │                        └─────────────┬──────────────┘    │  │
│  └──────────────────────────────────────┼───────────────────┘  │
│                                         │                       │
│                                         ▼                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Task Service + Neon PostgreSQL               │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

- **Frontend**: OpenAI ChatKit UI
- **AI Layer**: OpenAI Agents SDK + Official MCP SDK
- **Tools**: MCP tools exposing task operations
- **Design**: Stateless chatbot (no session state in service)
- **Data Flow**: `User Message → ChatKit → FastAPI → Agent → MCP Tools → Task Service → DB → Response`

---

### Phase 4: Local Kubernetes Deployment

```
┌────────────────────────────────────────────────────────────────┐
│                        MINIKUBE CLUSTER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      HELM CHART                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │  │
│  │  │  Frontend   │  │  Backend    │  │    Database     │   │  │
│  │  │    Pod      │  │    Pod      │  │      Pod        │   │  │
│  │  │  (Next.js)  │  │  (FastAPI)  │  │  (PostgreSQL)   │   │  │
│  │  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘   │  │
│  │         │                │                   │            │  │
│  │         └────────────────┼───────────────────┘            │  │
│  │                          │                                │  │
│  │                   ┌──────┴──────┐                         │  │
│  │                   │  Ingress    │                         │  │
│  │                   │  Controller │                         │  │
│  │                   └─────────────┘                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              kubectl-ai / kagent (AI Ops)                 │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```

- **Containerization**: Docker multi-stage builds
- **Orchestration**: Minikube + Helm Charts 3+
- **AI Ops**: kubectl-ai/kagent for cluster management
- **Health**: Readiness/Liveness probes on all pods
- **Data Flow**: `Ingress → Pod Services → Inter-pod communication`

---

### Phase 5: Advanced Cloud Deployment

```
┌──────────────────────────────────────────────────────────────────────┐
│                    DIGITALOCEAN DOKS CLUSTER                          │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                                                                 │  │
│  │  ┌─────────────────┐    ┌─────────────────┐                    │  │
│  │  │   Frontend Pod  │    │   Backend Pod   │                    │  │
│  │  │   ┌─────────┐   │    │   ┌─────────┐   │                    │  │
│  │  │   │  Dapr   │   │    │   │  Dapr   │   │                    │  │
│  │  │   │ Sidecar │   │    │   │ Sidecar │   │                    │  │
│  │  │   └────┬────┘   │    │   └────┬────┘   │                    │  │
│  │  └────────┼────────┘    └────────┼────────┘                    │  │
│  │           │                      │                              │  │
│  │           └──────────┬───────────┘                              │  │
│  │                      │ Pub/Sub                                  │  │
│  │                      ▼                                          │  │
│  │  ┌──────────────────────────────────────────────────────────┐  │  │
│  │  │              KAFKA (Redpanda Cloud)                       │  │  │
│  │  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────┐  │  │  │
│  │  │  │ task-events  │ │  reminders   │ │   task-updates   │  │  │  │
│  │  │  │    topic     │ │    topic     │ │      topic       │  │  │  │
│  │  │  └──────┬───────┘ └──────┬───────┘ └────────┬─────────┘  │  │  │
│  │  └─────────┼────────────────┼──────────────────┼────────────┘  │  │
│  │            │                │                  │                │  │
│  │            ▼                ▼                  ▼                │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐      │  │
│  │  │   Audit      │  │  Reminder    │  │    Recurring     │      │  │
│  │  │  Consumer    │  │  Consumer    │  │    Consumer      │      │  │
│  │  └──────────────┘  └──────────────┘  └──────────────────┘      │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │                 DAPR COMPONENTS                                 │  │
│  │  • Pub/Sub: Kafka binding                                       │  │
│  │  • State: Redis/PostgreSQL                                      │  │
│  │  • Secrets: DO Secrets Manager                                  │  │
│  │  • Bindings: External triggers                                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

- **Platform**: DigitalOcean Kubernetes (DOKS)
- **Middleware**: Dapr sidecars (Pub/Sub, State, Bindings, Secrets)
- **Streaming**: Kafka (Redpanda Cloud)
- **Topics**: `task-events`, `reminders`, `task-updates`
- **Consumers**: Audit logging, Reminder notifications, Recurring task scheduler
- **Data Flow**: `Event-driven microservices → Dapr → Kafka → Consumers`

---

## Key Design Decisions

| Decision | Rationale |
|----------|-----------|
| **Monorepo Structure** | Single context for Claude Code; easier spec traceability |
| **Spec-Driven Development** | All code from `@specs/`; no manual coding; full audit trail |
| **Reusable Task Service** | Core business logic separated from presentation; works across CLI, API, Chatbot |
| **Stateless Chatbot (Phase 3)** | Horizontal scalability; no session affinity required |
| **Event-Driven (Phase 5)** | Decoupled services; async processing for reminders/recurring tasks |
| **Dapr Sidecar Pattern** | Portable across clouds; built-in service discovery, Pub/Sub, secrets |

## Non-Functional Aspects

| Aspect | Phase 1-3 | Phase 4-5 |
|--------|-----------|-----------|
| **Scalability** | Single instance | Horizontal via K8s HPA |
| **Security** | Basic auth (Phase 2 JWT) | Dapr Secrets + Network Policies |
| **Observability** | Console logging | Structured logs + Prometheus metrics |
| **Availability** | N/A | Readiness/Liveness probes; multi-replica |
| **Performance** | <500ms CLI | <500ms API p95; <5s chatbot |

## Architecture Evolution Summary

```
Phase 1          Phase 2           Phase 3          Phase 4           Phase 5
─────────────────────────────────────────────────────────────────────────────►

  CLI           + Web App         + AI Chatbot     + Kubernetes      + Cloud-Native
   │               │                   │                │                  │
   ▼               ▼                   ▼                ▼                  ▼
In-Memory    → PostgreSQL     → + MCP Tools    → Containerized   → Event-Driven
                 + JWT              + Agents         + Helm            + Dapr
                                                                       + Kafka
```

---

*Constitution Reference*: See `.specify/memory/constitution.md` v1.1.0 for design principles and constraints.

*Last updated: 2026-01-16*
