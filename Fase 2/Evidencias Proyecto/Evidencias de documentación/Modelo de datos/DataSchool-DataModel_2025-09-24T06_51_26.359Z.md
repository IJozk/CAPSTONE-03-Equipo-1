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