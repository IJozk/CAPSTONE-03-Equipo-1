-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.Administrativo (
  administrativo_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nombre_completo character varying NOT NULL,
  rut character varying CHECK (validate_rut(rut)),
  area_id smallint NOT NULL,
  cargo character varying,
  telefono character varying CHECK (telefono IS NULL OR telefono::text ~ '^\+?56[0-9]{8,9}$'::text),
  fecha_contratacion date,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Administrativo_pkey PRIMARY KEY (administrativo_id),
  CONSTRAINT Administrativo_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id),
  CONSTRAINT Administrativo_area_id_fkey FOREIGN KEY (area_id) REFERENCES public.Area(area_id)
);
CREATE TABLE public.Alerta (
  alerta_id integer NOT NULL DEFAULT nextval('"Alerta_alerta_id_seq"'::regclass),
  tipo_alerta_id integer NOT NULL,
  estudiante_id uuid,
  profesor_id uuid,
  administrativo_id uuid,
  evento_id integer,
  titulo character varying NOT NULL,
  mensaje text NOT NULL,
  fecha_creacion timestamp without time zone DEFAULT now(),
  fecha_vencimiento timestamp without time zone,
  estado USER-DEFINED DEFAULT 'PENDIENTE'::estado_alerta_enum,
  prioridad smallint DEFAULT 3,
  creado_por uuid,
  resuelto_por uuid,
  fecha_resolucion timestamp without time zone,
  observaciones_resolucion text,
  CONSTRAINT Alerta_pkey PRIMARY KEY (alerta_id),
  CONSTRAINT Alerta_tipo_alerta_id_fkey FOREIGN KEY (tipo_alerta_id) REFERENCES public.TipoAlerta(tipo_alerta_id),
  CONSTRAINT Alerta_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT Alerta_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Alerta_administrativo_id_fkey FOREIGN KEY (administrativo_id) REFERENCES public.Administrativo(administrativo_id),
  CONSTRAINT Alerta_evento_id_fkey FOREIGN KEY (evento_id) REFERENCES public.Evento(evento_id),
  CONSTRAINT Alerta_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.User(user_id),
  CONSTRAINT Alerta_resuelto_por_fkey FOREIGN KEY (resuelto_por) REFERENCES public.User(user_id)
);
CREATE TABLE public.AnioAcademico (
  anio_id integer NOT NULL DEFAULT nextval('"AnioAcademico_anio_id_seq"'::regclass),
  colegio_id uuid NOT NULL,
  anio integer NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_termino date NOT NULL,
  primer_semestre_inicio date,
  primer_semestre_fin date,
  segundo_semestre_inicio date,
  segundo_semestre_fin date,
  vacaciones_invierno_inicio date,
  vacaciones_invierno_fin date,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT AnioAcademico_pkey PRIMARY KEY (anio_id),
  CONSTRAINT AnioAcademico_colegio_id_fkey FOREIGN KEY (colegio_id) REFERENCES public.Colegio(colegio_id)
);
CREATE TABLE public.Area (
  area_id smallint NOT NULL DEFAULT nextval('"Area_area_id_seq"'::regclass),
  nombre_area character varying NOT NULL,
  colegio_id uuid NOT NULL,
  descripcion text,
  jefe_area_id uuid,
  CONSTRAINT Area_pkey PRIMARY KEY (area_id),
  CONSTRAINT Area_colegio_id_fkey FOREIGN KEY (colegio_id) REFERENCES public.Colegio(colegio_id),
  CONSTRAINT fk_area_jefe FOREIGN KEY (jefe_area_id) REFERENCES public.Profesor(profesor_id)
);
CREATE TABLE public.AsignacionAsiento (
  asignacion_id integer NOT NULL DEFAULT nextval('"AsignacionAsiento_asignacion_id_seq"'::regclass),
  estudiante_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  sala_id character varying,
  num_asiento smallint,
  fecha_asignacion date,
  es_actual boolean DEFAULT true,
  CONSTRAINT AsignacionAsiento_pkey PRIMARY KEY (asignacion_id),
  CONSTRAINT AsignacionAsiento_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT AsignacionAsiento_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.Curso(curso_id),
  CONSTRAINT AsignacionAsiento_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.Sala(sala_id)
);
CREATE TABLE public.Asignatura (
  asignatura_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  codigo character varying NOT NULL,
  profesor_id uuid NOT NULL,
  sala_id character varying,
  curso_id uuid NOT NULL,
  tipo_asignatura_id smallint,
  creditos smallint DEFAULT 1,
  horas_semanales smallint DEFAULT 2,
  descripcion text,
  periodo character varying NOT NULL,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Asignatura_pkey PRIMARY KEY (asignatura_id),
  CONSTRAINT Asignatura_profesor_id_fkey FOREIGN KEY (profesor_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Asignatura_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.Sala(sala_id),
  CONSTRAINT Asignatura_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.Curso(curso_id),
  CONSTRAINT Asignatura_tipo_asignatura_id_fkey FOREIGN KEY (tipo_asignatura_id) REFERENCES public.TipoAsignatura(tipo_asignatura_id)
);
CREATE TABLE public.Asistencia (
  asistencia_id integer NOT NULL DEFAULT nextval('"Asistencia_asistencia_id_seq"'::regclass),
  fecha date NOT NULL,
  estudiante_id uuid NOT NULL,
  asignatura_id uuid NOT NULL,
  presente boolean NOT NULL DEFAULT false,
  retraso_minutos integer DEFAULT 0,
  retiro_anticipado_minutos integer DEFAULT 0,
  justificado boolean DEFAULT false,
  observaciones text,
  registrado_por uuid,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Asistencia_pkey PRIMARY KEY (asistencia_id),
  CONSTRAINT Asistencia_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT Asistencia_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.Asignatura(asignatura_id),
  CONSTRAINT Asistencia_registrado_por_fkey FOREIGN KEY (registrado_por) REFERENCES public.User(user_id)
);
CREATE TABLE public.AuditoriaAcciones (
  auditoria_id bigint NOT NULL DEFAULT nextval('"AuditoriaAcciones_auditoria_id_seq"'::regclass),
  usuario_id uuid,
  tabla_afectada character varying NOT NULL,
  registro_id character varying,
  accion character varying NOT NULL CHECK (accion::text = ANY (ARRAY['INSERT'::character varying, 'UPDATE'::character varying, 'DELETE'::character varying]::text[])),
  datos_anteriores jsonb,
  datos_nuevos jsonb,
  timestamp_accion timestamp without time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  CONSTRAINT AuditoriaAcciones_pkey PRIMARY KEY (auditoria_id),
  CONSTRAINT AuditoriaAcciones_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Colegiatura (
  colegiatura_id uuid NOT NULL DEFAULT gen_random_uuid(),
  matricula_id uuid NOT NULL,
  mes smallint NOT NULL CHECK (mes >= 1 AND mes <= 12),
  anio smallint NOT NULL,
  monto integer NOT NULL,
  fecha_vencimiento date NOT NULL,
  fecha_pago timestamp without time zone,
  metodo_pago character varying,
  numero_comprobante character varying,
  estado USER-DEFINED DEFAULT 'PENDIENTE'::estado_colegiatura_enum,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Colegiatura_pkey PRIMARY KEY (colegiatura_id),
  CONSTRAINT Colegiatura_matricula_id_fkey FOREIGN KEY (matricula_id) REFERENCES public.Matricula(matricula_id)
);
CREATE TABLE public.Colegio (
  colegio_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  direccion character varying,
  fecha_creacion date NOT NULL,
  telefono character varying,
  email character varying,
  comuna character varying,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Colegio_pkey PRIMARY KEY (colegio_id)
);
CREATE TABLE public.ConfiguracionColegio (
  config_id uuid NOT NULL DEFAULT gen_random_uuid(),
  colegio_id uuid NOT NULL,
  clave character varying NOT NULL,
  valor text,
  tipo character varying DEFAULT 'STRING'::character varying CHECK (tipo::text = ANY (ARRAY['STRING'::character varying, 'INTEGER'::character varying, 'BOOLEAN'::character varying, 'JSON'::character varying]::text[])),
  descripcion text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ConfiguracionColegio_pkey PRIMARY KEY (config_id),
  CONSTRAINT ConfiguracionColegio_colegio_id_fkey FOREIGN KEY (colegio_id) REFERENCES public.Colegio(colegio_id)
);
CREATE TABLE public.Curso (
  curso_id uuid NOT NULL DEFAULT gen_random_uuid(),
  nombre character varying NOT NULL,
  nivel character varying NOT NULL,
  generacion smallint NOT NULL,
  capacidad_maxima smallint DEFAULT 35,
  anio_academico integer NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Curso_pkey PRIMARY KEY (curso_id)
);
CREATE TABLE public.DatosEstudiante (
  estudiante_id uuid NOT NULL,
  encuesta_id character varying NOT NULL,
  contenido jsonb NOT NULL,
  contestado_en date NOT NULL,
  contestada_correctemente boolean,
  contestado_por uuid,
  CONSTRAINT DatosEstudiante_pkey PRIMARY KEY (estudiante_id),
  CONSTRAINT DatosEstudiante_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT DatosEstudiante_encuesta_id_fkey FOREIGN KEY (encuesta_id) REFERENCES public.Encuesta(encuesta_id),
  CONSTRAINT DatosEstudiante_contestado_por_fkey FOREIGN KEY (contestado_por) REFERENCES public.Tutor(tutor_id)
);
CREATE TABLE public.Encuesta (
  encuesta_id character varying NOT NULL,
  tipo_encuesta_id smallint NOT NULL,
  titulo character varying NOT NULL,
  descripcion text,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  dirigida_a USER-DEFINED NOT NULL,
  template_encuesta jsonb,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Encuesta_pkey PRIMARY KEY (encuesta_id),
  CONSTRAINT Encuesta_tipo_encuesta_id_fkey FOREIGN KEY (tipo_encuesta_id) REFERENCES public.TipoEncuesta(tipo_encuesta_id)
);
CREATE TABLE public.Encuesta_Evaluacion (
  resultado_id smallint NOT NULL DEFAULT nextval('"Encuesta_Evaluacion_resultado_id_seq"'::regclass),
  encuesta_id character varying,
  contenido jsonb,
  contestada_en date,
  CONSTRAINT Encuesta_Evaluacion_pkey PRIMARY KEY (resultado_id),
  CONSTRAINT Encuesta_Evaluacion_encuesta_id_fkey FOREIGN KEY (encuesta_id) REFERENCES public.Encuesta(encuesta_id)
);
CREATE TABLE public.EstadoMatricula (
  estado_matricula_id smallint NOT NULL DEFAULT nextval('"EstadoMatricula_estado_matricula_id_seq"'::regclass),
  nombre_estado character varying NOT NULL,
  descripcion character varying,
  permite_asistencia boolean DEFAULT true,
  permite_evaluaciones boolean DEFAULT true,
  CONSTRAINT EstadoMatricula_pkey PRIMARY KEY (estado_matricula_id)
);
CREATE TABLE public.Estudiante (
  estudiante_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre_completo character varying NOT NULL,
  fecha_nacimiento date NOT NULL,
  rut character varying CHECK (validate_rut(rut)),
  genero USER-DEFINED,
  direccion character varying,
  telefono character varying CHECK (telefono IS NULL OR telefono::text ~ '^\+?56[0-9]{8,9}$'::text),
  email character varying,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Estudiante_pkey PRIMARY KEY (estudiante_id),
  CONSTRAINT Estudiante_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.Estudiante_Curso (
  estudiante_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  periodo_cursado character varying NOT NULL,
  fecha_ingreso date NOT NULL DEFAULT CURRENT_DATE,
  fecha_retiro date,
  estado USER-DEFINED DEFAULT 'ACTIVO'::estado_estudiante_curso_enum,
  promedio_final numeric,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Estudiante_Curso_pkey PRIMARY KEY (estudiante_id, curso_id, periodo_cursado),
  CONSTRAINT Estudiante_Curso_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT Estudiante_Curso_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.Curso(curso_id)
);
CREATE TABLE public.Evaluacion (
  evaluacion_id integer NOT NULL DEFAULT nextval('"Evaluacion_evaluacion_id_seq"'::regclass),
  asignatura_id uuid NOT NULL,
  encuesta_id character varying,
  nombre character varying NOT NULL,
  descripcion text NOT NULL,
  tipo USER-DEFINED NOT NULL,
  fecha_evaluacion date NOT NULL,
  puntaje_maximo smallint NOT NULL,
  porcentaje_nota numeric NOT NULL DEFAULT 100,
  contenido jsonb,
  is_recuperativa boolean NOT NULL DEFAULT false,
  estado_activo boolean NOT NULL DEFAULT true,
  created_at timestamp without time zone NOT NULL DEFAULT now(),
  updated_at timestamp without time zone NOT NULL DEFAULT now(),
  CONSTRAINT Evaluacion_pkey PRIMARY KEY (evaluacion_id),
  CONSTRAINT Evaluacion_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.Asignatura(asignatura_id),
  CONSTRAINT Evaluacion_encuesta_id_fkey FOREIGN KEY (encuesta_id) REFERENCES public.Encuesta(encuesta_id)
);
CREATE TABLE public.Evento (
  evento_id integer NOT NULL DEFAULT nextval('"Evento_evento_id_seq"'::regclass),
  nombre character varying,
  lugar character varying,
  fecha_inicio timestamp without time zone,
  fecha_fin timestamp without time zone,
  creado_por uuid,
  modificado_en timestamp without time zone,
  modificado_por uuid,
  CONSTRAINT Evento_pkey PRIMARY KEY (evento_id),
  CONSTRAINT Evento_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.User(user_id),
  CONSTRAINT Evento_modificado_por_fkey FOREIGN KEY (modificado_por) REFERENCES public.User(user_id)
);
CREATE TABLE public.Grupo_taller (
  grupo_id integer NOT NULL DEFAULT nextval('"Grupo_taller_grupo_id_seq"'::regclass),
  taller_id character varying NOT NULL,
  estudiante_id uuid NOT NULL,
  fecha_inscripcion date NOT NULL DEFAULT CURRENT_DATE,
  fecha_retiro date,
  estado USER-DEFINED DEFAULT 'ACTIVO'::estado_taller_enum,
  observaciones text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Grupo_taller_pkey PRIMARY KEY (grupo_id),
  CONSTRAINT Grupo_taller_taller_id_fkey FOREIGN KEY (taller_id) REFERENCES public.Taller(taller_id),
  CONSTRAINT Grupo_taller_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id)
);
CREATE TABLE public.Horario (
  horario_id integer NOT NULL DEFAULT nextval('"Horario_horario_id_seq"'::regclass),
  asignatura_id uuid NOT NULL,
  dia_semana smallint NOT NULL CHECK (dia_semana >= 1 AND dia_semana <= 7),
  hora_inicio time without time zone NOT NULL,
  hora_termino time without time zone NOT NULL,
  sala_id character varying,
  periodo character varying NOT NULL,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Horario_pkey PRIMARY KEY (horario_id),
  CONSTRAINT Horario_asignatura_id_fkey FOREIGN KEY (asignatura_id) REFERENCES public.Asignatura(asignatura_id),
  CONSTRAINT Horario_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.Sala(sala_id)
);
CREATE TABLE public.Matricula (
  matricula_id uuid NOT NULL DEFAULT gen_random_uuid(),
  estudiante_id uuid NOT NULL,
  tutor_titular_id uuid NOT NULL,
  curso_id uuid NOT NULL,
  periodo character varying NOT NULL,
  fecha_matricula date NOT NULL DEFAULT CURRENT_DATE,
  fecha_pago date,
  monto_matricula integer,
  estado_matricula_id smallint NOT NULL DEFAULT 1,
  observaciones text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Matricula_pkey PRIMARY KEY (matricula_id),
  CONSTRAINT Matricula_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT Matricula_tutor_titular_id_fkey FOREIGN KEY (tutor_titular_id) REFERENCES public.Tutor(tutor_id),
  CONSTRAINT Matricula_curso_id_fkey FOREIGN KEY (curso_id) REFERENCES public.Curso(curso_id),
  CONSTRAINT Matricula_estado_matricula_id_fkey FOREIGN KEY (estado_matricula_id) REFERENCES public.EstadoMatricula(estado_matricula_id)
);
CREATE TABLE public.Parentesco (
  tutor_id uuid NOT NULL,
  estudiante_id uuid NOT NULL,
  tipo_parentesco_id smallint NOT NULL,
  es_tutor_titular boolean DEFAULT false,
  es_contacto_emergencia boolean DEFAULT false,
  puede_retirar boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Parentesco_pkey PRIMARY KEY (tutor_id, estudiante_id, tipo_parentesco_id),
  CONSTRAINT Parentesco_tutor_id_fkey FOREIGN KEY (tutor_id) REFERENCES public.Tutor(tutor_id),
  CONSTRAINT Parentesco_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id),
  CONSTRAINT Parentesco_tipo_parentesco_id_fkey FOREIGN KEY (tipo_parentesco_id) REFERENCES public.Tipo_parentesco(tipo_parentesco_id)
);
CREATE TABLE public.Profesor (
  profesor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nombre_completo character varying NOT NULL,
  rut character varying CHECK (validate_rut(rut)),
  especialidad character varying,
  titulo_profesional character varying,
  telefono character varying CHECK (telefono IS NULL OR telefono::text ~ '^\+?56[0-9]{8,9}$'::text),
  estado_activo boolean DEFAULT true,
  fecha_contratacion date,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Profesor_pkey PRIMARY KEY (profesor_id),
  CONSTRAINT Profesor_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.ResultadoEvaluacion (
  resultado_id integer NOT NULL DEFAULT nextval('"ResultadoEvaluacion_resultado_id_seq"'::regclass),
  evaluacion_id integer NOT NULL,
  estudiante_id uuid NOT NULL,
  puntaje_obtenido integer NOT NULL,
  nota numeric CHECK (nota >= 1.0 AND nota <= 7.0),
  porcentaje numeric,
  fecha_evaluacion timestamp without time zone DEFAULT now(),
  observaciones text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT ResultadoEvaluacion_pkey PRIMARY KEY (resultado_id),
  CONSTRAINT ResultadoEvaluacion_evaluacion_id_fkey FOREIGN KEY (evaluacion_id) REFERENCES public.Evaluacion(evaluacion_id),
  CONSTRAINT ResultadoEvaluacion_estudiante_id_fkey FOREIGN KEY (estudiante_id) REFERENCES public.Estudiante(estudiante_id)
);
CREATE TABLE public.Sala (
  sala_id character varying NOT NULL,
  nombre character varying NOT NULL,
  zona_id character varying NOT NULL,
  capacidad smallint DEFAULT 35,
  tiene_proyector boolean DEFAULT false,
  tiene_pizarra_digital boolean DEFAULT false,
  estado USER-DEFINED DEFAULT 'DISPONIBLE'::estado_sala_enum,
  distribucion_asientos_template jsonb,
  CONSTRAINT Sala_pkey PRIMARY KEY (sala_id),
  CONSTRAINT Sala_zona_id_fkey FOREIGN KEY (zona_id) REFERENCES public.Zona(zona_id)
);
CREATE TABLE public.Taller (
  taller_id character varying NOT NULL,
  nombre character varying NOT NULL,
  descripcion text,
  profesor_encargado_id uuid,
  capacidad_maxima smallint DEFAULT 25,
  horario character varying,
  sala_id character varying,
  costo_adicional integer DEFAULT 0,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Taller_pkey PRIMARY KEY (taller_id),
  CONSTRAINT Taller_profesor_encargado_id_fkey FOREIGN KEY (profesor_encargado_id) REFERENCES public.Profesor(profesor_id),
  CONSTRAINT Taller_sala_id_fkey FOREIGN KEY (sala_id) REFERENCES public.Sala(sala_id)
);
CREATE TABLE public.TipoAlerta (
  tipo_alerta_id integer NOT NULL DEFAULT nextval('"TipoAlerta_tipo_alerta_id_seq"'::regclass),
  nombre character varying NOT NULL,
  descripcion text,
  nivel_prioridad smallint DEFAULT 3 CHECK (nivel_prioridad >= 1 AND nivel_prioridad <= 5),
  color_hex character DEFAULT '#FFD700'::bpchar,
  requiere_accion boolean DEFAULT false,
  estado_activo boolean DEFAULT true,
  CONSTRAINT TipoAlerta_pkey PRIMARY KEY (tipo_alerta_id)
);
CREATE TABLE public.TipoAsignatura (
  tipo_asignatura_id smallint NOT NULL DEFAULT nextval('"TipoAsignatura_tipo_asignatura_id_seq"'::regclass),
  nombre character varying,
  descripcion character varying,
  CONSTRAINT TipoAsignatura_pkey PRIMARY KEY (tipo_asignatura_id)
);
CREATE TABLE public.TipoEncuesta (
  tipo_encuesta_id smallint NOT NULL DEFAULT nextval('"TipoEncuesta_tipo_encuesta_id_seq"'::regclass),
  nombre_tipo character varying NOT NULL,
  descripcion text,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT TipoEncuesta_pkey PRIMARY KEY (tipo_encuesta_id)
);
CREATE TABLE public.Tipo_parentesco (
  tipo_parentesco_id smallint NOT NULL DEFAULT nextval('"Tipo_parentesco_tipo_parentesco_id_seq"'::regclass),
  nombre character varying NOT NULL,
  descripcion character varying,
  CONSTRAINT Tipo_parentesco_pkey PRIMARY KEY (tipo_parentesco_id)
);
CREATE TABLE public.Tutor (
  tutor_id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid,
  nombre_completo character varying NOT NULL,
  rut character varying CHECK (validate_rut(rut)),
  telefono character varying CHECK (telefono IS NULL OR telefono::text ~ '^\+?56[0-9]{8,9}$'::text),
  telefono_emergencia character varying CHECK (telefono_emergencia IS NULL OR telefono_emergencia::text ~ '^\+?56[0-9]{8,9}$'::text),
  direccion character varying,
  ocupacion character varying,
  email character varying,
  estado_activo boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT Tutor_pkey PRIMARY KEY (tutor_id),
  CONSTRAINT Tutor_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.User(user_id)
);
CREATE TABLE public.User (
  user_id uuid NOT NULL DEFAULT gen_random_uuid(),
  email_address character varying NOT NULL,
  is_active boolean DEFAULT true,
  last_login timestamp without time zone,
  auth_user_id uuid,
  profile_completed boolean DEFAULT false,
  role USER-DEFINED,
  colegio_id uuid,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT User_pkey PRIMARY KEY (user_id),
  CONSTRAINT User_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id),
  CONSTRAINT User_colegio_id_fkey FOREIGN KEY (colegio_id) REFERENCES public.Colegio(colegio_id)
);
CREATE TABLE public.Zona (
  zona_id character varying NOT NULL,
  colegio_id uuid NOT NULL,
  nombre_zona character varying NOT NULL,
  descripcion text,
  capacidad_total smallint,
  CONSTRAINT Zona_pkey PRIMARY KEY (zona_id),
  CONSTRAINT Zona_colegio_id_fkey FOREIGN KEY (colegio_id) REFERENCES public.Colegio(colegio_id)
);