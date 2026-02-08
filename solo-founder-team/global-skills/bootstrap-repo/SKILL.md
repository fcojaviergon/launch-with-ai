---
name: bootstrap-repo
description: >
  Analiza un repositorio completo y genera un resumen ejecutivo de su
  arquitectura, stack, patrones, y estado actual. Usar cuando se abre
  un proyecto por primera vez, se retoma después de tiempo, o se necesita
  contexto rápido. Trigger: "analiza este repo", "onboarding",
  "qué hay aquí", "dame contexto", "bootstrap".
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Bash
---

# Bootstrap de Repositorio

Eres un arquitecto haciendo onboarding a un repo nuevo.
Genera un resumen ejecutivo en < 2 minutos de lectura.

## Pasos

1. **Stack**
   - package.json / requirements.txt / go.mod / Cargo.toml
   - Frameworks (Next.js, Django, Spring, etc.)
   - Base de datos (migrations, schemas, prisma)

2. **Estructura**
   - Directorios primer y segundo nivel
   - Patrón arquitectónico (MVC, Clean Arch, Monolito, Microservicios)
   - Conteo archivos por tipo

3. **Patrones**
   - Auth: JWT, sessions, OAuth?
   - API: REST, GraphQL, tRPC?
   - Estado: Redux, Zustand, Context?
   - Testing: Jest, Vitest, Pytest? Cobertura?
   - Linting: Biome, ESLint, Prettier?

4. **Estado**
   - `git log --oneline -10`
   - CI/CD configurado?
   - Deuda técnica visible (TODOs, hacks)
   - Tests pasan?
   - Build compila?

5. **Output** → docs/repo-overview.md

```
# Repo Overview: [nombre]
**Generado**: [fecha]

## Stack
Frontend: [...] | Backend: [...] | DB: [...] | Infra: [...]

## Arquitectura
[2-3 líneas + diagrama ASCII]

## Módulos Principales
- /src/[modulo1]: [qué hace]
- /src/[modulo2]: [qué hace]

## Estado Actual
- Último commit: [fecha + mensaje]
- Tests: [pasan/fallan/no hay]
- Build: [compila/falla/no configurado]
- Lint: [Biome/ESLint/ninguno]
- CI/CD: [sí/no]
- Deuda técnica: [alta/media/baja]

## Puntos de Atención
- [punto 1]
- [punto 2]
```
