/**
 * Tipos TypeScript para el módulo de Estudiantes
 * Define las interfaces para perfil, resumen académico y eventos
 */

// Perfil completo del estudiante
export interface StudentProfile {
  estudiante: {
    estudiante_id: string;
    nombre_completo: string;
    rut: string;
    fecha_nacimiento: Date; 
    genero: 'M' | 'F' | 'O'; // Masculino, Femenino, Otro
    direccion: string;
    comuna: string;
    telefono: string;
    email: string;
    foto_url?: string;
    fecha_ingreso: Date;
    estado_activo: boolean;
    curso_actual: {
      curso_id: string;
      nombre: string;
      nivel: string;
    };
  };
  tutor: {
    nombre_completo: string;
    telefono: string;
  };
}

// Resumen académico del estudiante
export interface AcademicSummary {
  promedio_general: number; // Escala chilena: 1.0 - 7.0
  asistencia_total: number; // Porcentaje: 0 - 100
  total_evaluaciones: number;
  asignaturas: Asignatura[];
}

// Asignatura individual
export interface Asignatura {
  nombre: string;
  promedio: number;
  ultima_nota: number;
}

// Evento próximo (tarea, examen, clase, etc.)
export interface UpcomingEvent {
  id: number;
  titulo: string;
  fecha: string; // ISO 8601 format
  tipo: 'tarea' | 'examen' | 'evento' | 'clase';
  asignatura?: string;
  descripcion?: string;
  lugar?: string;
  sala?: string;
}

// Estado del store de estudiantes
export interface StudentState {
  profile: StudentProfile | null;
  academicSummary: AcademicSummary | null;
  upcomingEvents: UpcomingEvent[];
  loading: boolean;
  error: string | null;
}
