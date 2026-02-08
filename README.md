# Launch With AI

Production-ready full-stack template for building AI-powered SaaS applications. Clean architecture, secure by default, and ready to deploy.

## Technology Stack

- **Backend**: [FastAPI](https://fastapi.tiangolo.com) with Python 3.10+
  - [SQLModel](https://sqlmodel.tiangolo.com) ORM for type-safe database operations
  - [Pydantic](https://docs.pydantic.dev) for data validation
  - [PostgreSQL](https://www.postgresql.org) with TimescaleDB for vector operations
  - [Celery](https://docs.celeryq.dev) + Redis for background tasks
  - [Alembic](https://alembic.sqlalchemy.org) for database migrations

- **Frontend**: [React 18](https://react.dev) with TypeScript
  - [Chakra UI](https://chakra-ui.com) component library
  - [TanStack Router](https://tanstack.com/router) for file-based routing
  - [TanStack Query](https://tanstack.com/query) for data fetching
  - [React Hook Form](https://react-hook-form.com) + Zod for forms
  - Domain-Driven Design (DDD) architecture

- **Infrastructure**:
  - [Docker Compose](https://www.docker.com) for development and production
  - [Traefik](https://traefik.io) reverse proxy with automatic HTTPS
  - GitHub Actions for CI/CD
  - Azure VM deployment ready

## Key Features

- **Secure Authentication**: JWT with httpOnly cookies (XSS-immune)
- **AI Integration Ready**: OpenAI client configured, vector store support
- **Modular Architecture**: Domain-based frontend, module-based backend
- **Auto-generated API Client**: TypeScript types from OpenAPI spec
- **Production Security**: CORS, CSRF protection, secure defaults
- **Dark Mode**: System theme detection with manual override

## Differences from FastAPI Full-Stack Template

This project is based on [tiangolo/full-stack-fastapi-template](https://github.com/tiangolo/full-stack-fastapi-template) with significant enhancements for AI-powered applications:

| Aspect | Original Template | Launch With AI |
|--------|------------------|----------------|
| **Architecture** | Flat structure | Module-based backend + DDD frontend |
| **Database** | PostgreSQL | PostgreSQL + TimescaleDB vector extensions |
| **Background Tasks** | None | Celery + Redis for AI pipeline processing |
| **AI Integration** | None | OpenAI client, embeddings, vector search |
| **Frontend State** | Basic React | TanStack Query + Router (file-based) |

### Key Architectural Changes

1. **Module-Based Backend**: Each domain (users, items, chat) is self-contained with its own models, schemas, repository, and service layers
2. **Vector Database**: TimescaleDB with pgvector for semantic search and RAG pipelines
3. **Async AI Pipelines**: Celery workers process long-running AI tasks (embeddings, document processing) without blocking the API
4. **Domain-Driven Frontend**: React domains mirror backend modules with their own API hooks, types, and components

## Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for frontend development)
- Python 3.10+ (for backend development)

### Local Development

1. **Clone and configure**:
```bash
git clone https://github.com/yourusername/launch-with-ai.git
cd launch-with-ai
./scripts/generate-env.sh local
# Edit .env.local with your OPENAI_API_KEY
cp .env.local .env
```

2. **Start all services**:
```bash
docker compose watch
```

3. **Access the application**:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Generate Secret Keys

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

## Project Structure

```
launch-with-ai/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Config, DB, security
│   │   ├── modules/        # Domain modules (users, items, chat)
│   │   └── services/       # External integrations (OpenAI)
│   └── scripts/            # Utility scripts
├── frontend/               # React frontend
│   └── src/
│       ├── domains/        # Business domains (DDD)
│       ├── shared/         # Shared components
│       ├── routes/         # TanStack Router pages
│       └── client/         # Auto-generated API client
├── docker-compose.yml      # Development & production config
└── CLAUDE.md              # AI assistant guide
```

## Configuration

### Required Environment Variables

| Variable | Description |
|----------|-------------|
| `SECRET_KEY` | JWT signing key (generate with command above) |
| `POSTGRES_PASSWORD` | Database password |
| `FIRST_SUPERUSER_PASSWORD` | Initial admin password |
| `OPENAI_API_KEY` | OpenAI API key for AI features |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_MODEL` | Chat model | `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | Embedding model | `text-embedding-3-small` |
| `ANTHROPIC_API_KEY` | Anthropic API key (Claude models) | - |
| `REDIS_HOST` | Redis server for Celery | `redis` |
| `REDIS_PORT` | Redis port | `6379` |
| `SENTRY_DSN` | Error tracking | - |
| `SMTP_HOST` | Email server | - |

## Deployment

### Azure VM Deployment

```bash
# One-time setup
./scripts/deploy-qa.sh

# Continuous deployment (after setup)
git push origin main  # Auto-deploys via GitHub Actions
```

### Manual Deployment

```bash
./scripts/deploy.sh
```

See [CLAUDE.md](./CLAUDE.md) for detailed deployment instructions.

## Development Workflow

### Adding a New Feature

1. **Backend**: Create module in `backend/app/modules/`
2. **Generate types**: `./scripts/generate-types.sh`
3. **Frontend**: Create domain in `frontend/src/domains/`

### Database Changes

```bash
cd backend
alembic revision --autogenerate -m "description"
# Review migration, then commit
```

### Running Tests

```bash
# Backend
cd backend && ./scripts/test.sh

# Frontend E2E
cd frontend && npx playwright test
```

## Documentation

- [CLAUDE.md](./CLAUDE.md) - Complete development guide
- [backend/README.md](./backend/README.md) - Backend documentation
- [frontend/README.md](./frontend/README.md) - Frontend documentation

## License

MIT License - Use freely for your projects.
