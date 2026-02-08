---
name: review-code
description: >
  Revisa el código como un senior developer. Busca bugs, problemas
  de seguridad, y oportunidades de simplificación. Verifica convenciones
  del proyecto. Usar antes de mergear o cuando el founder dice
  "revisa", "review", "code review".
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob
---

# Code Review

## Instrucciones

Revisa los cambios como un senior developer pragmático.
No busques perfección, busca problemas reales.

### Obtener contexto
1. `git diff main --stat` para ver el scope del cambio
2. Si el proyecto tiene skills custom de frontend/backend en
   .claude/skills/, revisa que se sigan esas convenciones

### Checklist

1. **Seguridad**: ¿Inputs sin validar? ¿SQL injection? ¿XSS?
   ¿Auth bypass? ¿Secrets hardcodeados?
2. **Bugs**: ¿Null checks? ¿Race conditions? ¿Error handling?
   ¿Tipos incorrectos?
3. **Simplicidad**: ¿Algo se puede simplificar sin perder claridad?
   ¿Hay dead code?
4. **Performance**: ¿N+1 queries? ¿Re-renders innecesarios?
   ¿Bundle size? ¿Imports pesados sin tree-shaking?
5. **Consistencia**: ¿Sigue las convenciones del proyecto?
   ¿Naming correcto? ¿Estructura de carpetas?
6. **Convenciones del proyecto**: ¿El código sigue las convenciones
   definidas en los skills de frontend/backend del proyecto?
7. **Build health**: ¿Hay imports que podrían romper el build?
   ¿Tipos exportados correctamente?

### Output
Clasifica hallazgos en:
- 🔴 BLOCKER: Debe arreglarse antes de mergear
- 🟡 MEJORA: Debería arreglarse, puede ser después
- 💡 SUGERENCIA: Nice to have

NO reportes: estilo cosmético (Biome lo maneja), imports ordering,
o cosas que el linter/formatter atrapa automáticamente.
