# Architecture & Development Guide

## Overview

Limitless AI is a full-stack application built for scalability, utilizing modern best practices for both backend and frontend development.

## Tech Stack

### Backend

- **Framework**: FastAPI (Python 3.10+)
- **Database**: PostgreSQL with TimescaleDB (for vector search & time-series) managed via `docker-compose`.
- **ORM**: SQLModel (SQLAlchemy wrapper).
- **Migrations**: Alembic.
- **Asynchronous Tasks**: Celery + Redis.
- **Logging**: Structured logging via `structlog`.
- **Testing**: Pytest.

### Frontend

- **Framework**: React 18 + Vite.
- **Language**: TypeScript.
- **State/Data**: TanStack Query (React Query) v5.
- **Routing**: TanStack Router.
- **UI System**: Chakra UI v3 + Custom Recipe System.
- **API Client**: Generated via `openapi-ts`.

## Project Structure

### Backend (`/backend`)

The backend follows a **Modular Monolith** approach.

- `app/modules/`: Contains feature-specific logic (e.g., `users`, `projects`, `chat`).
  - Each module contains its own `models.py`, `schemas.py`, `service.py`, `routes.py`, etc.
  - **Rule**: Avoid circular dependencies between modules. Use usage of `services` for inter-module communication.
- `app/core/`: Application-level configurations (Config, Security, Database, Logging).
- `app/api/`: Routing aggregation.

### Frontend (`/frontend`)

The frontend is organized by **Domains** and **Routes**.

- `src/routes/`: File-based routing definitions (TanStack Router).
- `src/domains/`: Feature-specific components and hooks (e.g., `auth`, `dashboard`).
- `src/shared/`: Reusable primitives, UI components, and utilities.
- `src/client/`: Auto-generated API client. **Do not edit manually**.

## Development Workflow

We use a `Makefile` to standardize common commands.

### Quick Start

```bash
# Start the full stack (detached mode)
make dev

# Follow logs
make logs
```

### Common Commands

- **`make dev`**: Start all services.
- **`make test`**: Run both backend and frontend tests.
- **`make lint`**: Run linting (Ruff for Python, Biome for TS).
- **`make format`**: Format code.
- **`make generate-client`**: Regenerate the frontend API client after backend changes.

```

```
