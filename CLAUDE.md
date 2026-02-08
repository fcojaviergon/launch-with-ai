# CLAUDE.md — Launch With AI

## Proyecto
**Launch With AI** — Production-ready full-stack template for AI-powered SaaS applications.

| Aspecto | Stack |
|---------|-------|
| **Backend** | FastAPI, SQLModel, PostgreSQL, Celery, Redis |
| **Frontend** | React 18, TypeScript, Chakra UI, TanStack Router/Query |
| **Linting** | Ruff + MyPy (backend), Biome (frontend) |
| **Deploy** | Docker Compose, Traefik, GitHub Actions → Azure |

Solo founder mode: optimizar para velocidad de shipping con calidad mínima viable.

## Principios
- **Ship small, ship often.** PRs < 300 líneas.
- **Tests para lógica crítica.** No 100% coverage.
- **Conventional commits siempre** (feat/fix/chore/docs/refactor).
- **Si puede fallar en producción**, necesita error handling.
- **Cada error de Claude** se convierte en una regla abajo.

---

## Skills Disponibles

### Skills del Proyecto (específicos de este repo)
| Skill | Cuándo usar |
|-------|-------------|
| `/launch-frontend` | Crear dominios, componentes, forms, hooks en frontend/ (DDD + TanStack) |
| `/launch-backend` | Crear módulos, modelos, endpoints en backend/ (FastAPI + SQLModel) |

### Skills Globales (SDLC completo)
| Skill | Cuándo usar |
|-------|-------------|
| `/plan-feature` | Planificar nueva feature → genera docs/active-plan.md |
| `/implement` | Implementar tareas del plan activo |
| `/test-verify` | Testear + verificar build + lint |
| `/review-code` | Code review antes de merge |
| `/commit-ship` | Git commit + PR con pre-flight checks |
| `/triage-bug` | Diagnosticar y clasificar un bug |
| `/write-spec` | Spec formal (solo features 10+ archivos) |
| `/write-docs` | Documentación |

### Skills de Negocio
| Skill | Cuándo usar |
|-------|-------------|
| `/pdp-generator` | Cotización: WBS + estimación HH + Excel |
| `/bootstrap-repo` | Onboarding rápido a un repo |
| `/log-decision` | Registrar ADR (decisión técnica) |
| `/sprint-retro` | Retrospectiva + mejora continua |
| `/time-track` | Registrar horas trabajadas |

### Subagents Automáticos
| Agent | Rol | Se invoca cuando... |
|-------|-----|---------------------|
| `qa-tester` | QA aislado (tests + build + lint) | Verificación completa |
| `security-reviewer` | Auditoría de seguridad (read-only) | Review de seguridad |

---

## Workflow de Desarrollo

```
Feature simple (< 10 archivos):
/plan-feature → /implement → /test-verify → /commit-ship

Feature compleja (10+ archivos, integraciones):
/write-spec → /plan-feature @specs/... → /implement → /test-verify → /review-code → /commit-ship
```

### Ciclo Diario
1. **Ver plan actual**: Lee `docs/active-plan.md`
2. **Implementar tarea**: `/implement` o implementar directamente
3. **Verificar**: `/test-verify` (o manualmente: tests + build + lint)
4. **Shippear**: `/commit-ship` (o commit manual con conventional commits)

### Comandos Rápidos

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
docker compose watch                  # Todo el stack
./scripts/generate-types.sh          # Regenerar tipos del backend
```

---

## Arquitectura

### Backend (FastAPI)
```
backend/app/
├── api/v1/           # Endpoints
├── core/             # Config, DB, security
├── modules/          # Dominios
│   └── [module]/
│       ├── models.py      # SQLModel
│       ├── schemas.py     # Pydantic
│       ├── repository.py  # CRUD
│       └── service.py     # Business logic
└── services/         # Integraciones externas
```

### Frontend (React DDD)
```
frontend/src/
├── domains/          # Dominios auto-contenidos
│   └── [domain]/
│       ├── api/           # React Query hooks
│       ├── services/      # API client manual
│       ├── components/    # UI
│       ├── types/         # TypeScript types
│       └── schemas/       # Zod validation
├── shared/           # Componentes compartidos
├── routes/           # TanStack Router
└── client/           # Tipos generados (OpenAPI)
```

**Path Aliases:** `@domains/*`, `@shared/*`, `@/*`

---

## Patrones Clave

### Database (SQLModel)
```python
id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
owner_id: uuid.UUID = Field(foreign_key="user.id", ondelete="CASCADE")
```

### Schemas (Pydantic)
- `Base` → propiedades compartidas
- `Create` → creación
- `Update` → campos opcionales
- `Public` → respuesta API

### API Client (Frontend)
```
Backend cambia → ./scripts/generate-types.sh → TypeScript alerta → Actualizar services/
```

---

## Deployment

### Git Push = Deploy Automático
```bash
git push origin main  # GitHub Actions → Azure VM
```

### URLs en Producción
- Frontend: `https://dashboard.{DOMAIN}`
- API: `https://api.{DOMAIN}`
- Docs: `https://api.{DOMAIN}/docs`

### SSH al Servidor
```bash
ssh azureuser@<VM_IP>
cd ~/launch-with-ai
docker compose logs -f backend       # Ver logs
docker compose restart backend       # Reiniciar
```

Ver [DEPLOYMENT-AZURE.md](DEPLOYMENT-AZURE.md) para setup inicial.

---

## Contexto Actual

| Archivo | Propósito |
|---------|-----------|
| `docs/active-plan.md` | Plan de trabajo actual |
| `docs/bugs-encontrados.md` | Bugs pendientes |
| `docs/timesheet.csv` | Horas trabajadas vs estimadas |
| `docs/decisions/` | ADRs (decisiones técnicas) |

---

## Reglas Aprendidas

<!--
Agregar reglas aquí cada vez que Claude cometa un error repetido.
Formato: "- NO hacer X, SIEMPRE hacer Y"
Ejemplo: "- No usar fetch directo, siempre usar el service del dominio"
-->

- No usar Prettier, siempre usar Biome para frontend
- No modificar .env en producción, solo en local
- Siempre generar tipos con `./scripts/generate-types.sh` después de cambios en API
- No commitear archivos .env ni credentials

---

## Información Adicional

Para documentación detallada de skills del proyecto: `.claude/skills/launch-*.md`
