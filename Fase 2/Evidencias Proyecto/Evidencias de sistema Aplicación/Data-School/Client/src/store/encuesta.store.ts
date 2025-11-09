/**
 * encuesta.store.ts
 * Store Pinia para gestionar el estado de las encuestas
 *
 * Estado gestionado:
 * - Lista de encuestas
 * - Encuesta seleccionada
 * - Respuestas y estadísticas
 * - Estados de carga y errores
 */

import { defineStore } from 'pinia';
import encuestaService from '@/services/encuesta.service';
import type {
  Encuesta,
  RespuestaEncuesta,
  EstadisticasEncuesta,
  CreateEncuestaDto,
  UpdateEncuestaDto
} from '@/services/encuesta.service';

interface EncuestaState {
  encuestas: Encuesta[];
  encuestaActual: Encuesta | null;
  respuestas: RespuestaEncuesta[];
  estadisticas: EstadisticasEncuesta | null;
  loading: boolean;
  error: string | null;
}

export const useEncuestaStore = defineStore('encuesta', {
  state: (): EncuestaState => ({
    encuestas: [],
    encuestaActual: null,
    respuestas: [],
    estadisticas: null,
    loading: false,
    error: null
  }),

  getters: {
    /**
     * Obtiene todas las encuestas
     */
    todasLasEncuestas: (state): Encuesta[] => state.encuestas,

    /**
     * Obtiene encuestas activas
     */
    encuestasActivas: (state): Encuesta[] => {
      return state.encuestas.filter(e => e.estado_activo);
    },

    /**
     * Obtiene encuestas inactivas
     */
    encuestasInactivas: (state): Encuesta[] => {
      return state.encuestas.filter(e => !e.estado_activo);
    },

    /**
     * Obtiene encuestas por dirigida_a
     */
    encuestasPorTipo: (state) => (dirigidaA: string): Encuesta[] => {
      return state.encuestas.filter(e => e.dirigida_a === dirigidaA);
    },

    /**
     * Obtiene encuestas vigentes (entre fecha_inicio y fecha_fin)
     */
    encuestasVigentes: (state): Encuesta[] => {
      const hoy = new Date();
      return state.encuestas.filter(e => {
        const inicio = new Date(e.fecha_inicio);
        const fin = new Date(e.fecha_fin);
        return hoy >= inicio && hoy <= fin && e.estado_activo;
      });
    },

    /**
     * Obtiene encuestas próximas (no han iniciado)
     */
    encuestasProximas: (state): Encuesta[] => {
      const hoy = new Date();
      return state.encuestas.filter(e => {
        const inicio = new Date(e.fecha_inicio);
        return hoy < inicio && e.estado_activo;
      });
    },

    /**
     * Obtiene encuestas finalizadas
     */
    encuestasFinalizadas: (state): Encuesta[] => {
      const hoy = new Date();
      return state.encuestas.filter(e => {
        const fin = new Date(e.fecha_fin);
        return hoy > fin;
      });
    },

    /**
     * Verifica si hay encuestas cargadas
     */
    tieneEncuestas: (state): boolean => state.encuestas.length > 0,

    /**
     * Total de respuestas
     */
    totalRespuestas: (state): number => state.respuestas.length,

    /**
     * Porcentaje de respuestas correctas
     */
    porcentajeCorrectas: (state): number => {
      if (state.respuestas.length === 0) return 0;
      const correctas = state.respuestas.filter(r => r.contestada_correctemente).length;
      return Math.round((correctas / state.respuestas.length) * 100);
    }
  },

  actions: {
    /**
     * Carga todas las encuestas
     */
    async fetchEncuestas(activo?: boolean, dirigidaA?: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.encuestas = await encuestaService.getAll(activo, dirigidaA);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar encuestas';
        console.error('Error fetching encuestas:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Carga encuestas activas
     */
    async fetchEncuestasActivas(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.encuestas = await encuestaService.getActivas();
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar encuestas activas';
        console.error('Error fetching encuestas activas:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene una encuesta por ID
     */
    async fetchEncuestaById(id: string): Promise<Encuesta> {
      this.loading = true;
      this.error = null;
      try {
        this.encuestaActual = await encuestaService.getById(id);
        return this.encuestaActual;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar encuesta';
        console.error('Error fetching encuesta:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene las respuestas de una encuesta
     */
    async fetchRespuestas(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.respuestas = await encuestaService.getRespuestas(id);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar respuestas';
        console.error('Error fetching respuestas:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Obtiene estadísticas de una encuesta
     */
    async fetchEstadisticas(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        this.estadisticas = await encuestaService.getEstadisticas(id);
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar estadísticas';
        console.error('Error fetching estadisticas:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Crea una nueva encuesta
     */
    async createEncuesta(data: CreateEncuestaDto): Promise<Encuesta> {
      this.loading = true;
      this.error = null;
      try {
        const nuevaEncuesta = await encuestaService.create(data);
        this.encuestas.unshift(nuevaEncuesta);
        return nuevaEncuesta;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al crear encuesta';
        console.error('Error creating encuesta:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Actualiza una encuesta
     */
    async updateEncuesta(id: string, data: UpdateEncuestaDto): Promise<Encuesta> {
      this.loading = true;
      this.error = null;
      try {
        const encuestaActualizada = await encuestaService.update(id, data);

        // Actualizar en el estado local
        const index = this.encuestas.findIndex(e => e.encuesta_id === id);
        if (index !== -1) {
          this.encuestas[index] = encuestaActualizada;
        }

        // Actualizar encuesta actual si es la que se está editando
        if (this.encuestaActual?.encuesta_id === id) {
          this.encuestaActual = encuestaActualizada;
        }

        return encuestaActualizada;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar encuesta';
        console.error('Error updating encuesta:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Cambia el estado activo de una encuesta
     */
    async toggleEstado(id: string, estadoActivo: boolean): Promise<Encuesta> {
      this.loading = true;
      this.error = null;
      try {
        const encuestaActualizada = await encuestaService.cambiarEstado(id, estadoActivo);

        // Actualizar en el estado local
        const index = this.encuestas.findIndex(e => e.encuesta_id === id);
        if (index !== -1) {
          this.encuestas[index] = encuestaActualizada;
        }

        return encuestaActualizada;
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cambiar estado';
        console.error('Error toggling estado:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Elimina una encuesta
     */
    async deleteEncuesta(id: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await encuestaService.delete(id);

        // Eliminar del estado local
        this.encuestas = this.encuestas.filter(e => e.encuesta_id !== id);

        // Limpiar encuesta actual si es la que se eliminó
        if (this.encuestaActual?.encuesta_id === id) {
          this.encuestaActual = null;
        }
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al eliminar encuesta';
        console.error('Error deleting encuesta:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Selecciona una encuesta
     */
    selectEncuesta(encuesta: Encuesta): void {
      this.encuestaActual = encuesta;
    },

    /**
     * Limpia la encuesta seleccionada
     */
    clearEncuestaActual(): void {
      this.encuestaActual = null;
      this.respuestas = [];
      this.estadisticas = null;
    },

    /**
     * Limpia el estado de error
     */
    clearError(): void {
      this.error = null;
    },

    /**
     * Limpia todo el estado
     */
    clearAll(): void {
      this.encuestas = [];
      this.encuestaActual = null;
      this.respuestas = [];
      this.estadisticas = null;
      this.error = null;
    }
  }
});
