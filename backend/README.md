# Launch With AI — Backend

FastAPI backend with module-based architecture, SQLModel ORM, and AI integration ready.

## Technology Stack

- [FastAPI](https://fastapi.tiangolo.com) with Python 3.10+
- [SQLModel](https://sqlmodel.tiangolo.com) ORM (SQLAlchemy + Pydantic)
- [PostgreSQL](https://www.postgresql.org) with TimescaleDB for vector operations
- [Celery](https://docs.celeryq.dev) + Redis for background tasks
- [Alembic](https://alembic.sqlalchemy.org) for database migrations
- [uv](https://docs.astral.sh/uv/) for fast package management

## Quick Start

### Prerequisites

- [Docker](https://www.docker.com) (recommended)
- [uv](https://docs.astral.sh/uv/) for local development

### With Docker (Recommended)

```bash
docker compose watch
```

Access the API at http://localhost:8000 and docs at http://localhost:8000/docs

### Local Development

```bash
cd backend

# Install dependencies
uv sync

# Activate virtual environment
source .venv/bin/activate

# Start development server
fastapi dev app/main.py
```

## Project Structure (Module-Based)

```
backend/app/
├── api/v1/              # API endpoints
│   ├── routes/          # Route definitions
│   └── main.py          # API router
├── core/                # Core functionality
│   ├── config.py        # Settings (Pydantic)
│   ├── db.py            # Database connection
│   └── security.py      # Auth, JWT, passwords
├── modules/             # Domain modules (self-contained)
│   └── [module]/
│       ├── models.py    # SQLModel ORM models
│       ├── schemas.py   # Pydantic request/response
│       ├── repository.py # CRUD operations
│       └── service.py   # Business logic
├── services/            # External integrations
│   └── openai/          # AI client
└── alembic/             # Database migrations
```

## Development

### Common Commands

```bash
cd backend

fastapi dev app/main.py     # Dev server with hot reload
./scripts/test.sh           # Run tests
./scripts/lint.sh           # Lint (mypy + ruff)
```

### Creating a New Module

1. Create directory: `app/modules/your_module/`
2. Add files: `models.py`, `schemas.py`, `repository.py`, `service.py`
3. Register routes in `app/api/v1/main.py`
4. Create migration: `alembic revision --autogenerate -m "Add your_module"`
5. Regenerate frontend types: `./scripts/generate-types.sh`

### Database Migrations

```bash
# Connect to backend container
docker compose exec backend bash

# Create migration after model changes
alembic revision --autogenerate -m "Description of change"

# Apply migrations
alembic upgrade head
```

**Important:** Always review auto-generated migrations before committing.

### Disabling Migrations

To use `create_all()` instead of Alembic:

1. Uncomment `SQLModel.metadata.create_all(engine)` in `app/core/db.py`
2. Comment out `alembic upgrade head` in `scripts/prestart.sh`

## Testing

```bash
# Run all tests
./scripts/test.sh

# Run specific test
pytest app/tests/test_users.py -v

# With coverage
pytest --cov=app --cov-report=html
```

Coverage report: `htmlcov/index.html`

### Docker Testing

```bash
# With stack running
docker compose exec backend bash scripts/tests-start.sh

# Stop on first error
docker compose exec backend bash scripts/tests-start.sh -x
```

## Architecture Notes

### Module Pattern

Each module is self-contained with clear layers:

```
modules/users/
├── models.py      # SQLModel: User, UserBase
├── schemas.py     # Pydantic: UserCreate, UserUpdate, UserPublic
├── repository.py  # CRUD: create_user, get_user, update_user
└── service.py     # Business logic: authenticate, validate_email
```

### Schema Naming Convention

- `Base` — Shared properties
- `Create` — Creation input
- `Update` — Update input (optional fields)
- `Public` — API response (safe to expose)

### Database Patterns

```python
# UUID primary keys
id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)

# Foreign key with cascade delete
owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
```

## Docker Development

### Live Reload

The `docker-compose.override.yml` mounts source code as a volume and uses `--reload`:

```bash
docker compose watch
```

Changes to Python files automatically restart the server.

### Interactive Shell

```bash
# Enter container
docker compose exec backend bash

# You're now at /app with your code at /app/app
python  # Python REPL
```

## Email Templates

Email templates are in `app/email-templates/`:

- `src/` — MJML source files
- `build/` — Compiled HTML (used by app)

To create/edit templates:

1. Install [MJML extension](https://marketplace.visualstudio.com/items?itemName=attilabuti.vscode-mjml) in VS Code
2. Edit `.mjml` file in `src/`
3. Use `Ctrl+Shift+P` → `MJML: Export to HTML`
4. Save to `build/` directory

## VS Code Integration

Pre-configured for:

- **Debugging**: Run backend through VS Code debugger
- **Testing**: Run tests from Python tests tab
- **Virtual Environment**: Interpreter at `backend/.venv/bin/python`

## Related Documentation

- [Main README](../README.md) — Project overview
- [CLAUDE.md](../CLAUDE.md) — Development guide
- [Development Guide](../NOTES/development.md) — Docker Compose workflow
- [Deployment Guide](../NOTES/deployment.md) — Production deployment
