---
name: time-track
description: >
  Registra tiempo trabajado en una tarea o módulo. Mantiene log de
  horas reales para comparar contra estimaciones del PDP y facturación.
  Trigger: "registra tiempo", "time track", "horas", "trabajé en",
  "cuánto llevamos", "reporte horas".
---

# Time Track: $ARGUMENTS

## Instrucciones

### Registrar tiempo
Agregar línea en docs/timesheet.csv:
```
fecha,proyecto,modulo,tarea,hh_reales,hh_estimadas,notas
```
Si no existe, crearlo con los headers.

### Consultar avance ("cuánto llevamos?")
Leer timesheet.csv, agrupar por módulo, comparar con PDP si existe:

```
| Módulo | HH Est. | HH Real | Desviación | Estado |
|--------|---------|---------|------------|--------|
| Auth   | 32      | 28      | -12%       | ✅ OK  |
| Core   | 80      | 92      | +15%       | ⚠️     |
| TOTAL  | 152     | 132     | -13%       | ✅ OK  |
```

### Reporte mensual ("reporte de horas")
Resumen agrupado por proyecto y módulo del mes.

### Alerta automática
Si desviación real > +25% en un módulo, alertar proactivamente
y sugerir revisar scope o estimación.
