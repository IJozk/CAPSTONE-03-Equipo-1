import { defineStore } from 'pinia';
import estudianteService from '@/services/estudiante.service';
import type {
  Estudiante,
  CreateEstudianteDTO,
  UpdateEstudianteDTO,
  UserQueryParams
} from '@/types/users.types';
import { StudentProfile } from '@/types/student.types';

interface StudentState {
  estudiantes: Estudiante[];
  currentEstudiante: Estudiante | null;
  studentInfo: StudentProfile | null;
  loading: boolean;
  error: string | null;
}

export const useStudentStore = defineStore('student', {
  state: (): StudentState => ({
    estudiantes: [],
    currentEstudiante: null,
    studentInfo: null,
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
        this.estudiantes = await estudianteService.getAll(params);
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
      this.studentInfo = null;
      this.loading = false;
      this.error = null;
    }
  }
});