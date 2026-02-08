---
name: implement
description: >
  Implementa tareas del plan activo. Lee docs/active-plan.md y ejecuta
  la siguiente tarea pendiente. Sigue las convenciones del proyecto.
  Usar cuando el founder dice "implementa", "codea", "siguiente tarea",
  "avanza", "develop".
---

# Implementar: $ARGUMENTS

## Antes de implementar

1. Si el proyecto tiene skills custom de frontend o backend en
   .claude/skills/, cárgalos primero y sigue sus convenciones
   como prioridad sobre las genéricas.
2. Lee CLAUDE.md para contexto general del proyecto.

## Instrucciones

1. Lee docs/active-plan.md para entender el contexto completo
2. Identifica la siguiente tarea pendiente ([ ])
3. Crea branch si no existe: `git checkout -b feat/[nombre]`
4. Implementa siguiendo las convenciones del proyecto
5. Después de cada archivo modificado, verifica que compila:
   - `npx @biomejs/biome check --write [archivo]`
   - `npx tsc --noEmit` (si aplica)
6. Marca la tarea como completada [x] en active-plan.md
7. Reporta: qué hiciste, qué archivos tocaste, qué sigue

## Reglas
- Cambios incrementales. Un commit por tarea.
- Si una tarea es demasiado grande, divídela y actualiza el plan.
- Si encuentras un bug existente, no lo arregles ahora.
  Crea una nota en docs/bugs-encontrados.md.
- Conventional commits: feat(scope): descripción
- Al terminar la última tarea del plan, ejecutar:
  1. `npx @biomejs/biome check ./src`
  2. `npm run build`
  Ambos deben pasar antes de considerar la implementación completa.
