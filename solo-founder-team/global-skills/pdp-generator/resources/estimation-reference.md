# Tabla de Referencia Rápida de Estimación

## Rangos por Tipo (HH): Min | Típico | Max

### Frontend
| Tarea | Min | Típico | Max |
|-------|-----|--------|-----|
| Componente UI simple | 2 | 3 | 4 |
| Formulario estándar | 4 | 6 | 8 |
| Formulario complejo | 8 | 12 | 16 |
| Vista listado + filtros | 8 | 12 | 16 |
| Dashboard gráficos | 16 | 24 | 32 |
| Wizard multi-step | 16 | 20 | 24 |
| Mapa interactivo | 12 | 18 | 24 |

### Backend
| Tarea | Min | Típico | Max |
|-------|-----|--------|-----|
| CRUD simple | 4 | 6 | 8 |
| CRUD validaciones | 8 | 12 | 16 |
| API lógica compleja | 16 | 24 | 32 |
| Integración REST | 8 | 16 | 24 |
| Integración SOAP | 16 | 28 | 40 |
| Notificaciones | 16 | 20 | 24 |
| Roles y permisos | 16 | 24 | 32 |
| Background jobs | 12 | 18 | 24 |
| File processing | 8 | 12 | 16 |

### Infra
| Tarea | Min | Típico | Max |
|-------|-----|--------|-----|
| Docker setup | 4 | 6 | 8 |
| CI/CD básico | 8 | 12 | 16 |
| CI/CD full | 16 | 24 | 32 |
| IaC básico | 16 | 20 | 24 |
| Monitoring | 8 | 12 | 16 |

### QA
| Tarea | Min | Típico | Max |
|-------|-----|--------|-----|
| Unit tests/módulo | 8 | 12 | 16 |
| Integration tests | 12 | 18 | 24 |
| E2E tests | 16 | 24 | 32 |
| Perf testing | 16 | 20 | 24 |

## Multiplicadores
| Factor | × |
|--------|---|
| Greenfield | 1.0 |
| Legacy | 1.3-1.5 |
| Requisitos ambiguos | 1.2-1.4 |
| APIs sin docs | 1.5 |
| Compliance | 1.3 |
| Multi-idioma | 1.2 |
| Multi-tenant | 1.3-1.5 |

## Buffer
| Claridad | % |
|----------|---|
| Bien definido | +15% |
| Moderado | +25% |
| Exploratorio | +35% |
