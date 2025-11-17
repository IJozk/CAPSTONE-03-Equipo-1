// src/store/sala.store.ts
import { defineStore } from 'pinia'
import salaService, {
  type Sala,
  type EstadoSala
} from '@/services/sala.service'

export interface SalaFilters {
  zona_id?: string
  estado?: EstadoSala
  tiene_proyector?: boolean
  tiene_pizarra_digital?: boolean
}

interface SalaState {
  salas: Sala[]
  loading: boolean
  error: string | null
}

export const useSalaStore = defineStore('sala', {
  state: (): SalaState => ({
    salas: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSalas(filters?: SalaFilters) {
      this.loading = true
      this.error = null
      try {
        const data = await salaService.getAll(filters)
        this.salas = data
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Error al cargar salas'
      } finally {
        this.loading = false
      }
    },

    async fetchSalasDisponibles(zonaId?: string) {
      this.loading = true
      this.error = null
      try {
        const data = await salaService.getDisponibles(zonaId)
        this.salas = data
      } catch (error: any) {
        this.error =
          error?.response?.data?.message ||
          error?.message ||
          'Error al cargar salas disponibles'
      } finally {
        this.loading = false
      }
    }
  }
})
