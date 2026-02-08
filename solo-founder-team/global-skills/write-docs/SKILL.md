---
name: write-docs
description: >
  Genera o actualiza documentación del proyecto. README, API docs,
  architecture decisions. Usar cuando el founder dice "documenta",
  "README", "docs", "documentación".
---

# Documentar: $ARGUMENTS

## Instrucciones

Como solo founder, la documentación tiene dos audiencias:
1. **Tú en 3 meses** (cuando olvides cómo funciona algo)
2. **Claude Code** (para mantener contexto en futuras sesiones)

### Tipos de documentación

- **README.md**: Setup, cómo correr, cómo deployar, variables de entorno
- **docs/architecture.md**: Stack, decisiones técnicas, diagrama Mermaid
- **docs/decisions/**: ADRs para decisiones importantes (usa /log-decision)
- **CLAUDE.md**: Reglas para Claude (actualizar cuando se aprende algo nuevo)
- **Inline comments**: Solo para "por qué", nunca para "qué"

### Regla de oro
Documenta lo que no es obvio del código.
No documentes lo que TypeScript ya expresa.

### Para README.md incluir siempre:
```
## Setup
1. Clonar repo
2. Instalar dependencias: npm install
3. Copiar .env.example a .env y configurar variables
4. Correr desarrollo: npm run dev

## Scripts disponibles
- npm run dev — desarrollo local
- npm run build — build de producción
- npm run lint — biome check
- npm run test — tests

## Stack
[lista de tecnologías con versiones]

## Arquitectura
[diagrama o descripción breve]
```
