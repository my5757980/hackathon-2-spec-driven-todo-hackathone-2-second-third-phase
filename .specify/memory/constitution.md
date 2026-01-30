<!--
  SYNC IMPACT REPORT
  ==================
  Version change: 1.0.0 → 1.1.0 (measurable standards update)

  Modified Principles:
  - II. Iterative Refinement: "perfect output" → "meets acceptance criteria"
  - III. Reusability & Modularity: Added measurable interface contract rules
  - VI. Clean & Testable Code: Quantified diff limits, added coverage targets
  - VII. Security & Best Practices: Added specific security checklist items

  Added Sections:
  - IX. Performance & Scalability (NEW)
  - X. Error Handling & Observability (NEW)
  - Testing Standards (expanded with coverage targets)
  - Code Review Checklist (new)
  - Verification Commands (new)

  Removed Sections: None

  Templates Consistency:
  - plan-template.md: ✅ Compatible (Constitution Check updated)
  - spec-template.md: ✅ Compatible (acceptance criteria align)
  - tasks-template.md: ✅ Compatible (testing requirements align)

  Follow-up TODOs: None
-->

# Todo-app Constitution

> **Hackathon II - Spec-Driven Development: Evolution of Todo**
>
> This constitution defines the non-negotiable principles, standards, and constraints for the Todo-app project across all 5 phases: CLI → Full-Stack Web → AI Chatbot → Local K8s → Cloud-Native.

## Core Principles

### I. Spec-Driven Development (SDD)

All implementation MUST originate from refined specifications via Claude Code. Manual code writing is prohibited for business logic.

- **No manual code**: All business logic MUST be generated from a spec file
- **Exceptions allowed**: Configuration files (`pyproject.toml`, `package.json`, `.env.example`) may be manually created
- **Spec authority**: Specifications in `specs/` are the single source of truth for implementation
- **Refinement loop**: If output is incorrect, refine the spec—never edit generated code directly
- **Verification**: All generated code MUST include header comment: `# Generated from @specs/<path>/spec.md`

**Testable**: Run `grep -r "Generated from @specs" src/` — all `.py`/`.ts` files in `src/` must match.

**Rationale**: Ensures reproducibility, eliminates human coding errors, and provides full audit trail for hackathon judges.

### II. Iterative Refinement

Specifications, plans, and tasks MUST be refined iteratively until output meets acceptance criteria.

- **Acceptance threshold**: Output is acceptable when ALL Given/When/Then scenarios pass
- **Max refinement cycles**: If >5 refinement cycles needed, escalate to spec review (likely ambiguous requirements)
- **Feedback format**: Each refinement MUST document: `[Cycle N] Issue: X → Fix: Y`
- **Version tracking**: Spec files MUST use git history; major revisions noted in spec header

**Testable**: Check `history/prompts/<feature>/` has refinement records; acceptance scenarios in spec have pass/fail status.

**Rationale**: Prevents endless refinement loops; acceptance criteria provide clear "done" definition.

### III. Reusability & Modularity

Features MUST be designed for reuse across all phases (CLI → Web → Chatbot → K8s → Cloud).

- **Phase-agnostic core**: Business logic in `src/core/` or `src/services/` — zero imports from presentation layer
- **Interface contracts**: Every service MUST expose a typed interface (Python: Protocol/ABC, TypeScript: interface)
- **Shared schemas**: Data models defined once in `src/models/`; imported by all consumers
- **Coupling limit**: No module may import from >5 other internal modules (excluding stdlib/deps)
- **Blueprint identification**: Document reusable patterns in `specs/blueprints/` when discovered

**Testable**: Run static analysis — `src/core/` has no imports from `src/cli/`, `src/api/`, or `src/ui/`.

**Rationale**: Reduces rework across phases; enables bonus points for reusable intelligence.

### IV. Phase-wise Progression

Each phase MUST build directly on the previous one without breaking existing functionality.

- **Additive only**: New phases extend functionality; they MUST NOT remove or break existing features
- **Regression gate**: Phase N acceptance tests MUST pass before Phase N+1 begins
- **Backward compatibility**: Phase N code MUST work with Phase N-1 interfaces (if applicable)
- **Incremental delivery**: Each phase MUST be independently deployable and demonstrable
- **No phase skipping**: Phases MUST be completed in order (1 → 2 → 3 → 4 → 5)

**Phase Roadmap**:

| Phase | Description | Key Features | Acceptance Gate |
|-------|-------------|--------------|-----------------|
| 1 | Python CLI | task-crud, priorities, search, sorting, recurring, due dates, reminders | All CLI commands work; manual test script passes |
| 2 | Full-Stack Web | + authentication, Next.js frontend, FastAPI backend | Phase 1 tests + API contract tests + auth flow works |
| 3 | AI Chatbot | + OpenAI Agents SDK, MCP integration | Phase 2 tests + chatbot responds to 5 core intents |
| 4 | Local K8s | + Docker, Minikube, Helm charts | Phase 3 tests + `helm install` succeeds + pods healthy |
| 5 | Cloud-Native | + Dapr, Kafka, DigitalOcean DOKS | Phase 4 tests + events flow through Kafka + cloud deploy works |

**Testable**: Each phase has explicit acceptance gate that must pass.

**Rationale**: Demonstrates evolution capability; ensures stable checkpoints for judges.

### V. Traceability

Every code change MUST be traceable to a spec file, plan, and task.

- **Spec reference**: All commits MUST reference source spec in message
- **Commit format**: `feat(phase1): implement <feature> via /sp.implement from @specs/features/<name>/spec.md`
- **PHR threshold**: Create PHR for: implementation work, planning, debugging >15 min, spec creation
- **ADR threshold**: Suggest ADR when decision affects >2 phases or involves technology choice

**Testable**: `git log --oneline | grep -E "^[a-f0-9]+ (feat|fix|docs)\(phase[1-5]\):"` — all feature commits match pattern.

**Rationale**: Provides complete audit trail; demonstrates SDD compliance to judges.

### VI. Clean & Testable Code

Code MUST be clean, incremental, and verifiably tested.

**Diff Limits (per commit)**:
- Lines changed: ≤200 (excluding generated files, lock files)
- Files touched: ≤5 (unless refactoring task explicitly noted)
- Single purpose: One logical change per commit

**Code Quality Gates**:
- Python: `ruff check` passes with 0 errors; `ruff format --check` passes
- TypeScript: `eslint` passes with 0 errors; `prettier --check` passes
- No unused imports (enforced by linter)
- No `# type: ignore` without adjacent comment explaining why

**Testing Requirements**:

| Phase | Requirement | Verification |
|-------|-------------|--------------|
| 1 | Manual test script covering all CLI commands | `tests/manual/phase1-checklist.md` with checkboxes |
| 2 | ≥70% coverage for `src/services/`; 100% API contract tests | `pytest --cov` report; all endpoints in `tests/contract/` |
| 3 | Chatbot intent tests for 5 core operations | `tests/integration/test_chatbot_intents.py` |
| 4 | Helm chart lint passes; pod health checks | `helm lint`; `kubectl get pods` shows Ready |
| 5 | Event flow integration test | `tests/integration/test_event_flow.py` |

**Testable**: CI pipeline enforces all gates; coverage reports in PR.

**Rationale**: Quantified limits prevent scope creep; measurable quality gates.

### VII. Security & Best Practices

Security requirements escalate by phase with specific checklist items.

**Phase 1 (CLI)**: Minimal security
- [ ] No secrets in code (grep for API keys, passwords)
- [ ] Input validation for task titles (≤200 chars, no control characters)

**Phase 2+ (Web)**: Authentication required
- [ ] JWT tokens with ≤24h expiry
- [ ] Passwords hashed with bcrypt (cost factor ≥10)
- [ ] CORS configured for specific origins only
- [ ] No secrets in client-side code (check bundle)
- [ ] SQL injection prevention (parameterized queries via SQLModel)
- [ ] XSS prevention (React escapes by default; no `dangerouslySetInnerHTML`)

**Phase 3+ (Chatbot)**: Stateless & rate-limited
- [ ] No session state stored in chatbot service
- [ ] Rate limiting: ≤60 requests/minute per user
- [ ] Input sanitization before sending to OpenAI

**Phase 5 (Cloud)**: Secrets management
- [ ] All secrets via Dapr Secrets component
- [ ] No `.env` files in container images
- [ ] Network policies restrict pod-to-pod communication

**Testable**: Security checklist in `specs/features/<name>/spec.md`; CI runs `bandit` (Python) or equivalent.

**Rationale**: Progressive security matches phase complexity; checklist ensures nothing missed.

### VIII. Documentation-First

All features MUST be documented before implementation with specific quality gates.

**Spec Requirements**:
- ≥1 user story per feature with Given/When/Then format
- All user stories have priority (P1/P2/P3)
- Acceptance criteria are binary (pass/fail, not subjective)
- Edge cases section with ≥3 scenarios

**README Requirements (per phase)**:
- Prerequisites with exact versions
- Setup commands (copy-paste ready)
- Usage examples for each feature
- Troubleshooting section with ≥3 common issues

**Demo Readiness**:
- Demo script in `docs/demo-phase-N.md`
- Estimated duration ≤90 seconds
- Key talking points marked

**Testable**: Spec template validation script checks all required sections present.

**Rationale**: Documentation drives implementation; ensures demo-ready deliverables.

### IX. Performance & Scalability

Measurable performance budgets per phase.

| Metric | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Phase 5 |
|--------|---------|---------|---------|---------|---------|
| CLI response | <500ms | N/A | N/A | N/A | N/A |
| API p95 latency | N/A | <500ms | <500ms | <1s | <500ms |
| Chatbot response | N/A | N/A | <5s (incl. LLM) | <5s | <5s |
| Container startup | N/A | N/A | N/A | <30s | <30s |
| Event processing | N/A | N/A | N/A | N/A | <100ms/msg |
| Memory per pod | N/A | N/A | N/A | <512MB | <512MB |
| Concurrent users | 1 | 100 | 50 | 100 | 1000 |

**Testable**: Load tests in `tests/performance/`; CI runs on Phase 2+ merges to main.

**Rationale**: Prevents performance debt; cloud costs stay manageable.

### X. Error Handling & Observability

Structured error handling and logging requirements.

**Error Handling**:
- All errors MUST have unique error code: `ERR_<MODULE>_<NUMBER>` (e.g., `ERR_TASK_001`)
- User-facing errors MUST be human-readable (no stack traces in production)
- API errors follow RFC 7807 Problem Details format
- CLI errors print to stderr with exit code >0

**Logging Standards**:

| Phase | Requirement |
|-------|-------------|
| 1 | Print to stderr for errors; `--verbose` flag for debug |
| 2+ | Structured JSON logs with: timestamp, level, message, request_id |
| 4+ | Logs to stdout (container best practice); no file logging |
| 5 | Correlation ID propagated through Dapr calls |

**Observability (Phase 4+)**:
- Health endpoint: `/health` returns 200 with `{"status": "ok"}`
- Readiness endpoint: `/ready` checks DB connection
- Metrics endpoint: `/metrics` (Prometheus format) for Phase 5

**Testable**: Error codes documented in `docs/error-codes.md`; logging format validated in tests.

**Rationale**: Debuggable systems; production-ready observability.

## Key Standards

### Specification Format

All specs MUST be Markdown files with these required sections:

```markdown
# Feature Specification: [FEATURE NAME]

## User Scenarios & Testing (mandatory)
- ≥1 user story with Given/When/Then
- Priority assigned (P1/P2/P3)
- ≥3 edge cases

## Requirements (mandatory)
- Functional: FR-001, FR-002, etc.
- Non-functional with measurable targets

## Success Criteria (mandatory)
- Binary pass/fail criteria
- Verification method specified
```

### Cross-Referencing

- Always use `@specs/path/to/file.md` for spec references
- Link related specs, plans, and tasks explicitly
- Reference constitution principles by number (e.g., "per Principle III")

### Commit Message Format

```
<type>(phase<N>): <description> from @specs/<path>/spec.md

Types: feat, fix, docs, test, refactor, chore
Examples:
feat(phase1): implement task-crud via /sp.implement from @specs/features/task-crud/spec.md
fix(phase2): resolve auth token expiry from @specs/features/authentication/spec.md
test(phase2): add contract tests for /api/tasks endpoint
```

### PHR & ADR Requirements

**PHR (Prompt History Record)** — Create when:
- Any implementation work (code changes)
- Planning/architecture discussion >10 minutes
- Debugging session >15 minutes
- Spec/task/plan creation or major revision

**ADR (Architecture Decision Record)** — Suggest when:
- Decision affects >2 phases
- Technology/framework choice made
- Data model design that's hard to change
- Security architecture decision

### Code Review Checklist

Every PR MUST verify:
- [ ] Spec reference in commit message
- [ ] Diff within limits (≤200 lines, ≤5 files)
- [ ] Tests added/updated for changes
- [ ] Linter passes (0 errors)
- [ ] No secrets in code
- [ ] Constitution principles not violated

### Bonus Focus

Actively identify and suggest:
- Reusable intelligence (subagents, blueprints) — document in `specs/blueprints/`
- Multi-language support (Urdu) — i18n patterns
- Voice command integration — speech-to-intent patterns
- Patterns that could benefit other hackathon participants

## Technology Constraints

Technology choices are fixed per hackathon requirements:

| Phase | Required Technologies |
|-------|----------------------|
| **Phase 1** | Python 3.13+, Click CLI framework, in-memory storage (list/dict) |
| **Phase 2** | Next.js 16+ (App Router), TypeScript 5+, Tailwind CSS, Shadcn UI, FastAPI, SQLModel, Neon PostgreSQL, Better Auth + JWT |
| **Phase 3** | OpenAI Agents SDK, Official MCP SDK, ChatKit |
| **Phase 4** | Docker, Minikube, Helm Charts 3+, kubectl-ai/kagent |
| **Phase 5** | Dapr 1.12+, Kafka (Redpanda Cloud), DigitalOcean DOKS |

### Deliverables Per Phase

Each phase submission MUST include:

| Deliverable | Verification |
|-------------|--------------|
| Constitution (if changed) | `.specify/memory/constitution.md` exists and version updated |
| Feature specs | `specs/features/<name>/spec.md` for each feature |
| Prompt history | `history/prompts/` has PHRs for phase work |
| Working code | `src/` compiles/runs without errors |
| README | Setup instructions tested on clean environment |
| CLAUDE.md | Current phase and focus updated |
| Demo video | ≤90 seconds, covers key features |

### Verification Commands

```bash
# Phase 1 verification
python -m todo --help                    # CLI works
python -m pytest tests/                  # Tests pass (if any)
ruff check src/                          # Linter passes

# Phase 2 verification
npm run build                            # Frontend builds
uvicorn api.main:app --port 8000        # Backend starts
pytest --cov=src/services               # ≥70% coverage

# Phase 4 verification
docker build -t todo-app .              # Image builds
helm lint charts/todo-app               # Helm valid
minikube start && helm install todo ./charts/todo-app  # Deploys

# Phase 5 verification
dapr run --app-id todo -- python main.py  # Dapr sidecar works
```

## Governance

### Amendment Process

1. Propose amendment with rationale and impact assessment
2. Document which specs/code affected
3. Update constitution version following semver:
   - **MAJOR**: Principle removal or incompatible redefinition
   - **MINOR**: New principle or materially expanded guidance
   - **PATCH**: Clarifications, wording, typo fixes
4. Update Sync Impact Report at top of file
5. Propagate changes to dependent templates within same PR

### Compliance Verification

Automated checks (CI):
- Commit message format validation
- Linter/formatter checks
- Test coverage thresholds
- Diff size limits

Manual checks (code review):
- Spec traceability verified
- Constitution principles not violated
- Security checklist completed (Phase 2+)

### Runtime Guidance

| Resource | Purpose |
|----------|---------|
| `CLAUDE.md` | Agent-specific instructions and current context |
| `specs/` | Feature specifications |
| `history/prompts/` | Prompt history for learning |
| `history/adr/` | Architectural decision records |
| `docs/error-codes.md` | Error code reference |

### Success Criteria

The project succeeds when ALL are true:

| Criterion | Verification |
|-----------|--------------|
| All 5 phases implemented in order | Git history shows phase progression |
| No manual business logic code | `grep "Generated from @specs" src/` matches all service files |
| Constitution exists | This file present and version ≥1.0.0 |
| Specs exist for every feature | `specs/features/*/spec.md` for each feature in config |
| Working app at each phase | Phase acceptance gates documented as passed |
| Full traceability | All feat commits reference `@specs/` |
| Clean monorepo | Single repo, organized per structure in plan |
| Bonus features documented | `specs/blueprints/` or `specs/bonus/` if attempted |

**Version**: 1.1.0 | **Ratified**: 2026-01-16 | **Last Amended**: 2026-01-16
