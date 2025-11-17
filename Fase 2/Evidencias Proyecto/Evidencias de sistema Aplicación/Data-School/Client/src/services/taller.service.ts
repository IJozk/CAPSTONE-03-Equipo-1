// src/services/taller.service.ts
import apiClient from './api.config'
import type { Taller } from '@/types/taller.types'

export interface TallerQueryParams {
  estado_activo?: boolean
  profesor_encargado_id?: string
}

export interface TallerEstadisticas {
  taller_id: string
  nombre: string
  capacidad_maxima: number | null
  estadisticas: {
    total_inscritos: number
    activos: number
    retirados: number
    suspendidos: number
    cupos_disponibles: number | null
    porcentaje_ocupacion: number | null
  }
}

export interface TallerGrupoEstudiante {
  grupo_id: string
  taller_id: string
  estudiante_id: string
  estado: string
  fecha_inscripcion: string
  Estudiante: {
    estudiante_id: string
    nombre_completo: string
    rut: string
    email: string
    telefono: string | null
  }
}

export interface CreateTallerDTO {
  taller_id: string
  nombre: string
  descripcion?: string | null
  profesor_encargado_id?: string | null
  sala_id?: string | null
  horario?: string | null
  capacidad_maxima?: number | null
  costo_adicional?: number | null
}

export interface UpdateTallerDTO {
  nombre?: string
  descripcion?: string | null
  profesor_encargado_id?: string | null
  sala_id?: string | null
  horario?: string | null
  capacidad_maxima?: number | null
  costo_adicional?: number | null
  estado_activo?: boolean | null
}

// OJO AQUÍ 👇
const endpoint = '/talleres' // antes estaba '/taller'

const tallerService = {
  async getAll(params?: TallerQueryParams): Promise<Taller[]> {
    const { data } = await apiClient.get<Taller[]>(endpoint, { params })
    return data
  },

  async getActivos(): Promise<Taller[]> {
    const { data } = await apiClient.get<Taller[]>(`${endpoint}/activos`)
    return data
  },

  async getById(id: string): Promise<Taller> {
    const { data } = await apiClient.get<Taller>(`${endpoint}/${id}`)
    return data
  },

  async getEstadisticas(id: string): Promise<TallerEstadisticas> {
    const { data } = await apiClient.get<TallerEstadisticas>(
      `${endpoint}/${id}/estadisticas`
    )
    return data
  },

  async getEstudiantes(
    id: string,
    estado?: string
  ): Promise<TallerGrupoEstudiante[]> {
    const { data } = await apiClient.get<TallerGrupoEstudiante[]>(
      `${endpoint}/${id}/estudiantes`,
      {
        params: estado ? { estado } : undefined
      }
    )
    return data
  },

  async create(payload: CreateTallerDTO): Promise<Taller> {
    const { data } = await apiClient.post<Taller>(endpoint, payload)
    return data
  },

  async update(id: string, payload: UpdateTallerDTO): Promise<Taller> {
    const { data } = await apiClient.put<Taller>(`${endpoint}/${id}`, payload)
    return data
  },

  async disable(id: string): Promise<void> {
    await apiClient.patch(`${endpoint}/${id}/disable`)
  },

  async enable(id: string): Promise<void> {
    await apiClient.patch(`${endpoint}/${id}/enable`)
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`${endpoint}/${id}`)
  }
}

export default tallerService
