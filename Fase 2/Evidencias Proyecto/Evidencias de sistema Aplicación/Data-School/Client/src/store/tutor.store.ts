import { defineStore } from 'pinia';
import tutorService from '@/services/tutor.service';
import type {
  Tutor,
  CreateTutorDTO,
  UpdateTutorDTO,
  UserQueryParams,
  LinkUserDTO
} from '@/types/users.types';

interface TutorState {
  tutores: Tutor[];
  currentTutor: Tutor | null;
  loading: boolean;
  error: string | null;
}

export const useTutorStore = defineStore('tutor', {
  state: (): TutorState => ({
    tutores: [],
    currentTutor: null,
    loading: false,
    error: null
  }),

  getters: {
    // Tutores activos
    tutoresActivos: (state) => state.tutores.filter(t => t.estado_activo),

    // Tutores inactivos
    tutoresInactivos: (state) => state.tutores.filter(t => !t.estado_activo),

    // Contar tutores activos
    totalActivos: (state) => state.tutores.filter(t => t.estado_activo).length,

    // Tutores con cuenta de usuario
    tutoresConCuenta: (state) => state.tutores.filter(t => t.user_id),

    // Tutores sin cuenta de usuario
    tutoresSinCuenta: (state) => state.tutores.filter(t => !t.user_id),

    // Obtener tutor por ID
    getTutorById: (state) => (id: string) => {
      return state.tutores.find(t => t.tutor_id === id);
    }
  },

  actions: {
    /**
     * Obtener todos los tutores
     */
    async fetchTutores(params?: UserQueryParams) {
      this.loading = true;
      this.error = null;
      try {
        this.tutores = await tutorService.getAll(params);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar tutores';
        console.error('Error fetching tutores:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener tutor por ID
     */
    async fetchTutorById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentTutor = await tutorService.getById(id);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar tutor';
        console.error('Error fetching tutor:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nuevo tutor
     */
    async createTutor(data: CreateTutorDTO) {
      this.loading = true;
      this.error = null;
      try {
        const newTutor = await tutorService.create(data);
        this.tutores.push(newTutor);
        return newTutor;
      } catch (error: any) {
        this.error = error.message || 'Error al crear tutor';
        console.error('Error creating tutor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar tutor
     */
    async updateTutor(id: string, data: UpdateTutorDTO) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await tutorService.update(id, data);
        const index = this.tutores.findIndex(t => t.tutor_id === id);
        if (index !== -1) {
          this.tutores[index] = updated;
        }
        if (this.currentTutor?.tutor_id === id) {
          this.currentTutor = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar tutor';
        console.error('Error updating tutor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deshabilitar tutor
     */
    async disableTutor(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await tutorService.disable(id);
        const tutor = this.tutores.find(t => t.tutor_id === id);
        if (tutor) {
          tutor.estado_activo = false;
          if (tutor.User) {
            tutor.User.is_active = false;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al deshabilitar tutor';
        console.error('Error disabling tutor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Habilitar tutor
     */
    async enableTutor(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await tutorService.enable(id);
        const tutor = this.tutores.find(t => t.tutor_id === id);
        if (tutor) {
          tutor.estado_activo = true;
          if (tutor.User) {
            tutor.User.is_active = true;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al habilitar tutor';
        console.error('Error enabling tutor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Vincular cuenta de usuario a tutor
     */
    async linkUserToTutor(id: string, data: LinkUserDTO) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await tutorService.linkUser(id, data);
        const index = this.tutores.findIndex(t => t.tutor_id === id);
        if (index !== -1) {
          this.tutores[index] = updated;
        }
        if (this.currentTutor?.tutor_id === id) {
          this.currentTutor = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al vincular usuario';
        console.error('Error linking user to tutor:', error);
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
      this.tutores = [];
      this.currentTutor = null;
      this.loading = false;
      this.error = null;
    }
  }
});
