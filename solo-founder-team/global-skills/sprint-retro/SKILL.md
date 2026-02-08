---
name: sprint-retro
description: >
  Genera una mini-retrospectiva del sprint o período de trabajo. Analiza
  qué se hizo, qué salió bien/mal, y propone mejoras al CLAUDE.md y
  workflow. Usar al final de cada semana o sprint.
  Trigger: "retro", "retrospectiva", "qué aprendimos", "review semana".
context: fork
agent: Explore
allowed-tools: Read, Grep, Glob, Bash
---

# Sprint Retro

## Pasos

1. **Recopilar datos**
   - `git log --oneline --since="1 week ago"` (o período indicado)
   - docs/active-plan.md: completado vs. planificado
   - docs/decisions/ recientes
   - `grep -r "TODO\|FIXME\|HACK" src/` (nuevos esta semana)

2. **Analizar**
   - Tareas que tomaron más de lo estimado — ¿por qué?
   - Bugs o regresiones — ¿qué los causó?
   - Errores repetidos de Claude → candidatos a reglas CLAUDE.md
   - Build failures — ¿causas comunes?

3. **Generar** docs/retros/YYYY-MM-DD-retro.md

```markdown
# Retro: [Fecha]

## Métricas
- Commits: [N]
- Tareas completadas: [X de Y]
- Bugs encontrados/resueltos: [N/N]
- Build failures: [N]

## ✅ Qué funcionó
- [cosa 1]

## ❌ Qué no funcionó
- [cosa 1]: [por qué] → [acción]

## 🔧 Mejoras al Workflow
- [ ] Agregar a CLAUDE.md: "[regla]"
- [ ] Crear/modificar skill: [cuál]
- [ ] Agregar/ajustar hook: [cuál]

## 📋 Carry-over
- [tarea pendiente]
```

4. **Proponer actualizaciones a CLAUDE.md**
   Si hay errores repetidos, proponer reglas nuevas
   y pedir confirmación antes de editar.

5. **Si hay timesheet (docs/timesheet.csv)**
   Comparar HH reales vs. estimadas por módulo.
   Actualizar estimation-reference.md del PDP si la
   desviación es consistente (>20% en mismo tipo de tarea).
