---
name: commit-ship
description: >
  Prepara y envía los cambios. Genera commit message, crea PR,
  y prepara para deploy. Usar cuando el founder dice "shippea",
  "manda", "commit", "PR", "push", "ship it".
disable-model-invocation: true
---

# Ship: $ARGUMENTS

## Contexto actual
- Branch: !`git branch --show-current`
- Status: !`git status --short`
- Diff stats: !`git diff --stat`

## Pre-flight checks

Antes de commitear, verificar:
1. `npx @biomejs/biome check ./src` → debe pasar
2. `npm run build` → debe compilar
Si alguno falla, arreglar primero. NO shippear código roto.

## Instrucciones

1. Stage los cambios apropiados (git add)
2. Genera commit message con Conventional Commits:
   - Analiza el diff para determinar el tipo (feat/fix/chore/docs/refactor)
   - Scope basado en la carpeta principal afectada
   - Descripción clara y concisa en inglés
   - Body opcional en español si el cambio es complejo
3. Commit
4. Push a origin
5. Crea PR con:
   - Título = commit message
   - Body = resumen de cambios + link al plan si existe
   - Labels apropiados si el repo los usa
6. Reporta: URL del PR y siguiente paso recomendado

## Reglas
- Si el diff es > 500 líneas, DETENTE y pregunta si debemos
  dividir en commits más pequeños
- No incluir archivos de build (.next/, dist/, node_modules/)
- No incluir .env ni secrets
- Si hay archivos nuevos no trackeados que parecen temporales, preguntar
