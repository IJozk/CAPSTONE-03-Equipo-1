import { defineStore } from 'pinia'
import asignaturaService from '@/services/asignatura.service'
import type {
  Asignatura,
  CreateAsignaturaDTO,
  UpdateAsignaturaDTO,
  FilterAsignaturaDTO,
  AsignaturaState
} from '@/types/asignatura.types'

export const useAsignaturaStore = defineStore('asignatura', {
  state: (): AsignaturaState => ({
    asignaturas: [],
    currentAsignatura: null,
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * Obtener asignaturas activas
     */
    asignaturasActivas: (state): Asignatura[] => {
      return state.asignaturas.filter(a => a.estado_activo)
    },

    /**
     * Obtener asignaturas inactivas
     */
    asignaturasInactivas: (state): Asignatura[] => {
      return state.asignaturas.filter(a => !a.estado_activo)
    },

    /**
     * Obtener asignaturas por curso
     */
    asignaturasByCurso: (state) => (cursoId: string): Asignatura[] => {
      return state.asignaturas.filter(a => a.curso_id === cursoId && a.estado_activo)
    },

    /**
     * Obtener asignaturas por profesor
     */
    asignaturasByProfesor: (state) => (profesorId: string): Asignatura[] => {
      return state.asignaturas.filter(a => a.profesor_id === profesorId && a.estado_activo)
    }
  },

  actions: {
    /**
     * Obtener todas las asignaturas
     */
    async fetchAll(filters?: FilterAsignaturaDTO) {
      this.loading = true
      this.error = null

      try {
        if (filters) {
          this.filters = filters
        }

        this.asignaturas = await asignaturaService.getAll(this.filters)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener una asignatura por ID
     */
    async fetchById(id: string) {
      this.loading = true
      this.error = null

      try {
        this.currentAsignatura = await asignaturaService.getById(id)
        return this.currentAsignatura
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener asignaturas por curso
     */
    async fetchByCurso(cursoId: string) {
      this.loading = true
      this.error = null

      try {
        const asignaturas = await asignaturaService.getByCurso(cursoId)
        // Actualizar el estado con las asignaturas del curso
        this.asignaturas = asignaturas
        return asignaturas
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener asignaturas por profesor
     */
    async fetchByProfesor(profesorId: string) {
      this.loading = true
      this.error = null

      try {
        const asignaturas = await asignaturaService.getByProfesor(profesorId)
        // Actualizar el estado con las asignaturas del profesor
        this.asignaturas = asignaturas
        return asignaturas
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear una nueva asignatura
     */
    async create(data: CreateAsignaturaDTO) {
      this.loading = true
      this.error = null

      try {
        const newAsignatura = await asignaturaService.create(data)
        this.asignaturas.push(newAsignatura)
        return newAsignatura
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar una asignatura
     */
    async update(id: string, data: UpdateAsignaturaDTO) {
      this.loading = true
      this.error = null

      try {
        const updatedAsignatura = await asignaturaService.update(id, data)

        // Actualizar en el estado
        const index = this.asignaturas.findIndex(a => a.asignatura_id === id)
        if (index !== -1) {
          this.asignaturas[index] = updatedAsignatura
        }

        if (this.currentAsignatura?.asignatura_id === id) {
          this.currentAsignatura = updatedAsignatura
        }

        return updatedAsignatura
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar (desactivar) una asignatura
     */
    async delete(id: string) {
      this.loading = true
      this.error = null

      try {
        const deletedAsignatura = await asignaturaService.delete(id)

        // Actualizar en el estado
        const index = this.asignaturas.findIndex(a => a.asignatura_id === id)
        if (index !== -1) {
          this.asignaturas[index] = deletedAsignatura
        }

        return deletedAsignatura
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Activar una asignatura
     */
    async activate(id: string) {
      this.loading = true
      this.error = null

      try {
        const activatedAsignatura = await asignaturaService.activate(id)

        // Actualizar en el estado
        const index = this.asignaturas.findIndex(a => a.asignatura_id === id)
        if (index !== -1) {
          this.asignaturas[index] = activatedAsignatura
        }

        return activatedAsignatura
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Limpiar error
     */
    clearError() {
      this.error = null
    },

    /**
     * Limpiar filtros
     */
    clearFilters() {
      this.filters = {}
    },

    /**
     * Limpiar asignatura actual
     */
    clearCurrent() {
      this.currentAsignatura = null
    }
  }
})
