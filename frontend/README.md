# Launch With AI — Frontend

React 18 frontend with Domain-Driven Design architecture, built with TypeScript, Chakra UI, TanStack Router/Query, and React Hook Form.

## Technology Stack

- [React 18](https://react.dev) with TypeScript
- [Chakra UI](https://chakra-ui.com) component library
- [TanStack Router](https://tanstack.com/router) for file-based routing
- [TanStack Query](https://tanstack.com/query) for data fetching
- [React Hook Form](https://react-hook-form.com) + Zod for forms
- [Vite](https://vitejs.dev) for fast development

## Quick Start

### Prerequisites

- Node.js 18+ (use [fnm](https://github.com/Schniz/fnm) or [nvm](https://github.com/nvm-sh/nvm))

### Setup

```bash
cd frontend

# Install correct Node version
fnm use  # or: nvm use

# Install dependencies
npm install

# Start development server
npm run dev
```

Access the app at http://localhost:5173

## Project Structure (DDD)

```
frontend/src/
├── domains/              # Business domains (self-contained)
│   └── [domain]/
│       ├── api/          # React Query hooks
│       ├── services/     # API client calls
│       ├── components/   # Domain-specific UI
│       ├── types/        # TypeScript types
│       └── schemas/      # Zod validation
├── shared/               # Shared components
│   ├── components/       # Reusable UI components
│   └── hooks/            # Shared hooks
├── routes/               # TanStack Router pages
├── client/               # Auto-generated API client (OpenAPI)
└── theme.tsx             # Chakra UI custom theme
```

**Path Aliases:** `@domains/*`, `@shared/*`, `@/*`

## Development

### Common Commands

```bash
npm run dev              # Development server with hot reload
npm run build            # Production build + type check
npm run lint             # Biome lint
npm run preview          # Preview production build
```

### Generate API Client

When the backend API changes, regenerate the TypeScript client:

```bash
# From project root
./scripts/generate-types.sh

# Or manually from frontend/
npm run generate-client
```

This keeps frontend types in sync with backend schemas.

### Using a Remote API

Set the `VITE_API_URL` environment variable in `frontend/.env`:

```env
VITE_API_URL=https://api.your-domain.com
```

## Testing

### End-to-End Tests (Playwright)

```bash
# Start the backend first
docker compose up -d --wait backend

# Run tests
npx playwright test

# Run tests with UI
npx playwright test --ui
```

### Cleanup

```bash
docker compose down -v
```

## Architecture Notes

### Domain-Driven Design

Each domain mirrors a backend module and is self-contained:

```
domains/users/
├── api/useUsers.ts       # React Query hooks
├── services/usersApi.ts  # API calls
├── components/UserForm.tsx
└── types/index.ts
```

### API Integration Pattern

1. Backend changes → regenerate types with `./scripts/generate-types.sh`
2. TypeScript catches breaking changes
3. Update domain services as needed

### State Management

- **Server state**: TanStack Query (caching, sync, mutations)
- **Form state**: React Hook Form + Zod validation
- **UI state**: React useState/useContext (minimal)

## Removing the Frontend

If building an API-only application:

1. Remove the `./frontend` directory
2. Remove `frontend` service from `docker-compose.yml`
3. Remove `frontend` and `playwright` services from `docker-compose.override.yml`

## Related Documentation

- [Main README](../README.md) — Project overview
- [CLAUDE.md](../CLAUDE.md) — Development guide
- [Development Guide](../NOTES/development.md) — Docker Compose workflow
