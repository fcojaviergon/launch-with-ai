---
name: triage-bug
description: >
  Diagnostica y clasifica un bug. Encuentra la causa raíz y propone
  fix. Usar cuando el founder reporta un error, bug, o algo que
  no funciona. Trigger: "bug", "error", "no funciona", "se rompe",
  "falla", "crash".
---

# Triage Bug: $ARGUMENTS

## Instrucciones

1. **Reproducir**: Entender los pasos para reproducir
2. **Localizar**: Usar grep/search para encontrar código relevante
3. **Diagnosticar**: Identificar la causa raíz (no el síntoma)
4. **Clasificar**:
   - 🔥 CRÍTICO: Afecta a todos los usuarios, data loss, security
   - ⚠️ ALTO: Feature rota para muchos usuarios
   - 📋 MEDIO: Bug visible pero con workaround
   - 📝 BAJO: Cosmético o edge case raro
5. **Proponer fix**: Describir el cambio necesario con archivos afectados
6. **Verificar**: Después del fix, correr:
   - Tests relevantes
   - `npx @biomejs/biome check ./src`
   - `npm run build`
7. **Preguntar**: "¿Arreglo ahora o lo agendo?"

Si es CRÍTICO: no preguntes, arréglalo directamente.

## Registro
Agregar el bug en docs/bugs-encontrados.md:
```
### [fecha] - [título corto]
- **Severidad**: [CRÍTICO/ALTO/MEDIO/BAJO]
- **Síntoma**: [qué se observa]
- **Causa raíz**: [por qué pasa]
- **Fix**: [qué se hizo / qué hay que hacer]
- **Archivos**: [archivos afectados]
```
