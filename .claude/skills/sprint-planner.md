# Sprint Planner Skill

Gestiona sprints usando GitHub Projects, Milestones e Issues.

**Trigger:** Usa este skill cuando el usuario ejecute `/sprint` o quiera crear, gestionar o cerrar sprints del proyecto.

---

## Comandos Disponibles

### `/sprint create [--name NAME]`
Crea un nuevo sprint con milestone y project board.

**Parámetros:**
- `--name`: Nombre del sprint (ej: "Sprint 1 - MVP Core")

**Acciones:**
1. Listar issues disponibles (sin milestone asignado)
2. Permitir selección de issues para el sprint
3. Crear milestone en GitHub
4. Agregar issues al project board
5. Confirmar antes de ejecutar

**Flujo:**
```
1. Mostrar issues disponibles agrupados por área
2. Usuario selecciona issues para el sprint
3. Confirmar selección
4. Crear milestone: gh milestone create "Sprint 1" --due-date DATE
5. Asignar issues al milestone
6. Agregar issues al project board
```

**Output esperado:**
```
## Creando Sprint: Sprint 1 - MVP Core

### Issues Disponibles (sin asignar)

**Backend (8 issues)**
- [ ] #1 [RF-001] Upload de RFP
- [ ] #2 [RF-002] Formulario guiado
- [ ] #3 [RF-003] Generación de embeddings
...

**Frontend (6 issues)**
- [ ] #9 [UI-001] Página de upload
- [ ] #10 [UI-002] Formulario de contexto
...

**¿Qué issues incluir en el sprint?**
(Selecciona por número o rango: 1,2,3 o 1-5)
```

---

### `/sprint status`
Muestra el estado actual del sprint activo.

**Acciones:**
1. Identificar milestone activo (más reciente no cerrado)
2. Obtener issues del milestone
3. Agrupar por estado (Open, In Progress, Done)
4. Calcular métricas

**Output esperado:**
```
## Sprint Status: Sprint 1 - MVP Core

### Progreso
[████████░░░░░░░░░░░░] 40% (4/10 issues)

### Por Estado
| Estado      | Issues |
|-------------|--------|
| Done        | 4      |
| In Progress | 2      |
| Open        | 4      |

### Issues Completados
- [x] #1 [RF-001] Upload de RFP
- [x] #2 [RF-002] Formulario guiado
...

### En Progreso
- [ ] #5 [RF-005] Extracción de requisitos (assigned: @user)

### Pendientes
- [ ] #6 [RF-006] Detección de ambigüedad
...

### Métricas
- Días restantes: 5
- Velocity: 2 issues/día
- Estimado: Sprint ON TRACK
```

---

### `/sprint close`
Cierra el sprint actual y genera reporte.

**Acciones:**
1. Obtener issues del milestone
2. Separar completados vs incompletos
3. Mover issues incompletos al backlog (quitar milestone)
4. Cerrar milestone
5. Generar reporte markdown

**Output esperado:**
```
## Cerrando Sprint: Sprint 1 - MVP Core

### Resumen
- **Completados:** 8/10 issues (80%)
- **Movidos a backlog:** 2 issues

### Issues Completados
- #1 [RF-001] Upload de RFP
- #2 [RF-002] Formulario guiado
...

### Movidos a Backlog (incompletos)
- #9 [UI-005] Búsqueda en base de conocimiento
- #10 [UI-006] Descarga de documentos

### Acciones
1. [ ] Cerrar milestone "Sprint 1"
2. [ ] Remover milestone de issues incompletos
3. [ ] Generar resumen en CHANGELOG.md

**¿Confirmar cierre del sprint?**
```

---

### `/sprint backlog`
Muestra issues en el backlog (sin milestone asignado).

**Output esperado:**
```
## Backlog

### Must Have (8 issues)
- [ ] #15 [RF-007] Búsqueda de info financiera
- [ ] #16 [RF-008] Búsqueda de noticias
...

### Should Have (7 issues)
- [ ] #22 [RF-015] Red flags
- [ ] #23 [RF-016] Preguntas de clarificación
...

### Could Have (5 issues)
- [ ] #29 [RF-022] Teaching opportunity
...

Total: 20 issues en backlog
```

---

## Comandos GitHub CLI

### Milestone
```bash
# Crear milestone
gh milestone create "Sprint 1 - MVP Core" --due-date 2026-02-14

# Listar milestones
gh milestone list

# Ver issues de un milestone
gh issue list --milestone "Sprint 1"

# Cerrar milestone
gh milestone close "Sprint 1"
```

### Issues
```bash
# Asignar milestone a issue
gh issue edit ISSUE_NUMBER --milestone "Sprint 1"

# Remover milestone
gh issue edit ISSUE_NUMBER --milestone ""

# Listar issues sin milestone
gh issue list --milestone ""
```

### Projects
```bash
# Crear project
gh project create --title "RFP Intelligence Analyzer" --owner @me

# Listar projects
gh project list

# Agregar issue a project
gh project item-add PROJECT_NUMBER --owner @me --url ISSUE_URL

# Ver items del project
gh project item-list PROJECT_NUMBER --owner @me
```

---

## Flujo de Sprint Completo

```
┌─────────────────────────────────────────┐
│           SPRINT PLANNING               │
├─────────────────────────────────────────┤
│ 1. /prd status                          │
│    → Ver requisitos pendientes          │
│                                         │
│ 2. /sprint backlog                      │
│    → Ver issues disponibles             │
│                                         │
│ 3. /sprint create --name "Sprint N"     │
│    → Seleccionar issues                 │
│    → Crear milestone                    │
│    → Agregar a project board            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           SPRINT EXECUTION              │
├─────────────────────────────────────────┤
│ 4. Seleccionar issue para trabajar      │
│    → gh issue view #N                   │
│                                         │
│ 5. Implementar con /launch-backend      │
│    o /launch-frontend                   │
│                                         │
│ 6. Commit con referencia al issue       │
│    → git commit -m "feat: ... #N"       │
│                                         │
│ 7. /sprint status                       │
│    → Ver progreso del sprint            │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│           SPRINT CLOSE                  │
├─────────────────────────────────────────┤
│ 8. /sprint close                        │
│    → Revisar completados/incompletos    │
│    → Mover incompletos a backlog        │
│    → Cerrar milestone                   │
│    → Generar reporte                    │
│                                         │
│ 9. Retrospectiva (opcional)             │
│    → Lecciones aprendidas               │
│    → Ajustar velocity estimado          │
└─────────────────────────────────────────┘
```

---

## Configuración Inicial

Antes de usar el skill, asegurar que existe:

1. **GitHub Project:**
```bash
gh project create --title "RFP Intelligence Analyzer" --owner @me
```

2. **Labels de prioridad:**
```bash
gh label create "must-have" --color "d73a4a"
gh label create "should-have" --color "fbca04"
gh label create "could-have" --color "0e8a16"
```

3. **Labels de área:**
```bash
gh label create "backend" --color "1d76db"
gh label create "frontend" --color "5319e7"
gh label create "integration" --color "006b75"
```

---

## Integración con Otros Skills

| Skill | Uso en Sprint |
|-------|---------------|
| `/prd` | Ver requisitos para planificar sprint |
| `/launch-backend` | Implementar issues de backend |
| `/launch-frontend` | Implementar issues de frontend |
