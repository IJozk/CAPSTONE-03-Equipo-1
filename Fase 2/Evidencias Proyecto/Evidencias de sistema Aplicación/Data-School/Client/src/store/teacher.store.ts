/**
 * teacher.store.ts
 * Store de Pinia para gestionar el estado del módulo de profesores
 */

import { defineStore } from 'pinia';
import teacherService from '@/services/teacher.service';
import type {
  TeacherState,
  TeacherDashboard,
  Subject,
  Student,
  Evaluation,
  EvaluationFormData,
  Grade,
  GradeFormData,
  Observation,
  ObservationFormData,
  Schedule,
  Upcoming,
  AttendanceFormData
} from '@/types/teacher.types';

export const useTeacherStore = defineStore('teacher', {
  state: (): TeacherState => ({
    dashboard: null,
    subjects: [],
    currentSubject: null,
    currentSubjectStudents: [],
    evaluations: [],
    currentEvaluation: null,
    grades: [],
    observations: [],
    schedule: [],
    upcoming: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Nombre completo del profesor
     */
    teacherName: (state): string => {
      return state.dashboard?.profesor.nombre_completo || '';
    },

    /**
     * Especialidad del profesor
     */
    teacherSpecialty: (state): string => {
      return state.dashboard?.profesor.especialidad || '';
    },

    /**
     * Total de asignaturas que imparte
     */
    totalSubjects: (state): number => {
      return state.subjects.length;
    },

    /**
     * Total de estudiantes en todas las asignaturas
     */
    totalStudents: (state): number => {
      return state.dashboard?.stats.total_estudiantes || 0;
    },

    /**
     * Evaluaciones pendientes de revisión
     */
    pendingEvaluations: (state): number => {
      return state.dashboard?.stats.evaluaciones_pendientes_revision || 0;
    },

    /**
     * Asistencias por registrar hoy
     */
    pendingAttendance: (state): number => {
      return state.dashboard?.stats.asistencias_por_registrar_hoy || 0;
    },

    /**
     * Promedio general de todas las asignaturas
     */
    generalAverage: (state): number => {
      return state.dashboard?.stats.promedio_general_asignaturas || 0;
    },

    /**
     * Clases de hoy
     */
    todayClasses: (state) => {
      return state.upcoming?.clases_hoy || [];
    },

    /**
     * Evaluaciones próximas
     */
    upcomingEvaluations: (state) => {
      return state.upcoming?.evaluaciones_proximas || [];
    },

    /**
     * Buscar asignatura por nombre
     */
    subjectByName: (state) => {
      return (name: string) => {
        return state.subjects.find(s => s.nombre === name);
      };
    },

    /**
     * Buscar asignatura por ID
     */
    subjectById: (state) => {
      return (id: string) => {
        return state.subjects.find(s => s.asignatura_id === id);
      };
    },

    /**
     * Observaciones filtradas por tipo
     */
    observationsByType: (state) => {
      return (tipo: 'positiva' | 'negativa') => {
        return state.observations.filter(o => o.tipo === tipo);
      };
    },

    /**
     * Total de observaciones positivas
     */
    totalPositiveObservations: (state): number => {
      return state.observations.filter(o => o.tipo === 'positiva').length;
    },

    /**
     * Total de observaciones negativas
     */
    totalNegativeObservations: (state): number => {
      return state.observations.filter(o => o.tipo === 'negativa').length;
    },

    /**
     * Evaluaciones urgentes (menos de 3 días)
     */
    urgentEvaluations: (state) => {
      return state.upcoming?.evaluaciones_proximas.filter(e => e.dias_restantes < 3) || [];
    },

    /**
     * Obtiene el horario de un día específico
     */
    scheduleByDay: (state) => {
      return (day: number) => {
        return state.schedule.filter(s => s.dia_semana === day);
      };
    }
  },

  actions: {
    // ========== DASHBOARD ==========

    /**
     * Carga el dashboard del profesor
     */
    async fetchDashboard(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.dashboard = await teacherService.getDashboard();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar el dashboard';
        console.error('Error fetching dashboard:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Carga próximas clases y evaluaciones
     */
    async fetchUpcoming(): Promise<void> {
      try {
        this.upcoming = await teacherService.getUpcoming();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar próximas actividades';
        console.error('Error fetching upcoming:', error);
      }
    },

    /**
     * Carga todos los datos del dashboard
     */
    async loadDashboardData(): Promise<void> {
      await Promise.all([
        this.fetchDashboard(),
        this.fetchMySubjects(),
        this.fetchUpcoming()
      ]);
    },

    // ========== ASIGNATURAS ==========

    /**
     * Obtiene todas las asignaturas del profesor
     */
    async fetchMySubjects(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.subjects = await teacherService.getMySubjects();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar asignaturas';
        console.error('Error fetching subjects:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene los estudiantes de una asignatura
     */
    async fetchSubjectStudents(subjectId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.currentSubjectStudents = await teacherService.getSubjectStudents(subjectId);
        this.currentSubject = this.subjects.find(s => s.asignatura_id === subjectId) || null;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar estudiantes';
        console.error('Error fetching students:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // ========== EVALUACIONES ==========

    /**
     * Obtiene las evaluaciones de una asignatura
     */
    async fetchSubjectEvaluations(subjectId: string): Promise<void> {
      this.error = null;
      try {
        this.evaluations = await teacherService.getSubjectEvaluations(subjectId);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar evaluaciones';
        console.error('Error fetching evaluations:', error);
        throw error;
      }
    },

    /**
     * Crea una nueva evaluación
     */
    async createEvaluation(data: EvaluationFormData): Promise<Evaluation> {
      this.error = null;
      try {
        const newEvaluation = await teacherService.createEvaluation(data);
        this.evaluations.push(newEvaluation);
        return newEvaluation;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear evaluación';
        console.error('Error creating evaluation:', error);
        throw error;
      }
    },

    /**
     * Actualiza una evaluación
     */
    async updateEvaluation(evaluationId: number, data: Partial<EvaluationFormData>): Promise<Evaluation> {
      this.error = null;
      try {
        const updated = await teacherService.updateEvaluation(evaluationId, data);
        const index = this.evaluations.findIndex(e => e.evaluacion_id === evaluationId);
        if (index !== -1) {
          this.evaluations[index] = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar evaluación';
        console.error('Error updating evaluation:', error);
        throw error;
      }
    },

    /**
     * Elimina una evaluación
     */
    async deleteEvaluation(evaluationId: number): Promise<void> {
      this.error = null;
      try {
        await teacherService.deleteEvaluation(evaluationId);
        this.evaluations = this.evaluations.filter(e => e.evaluacion_id !== evaluationId);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar evaluación';
        console.error('Error deleting evaluation:', error);
        throw error;
      }
    },

    // ========== NOTAS ==========

    /**
     * Obtiene las notas de una evaluación
     */
    async fetchEvaluationGrades(evaluationId: number): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.grades = await teacherService.getEvaluationGrades(evaluationId);
        this.currentEvaluation = this.evaluations.find(e => e.evaluacion_id === evaluationId) || null;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar notas';
        console.error('Error fetching grades:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Guarda o actualiza una nota
     */
    async saveGrade(data: GradeFormData): Promise<Grade> {
      this.error = null;
      try {
        const savedGrade = await teacherService.saveGrade(data);

        // Actualizar en el array de grades
        const index = this.grades.findIndex(
          g => g.estudiante.estudiante_id === data.estudiante_id
        );

        if (index !== -1) {
          this.grades[index] = savedGrade;
        } else {
          this.grades.push(savedGrade);
        }

        return savedGrade;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al guardar nota';
        console.error('Error saving grade:', error);
        throw error;
      }
    },

    /**
     * Actualiza una nota existente
     */
    async updateGrade(gradeId: number, data: Partial<GradeFormData>): Promise<Grade> {
      this.error = null;
      try {
        const updated = await teacherService.updateGrade(gradeId, data);
        const index = this.grades.findIndex(g => g.resultado_id === gradeId);
        if (index !== -1) {
          this.grades[index] = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar nota';
        console.error('Error updating grade:', error);
        throw error;
      }
    },

    // ========== ASISTENCIA ==========

    /**
     * Registra la asistencia de una clase
     */
    async saveAttendance(data: AttendanceFormData): Promise<void> {
      this.error = null;
      try {
        await teacherService.saveAttendance(data);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al registrar asistencia';
        console.error('Error saving attendance:', error);
        throw error;
      }
    },

    // ========== OBSERVACIONES ==========

    /**
     * Obtiene todas las observaciones con filtros
     */
    async fetchObservations(filters?: any): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.observations = await teacherService.getAllObservations(filters);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar observaciones';
        console.error('Error fetching observations:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una nueva observación
     */
    async createObservation(data: ObservationFormData): Promise<Observation> {
      this.error = null;
      try {
        const newObservation = await teacherService.createObservation(data);
        this.observations.unshift(newObservation); // Agregar al inicio
        return newObservation;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear observación';
        console.error('Error creating observation:', error);
        throw error;
      }
    },

    /**
     * Actualiza una observación
     */
    async updateObservation(observationId: number, data: Partial<ObservationFormData>): Promise<Observation> {
      this.error = null;
      try {
        const updated = await teacherService.updateObservation(observationId, data);
        const index = this.observations.findIndex(o => o.id === observationId);
        if (index !== -1) {
          this.observations[index] = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar observación';
        console.error('Error updating observation:', error);
        throw error;
      }
    },

    /**
     * Elimina una observación
     */
    async deleteObservation(observationId: number): Promise<void> {
      this.error = null;
      try {
        await teacherService.deleteObservation(observationId);
        this.observations = this.observations.filter(o => o.id !== observationId);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar observación';
        console.error('Error deleting observation:', error);
        throw error;
      }
    },

    // ========== HORARIO ==========

    /**
     * Obtiene el horario del profesor
     */
    async fetchSchedule(): Promise<void> {
      this.error = null;
      try {
        this.schedule = await teacherService.getMySchedule();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar horario';
        console.error('Error fetching schedule:', error);
        throw error;
      }
    },

    // ========== UTILIDADES ==========

    /**
     * Limpia el error actual
     */
    clearError(): void {
      this.error = null;
    },

    /**
     * Limpia la asignatura actual
     */
    clearCurrentSubject(): void {
      this.currentSubject = null;
      this.currentSubjectStudents = [];
      this.evaluations = [];
    },

    /**
     * Limpia la evaluación actual
     */
    clearCurrentEvaluation(): void {
      this.currentEvaluation = null;
      this.grades = [];
    },

    /**
     * Resetea todo el estado
     */
    resetState(): void {
      this.$reset();
    }
  }
});
