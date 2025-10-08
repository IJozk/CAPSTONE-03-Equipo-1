import { defineStore } from 'pinia';
import profesorService from '@/services/profesor.service';
import type {
  Profesor,
  CreateProfesorDTO,
  UpdateProfesorDTO,
  UserQueryParams
} from '@/types/users.types';

interface TeacherState {
  profesores: Profesor[];
  currentProfesor: Profesor | null;
  loading: boolean;
  error: string | null;
}

export const useTeacherStore = defineStore('teacher', {
  state: (): TeacherState => ({
    profesores: [],
    currentProfesor: null,
    loading: false,
    error: null
  }),

  getters: {
    // Profesores activos
    profesoresActivos: (state) => state.profesores.filter(p => p.estado_activo),

    // Profesores inactivos
    profesoresInactivos: (state) => state.profesores.filter(p => !p.estado_activo),

    // Contar profesores activos
    totalActivos: (state) => state.profesores.filter(p => p.estado_activo).length,

    // Obtener profesor por ID
    getProfesorById: (state) => (id: string) => {
      return state.profesores.find(p => p.profesor_id === id);
    }
  },

  actions: {
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
    }
  }
});
