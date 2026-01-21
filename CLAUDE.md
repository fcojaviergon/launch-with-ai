# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Backend (Python FastAPI)
```bash
# From backend/ directory
cd backend

# Development server
fastapi dev app/main.py

# Run tests with coverage
./scripts/test.sh

# Lint and format
./scripts/lint.sh
# Or individually:
mypy app
ruff check app
ruff format app --check

# Format code
ruff format app
```

### Frontend (React TypeScript)
```bash
# From frontend/ directory
cd frontend

# Development server
npm run dev

# Build for production
npm run build

# Lint and format (Biome)
npm run lint

# Type check
npm run build  # Runs tsc + vite build
```

### Full Stack Development
```bash
# Start entire stack with Docker Compose
docker compose watch

# Individual services
docker compose stop frontend  # Stop frontend to run locally
docker compose stop backend   # Stop backend to run locally
```

## Project Architecture

This is a full-stack GenAI SaaS application built with FastAPI backend and React frontend.

### Backend Architecture
- **FastAPI** with Python 3.10+ using modern async/await patterns
- **SQLModel** for database ORM with PostgreSQL
- **Pydantic** for data validation and settings
- **JWT** authentication with secure password hashing
- **Alembic** for database migrations
- **Module-based architecture** with clear separation of concerns

Backend follows a structured module pattern:
```
app/
├── api/v1/           # API endpoints and dependencies
├── core/             # Configuration, database, security
├── modules/          # Domain modules (users, items, analysis, chat)
│   └── [module]/
│       ├── models.py     # SQLModel database models
│       ├── schemas.py    # Pydantic API schemas
│       ├── repository.py # Database operations
│       └── service.py    # Business logic
├── services/         # External service integrations (OpenAI, vector store)
└── tests/           # Unit and integration tests
```

### Frontend Architecture
- **React 18** with TypeScript and modern hooks
- **Chakra UI** for component library
- **TanStack Router** for file-based routing
- **TanStack Query** for data fetching and caching
- **React Hook Form** for form management
- **Domain-Driven Design (DDD)** architecture organizing code by business domains
- **Hybrid API client strategy**: Types auto-generated from OpenAPI, services manual per domain

Frontend follows a **domain-based structure** where each domain is self-contained:
```
frontend/src/
├── domains/          # Business domains (self-contained)
│   ├── auth/        # Authentication & authorization
│   │   ├── api/         # React Query hooks
│   │   ├── components/  # Domain UI components
│   │   ├── services/    # API client (manually created, domain-specific)
│   │   ├── types/       # TypeScript types
│   │   ├── schemas/     # Zod validation
│   │   ├── hooks/       # Domain hooks
│   │   └── index.ts     # Public API
│   ├── users/       # User profile management
│   ├── items/       # Items CRUD
│   ├── chat/        # Chat & conversations
│   └── admin/       # Admin user management
├── shared/          # Shared across domains
│   ├── components/  # Reusable UI components
│   ├── hooks/       # Global hooks
│   └── utils/       # Utilities (validation, errors)
├── routes/          # TanStack Router routes
├── client/          # OpenAPI generated types & infrastructure
└── theme/           # Chakra UI theme
```

**Path Aliases:**
- `@/*` → `src/*`
- `@domains/*` → `src/domains/*`
- `@shared/*` → `src/shared/*`

### Key Features
- **Analysis Module**: Document analysis with OpenAI integration, embedding tasks, and evaluation workflows
- **Chat Module**: Real-time chat functionality with AI integration
- **User Management**: JWT-based authentication with role-based access
- **Vector Store**: Document embeddings and similarity search
- **Async Task Processing**: Celery with Redis for background tasks

## Database Patterns

### Model Definition
```python
# Use UUIDs for primary keys
id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

# Foreign keys with CASCADE delete
owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")

# Relationships
owner: "User" = Relationship(back_populates="items")
```

### Schema Pattern
- `Base` schemas for shared properties
- `Create` schemas for creation
- `Update` schemas with optional fields
- `Public` schemas for API responses

## Testing

### Backend Tests
```bash
cd backend
./scripts/test.sh  # Runs pytest with coverage
```

### Frontend Tests
```bash
cd frontend
npx playwright test  # E2E tests
```

## Environment Setup

The project uses `.env` files for configuration. Key variables to set:
- `SECRET_KEY` - Application secret key
- `FIRST_SUPERUSER_PASSWORD` - Initial admin password
- `POSTGRES_PASSWORD` - Database password
- `OPENAI_API_KEY` - OpenAI API key for AI features

## AI/ML Features

This application includes several AI-powered features:
- **Document Analysis**: Extract and analyze document content
- **Embedding Generation**: Create vector embeddings for documents
- **Evaluation Tasks**: Automated evaluation of content quality
- **Chat Integration**: AI-powered chat functionality
- **Workflow Management**: Orchestrate complex AI analysis workflows

## Development Workflow

### Local Development

1. **Start Development Environment**
```bash
# Full stack with hot-reload
docker compose watch
```

2. **Backend Development**: Use `fastapi dev` for hot reload
3. **Frontend Development**: Use `npm run dev` for development server with Vite
4. **Database Changes**: Create migrations with Alembic
```bash
cd backend
alembic revision --autogenerate -m "description of changes"
# Review the generated migration file in backend/app/alembic/versions/
git add backend/app/alembic/versions/
git commit -m "chore: add migration for X"
```

5. **API Changes**: Run `./scripts/generate-types.sh` to regenerate TypeScript types from the backend OpenAPI spec. Then update domain services if method signatures changed. TypeScript will flag any mismatches.
6. **Testing**: Run both backend and frontend tests before commits
7. **Linting**: Code is automatically formatted with ruff (backend) and Biome (frontend)

### API Client Strategy (Hybrid Approach)

We use a **hybrid** strategy for frontend-backend communication:

1. **Types are auto-generated** from OpenAPI spec:
   - Run `./scripts/generate-types.sh` after backend API changes
   - Generates TypeScript types in `src/client/`
   - Ensures type safety and sync with backend

2. **Services are manual** per domain:
   - Located in `domains/[domain]/services/service.ts`
   - Import types from `@/client` or domain types
   - Allows custom logic (retry, transformations, caching)

**Workflow:**
```
Backend changes endpoint/schema
       ↓
Run: ./scripts/generate-types.sh
       ↓
Types updated in frontend/src/client/
       ↓
TypeScript flags if services need updates
       ↓
Update domains/*/services/ if method signatures changed
```

**Why hybrid?**
- ✅ Types always in sync with backend (auto-generated)
- ✅ Services remain customizable per domain
- ✅ TypeScript acts as "guardian" for API changes
- ✅ Domain isolation preserved

### Continuous Deployment Workflow

This project uses a **Git-based CI/CD workflow** for deploying to QA/Production:

#### Environment Setup

**Local Development** (your machine):
- `.env` → Local development configuration (localhost, local DB)
- Use `docker-compose.override.yml` for local-specific settings

**QA/Production** (Azure VM):
- `.env` → Production configuration (already set up on server, **DO NOT modify**)
- No override file used in production

#### Deployment Methods

**Option 1: Automatic Deployment (Recommended)**
```bash
# Simply push to main branch
git add .
git commit -m "feat: new feature"
git push origin main

# GitHub Actions will automatically:
# 1. Run tests (backend + frontend)
# 2. SSH to Azure VM
# 3. Pull latest code
# 4. Rebuild containers
# 5. Apply migrations automatically
# ✅ Deploy completes in 2-3 minutes
```

**Option 2: Manual Deployment**
```bash
# Use the deployment script
./scripts/deploy.sh

# This script will:
# 1. Check for uncommitted changes
# 2. Push to git
# 3. SSH to server and run deploy-azure.sh
# 4. Show deployment logs
```

#### How Migrations Work

**In Development:**
1. Make model changes in `backend/app/modules/*/models.py`
2. Generate migration: `cd backend && alembic revision --autogenerate -m "description"`
3. Review migration file in `backend/app/alembic/versions/`
4. Commit migration file to git

**In Production:**
1. Migration files are pulled with code (`git pull`)
2. `prestart.sh` runs automatically before backend starts
3. `prestart.sh` executes `alembic upgrade head`
4. Migrations apply automatically ✅
5. Backend starts with updated schema

#### GitHub Actions Setup

To enable automatic deployments, configure these secrets in GitHub:
- `AZURE_VM_HOST` - Your Azure VM IP address
- `AZURE_VM_USER` - SSH username (usually `azureuser`)
- `AZURE_VM_SSH_KEY` - Private SSH key for authentication
- `AZURE_VM_PORT` - SSH port (default: 22)

Go to: Repository Settings → Secrets and variables → Actions → New repository secret

### Adding New Features (Domain-Driven Approach)

When adding a new feature to the frontend:

1. **Identify the domain** (auth, users, items, chat, admin)
2. **Add API hooks** in `domains/[domain]/api/[entity].api.ts`
3. **Create types** in `domains/[domain]/types/[domain].types.ts`
4. **Add schemas** (if forms) in `domains/[domain]/schemas/`
5. **Build components** in `domains/[domain]/components/`
6. **Export from index** in `domains/[domain]/index.ts` using barrel exports
7. **Use in routes** from `routes/` using path aliases like `@domains/auth`

**Example:**
```typescript
// Import from domain using barrel exports
import { useAuth, LoginForm, isLoggedIn } from '@domains/auth'
import { useItems, AddItem } from '@domains/items'
import { Button } from '@shared/components'
```

## Production Deployment

### Initial Setup (One-Time Only)

**Prerequisites:**
- Azure VM (Ubuntu 22.04, 2 vCPUs, 4GB RAM minimum)
- Domain pointing to VM IP
- Ports 80, 443, and 22 open

**Use the automated setup script:**
```bash
# From your local machine
./scripts/deploy-qa.sh
```

This script (run ONLY ONCE for initial setup):
1. Creates Traefik reverse proxy with automatic HTTPS
2. Generates secure passwords for admin and database
3. Transfers all code to the server
4. Builds and starts all services
5. Prints access credentials

**After initial setup, NEVER run this script again.** Use the continuous deployment workflow instead.

### Continuous Deployment (Daily Use)

Once the server is set up, use Git-based deployment:

**Automatic (GitHub Actions):**
```bash
git push origin main  # Auto-deploys in 2-3 minutes
```

**Manual:**
```bash
./scripts/deploy.sh  # Prompts for commit, pushes, and deploys
```

### Deployment Architecture

**Deployment Stack:**
- **Traefik**: Automatic HTTPS with Let's Encrypt
- **Backend**: FastAPI with automatic migrations
- **Frontend**: React with Vite
- **Database**: TimescaleDB (PostgreSQL) with vector operations
- **Cache**: Redis for Celery task queue
- **CI/CD**: GitHub Actions with automated testing

**Service URLs:**
- Frontend: `https://dashboard.{DOMAIN}`
- Backend API: `https://api.{DOMAIN}`
- API Documentation: `https://api.{DOMAIN}/docs`
- Traefik Dashboard: `https://traefik.{DOMAIN}`
- Adminer (DB): `https://adminer.{DOMAIN}`

### Useful Commands (SSH to Server)

```bash
# SSH to server
ssh azureuser@<VM_IP>
cd ~/rocket-genai-v2

# View logs
docker compose logs -f                    # All services
docker compose logs -f backend           # Backend only
docker compose logs -f celery-worker     # Celery worker

# Service status
docker compose ps

# Restart services
docker compose restart backend
docker compose restart celery-worker

# Manual deployment (if needed)
git pull origin main
docker compose -f docker-compose.yml up -d --build

# Database migrations (usually automatic)
docker compose exec backend alembic upgrade head

# Access database
docker compose exec db psql -U postgres -d app
```

## Additional Documentation

For more detailed information:
- **Azure Deployment Guide**: See [DEPLOYMENT-AZURE.md](DEPLOYMENT-AZURE.md) for complete step-by-step deployment instructions
- **Environment Variables**: Check `.env.azure.example` for Azure deployment configuration

## Claude Code Skills

This project includes custom skills for Claude Code development assistance:

- **`/rocket-frontend`**: Frontend development guide with DDD patterns, React Query hooks, Zod forms, and type generation workflow
- **`/rocket-backend`**: Backend development guide with FastAPI modules, Repository-Service pattern, and Alembic migrations

Skills are located in `.claude/skills/` and provide quick reference + extended examples for common development tasks.