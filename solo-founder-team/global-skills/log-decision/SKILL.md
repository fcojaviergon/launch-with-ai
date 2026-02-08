---
name: log-decision
description: >
  Registra una decisión técnica o de producto como ADR. Usar cuando se
  toma una decisión importante: elegir librería, cambiar patrón, definir
  API, etc. Trigger: "registra decisión", "ADR", "por qué elegimos",
  "decisión técnica", "log decision".
---

# Registrar Decisión: $ARGUMENTS

## Instrucciones

Crear ADR en docs/decisions/YYYY-MM-DD-[slug].md:

```markdown
# ADR: [Título]

**Fecha**: [hoy]
**Estado**: Aceptada | Propuesta | Reemplazada por [link]

## Problema
[1-2 oraciones]

## Opciones Consideradas
1. **[Opción A]**: [breve]
   - ✅ Pro: ...
   - ❌ Con: ...
2. **[Opción B]**: [breve]
   - ✅ Pro: ...
   - ❌ Con: ...

## Decisión
Elegimos **[Opción X]** porque [razón en 1 oración].

## Consecuencias
- [Qué cambia]
- [Qué deuda técnica acepta]
- [Cuándo reconsiderar]
```

## Reglas
- Máximo 1 página
- "Consecuencias" es la sección más importante
- Actualizar índice en docs/decisions/README.md
