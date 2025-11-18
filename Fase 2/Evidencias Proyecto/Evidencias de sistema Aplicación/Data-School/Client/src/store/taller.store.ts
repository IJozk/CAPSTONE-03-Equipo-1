// src/store/taller.store.ts
import { defineStore } from 'pinia'
import tallerService, { type TallerQueryParams } from '@/services/taller.service'
import type { Taller, TallerFormData, TallerHorarioForm } from '@/types/taller.types'

interface TallerState {
  talleres: Taller[]
  loading: boolean
  error: string | null
}

function parseHorarios(horario: string | null): TallerHorarioForm[] {
  if (!horario) return []
  try {
    const parsed = JSON.parse(horario)
    if (Array.isArray(parsed)) {
      return parsed.map((h) => ({
        dia_semana: h.dia_semana ?? '',
        hora_inicio: (h.hora_inicio ?? '').substring(0, 5),
        hora_termino: (h.hora_termino ?? '').substring(0, 5)
      }))
    }
    return []
  } catch {
    return []
  }
}

function generateTallerId() {
  return `TAL-${Date.now()}`
}

export const useTallerStore = defineStore('taller', {
  state: (): TallerState => ({
    talleres: [],
    loading: false,
    error: null
  }),

  actions: {
    mapBackendTaller(raw: Taller): Taller {
      const horarios_parsed = parseHorarios(raw.horario)
      return {
        ...raw,
        horarios_parsed
      }
    },

    async fetchTalleres(params?: TallerQueryParams) {
      this.loading = true
      this.error = null
      try {
        const data = await tallerService.getAll(params)
        const mapped = await Promise.all(
          data.map(async (t) => {
            let base = this.mapBackendTaller(t)
            try {
              const stats = await tallerService.getEstadisticas(t.taller_id)
              base = {
                ...base,
                inscritos: stats.estadisticas.activos
              }
            } catch {
              // si falla estadística, igual devolvemos el taller
            }
            return base
          })
        )
        this.talleres = mapped
      } catch (error: any) {
        this.error =
          error.response?.data?.message ||
          error.message ||
          'Error al cargar talleres'
      } finally {
        this.loading = false
      }
    },

    async createFromForm(form: TallerFormData) {
      this.error = null
      const payload = {
        taller_id: generateTallerId(),
        nombre: form.nombre,
        descripcion: form.descripcion || null,
        sala_id: form.sala_id || null,
        profesor_encargado_id: form.profesor_encargado_id || null,
        capacidad_maxima: form.capacidad_maxima,
        costo_adicional: form.costo_adicional ?? null,
        horario: form.horarios.length ? JSON.stringify(form.horarios) : null,
        fecha_inicio: form.fecha_inicio || null,
        fecha_termino: form.fecha_termino || null
      }

      const created = await tallerService.create(payload)
      let mapped = this.mapBackendTaller(created)

      try {
        const stats = await tallerService.getEstadisticas(created.taller_id)
        mapped = {
          ...mapped,
          inscritos: stats.estadisticas.activos
        }
      } catch {
        // ignoramos si falla
      }

      this.talleres.push(mapped)
    },

async updateFromForm(id: string, form: TallerFormData) {
  this.error = null

  const payload = {
    nombre: form.nombre,
    descripcion: form.descripcion || null,
    sala_id: form.sala_id || null,
    profesor_encargado_id: form.profesor_encargado_id || null,
    capacidad_maxima: form.capacidad_maxima,
    costo_adicional: form.costo_adicional ?? null,
    horario: form.horarios.length ? JSON.stringify(form.horarios) : null,
    fecha_inicio: form.fecha_inicio || null,
    fecha_termino: form.fecha_termino || null
  }

  const updated = await tallerService.update(id, payload)

  let mapped = this.mapBackendTaller(updated)

  try {
    const stats = await tallerService.getEstadisticas(updated.taller_id)
    mapped = {
      ...mapped,
      inscritos: stats.estadisticas.activos
    }
  } catch {}

  const idx = this.talleres.findIndex(t => t.taller_id === id)
  if (idx !== -1) this.talleres.splice(idx, 1, mapped)
},


    async disableTaller(id: string) {
      this.error = null
      await tallerService.disable(id)
      const t = this.talleres.find((x) => x.taller_id === id)
      if (t) t.estado_activo = false
    },

    async enableTaller(id: string) {
      this.error = null
      await tallerService.enable(id)
      const t = this.talleres.find((x) => x.taller_id === id)
      if (t) t.estado_activo = true
    }
  }
})
