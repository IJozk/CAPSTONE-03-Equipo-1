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
  porcentaje_asistencia: number; // Porcentaje: 0 - 100
  total_asignaturas: number;
  evaluaciones_pendientes: number;
  ultima_actualizacion: string;
}

// Asignatura con notas
export interface Subject {
  asignatura_id: string;
  nombre_asignatura: string;
  profesor_nombre: string;
  promedio: number;
  notas: Grade[];
}

// Nota individual
export interface Grade {
  nota_id: string;
  evaluacion_nombre: string;
  nota: number;
  fecha: string;
  porcentaje: number;
}

// Registro de asistencia
export interface Attendance {
  id: string;
  fecha: string;
  asignatura_nombre: string;
  estado: 'PRESENTE' | 'AUSENTE' | 'ATRASADO' | 'JUSTIFICADO';
  observacion?: string;
}

// Notificación del estudiante
export interface Notification {
  id: string;
  tipo: 'CALIFICACION' | 'ASISTENCIA' | 'EVENTO' | 'ALERTA';
  titulo: string;
  mensaje: string;
  fecha_creacion: string;
  leida: boolean;
  prioridad: 1 | 2 | 3 | 4 | 5;
}

// Evento próximo (tarea, examen, clase, etc.)
export interface UpcomingEvent {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string; // ISO 8601 format
  tipo: 'EVALUACION' | 'REUNION' | 'ACTIVIDAD' | 'OTRO';
  asignatura?: string;
  lugar?: string;
  sala?: string;
}

// Slot del horario semanal
export interface ScheduleSlot {
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  asignatura: string;
  profesor: string;
  sala?: string;
}
