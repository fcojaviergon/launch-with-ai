# Launch With AI

Production-ready full-stack template for building AI-powered SaaS applications. Clean architecture, secure by default, and ready to deploy.

### Based On

This project is built on top of the [Full Stack FastAPI Template](https://github.com/fastapi/full-stack-fastapi-template) — a production-ready starter with FastAPI, React, SQLModel, PostgreSQL, Docker Compose, Traefik, and CI/CD via GitHub Actions. We extended it to be AI-native: replacing PostgreSQL with TimescaleDB for vector operations, adding RAG (Retrieval-Augmented Generation) pipelines, embedding generation, document analysis workflows, and multi-provider LLM support (OpenAI and Anthropic).

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
- **AI Integration Ready**: OpenAI and Anthropic Claude support, vector store
- **Modular Architecture**: Domain-based frontend, module-based backend
- **Auto-generated API Client**: TypeScript types from OpenAPI spec
- **Production Security**: CORS, CSRF protection, secure defaults
- **Dark Mode**: System theme detection with manual override

## Why TimescaleDB

This project uses [TimescaleDB](https://www.timescale.com/) (specifically the `timescale/timescaledb-ha:pg16` image) instead of plain PostgreSQL. TimescaleDB is a PostgreSQL extension that adds time-series capabilities and, critically for this project, integrates well with the [`pgvector`](https://github.com/pgvector/pgvector) extension and the [`timescale-vector`](https://github.com/timescale/python-vector) Python client for RAG workloads.

### Why not standard PostgreSQL?

- **Vector search + time partitioning**: Document embeddings are stored in a [hypertable](https://docs.timescale.com/use-timescale/hypertables/) partitioned by `created_at`. This enables efficient time-based filtering combined with vector similarity search — useful for RAG pipelines where recent documents should be prioritized.
- **StreamingDiskANN indexing**: TimescaleDB's vector client supports [DiskANN](https://docs.timescale.com/ai/python-interface-for-pgvector-and-timescale-vector/#create-a-streaming-diskann-index), a high-performance approximate nearest neighbor index that outperforms IVFFlat on large datasets.
- **Drop-in PostgreSQL replacement**: TimescaleDB is a superset of PostgreSQL — all standard SQL, extensions, and tools (Alembic, SQLModel, psql) work without changes.

### Hypertable creation outside Alembic

The `document_embeddings` table is created via raw SQL in [`backend/app/core/db.py`](backend/app/core/db.py), **not** through Alembic migrations. This is intentional:

1. **Alembic + SQLModel cannot represent hypertables**: Alembic's autogenerate works by diffing SQLModel metadata against the database schema. TimescaleDB hypertables require a `SELECT create_hypertable(...)` call after table creation — there is no way to express this in SQLModel's declarative model or in Alembic's migration operations natively.
2. **The `pgvector` column type is not natively supported by SQLModel**: The `vector(1536)` column type comes from the `pgvector` extension and does not have a built-in SQLAlchemy/SQLModel type mapping that Alembic's autogenerate can detect and diff reliably.
3. **Composite primary key for partitioning**: Hypertables require the partition column (`created_at`) to be part of the primary key. This constraint, combined with the above limitations, makes it simpler to manage this table outside the standard migration flow.

The raw SQL runs during application startup (via `init_db()` in [`backend/app/initial_data.py`](backend/app/initial_data.py)), **after** Alembic migrations have been applied. All statements use `IF NOT EXISTS` / `if_not_exists => TRUE` to be safely idempotent.

```sql
-- Extensions
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Embeddings table as a hypertable
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID,
    metadata JSONB,
    contents TEXT,
    embedding vector(1536),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (id, created_at)
);

SELECT create_hypertable('document_embeddings', 'created_at',
                         if_not_exists => TRUE,
                         create_default_indexes => FALSE);
```

All other tables (users, items, projects, chat conversations) are managed normally through Alembic and SQLModel.

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
cp .env.example .env
# Edit .env with your configuration (OPENAI_API_KEY required; optionally set LLM_PROVIDER=anthropic)
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
│   │   └── services/       # External integrations (OpenAI, Anthropic)
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
| `OPENAI_API_KEY` | OpenAI API key (always required for embeddings) |

### LLM Provider Configuration

The application supports **OpenAI** (default) and **Anthropic Claude** as LLM providers. Embeddings always use OpenAI regardless of the selected provider.

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_PROVIDER` | LLM provider: `openai` or `anthropic` | `openai` |
| `OPENAI_MODEL` | OpenAI model for completions | `gpt-4o-mini` |
| `OPENAI_EMBEDDING_MODEL` | OpenAI embedding model | `text-embedding-3-small` |
| `ANTHROPIC_API_KEY` | Anthropic API key (required when provider is `anthropic`) | - |
| `ANTHROPIC_MODEL` | Anthropic model for completions | `claude-sonnet-4-20250514` |
| `CHAT_MODEL` | Override chat model (auto-detected from provider if empty) | - |

To switch to Anthropic Claude:
```bash
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-key-here
```

### Other Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
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
