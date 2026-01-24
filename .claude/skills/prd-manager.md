# PRD Manager Skill

Gestiona el desarrollo guiado por el PRD (Product Requirements Document) del proyecto.

**Trigger:** Usa este skill cuando el usuario ejecute `/prd` o pregunte sobre el estado del PRD, próximos features, o quiera generar issues desde el PRD.

---

## Comandos Disponibles

### `/prd status`
Muestra el estado actual del proyecto basado en el PRD.

**Acciones:**
1. Leer el archivo `PRD_RFP_Intelligence_Analyzer.md`
2. Identificar la fase actual (MVP, Enriquecimiento, Inteligencia Avanzada)
3. Listar requisitos por estado (completado/pendiente)
4. Mostrar métricas de progreso

**Output esperado:**
```
## Estado del Proyecto: RFP Intelligence Analyzer

### Fase Actual: MVP (Fase 1)
Progreso: 3/14 requisitos completados (21%)

### Requisitos Must Have
- [ ] RF-001: Upload de RFP
- [ ] RF-002: Formulario guiado
- [x] RF-003: Generación de embeddings
...

### Próximo Hito
Fase 1 MVP - Target: 8-10 semanas
```

---

### `/prd next`
Sugiere el próximo feature a implementar basado en prioridad y dependencias.

**Acciones:**
1. Analizar requisitos pendientes del PRD
2. Considerar dependencias técnicas
3. Priorizar según MoSCoW (Must > Should > Could)
4. Verificar qué módulos ya existen en el código

**Output esperado:**
```
## Próximo Feature Recomendado

### RF-001: Upload de RFP
**Prioridad:** Must Have
**Descripción:** Soporte para PDF, Word, Excel. Extracción automática de texto.

**Dependencias técnicas:**
- Ninguna (es fundacional)

**Módulos a crear:**
- Backend: `app/modules/rfp/` (models, schemas, repository, service)
- Frontend: `src/domains/rfp/` (types, services, api, components)

**¿Comenzar implementación?** Usa `/launch-backend` para el módulo backend.
```

---

### `/prd issues [--phase PHASE]`
Genera GitHub issues desde los requisitos del PRD.

**Parámetros:**
- `--phase`: MVP | Enriquecimiento | Avanzada (default: MVP)

**Acciones:**
1. Leer requisitos del PRD para la fase especificada
2. Generar issue para cada requisito con:
   - Título: `[RF-XXX] Descripción corta`
   - Body: Descripción completa + Acceptance Criteria
   - Labels: `must-have`, `should-have`, `could-have`, `backend`, `frontend`
3. **CONFIRMAR** con el usuario antes de crear
4. Usar `gh issue create` para crear en GitHub

**Template de Issue:**
```markdown
## Descripción
{descripción del requisito}

## Contexto del PRD
- **ID:** RF-XXX
- **Fase:** MVP
- **Prioridad:** Must Have

## Acceptance Criteria
- [ ] {criterio 1}
- [ ] {criterio 2}
- [ ] {criterio 3}

## Notas Técnicas
{consideraciones de implementación}

---
Generado desde PRD v1.0
```

---

### `/prd sync`
Sincroniza el estado del PRD con los issues de GitHub.

**Acciones:**
1. Leer issues existentes con labels del PRD
2. Comparar con requisitos del PRD
3. Identificar:
   - Issues faltantes
   - Issues completados
   - Discrepancias
4. Sugerir acciones de sincronización

---

## Mapeo PRD → GitHub

| PRD Element | GitHub Element |
|-------------|----------------|
| Fase (MVP, etc.) | Milestone |
| Requisito (RF-XXX) | Issue |
| Must/Should/Could | Label (priority) |
| Backend/Frontend | Label (area) |
| Caso de Uso | Issue body (Acceptance Criteria) |

---

## Labels Recomendados

Asegurar que existan estos labels en el repo:

```bash
# Prioridad
gh label create "must-have" --color "d73a4a" --description "MVP - Required"
gh label create "should-have" --color "fbca04" --description "High priority"
gh label create "could-have" --color "0e8a16" --description "Nice to have"

# Área
gh label create "backend" --color "1d76db" --description "Backend/API work"
gh label create "frontend" --color "5319e7" --description "Frontend/UI work"
gh label create "integration" --color "006b75" --description "External integrations"

# Tipo
gh label create "feature" --color "a2eeef" --description "New feature"
gh label create "enhancement" --color "84b6eb" --description "Improvement"
```

---

## Flujo de Trabajo

```
1. /prd status     → Ver estado actual
2. /prd next       → Ver próximo feature
3. /prd issues     → Generar issues (con confirmación)
4. /sprint create  → Organizar en sprint
5. Desarrollar     → /launch-backend, /launch-frontend
6. /prd sync       → Actualizar estado
```

---

## Archivo PRD

El PRD del proyecto está en: `PRD_RFP_Intelligence_Analyzer.md`

### Estructura del PRD:
- **Sección 4:** Requisitos Funcionales (RF-001 a RF-026)
- **Sección 10:** Roadmap por Fases
  - Fase 1: MVP (8-10 semanas)
  - Fase 2: Enriquecimiento (6-8 semanas)
  - Fase 3: Inteligencia Avanzada (8-10 semanas)

### Requisitos por Fase:

**Fase 1 - MVP (Must Have):**
- RF-001 a RF-014

**Fase 2 - Enriquecimiento (Should Have):**
- RF-015 a RF-021

**Fase 3 - Inteligencia Avanzada (Could Have):**
- RF-022 a RF-026
