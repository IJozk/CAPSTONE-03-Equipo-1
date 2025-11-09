/**
 * teacher.service.ts
 * Servicio para manejar las peticiones API del profesor
 *
 * Endpoints incluidos:
 * - Dashboard: estadísticas del profesor
 * - Asignaturas: gestión de asignaturas que imparte
 * - Evaluaciones: crear, editar y eliminar evaluaciones
 * - Notas: registrar y editar calificaciones
 * - Asistencia: registro de asistencia
 * - Anotaciones: gestión de observaciones
 * - Horario: ver horario semanal
 * - Reportes: generación de reportes
 */

import apiClient from './api.config';
import type {
  TeacherDashboard,
  Subject,
  Student,
  Evaluation,
  EvaluationFormData,
  Grade,
  GradeFormData,
  Attendance,
  AttendanceFormData,
  Observation,
  ObservationFormData,
  Schedule,
  AttendanceReport,
  Upcoming
} from '@/types/teacher.types';

class TeacherService {

  // ========== DASHBOARD ==========

  /**
   * Obtiene el dashboard del profesor con estadísticas principales
   * GET /api/teachers/me/dashboard
   */
  async getDashboard(): Promise<TeacherDashboard> {
    const response = await apiClient.get<TeacherDashboard>('/teachers/me/dashboard');
    return response.data;
  }

  /**
   * Obtiene próximas clases y evaluaciones
   * GET /api/teachers/me/upcoming
   */
  async getUpcoming(): Promise<Upcoming> {
    const response = await apiClient.get<{ upcoming: Upcoming }>('/teachers/me/upcoming');
    return response.data.upcoming;
  }

  // ========== ASIGNATURAS ==========

  /**
   * Obtiene todas las asignaturas que imparte el profesor
   * Usa el endpoint /asignaturas con query param profesor_id
   */
  async getMySubjects(): Promise<Subject[]> {
    // Primero obtener el profesor_id del usuario actual
    const userStr = localStorage.getItem('auth_user');
    if (!userStr) {
      throw new Error('No hay usuario autenticado');
    }

    const user = JSON.parse(userStr);

    // Obtener el profesor_id haciendo una petición al endpoint de profesores
    // usando el user_id
    const profesorResponse = await apiClient.get(`/profesores`);
    const profesores = profesorResponse.data;

    // Buscar el profesor que coincide con el user_id actual
    const profesor = profesores.find((p: any) => p.user_id === user.id);

    if (!profesor) {
      throw new Error('No se encontró el perfil de profesor');
    }

    // Ahora obtener las asignaturas usando query params en lugar de ruta parametrizada
    // Esto evita conflicto con la ruta /:id que viene antes
    const response = await apiClient.get(`/asignaturas`, {
      params: {
        profesor_id: profesor.profesor_id
      }
    });

    // Mapear la respuesta del backend al formato esperado por el frontend
    const asignaturas = response.data.data || response.data;

    // Mapeo de nivel_id a nombre del nivel
    const nivelMap: Record<number, string> = {
      1: 'Primero Básico',
      2: 'Segundo Básico',
      3: 'Tercero Básico',
      4: 'Cuarto Básico',
      5: 'Quinto Básico',
      6: 'Sexto Básico',
      7: 'Séptimo Básico',
      8: 'Octavo Básico',
      9: 'Primero Medio',
      10: 'Segundo Medio',
      11: 'Tercero Medio',
      12: 'Cuarto Medio'
    };

    return asignaturas.map((asignatura: any) => {
      const nivelId = asignatura.Curso?.nivel_id;
      const nivelNombre = nivelId ? nivelMap[nivelId] || `Nivel ${nivelId}` : 'Sin nivel';

      return {
        asignatura_id: asignatura.asignatura_id,
        nombre: asignatura.nombre,
        codigo: asignatura.codigo,
        curso: {
          curso_id: asignatura.Curso?.curso_id || asignatura.curso_id,
          nombre: asignatura.Curso?.nombre || 'Sin curso',
          nivel: nivelNombre
        },
        total_estudiantes: 0, // No se muestra en la UI
        horas_semanales: asignatura.horas_semanales || 0,
        sala: asignatura.sala_id || 'Sin sala',
        periodo: asignatura.periodo || 'N/A'
      };
    });
  }

  /**
   * Obtiene los estudiantes de una asignatura específica
   * Primero obtiene la asignatura para saber el curso, luego obtiene los estudiantes del curso
   */
  async getSubjectStudents(subjectId: string): Promise<Student[]> {
    try {
      // Obtener la asignatura para saber el curso_id
      const asignaturaResponse = await apiClient.get(`/asignaturas/${subjectId}`);
      const asignatura = asignaturaResponse.data;

      if (!asignatura || !asignatura.curso_id) {
        return [];
      }

      // Obtener estudiantes del curso con filtro
      const estudiantesResponse = await apiClient.get(`/estudiantes`, {
        params: {
          curso_id: asignatura.curso_id
        }
      });

      const estudiantes = estudiantesResponse.data || [];

      // Mapear al formato esperado
      return estudiantes.map((estudiante: any) => ({
        estudiante_id: estudiante.estudiante_id,
        nombre_completo: estudiante.nombre_completo,
        rut: estudiante.rut,
        numero_lista: estudiante.numero_lista || 0,
        promedio_asignatura: 0, // TODO: Calcular desde evaluaciones
        asistencia_porcentaje: 0, // TODO: Calcular desde asistencias
        total_anotaciones_positivas: 0,
        total_anotaciones_negativas: 0
      }));
    } catch (error) {
      console.error('Error obteniendo estudiantes de asignatura:', error);
      return [];
    }
  }

  // ========== EVALUACIONES ==========

  /**
   * Obtiene las evaluaciones de una asignatura
   * Usa el endpoint de evaluaciones por asignatura
   */
  async getSubjectEvaluations(subjectId: string): Promise<Evaluation[]> {
    try {
      const response = await apiClient.get(`/evaluaciones/asignatura/${subjectId}`);
      const evaluaciones = response.data.data || response.data || [];

      // Mapear al formato esperado
      return evaluaciones.map((evaluacion: any) => ({
        evaluacion_id: evaluacion.evaluacion_id,
        asignatura_id: evaluacion.asignatura_id,
        nombre: evaluacion.nombre,
        descripcion: evaluacion.descripcion || '',
        tipo: evaluacion.tipo,
        fecha_evaluacion: evaluacion.fecha_evaluacion,
        puntaje_maximo: evaluacion.puntaje_maximo,
        porcentaje_nota: evaluacion.porcentaje_nota,
        is_recuperativa: evaluacion.is_recuperativa || false,
        total_estudiantes_evaluados: evaluacion.total_estudiantes_evaluados || 0,
        total_estudiantes: evaluacion.total_estudiantes || 0,
        created_at: evaluacion.created_at
      }));
    } catch (error) {
      console.error('Error obteniendo evaluaciones:', error);
      return [];
    }
  }

  /**
   * Crea una nueva evaluación
   * POST /api/evaluaciones
   */
  async createEvaluation(data: EvaluationFormData): Promise<Evaluation> {
    const response = await apiClient.post(`/evaluaciones`, data);
    return response.data.evaluacion || response.data;
  }

  /**
   * Actualiza una evaluación existente
   * PUT /api/evaluaciones/:evaluationId
   */
  async updateEvaluation(evaluationId: number, data: Partial<EvaluationFormData>): Promise<Evaluation> {
    const response = await apiClient.put(`/evaluaciones/${evaluationId}`, data);
    return response.data.evaluacion || response.data;
  }

  /**
   * Elimina una evaluación
   * DELETE /api/evaluaciones/:evaluationId
   */
  async deleteEvaluation(evaluationId: number): Promise<void> {
    await apiClient.delete(`/evaluaciones/${evaluationId}`);
  }

  // ========== NOTAS ==========

  /**
   * Obtiene las notas de una evaluación
   * GET /api/teachers/evaluations/:evaluationId/grades
   */
  async getEvaluationGrades(evaluationId: number): Promise<Grade[]> {
    const response = await apiClient.get<{ grades: Grade[] }>(`/teachers/evaluations/${evaluationId}/grades`);
    return response.data.grades;
  }

  /**
   * Registra o actualiza la nota de un estudiante
   * POST /api/teachers/grades
   */
  async saveGrade(data: GradeFormData): Promise<Grade> {
    const response = await apiClient.post<{ resultado: Grade }>('/teachers/grades', data);
    return response.data.resultado;
  }

  /**
   * Actualiza una nota existente
   * PUT /api/teachers/grades/:gradeId
   */
  async updateGrade(gradeId: number, data: Partial<GradeFormData>): Promise<Grade> {
    const response = await apiClient.put<{ resultado: Grade }>(`/teachers/grades/${gradeId}`, data);
    return response.data.resultado;
  }

  // ========== ASISTENCIA ==========

  /**
   * Obtiene la asistencia de una asignatura en una fecha específica
   * GET /api/teachers/subjects/:subjectId/attendance?fecha=:date
   */
  async getAttendance(subjectId: string, date: string): Promise<Attendance> {
    const response = await apiClient.get<Attendance>(`/teachers/subjects/${subjectId}/attendance`, {
      params: { fecha: date }
    });
    return response.data;
  }

  /**
   * Registra la asistencia de una clase
   * POST /api/teachers/attendance
   */
  async saveAttendance(data: AttendanceFormData): Promise<{ message: string; total_registros: number }> {
    const response = await apiClient.post<{ message: string; total_registros: number }>('/teachers/attendance', data);
    return response.data;
  }

  // ========== ANOTACIONES/OBSERVACIONES ==========

  /**
   * Obtiene todas las observaciones con filtros opcionales
   * GET /api/teachers/observations?tipo=:tipo&asignatura_id=:id
   */
  async getAllObservations(filters?: {
    tipo?: 'positiva' | 'negativa';
    asignatura_id?: string;
    estudiante_id?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
  }): Promise<Observation[]> {
    const response = await apiClient.get<{ observations: Observation[] }>('/teachers/observations', {
      params: filters
    });
    return response.data.observations;
  }

  /**
   * Obtiene las observaciones de un estudiante específico
   * GET /api/teachers/students/:studentId/observations
   */
  async getStudentObservations(studentId: string): Promise<{
    observations: Observation[];
    summary: { total_positivas: number; total_negativas: number };
  }> {
    const response = await apiClient.get<{
      observations: Observation[];
      summary: { total_positivas: number; total_negativas: number };
    }>(`/teachers/students/${studentId}/observations`);
    return response.data;
  }

  /**
   * Crea una nueva observación
   * POST /api/teachers/observations
   */
  async createObservation(data: ObservationFormData): Promise<Observation> {
    const response = await apiClient.post<{ observation: Observation }>('/teachers/observations', data);
    return response.data.observation;
  }

  /**
   * Actualiza una observación existente
   * PUT /api/teachers/observations/:observationId
   */
  async updateObservation(observationId: number, data: Partial<ObservationFormData>): Promise<Observation> {
    const response = await apiClient.put<{ observation: Observation }>(`/teachers/observations/${observationId}`, data);
    return response.data.observation;
  }

  /**
   * Elimina una observación
   * DELETE /api/teachers/observations/:observationId
   */
  async deleteObservation(observationId: number): Promise<void> {
    await apiClient.delete(`/teachers/observations/${observationId}`);
  }

  // ========== HORARIO ==========

  /**
   * Obtiene el horario semanal del profesor
   * GET /api/teachers/me/schedule
   */
  async getMySchedule(): Promise<Schedule[]> {
    const response = await apiClient.get<{ schedule: Schedule[] }>('/teachers/me/schedule');
    return response.data.schedule;
  }

  // ========== REPORTES ==========

  /**
   * Genera reporte de asistencia para una asignatura
   * GET /api/teachers/subjects/:subjectId/attendance-report?start_date=:startDate&end_date=:endDate
   */
  async getAttendanceReport(subjectId: string, startDate: string, endDate: string): Promise<AttendanceReport> {
    const response = await apiClient.get<{ report: AttendanceReport }>(
      `/teachers/subjects/${subjectId}/attendance-report`,
      {
        params: {
          start_date: startDate,
          end_date: endDate
        }
      }
    );
    return response.data.report;
  }

  // ========== UTILIDADES ==========

  /**
   * Calcula la nota en escala chilena (1.0-7.0) basado en el puntaje
   * Nota mínima: 2.0
   * Nota de aprobación: 4.0 (60% del puntaje)
   * Nota máxima: 7.0 (100% del puntaje)
   */
  calculateGrade(score: number, maxScore: number): number {
    if (score < 0 || maxScore <= 0) return 2.0;

    const percentage = (score / maxScore) * 100;
    const minGrade = 2.0;
    const maxGrade = 7.0;
    const passingPercentage = 60;

    let grade: number;

    if (percentage < passingPercentage) {
      // 0% a 60% → 2.0 a 3.9
      grade = minGrade + (percentage / passingPercentage) * 1.9;
    } else {
      // 60% a 100% → 4.0 a 7.0
      grade = 4.0 + ((percentage - passingPercentage) / (100 - passingPercentage)) * 3.0;
    }

    // Redondear a 1 decimal
    return Math.round(grade * 10) / 10;
  }

  /**
   * Calcula el porcentaje obtenido
   */
  calculatePercentage(score: number, maxScore: number): number {
    if (maxScore <= 0) return 0;
    return Math.round((score / maxScore) * 1000) / 10; // 1 decimal
  }

  /**
   * Determina si una nota es aprobatoria (>= 4.0)
   */
  isPassing(grade: number): boolean {
    return grade >= 4.0;
  }

  /**
   * Obtiene el color/clase CSS según la nota
   */
  getGradeColorClass(grade: number): string {
    if (grade >= 6.0) return 'nota-excelente';
    if (grade >= 5.0) return 'nota-buena';
    if (grade >= 4.0) return 'nota-suficiente';
    return 'nota-insuficiente';
  }
}

export default new TeacherService();
