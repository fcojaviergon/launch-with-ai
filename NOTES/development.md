# Launch With AI — Development Guide

Local development setup and workflows for the full-stack application.

## Quick Start

```bash
# Start all services
docker compose watch

# View logs
docker compose logs -f backend
```

## Development URLs

| Service            | URL                         |
| ------------------ | --------------------------- |
| Frontend           | http://localhost:5173       |
| Backend API        | http://localhost:8000       |
| API Docs (Swagger) | http://localhost:8000/docs  |
| API Docs (ReDoc)   | http://localhost:8000/redoc |
| Adminer (DB admin) | http://localhost:8080       |
| Traefik Dashboard  | http://localhost:8090       |
| MailCatcher        | http://localhost:1080       |

**Note:** First startup may take a minute while the database initializes.

## Docker Compose Workflow

### Start the Stack

```bash
docker compose watch
```

This starts all services with hot reload enabled.

### View Logs

```bash
docker compose logs           # All services
docker compose logs backend   # Specific service
docker compose logs -f        # Follow mode
```

### Restart Services

```bash
docker compose restart backend
docker compose restart frontend
```

## Hybrid Development

Run specific services locally while keeping others in Docker. All services use the same ports, so you can mix and match.

### Frontend Locally

```bash
# Stop Docker frontend
docker compose stop frontend

# Start local dev server
cd frontend
npm run dev
```

### Backend Locally

```bash
# Stop Docker backend
docker compose stop backend

# Start local dev server
cd backend
fastapi dev app/main.py
```

## Environment Configuration

### The .env File

The `.env` file contains all configurations. For public repos, exclude it from Git and use CI/CD secrets.

```bash
# Generate new secrets
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Key Variables

| Variable            | Description       |
| ------------------- | ----------------- |
| `SECRET_KEY`        | JWT signing key   |
| `POSTGRES_PASSWORD` | Database password |
| `OPENAI_API_KEY`    | AI features       |
| `DOMAIN`            | Production domain |

After changing `.env`, restart the stack:

```bash
docker compose watch
```

## Docker Compose Files

| File                          | Purpose                                     |
| ----------------------------- | ------------------------------------------- |
| `docker-compose.yml`          | Main configuration (all environments)       |
| `docker-compose.override.yml` | Development overrides (hot reload, volumes) |
| `docker-compose.traefik.yml`  | Production Traefik proxy                    |

The override file is automatically applied during development.

## Pre-commit Hooks

Code formatting and linting run automatically before commits.

### Setup

```bash
uv run pre-commit install
```

### Manual Run

```bash
uv run pre-commit run --all-files
```

### Checks Applied

- Large file detection
- TOML/YAML validation
- Ruff (Python linting/formatting)
- Biome (TypeScript/React linting)

## Testing with Subdomains

To test subdomain routing locally (like production):

1. Edit `.env`:

```dotenv
DOMAIN=localhost.yourdomain.com
```

2. Restart:

```bash
docker compose watch
```

3. Access via subdomains:

| Service     | URL                                       |
| ----------- | ----------------------------------------- |
| Frontend    | http://dashboard.localhost.yourdomain.com |
| Backend     | http://api.localhost.yourdomain.com       |
| API Docs    | http://api.localhost.yourdomain.com/docs  |
| Adminer     | http://localhost.yourdomain.com:8080      |
| Traefik     | http://localhost.yourdomain.com:8090      |
| MailCatcher | http://localhost.yourdomain.com:1080      |

The domain `localhost.yourdomain.com` resolves to `127.0.0.1`.

## Common Tasks

### Generate API Types

After backend changes, regenerate frontend TypeScript types:

```bash
./scripts/generate-types.sh
```

### Database Migrations

```bash
# Enter backend container
docker compose exec backend bash

# Create migration
alembic revision --autogenerate -m "Description"

# Apply migration
alembic upgrade head
```

### Run Tests

```bash
# Backend
cd backend && ./scripts/test.sh

# Frontend E2E
cd frontend && npx playwright test
```

## Related Documentation

- [Main README](../README.md) — Project overview
- [CLAUDE.md](../CLAUDE.md) — Development guide with skills
- [Backend README](../backend/README.md) — Backend details
- [Frontend README](../frontend/README.md) — Frontend details
- [Deployment Guide](./deployment.md) — Production deployment
