---
name: write-spec
description: >
  Genera una especificación formal para features complejas antes de
  planificar. Usar SOLO cuando la feature toca 10+ archivos, tiene
  integraciones externas, lógica de negocio compleja, o múltiples
  stakeholders. NO usar para CRUDs simples, UI changes, o fixes.
  Trigger: "spec", "especificación", "write spec", "necesito definir
  bien esto antes", "esto es complejo".
---

# Spec: $ARGUMENTS

## Cuándo usar este skill

✅ Usar cuando:
- Feature toca 10+ archivos o 3+ módulos
- Hay integraciones externas (APIs, webhooks, servicios)
- Lógica de negocio con reglas y edge cases
- Migración de datos o cambio de schema
- Feature que afecta auth, pagos, o datos sensibles
- Vas a delegarlo a subagents paralelos

❌ NO usar cuando:
- CRUD simple
- Cambio de UI/estilos
- Bug fix
- Feature < 5 archivos con lógica clara
→ En esos casos, ve directo a /plan-feature

## Instrucciones

### Fase 1: Discovery (con el founder)

Preguntar solo lo necesario:
1. "¿Qué problema resuelve para el usuario final?"
2. "¿Hay restricciones técnicas o de negocio?"
3. "¿Qué NO debe hacer?" (out of scope)

Si hay repo, usar Explore para escanear el código afectado.

### Fase 2: Generar Spec

Crear specs/[nombre-feature].md (máximo 1-2 páginas):

```markdown
# Spec: [Nombre de la Feature]

**Autor**: [nombre]
**Fecha**: [hoy]
**Estado**: Draft | Aprobada | Implementada
**Complejidad**: Alta | Muy Alta

## Problema
[2-3 oraciones. Qué problema existe y para quién.]

## Solución Propuesta
[Descripción concisa de la solución. Incluir diagrama Mermaid
si hay flujo complejo o interacción entre servicios.]

## Acceptance Criteria
Usar formato EARS cuando aplique:
- WHEN [trigger], the system SHALL [behavior]
- WHILE [state], the system SHALL [behavior]
- WHERE [condition], the system SHALL [behavior]

Ejemplos concretos:
1. WHEN usuario sube archivo > 10MB, SHALL mostrar error con límite
2. WHEN webhook falla 3 veces, SHALL pausar y notificar por email
3. WHILE usuario no verificado, SHALL bloquear acceso a billing

## Interfaces / Contratos
[Endpoints, schemas, payloads — solo si aplica]

```typescript
// POST /api/v1/feature
interface Request {
  // ...
}
interface Response {
  // ...
}
```

## Out of Scope
- [Explícito: qué NO se va a hacer]

## Dependencias
- [Servicios externos, APIs, otros módulos]

## Riesgos
| Riesgo | Impacto | Mitigación |
|--------|---------|------------|

## Tasks Preview
[Lista numerada de alto nivel, ~5-8 tareas máximo.
El detalle fino lo hace /plan-feature después.]
1. [tarea 1]
2. [tarea 2]
...
```

### Fase 3: Review

Presentar al founder y preguntar:
- "¿Los acceptance criteria cubren lo que necesitas?"
- "¿Falta algo en out of scope?"
- "¿Apruebas para pasar a /plan-feature?"

### Fase 4: Handoff

Una vez aprobada:
1. Marcar estado como "Aprobada"
2. Sugerir: "Corro /plan-feature @specs/[nombre].md para generar el plan?"
3. El /plan-feature lee el spec y genera el plan detallado en active-plan.md
4. Si la feature es grande, sugerir pattern de subagents:
   "Cada tarea del plan la puede ejecutar un subagent aislado
   con commit atómico después de cada una."

## Reglas

1. **Máximo 2 páginas** — si necesitas más, la feature es demasiado grande.
   Divídela en 2+ specs.
2. **Acceptance criteria > prosa** — el spec es un contrato, no un ensayo.
   Cada criterio debe ser testeable.
3. **No sobre-especificar** — dejar espacio para decisiones de implementación.
   El spec dice QUÉ, no CÓMO (salvo restricciones técnicas reales).
4. **Out of scope es obligatorio** — protege al founder de scope creep,
   especialmente en proyectos de consultoría.
5. **El spec se versiona** — vive en specs/ dentro del repo, se commitea,
   y se puede referenciar desde PRs y ADRs.
