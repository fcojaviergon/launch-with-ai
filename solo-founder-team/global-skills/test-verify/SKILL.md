---
name: test-verify
description: >
  Escribe tests y verifica que la implementación funciona.
  Incluye verificación de build y biome.
  Usar después de implementar, o cuando el founder dice
  "testea", "verifica", "check", "funciona?".
context: fork
agent: general-purpose
allowed-tools: Read, Grep, Glob, Bash, Write
---

# Verificar Implementación

## Instrucciones

1. Lee docs/active-plan.md para entender los criterios de done
2. Identifica qué se implementó revisando los cambios recientes:
   - `git diff main --name-only`
3. Para cada componente/función modificada:
   - ¿Tiene test? Si no, escribe uno para el happy path
   - ¿El test cubre el edge case más peligroso? Agrega si no
4. Ejecuta la suite de tests completa
5. Si hay errores, arregla el código (no el test)

## Verificación de Build & Lint (OBLIGATORIO)

Después de que los tests pasen, ejecutar en este orden:

1. **Biome check**:
   ```bash
   npx @biomejs/biome check ./src
   ```
   - Si hay errores de formato: `npx @biomejs/biome check --write ./src`
   - Si hay errores de lint: arreglar manualmente

2. **TypeScript check** (si aplica):
   ```bash
   npx tsc --noEmit
   ```
   - Arreglar todos los errores de tipo

3. **Build**:
   ```bash
   npm run build
   ```
   - Si falla, analizar el error y arreglar
   - Errores comunes: imports rotos, tipos faltantes, variables no usadas

4. Solo si los 3 pasan → reportar como verificado

## Filosofía de Testing (Solo Founder)
- Tests unitarios para lógica de negocio pura
- Tests de integración para flujos críticos (auth, payments, data mutations)
- NO tests para: componentes UI puros, layouts, estilos
- Un test que atrapa un bug real > 10 tests de cobertura superficial

## Output
Reporta:
- Tests escritos y resultado
- Estado de biome check
- Estado de tsc
- Estado del build
- Veredicto: ✅ VERIFICADO o ❌ PENDIENTE [razón]
