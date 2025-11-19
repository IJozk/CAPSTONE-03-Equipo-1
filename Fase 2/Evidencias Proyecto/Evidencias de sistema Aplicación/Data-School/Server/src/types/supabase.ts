export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      Administrativo: {
        Row: {
          administrativo_id: string
          area_id: number
          cargo: string | null
          created_at: string | null
          estado_activo: boolean | null
          fecha_contratacion: string | null
          nombre_completo: string
          rut: string | null
          telefono: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          administrativo_id?: string
          area_id: number
          cargo?: string | null
          created_at?: string | null
          estado_activo?: boolean | null
          fecha_contratacion?: string | null
          nombre_completo: string
          rut?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          administrativo_id?: string
          area_id?: number
          cargo?: string | null
          created_at?: string | null
          estado_activo?: boolean | null
          fecha_contratacion?: string | null
          nombre_completo?: string
          rut?: string | null
          telefono?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Administrativo_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "Area"
            referencedColumns: ["area_id"]
          },
          {
            foreignKeyName: "Administrativo_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Alerta: {
        Row: {
          administrativo_id: string | null
          alerta_id: number
          creado_por: string | null
          estado: Database["public"]["Enums"]["estado_alerta_enum"] | null
          estudiante_id: string | null
          evento_id: number | null
          fecha_creacion: string | null
          fecha_resolucion: string | null
          fecha_vencimiento: string | null
          mensaje: string
          observaciones_resolucion: string | null
          prioridad: number | null
          profesor_id: string | null
          resuelto_por: string | null
          tipo_alerta_id: number
          titulo: string
        }
        Insert: {
          administrativo_id?: string | null
          alerta_id?: number
          creado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_alerta_enum"] | null
          estudiante_id?: string | null
          evento_id?: number | null
          fecha_creacion?: string | null
          fecha_resolucion?: string | null
          fecha_vencimiento?: string | null
          mensaje: string
          observaciones_resolucion?: string | null
          prioridad?: number | null
          profesor_id?: string | null
          resuelto_por?: string | null
          tipo_alerta_id: number
          titulo: string
        }
        Update: {
          administrativo_id?: string | null
          alerta_id?: number
          creado_por?: string | null
          estado?: Database["public"]["Enums"]["estado_alerta_enum"] | null
          estudiante_id?: string | null
          evento_id?: number | null
          fecha_creacion?: string | null
          fecha_resolucion?: string | null
          fecha_vencimiento?: string | null
          mensaje?: string
          observaciones_resolucion?: string | null
          prioridad?: number | null
          profesor_id?: string | null
          resuelto_por?: string | null
          tipo_alerta_id?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "Alerta_administrativo_id_fkey"
            columns: ["administrativo_id"]
            isOneToOne: false
            referencedRelation: "Administrativo"
            referencedColumns: ["administrativo_id"]
          },
          {
            foreignKeyName: "Alerta_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Alerta_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Alerta_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Alerta_evento_id_fkey"
            columns: ["evento_id"]
            isOneToOne: false
            referencedRelation: "Evento"
            referencedColumns: ["evento_id"]
          },
          {
            foreignKeyName: "Alerta_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "Alerta_resuelto_por_fkey"
            columns: ["resuelto_por"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Alerta_tipo_alerta_id_fkey"
            columns: ["tipo_alerta_id"]
            isOneToOne: false
            referencedRelation: "TipoAlerta"
            referencedColumns: ["tipo_alerta_id"]
          },
        ]
      }
      AnioAcademico: {
        Row: {
          anio: number
          anio_id: number
          colegio_id: string
          created_at: string | null
          estado_activo: boolean | null
          fecha_inicio: string
          fecha_termino: string
          primer_semestre_fin: string | null
          primer_semestre_inicio: string | null
          segundo_semestre_fin: string | null
          segundo_semestre_inicio: string | null
          vacaciones_invierno_fin: string | null
          vacaciones_invierno_inicio: string | null
        }
        Insert: {
          anio: number
          anio_id?: number
          colegio_id: string
          created_at?: string | null
          estado_activo?: boolean | null
          fecha_inicio: string
          fecha_termino: string
          primer_semestre_fin?: string | null
          primer_semestre_inicio?: string | null
          segundo_semestre_fin?: string | null
          segundo_semestre_inicio?: string | null
          vacaciones_invierno_fin?: string | null
          vacaciones_invierno_inicio?: string | null
        }
        Update: {
          anio?: number
          anio_id?: number
          colegio_id?: string
          created_at?: string | null
          estado_activo?: boolean | null
          fecha_inicio?: string
          fecha_termino?: string
          primer_semestre_fin?: string | null
          primer_semestre_inicio?: string | null
          segundo_semestre_fin?: string | null
          segundo_semestre_inicio?: string | null
          vacaciones_invierno_fin?: string | null
          vacaciones_invierno_inicio?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AnioAcademico_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "Colegio"
            referencedColumns: ["colegio_id"]
          },
        ]
      }
      Anotaciones: {
        Row: {
          created_at: string
          descripcion: string | null
          estudiante_id: string
          fecha: string
          id: number
          profesor_id: string | null
          tipo_anotacion: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          estudiante_id?: string
          fecha: string
          id?: number
          profesor_id?: string | null
          tipo_anotacion: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          estudiante_id?: string
          fecha?: string
          id?: number
          profesor_id?: string | null
          tipo_anotacion?: string
        }
        Relationships: [
          {
            foreignKeyName: "Anotaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Anotaciones_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Anotaciones_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
        ]
      }
      Area: {
        Row: {
          area_id: number
          colegio_id: string
          descripcion: string | null
          jefe_area_id: string | null
          nombre_area: string
        }
        Insert: {
          area_id?: number
          colegio_id: string
          descripcion?: string | null
          jefe_area_id?: string | null
          nombre_area: string
        }
        Update: {
          area_id?: number
          colegio_id?: string
          descripcion?: string | null
          jefe_area_id?: string | null
          nombre_area?: string
        }
        Relationships: [
          {
            foreignKeyName: "Area_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "Colegio"
            referencedColumns: ["colegio_id"]
          },
          {
            foreignKeyName: "fk_area_jefe"
            columns: ["jefe_area_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
        ]
      }
      AsignacionAsiento: {
        Row: {
          asignacion_id: number
          curso_id: string
          es_actual: boolean | null
          estudiante_id: string
          fecha_asignacion: string | null
          num_asiento: number | null
          sala_id: string | null
        }
        Insert: {
          asignacion_id?: number
          curso_id: string
          es_actual?: boolean | null
          estudiante_id: string
          fecha_asignacion?: string | null
          num_asiento?: number | null
          sala_id?: string | null
        }
        Update: {
          asignacion_id?: number
          curso_id?: string
          es_actual?: boolean | null
          estudiante_id?: string
          fecha_asignacion?: string | null
          num_asiento?: number | null
          sala_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AsignacionAsiento_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "Curso"
            referencedColumns: ["curso_id"]
          },
          {
            foreignKeyName: "AsignacionAsiento_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "AsignacionAsiento_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "AsignacionAsiento_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "Sala"
            referencedColumns: ["sala_id"]
          },
        ]
      }
      Asignatura: {
        Row: {
          asignatura_id: string
          codigo: string
          created_at: string | null
          creditos: number | null
          curso_id: string
          descripcion: string | null
          estado_activo: boolean | null
          horas_semanales: number | null
          materia_id: number | null
          nombre: string
          periodo: string
          profesor_id: string
          sala_id: string | null
          tipo_asignatura_id: number | null
          updated_at: string | null
        }
        Insert: {
          asignatura_id?: string
          codigo: string
          created_at?: string | null
          creditos?: number | null
          curso_id: string
          descripcion?: string | null
          estado_activo?: boolean | null
          horas_semanales?: number | null
          materia_id?: number | null
          nombre: string
          periodo: string
          profesor_id: string
          sala_id?: string | null
          tipo_asignatura_id?: number | null
          updated_at?: string | null
        }
        Update: {
          asignatura_id?: string
          codigo?: string
          created_at?: string | null
          creditos?: number | null
          curso_id?: string
          descripcion?: string | null
          estado_activo?: boolean | null
          horas_semanales?: number | null
          materia_id?: number | null
          nombre?: string
          periodo?: string
          profesor_id?: string
          sala_id?: string | null
          tipo_asignatura_id?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Asignatura_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "Curso"
            referencedColumns: ["curso_id"]
          },
          {
            foreignKeyName: "Asignatura_materia_id_fkey"
            columns: ["materia_id"]
            isOneToOne: false
            referencedRelation: "Materia"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Asignatura_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "Asignatura_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "Sala"
            referencedColumns: ["sala_id"]
          },
          {
            foreignKeyName: "Asignatura_tipo_asignatura_id_fkey"
            columns: ["tipo_asignatura_id"]
            isOneToOne: false
            referencedRelation: "TipoAsignatura"
            referencedColumns: ["tipo_asignatura_id"]
          },
        ]
      }
      Asistencia: {
        Row: {
          asignatura_id: string
          asistencia_id: number
          created_at: string | null
          estudiante_id: string
          fecha: string
          justificado: boolean | null
          observaciones: string | null
          presente: boolean
          registrado_por: string | null
          retiro_anticipado_minutos: number | null
          retraso_minutos: number | null
        }
        Insert: {
          asignatura_id: string
          asistencia_id?: number
          created_at?: string | null
          estudiante_id: string
          fecha: string
          justificado?: boolean | null
          observaciones?: string | null
          presente?: boolean
          registrado_por?: string | null
          retiro_anticipado_minutos?: number | null
          retraso_minutos?: number | null
        }
        Update: {
          asignatura_id?: string
          asistencia_id?: number
          created_at?: string | null
          estudiante_id?: string
          fecha?: string
          justificado?: boolean | null
          observaciones?: string | null
          presente?: boolean
          registrado_por?: string | null
          retiro_anticipado_minutos?: number | null
          retraso_minutos?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Asistencia_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "Asignatura"
            referencedColumns: ["asignatura_id"]
          },
          {
            foreignKeyName: "Asistencia_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Asistencia_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Asistencia_registrado_por_fkey"
            columns: ["registrado_por"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      AuditoriaAcciones: {
        Row: {
          accion: string
          auditoria_id: number
          datos_anteriores: Json | null
          datos_nuevos: Json | null
          ip_address: unknown
          registro_id: string | null
          tabla_afectada: string
          timestamp_accion: string | null
          user_agent: string | null
          usuario_id: string | null
        }
        Insert: {
          accion: string
          auditoria_id?: number
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: unknown
          registro_id?: string | null
          tabla_afectada: string
          timestamp_accion?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Update: {
          accion?: string
          auditoria_id?: number
          datos_anteriores?: Json | null
          datos_nuevos?: Json | null
          ip_address?: unknown
          registro_id?: string | null
          tabla_afectada?: string
          timestamp_accion?: string | null
          user_agent?: string | null
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "AuditoriaAcciones_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Colegiatura: {
        Row: {
          anio: number
          colegiatura_id: string
          created_at: string | null
          estado: Database["public"]["Enums"]["estado_colegiatura_enum"] | null
          fecha_pago: string | null
          fecha_vencimiento: string
          matricula_id: string
          mes: number
          metodo_pago: string | null
          monto: number
          numero_comprobante: string | null
          updated_at: string | null
        }
        Insert: {
          anio: number
          colegiatura_id?: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_colegiatura_enum"] | null
          fecha_pago?: string | null
          fecha_vencimiento: string
          matricula_id: string
          mes: number
          metodo_pago?: string | null
          monto: number
          numero_comprobante?: string | null
          updated_at?: string | null
        }
        Update: {
          anio?: number
          colegiatura_id?: string
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_colegiatura_enum"] | null
          fecha_pago?: string | null
          fecha_vencimiento?: string
          matricula_id?: string
          mes?: number
          metodo_pago?: string | null
          monto?: number
          numero_comprobante?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Colegiatura_matricula_id_fkey"
            columns: ["matricula_id"]
            isOneToOne: false
            referencedRelation: "Matricula"
            referencedColumns: ["matricula_id"]
          },
        ]
      }
      Colegio: {
        Row: {
          colegio_id: string
          comuna: string | null
          created_at: string | null
          direccion: string | null
          email: string | null
          fecha_creacion: string
          nombre: string
          telefono: string | null
          updated_at: string | null
        }
        Insert: {
          colegio_id?: string
          comuna?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          fecha_creacion: string
          nombre: string
          telefono?: string | null
          updated_at?: string | null
        }
        Update: {
          colegio_id?: string
          comuna?: string | null
          created_at?: string | null
          direccion?: string | null
          email?: string | null
          fecha_creacion?: string
          nombre?: string
          telefono?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ConfiguracionColegio: {
        Row: {
          clave: string
          colegio_id: string
          config_id: string
          created_at: string | null
          descripcion: string | null
          tipo: string | null
          updated_at: string | null
          valor: string | null
        }
        Insert: {
          clave: string
          colegio_id: string
          config_id?: string
          created_at?: string | null
          descripcion?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: string | null
        }
        Update: {
          clave?: string
          colegio_id?: string
          config_id?: string
          created_at?: string | null
          descripcion?: string | null
          tipo?: string | null
          updated_at?: string | null
          valor?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ConfiguracionColegio_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "Colegio"
            referencedColumns: ["colegio_id"]
          },
        ]
      }
      Contrato: {
        Row: {
          created_at: string
          de_planta: boolean
          id_contrato: number
          id_empleado: string
          id_profesion: number
          inicio_contrato: string
          termino_contrato: string | null
        }
        Insert: {
          created_at?: string
          de_planta?: boolean
          id_contrato?: number
          id_empleado?: string
          id_profesion: number
          inicio_contrato: string
          termino_contrato?: string | null
        }
        Update: {
          created_at?: string
          de_planta?: boolean
          id_contrato?: number
          id_empleado?: string
          id_profesion?: number
          inicio_contrato?: string
          termino_contrato?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Contrato_id_empleado_fkey"
            columns: ["id_empleado"]
            isOneToOne: false
            referencedRelation: "Administrativo"
            referencedColumns: ["administrativo_id"]
          },
          {
            foreignKeyName: "Contrato_id_empleado_fkey1"
            columns: ["id_empleado"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "Contrato_id_profesion_fkey"
            columns: ["id_profesion"]
            isOneToOne: false
            referencedRelation: "Profesion"
            referencedColumns: ["id_profesion"]
          },
        ]
      }
      Curso: {
        Row: {
          anio_academico: number
          capacidad_maxima: number | null
          created_at: string | null
          curso_id: string
          generacion: number
          nivel_id: number
          nombre: string
          profesor_jefe_id: string | null
          sala_id: string | null
          updated_at: string | null
        }
        Insert: {
          anio_academico: number
          capacidad_maxima?: number | null
          created_at?: string | null
          curso_id?: string
          generacion: number
          nivel_id: number
          nombre: string
          profesor_jefe_id?: string | null
          sala_id?: string | null
          updated_at?: string | null
        }
        Update: {
          anio_academico?: number
          capacidad_maxima?: number | null
          created_at?: string | null
          curso_id?: string
          generacion?: number
          nivel_id?: number
          nombre?: string
          profesor_jefe_id?: string | null
          sala_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Curso_nivel_id_fkey"
            columns: ["nivel_id"]
            isOneToOne: false
            referencedRelation: "NivelCurso"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Curso_profesor_jefe_id_fkey"
            columns: ["profesor_jefe_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "Curso_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "Sala"
            referencedColumns: ["sala_id"]
          },
        ]
      }
      DatosEstudiante: {
        Row: {
          contenido: Json
          contestada_correctemente: boolean | null
          contestado_en: string
          contestado_por: string | null
          encuesta_id: string
          estudiante_id: string
        }
        Insert: {
          contenido: Json
          contestada_correctemente?: boolean | null
          contestado_en: string
          contestado_por?: string | null
          encuesta_id: string
          estudiante_id: string
        }
        Update: {
          contenido?: Json
          contestada_correctemente?: boolean | null
          contestado_en?: string
          contestado_por?: string | null
          encuesta_id?: string
          estudiante_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "DatosEstudiante_contestado_por_fkey"
            columns: ["contestado_por"]
            isOneToOne: false
            referencedRelation: "Tutor"
            referencedColumns: ["tutor_id"]
          },
          {
            foreignKeyName: "DatosEstudiante_encuesta_id_fkey"
            columns: ["encuesta_id"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
          {
            foreignKeyName: "DatosEstudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: true
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "DatosEstudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: true
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      Encuesta: {
        Row: {
          created_at: string | null
          descripcion: string | null
          dirigida_a: Database["public"]["Enums"]["dirigida_a_encuesta_enum"]
          encuesta_id: string
          estado_activo: boolean | null
          fecha_fin: string
          fecha_inicio: string
          template_encuesta: Json | null
          tipo_encuesta_id: number
          titulo: string
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          dirigida_a: Database["public"]["Enums"]["dirigida_a_encuesta_enum"]
          encuesta_id: string
          estado_activo?: boolean | null
          fecha_fin: string
          fecha_inicio: string
          template_encuesta?: Json | null
          tipo_encuesta_id: number
          titulo: string
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          dirigida_a?: Database["public"]["Enums"]["dirigida_a_encuesta_enum"]
          encuesta_id?: string
          estado_activo?: boolean | null
          fecha_fin?: string
          fecha_inicio?: string
          template_encuesta?: Json | null
          tipo_encuesta_id?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "Encuesta_tipo_encuesta_id_fkey"
            columns: ["tipo_encuesta_id"]
            isOneToOne: false
            referencedRelation: "TipoEncuesta"
            referencedColumns: ["tipo_encuesta_id"]
          },
        ]
      }
      Encuesta_Estudiante: {
        Row: {
          created_at: string
          estudiante_id: string
          fecha_respuesta: string | null
          id_encuesta: string
          respuesta_encuesta: Json
        }
        Insert: {
          created_at?: string
          estudiante_id?: string
          fecha_respuesta?: string | null
          id_encuesta: string
          respuesta_encuesta: Json
        }
        Update: {
          created_at?: string
          estudiante_id?: string
          fecha_respuesta?: string | null
          id_encuesta?: string
          respuesta_encuesta?: Json
        }
        Relationships: [
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_id_encuesta_fkey"
            columns: ["id_encuesta"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
        ]
      }
      Encuesta_Evaluacion: {
        Row: {
          contenido: Json | null
          contestada_en: string | null
          encuesta_id: string | null
          resultado_id: number
        }
        Insert: {
          contenido?: Json | null
          contestada_en?: string | null
          encuesta_id?: string | null
          resultado_id?: number
        }
        Update: {
          contenido?: Json | null
          contestada_en?: string | null
          encuesta_id?: string | null
          resultado_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "Encuesta_Evaluacion_encuesta_id_fkey"
            columns: ["encuesta_id"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
          {
            foreignKeyName: "Encuesta_Evaluacion_resultado_id_fkey"
            columns: ["resultado_id"]
            isOneToOne: true
            referencedRelation: "ResultadoEvaluacion"
            referencedColumns: ["resultado_id"]
          },
        ]
      }
      Especialidad: {
        Row: {
          created_at: string
          id: number
          nombre_especialidad: string
          tipo_especialidad: string
        }
        Insert: {
          created_at?: string
          id?: number
          nombre_especialidad: string
          tipo_especialidad: string
        }
        Update: {
          created_at?: string
          id?: number
          nombre_especialidad?: string
          tipo_especialidad?: string
        }
        Relationships: []
      }
      EstadoMatricula: {
        Row: {
          descripcion: string | null
          estado_matricula_id: number
          nombre_estado: string
          permite_asistencia: boolean | null
          permite_evaluaciones: boolean | null
        }
        Insert: {
          descripcion?: string | null
          estado_matricula_id?: number
          nombre_estado: string
          permite_asistencia?: boolean | null
          permite_evaluaciones?: boolean | null
        }
        Update: {
          descripcion?: string | null
          estado_matricula_id?: number
          nombre_estado?: string
          permite_asistencia?: boolean | null
          permite_evaluaciones?: boolean | null
        }
        Relationships: []
      }
      Estudiante: {
        Row: {
          comuna: string | null
          created_at: string
          direccion: string
          email: string | null
          estado_activo: boolean
          estudiante_id: string
          fecha_nacimiento: string
          foto_url: string | null
          genero: Database["public"]["Enums"]["genero_enum"]
          nombre_completo: string
          rut: string
          telefono: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comuna?: string | null
          created_at?: string
          direccion: string
          email?: string | null
          estado_activo?: boolean
          estudiante_id?: string
          fecha_nacimiento: string
          foto_url?: string | null
          genero: Database["public"]["Enums"]["genero_enum"]
          nombre_completo: string
          rut: string
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comuna?: string | null
          created_at?: string
          direccion?: string
          email?: string | null
          estado_activo?: boolean
          estudiante_id?: string
          fecha_nacimiento?: string
          foto_url?: string | null
          genero?: Database["public"]["Enums"]["genero_enum"]
          nombre_completo?: string
          rut?: string
          telefono?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Estudiante_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Estudiante_Curso: {
        Row: {
          created_at: string | null
          curso_id: string
          estado:
            | Database["public"]["Enums"]["estado_estudiante_curso_enum"]
            | null
          estudiante_id: string
          fecha_ingreso: string
          fecha_retiro: string | null
          periodo_cursado: string
          promedio_final: number | null
        }
        Insert: {
          created_at?: string | null
          curso_id: string
          estado?:
            | Database["public"]["Enums"]["estado_estudiante_curso_enum"]
            | null
          estudiante_id: string
          fecha_ingreso?: string
          fecha_retiro?: string | null
          periodo_cursado: string
          promedio_final?: number | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string
          estado?:
            | Database["public"]["Enums"]["estado_estudiante_curso_enum"]
            | null
          estudiante_id?: string
          fecha_ingreso?: string
          fecha_retiro?: string | null
          periodo_cursado?: string
          promedio_final?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "Estudiante_Curso_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "Curso"
            referencedColumns: ["curso_id"]
          },
          {
            foreignKeyName: "Estudiante_Curso_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Estudiante_Curso_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
        ]
      }
      Evaluacion: {
        Row: {
          asignatura_id: string
          contenido: Json | null
          created_at: string
          descripcion: string
          encuesta_id: string | null
          estado_activo: boolean
          evaluacion_id: number
          fecha_evaluacion: string
          is_recuperativa: boolean
          nombre: string
          porcentaje_nota: number
          puntaje_maximo: number
          tipo: Database["public"]["Enums"]["tipo_evaluacion_enum"]
          updated_at: string
        }
        Insert: {
          asignatura_id: string
          contenido?: Json | null
          created_at?: string
          descripcion: string
          encuesta_id?: string | null
          estado_activo?: boolean
          evaluacion_id?: number
          fecha_evaluacion: string
          is_recuperativa?: boolean
          nombre: string
          porcentaje_nota?: number
          puntaje_maximo: number
          tipo: Database["public"]["Enums"]["tipo_evaluacion_enum"]
          updated_at?: string
        }
        Update: {
          asignatura_id?: string
          contenido?: Json | null
          created_at?: string
          descripcion?: string
          encuesta_id?: string | null
          estado_activo?: boolean
          evaluacion_id?: number
          fecha_evaluacion?: string
          is_recuperativa?: boolean
          nombre?: string
          porcentaje_nota?: number
          puntaje_maximo?: number
          tipo?: Database["public"]["Enums"]["tipo_evaluacion_enum"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "Evaluacion_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "Asignatura"
            referencedColumns: ["asignatura_id"]
          },
          {
            foreignKeyName: "Evaluacion_encuesta_id_fkey"
            columns: ["encuesta_id"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
        ]
      }
      Evento: {
        Row: {
          creado_por: string | null
          evento_id: number
          fecha_fin: string | null
          fecha_inicio: string | null
          lugar: string | null
          modificado_en: string | null
          modificado_por: string | null
          nombre: string | null
        }
        Insert: {
          creado_por?: string | null
          evento_id?: number
          fecha_fin?: string | null
          fecha_inicio?: string | null
          lugar?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre?: string | null
        }
        Update: {
          creado_por?: string | null
          evento_id?: number
          fecha_fin?: string | null
          fecha_inicio?: string | null
          lugar?: string | null
          modificado_en?: string | null
          modificado_por?: string | null
          nombre?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Evento_creado_por_fkey"
            columns: ["creado_por"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "Evento_modificado_por_fkey"
            columns: ["modificado_por"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Grupo_taller: {
        Row: {
          created_at: string | null
          estado: Database["public"]["Enums"]["estado_taller_enum"] | null
          estudiante_id: string
          fecha_inscripcion: string
          fecha_retiro: string | null
          grupo_id: number
          observaciones: string | null
          taller_id: string
        }
        Insert: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_taller_enum"] | null
          estudiante_id: string
          fecha_inscripcion?: string
          fecha_retiro?: string | null
          grupo_id?: number
          observaciones?: string | null
          taller_id: string
        }
        Update: {
          created_at?: string | null
          estado?: Database["public"]["Enums"]["estado_taller_enum"] | null
          estudiante_id?: string
          fecha_inscripcion?: string
          fecha_retiro?: string | null
          grupo_id?: number
          observaciones?: string | null
          taller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Grupo_taller_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Grupo_taller_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Grupo_taller_taller_id_fkey"
            columns: ["taller_id"]
            isOneToOne: false
            referencedRelation: "Taller"
            referencedColumns: ["taller_id"]
          },
        ]
      }
      Horario: {
        Row: {
          asignatura_id: string
          created_at: string | null
          dia_semana: number
          estado_activo: boolean | null
          hora_inicio: string
          hora_termino: string
          horario_id: number
          periodo: string
          sala_id: string | null
        }
        Insert: {
          asignatura_id: string
          created_at?: string | null
          dia_semana: number
          estado_activo?: boolean | null
          hora_inicio: string
          hora_termino: string
          horario_id?: number
          periodo: string
          sala_id?: string | null
        }
        Update: {
          asignatura_id?: string
          created_at?: string | null
          dia_semana?: number
          estado_activo?: boolean | null
          hora_inicio?: string
          hora_termino?: string
          horario_id?: number
          periodo?: string
          sala_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Horario_asignatura_id_fkey"
            columns: ["asignatura_id"]
            isOneToOne: false
            referencedRelation: "Asignatura"
            referencedColumns: ["asignatura_id"]
          },
          {
            foreignKeyName: "Horario_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "Sala"
            referencedColumns: ["sala_id"]
          },
        ]
      }
      Materia: {
        Row: {
          created_at: string
          descripcion: string | null
          id: number
          nombre: string
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre: string
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id?: number
          nombre?: string
        }
        Relationships: []
      }
      Matricula: {
        Row: {
          created_at: string | null
          curso_id: string
          estado_matricula_id: number
          estudiante_id: string
          fecha_matricula: string
          fecha_pago: string | null
          matricula_id: string
          monto_matricula: number | null
          observaciones: string | null
          periodo: string
          tutor_titular_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          curso_id: string
          estado_matricula_id?: number
          estudiante_id: string
          fecha_matricula?: string
          fecha_pago?: string | null
          matricula_id?: string
          monto_matricula?: number | null
          observaciones?: string | null
          periodo: string
          tutor_titular_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          curso_id?: string
          estado_matricula_id?: number
          estudiante_id?: string
          fecha_matricula?: string
          fecha_pago?: string | null
          matricula_id?: string
          monto_matricula?: number | null
          observaciones?: string | null
          periodo?: string
          tutor_titular_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Matricula_curso_id_fkey"
            columns: ["curso_id"]
            isOneToOne: false
            referencedRelation: "Curso"
            referencedColumns: ["curso_id"]
          },
          {
            foreignKeyName: "Matricula_estado_matricula_id_fkey"
            columns: ["estado_matricula_id"]
            isOneToOne: false
            referencedRelation: "EstadoMatricula"
            referencedColumns: ["estado_matricula_id"]
          },
          {
            foreignKeyName: "Matricula_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Matricula_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Matricula_tutor_titular_id_fkey"
            columns: ["tutor_titular_id"]
            isOneToOne: false
            referencedRelation: "Tutor"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      NivelCurso: {
        Row: {
          created_at: string
          id: number
          nivel: string
          numero: number
        }
        Insert: {
          created_at?: string
          id?: number
          nivel: string
          numero: number
        }
        Update: {
          created_at?: string
          id?: number
          nivel?: string
          numero?: number
        }
        Relationships: []
      }
      Parentesco: {
        Row: {
          created_at: string | null
          es_contacto_emergencia: boolean | null
          es_tutor_titular: boolean | null
          estudiante_id: string
          puede_retirar: boolean | null
          tipo_parentesco_id: number
          tutor_id: string
        }
        Insert: {
          created_at?: string | null
          es_contacto_emergencia?: boolean | null
          es_tutor_titular?: boolean | null
          estudiante_id: string
          puede_retirar?: boolean | null
          tipo_parentesco_id: number
          tutor_id: string
        }
        Update: {
          created_at?: string | null
          es_contacto_emergencia?: boolean | null
          es_tutor_titular?: boolean | null
          estudiante_id?: string
          puede_retirar?: boolean | null
          tipo_parentesco_id?: number
          tutor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Parentesco_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Parentesco_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Parentesco_tipo_parentesco_id_fkey"
            columns: ["tipo_parentesco_id"]
            isOneToOne: false
            referencedRelation: "Tipo_parentesco"
            referencedColumns: ["tipo_parentesco_id"]
          },
          {
            foreignKeyName: "Parentesco_tutor_id_fkey"
            columns: ["tutor_id"]
            isOneToOne: false
            referencedRelation: "Tutor"
            referencedColumns: ["tutor_id"]
          },
        ]
      }
      Profesion: {
        Row: {
          created_at: string
          descripcion: string | null
          id_profesion: number
          nombre: string | null
        }
        Insert: {
          created_at?: string
          descripcion?: string | null
          id_profesion?: number
          nombre?: string | null
        }
        Update: {
          created_at?: string
          descripcion?: string | null
          id_profesion?: number
          nombre?: string | null
        }
        Relationships: []
      }
      Profesor: {
        Row: {
          comuna: string | null
          created_at: string
          direccion: string | null
          estado_activo: boolean
          nombre_completo: string
          profesor_id: string
          rut: string
          telefono: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comuna?: string | null
          created_at?: string
          direccion?: string | null
          estado_activo?: boolean
          nombre_completo: string
          profesor_id?: string
          rut: string
          telefono: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comuna?: string | null
          created_at?: string
          direccion?: string | null
          estado_activo?: boolean
          nombre_completo?: string
          profesor_id?: string
          rut?: string
          telefono?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profesor_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      Profesor_especialidad: {
        Row: {
          certificado_url: string | null
          created_at: string
          especialidad_id: number
          fecha_certificacion: string | null
          profesor_id: string
        }
        Insert: {
          certificado_url?: string | null
          created_at?: string
          especialidad_id: number
          fecha_certificacion?: string | null
          profesor_id?: string
        }
        Update: {
          certificado_url?: string | null
          created_at?: string
          especialidad_id?: number
          fecha_certificacion?: string | null
          profesor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Profesor_especialidad_especialidad_id_fkey"
            columns: ["especialidad_id"]
            isOneToOne: false
            referencedRelation: "Especialidad"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Profesor_especialidad_profesor_id_fkey"
            columns: ["profesor_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
        ]
      }
      ResultadoEvaluacion: {
        Row: {
          created_at: string | null
          estudiante_id: string
          evaluacion_id: number
          fecha_evaluacion: string | null
          nota: number | null
          observaciones: string | null
          porcentaje: number | null
          puntaje_obtenido: number
          resultado_id: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          estudiante_id: string
          evaluacion_id: number
          fecha_evaluacion?: string | null
          nota?: number | null
          observaciones?: string | null
          porcentaje?: number | null
          puntaje_obtenido: number
          resultado_id?: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          estudiante_id?: string
          evaluacion_id?: number
          fecha_evaluacion?: string | null
          nota?: number | null
          observaciones?: string | null
          porcentaje?: number | null
          puntaje_obtenido?: number
          resultado_id?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ResultadoEvaluacion_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "ResultadoEvaluacion_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "ResultadoEvaluacion_evaluacion_id_fkey"
            columns: ["evaluacion_id"]
            isOneToOne: false
            referencedRelation: "Evaluacion"
            referencedColumns: ["evaluacion_id"]
          },
        ]
      }
      Sala: {
        Row: {
          capacidad: number | null
          distribucion_asientos_template: Json | null
          estado: Database["public"]["Enums"]["estado_sala_enum"] | null
          nombre: string
          sala_id: string
          tiene_pizarra_digital: boolean | null
          tiene_proyector: boolean | null
          zona_id: string
        }
        Insert: {
          capacidad?: number | null
          distribucion_asientos_template?: Json | null
          estado?: Database["public"]["Enums"]["estado_sala_enum"] | null
          nombre: string
          sala_id: string
          tiene_pizarra_digital?: boolean | null
          tiene_proyector?: boolean | null
          zona_id: string
        }
        Update: {
          capacidad?: number | null
          distribucion_asientos_template?: Json | null
          estado?: Database["public"]["Enums"]["estado_sala_enum"] | null
          nombre?: string
          sala_id?: string
          tiene_pizarra_digital?: boolean | null
          tiene_proyector?: boolean | null
          zona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Sala_zona_id_fkey"
            columns: ["zona_id"]
            isOneToOne: false
            referencedRelation: "Zona"
            referencedColumns: ["zona_id"]
          },
        ]
      }
      Taller: {
        Row: {
          capacidad_maxima: number | null
          costo_adicional: number | null
          created_at: string | null
          descripcion: string | null
          estado_activo: boolean | null
          fecha_inicio: string | null
          fecha_termino: string | null
          horario: string | null
          nombre: string
          profesor_encargado_id: string | null
          sala_id: string | null
          taller_id: string
        }
        Insert: {
          capacidad_maxima?: number | null
          costo_adicional?: number | null
          created_at?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          horario?: string | null
          nombre: string
          profesor_encargado_id?: string | null
          sala_id?: string | null
          taller_id: string
        }
        Update: {
          capacidad_maxima?: number | null
          costo_adicional?: number | null
          created_at?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          fecha_inicio?: string | null
          fecha_termino?: string | null
          horario?: string | null
          nombre?: string
          profesor_encargado_id?: string | null
          sala_id?: string | null
          taller_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Taller_profesor_encargado_id_fkey"
            columns: ["profesor_encargado_id"]
            isOneToOne: false
            referencedRelation: "Profesor"
            referencedColumns: ["profesor_id"]
          },
          {
            foreignKeyName: "Taller_sala_id_fkey"
            columns: ["sala_id"]
            isOneToOne: false
            referencedRelation: "Sala"
            referencedColumns: ["sala_id"]
          },
        ]
      }
      Tipo_parentesco: {
        Row: {
          descripcion: string | null
          nombre: string
          tipo_parentesco_id: number
        }
        Insert: {
          descripcion?: string | null
          nombre: string
          tipo_parentesco_id?: number
        }
        Update: {
          descripcion?: string | null
          nombre?: string
          tipo_parentesco_id?: number
        }
        Relationships: []
      }
      TipoAlerta: {
        Row: {
          color_hex: string | null
          descripcion: string | null
          estado_activo: boolean | null
          nivel_prioridad: number | null
          nombre: string
          requiere_accion: boolean | null
          tipo_alerta_id: number
        }
        Insert: {
          color_hex?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          nivel_prioridad?: number | null
          nombre: string
          requiere_accion?: boolean | null
          tipo_alerta_id?: number
        }
        Update: {
          color_hex?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          nivel_prioridad?: number | null
          nombre?: string
          requiere_accion?: boolean | null
          tipo_alerta_id?: number
        }
        Relationships: []
      }
      TipoAsignatura: {
        Row: {
          descripcion: string | null
          nombre: string | null
          tipo_asignatura_id: number
        }
        Insert: {
          descripcion?: string | null
          nombre?: string | null
          tipo_asignatura_id?: number
        }
        Update: {
          descripcion?: string | null
          nombre?: string | null
          tipo_asignatura_id?: number
        }
        Relationships: []
      }
      TipoEncuesta: {
        Row: {
          created_at: string | null
          descripcion: string | null
          estado_activo: boolean | null
          nombre_tipo: string
          tipo_encuesta_id: number
        }
        Insert: {
          created_at?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          nombre_tipo: string
          tipo_encuesta_id?: number
        }
        Update: {
          created_at?: string | null
          descripcion?: string | null
          estado_activo?: boolean | null
          nombre_tipo?: string
          tipo_encuesta_id?: number
        }
        Relationships: []
      }
      Tutor: {
        Row: {
          comuna: string | null
          created_at: string
          direccion: string
          email: string
          estado_activo: boolean
          nombre_completo: string
          ocupacion: string | null
          rut: string
          telefono: string
          tutor_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comuna?: string | null
          created_at?: string
          direccion: string
          email: string
          estado_activo?: boolean
          nombre_completo: string
          ocupacion?: string | null
          rut: string
          telefono: string
          tutor_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comuna?: string | null
          created_at?: string
          direccion?: string
          email?: string
          estado_activo?: boolean
          nombre_completo?: string
          ocupacion?: string | null
          rut?: string
          telefono?: string
          tutor_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Tutor_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "User"
            referencedColumns: ["user_id"]
          },
        ]
      }
      User: {
        Row: {
          auth_user_id: string | null
          colegio_id: string | null
          created_at: string | null
          email_address: string
          is_active: boolean | null
          last_login: string | null
          profile_completed: boolean | null
          role: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          colegio_id?: string | null
          created_at?: string | null
          email_address: string
          is_active?: boolean | null
          last_login?: string | null
          profile_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          user_id?: string
        }
        Update: {
          auth_user_id?: string | null
          colegio_id?: string | null
          created_at?: string | null
          email_address?: string
          is_active?: boolean | null
          last_login?: string | null
          profile_completed?: boolean | null
          role?: Database["public"]["Enums"]["user_role_enum"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "User_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "Colegio"
            referencedColumns: ["colegio_id"]
          },
        ]
      }
      Zona: {
        Row: {
          capacidad_total: number | null
          colegio_id: string
          descripcion: string | null
          nombre_zona: string
          zona_id: string
        }
        Insert: {
          capacidad_total?: number | null
          colegio_id: string
          descripcion?: string | null
          nombre_zona: string
          zona_id: string
        }
        Update: {
          capacidad_total?: number | null
          colegio_id?: string
          descripcion?: string | null
          nombre_zona?: string
          zona_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Zona_colegio_id_fkey"
            columns: ["colegio_id"]
            isOneToOne: false
            referencedRelation: "Colegio"
            referencedColumns: ["colegio_id"]
          },
        ]
      }
    }
    Views: {
      looker_encuesta_responses: {
        Row: {
          estudiante_id: string | null
          fecha_respuesta: string | null
          id_encuesta: string | null
          pregunta_id: string | null
          respuesta_valor: string | null
          respuestas: Json | null
          titulo_encuesta: string | null
          version_encuesta: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_id_encuesta_fkey"
            columns: ["id_encuesta"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
        ]
      }
      looker_encuesta_responses_completa: {
        Row: {
          encuesta_titulo: string | null
          encuesta_version: string | null
          estudiante_id: string | null
          fecha_respuesta: string | null
          id_encuesta: string | null
          pregunta_descripcion: string | null
          pregunta_id: string | null
          pregunta_texto: string | null
          pregunta_tipo: string | null
          respuesta_texto: string | null
          respuesta_valor_id: string | null
          respuestas_json: Json | null
          titulo: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "Estudiante"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_estudiante_id_fkey"
            columns: ["estudiante_id"]
            isOneToOne: false
            referencedRelation: "vista_resumen_estudiantes"
            referencedColumns: ["estudiante_id"]
          },
          {
            foreignKeyName: "Encuesta_Estudiante_id_encuesta_fkey"
            columns: ["id_encuesta"]
            isOneToOne: false
            referencedRelation: "Encuesta"
            referencedColumns: ["encuesta_id"]
          },
        ]
      }
      vista_horario_completo: {
        Row: {
          asignatura: string | null
          curso: string | null
          dia_semana: number | null
          hora_inicio: string | null
          hora_termino: string | null
          nombre_dia: string | null
          periodo: string | null
          profesor: string | null
          sala: string | null
        }
        Relationships: []
      }
      vista_resumen_estudiantes: {
        Row: {
          curso: string | null
          email: string | null
          estado_curso:
            | Database["public"]["Enums"]["estado_estudiante_curso_enum"]
            | null
          estado_matricula: string | null
          estado_matricula_id: number | null
          estudiante_id: string | null
          nombre_completo: string | null
          promedio_general: number | null
          rut: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Matricula_estado_matricula_id_fkey"
            columns: ["estado_matricula_id"]
            isOneToOne: false
            referencedRelation: "EstadoMatricula"
            referencedColumns: ["estado_matricula_id"]
          },
        ]
      }
    }
    Functions: {
      calcular_porcentaje_asistencia: {
        Args: {
          p_asignatura_id?: string
          p_estudiante_id: string
          p_fecha_fin: string
          p_fecha_inicio: string
        }
        Returns: number
      }
      calcular_promedio_estudiante: {
        Args: {
          p_asignatura_id?: string
          p_estudiante_id: string
          p_periodo?: string
        }
        Returns: number
      }
      format_rut: { Args: { rut_input: string }; Returns: string }
      get_current_user_info: {
        Args: never
        Returns: {
          colegio_id: string
          email: string
          profile_completed: boolean
          role: Database["public"]["Enums"]["user_role_enum"]
          user_id: string
        }[]
      }
      get_especialidades: {
        Args: never
        Returns: {
          id: number
          nombre_especialidad: string
          tipo_especialidad: string
        }[]
      }
      get_profesiones: {
        Args: never
        Returns: {
          descripcion: string
          id_profesion: number
          nombre: string
        }[]
      }
      obtener_horario_estudiante: {
        Args: { p_estudiante_id: string; p_periodo: string }
        Returns: {
          asignatura: string
          dia_semana: number
          hora_inicio: string
          hora_termino: string
          nombre_dia: string
          profesor: string
          sala: string
        }[]
      }
      reporte_notas_estudiante: {
        Args: { p_estudiante_id: string; p_periodo: string }
        Returns: {
          asignatura: string
          evaluaciones_realizadas: number
          nota_maxima: number
          nota_minima: number
          promedio: number
        }[]
      }
      user_has_role: { Args: { required_role: string }; Returns: boolean }
      validate_rut: { Args: { rut_input: string }; Returns: boolean }
    }
    Enums: {
      dirigida_a_encuesta_enum:
        | "ESTUDIANTES"
        | "PROFESORES"
        | "APODERADOS"
        | "ADMINISTRATIVOS"
      estado_alerta_enum: "PENDIENTE" | "VISTA" | "RESUELTA" | "ARCHIVADA"
      estado_colegiatura_enum: "PENDIENTE" | "PAGADO" | "VENCIDO" | "CONDONADO"
      estado_estudiante_curso_enum:
        | "ACTIVO"
        | "RETIRADO"
        | "TRASLADADO"
        | "GRADUADO"
      estado_matricula_enum:
        | "ACTIVA"
        | "PENDIENTE_PAGO"
        | "SUSPENDIDA"
        | "RETIRADA"
        | "TRASLADADA"
      estado_sala_enum: "DISPONIBLE" | "MANTENIMIENTO" | "FUERA_DE_SERVICIO"
      estado_taller_enum: "ACTIVO" | "RETIRADO" | "SUSPENDIDO"
      genero_enum: "M" | "F" | "O"
      tipo_evaluacion_enum:
        | "PRUEBA"
        | "TAREA"
        | "TRABAJO"
        | "EXAMEN"
        | "PROYECTO"
        | "PARTICIPACION"
      user_role_enum:
        | "ESTUDIANTE_APODERADO"
        | "PROFESOR"
        | "ADMINISTRATIVO"
        | "DIRECTOR"
        | "ADMINISTRADOR"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      dirigida_a_encuesta_enum: [
        "ESTUDIANTES",
        "PROFESORES",
        "APODERADOS",
        "ADMINISTRATIVOS",
      ],
      estado_alerta_enum: ["PENDIENTE", "VISTA", "RESUELTA", "ARCHIVADA"],
      estado_colegiatura_enum: ["PENDIENTE", "PAGADO", "VENCIDO", "CONDONADO"],
      estado_estudiante_curso_enum: [
        "ACTIVO",
        "RETIRADO",
        "TRASLADADO",
        "GRADUADO",
      ],
      estado_matricula_enum: [
        "ACTIVA",
        "PENDIENTE_PAGO",
        "SUSPENDIDA",
        "RETIRADA",
        "TRASLADADA",
      ],
      estado_sala_enum: ["DISPONIBLE", "MANTENIMIENTO", "FUERA_DE_SERVICIO"],
      estado_taller_enum: ["ACTIVO", "RETIRADO", "SUSPENDIDO"],
      genero_enum: ["M", "F", "O"],
      tipo_evaluacion_enum: [
        "PRUEBA",
        "TAREA",
        "TRABAJO",
        "EXAMEN",
        "PROYECTO",
        "PARTICIPACION",
      ],
      user_role_enum: [
        "ESTUDIANTE_APODERADO",
        "PROFESOR",
        "ADMINISTRATIVO",
        "DIRECTOR",
        "ADMINISTRADOR",
      ],
    },
  },
} as const
