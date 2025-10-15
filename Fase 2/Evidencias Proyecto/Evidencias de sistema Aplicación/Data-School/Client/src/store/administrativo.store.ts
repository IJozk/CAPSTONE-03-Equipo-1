import { defineStore } from 'pinia';
import administrativoService from '@/services/administrativo.service';
import type {
  Administrativo,
  CreateAdministrativoDTO,
  UpdateAdministrativoDTO,
  UserQueryParams
} from '@/types/users.types';

interface AdministrativoState {
  administrativos: Administrativo[];
  currentAdministrativo: Administrativo | null;
  loading: boolean;
  error: string | null;
}

export const useAdministrativoStore = defineStore('administrativo', {
  state: (): AdministrativoState => ({
    administrativos: [],
    currentAdministrativo: null,
    loading: false,
    error: null
  }),

  getters: {
    // Administrativos activos
    administrativosActivos: (state) => state.administrativos.filter(a => a.estado_activo),

    // Administrativos inactivos
    administrativosInactivos: (state) => state.administrativos.filter(a => !a.estado_activo),

    // Contar administrativos activos
    totalActivos: (state) => state.administrativos.filter(a => a.estado_activo).length,

    // Administrativos por área
    administrativosPorArea: (state) => (areaId: number) => {
      return state.administrativos.filter(a => a.area_id === areaId && a.estado_activo);
    },

    // Obtener administrativo por ID
    getAdministrativoById: (state) => (id: string) => {
      return state.administrativos.find(a => a.administrativo_id === id);
    }
  },

  actions: {
    /**
     * Obtener todos los administrativos
     */
    async fetchAdministrativos(params?: UserQueryParams) {
      this.loading = true;
      this.error = null;
      try {
        this.administrativos = await administrativoService.getAll(params);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar administrativos';
        console.error('Error fetching administrativos:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtener administrativo por ID
     */
    async fetchAdministrativoById(id: string) {
      this.loading = true;
      this.error = null;
      try {
        this.currentAdministrativo = await administrativoService.getById(id);
      } catch (error: any) {
        this.error = error.message || 'Error al cargar administrativo';
        console.error('Error fetching administrativo:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crear nuevo administrativo
     */
    async createAdministrativo(data: CreateAdministrativoDTO) {
      this.loading = true;
      this.error = null;
      try {
        const newAdministrativo = await administrativoService.create(data);
        this.administrativos.push(newAdministrativo);
        return newAdministrativo;
      } catch (error: any) {
        this.error = error.message || 'Error al crear administrativo';
        console.error('Error creating administrativo:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualizar administrativo
     */
    async updateAdministrativo(id: string, data: UpdateAdministrativoDTO) {
      this.loading = true;
      this.error = null;
      try {
        const updated = await administrativoService.update(id, data);
        const index = this.administrativos.findIndex(a => a.administrativo_id === id);
        if (index !== -1) {
          this.administrativos[index] = updated;
        }
        if (this.currentAdministrativo?.administrativo_id === id) {
          this.currentAdministrativo = updated;
        }
        return updated;
      } catch (error: any) {
        this.error = error.message || 'Error al actualizar administrativo';
        console.error('Error updating administrativo:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Deshabilitar administrativo
     */
    async disableAdministrativo(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await administrativoService.disable(id);
        const administrativo = this.administrativos.find(a => a.administrativo_id === id);
        if (administrativo) {
          administrativo.estado_activo = false;
          if (administrativo.User) {
            administrativo.User.is_active = false;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al deshabilitar administrativo';
        console.error('Error disabling administrativo:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Habilitar administrativo
     */
    async enableAdministrativo(id: string) {
      this.loading = true;
      this.error = null;
      try {
        await administrativoService.enable(id);
        const administrativo = this.administrativos.find(a => a.administrativo_id === id);
        if (administrativo) {
          administrativo.estado_activo = true;
          if (administrativo.User) {
            administrativo.User.is_active = true;
          }
        }
      } catch (error: any) {
        this.error = error.message || 'Error al habilitar administrativo';
        console.error('Error enabling administrativo:', error);
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
      this.administrativos = [];
      this.currentAdministrativo = null;
      this.loading = false;
      this.error = null;
    }
  }
});
