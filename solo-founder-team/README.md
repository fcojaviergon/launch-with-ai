# 🚀 Solo Founder SDLC Kit para Claude Code

Kit completo de Skills, Agents, Hooks y configuración para un workflow
de desarrollo profesional como solo founder usando Claude Code.

## Qué incluye

| # | Componente | Tipo | Propósito |
|---|-----------|------|-----------|
| | **CONFIG** | | |
| 1 | CLAUDE.md template | Config | Constitución del proyecto |
| 2 | global-settings.json | Config | Hooks (Biome, build, protección, notificaciones) |
| 3 | project-settings.json | Config | Permisos seguros por proyecto |
| | **SKILLS SDLC** | | |
| 4 | /plan-feature | Skill | Planificar features con plan accionable |
| 5 | /implement | Skill | Implementar tareas (referencia skills custom) |
| 6 | /test-verify | Skill+fork | Testing + verificación build + biome |
| 7 | /review-code | Skill+fork | Code review (verifica convenciones) |
| 8 | /commit-ship | Skill | Git + PR con pre-flight checks |
| 9 | /write-docs | Skill | Documentación |
| 10 | /triage-bug | Skill | Diagnóstico y clasificación de bugs |
| 11 | /write-spec | Skill | Spec formal para features complejas (SDD selectivo) |
| | **SKILLS NEGOCIO** | | |
| 12 | /pdp-generator | Skill | Cotización: WBS + estimación HH + Excel |
| 13 | /bootstrap-repo | Skill+fork | Onboarding rápido a repos |
| 14 | /log-decision | Skill | ADRs automáticos |
| 15 | /sprint-retro | Skill+fork | Retrospectiva + mejora continua |
| 16 | /time-track | Skill | Horas reales vs. estimadas |
| | **AGENTS** | | |
| 17 | qa-tester | Agent | QA aislado (tests + build + lint) |
| 18 | security-reviewer | Agent | Auditoría de seguridad (read-only) |
| | **HOOKS** | | |
| 19 | Protección archivos | PreToolUse | Bloquea .env, .git, node_modules |
| 20 | Biome por archivo | PostToolUse | Auto-fix lint+format por archivo |
| 21 | Build + Biome global | Stop | Verificación completa al terminar |
| 22 | Notificación Stop | Stop | Alerta macOS al terminar |
| 23 | Notificación Input | Notification | Alerta cuando espera input |
| 24 | Session logging | Stop | Log para tracking de tiempo |

## Instalación

### Paso 1: Instalar globales (una sola vez)

```bash
chmod +x install.sh
./install.sh
```

Esto instala:
- 13 skills globales en `~/.claude/skills/`
- 2 agents en `~/.claude/agents/`
- Hooks y settings en `~/.claude/settings.json`

### Paso 2: Configurar un proyecto

```bash
cd /ruta/a/tu/proyecto
/ruta/al/kit/install.sh --project
```

Esto crea:
- `CLAUDE.md` (template para editar)
- `.claude/settings.json` (permisos del proyecto)
- `docs/` (estructura de documentación)

### Paso 3: Editar CLAUDE.md

Abre `CLAUDE.md` y reemplaza los `[PLACEHOLDERS]` con tu stack y convenciones.

### Paso 4: Agregar tus skills custom (opcional)

Si tienes skills de frontend/backend específicos de tu proyecto:

```bash
mkdir -p .claude/skills/mi-frontend
# Copia tu SKILL.md ahí
mkdir -p .claude/skills/mi-backend
# Copia tu SKILL.md ahí
```

## Uso diario

### Workflow típico

```
# Feature simple (< 10 archivos)
/plan-feature agregar filtro de búsqueda    # Planifica
/implement                                   # Implementa
/test-verify                                 # Verifica
/commit-ship                                 # Shippea

# Feature compleja (10+ archivos, integraciones, lógica densa)
/write-spec sistema de pagos con Stripe      # Spec formal primero
/plan-feature @specs/pagos-stripe.md         # Plan desde el spec
/implement                                   # Implementa (subagents opcionales)
/test-verify                                 # Verifica
/review-code                                 # Review
/commit-ship                                 # Shippea
```

### Comandos útiles

| Qué quieres | Qué escribes |
|-------------|-------------|
| Nueva feature | `/plan-feature [descripción]` |
| Implementar | `/implement` o `/implement tarea 3` |
| Testear | `/test-verify` |
| Review | `/review-code` |
| Shippear | `/commit-ship` |
| Bug | `/triage-bug [descripción]` |
| Spec formal (features complejas) | `/write-spec [descripción]` |
| Cotizar proyecto | `/pdp-generator [descripción]` |
| Onboarding a repo | `/bootstrap-repo` |
| Registrar decisión | `/log-decision [qué decidimos]` |
| Retrospectiva | `/sprint-retro` |
| Registrar horas | `/time-track 3h en módulo auth` |
| Ver avance horas | `/time-track cuánto llevamos?` |
| Documentar | `/write-docs [qué documentar]` |

## Arquitectura

```
~/.claude/                        ← GLOBAL (todos los proyectos)
├── settings.json                 Hooks + config global
├── skills/                       Skills reutilizables
│   ├── plan-feature/
│   ├── implement/
│   ├── test-verify/
│   ├── review-code/
│   ├── commit-ship/
│   ├── write-docs/
│   ├── triage-bug/
│   ├── write-spec/
│   ├── pdp-generator/
│   │   ├── scripts/
│   │   ├── templates/
│   │   └── resources/
│   ├── bootstrap-repo/
│   ├── log-decision/
│   ├── sprint-retro/
│   └── time-track/
└── agents/
    ├── qa-tester.md
    └── security-reviewer.md

mi-proyecto/                      ← POR PROYECTO
├── CLAUDE.md                     Constitución del proyecto
├── .claude/
│   ├── settings.json             Permisos del proyecto
│   └── skills/                   Skills específicos de ESTE repo
│       ├── mi-frontend/          ← Tu skill custom
│       └── mi-backend/           ← Tu skill custom
└── docs/
    ├── active-plan.md
    ├── architecture.md
    ├── repo-overview.md
    ├── timesheet.csv
    ├── bugs-encontrados.md
    ├── decisions/
    │   └── README.md
    └── retros/
```

## El Feedback Loop

```
/pdp-generator → estima HH
        ↓
/time-track → registra HH reales
        ↓
/sprint-retro → detecta desviaciones
        ↓
Actualiza estimation-reference.md
        ↓
Próximo /pdp-generator → más preciso 🎯
```

## Prerequisitos

- Claude Code instalado (Pro o Max recomendado)
- Node.js + npm
- Biome: `npm install -D @biomejs/biome`
- Python 3 (para script de PDP Excel)
- jq (para hooks): `brew install jq`
- openpyxl (para Excel): `pip install openpyxl`

## Notas

- Los hooks de Biome asumen que usas Biome. Si usas ESLint/Prettier,
  edita global-settings.json y cambia los comandos.
- Las notificaciones usan `osascript` (macOS). En Linux, cambia por
  `notify-send`.
- Prettier está en deny por defecto. Si lo necesitas, quítalo de
  project-settings.json.
