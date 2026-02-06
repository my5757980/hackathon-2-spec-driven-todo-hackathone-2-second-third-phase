# Todo App - Hackathon II

> **Spec-Driven Development: Evolution of Todo**

A full-stack Todo application with AI-powered chatbot interface, evolving through multiple phases from CLI to cloud-native deployment.

## Current Phase: Phase III - AI Chatbot

Building an AI-powered conversational interface for task management using natural language.

## Features

### Phase I - CLI (Completed)
- Add, view, update, delete tasks
- Mark tasks complete/incomplete
- Task priorities (P1/P2/P3)
- Search and sort tasks
- Recurring tasks with due dates

### Phase II - Full-Stack Web (Completed)
- Next.js 16+ frontend with App Router
- FastAPI backend with SQLModel
- Neon PostgreSQL database
- Better Auth + JWT authentication
- Responsive dark-theme UI with Shadcn

### Phase III - AI Chatbot (Current)
- Natural language task management
- OpenAI Agents SDK with Google Gemini
- MCP tools for task operations
- Premium ChatKit UI with glassmorphism
- Real-time sync between chatbot and dashboard

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | Next.js 16+, TypeScript, Tailwind CSS, Shadcn UI |
| Backend | FastAPI, SQLModel, Python 3.13+ |
| Database | Neon PostgreSQL |
| Auth | Better Auth + JWT |
| AI | OpenAI Agents SDK, Google Gemini (gemini-2.0-flash) |
| Tools | Official MCP SDK |

## Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+
- Neon PostgreSQL account
- Google Gemini API key (free)

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your credentials:
# - DATABASE_URL (Neon PostgreSQL)
# - BETTER_AUTH_SECRET
# - GEMINI_API_KEY

# Run server
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with:
# - NEXT_PUBLIC_API_URL=http://localhost:8000

# Run development server
npm run dev
```

### Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Create a new API key (free)
3. Add to `backend/.env` as `GEMINI_API_KEY`

## Project Structure

```
todo-app/
├── backend/                 # FastAPI backend
│   ├── agent/              # AI agent with Gemini
│   ├── mcp/                # MCP tools (add, list, complete, delete, update)
│   ├── models/             # SQLModel database models
│   ├── routes/             # API endpoints
│   └── services/           # Business logic
├── frontend/               # Next.js frontend
│   ├── app/                # App Router pages
│   ├── components/         # React components
│   │   ├── chat/          # ChatKit components
│   │   ├── features/      # Feature components
│   │   └── ui/            # Shadcn UI components
│   └── lib/               # Utilities and clients
├── src/                    # CLI source (Phase I)
├── specs/                  # Feature specifications
│   └── features/          # Feature-specific specs
└── history/               # PHRs and ADRs
```

## Chatbot Commands

The AI chatbot understands natural language. Examples:

| Intent | Example Commands |
|--------|-----------------|
| Add task | "Add a task to buy groceries", "Create a new task: finish report" |
| List tasks | "Show my tasks", "What are my todos?" |
| Complete task | "Mark buy groceries as done", "I finished the report" |
| Delete task | "Delete the groceries task", "Remove call mom from my list" |
| Update task | "Rename buy groceries to buy organic groceries" |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/{user_id}/chat` | Send chat message |
| GET | `/api/{user_id}/tasks` | List user tasks |
| POST | `/api/{user_id}/tasks` | Create task |
| PATCH | `/api/{user_id}/tasks/{id}` | Update task |
| DELETE | `/api/{user_id}/tasks/{id}` | Delete task |

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://...@neon.tech/...
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:8000
GEMINI_API_KEY=your-gemini-api-key
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Development

### Spec-Driven Workflow

This project follows strict Spec-Driven Development:

1. `/sp.specify` - Create feature specification
2. `/sp.plan` - Generate implementation plan
3. `/sp.tasks` - Generate task breakdown
4. `/sp.implement` - Execute implementation

All code is generated from specifications in `specs/`.

### Running Tests

```bash
# Backend tests
cd backend
pytest

# Manual chatbot tests
# See tests/manual/phase3-chatbot-checklist.md
```

## License

MIT

---

*Hackathon II - Panaversity | Spec-Driven Development*
"# hackathon-2-spec-driven-todo-hackathone-2-second-third-phase" 
