# CLAUDE.md — Launch With AI

## Project

**Launch With AI** — Production-ready full-stack template for AI-powered SaaS applications.

| Aspect       | Stack                                                  |
| ------------ | ------------------------------------------------------ |
| **Backend**  | FastAPI, SQLModel, PostgreSQL, Celery, Redis           |
| **Frontend** | React 18, TypeScript, Chakra UI, TanStack Router/Query |
| **Linting**  | Ruff + MyPy (backend), Biome (frontend)                |
| **Deploy**   | Docker Compose, Traefik, GitHub Actions → Azure        |

Solo founder mode: optimize for shipping speed with minimum viable quality.

## Principles

- **Ship small, ship often.** PRs < 300 lines.
- **Tests for critical logic.** No 100% coverage.
- **Conventional commits always** (feat/fix/chore/docs/refactor).
- **If it can fail in production**, it needs error handling.
- **Every Claude mistake** becomes a rule below.

---

## Available Skills

### Project Skills (specific to this repo)

| Skill              | When to use                                                            |
| ------------------ | ---------------------------------------------------------------------- |
| `/launch-frontend` | Create domains, components, forms, hooks in frontend/ (DDD + TanStack) |
| `/launch-backend`  | Create modules, models, endpoints in backend/ (FastAPI + SQLModel)     |

### Global Skills (full SDLC)

| Skill           | When to use                                        |
| --------------- | -------------------------------------------------- |
| `/plan-feature` | Plan a new feature → generates docs/active-plan.md |
| `/implement`    | Implement tasks from the active plan               |
| `/test-verify`  | Test + verify build + lint                         |
| `/review-code`  | Code review before merge                           |
| `/commit-ship`  | Git commit + PR with pre-flight checks             |
| `/triage-bug`   | Diagnose and classify a bug                        |
| `/write-spec`   | Formal spec (only for features with 10+ files)     |
| `/write-docs`   | Documentation                                      |

### Business Skills

| Skill             | When to use                            |
| ----------------- | -------------------------------------- |
| `/pdp-generator`  | Quote: WBS + hour estimation + Excel   |
| `/bootstrap-repo` | Quick onboarding to a repo             |
| `/log-decision`   | Record ADR (technical decision)        |
| `/sprint-retro`   | Retrospective + continuous improvement |
| `/time-track`     | Log hours worked                       |

### Automatic Subagents

| Agent               | Role                               | Invoked when...   |
| ------------------- | ---------------------------------- | ----------------- |
| `qa-tester`         | Isolated QA (tests + build + lint) | Full verification |
| `security-reviewer` | Security audit (read-only)         | Security review   |

---

## Development Workflow

```
Simple feature (< 10 files):
/plan-feature → /implement → /test-verify → /commit-ship

Complex feature (10+ files, integrations):
/write-spec → /plan-feature @specs/... → /implement → /test-verify → /review-code → /commit-ship
```

### Daily Cycle

1. **Check current plan**: Read `docs/active-plan.md`
2. **Implement task**: `/implement` or implement directly
3. **Verify**: `/test-verify` (or manually: tests + build + lint)
4. **Ship**: `/commit-ship` (or manual commit with conventional commits)

### Quick Commands

**Backend:**

```bash
cd backend
fastapi dev app/main.py              # Dev server
./scripts/test.sh                     # Tests
./scripts/lint.sh                     # Lint (mypy + ruff)
alembic revision --autogenerate -m "msg"  # Migration
```

**Frontend:**

```bash
cd frontend
npm run dev                           # Dev server
npm run build                         # Build + type check
npm run lint                          # Biome lint
```

**Full Stack:**

```bash
docker compose watch                  # Full stack
./scripts/generate-types.sh          # Regenerate types from backend
```

---

## Architecture

### Backend (FastAPI)

```
backend/app/
├── api/v1/           # Endpoints
├── core/             # Config, DB, security
├── modules/          # Domains
│   └── [module]/
│       ├── models.py      # SQLModel
│       ├── schemas.py     # Pydantic
│       ├── repository.py  # CRUD
│       └── service.py     # Business logic
└── services/         # External integrations
```

### Frontend (React DDD)

```
frontend/src/
├── domains/          # Self-contained domains
│   └── [domain]/
│       ├── api/           # React Query hooks
│       ├── services/      # API client manual
│       ├── components/    # UI
│       ├── types/         # TypeScript types
│       └── schemas/       # Zod validation
├── shared/           # Shared components
├── routes/           # TanStack Router
└── client/           # Generated types (OpenAPI)
```

**Path Aliases:** `@domains/*`, `@shared/*`, `@/*`

---

## Key Patterns

### Database (SQLModel)

```python
id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
```

### Schemas (Pydantic)

- `Base` → shared properties
- `Create` → creation
- `Update` → optional fields
- `Public` → API response

### API Client (Frontend)

```
Backend changes → ./scripts/generate-types.sh → TypeScript flags mismatches → Update services/
```

---

## Deployment

### Git Push = Automatic Deploy

```bash
git push origin main  # GitHub Actions → Azure VM
```

### Production URLs

- Frontend: `https://dashboard.{DOMAIN}`
- API: `https://api.{DOMAIN}`
- Docs: `https://api.{DOMAIN}/docs`

### SSH to Server

```bash
ssh azureuser@<VM_IP>
cd ~/launch-with-ai
docker compose logs -f backend       # View logs
docker compose restart backend       # Restart
```

See [DEPLOYMENT-AZURE.md](DEPLOYMENT-AZURE.md) for initial setup.

---

## Current Context

| File                  | Purpose                    |
| --------------------- | -------------------------- |
| `docs/active-plan.md` | Current work plan          |
| `docs/bugs-found.md`  | Pending bugs               |
| `docs/timesheet.csv`  | Hours worked vs estimated  |
| `docs/decisions/`     | ADRs (technical decisions) |

---

## Learned Rules

<!--
Add GENERAL rules here. Specific rules go in the skills:
- Backend: .claude/skills/launch-backend.md
- Frontend: .claude/skills/launch-frontend.md
-->

- Do not use Prettier, always use Biome for frontend
- Do not modify .env in production, only locally
- Always generate types with `./scripts/generate-types.sh` after API changes
- Do not commit .env files or credentials
- Review what exists before implementing new functionality
- Always use GitHub CLI (`gh`) for GitHub operations (PRs, issues, releases, checks). Never use the web UI or raw API calls when `gh` can do it

---

## Additional Information
