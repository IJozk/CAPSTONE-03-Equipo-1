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
   * GET /api/teachers/me/subjects
   */
  async getMySubjects(): Promise<Subject[]> {
    const response = await apiClient.get<{ subjects: Subject[] }>('/teachers/me/subjects');
    return response.data.subjects;
  }

  /**
   * Obtiene los estudiantes de una asignatura específica
   * GET /api/teachers/subjects/:subjectId/students
   */
  async getSubjectStudents(subjectId: string): Promise<Student[]> {
    const response = await apiClient.get<{ students: Student[] }>(`/teachers/subjects/${subjectId}/students`);
    return response.data.students;
  }

  // ========== EVALUACIONES ==========

  /**
   * Obtiene las evaluaciones de una asignatura
   * GET /api/teachers/subjects/:subjectId/evaluations
   */
  async getSubjectEvaluations(subjectId: string): Promise<Evaluation[]> {
    const response = await apiClient.get<{ evaluations: Evaluation[] }>(`/teachers/subjects/${subjectId}/evaluations`);
    return response.data.evaluations;
  }

  /**
   * Crea una nueva evaluación
   * POST /api/teachers/evaluations
   */
  async createEvaluation(data: EvaluationFormData): Promise<Evaluation> {
    const response = await apiClient.post<{ evaluacion: Evaluation }>('/teachers/evaluations', data);
    return response.data.evaluacion;
  }

  /**
   * Actualiza una evaluación existente
   * PUT /api/teachers/evaluations/:evaluationId
   */
  async updateEvaluation(evaluationId: number, data: Partial<EvaluationFormData>): Promise<Evaluation> {
    const response = await apiClient.put<{ evaluacion: Evaluation }>(`/teachers/evaluations/${evaluationId}`, data);
    return response.data.evaluacion;
  }

  /**
   * Elimina una evaluación
   * DELETE /api/teachers/evaluations/:evaluationId
   */
  async deleteEvaluation(evaluationId: number): Promise<void> {
    await apiClient.delete(`/teachers/evaluations/${evaluationId}`);
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
