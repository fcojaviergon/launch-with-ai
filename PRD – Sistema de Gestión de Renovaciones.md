# **PRD – Sistema de Gestión de Tareas Flow**

Cliente: Compañía de Seguros La Cámara

Proveedor: Cunda

Fecha: 26/09/2025

Versión: 1.0

## **🧭 Propósito del Proyecto** 

Mediante el desarrollo de un sistema de gestión de tareas, se busca optimizar el proceso de gestión de renovaciones de pólizas, entregando visibilidad a los distintos roles (supervisor, ejecutivo, gerente), permitiendo eficiencia operativa, trazabilidad, foco comercial y mejora continua.

## **🎯 Objetivos del Producto** 

·   	Centralizar la gestión de tareas asociadas a renovaciones.  
·   	Automatizar tareas repetitivas mediante un robot  
·   	Disminuir errores y retrasos operativos.  
·   	Aumentar visibilidad para supervisores y gerentes.  
·   	Facilitar adopción tecnológica con interfaces simples y asistentes IA.  
·   	Establecer métricas por estado, ejecutivo, área y período.

## **👥 Roles y Funcionalidades**

### 

### **🤖 Robot (Automatización)**

| Funcionalidad | Descripción |
| :---- | :---- |
| **Descargar base de pólizas** | Extrae automáticamente toda la base de pólizas desde Brokeris |
| **Actualiza base de pólizas** | Carga la base en el nuevo sistema con la información de las pólizas y contactos |
| **Creación de tareas de renovación** | El último día del mes, selecciona todas las pólizas que vencen el mes subsiguiente y crea tareas de renovación por área, sin asignarlas a ejecutivos |
| **Notificaciones** | Se generarán una serie de notificaciones automáticas configurables para avisar de retrasos u otros casos a definir. |

### 

### 

### 

### **👨‍💼 Jefe de área**

| Funcionalidad | Descripción |
| :---- | :---- |
| **Creación de tareas** | Para tareas que no son renovaciones, el supervisor crea una tarea.  |
| **Asignación/Reasignación de tareas** | En la vista de tareas, asigna tareas que no están asignadas a ejecutivos de su equipo. |
| **Definición tipo de negocio** | Define si la tarea corresponde a renovación u otro tipo de tarea. Cada tarea tiene distintos campos a llenar. |
| **Vista de tareas**  | Ve todas las tareas pudiendo filtrar por estado y responsable, prioridad, días para vencimiento, estado, además de texto libre |

### 

### **👩‍💻 Ejecutivo**

| Funcionalidad | Descripción |
| :---- | :---- |
| **Visualización** | Ve tareas asignadas en formato tablero Kanban o lista. |
| **Cambio de estado** | Actualiza el estado de las tareas. |
| **Ingreso de datos de la nueva póliza** | Registra los datos de la nueva póliza: n° propuesta, n° póliza, compañía, ramo, moneda, prima, comisión, fecha inicio vigencia. |
| **Avance esperado** | Se calcula avance esperado en función de la fecha actual y fecha de fin de vigencia.  |
| **Actualización de éxito** | Es la probabilidad de éxito. Tiene que poder ser editable. |
| **Mes de producción** | Define si la producción es para el mes anterior, actual o siguiente. |
| **Crear tareas** | Para tareas que no son renovaciones, el ejecutivo puede crear una tarea manualmente.  |

### 

### **👔 Gerente**

| Funcionalidad | Descripción |
| :---- | :---- |
| **Reporte de tareas** | Visualiza tareas por estado, área y período. |
| **Reporte de tiempos** | Mide tiempos por estado y por período, desagregado por área. |
| **Informe comparativo con producción** | Compara por RUT cliente y ramo, cantidad, prima neta y comisión. |

## 

**Notificaciones**

| Notificación | A quién | Descripción |
| :---- | :---- | :---- |
| **Cliente no ha dado orden de colocación** | Ejecutivo | Que avise si el cliente no ha dado la orden de colocación después de X días en estado “Cotización enviada” |
| **Póliza/Endoso pasa más de X días en Estado “En Emisión”** | Ejecutivo | Cuando una póliza o un endoso no está emitida. |
| **Póliza/Endoso emitida no enviada al cliente** | Ejecutivo | Cuando han pasado más de 1 día desde que fue emitida y no se ha enviado la póliza/endoso al cliente. |
| **Reporte de tiempos** |  | Mide tiempos por estado y por período, desagregado por área. |
| **Informe comparativo con producción** |  | Compara por RUT cliente y ramo, cantidad, prima neta y comisión. |

## 

## **🤖 Asistente IA**

Permite consultar:

* Tareas asignadas  
* Vencimientos próximos  
* Recordatorios automáticos  
* Información de la póliza


## **🔄 Estados de las tareas**

* No iniciado  
* Cotizando  
* Cotización enviada  
* En Emisión  
* Emitida  
* Emitida Ingresada  
* Emitida enviada al cliente  
* Perdida


## **📱 Interfaces del Sistema**

### **Web (Desktop)**

* Mis Tareas: tablero visual por estado (Gerente, Supervisor, Ejecutivo).  
* Detalle de tarea (Gerente, Supervisor, Ejecutivo).  
* Reportes gerenciales (Gerente, Supervisor).  
* Búsqueda de Pólizas vigentes  
* Formulario ingreso de pólizas  
* Formulario ingreso de endoso  
* Asistente IA integrado (consultas sobre tareas, recordatorios).

### **Móvil**

* Vista rápida de tareas pendientes.  
* Asistente IA integrado (consultas sobre tareas, recordatorios).


## **📊 Reportes**

| Tipo | Nivel | Detalle |
| :---- | :---- | :---- |
| **Cantidad de tareas** | Jefe de área / Gerente | Por estado, ejecutivo, área, período |
| **Tiempos por tarea** | Gerente | Duración de tareas por tiempo total, por estado, promedio por área, período, ejecutivo. |
| **Éxito comercial** | Ejecutivo / Gerente | Prima y comisión ganada vs presupuesto con conversión de moneda a CLP. Vista por tipo de negocio, área, mes, total. |

##  

## **✅Flujos del sistema**

**Renovaciones**

1. Se descarga la base completa de pólizas desde Brokeris y se actualiza tabla interna del sistema.  
2. Se crean las tareas de renovaciones de forma automática y se asignan a áreas según tipo de empresa o a ejecutivo registrado en Brokeris. La fecha de vencimiento de la tarea debe ser X días antes que la fecha de fin de vigencia de la póliza a no ser que caiga un día fin de semana o festivo, donde se debe adelantar la fecha al primer día hábil anterior.  
3. Jefe de área ingresa a tareas de su área y filtra por tareas sin asignar.  
4. Jefe de área asigna tareas de renovaciones a ejecutivos.  
5. Jefe de área crea tareas de otro tipo: endosos, profundización, nuevos negocios.  
6. El Ejecutivo ingresa a ver sus tareas asignadas pendientes.  
7. El Ejecutivo toma una tarea y va actualizando el estado y la información según las gestiones realizadas.  
   

**Endoso**

1. Jefe de área crea nueva tarea tipo Endoso  
2. Completa los campos:  
   1. Subtipo de endoso  
   2. Area  
   3. Responsable  
   4. Prioridad  
   5. Fecha vencimiento  
   6. Selecciona la póliza vigente asociada  
3. Ejecutivo asignado toma la tarea y cambia de estado según estado de la gestión  
4. Ejecutivo ingresa información del Endoso:  
   1. Propuesta N° (de Brokeris)  
   2. Folio Compañia  
   3. Endoso N°  (de Brokeris)  
   4. Detalle (información adicional)  
   5. Prima (positiva o negativa de acuerdo a tipo de endoso)   
   6. Comisión (en caso de ser prima positiva)

## 

## **🧰Entidades**

### **Póliza** 

| Campo | Tipo |
| :---- | :---- |
| **Propuesta N°** | Número |
| **Póliza N°** | Número |
| **RUT Cliente** | Texto |
| **Nombre Cliente** | Texto |
| **RUT Asegurado** | Texto |
| **Nombre Asegurado** | Texto |
| **Compañía** | LookUp tabla compañías |
| **Ramo** | LookUp tabla ramos |
| **Fecha inicio de vigencia** | Fecha |
| **Fecha fin de vigencia** | Fecha |
| **Prima neta** | Número |
| **Moneda** | LookUp tabla monedas |
| **Comisión**  | Número |
| **Estado** | Propuesta, Ingresada, Emitida |

### **Endoso**

| Campo | Tipo |
| :---- | :---- |
| **Endoso N°** | Número |
| **Propuesta N°** | Número |
| **Póliza N°** | Número |
| **Tipo de endoso** | Texto |
| **Detalle** | Texto |
| **Prima neta** | Número |

### 

### **Tarea** 

| Campo | Tipo |
| :---- | :---- |
| **Id** | Número |
| **Nombre tarea** | Texto |
| **Area** | Lookup tabla areas |
| **Responsable** | Lookup tabla usuarios, rol \= ejecutivo, area \= Area |
| **Tipo de tarea** | Lookup tabla “tipo de tareas”, area \= comercial |
| **Subtipo de tarea** | Lookup table “subtipo de tareas”, tipo\_de\_tarea \= Tipo de tarea |
| **Estado** | Lookup tabla “estados”, tipo de tarea \= Tipo de tarea |
| **Prioridad** | Lookup tabla prioridad “Alta”, “Media”, “Baja” |
| **Fecha creación** | Fecha |
| **Fecha de vencimiento** | Fecha |
| **Tiempo en el estado actual** |  |
| **Archivos adjuntos** | Archivos |
| **Campos variables** | Según tipo de tarea (por ej. id póliza nueva, prima nueva, prima endoso, etc) |

**Campos Tarea Renovación**

| Campo | Tipo | Editable |
| :---- | :---- | :---- |
| **Póliza Actual** | Póliza | No |
| **Nueva Póliza** | Póliza | Sí |
| **Contacto** | Contacto | No |

**Campos Tarea Endoso**

| Campo | Tipo | Editable |
| :---- | :---- | :---- |
| **Póliza Actual** | Póliza | No |
| **Nuevo Endoso** | Endoso | Sí |
| **Contacto** | Contacto | No |

**Campos Tarea Nuevo Negocio**

| Campo | Tipo | Editable |
| :---- | :---- | :---- |
| **Póliza Nueva** | Póliza | Sí |
| **Contacto** | Contacto | Sí |

**Campos Tarea Profundización**

| Campo | Tipo | Editable |
| :---- | :---- | :---- |
| **Contacto** | Contacto | No |
| **Póliza Nueva** | Póliza | Sí |

**Contactos**

| Campo | Tipo |
| :---- | :---- |
| **Id** | Número |
| **RUT Contratante** | Texto |
| **Dirección contratante** | Texto |
| **Comuna contratante** | Texto |
| **Ciudad contratante** | Texto |
| **Correo** | Texto |
| **Teléfono** | Número |
| **Celular** | Número |

**Notificaciones**

| Campo | Tipo |
| :---- | :---- |
| **Id** | Número |
| **Tipo** | (Alerta, Info) |
| **Descripción** | Texto |
| **Fecha creación** | Fecha |
| **Fecha de lectura** | Fecha |
| **Estado** | (Activa, Leída) |
| **Usuario** | Lookup tabla usuarios |

### Modelo Entidad Relación
@startuml
' =========================
' ER: Modelo administrable de Tareas (completo)
' =========================

' ==== Núcleo Organizacional
entity "Usuario" as Usuario {
  * id: UUID
  --
  nombre: string
  email: string
  rut: string
  activo: boolean
  rol_id: UUID [FK]
  equipo_id: UUID [FK]
  timezone: string
  creado_en: datetime
  actualizado_en: datetime
}

entity "Rol" as Rol {
  * id: UUID
  --
  nombre: string
  descripcion: string
}

entity "Equipo" as Equipo {
  * id: UUID
  --
  nombre: string
  supervisor_id: UUID [FK -> Usuario.id]
}

Rol ||--o{ Usuario : asigna >
Equipo ||--o{ Usuario : agrupa >
Usuario ||--o{ Equipo : supervisa >

' ==== Clientes / Pólizas / Catálogos
entity "Cliente" as Cliente {
  * id: UUID
  --
  rut: string
  nombre: string
  ciudad: string
  correo: string
  telefono: string
  celular: string
}

entity "Contacto" as Contacto {
  * id: UUID
  --
  cliente_id: UUID [FK]
  nombre: string
  cargo: string
  correo: string
  telefono: string
  celular: string
  ciudad: string
  principal: boolean
}
Cliente ||--o{ Contacto

entity "Compania" as Compania {
  * id: UUID
  --
  nombre: string
}

entity "Ramo" as Ramo {
  * id: UUID
  --
  nombre: string
}

entity "Moneda" as Moneda {
  * id: UUID
  --
  codigo: string
  nombre: string
}

entity "Poliza" as Poliza {
  * id: UUID
  --
  propuesta_numero: string
  numero: string
  cliente_id: UUID [FK]
  compania_id: UUID [FK]
  ramo_id: UUID [FK]
  fecha_inicio: date
  fecha_fin: date
  prima_neta: decimal
  moneda_id: UUID [FK]
  comision: decimal
  estado: string  ' opcional: catálogo aparte si se requiere
}
Cliente ||--o{ Poliza
Compania ||--o{ Poliza
Ramo ||--o{ Poliza
Moneda ||--o{ Poliza

' ==== Administración de Tipos/Estados/Flujos
entity "TareaTipo" as TareaTipo {
  * id: UUID
  --
  codigo: string  ' ej: RENOV, ENDOSO, NUEVO
  nombre: string
  descripcion: text
  activo: boolean
  permite_poliza: boolean
  permite_cliente: boolean
  politica_campos: json  ' parámetros por defecto / UI hints
}

entity "Estado" as Estado {
  * id: UUID
  --
  tarea_tipo_id: UUID [FK]
  codigo: string      ' PEND, ENPROG, REV, BLOQ, COMP, CANC
  nombre: string
  inicial: boolean
  final: boolean
  orden: int
  activo: boolean
}

entity "SubEstado" as SubEstado {
  * id: UUID
  --
  estado_id: UUID [FK -> Estado.id]
  codigo: string       ' POR_ASIGNAR, EN_COLA, ESPERA_CLIENTE, etc.
  nombre: string
  orden: int
  activo: boolean
  visible: boolean
}

entity "TransicionEstado" as Transicion {
  * id: UUID
  --
  tarea_tipo_id: UUID [FK]
  desde_estado_id: UUID [FK -> Estado.id]
  hacia_estado_id: UUID [FK -> Estado.id]
  regla_permiso: json   ' por rol/equipo/usuario
  regla_negocio: json   ' validaciones y side-effects
}

entity "TransicionSubEstado" as TranSub {
  * id: UUID
  --
  tarea_tipo_id: UUID [FK]
  estado_id: UUID [FK -> Estado.id]       ' dentro de cuál estado aplica
  desde_sub_estado_id: UUID [FK -> SubEstado.id]
  hacia_sub_estado_id: UUID [FK -> SubEstado.id]
  regla_permiso: json
  regla_negocio: json
}

TareaTipo ||--o{ Estado
Estado ||--o{ SubEstado
TareaTipo ||--o{ Transicion
TareaTipo ||--o{ TranSub
Estado ||--o{ TranSub
SubEstado ||--o{ TranSub

' ==== Tareas y relaciones
entity "Tarea" as Tarea {
  * id: UUID
  --
  tarea_tipo_id: UUID [FK]
  estado_id: UUID [FK -> Estado.id]
  sub_estado_id: UUID [FK -> SubEstado.id]
  prioridad: string        ' catálogo simple (Baja/Media/Alta/Crítica) o FK
  titulo: string
  descripcion: text
  asignado_a_id: UUID [FK -> Usuario.id]
  creado_por_id: UUID [FK -> Usuario.id]
  equipo_id: UUID [FK -> Equipo.id]
  cliente_id: UUID [FK]
  sla_regla_id: UUID [FK]
  origen: string           ' manual, robot, api
  fecha_creacion: datetime
  fecha_vencimiento: date
  fecha_venc_calc: date    ' cache por SLA
  fecha_cierre: datetime
}
TareaTipo ||--o{ Tarea
Estado ||--o{ Tarea
SubEstado ||--o{ Tarea
Usuario ||--o{ Tarea : asignado >
Usuario ||--o{ Tarea : crea >
Equipo ||--o{ Tarea
Cliente ||--o{ Tarea

' --- Relación N:M Tarea-Poliza (tabla intermedia)
entity "TareaPoliza" as TareaPoliza {
  * tarea_id: UUID [FK]
  * poliza_id: UUID [FK]
  --
  rol: string        ' principal, relacionada, etc.
  nota: text
}
Tarea ||--o{ TareaPoliza
Poliza ||--o{ TareaPoliza

' Relación N:M Tarea-Contacto
entity "TareaContacto" as TareaContacto {
  * tarea_id: UUID [FK]
  * contacto_id: UUID [FK]
  --
  rol_contacto: string  ' tomador, firmante, etc
}
Tarea ||--o{ TareaContacto
Contacto ||--o{ TareaContacto

' ==== Campos dinámicos por tipo de tarea
entity "TareaCampoDef" as CampoDef {
  * id: UUID
  --
  tarea_tipo_id: UUID [FK]
  codigo: string      ' ej: fecha_envio_oferta
  etiqueta: string
  tipo_dato: string   ' string, int, decimal, date, bool, enum
  requerido: boolean
  orden: int
  cfg: json           ' enum options, min/max, masks, etc.
  activo: boolean
}
entity "TareaCampoValor" as CampoVal {
  * id: UUID
  --
  tarea_id: UUID [FK]
  campo_def_id: UUID [FK]
  valor_texto: text
  valor_num: decimal
  valor_fecha: date
  valor_bool: boolean
  valor_json: json
}
TareaTipo ||--o{ CampoDef
Tarea ||--o{ CampoVal
CampoDef ||--o{ CampoVal

' ==== País / Feriados por país y SLA
entity "Pais" as Pais {
  * id: UUID
  --
  iso2: string
  nombre: string
  tz: string
}
entity "FeriadoPais" as FeriadoPais {
  * id: UUID
  --
  pais_id: UUID [FK -> Pais.id]
  fecha: date
  descripcion: string
  laborable: boolean
}
Pais ||--o{ FeriadoPais

entity "SLARegla" as SLA {
  * id: UUID
  --
  nombre: string
  descripcion: text
  tarea_tipo_id: UUID [FK]
  pais_id: UUID [FK -> Pais.id]
  unidad: string          ' dias_habiles/dias_corridos
  umbral_alerta_dias: int
  umbral_venc_dias: int
  activa: boolean
}
TareaTipo ||--o{ SLA
Pais ||--o{ SLA
SLA ||--o{ Tarea

' ==== Interacciones y Trazabilidad
entity "Comentario" as Comentario {
  * id: UUID
  --
  tarea_id: UUID [FK]
  usuario_id: UUID [FK]
  fecha: datetime
  texto: text
  privado: boolean
}
entity "Adjunto" as Adjunto {
  * id: UUID
  --
  tarea_id: UUID [FK]
  nombre_archivo: string
  mime_type: string
  tamano_bytes: long
  url: string
  checksum: string
  subido_por_id: UUID [FK -> Usuario.id]
  subido_en: datetime
}
entity "Notificacion" as Notificacion {
  * id: UUID
  --
  tarea_id: UUID [FK]
  usuario_id: UUID [FK]
  tipo: string    ' Alerta/Info, o catálogo
  descripcion: string
  fecha_creacion: datetime
  fecha_lectura: datetime
  leida: boolean
  estado: string  ' Activa/Leida
}
entity "AuditLog" as Audit {
  * id: UUID
  --
  entidad: string
  entidad_id: UUID
  accion: string   ' CREATE/UPDATE/DELETE
  usuario_id: UUID [FK -> Usuario.id]
  timestamp: datetime
  detalle: text
}
entity "JobRobot" as Job {
  * id: UUID
  --
  tipo: string         ' carga_polizas, crea_renovaciones
  programacion: string ' CRON/RRULE
  ultima_ejecucion: datetime
  proxima_ejecucion: datetime
  reintentos: int
  estado: string       ' OK/ERROR
  detalle: text
}
Tarea ||--o{ Comentario
Tarea ||--o{ Adjunto
Tarea ||--o{ Notificacion
Usuario ||--o{ Comentario
Usuario ||--o{ Adjunto
Usuario ||--o{ Notificacion
Job ||--o{ Audit : registra >
Job ||--o{ Tarea : crea/actualiza >

' ==== Historiales
entity "TareaEstadoHist" as TareaEstadoHist {
  * id: UUID
  --
  tarea_id: UUID [FK]
  estado_id: UUID [FK -> Estado.id]
  desde: datetime
  hasta: datetime
  por_usuario_id: UUID [FK -> Usuario.id]
  nota: text
}
Tarea ||--o{ TareaEstadoHist
Estado ||--o{ TareaEstadoHist
Usuario ||--o{ TareaEstadoHist

entity "TareaSubEstadoHist" as TareaSubEstadoHist {
  * id: UUID
  --
  tarea_id: UUID [FK]
  sub_estado_id: UUID [FK -> SubEstado.id]
  desde: datetime
  hasta: datetime
  por_usuario_id: UUID [FK -> Usuario.id]
  nota: text
}
Tarea ||--o{ TareaSubEstadoHist
SubEstado ||--o{ TareaSubEstadoHist
Usuario ||--o{ TareaSubEstadoHist

entity "TareaAsignacionHist" as TareaAsigHist {
  * id: UUID
  --
  tarea_id: UUID [FK]
  de_usuario_id: UUID [FK -> Usuario.id]
  a_usuario_id: UUID [FK -> Usuario.id]
  de_equipo_id: UUID [FK -> Equipo.id]
  a_equipo_id: UUID [FK -> Equipo.id]
  fecha: datetime
  motivo: text
}
Tarea ||--o{ TareaAsigHist
Usuario ||--o{ TareaAsigHist
Equipo ||--o{ TareaAsigHist

' ==== Time-tracking para reportes
entity "TareaTiempo" as TareaTiempo {
  * id: UUID
  --
  tarea_id: UUID [FK]
  usuario_id: UUID [FK]
  fecha: date
  minutos: int
  nota: text
  origen: string  ' manual/auto
}
Tarea ||--o{ TareaTiempo
Usuario ||--o{ TareaTiempo

' ==== Producción y mapeo externo (cuadratura)
entity "Produccion" as Produccion {
  * id: UUID
  --
  cliente_id: UUID [FK]
  compania_id: UUID [FK]
  ramo_id: UUID [FK]
  periodo: date
  poliza_numero: string
  prima_neta: decimal
  comision: decimal
  moneda_id: UUID [FK]
  fuente: string   ' sistema origen
}
Cliente ||--o{ Produccion
Compania ||--o{ Produccion
Ramo ||--o{ Produccion
Moneda ||--o{ Produccion

entity "MappingExterno" as MappingExt {
  * id: UUID
  --
  fuente: string
  tipo: string      ' cliente/compania/ramo
  externo_key: string
  interno_id: UUID
}
@enduml
