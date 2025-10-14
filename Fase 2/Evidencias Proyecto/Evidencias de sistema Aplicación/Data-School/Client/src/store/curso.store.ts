import { defineStore } from 'pinia'
import cursoService from '@/services/curso.service'
import type {
  Curso,
  CreateCursoDTO,
  UpdateCursoDTO,
  FilterCursoDTO,
  CursoState,
  CursoStats
} from '@/types/curso.types'

export const useCursoStore = defineStore('curso', {
  state: (): CursoState => ({
    cursos: [],
    currentCurso: null,
    loading: false,
    error: null,
    filters: {}
  }),

  getters: {
    /**
     * Obtener cursos por nivel
     */
    cursosByNivel: (state) => (nivel: string): Curso[] => {
      return state.cursos.filter(c => c.nivel === nivel)
    },

    /**
     * Obtener cursos por año académico
     */
    cursosByAnio: (state) => (anio: number): Curso[] => {
      return state.cursos.filter(c => c.anio_academico === anio)
    },

    /**
     * Obtener años académicos únicos
     */
    aniosAcademicos: (state): number[] => {
      const anios = state.cursos.map(c => c.anio_academico)
      return [...new Set(anios)].sort((a, b) => b - a)
    },

    /**
     * Obtener niveles únicos
     */
    niveles: (state): string[] => {
      const niveles = state.cursos.map(c => c.nivel)
      return [...new Set(niveles)].sort()
    }
  },

  actions: {
    /**
     * Obtener todos los cursos
     */
    async fetchAll(filters?: FilterCursoDTO) {
      this.loading = true
      this.error = null

      try {
        if (filters) {
          this.filters = filters
        }

        this.cursos = await cursoService.getAll(this.filters)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener un curso por ID
     */
    async fetchById(id: string) {
      this.loading = true
      this.error = null

      try {
        this.currentCurso = await cursoService.getById(id)
        return this.currentCurso
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener cursos por año académico
     */
    async fetchByAnio(anio: number) {
      this.loading = true
      this.error = null

      try {
        const cursos = await cursoService.getByAnio(anio)
        this.cursos = cursos
        return cursos
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Obtener estadísticas de un curso
     */
    async fetchStats(id: string): Promise<CursoStats> {
      this.loading = true
      this.error = null

      try {
        return await cursoService.getStats(id)
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Crear un nuevo curso
     */
    async create(data: CreateCursoDTO) {
      this.loading = true
      this.error = null

      try {
        const newCurso = await cursoService.create(data)
        this.cursos.push(newCurso)
        return newCurso
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Actualizar un curso
     */
    async update(id: string, data: UpdateCursoDTO) {
      this.loading = true
      this.error = null

      try {
        const updatedCurso = await cursoService.update(id, data)

        // Actualizar en el estado
        const index = this.cursos.findIndex(c => c.curso_id === id)
        if (index !== -1) {
          this.cursos[index] = updatedCurso
        }

        if (this.currentCurso?.curso_id === id) {
          this.currentCurso = updatedCurso
        }

        return updatedCurso
      } catch (error: any) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    /**
     * Eliminar un curso
     */
    async delete(id: string) {
      this.loading = true
      this.error = null

      try {
        await cursoService.delete(id)

        // Remover del estado
        const index = this.cursos.findIndex(c => c.curso_id === id)
        if (index !== -1) {
          this.cursos.splice(index, 1)
        }

        if (this.currentCurso?.curso_id === id) {
          this.currentCurso = null
        }
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
     * Limpiar curso actual
     */
    clearCurrent() {
      this.currentCurso = null
    }
  }
})
