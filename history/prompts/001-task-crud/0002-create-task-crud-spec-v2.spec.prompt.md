---
id: "0002"
title: "Create Task CRUD Spec V2"
stage: spec
date: 2026-01-16
surface: agent
model: claude-opus-4-5-20251101
feature: 001-task-crud
branch: 001-task-crud
user: maira
command: /sp.specify
labels: ["task-crud", "phase-1", "cli", "specification", "pdf-format"]
links:
  spec: specs/features/task-crud/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/features/task-crud/spec.md
tests:
  - null
---

## Prompt

First, ensure the following folder structure exists in the project root (create if missing):

- specs/
  - features/
    - task-crud/

Do not overwrite existing files, only create missing folders and files.

Then, create or update specs/features/task-crud/spec.md with the Task CRUD feature specification for Phase 1 (In-Memory Python Console CLI).

Follow the exact structure from hackathon PDF page 12-13 example:

# Feature: Task CRUD Operations

## User Stories
- As a user, I can ...
- ...

## Acceptance Criteria

### Create Task
- Title required (1-200 chars)
- Description optional (max 1000 chars)
- Auto-increment ID
- ...

### View Tasks
- Show ID, title, status ([x]/[ ]), created date
- ...

### Update Task
- ...

### Delete Task
- ...

### Mark as Complete
- Toggle status
- ...

Constraints for Phase 1:
- In-memory only (Python list/dict)
- Click framework for CLI
- No database, no persistence
- Python 3.13+
- Error handling: invalid ID, missing title, etc.
- Commands: add, list, update <id>, delete <id>, complete <id>

Make acceptance criteria testable and specific.
If spec.md already exists, improve it by adding missing details (e.g., command examples, error cases, output format).

Output:
1. Confirmation that folders are created/verified
2. The FULL updated spec.md content ready to save

## Response snapshot

Created simplified spec.md at `specs/features/task-crud/spec.md` following the hackathon PDF format:

- **Folder structure**: Created `specs/features/task-crud/`
- **Format**: Matches PDF pages 12-13 structure with simpler headings
- **Sections included**:
  - User Stories (5 stories)
  - Acceptance Criteria with subsections for each CRUD operation
  - Command examples with actual CLI syntax
  - Example output showing expected format
  - Error cases for each operation
  - Constraints section
  - Data Model table
  - CLI Commands Summary table
  - Out of Scope section

Key improvements over previous version:
- Includes actual command examples (`$ todo add "Buy groceries"`)
- Shows expected output format
- Documents all error cases with exact error messages
- Simpler structure matching PDF example

## Outcome

- ✅ Impact: Created spec in user-requested location with PDF-matching format
- 🧪 Tests: No tests created (spec phase)
- 📁 Files: 1 file created (specs/features/task-crud/spec.md)
- 🔁 Next prompts: `/sp.clarify` or `/sp.plan`
- 🧠 Reflection: User wanted simpler format matching hackathon PDF - delivered concise spec with practical examples

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Format matches PDF example - PASS
- Prompt variant (if applicable): User requested specific folder path and PDF format
- Next experiment (smallest change to try): Proceed to /sp.plan for implementation design
