---
id: 001
title: Fix Backend Dotenv Load Order
stage: green
date: 2026-01-23
surface: agent
model: claude-opus-4-5-20251101
feature: none
branch: 002-page-layouts
user: maira
command: /sp.implement
labels: ["backend", "dotenv", "import-error", "database"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - backend/main.py
  - backend/db.py
tests:
  - python3 -c "from main import app"
---

## Prompt

backend/routes/tasks.py ki file me dekho error aa raha hy is per
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

## Response snapshot

Diagnosed the import error in backend/routes/tasks.py.

**Root Cause**: In `main.py`, `load_dotenv()` was called AFTER importing `routes.tasks`, but `db.py` (imported by tasks.py) reads `DATABASE_URL` at module load time. The env var wasn't set yet, causing SQLAlchemy URL parse failure.

**Fixes**:
1. `backend/main.py`: Moved `load_dotenv()` to the very top, BEFORE route imports
2. `backend/db.py`: Added explicit RuntimeError when DATABASE_URL is missing (instead of empty string fallback)

Import now works: `python3 -c "from main import app"` succeeds.

## Outcome

- ✅ Impact: Fixed import error - backend can now start properly
- 🧪 Tests: `python3 -c "from main import app"` passes
- 📁 Files: 2 files modified (main.py, db.py)
- 🔁 Next prompts: None - issue resolved
- 🧠 Reflection: Always load environment variables before any imports that depend on them. Module-level code runs at import time.

## Evaluation notes (flywheel)

- Failure modes observed: Environment variables not loaded before dependent modules imported
- Graders run and results (PASS/FAIL): Manual import test PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A - fix complete
