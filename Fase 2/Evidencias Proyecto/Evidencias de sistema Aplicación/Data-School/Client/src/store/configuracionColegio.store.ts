/**
 * configuracionColegio.store.ts
 * Store Pinia para gestionar el estado de las configuraciones del colegio
 *
 * Estado gestionado:
 * - Lista de configuraciones
 * - Configuraciones agrupadas por tipo
 * - Estados de carga y errores
 *
 * Acciones:
 * - Cargar todas las configuraciones
 * - Cargar configuraciones por tipo
 * - Obtener configuración por clave
 * - Crear/actualizar/eliminar configuraciones
 * - Actualizar solo el valor de una configuración
 */

import { defineStore } from 'pinia';
import configuracionColegioService from '@/services/configuracionColegio.service';
import type {
  ConfiguracionColegio,
  ConfiguracionPorTipo,
  CreateConfiguracionDto,
  UpdateConfiguracionDto
} from '@/services/configuracionColegio.service';

interface ConfiguracionColegioState {
  configuraciones: ConfiguracionColegio[];
  configuracionesPorTipo: ConfiguracionPorTipo;
  loading: boolean;
  error: string | null;
}

export const useConfiguracionColegioStore = defineStore('configuracionColegio', {
  state: (): ConfiguracionColegioState => ({
    configuraciones: [],
    configuracionesPorTipo: {},
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Obtiene todas las configuraciones
     */
    todasLasConfiguraciones: (state): ConfiguracionColegio[] => state.configuraciones,

    /**
     * Obtiene configuraciones por tipo
     */
    configuracionesPorTipoGetter: (state): ConfiguracionPorTipo => state.configuracionesPorTipo,

    /**
     * Obtiene una configuración por clave
     */
    getConfiguracionPorClave: (state) => (clave: string): ConfiguracionColegio | undefined => {
      return state.configuraciones.find(c => c.clave === clave);
    },

    /**
     * Obtiene el valor de una configuración por clave
     */
    getValorPorClave: (state) => (clave: string): string | undefined => {
      return state.configuraciones.find(c => c.clave === clave)?.valor;
    },

    /**
     * Obtiene configuraciones de un tipo específico
     */
    getConfiguracionesPorTipo: (state) => (tipo: string): ConfiguracionColegio[] => {
      return state.configuraciones.filter(c => c.tipo === tipo);
    },

    /**
     * Verifica si hay configuraciones cargadas
     */
    tieneConfiguraciones: (state): boolean => state.configuraciones.length > 0,

    /**
     * Lista de tipos únicos
     */
    tiposUnicos: (state): string[] => {
      const tipos = new Set(state.configuraciones.map(c => c.tipo).filter(Boolean) as string[]);
      return Array.from(tipos);
    }
  },

  actions: {
    /**
     * Carga todas las configuraciones
     * @param colegioId - ID del colegio (opcional)
     * @param tipo - Tipo de configuración (opcional)
     */
    async fetchConfiguraciones(colegioId?: number, tipo?: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.configuraciones = await configuracionColegioService.getAll(colegioId, tipo);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar configuraciones';
        console.error('Error fetching configuraciones:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Carga configuraciones agrupadas por tipo
     * @param colegioId - ID del colegio (opcional)
     */
    async fetchConfiguracionesPorTipo(colegioId?: number): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.configuracionesPorTipo = await configuracionColegioService.getByTipo(colegioId);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar configuraciones por tipo';
        console.error('Error fetching configuraciones por tipo:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene una configuración por clave
     * @param clave - Clave de la configuración
     * @param colegioId - ID del colegio
     */
    async fetchConfiguracionPorClave(clave: string, colegioId: number): Promise<ConfiguracionColegio> {
      this.loading = true;
      this.error = null;
      try {
        return await configuracionColegioService.getByClave(clave, colegioId);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar configuración';
        console.error('Error fetching configuracion por clave:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una nueva configuración
     * @param data - Datos de la configuración
     */
    async createConfiguracion(data: CreateConfiguracionDto): Promise<ConfiguracionColegio> {
      this.loading = true;
      this.error = null;
      try {
        const nuevaConfiguracion = await configuracionColegioService.create(data);
        this.configuraciones.push(nuevaConfiguracion);
        return nuevaConfiguracion;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear configuración';
        console.error('Error creating configuracion:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza una configuración
     * @param id - ID de la configuración
     * @param data - Datos a actualizar
     */
    async updateConfiguracion(id: number, data: UpdateConfiguracionDto): Promise<ConfiguracionColegio> {
      this.loading = true;
      this.error = null;
      try {
        const configuracionActualizada = await configuracionColegioService.update(id, data);

        // Actualizar en el estado local
        const index = this.configuraciones.findIndex(c => c.configuracion_id === id);
        if (index !== -1) {
          this.configuraciones[index] = configuracionActualizada;
        }

        return configuracionActualizada;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar configuración';
        console.error('Error updating configuracion:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza solo el valor de una configuración por clave
     * @param clave - Clave de la configuración
     * @param colegioId - ID del colegio
     * @param valor - Nuevo valor
     */
    async updateValor(clave: string, colegioId: number, valor: string): Promise<ConfiguracionColegio> {
      this.loading = true;
      this.error = null;
      try {
        const configuracionActualizada = await configuracionColegioService.updateValor(clave, colegioId, valor);

        // Actualizar en el estado local
        const index = this.configuraciones.findIndex(
          c => c.clave === clave && c.colegio_id === colegioId
        );
        if (index !== -1) {
          this.configuraciones[index] = configuracionActualizada;
        }

        return configuracionActualizada;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar valor';
        console.error('Error updating valor:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina una configuración
     * @param id - ID de la configuración
     */
    async deleteConfiguracion(id: number): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await configuracionColegioService.delete(id);

        // Eliminar del estado local
        this.configuraciones = this.configuraciones.filter(
          c => c.configuracion_id !== id
        );
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar configuración';
        console.error('Error deleting configuracion:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Limpia el estado de error
     */
    clearError(): void {
      this.error = null;
    },

    /**
     * Limpia todas las configuraciones del estado
     */
    clearConfiguraciones(): void {
      this.configuraciones = [];
      this.configuracionesPorTipo = {};
      this.error = null;
    }
  }
});
