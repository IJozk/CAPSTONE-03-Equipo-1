import { defineStore } from 'pinia'
import encuestaEstudianteService from '@/services/encuestaEstudiante.service'
import type {
  EncuestaEstudiante,
  EncuestaConDetalles,
  CreateEncuestaEstudianteDto,
  UpdateEncuestaEstudianteDto
} from '@/services/encuestaEstudiante.service'

interface EncuestaEstudianteState {
  encuestasPendientes: EncuestaConDetalles[]
  encuestasRespondidas: EncuestaEstudiante[]
  encuestaActual: EncuestaConDetalles | null
  loading: boolean
  error: string | null
}

export const useEncuestaEstudianteStore = defineStore('encuestaEstudiante', {
  state: (): EncuestaEstudianteState => ({
    encuestasPendientes: [],
    encuestasRespondidas: [],
    encuestaActual: null,
    loading: false,
    error: null
  }),

  getters: {
    tieneEncuestasPendientes: (state) => state.encuestasPendientes.length > 0,
    primeraEncuestaPendiente: (state) => state.encuestasPendientes[0] || null,
    totalPendientes: (state) => state.encuestasPendientes.length,
    totalRespondidas: (state) => state.encuestasRespondidas.length
  },

  actions: {
    /**
     * Cargar encuestas pendientes de un estudiante
     */
    async fetchEncuestasPendientes(estudianteId: string) {
      this.loading = true
      this.error = null
      try {
        this.encuestasPendientes = await encuestaEstudianteService.getPendientes(estudianteId)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar encuestas pendientes'
        console.error('Error al cargar encuestas pendientes:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Cargar encuestas respondidas de un estudiante
     */
    async fetchEncuestasRespondidas(estudianteId: string) {
      this.loading = true
      this.error = null
      try {
        this.encuestasRespondidas = await encuestaEstudianteService.getByEstudiante(estudianteId)
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar respuestas'
        console.error('Error al cargar respuestas:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener una encuesta específica para responder
     */
    async getEncuestaParaResponder(encuestaId: string) {
      this.loading = true
      this.error = null
      try {
        const encuesta = this.encuestasPendientes.find(e => e.encuesta_id === encuestaId)
        if (encuesta) {
          this.encuestaActual = encuesta
        }
        return encuesta
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al cargar encuesta'
        console.error('Error al cargar encuesta:', error)
      } finally {
        this.loading = false
      }
    },

    /**
     * Guardar respuesta de encuesta
     */
    async guardarRespuesta(data: CreateEncuestaEstudianteDto) {
      this.loading = true
      this.error = null
      try {
        const respuesta = await encuestaEstudianteService.create(data)

        // Actualizar listas
        this.encuestasPendientes = this.encuestasPendientes.filter(
          e => e.encuesta_id !== data.id_encuesta
        )
        this.encuestasRespondidas.push(respuesta)
        this.encuestaActual = null

        return respuesta
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al guardar respuesta'
        console.error('Error al guardar respuesta:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar respuesta de encuesta
     */
    async actualizarRespuesta(
      encuestaId: string,
      estudianteId: string,
      data: UpdateEncuestaEstudianteDto
    ) {
      this.loading = true
      this.error = null
      try {
        const respuesta = await encuestaEstudianteService.update(encuestaId, estudianteId, data)

        // Actualizar en la lista de respondidas
        const index = this.encuestasRespondidas.findIndex(
          r => r.id_encuesta === encuestaId && r.estudiante_id === estudianteId
        )
        if (index !== -1) {
          this.encuestasRespondidas[index] = respuesta
        }

        return respuesta
      } catch (error: any) {
        this.error = error.response?.data?.message || 'Error al actualizar respuesta'
        console.error('Error al actualizar respuesta:', error)
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Verificar si hay encuestas pendientes
     */
    async verificarEncuestasPendientes(estudianteId: string): Promise<boolean> {
      await this.fetchEncuestasPendientes(estudianteId)
      return this.tieneEncuestasPendientes
    },

    /**
     * Marcar encuesta actual como completada (sin respuesta)
     */
    marcarEncuestaComoVista(encuestaId: string) {
      this.encuestasPendientes = this.encuestasPendientes.filter(
        e => e.encuesta_id !== encuestaId
      )
      this.encuestaActual = null
    },

    /**
     * Limpiar estado
     */
    limpiarEstado() {
      this.encuestasPendientes = []
      this.encuestasRespondidas = []
      this.encuestaActual = null
      this.error = null
    }
  }
})
