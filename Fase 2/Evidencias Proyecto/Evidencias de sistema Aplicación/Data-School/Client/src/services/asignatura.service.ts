import apiClient from './api.config'
import type {
  Asignatura,
  CreateAsignaturaDTO,
  UpdateAsignaturaDTO,
  FilterAsignaturaDTO,
  AsignaturaResponse
} from '@/types/asignatura.types'

class AsignaturaService {
  /**
   * Obtener todas las asignaturas con filtros opcionales
   */
  async getAll(filters?: FilterAsignaturaDTO): Promise<Asignatura[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.curso_id) params.append('curso_id', filters.curso_id)
      if (filters?.profesor_id) params.append('profesor_id', filters.profesor_id)
      if (filters?.periodo) params.append('periodo', filters.periodo)
      if (filters?.estado_activo !== undefined) params.append('estado_activo', String(filters.estado_activo))
      if (filters?.tipo_asignatura_id) params.append('tipo_asignatura_id', String(filters.tipo_asignatura_id))

      const queryString = params.toString()
      const url = queryString ? `/asignaturas?${queryString}` : '/asignaturas'

      const response = await apiClient.get<AsignaturaResponse>(url)
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener asignaturas')
    }
  }

  /**
   * Obtener una asignatura por ID
   */
  async getById(id: string): Promise<Asignatura> {
    try {
      const response = await apiClient.get<AsignaturaResponse>(`/asignaturas/${id}`)
      return response.data.data as Asignatura
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener asignatura')
    }
  }

  /**
   * Obtener asignaturas por curso
   */
  async getByCurso(cursoId: string): Promise<Asignatura[]> {
    try {
      const response = await apiClient.get<AsignaturaResponse>(`/asignaturas/curso/${cursoId}`)
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener asignaturas del curso')
    }
  }

  /**
   * Obtener asignaturas por profesor
   */
  async getByProfesor(profesorId: string): Promise<Asignatura[]> {
    try {
      const response = await apiClient.get<AsignaturaResponse>(`/asignaturas/profesor/${profesorId}`)
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener asignaturas del profesor')
    }
  }

  /**
   * Crear una nueva asignatura
   */
  async create(data: CreateAsignaturaDTO): Promise<Asignatura> {
    try {
      const response = await apiClient.post<AsignaturaResponse>('/asignaturas', data)
      return response.data.data as Asignatura
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al crear asignatura')
    }
  }

  /**
   * Actualizar una asignatura
   */
  async update(id: string, data: UpdateAsignaturaDTO): Promise<Asignatura> {
    try {
      const response = await apiClient.put<AsignaturaResponse>(`/asignaturas/${id}`, data)
      return response.data.data as Asignatura
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al actualizar asignatura')
    }
  }

  /**
   * Eliminar (desactivar) una asignatura
   */
  async delete(id: string): Promise<Asignatura> {
    try {
      const response = await apiClient.delete<AsignaturaResponse>(`/asignaturas/${id}`)
      return response.data.data as Asignatura
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al eliminar asignatura')
    }
  }

  /**
   * Activar una asignatura desactivada
   */
  async activate(id: string): Promise<Asignatura> {
    try {
      const response = await apiClient.patch<AsignaturaResponse>(`/asignaturas/${id}/activate`)
      return response.data.data as Asignatura
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al activar asignatura')
    }
  }
}

export default new AsignaturaService()
