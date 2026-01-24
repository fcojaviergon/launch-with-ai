# Product Requirements Document
# RFP Intelligence Analyzer

**Plataforma de Análisis Inteligente de RFPs para Consultorías de Tecnología**

---

| Campo | Valor |
|-------|-------|
| Versión | 1.0 |
| Fecha | Enero 2026 |
| Estado | Draft |

---

## Tabla de Contenidos

1. [Visión y Objetivos](#1-visión-y-objetivos)
2. [Usuarios y Personas](#2-usuarios-y-personas)
3. [Casos de Uso Detallados](#3-casos-de-uso-detallados)
4. [Requisitos Funcionales](#4-requisitos-funcionales)
5. [Requisitos No Funcionales](#5-requisitos-no-funcionales)
6. [Flujos de Usuario](#6-flujos-de-usuario)
7. [Modelo de Datos](#7-modelo-de-datos)
8. [Integraciones Externas](#8-integraciones-externas)
9. [Métricas de Éxito](#9-métricas-de-éxito)
10. [Roadmap por Fases](#10-roadmap-por-fases)
11. [Riesgos y Mitigaciones](#11-riesgos-y-mitigaciones)
12. [Fuera de Alcance (v1)](#12-fuera-de-alcance-v1)
13. [Apéndice: Detalle de Formularios](#13-apéndice-detalle-de-formularios)

---

## 1. Visión y Objetivos

### 1.1 Visión del Producto

RFP Intelligence Analyzer es una plataforma de análisis inteligente que transforma la manera en que las consultorías de tecnología evalúan y responden a oportunidades de negocio. Mediante el uso de inteligencia artificial, embeddings semánticos y enriquecimiento de datos externos, la plataforma permite entender no solo lo que el cliente pide explícitamente, sino también los dolores no declarados, requisitos implícitos y el contexto estratégico de cada oportunidad.

### 1.2 Problema que Resuelve

Un RFP representa solo la punta del iceberg. Lo que el cliente escribe rara vez captura lo que realmente necesita, teme o valora. Los equipos comerciales invierten horas analizando documentos, buscando información de contexto y tratando de inferir lo que el cliente no dice. Este proceso es manual, inconsistente y no aprovecha el conocimiento acumulado de proyectos anteriores.

### 1.3 Objetivos del Producto

- Reducir en un **60%** el tiempo de análisis inicial de un RFP
- Incrementar el **win rate** mediante mejor calificación de oportunidades
- Capitalizar el **conocimiento histórico** de la organización en propuestas pasadas
- Identificar sistemáticamente **requisitos implícitos y dolores no declarados**
- Proveer **inteligencia de mercado y competitiva** de manera automática
- Estandarizar el proceso de análisis usando metodologías probadas (SPIN Selling, Challenger Sale)

---

## 2. Usuarios y Personas

### 2.1 Persona Principal: Ejecutivo Comercial / Pre-Sales

| Atributo | Descripción |
|----------|-------------|
| **Rol** | Ejecutivo de ventas, consultor pre-sales, líder de propuestas |
| **Responsabilidad** | Calificar oportunidades, liderar respuestas a RFPs, coordinar equipos técnicos |
| **Frustraciones** | Tiempo limitado para analizar cada RFP, falta de contexto histórico, dificultad para encontrar información relevante |
| **Necesidades** | Análisis rápido, insights accionables, acceso a proyectos similares, información de mercado |

### 2.2 Persona Secundaria: Director Comercial

| Atributo | Descripción |
|----------|-------------|
| **Rol** | Director de ventas, VP comercial |
| **Responsabilidad** | Definir estrategia go/no-go, asignar recursos, supervisar pipeline |
| **Frustraciones** | Visibilidad limitada sobre calidad de oportunidades, decisiones basadas en intuición |
| **Necesidades** | Métricas de calificación, scoring de oportunidades, benchmarks de mercado |

### 2.3 Persona de Administración: Knowledge Manager

| Atributo | Descripción |
|----------|-------------|
| **Rol** | Administrador de conocimiento, PMO, operaciones |
| **Responsabilidad** | Mantener base de conocimiento actualizada, cargar propuestas históricas |
| **Frustraciones** | Información dispersa, falta de estructura, metadata incompleta |
| **Necesidades** | Herramientas de carga masiva, auto-extracción de metadata, validación de datos |

---

## 3. Casos de Uso Detallados

### 3.1 CU-01: Analizar RFP con Documento

**Actor:** Ejecutivo Comercial

**Trigger:** Recibe un RFP de un cliente potencial

**Flujo Principal:**
1. Usuario sube documento RFP (PDF, Word, Excel)
2. Sistema extrae automáticamente: nombre del cliente, industria, tipo de proyecto, fechas, requisitos
3. Sistema busca información pública del cliente (financieros, noticias, perfiles LinkedIn)
4. Sistema busca RFPs similares en la base de conocimiento
5. Sistema genera análisis completo con indicador de calidad
6. Usuario revisa análisis y opcionalmente completa información adicional
7. Sistema regenera análisis enriquecido si hay nueva información

**Resultado:** Dashboard de análisis completo con insights accionables

---

### 3.2 CU-02: Analizar Oportunidad sin Documento

**Actor:** Ejecutivo Comercial

**Trigger:** Conoce de una oportunidad pero no tiene RFP formal

**Flujo Principal:**
1. Usuario selecciona opción de análisis sin documento
2. Sistema presenta formulario guiado basado en SPIN Selling y Challenger Sale
3. Usuario completa información conocida, puede omitir campos desconocidos
4. Sistema busca información pública y proyectos similares
5. Sistema genera análisis con indicador de confianza según completitud
6. Usuario puede iterar agregando más información

**Resultado:** Análisis parcial con recomendaciones de qué información buscar

---

### 3.3 CU-03: Buscar en Base de Conocimiento

**Actor:** Ejecutivo Comercial

**Trigger:** Necesita encontrar proyectos similares para referencia

**Flujo Principal:**
1. Usuario ingresa búsqueda en lenguaje natural (ej: "proyectos de migración S/4HANA en Oil&Gas")
2. Sistema realiza búsqueda semántica en base de conocimiento
3. Sistema presenta resultados con metadata: cliente, industria, tipo, valorización, cronograma, alcance, resultado
4. Usuario puede filtrar por industria, tipo de proyecto, rango de fechas, resultado (ganado/perdido)
5. Usuario puede ver resumen ejecutivo de cada proyecto
6. Usuario puede descargar documentos originales (RFP, propuesta, presentación)

**Resultado:** Lista de proyectos relevantes con metadata completa y opción de descarga

---

### 3.4 CU-04: Cargar Propuestas Históricas

**Actor:** Knowledge Manager

**Trigger:** Necesita poblar base de conocimiento con histórico

**Flujo Principal:**
1. Usuario selecciona carpetas o archivos para carga masiva
2. Sistema procesa documentos y extrae metadata automáticamente
3. Sistema clasifica documentos (RFP, propuesta, contrato, presentación)
4. Sistema presenta metadata inferida para validación
5. Usuario corrige o completa metadata (resultado, precio final, lecciones)
6. Sistema genera embeddings y almacena en base de conocimiento
7. Sistema detecta duplicados y versiones

**Resultado:** Base de conocimiento actualizada con nuevos documentos

---

## 4. Requisitos Funcionales

Priorizados usando metodología MoSCoW (Must, Should, Could, Won't).

### 4.1 Must Have (MVP)

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-001 | Upload de RFP | Soporte para PDF, Word, Excel. Extracción automática de texto |
| RF-002 | Formulario guiado | Basado en SPIN Selling y Challenger Sale, todos los campos opcionales |
| RF-003 | Generación de embeddings | Crear embeddings del documento para búsqueda semántica |
| RF-004 | Búsqueda de RFPs similares | Encontrar proyectos similares en base de conocimiento |
| RF-005 | Extracción de requisitos | Identificar requisitos explícitos, implícitos y no declarados |
| RF-006 | Detección de ambigüedad | Identificar frases vagas y sugerir preguntas de clarificación |
| RF-007 | Búsqueda de info financiera | Obtener estados financieros de fuentes públicas |
| RF-008 | Búsqueda de noticias | Obtener noticias recientes del cliente e industria |
| RF-009 | Identificación de decisores | Buscar 3-4 perfiles relevantes en LinkedIn |
| RF-010 | Análisis de timeline | Comparar fechas solicitadas vs benchmarks |
| RF-011 | Indicador de calidad | Mostrar nivel de confianza del análisis |
| RF-012 | Carga de base de conocimiento | Subir documentos históricos con metadata |
| RF-013 | Búsqueda en base de conocimiento | Búsqueda semántica con filtros y visualización de metadata |
| RF-014 | Descarga de documentos | Descargar documentos originales de la base |

### 4.2 Should Have

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-015 | Red flags | Detectar señales de alerta (RFP fantasma, timeline irreal) |
| RF-016 | Preguntas de clarificación | Generar lista de preguntas clave para hacer al cliente |
| RF-017 | Estrategia de diferenciación | Sugerir mensajes clave para la propuesta |
| RF-018 | Benchmarking sectorial | Comparar con inversiones típicas de la industria |
| RF-019 | Stakeholder mapping | Mapa inicial de tomadores de decisión |
| RF-020 | Scoring de oportunidad | Puntuación 1-10 con justificación |
| RF-021 | Detección de duplicados | Identificar documentos duplicados en carga |

### 4.3 Could Have

| ID | Requisito | Descripción |
|----|-----------|-------------|
| RF-022 | Teaching opportunity | Identificar insights para enseñar al cliente (Challenger Sale) |
| RF-023 | Win themes | Sugerir temas ganadores para la propuesta |
| RF-024 | Competitor landscape | Qué hacen Accenture, IBM, Deloitte en la industria |
| RF-025 | Lecciones aprendidas | Extraer lecciones de proyectos similares |
| RF-026 | Exportar análisis | Exportar dashboard a PDF o PowerPoint |

### 4.4 Won't Have (v1)

| ID | Requisito | Razón de Exclusión |
|----|-----------|-------------------|
| RF-027 | Generación automática de propuesta | Complejidad alta, requiere mucho contexto específico |
| RF-028 | Integración CRM | Puede agregarse en v2 una vez validado el valor |
| RF-029 | Predicción de precio ganador | Requiere datos históricos extensos y validación |
| RF-030 | Análisis de competidores específicos | Información difícil de obtener automáticamente |

---

## 5. Requisitos No Funcionales

| Categoría | Requisito | Métrica |
|-----------|-----------|---------|
| Performance | Tiempo de análisis inicial | < 2 minutos para RFP de 50 páginas |
| Performance | Búsqueda en base de conocimiento | < 3 segundos para 10,000 documentos |
| Disponibilidad | Uptime | 99.5% mensual |
| Escalabilidad | Documentos en base de conocimiento | Soportar hasta 50,000 documentos |
| Seguridad | Autenticación | SSO con proveedores corporativos |
| Seguridad | Datos en tránsito | TLS 1.3 |
| Seguridad | Datos en reposo | Encriptación AES-256 |
| Usabilidad | Tiempo de aprendizaje | < 30 minutos para usuario nuevo |
| Compatibilidad | Navegadores | Chrome, Edge, Safari últimas 2 versiones |

---

## 6. Flujos de Usuario

### 6.1 Flujo Principal: Análisis de RFP

```
┌─────────────────────────────────────────────────────────────────┐
│                      ENTRADA DE DATOS                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   Opción A: Subir RFP          Opción B: Describir Proyecto     │
│   [PDF/Word/Excel]             [Formulario guiado]              │
│         │                              │                        │
│         ▼                              ▼                        │
│   + Formulario de               Formulario completo             │
│     contexto adicional          sin documento                   │
│     (OPCIONAL)                                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PROCESAMIENTO AUTOMÁTICO                           │
│              (sin intervención del usuario)                     │
├─────────────────────────────────────────────────────────────────┤
│  • Extraer todo lo posible del documento                        │
│  • Buscar en base de RFPs históricos                            │
│  • Enriquecer con fuentes públicas                              │
│  • Generar análisis preliminar con LLM                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              PRESENTACIÓN DE RESULTADOS                         │
├─────────────────────────────────────────────────────────────────┤
│  • Dashboard con indicador de calidad                           │
│  • Lo que el sistema YA SABE (inferido)                         │
│  • Lo que NO PUDO INFERIR (gaps)                                │
│  • Formulario OPCIONAL para completar gaps                      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              ENRIQUECIMIENTO (OPCIONAL)                         │
├─────────────────────────────────────────────────────────────────┤
│  Si el vendedor aporta más datos:                               │
│  • Re-procesar con información adicional                        │
│  • Mejorar score de confianza                                   │
│  • Actualizar recomendaciones                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 6.2 Jerarquía de Información

El sistema prioriza la inferencia automática para minimizar la carga del vendedor:

| Nivel | Fuente | Ejemplos |
|-------|--------|----------|
| **1** (Prioridad alta) | Extraído del RFP/Documento | Cliente, fechas, requisitos, montos mencionados |
| **2** | Inferido de fuentes públicas | Financieros, noticias, perfiles de decisores |
| **3** | Inferido de base histórica | Rangos de precio, duración, patrones de industria |
| **4** (Solo si necesario) | Input del vendedor | Contexto relacional, inteligencia informal |

### 6.3 Indicadores de Calidad del Análisis

| Nivel | Nombre | Condición | Mensaje |
|-------|--------|-----------|---------|
| 🔴 | Básico | Solo descripción, sin documento | "Análisis limitado. Sube el RFP para mejores insights." |
| 🟠 | Parcial | RFP + info pública básica | "Análisis parcial. Hay gaps que puedes completar." |
| 🟡 | Bueno | RFP + info pública + similares | "Buen análisis. Puedes enriquecer con contexto." |
| 🟢 | Completo | Todo + input del vendedor | "Análisis completo con alta confianza." |

### 6.4 Flujo de Búsqueda en Base de Conocimiento

```
┌─────────────────────────────────────────────────────────────────┐
│                    BÚSQUEDA                                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Búsqueda en lenguaje natural]                                │
│   Ej: "proyectos de migración S/4HANA en Oil&Gas"               │
│                                                                 │
│   Filtros opcionales:                                           │
│   [Industria ▼] [Tipo proyecto ▼] [Fecha ▼] [Resultado ▼]       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    RESULTADOS                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📁 Migración SAP S/4HANA - Lipigas                      │    │
│  │ ─────────────────────────────────────────────────────── │    │
│  │ Industria: Oil & Gas    │ Tipo: Migración S/4HANA      │    │
│  │ Valorización: $450K USD │ Duración: 14 meses           │    │
│  │ Alcance: Full scope     │ Resultado: ✅ Ganado         │    │
│  │                                                         │    │
│  │ [Ver resumen] [Descargar RFP] [Descargar Propuesta]    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │ 📁 Implementación SAP - Abastible                       │    │
│  │ ─────────────────────────────────────────────────────── │    │
│  │ Industria: Oil & Gas    │ Tipo: Implementación SAP     │    │
│  │ Valorización: $680K USD │ Duración: 18 meses           │    │
│  │ Alcance: MM, SD, FI     │ Resultado: ❌ Perdido        │    │
│  │                                                         │    │
│  │ [Ver resumen] [Descargar RFP] [Descargar Propuesta]    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. Modelo de Datos

### 7.1 Entidad: Análisis de RFP

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| created_at | Timestamp | Fecha de creación |
| updated_at | Timestamp | Última actualización |
| user_id | UUID | Usuario que creó el análisis |
| status | Enum | draft, processing, completed, error |
| quality_score | Float | Score de calidad del análisis (0-1) |
| quality_level | Enum | basic, partial, good, complete |
| documento_original_url | String | URL del documento subido (si existe) |
| cliente_nombre | String | Nombre del cliente |
| cliente_industria | String | Industria del cliente |
| cliente_pais | String | País del cliente |
| tipo_proyecto | Array[String] | Tipos de proyecto identificados |
| fecha_limite | Date | Fecha límite de entrega |
| presupuesto_declarado | Float | Presupuesto mencionado (si existe) |
| embedding_id | String | Referencia al embedding en vector DB |
| analisis_json | JSON | Resultado completo del análisis |

### 7.2 Entidad: Documento Base de Conocimiento

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | UUID | Identificador único |
| archivo_original | String | Nombre del archivo original |
| archivo_url | String | URL del archivo almacenado |
| tipo_documento | Enum | rfp, propuesta, contrato, presentacion, otro |
| cliente | String | Nombre del cliente |
| industria | String | Industria (Oil&Gas, Retail, Utilities, etc.) |
| tipo_proyecto | Array[String] | Tipos de proyecto |
| fecha_documento | Date | Fecha del documento |
| **valorizacion** | Float | Monto de la propuesta/proyecto (USD) |
| **cronograma_meses** | Integer | Duración estimada/real en meses |
| **alcance** | Text | Descripción del alcance (módulos, fases, etc.) |
| **modulos_sap** | Array[String] | Módulos SAP involucrados (FI, CO, MM, SD, etc.) |
| resultado | Enum | ganado, perdido, no_presentado, null |
| precio_final | Float | Precio final del proyecto (si ganó) |
| duracion_real_meses | Integer | Duración real en meses |
| lecciones_aprendidas | Text | Lecciones del proyecto |
| **factores_exito** | Text | Qué funcionó bien |
| **factores_fracaso** | Text | Qué no funcionó (si perdido) |
| tags | Array[String] | Etiquetas adicionales |
| embedding_id | String | Referencia al embedding |
| chunks | JSON | Chunks del documento para RAG |
| resumen_ejecutivo | Text | Resumen generado automáticamente |
| metadata_inferida | JSON | Metadata extraída automáticamente |
| metadata_validada | Boolean | Si el usuario validó la metadata |
| created_at | Timestamp | Fecha de carga |
| created_by | UUID | Usuario que cargó |

### 7.3 Entidad: Formulario de Contexto

Campos del formulario basado en SPIN Selling y Challenger Sale:

| Sección | Campo | Tipo | Obligatorio |
|---------|-------|------|-------------|
| Básica | cliente_nombre | String | Sí |
| Básica | industria | Enum | Sí |
| Básica | pais | Enum | Sí |
| Básica | tamano_empresa | Enum (rango) | Sí |
| Básica | tipo_proyecto | Multi-select | Sí |
| Básica | fecha_limite | Date | Sí |
| Básica | presupuesto_declarado | Rango USD | No |
| Challenger | trigger_event | Text | No |
| Challenger | intentos_previos | Text | No |
| Challenger | champion_interno | Text | No |
| Challenger | decision_maker | Text | No |
| Challenger | competidores_posicionados | Text | No |
| Challenger | dolor_hipotesis | Text | No |
| Challenger | necesidad_no_declarada | Text | No |
| SPIN | situacion_actual | Text | No |
| SPIN | problemas_especificos | Text | No |
| SPIN | costo_no_actuar | Text | No |
| SPIN | vision_exito | Text | No |
| Relacional | trabajo_previo_cliente | Boolean | No |
| Relacional | referencias_industria | Boolean | No |
| Relacional | contacto_interno | Text | No |

---

## 8. Integraciones Externas

| Dato | Fuente | Método | Prioridad |
|------|--------|--------|-----------|
| Estados financieros Chile | CMF (cmfchile.cl) | Web scraping / API | Must |
| Estados financieros LATAM | Reguladores locales, reportes anuales | Web scraping | Should |
| Noticias de empresa | Google News API, NewsAPI | API | Must |
| Noticias de industria | Google News API filtrado | API | Must |
| Perfiles LinkedIn | Proxycurl, PhantomBuster | API de terceros | Must |
| Benchmarks de mercado | Gartner, IDC, Statista | Manual + caché | Should |
| Info de consultoras | Sitios web (Accenture, IBM, etc.) | Web scraping | Could |

### 8.1 Consideraciones de APIs

- **LinkedIn:** API oficial muy limitada, usar servicios terceros como Proxycurl
- **CMF Chile:** No tiene API pública, requiere web scraping
- **News APIs:** NewsAPI tiene tier gratuito limitado, considerar Google News RSS como alternativa
- **Caché:** Implementar caché agresivo para datos que no cambian frecuentemente (financieros anuales)

---

## 9. Métricas de Éxito

### 9.1 Métricas de Adopción

| Métrica | Definición | Target 6 meses |
|---------|------------|----------------|
| Usuarios activos mensuales | Usuarios que realizan al menos 1 análisis/mes | 80% del equipo comercial |
| Análisis por usuario | Promedio de análisis mensuales por usuario | > 5 |
| Tasa de completitud | % de análisis que llegan a nivel Bueno o Completo | > 60% |
| Documentos en base | Total de documentos en base de conocimiento | > 500 |
| Búsquedas en base | Búsquedas mensuales en base de conocimiento | > 50 |

### 9.2 Métricas de Impacto

| Métrica | Definición | Target 12 meses |
|---------|------------|-----------------|
| Reducción tiempo análisis | Tiempo promedio de análisis vs. baseline | -60% |
| Win rate | % de propuestas ganadas vs. presentadas | +10 puntos porcentuales |
| Precisión de scoring | Correlación entre score y resultado real | > 0.7 |
| NPS de usuarios | Net Promoter Score del equipo comercial | > 40 |
| Reutilización de conocimiento | % de análisis que usan proyectos similares | > 70% |

---

## 10. Roadmap por Fases

### 10.1 Fase 1: MVP (8-10 semanas)

**Objetivo:** Validar propuesta de valor core

- Upload y procesamiento de RFP
- Formulario de contexto básico
- Generación de embeddings y búsqueda de similares
- Análisis básico: requisitos, ambigüedades, timeline
- Cargador de base de conocimiento (básico)
- Búsqueda en base de conocimiento con filtros
- Visualización de metadata (valorización, cronograma, alcance)
- Descarga de documentos originales
- Integración con 1-2 fuentes externas (noticias, LinkedIn)

### 10.2 Fase 2: Enriquecimiento (6-8 semanas)

**Objetivo:** Aumentar profundidad del análisis

- Integración con fuentes financieras (CMF)
- Red flags y scoring de oportunidad
- Preguntas de clarificación automáticas
- Stakeholder mapping básico
- Mejoras en extracción de metadata automática
- Detección de duplicados
- Resúmenes ejecutivos automáticos de proyectos

### 10.3 Fase 3: Inteligencia Avanzada (8-10 semanas)

**Objetivo:** Diferenciación competitiva

- Benchmarking sectorial
- Estrategia de diferenciación y win themes
- Teaching opportunities (Challenger Sale)
- Landscape de consultoras
- Exportación de análisis (PDF, PPT)
- Dashboard de métricas y analíticas
- Lecciones aprendidas de proyectos similares

---

## 11. Riesgos y Mitigaciones

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Calidad de extracción de RFPs variable | Alta | Alto | Usar múltiples técnicas (OCR, parsing, LLM). Permitir corrección manual. |
| APIs externas cambian o se limitan | Media | Medio | Abstraer integraciones. Tener alternativas. Caché agresivo. |
| Base de conocimiento con pocos datos iniciales | Alta | Alto | Priorizar carga masiva inicial. Hacer onboarding asistido. |
| Usuarios no completan formularios | Media | Medio | Todos los campos opcionales. Mostrar valor con mínima entrada. |
| Costos de LLM se disparan | Media | Alto | Usar modelos eficientes (Haiku) para tareas simples. Caché de análisis. |
| Datos sensibles en RFPs | Alta | Alto | Encriptación. Políticas de retención. Controles de acceso. |
| Adopción lenta del equipo | Media | Alto | Involucrar usuarios en diseño. Capacitación. Quick wins visibles. |
| Metadata inconsistente en base histórica | Alta | Medio | Validación en carga. Enriquecimiento gradual. Flags de confianza. |

---

## 12. Fuera de Alcance (v1)

Los siguientes elementos no serán incluidos en la versión 1 del producto:

| Elemento | Razón |
|----------|-------|
| Generación automática de propuestas | Complejidad muy alta, requiere templates específicos por cliente |
| Integración con CRM (Salesforce, HubSpot) | Agregar una vez validado el valor core |
| Predicción de precio ganador | Requiere datos históricos extensos y validación estadística |
| Análisis de competidores específicos | Información difícil de obtener de forma automática y confiable |
| Integración con Mercado Público | No es prioridad para el mercado objetivo (enterprise) |
| Análisis de Glassdoor/cultura | Valor cuestionable vs. complejidad de integración |
| Reportes de analistas (Gartner, etc.) | Requiere suscripciones costosas |
| Rotación de personal del cliente | Dato difícil de obtener y de valor variable |
| Multi-idioma (fuera de español) | Enfocar en mercado LATAM primero |
| App móvil | Web responsive es suficiente para MVP |

---

## 13. Apéndice: Detalle de Formularios

### 13.1 Formulario Inteligente: Comportamiento Adaptativo

El formulario se adapta según lo que el sistema ya ha inferido:

**Si el sistema YA INFIRIÓ algo:**

```
┌─────────────────────────────────────────────────────────────┐
│ Industria: Oil & Gas (inferido del RFP)     [✓ Correcto]   │
│                                             [✎ Corregir]   │
└─────────────────────────────────────────────────────────────┘
```

El usuario solo interviene si hay error.

**Si el sistema NO PUDO inferir:**

```
┌─────────────────────────────────────────────────────────────┐
│ ¿Conoces quién toma la decisión final?                      │
│ [No lo sé] [Sí, completar ▼]                                │
│                                                             │
│ ℹ️ Si no lo sabes, el sistema buscará en LinkedIn perfiles  │
│    que podrían ser relevantes.                              │
└─────────────────────────────────────────────────────────────┘
```

Si el usuario no sabe, el sistema intenta inferir de otras fuentes o indica que esa sección del análisis tendrá menor confianza.

### 13.2 Preguntas Estratégicas (Challenger Sale)

| Pregunta | Propósito | Insight que Genera |
|----------|-----------|-------------------|
| ¿Qué evento detonó esta iniciativa? | Identificar trigger event | Urgencia real, timing, presupuesto disponible |
| ¿Han intentado resolver esto antes? | Detectar cicatrices | Expectativas, miedos, criterios ocultos |
| ¿Quién impulsó el proyecto internamente? | Identificar champion | Aliado interno, acceso a información |
| ¿Conoces al decision maker final? | Mapear economic buyer | Criterios de decisión, poder de negociación |
| ¿Hay competidores ya posicionados? | Evaluar dificultad | Probabilidad real de ganar, estrategia necesaria |
| ¿Cuál crees que es el dolor principal? | Hipótesis de valor | Mensaje clave a validar, área de enfoque |
| ¿Qué NO pide el cliente que necesite? | Opportunity de insight | Diferenciación, teaching opportunity |

### 13.3 Preguntas SPIN

| Tipo | Pregunta | Para Qué Sirve |
|------|----------|----------------|
| **S**ituation | ¿Cuál es la situación actual? (sistemas, procesos) | Establecer baseline, entender contexto |
| **P**roblem | ¿Qué problemas específicos mencionan o infieres? | Identificar pain points explícitos |
| **I**mplication | ¿Qué pasa si no resuelven esto? ¿Costo de no actuar? | Cuantificar urgencia, justificar inversión |
| **N**eed-payoff | ¿Qué ganarían si esto se resuelve bien? | Visión de éxito, criterios de evaluación |

### 13.4 Metadata para Búsqueda en Base de Conocimiento

La siguiente metadata se extrae/captura para habilitar búsquedas efectivas:

| Campo | Fuente | Uso en Búsqueda |
|-------|--------|-----------------|
| Cliente | Inferido/Manual | Filtro exacto |
| Industria | Inferido/Manual | Filtro dropdown |
| Tipo de proyecto | Inferido/Manual | Filtro multi-select |
| Módulos SAP | Inferido/Manual | Filtro multi-select |
| Valorización | Manual | Rango numérico |
| Cronograma | Manual | Rango numérico |
| Alcance | Inferido/Manual | Búsqueda semántica |
| Resultado | Manual | Filtro dropdown |
| Fecha | Inferido/Manual | Rango de fechas |
| Tags | Manual | Búsqueda por etiqueta |
| Contenido completo | Embeddings | Búsqueda semántica |

---

*Fin del Documento*

---

**Control de Versiones**

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | Enero 2026 | - | Versión inicial |
