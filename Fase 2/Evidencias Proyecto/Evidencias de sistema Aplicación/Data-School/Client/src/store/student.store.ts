import { defineStore } from 'pinia';
import estudianteService from '@/services/estudiante.service';
import studentService from '@/services/student.service';
import gradesService from '@/services/grades.service';
import attendanceService from '@/services/attendance.service';
import notificationsService from '@/services/notifications.service';
import type {
  Estudiante,
  CreateEstudianteDTO,
  UpdateEstudianteDTO,
  UserQueryParams
} from '@/types/users.types';
import type {
  StudentProfile,
  AcademicSummary,
  Subject,
  Attendance,
  Notification,
  UpcomingEvent,
  ScheduleSlot
} from '@/types/student.types';

interface StudentState {
  estudiantes: Estudiante[];
  currentEstudiante: Estudiante | null;
  profile: StudentProfile | null;
  academicSummary: AcademicSummary | null;
  grades: Subject[];
  attendance: Attendance[];
  notifications: Notification[];
  upcomingEvents: UpcomingEvent[];
  schedule: ScheduleSlot[];
  loading: boolean;
  error: string | null;
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    estudiantes: [],
    currentEstudiante: null,
    profile: null,
    academicSummary: null,
    grades: [],
    attendance: [],
    notifications: [],
    upcomingEvents: [],
    schedule: [],
    loading: false,
    error: null
  }),

  getters: {
    // Estudiantes activos
    estudiantesActivos: (state) => state.estudiantes.filter(e => e.estado_activo),

    // Estudiantes inactivos
    estudiantesInactivos: (state) => state.estudiantes.filter(e => !e.estado_activo),

    // Contar estudiantes activos
    totalActivos: (state) => state.estudiantes.filter(e => e.estado_activo).length,

    // Estudiantes con cuenta de usuario
    estudiantesConCuenta: (state) => state.estudiantes.filter(e => e.user_id),

    // Estudiantes sin cuenta de usuario
    estudiantesSinCuenta: (state) => state.estudiantes.filter(e => !e.user_id),

    // Obtener estudiante por ID
    getEstudianteById: (state) => (id: string) => {
      return state.estudiantes.find(e => e.estudiante_id === id);
    },

    // Notificaciones no leídas
    unreadNotifications: (state): number => {
      return state.notifications.filter(n => !n.leida).length;
    },

    // Promedio general
    promedioGeneral: (state): number => {
      return state.academicSummary?.promedio_general || 0;
    },

    // Porcentaje de asistencia
    porcentajeAsistencia: (state): number => {
      return state.academicSummary?.porcentaje_asistencia || 0;
    }
  },

  actions: {
    /**
     * Obtener todos los estudiantes
     */
    async fetchEstudiantes(params?: UserQueryParams) {
      this.loading = true;
      this.error = null;
      try {
        this.estudiantes = await estudianteService.getAll({ incluir_inactivos: true });
      } catch (error: any) {
        this.error = error.message || 'Error al cargar estudiantes';
        console.error('Error fetching estudiantes:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener estudiante por ID
     */
    async fetchEstudianteById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentEstudiante = await estudianteService.getById(id);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar estudiante';
        console.error('Error fetching estudiante:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nuevo estudiante
     */
    async createEstudiante(data: CreateEstudianteDTO) {
      this.loading = true;
      this.error = null;
      try {
        const newEstudiante = await estudianteService.create(data);
        this.estudiantes.push(newEstudiante);
        return newEstudiante;
      } catch (error: any) {
        this.error = error.message || 'Error al crear estudiante';
        console.error('Error creating estudiante:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar estudiante
     */
    async updateEstudiante(id: string, data: UpdateEstudianteDTO) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await estudianteService.update(id, data);
        const index = this.estudiantes.findIndex(e => e.estudiante_id === id);
        if (index !== -1) {
          this.estudiantes[index] = updated;
        }
        if (this.currentEstudiante?.estudiante_id === id) {
          this.currentEstudiante = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar estudiante';
        console.error('Error updating estudiante:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar estudiante usando user_id (para el modal de edición)
     */
    async updateEstudiantes(userId: string, data: Partial<UpdateEstudianteDTO>) {
      this.loading = true;
      this.error = null;
      try {
        console.log('=== STORE DEBUG ===');
        console.log('userId recibido:', userId);
        console.log('data recibida en store:', data);
        console.log('estado_activo en store:', data.estado_activo, 'tipo:', typeof data.estado_activo);
        
        // Encontrar el estudiante por user_id
        const estudiante = this.estudiantes.find(e => e.user_id === userId);
        if (!estudiante) {
          throw new Error('Estudiante no encontrado');
        }

        console.log('Estudiante encontrado, ID:', estudiante.estudiante_id);

        // Actualizar usando el estudiante_id
        console.log('Datos enviados al backend:', data);
        const updated = await estudianteService.update(estudiante.estudiante_id, data as UpdateEstudianteDTO);
        
        console.log('Respuesta del backend:', updated);
        console.log('=== FIN STORE DEBUG ===');
        
        // Actualizar en el array de estudiantes
        const index = this.estudiantes.findIndex(e => e.user_id === userId);
        if (index !== -1) {
          this.estudiantes[index] = updated;
        }
        
        // Actualizar currentEstudiante si es el mismo
        if (this.currentEstudiante?.user_id === userId) {
          this.currentEstudiante = updated;
        }
        
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar estudiante';
        console.error('Error updating estudiante:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deshabilitar estudiante
     */
    async disableEstudiante(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await estudianteService.disable(id);
        const estudiante = this.estudiantes.find(e => e.estudiante_id === id);
        if (estudiante) {
          estudiante.estado_activo = false;
          if (estudiante.User) {
            estudiante.User.is_active = false;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al deshabilitar estudiante';
        console.error('Error disabling estudiante:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Habilitar estudiante
     */
    async enableEstudiante(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await estudianteService.enable(id);
        const estudiante = this.estudiantes.find(e => e.estudiante_id === id);
        if (estudiante) {
          estudiante.estado_activo = true;
          if (estudiante.User) {
            estudiante.User.is_active = true;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al habilitar estudiante';
        console.error('Error enabling estudiante:', error);
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
      this.estudiantes = [];
      this.currentEstudiante = null;
      this.profile = null;
      this.academicSummary = null;
      this.grades = [];
      this.attendance = [];
      this.notifications = [];
      this.upcomingEvents = [];
      this.schedule = [];
      this.loading = false;
      this.error = null;
    },

    /**
     * Obtener perfil del estudiante autenticado
     */
    async fetchProfile() {
      this.loading = true;
      this.error = null;
      try {
        this.profile = await studentService.getProfile();
      } catch (error: any) {
        this.error = error.message;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener resumen académico
     */
    async fetchAcademicSummary() {
      try {
        this.academicSummary = await studentService.getAcademicSummary();
      } catch (error: any) {
        console.error('Error fetching academic summary:', error);
      }
    },

    /**
     * Obtener notas
     */
    async fetchGrades() {
      try {
        this.grades = await gradesService.getGrades();
      } catch (error: any) {
        console.error('Error fetching grades:', error);
      }
    },

    /**
     * Obtener asistencia
     */
    async fetchAttendance(startDate?: string, endDate?: string) {
      try {
        this.attendance = await attendanceService.getAttendance(startDate, endDate);
      } catch (error: any) {
        console.error('Error fetching attendance:', error);
      }
    },

    /**
     * Obtener notificaciones
     */
    async fetchNotifications() {
      try {
        this.notifications = await notificationsService.getNotifications();
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
      }
    },

    /**
     * Marcar notificación como leída
     */
    async markNotificationAsRead(notificationId: string) {
      try {
        await notificationsService.markAsRead(notificationId);
        const notification = this.notifications.find(n => n.id === notificationId);
        if (notification) notification.leida = true;
      } catch (error: any) {
        console.error('Error marking notification as read:', error);
      }
    },

    /**
     * Obtener próximos eventos
     */
    async fetchUpcomingEvents() {
      try {
        const data = await studentService.getUpcomingEvents(5);
        this.upcomingEvents = data.events;
      } catch (error: any) {
        console.error('Error fetching upcoming events:', error);
      }
    },

    /**
     * Obtener horario
     */
    async fetchSchedule() {
      try {
        this.schedule = await studentService.getSchedule();
      } catch (error: any) {
        console.error('Error fetching schedule:', error);
      }
    }
  }
});