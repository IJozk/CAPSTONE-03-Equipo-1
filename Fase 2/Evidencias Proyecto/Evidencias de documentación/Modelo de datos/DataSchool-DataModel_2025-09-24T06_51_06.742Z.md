# DataSchool-DataModel documentation
## Summary

- [Introduction](#introduction)
- [Database Type](#database-type)
- [Table Structure](#table-structure)
	- [Colegio](#colegio)
	- [User](#user)
	- [Estudiante](#estudiante)
	- [Curso](#curso)
	- [Profesor](#profesor)
	- [Zona](#zona)
	- [Sala](#sala)
	- [Asignatura](#asignatura)
	- [Area](#area)
	- [Administrativo](#administrativo)
	- [Tipo_parentesco](#tipo_parentesco)
	- [Tutor](#tutor)
	- [Parentesco](#parentesco)
	- [EstadoMatricula](#estadomatricula)
	- [Matricula](#matricula)
	- [Colegiatura](#colegiatura)
	- [Estudiante_Curso](#estudiante_curso)
	- [Evaluacion](#evaluacion)
	- [ResultadoEvaluacion](#resultadoevaluacion)
	- [Horario](#horario)
	- [Asistencia](#asistencia)
	- [TipoEncuesta](#tipoencuesta)
	- [Encuesta](#encuesta)
	- [Taller](#taller)
	- [Grupo_taller](#grupo_taller)
	- [TipoAlerta](#tipoalerta)
	- [Alerta](#alerta)
	- [AnioAcademico](#anioacademico)
	- [TipoAsignatura](#tipoasignatura)
	- [AsignacionAsiento](#asignacionasiento)
- [Relationships](#relationships)
- [Database Diagram](#database-diagram)

## Introduction

## Database type

- **Database system:** PostgreSQL
## Table structure

### Colegio
Información básica de la institución educativa
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **colegio_id** | UUID | 🔑 PK, not null, unique | fk_Colegio_colegio_id_Zona,fk_Colegio_colegio_id_Area,fk_Colegio_colegio_id_AnioAcademico | |
| **nombre** | VARCHAR(255) | not null |  | |
| **direccion** | VARCHAR(255) | null |  | |
| **fecha_creacion** | DATE | not null |  | |
| **telefono** | VARCHAR(20) | null |  | |
| **email** | VARCHAR(100) | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


### User
Tabla base para todos los usuarios del sistema con autenticación
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **user_id** | UUID | 🔑 PK, not null, unique | fk_User_user_id_Profesor,fk_User_user_id_Administrativo,fk_User_user_id_Tutor | |
| **email_address** | VARCHAR(255) | not null |  | |
| **password** | VARCHAR(255) | not null |  |Hash de la contraseña, nunca almacenar texto plano |
| **is_active** | BOOLEAN | null, default: true |  | |
| **last_login** | TIMESTAMP | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_user_email |  | email_address |
| idx_user_active |  | is_active |
### Estudiante
Información personal y académica de los estudiantes
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **estudiante_id** | UUID | 🔑 PK, not null, unique | fk_Estudiante_estudiante_id_Parentesco,fk_Estudiante_estudiante_id_Matricula,fk_Estudiante_estudiante_id_Estudiante_Curso,fk_Estudiante_estudiante_id_ResultadoEvaluacion,fk_Estudiante_estudiante_id_Asistencia,fk_Estudiante_estudiante_id_Grupo_taller,fk_Estudiante_estudiante_id_Alerta,fk_Estudiante_estudiante_id_AsignacionAsiento | |
| **nombre_completo** | VARCHAR(200) | not null |  | |
| **fecha_nacimiento** | DATE | not null |  | |
| **rut** | VARCHAR(12) | null |  |RUT chileno en formato sin puntos ni guión |
| **genero** | CHAR(1) | null |  |M=Masculino, F=Femenino, O=Otro |
| **direccion** | VARCHAR(255) | null |  | |
| **telefono** | VARCHAR(20) | null |  | |
| **email** | VARCHAR(100) | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_estudiante_nombre |  | nombre_completo |
| idx_estudiante_rut |  | rut |
| idx_estudiante_activo |  | estado_activo |
### Curso
Cursos académicos organizados por nivel y generación
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **curso_id** | UUID | 🔑 PK, not null, unique | fk_Curso_curso_id_Asignatura,fk_Curso_curso_id_Matricula,fk_Curso_curso_id_Estudiante_Curso,fk_Curso_curso_id_AsignacionAsiento | |
| **nombre** | VARCHAR(100) | not null |  | |
| **nivel** | VARCHAR(50) | not null |  |Ej: "1° Básico", "2° Medio" |
| **generacion** | SMALLINT | not null |  | |
| **capacidad_maxima** | SMALLINT | null, default: 35 |  | |
| **anio_academico** | INTEGER | not null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


### Profesor
Información de los profesores y su relación con usuarios
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **profesor_id** | UUID | 🔑 PK, not null, unique | fk_Profesor_profesor_id_Asignatura,fk_Profesor_profesor_id_Taller,fk_Profesor_profesor_id_Alerta | |
| **user_id** | UUID | not null |  | |
| **nombre_completo** | VARCHAR(200) | not null |  | |
| **rut** | VARCHAR(12) | null |  | |
| **especialidad** | VARCHAR(100) | null |  | |
| **titulo_profesional** | VARCHAR(150) | null |  | |
| **telefono** | VARCHAR(20) | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **fecha_contratacion** | DATE | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_profesor_nombre |  | nombre_completo |
| idx_profesor_activo |  | estado_activo |
### Zona

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **zona_id** | VARCHAR(20) | 🔑 PK, not null, unique | fk_Zona_zona_id_Sala | |
| **colegio_id** | UUID | not null |  | |
| **nombre_zona** | VARCHAR(150) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **capacidad_total** | SMALLINT | null |  | | 


### Sala

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **sala_id** | VARCHAR(20) | 🔑 PK, not null, unique | fk_Sala_sala_id_Asignatura,fk_Sala_sala_id_Horario,fk_Sala_sala_id_Taller,fk_Sala_sala_id_AsignacionAsiento | |
| **nombre** | VARCHAR(50) | not null |  | |
| **zona_id** | VARCHAR(50) | not null |  | |
| **capacidad** | SMALLINT | null, default: 35 |  | |
| **tiene_proyector** | BOOLEAN | null, default: false |  | |
| **tiene_pizarra_digital** | BOOLEAN | null, default: false |  | |
| **estado** | VARCHAR(20) | null, default: DISPONIBLE |  |DISPONIBLE, MANTENIMIENTO, FUERA_DE_SERVICIO |
| **distribucion_asientos_template** | JSONB | null |  | | 


### Asignatura
Materias impartidas en cada curso
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **asignatura_id** | UUID | 🔑 PK, not null, unique | fk_Asignatura_asignatura_id_Evaluacion,fk_Asignatura_asignatura_id_Horario | |
| **nombre** | VARCHAR(100) | not null |  | |
| **codigo** | VARCHAR(10) | not null |  | |
| **profesor_id** | UUID | not null |  | |
| **sala_id** | VARCHAR(20) | null |  | |
| **curso_id** | UUID | not null |  | |
| **creditos** | SMALLINT | null, default: 1 |  | |
| **horas_semanales** | SMALLINT | null, default: 2 |  | |
| **descripcion** | TEXT | null |  | |
| **periodo** | VARCHAR(50) | not null |  |Ej: "2025-1", "2025-2" |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | |
| **tipo_asignatura_id** | SMALLSERIAL | null |  | | 


### Area

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **area_id** | SMALLSERIAL | 🔑 PK, not null, unique | fk_Area_area_id_Administrativo | |
| **nombre_area** | VARCHAR(100) | not null |  | |
| **colegio_id** | UUID | not null |  | |
| **descripcion** | TEXT | null |  | |
| **jefe_area_id** | UUID | null |  | | 


### Administrativo

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **administrativo_id** | UUID | 🔑 PK, not null, unique | fk_Administrativo_administrativo_id_Alerta | |
| **user_id** | UUID | not null |  | |
| **nombre_completo** | VARCHAR(200) | not null |  | |
| **rut** | VARCHAR(12) | null |  | |
| **area_id** | SMALLINT | not null |  | |
| **cargo** | VARCHAR(100) | null |  | |
| **telefono** | VARCHAR(20) | null |  | |
| **fecha_contratacion** | DATE | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


### Tipo_parentesco

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tipo_parentesco_id** | SMALLSERIAL | 🔑 PK, not null, unique | fk_Tipo_parentesco_tipo_parentesco_id_Parentesco | |
| **nombre** | VARCHAR(50) | not null |  | |
| **descripcion** | VARCHAR(100) | null |  | | 


### Tutor
Apoderados y tutores de los estudiantes
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tutor_id** | UUID | 🔑 PK, not null, unique | fk_Tutor_tutor_id_Parentesco,fk_Tutor_tutor_id_Matricula | |
| **user_id** | UUID | null |  | |
| **nombre_completo** | VARCHAR(200) | not null |  | |
| **rut** | VARCHAR(12) | null |  | |
| **telefono** | VARCHAR(20) | null |  | |
| **telefono_emergencia** | VARCHAR(20) | null |  | |
| **direccion** | VARCHAR(255) | null |  | |
| **ocupacion** | VARCHAR(100) | null |  | |
| **email** | VARCHAR(100) | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_tutor_nombre |  | nombre_completo |
### Parentesco

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tutor_id** | UUID | not null |  | |
| **estudiante_id** | UUID | not null |  | |
| **tipo_parentesco_id** | SMALLINT | not null |  | |
| **es_tutor_titular** | BOOLEAN | null, default: false |  | |
| **es_contacto_emergencia** | BOOLEAN | null, default: false |  | |
| **puede_retirar** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| Parentesco_index_8 |  | tutor_id, estudiante_id |
### EstadoMatricula

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **estado_matricula_id** | SMALLSERIAL | 🔑 PK, not null, unique | fk_EstadoMatricula_estado_matricula_id_Matricula | |
| **nombre_estado** | VARCHAR(50) | not null |  | |
| **descripcion** | VARCHAR(150) | null |  | |
| **permite_asistencia** | BOOLEAN | null, default: true |  | |
| **permite_evaluaciones** | BOOLEAN | null, default: true |  | | 


### Matricula
Registro de matrícula de estudiantes por período
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **matricula_id** | UUID | 🔑 PK, not null, unique | fk_Matricula_matricula_id_Colegiatura | |
| **estudiante_id** | UUID | not null |  | |
| **tutor_titular_id** | UUID | not null |  | |
| **curso_id** | UUID | not null |  | |
| **periodo** | VARCHAR(50) | not null |  |Ej: "2025" |
| **fecha_matricula** | DATE | not null, default: now() |  | |
| **fecha_pago** | DATE | null |  | |
| **monto_matricula** | INTEGER | null |  | |
| **estado_matricula_id** | SMALLINT | not null, default: 1 |  | |
| **observaciones** | TEXT | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_matricula_periodo |  | periodo |
| idx_matricula_estado |  | estado_matricula_id |
### Colegiatura
Pagos mensuales de colegiatura
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **colegiatura_id** | UUID | 🔑 PK, not null, unique, default: gen_random_uuid() |  | |
| **matricula_id** | UUID | not null |  | |
| **mes** | SMALLINT | not null |  |1-12 |
| **anio** | SMALLINT | not null |  | |
| **monto** | INTEGER | not null |  | |
| **fecha_vencimiento** | DATE | not null |  | |
| **fecha_pago** | TIMESTAMP | null |  | |
| **metodo_pago** | VARCHAR(50) | null |  | |
| **numero_comprobante** | VARCHAR(100) | null |  | |
| **estado** | VARCHAR(20) | null, default: PENDIENTE |  |PENDIENTE, PAGADO, VENCIDO, CONDONADO |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_colegiatura_estado |  | estado |
| idx_colegiatura_vencimiento |  | fecha_vencimiento |
### Estudiante_Curso

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **estudiante_id** | UUID | not null |  | |
| **curso_id** | UUID | not null |  | |
| **periodo_cursado** | VARCHAR(50) | not null |  |Ej: "2025-1" |
| **fecha_ingreso** | DATE | not null, default: now() |  | |
| **fecha_retiro** | DATE | null |  | |
| **estado** | VARCHAR(20) | null, default: ACTIVO |  |ACTIVO, RETIRADO, TRASLADADO, GRADUADO |
| **promedio_final** | DECIMAL(4,2) | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| Estudiante_Curso_index_13 |  | estudiante_id, curso_id, periodo_cursado |
| idx_estudiante_curso_periodo |  | periodo_cursado |
### Evaluacion
Evaluaciones académicas (pruebas, trabajos, etc.)
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **evaluacion_id** | SERIAL | 🔑 PK, not null, unique | fk_Evaluacion_evaluacion_id_ResultadoEvaluacion | |
| **asignatura_id** | UUID | not null |  | |
| **nombre** | VARCHAR(150) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **tipo** | VARCHAR(50) | not null |  |PRUEBA, TAREA, TRABAJO, EXAMEN, PROYECTO, PARTICIPACION |
| **fecha_evaluacion** | DATE | not null |  | |
| **puntaje_maximo** | SMALLINT | not null |  | |
| **porcentaje_nota** | DECIMAL(5,2) | null, default: 100 |  | |
| **contenido** | JSONB | null |  |Para preguntas estructuradas |
| **is_recuperativa** | BOOLEAN | null, default: false |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_evaluacion_fecha |  | fecha_evaluacion |
| idx_evaluacion_asignatura |  | asignatura_id |
### ResultadoEvaluacion
Resultados y calificaciones de las evaluaciones
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **resultado_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **evaluacion_id** | INTEGER | not null |  | |
| **estudiante_id** | UUID | not null |  | |
| **puntaje_obtenido** | INTEGER | not null |  | |
| **nota** | DECIMAL(4,2) | null |  |Nota en escala chilena (1.0 a 7.0) |
| **porcentaje** | DECIMAL(5,2) | null |  | |
| **fecha_evaluacion** | TIMESTAMP | null, default: now() |  | |
| **observaciones** | TEXT | null |  | |
| **encuesta_id** | VARCHAR(20) | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | |
| **updated_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| ResultadoEvaluacion_index_17 | ✅ | evaluacion_id, estudiante_id |
| idx_resultado_evaluacion_estudiante |  | estudiante_id |
### Horario
Horarios de clases por asignatura
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **horario_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **asignatura_id** | UUID | not null |  | |
| **dia_semana** | SMALLINT | not null |  |1=Lunes, 7=Domingo |
| **hora_inicio** | TIME | not null |  | |
| **hora_termino** | TIME | not null |  | |
| **sala_id** | VARCHAR(20) | null |  | |
| **periodo** | VARCHAR(50) | not null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| Horario_index_19 | ✅ | asignatura_id, dia_semana, hora_inicio, periodo |
| idx_horario_dia |  | dia_semana |
| idx_horario_periodo |  | periodo |
### Asistencia
Registro diario de asistencia de estudiantes
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **asistencia_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **fecha** | DATE | not null |  | |
| **estudiante_id** | UUID | not null |  | |
| **presente** | BOOLEAN | not null, default: false |  |TRUE = presente, FALSE = ausente |
| **retraso_minutos** | INTEGER | null |  | |
| **retiro_anticipado_minutos** | INTEGER | null |  | |
| **justificado** | BOOLEAN | null, default: false |  | |
| **observaciones** | TEXT | null |  | |
| **registrado_por** | UUID | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| Asistencia_index_22 | ✅ | fecha, estudiante_id, asignatura_id |
| idx_asistencia_fecha |  | fecha |
| idx_asistencia_estudiante_fecha |  | estudiante_id, fecha |
### TipoEncuesta

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tipo_encuesta_id** | SMALLSERIAL | 🔑 PK, not null, unique | fk_TipoEncuesta_tipo_encuesta_id_Encuesta | |
| **nombre_tipo** | VARCHAR(100) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **template_encuesta** | JSONB | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


### Encuesta

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **encuesta_id** | VARCHAR(20) | 🔑 PK, not null, unique | fk_Encuesta_encuesta_id_ResultadoEvaluacion | |
| **tipo_encuesta_id** | SMALLINT | not null |  | |
| **titulo** | VARCHAR(200) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **fecha_inicio** | DATE | not null |  | |
| **fecha_fin** | DATE | not null |  | |
| **dirigida_a** | VARCHAR(50) | not null |  |ESTUDIANTES, PROFESORES, APODERADOS, ADMINISTRATIVOS |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


### Taller

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **taller_id** | VARCHAR(20) | 🔑 PK, not null, unique | fk_Taller_taller_id_Grupo_taller | |
| **nombre** | VARCHAR(150) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **profesor_encargado_id** | UUID | null |  | |
| **capacidad_maxima** | SMALLINT | null, default: 25 |  | |
| **horario** | VARCHAR(100) | null |  | |
| **sala_id** | VARCHAR(20) | null |  | |
| **costo_adicional** | INTEGER | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


### Grupo_taller

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **grupo_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **taller_id** | VARCHAR(20) | not null |  | |
| **estudiante_id** | UUID | not null |  | |
| **fecha_inscripcion** | DATE | not null, default: now() |  | |
| **fecha_retiro** | DATE | null |  | |
| **estado** | VARCHAR(20) | null, default: ACTIVO |  |ACTIVO, RETIRADO, SUSPENDIDO |
| **observaciones** | TEXT | null |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| Grupo_taller_index_25 | ✅ | taller_id, estudiante_id |
### TipoAlerta

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tipo_alerta_id** | SERIAL | 🔑 PK, not null, unique | fk_TipoAlerta_tipo_alerta_id_Alerta | |
| **nombre** | VARCHAR(100) | not null |  | |
| **descripcion** | TEXT | null |  | |
| **nivel_prioridad** | SMALLINT | null, default: 3 |  |1=Muy Alta, 5=Muy Baja |
| **color_hex** | CHAR(7) | null, default: #FFD700 |  | |
| **requiere_accion** | BOOLEAN | null, default: false |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | | 


### Alerta
Sistema de alertas y notificaciones
| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **alerta_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **tipo_alerta_id** | INTEGER | not null |  | |
| **estudiante_id** | UUID | null |  | |
| **profesor_id** | UUID | null |  | |
| **administrativo_id** | UUID | null |  | |
| **titulo** | VARCHAR(200) | not null |  | |
| **mensaje** | TEXT | not null |  | |
| **fecha_creacion** | TIMESTAMP | null, default: now() |  | |
| **fecha_vencimiento** | TIMESTAMP | null |  | |
| **estado** | VARCHAR(20) | null, default: PENDIENTE |  |PENDIENTE, VISTA, RESUELTA, ARCHIVADA |
| **prioridad** | SMALLINT | null, default: 3 |  | |
| **creado_por** | UUID | null |  | |
| **resuelto_por** | UUID | null |  | |
| **fecha_resolucion** | TIMESTAMP | null |  | |
| **observaciones_resolucion** | TEXT | null |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| idx_alerta_estado |  | estado |
| idx_alerta_fecha |  | fecha_creacion |
| idx_alerta_prioridad |  | prioridad |
### AnioAcademico

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **anio_id** | SERIAL | 🔑 PK, not null, unique |  | |
| **colegio_id** | UUID | not null |  | |
| **anio** | INTEGER | not null |  | |
| **fecha_inicio** | DATE | not null |  | |
| **fecha_termino** | DATE | not null |  | |
| **primer_semestre_inicio** | DATE | null |  | |
| **primer_semestre_fin** | DATE | null |  | |
| **segundo_semestre_inicio** | DATE | null |  | |
| **segundo_semestre_fin** | DATE | null |  | |
| **vacaciones_invierno_inicio** | DATE | null |  | |
| **vacaciones_invierno_fin** | DATE | null |  | |
| **estado_activo** | BOOLEAN | null, default: true |  | |
| **created_at** | TIMESTAMP | null, default: now() |  | | 


#### Indexes
| Name | Unique | Fields |
|------|--------|--------|
| AnioAcademico_index_29 | ✅ | colegio_id, anio |
### TipoAsignatura

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **tipo_asignatura_id** | SMALLSERIAL | 🔑 PK, not null, unique | fk_TipoAsignatura_tipo_asignatura_id_Asignatura | |
| **nombre** | VARCHAR(255) | null |  | |
| **descripcion** | VARCHAR(255) | null |  | | 


### AsignacionAsiento

| Name        | Type          | Settings                      | References                    | Note                           |
|-------------|---------------|-------------------------------|-------------------------------|--------------------------------|
| **asignacion_id** | SERIAL | 🔑 PK, not null |  | |
| **estudiante_id** | UUID | 🔑 PK, not null, unique |  | |
| **curso_id** | UUID | 🔑 PK, not null |  | |
| **sala_id** | VARCHAR(20) | null |  | |
| **num_asiento** | SMALLINT | null |  | |
| **fecha_asignacion** | DATE | null |  | |
| **es_actual** | BOOLEAN | null |  | | 


## Relationships

- **User to Profesor**: one_to_many
- **Colegio to Zona**: one_to_many
- **Zona to Sala**: one_to_many
- **Profesor to Asignatura**: one_to_many
- **Sala to Asignatura**: one_to_many
- **Curso to Asignatura**: one_to_many
- **Colegio to Area**: one_to_many
- **User to Administrativo**: one_to_many
- **Area to Administrativo**: one_to_many
- **User to Tutor**: one_to_many
- **Tutor to Parentesco**: one_to_many
- **Estudiante to Parentesco**: one_to_many
- **Tipo_parentesco to Parentesco**: one_to_many
- **Estudiante to Matricula**: one_to_many
- **Tutor to Matricula**: one_to_many
- **Curso to Matricula**: one_to_many
- **EstadoMatricula to Matricula**: one_to_many
- **Matricula to Colegiatura**: one_to_many
- **Estudiante to Estudiante_Curso**: one_to_many
- **Curso to Estudiante_Curso**: one_to_many
- **Asignatura to Evaluacion**: one_to_many
- **Evaluacion to ResultadoEvaluacion**: one_to_many
- **Estudiante to ResultadoEvaluacion**: one_to_many
- **Encuesta to ResultadoEvaluacion**: one_to_many
- **Asignatura to Horario**: one_to_many
- **Sala to Horario**: one_to_many
- **Estudiante to Asistencia**: one_to_many
- **TipoEncuesta to Encuesta**: one_to_many
- **Profesor to Taller**: one_to_many
- **Sala to Taller**: one_to_many
- **Taller to Grupo_taller**: one_to_many
- **Estudiante to Grupo_taller**: one_to_many
- **TipoAlerta to Alerta**: one_to_many
- **Estudiante to Alerta**: one_to_many
- **Profesor to Alerta**: one_to_many
- **Administrativo to Alerta**: one_to_many
- **Colegio to AnioAcademico**: one_to_many
- **TipoAsignatura to Asignatura**: one_to_many
- **Curso to AsignacionAsiento**: one_to_one
- **Sala to AsignacionAsiento**: one_to_many
- **Estudiante to AsignacionAsiento**: one_to_one

## Database Diagram

```mermaid
erDiagram
	User ||--o{ Profesor : references
	Colegio ||--o{ Zona : references
	Zona ||--o{ Sala : references
	Profesor ||--o{ Asignatura : references
	Sala ||--o{ Asignatura : references
	Curso ||--o{ Asignatura : references
	Colegio ||--o{ Area : references
	User ||--o{ Administrativo : references
	Area ||--o{ Administrativo : references
	User ||--o{ Tutor : references
	Tutor ||--o{ Parentesco : references
	Estudiante ||--o{ Parentesco : references
	Tipo_parentesco ||--o{ Parentesco : references
	Estudiante ||--o{ Matricula : references
	Tutor ||--o{ Matricula : references
	Curso ||--o{ Matricula : references
	EstadoMatricula ||--o{ Matricula : references
	Matricula ||--o{ Colegiatura : references
	Estudiante ||--o{ Estudiante_Curso : references
	Curso ||--o{ Estudiante_Curso : references
	Asignatura ||--o{ Evaluacion : references
	Evaluacion ||--o{ ResultadoEvaluacion : references
	Estudiante ||--o{ ResultadoEvaluacion : references
	Encuesta ||--o{ ResultadoEvaluacion : references
	Asignatura ||--o{ Horario : references
	Sala ||--o{ Horario : references
	Estudiante ||--o{ Asistencia : references
	TipoEncuesta ||--o{ Encuesta : references
	Profesor ||--o{ Taller : references
	Sala ||--o{ Taller : references
	Taller ||--o{ Grupo_taller : references
	Estudiante ||--o{ Grupo_taller : references
	TipoAlerta ||--o{ Alerta : references
	Estudiante ||--o{ Alerta : references
	Profesor ||--o{ Alerta : references
	Administrativo ||--o{ Alerta : references
	Colegio ||--o{ AnioAcademico : references
	TipoAsignatura ||--o{ Asignatura : references
	Curso ||--|| AsignacionAsiento : references
	Sala ||--o{ AsignacionAsiento : references
	Estudiante ||--|| AsignacionAsiento : references

	Colegio {
		UUID colegio_id
		VARCHAR(255) nombre
		VARCHAR(255) direccion
		DATE fecha_creacion
		VARCHAR(20) telefono
		VARCHAR(100) email
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	User {
		UUID user_id
		VARCHAR(255) email_address
		VARCHAR(255) password
		BOOLEAN is_active
		TIMESTAMP last_login
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Estudiante {
		UUID estudiante_id
		VARCHAR(200) nombre_completo
		DATE fecha_nacimiento
		VARCHAR(12) rut
		CHAR(1) genero
		VARCHAR(255) direccion
		VARCHAR(20) telefono
		VARCHAR(100) email
		BOOLEAN estado_activo
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Curso {
		UUID curso_id
		VARCHAR(100) nombre
		VARCHAR(50) nivel
		SMALLINT generacion
		SMALLINT capacidad_maxima
		INTEGER anio_academico
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Profesor {
		UUID profesor_id
		UUID user_id
		VARCHAR(200) nombre_completo
		VARCHAR(12) rut
		VARCHAR(100) especialidad
		VARCHAR(150) titulo_profesional
		VARCHAR(20) telefono
		BOOLEAN estado_activo
		DATE fecha_contratacion
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Zona {
		VARCHAR(20) zona_id
		UUID colegio_id
		VARCHAR(150) nombre_zona
		TEXT descripcion
		SMALLINT capacidad_total
	}

	Sala {
		VARCHAR(20) sala_id
		VARCHAR(50) nombre
		VARCHAR(50) zona_id
		SMALLINT capacidad
		BOOLEAN tiene_proyector
		BOOLEAN tiene_pizarra_digital
		VARCHAR(20) estado
		JSONB distribucion_asientos_template
	}

	Asignatura {
		UUID asignatura_id
		VARCHAR(100) nombre
		VARCHAR(10) codigo
		UUID profesor_id
		VARCHAR(20) sala_id
		UUID curso_id
		SMALLINT creditos
		SMALLINT horas_semanales
		TEXT descripcion
		VARCHAR(50) periodo
		BOOLEAN estado_activo
		TIMESTAMP created_at
		TIMESTAMP updated_at
		SMALLSERIAL tipo_asignatura_id
	}

	Area {
		SMALLSERIAL area_id
		VARCHAR(100) nombre_area
		UUID colegio_id
		TEXT descripcion
		UUID jefe_area_id
	}

	Administrativo {
		UUID administrativo_id
		UUID user_id
		VARCHAR(200) nombre_completo
		VARCHAR(12) rut
		SMALLINT area_id
		VARCHAR(100) cargo
		VARCHAR(20) telefono
		DATE fecha_contratacion
		BOOLEAN estado_activo
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Tipo_parentesco {
		SMALLSERIAL tipo_parentesco_id
		VARCHAR(50) nombre
		VARCHAR(100) descripcion
	}

	Tutor {
		UUID tutor_id
		UUID user_id
		VARCHAR(200) nombre_completo
		VARCHAR(12) rut
		VARCHAR(20) telefono
		VARCHAR(20) telefono_emergencia
		VARCHAR(255) direccion
		VARCHAR(100) ocupacion
		VARCHAR(100) email
		BOOLEAN estado_activo
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Parentesco {
		UUID tutor_id
		UUID estudiante_id
		SMALLINT tipo_parentesco_id
		BOOLEAN es_tutor_titular
		BOOLEAN es_contacto_emergencia
		BOOLEAN puede_retirar
		TIMESTAMP created_at
	}

	EstadoMatricula {
		SMALLSERIAL estado_matricula_id
		VARCHAR(50) nombre_estado
		VARCHAR(150) descripcion
		BOOLEAN permite_asistencia
		BOOLEAN permite_evaluaciones
	}

	Matricula {
		UUID matricula_id
		UUID estudiante_id
		UUID tutor_titular_id
		UUID curso_id
		VARCHAR(50) periodo
		DATE fecha_matricula
		DATE fecha_pago
		INTEGER monto_matricula
		SMALLINT estado_matricula_id
		TEXT observaciones
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Colegiatura {
		UUID colegiatura_id
		UUID matricula_id
		SMALLINT mes
		SMALLINT anio
		INTEGER monto
		DATE fecha_vencimiento
		TIMESTAMP fecha_pago
		VARCHAR(50) metodo_pago
		VARCHAR(100) numero_comprobante
		VARCHAR(20) estado
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Estudiante_Curso {
		UUID estudiante_id
		UUID curso_id
		VARCHAR(50) periodo_cursado
		DATE fecha_ingreso
		DATE fecha_retiro
		VARCHAR(20) estado
		DECIMAL(4,2) promedio_final
		TIMESTAMP created_at
	}

	Evaluacion {
		SERIAL evaluacion_id
		UUID asignatura_id
		VARCHAR(150) nombre
		TEXT descripcion
		VARCHAR(50) tipo
		DATE fecha_evaluacion
		SMALLINT puntaje_maximo
		DECIMAL(5,2) porcentaje_nota
		JSONB contenido
		BOOLEAN is_recuperativa
		BOOLEAN estado_activo
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	ResultadoEvaluacion {
		SERIAL resultado_id
		INTEGER evaluacion_id
		UUID estudiante_id
		INTEGER puntaje_obtenido
		DECIMAL(4,2) nota
		DECIMAL(5,2) porcentaje
		TIMESTAMP fecha_evaluacion
		TEXT observaciones
		VARCHAR(20) encuesta_id
		TIMESTAMP created_at
		TIMESTAMP updated_at
	}

	Horario {
		SERIAL horario_id
		UUID asignatura_id
		SMALLINT dia_semana
		TIME hora_inicio
		TIME hora_termino
		VARCHAR(20) sala_id
		VARCHAR(50) periodo
		BOOLEAN estado_activo
		TIMESTAMP created_at
	}

	Asistencia {
		SERIAL asistencia_id
		DATE fecha
		UUID estudiante_id
		BOOLEAN presente
		INTEGER retraso_minutos
		INTEGER retiro_anticipado_minutos
		BOOLEAN justificado
		TEXT observaciones
		UUID registrado_por
		TIMESTAMP created_at
	}

	TipoEncuesta {
		SMALLSERIAL tipo_encuesta_id
		VARCHAR(100) nombre_tipo
		TEXT descripcion
		JSONB template_encuesta
		BOOLEAN estado_activo
		TIMESTAMP created_at
	}

	Encuesta {
		VARCHAR(20) encuesta_id
		SMALLINT tipo_encuesta_id
		VARCHAR(200) titulo
		TEXT descripcion
		DATE fecha_inicio
		DATE fecha_fin
		VARCHAR(50) dirigida_a
		BOOLEAN estado_activo
		TIMESTAMP created_at
	}

	Taller {
		VARCHAR(20) taller_id
		VARCHAR(150) nombre
		TEXT descripcion
		UUID profesor_encargado_id
		SMALLINT capacidad_maxima
		VARCHAR(100) horario
		VARCHAR(20) sala_id
		INTEGER costo_adicional
		BOOLEAN estado_activo
		TIMESTAMP created_at
	}

	Grupo_taller {
		SERIAL grupo_id
		VARCHAR(20) taller_id
		UUID estudiante_id
		DATE fecha_inscripcion
		DATE fecha_retiro
		VARCHAR(20) estado
		TEXT observaciones
		TIMESTAMP created_at
	}

	TipoAlerta {
		SERIAL tipo_alerta_id
		VARCHAR(100) nombre
		TEXT descripcion
		SMALLINT nivel_prioridad
		CHAR(7) color_hex
		BOOLEAN requiere_accion
		BOOLEAN estado_activo
	}

	Alerta {
		SERIAL alerta_id
		INTEGER tipo_alerta_id
		UUID estudiante_id
		UUID profesor_id
		UUID administrativo_id
		VARCHAR(200) titulo
		TEXT mensaje
		TIMESTAMP fecha_creacion
		TIMESTAMP fecha_vencimiento
		VARCHAR(20) estado
		SMALLINT prioridad
		UUID creado_por
		UUID resuelto_por
		TIMESTAMP fecha_resolucion
		TEXT observaciones_resolucion
	}

	AnioAcademico {
		SERIAL anio_id
		UUID colegio_id
		INTEGER anio
		DATE fecha_inicio
		DATE fecha_termino
		DATE primer_semestre_inicio
		DATE primer_semestre_fin
		DATE segundo_semestre_inicio
		DATE segundo_semestre_fin
		DATE vacaciones_invierno_inicio
		DATE vacaciones_invierno_fin
		BOOLEAN estado_activo
		TIMESTAMP created_at
	}

	TipoAsignatura {
		SMALLSERIAL tipo_asignatura_id
		VARCHAR(255) nombre
		VARCHAR(255) descripcion
	}

	AsignacionAsiento {
		SERIAL asignacion_id
		UUID estudiante_id
		UUID curso_id
		VARCHAR(20) sala_id
		SMALLINT num_asiento
		DATE fecha_asignacion
		BOOLEAN es_actual
	}
```