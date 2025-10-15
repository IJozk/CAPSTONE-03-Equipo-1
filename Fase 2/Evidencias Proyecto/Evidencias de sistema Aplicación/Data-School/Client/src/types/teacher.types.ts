export interface TeacherDashboard {
  profesor: {
    profesor_id: string;
    nombre_completo: string;
    especialidad: string;
    titulo_profesional: string;
  };
  stats: {
    total_asignaturas: number;
    total_estudiantes: number;
    total_cursos: number;
    evaluaciones_pendientes_revision: number;
    asistencias_por_registrar_hoy: number;
    promedio_general_asignaturas: number;
  };
}

export interface Subject {
  asignatura_id: string;
  nombre: string;
  codigo: string;
  curso: {
    curso_id: string;
    nombre: string;
    nivel: string;
  };
  total_estudiantes: number;
  horas_semanales: number;
  sala: string;
  periodo: string;
}

export interface Student {
  estudiante_id: string;
  nombre_completo: string;
  rut: string;
  numero_lista: number;
  promedio_asignatura: number;
  asistencia_porcentaje: number;
  total_anotaciones_positivas: number;
  total_anotaciones_negativas: number;
}

export type EvaluationType = 'PRUEBA' | 'TRABAJO' | 'TAREA' | 'PROYECTO' | 'PRESENTACION' | 'OTROS';

export interface Evaluation {
  evaluacion_id: number;
  asignatura_id: string;
  nombre: string;
  descripcion: string;
  tipo: EvaluationType;
  fecha_evaluacion: string;
  puntaje_maximo: number;
  porcentaje_nota: number;
  is_recuperativa: boolean;
  total_estudiantes_evaluados?: number;
  total_estudiantes?: number;
  created_at: string;
}

export interface Grade {
  resultado_id: number;
  evaluacion_id: number;
  estudiante: {
    estudiante_id: string;
    nombre_completo: string;
    numero_lista: number;
  };
  puntaje_obtenido: number;
  nota: number;
  porcentaje: number;
  observaciones?: string;
}

export interface AttendanceRecord {
  estudiante_id: string;
  nombre_completo: string;
  numero_lista: number;
  presente: boolean;
  retraso_minutos: number;
  retiro_anticipado_minutos: number;
  justificado: boolean;
  observaciones?: string;
}

export interface Attendance {
  attendance: AttendanceRecord[];
  stats: {
    total_estudiantes: number;
    presentes: number;
    ausentes: number;
    retrasos: number;
    porcentaje_asistencia: number;
  };
}

export type ObservationType = 'positiva' | 'negativa';
export type ObservationCategory = 'conducta' | 'academico' | 'participacion' | 'asistencia' | 'otro';

export interface Observation {
  id: number;
  estudiante_id: string;
  estudiante_nombre?: string;
  tipo: ObservationType;
  categoria: ObservationCategory;
  descripcion: string;
  fecha: string;
  profesor?: string;
  asignatura?: string;
}

export interface Schedule {
  horario_id: number;
  dia_semana: number; // 1-7 (1=Lunes, 7=Domingo)
  hora_inicio: string;
  hora_termino: string;
  asignatura: {
    nombre: string;
    curso: string;
    sala: string;
  };
}

export type ClassStatus = 'en_progreso' | 'proxima' | 'completada';

export interface TodayClass {
  hora_inicio: string;
  hora_termino: string;
  asignatura: string;
  curso: string;
  sala: string;
  estado?: ClassStatus;
}

export type EvaluationStatus = 'por_aplicar' | 'por_revisar' | 'completada';

export interface UpcomingEvaluation {
  evaluacion_id: number;
  nombre: string;
  asignatura: string;
  curso: string;
  fecha: string;
  dias_restantes: number;
  estado: EvaluationStatus;
}

export interface Upcoming {
  clases_hoy: TodayClass[];
  evaluaciones_proximas: UpcomingEvaluation[];
}

export interface AttendanceReport {
  asignatura: string;
  periodo: string;
  estudiantes: {
    nombre_completo: string;
    total_clases: number;
    presentes: number;
    ausentes: number;
    retrasos: number;
    porcentaje_asistencia: number;
  }[];
  promedios: {
    asistencia_curso: number;
  };
}

export interface Profesor {
  user_id: string;
  profesor_id: string;
  nombre_completo: string;
  rut: string;
  titulo_profesional: string;
  especialidad: string;
  fecha_contratacion: string; // ISO date
  estado_activo: boolean;
  telefono?: string;
  direccion?: string;
  genero?: string;
  fecha_nacimiento?: string; // ISO date
  created_at?: string; // ISO date
}

export interface TeacherState {
  profesores: Profesor[],
  currentProfesor: Profesor,
  dashboard: TeacherDashboard | null;
  subjects: Subject[];
  currentSubject: Subject | null;
  currentSubjectStudents: Student[];
  evaluations: Evaluation[];
  currentEvaluation: Evaluation | null;
  grades: Grade[];
  observations: Observation[];
  schedule: Schedule[];
  upcoming: Upcoming | null;
  loading: boolean;
  error: string | null;
}

// Form interfaces
export interface EvaluationFormData {
  asignatura_id: string;
  nombre: string;
  descripcion: string;
  tipo: EvaluationType;
  fecha_evaluacion: string;
  puntaje_maximo: number;
  porcentaje_nota: number;
  is_recuperativa: boolean;
}

export interface GradeFormData {
  evaluacion_id: number;
  estudiante_id: string;
  puntaje_obtenido: number;
  observaciones?: string;
}

export interface AttendanceFormData {
  fecha: string;
  asignatura_id: string;
  asistencias: AttendanceRecord[];
}

export interface ObservationFormData {
  estudiante_id: string;
  tipo: ObservationType;
  categoria: ObservationCategory;
  descripcion: string;
  asignatura_id?: string;
}

export interface Teacher {
  user_id: string;
  profesor_id: string;
  nombre_completo: string;
  rut: string;
  titulo_profesional: string;
  especialidad: string;
  fecha_contratacion: string; // ISO date
  estado_activo: boolean;
  telefono?: string;
  direccion?: string;
  genero?: string;
  fecha_nacimiento?: string; // ISO date
  created_at?: string; // ISO date
}
