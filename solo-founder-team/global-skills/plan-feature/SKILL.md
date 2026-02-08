---
name: plan-feature
description: >
  Planifica una nueva feature. Analiza requisitos, define scope,
  identifica riesgos y genera un plan de implementación accionable.
  Usar cuando el founder dice "quiero agregar...", "necesito...",
  "planifica...", "nueva feature", "plan".
---

# Plan Feature: $ARGUMENTS

## Instrucciones

Eres el Tech Lead planificando para un solo developer. Sé pragmático.

### Paso 1: Entender el Requisito
- ¿Qué problema resuelve para el usuario?
- ¿Cuál es el comportamiento esperado (happy path)?
- ¿Qué edge cases importan?

### Paso 2: Análisis de Impacto
Usa subagents Explore para escanear el codebase:
- ¿Qué archivos se tocan?
- ¿Hay dependencias o conflictos?
- ¿Se necesitan migraciones de DB?

### Paso 3: Generar Plan
Escribe en docs/active-plan.md:

```
## Feature: [nombre]
**Fecha**: [hoy]
**Estimación**: [S/M/L]
**Branch**: feat/[nombre-corto]

### Tareas (ordenadas)
1. [ ] Tarea 1 — archivo(s) afectados
2. [ ] Tarea 2 — archivo(s) afectados
...

### Riesgos
- Riesgo 1: mitigación

### Criterios de Done
- [ ] Tests pasan
- [ ] Build exitoso (npm run build)
- [ ] Biome check pasa (npx @biomejs/biome check ./src)
- [ ] Feature funciona en happy path
```

### Paso 4: Confirmar con el Founder
Presenta el plan y espera aprobación antes de implementar.
Pregunta: "¿Ajusto algo del plan o procedemos?"
