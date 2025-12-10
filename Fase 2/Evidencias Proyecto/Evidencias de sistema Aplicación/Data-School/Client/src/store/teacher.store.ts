import { defineStore } from 'pinia';
import profesorService from '@/services/profesor.service';
import teacherToolsService from '@/services/teachertools.service';
import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
  UserQueryParams
} from '@/types/users.types';
import type {
  TeacherDashboard,
  Subject,
  Student,
  Evaluation,
  Grade,
  Observation,
  Schedule,
  Upcoming,
  Profesion
} from '@/types/teacher.types';

interface TeacherState {
  // Admin: gestión de profesores
  profesores: Profesor[];
  profesiones: Profesion[];
  currentProfesor: Profesor | null;

  // Teacher: datos del dashboard y herramientas
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

export const useTeacherStore = defineStore('teacher', {
  state: (): TeacherState => ({
    // Admin
    profesores: [],
    profesiones: [],
    currentProfesor: null,
    // Teacher
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
    // ========== ADMIN GETTERS ==========
    // Profesores activos
    profesoresActivos: (state) => state.profesores.filter(p => p.estado_activo),

    // Profesores inactivos
    profesoresInactivos: (state) => state.profesores.filter(p => !p.estado_activo),

    // Contar profesores activos
    totalActivos: (state) => state.profesores.filter(p => p.estado_activo).length,

    // Obtener profesor por ID
    getProfesorById: (state) => (id: string) => {
      return state.profesores.find(p => p.profesor_id === id);
    },

    // ========== TEACHER DASHBOARD GETTERS ==========
    teacherName: (state) => state.dashboard?.profesor?.nombre_completo || '',
    teacherSpecialty: (state) => state.dashboard?.profesor?.especialidad || '',
    totalSubjects: (state) => state.dashboard?.stats?.total_asignaturas || 0,
    totalStudents: (state) => state.dashboard?.stats?.total_estudiantes || 0,
    totalCourses: (state) => state.dashboard?.stats?.total_cursos || 0,
    pendingEvaluations: (state) => state.dashboard?.stats?.evaluaciones_pendientes_revision || 0,
    pendingAttendance: (state) => state.dashboard?.stats?.asistencias_por_registrar_hoy || 0,
    generalAverage: (state) => state.dashboard?.stats?.promedio_general_asignaturas || 0,

    // Upcoming classes and evaluations
    todayClasses: (state) => state.upcoming?.clases_hoy || [],
    upcomingEvaluations: (state) => state.upcoming?.evaluaciones_proximas || []
  },

  actions: {
    // ========== ADMIN ACTIONS ==========
    /**
     * Obtener todos los profesores
     */
    async fetchProfesores(params?: UserQueryParams) {
      this.loading = true;
      this.error = null;
      try {
        this.profesores = await profesorService.getAll(params);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar profesores';
        console.error('Error fetching profesores:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener profesor por ID
     */
    async fetchProfesorById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentProfesor = await profesorService.getById(id);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar profesor';
        console.error('Error fetching profesor:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nuevo profesor
     */
    async createProfesor(data: CreateProfesorDTO) {
      this.loading = true;
      this.error = null;
      try {
        const newProfesor = await profesorService.create(data);
        this.profesores.push(newProfesor);
        return newProfesor;
      } catch (error: any) {
        this.error = error.message || 'Error al crear profesor';
        console.error('Error creating profesor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar profesor
     */
    async updateProfesor(id: string, data: UpdateProfesorDTO) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await profesorService.update(id, data);
        const index = this.profesores.findIndex(p => p.profesor_id === id);
        if (index !== -1) {
          this.profesores[index] = updated;
        }
        if (this.currentProfesor?.profesor_id === id) {
          this.currentProfesor = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar profesor';
        console.error('Error updating profesor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deshabilitar profesor
     */
    async disableProfesor(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await profesorService.disable(id);
        const profesor = this.profesores.find(p => p.profesor_id === id);
        if (profesor) {
          profesor.estado_activo = false;
          if (profesor.User) {
            profesor.User.is_active = false;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al deshabilitar profesor';
        console.error('Error disabling profesor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Habilitar profesor
     */
    async enableProfesor(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await profesorService.enable(id);
        const profesor = this.profesores.find(p => p.profesor_id === id);
        if (profesor) {
          profesor.estado_activo = true;
          if (profesor.User) {
            profesor.User.is_active = true;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al habilitar profesor';
        console.error('Error enabling profesor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpiar error
     */
    clearError() {
      this.error = null;
    },

    /**
     * Reiniciar estado
     */
    resetState() {
      this.profesores = [];
      this.currentProfesor = null;
      this.loading = false;
      this.error = null;
    },

    // ========== TEACHER DASHBOARD ACTIONS ==========
    /**
     * Cargar datos del dashboard del profesor
     */
    async fetchDashboard() {
      this.loading = true;
      this.error = null;
      try {
        this.dashboard = await teacherToolsService.getDashboard();
      } catch (error: any) {
        this.error = error.message || 'Error al cargar dashboard';
        console.error('Error fetching dashboard:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar próximas clases y evaluaciones
     */
    async fetchUpcoming() {
      try {
        this.upcoming = await teacherToolsService.getUpcoming();
      } catch (error: any) {
        console.error('Error fetching upcoming:', error);
      }
    },

    /**
     * Cargar todos los datos necesarios para el dashboard
     */
    async loadDashboardData() {
      this.loading = true;
      this.error = null;
      try {
        await Promise.all([
          this.fetchDashboard(),
          this.fetchUpcoming()
        ]);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar datos del dashboard';
        console.error('Error loading dashboard data:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar asignaturas del profesor
     * @param forceRefresh - Si es true, siempre recarga los datos del servidor
     */
    async fetchMySubjects(forceRefresh = false) {
      this.loading = true;
      this.error = null;
      try {
        console.log('🔄 fetchMySubjects - forceRefresh:', forceRefresh);
        // Siempre recargar para asegurar datos actualizados
        this.subjects = await teacherToolsService.getMySubjects();
        console.log('✅ fetchMySubjects - Asignaturas cargadas:', this.subjects.length);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar asignaturas';
        console.error('❌ Error fetching subjects:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar estudiantes de una asignatura
     * @param subjectId - ID de la asignatura
     * @param forceRefresh - Si es true, siempre recarga los datos del servidor
     */
    async fetchSubjectStudents(subjectId: string, forceRefresh = false) {
      this.loading = true;
      this.error = null;
      try {
        console.log('🔄 fetchSubjectStudents - subjectId:', subjectId, 'forceRefresh:', forceRefresh);
        // Siempre recargar para asegurar datos actualizados
        this.currentSubjectStudents = await teacherToolsService.getSubjectStudents(subjectId);
        console.log('✅ fetchSubjectStudents - Estudiantes cargados:', this.currentSubjectStudents.length);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar estudiantes';
        console.error('❌ Error fetching students:', error);
      } finally {
        this.loading = false;
      }
    },

    // ========== EVALUACIONES ACTIONS ==========
    /**
     * Cargar evaluaciones de una asignatura
     */
    async fetchEvaluations(subjectId: string) {
      this.loading = true;
      this.error = null;
      try {
        this.evaluations = await teacherToolsService.getSubjectEvaluations(subjectId);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar evaluaciones';
        console.error('Error fetching evaluations:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cargar todas las evaluaciones del profesor (de todas sus asignaturas)
     */
    async fetchAllMyEvaluations() {
      this.loading = true;
      this.error = null;
      try {
        this.evaluations = await teacherToolsService.getAllMyEvaluations();
      } catch (error: any) {
        this.error = error.message || 'Error al cargar evaluaciones';
        console.error('Error fetching all evaluations:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nueva evaluación
     */
    async createEvaluation(data: any) {
      this.loading = true;
      this.error = null;
      try {
        const newEvaluation = await teacherToolsService.createEvaluation(data);
        this.evaluations.push(newEvaluation);
        return newEvaluation;
      } catch (error: any) {
        this.error = error.message || 'Error al crear evaluación';
        console.error('Error creating evaluation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar evaluación
     */
    async updateEvaluation(evaluationId: number, data: any) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await teacherToolsService.updateEvaluation(evaluationId, data);
        const index = this.evaluations.findIndex(e => e.evaluacion_id === evaluationId);
        if (index !== -1) {
          this.evaluations[index] = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar evaluación';
        console.error('Error updating evaluation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar evaluación
     */
    async deleteEvaluation(evaluationId: number) {
      this.loading = true;
      this.error = null;
      try {
        await teacherToolsService.deleteEvaluation(evaluationId);
        this.evaluations = this.evaluations.filter(e => e.evaluacion_id !== evaluationId);
      } catch (error: any) {
        this.error = error.message || 'Error al eliminar evaluación';
        console.error('Error deleting evaluation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // ========== NOTAS ACTIONS ==========
    /**
     * Cargar notas de una evaluación
     */
    async fetchGrades(evaluationId: number) {
      this.loading = true;
      this.error = null;
      try {
        this.grades = await teacherToolsService.getEvaluationGrades(evaluationId);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar notas';
        console.error('Error fetching grades:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Guardar nota
     */
    async saveGrade(data: any) {
      try {
        const savedGrade = await teacherToolsService.saveGrade(data);
        const index = this.grades.findIndex(g => g.estudiante.estudiante_id === data.estudiante_id);
        if (index !== -1) {
          this.grades[index] = savedGrade;
        } else {
          this.grades.push(savedGrade);
        }
        return savedGrade;
      } catch (error: any) {
        this.error = error.message || 'Error al guardar nota';
        console.error('Error saving grade:', error);
        throw error;
      }
    },

    // ========== OBSERVACIONES ACTIONS ==========
    /**
     * Cargar observaciones con filtros
     */
    async fetchObservations(filters?: any) {
      this.loading = true;
      this.error = null;
      try {
        this.observations = await teacherToolsService.getAllObservations(filters);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar observaciones';
        console.error('Error fetching observations:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear observación
     */
    async createObservation(data: any) {
      this.loading = true;
      this.error = null;
      try {
        const newObservation = await teacherToolsService.createObservation(data);
        this.observations.unshift(newObservation);
        return newObservation;
      } catch (error: any) {
        this.error = error.message || 'Error al crear observación';
        console.error('Error creating observation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar observación
     */
    async updateObservation(observationId: number, data: any) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await teacherToolsService.updateObservation(observationId, data);
        const index = this.observations.findIndex(o => o.id === observationId);
        if (index !== -1) {
          this.observations[index] = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar observación';
        console.error('Error updating observation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Eliminar observación
     */
    async deleteObservation(observationId: number) {
      this.loading = true;
      this.error = null;
      try {
        await teacherToolsService.deleteObservation(observationId);
        this.observations = this.observations.filter(o => o.id !== observationId);
      } catch (error: any) {
        this.error = error.message || 'Error al eliminar observación';
        console.error('Error deleting observation:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});