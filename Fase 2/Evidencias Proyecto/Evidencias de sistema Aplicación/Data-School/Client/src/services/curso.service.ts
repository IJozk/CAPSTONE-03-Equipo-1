import apiClient from './api.config'
import type {
  Curso,
  CreateCursoDTO,
  UpdateCursoDTO,
  FilterCursoDTO,
  CursoResponse,
  CursoStats,
  AsignarProfesorJefeDTO
} from '@/types/curso.types'

class CursoService {
  /**
   * Obtener todos los cursos con filtros opcionales
   */
  async getAll(filters?: FilterCursoDTO): Promise<Curso[]> {
    try {
      const params = new URLSearchParams()

      if (filters?.nivel_id) params.append('nivel_id', String(filters.nivel_id))
      if (filters?.anio_academico) params.append('anio_academico', String(filters.anio_academico))
      if (filters?.generacion) params.append('generacion', String(filters.generacion))

      const queryString = params.toString()
      const url = queryString ? `/cursos?${queryString}` : '/cursos'

      const response = await apiClient.get<CursoResponse>(url)
      console.log(response)
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener cursos')
    }
  }

  /**
   * Obtener un curso por ID
   */
  async getById(id: string): Promise<Curso> {
    try {
      const response = await apiClient.get<CursoResponse>(`/cursos/${id}`)
      return response.data.data as Curso
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener curso')
    }
  }

  /**
   * Obtener cursos por año académico
   */
  async getByAnio(anio: number): Promise<Curso[]> {
    try {
      const response = await apiClient.get<CursoResponse>(`/cursos/anio/${anio}`)
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener cursos del año')
    }
  }

  /**
   * Obtener estadísticas de un curso
   */
  async getStats(id: string): Promise<CursoStats> {
    try {
      const response = await apiClient.get<{ message: string; data: CursoStats }>(`/cursos/${id}/stats`)
      return response.data.data
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener estadísticas del curso')
    }
  }

  /**
   * Crear un nuevo curso
   */
  async create(data: CreateCursoDTO): Promise<Curso> {
    try {
      const response = await apiClient.post<CursoResponse>('/cursos', data)
      return response.data.data as Curso
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al crear curso')
    }
  }

  /**
   * Actualizar un curso
   */
  async update(id: string, data: UpdateCursoDTO): Promise<Curso> {
    try {
      const response = await apiClient.put<CursoResponse>(`/cursos/${id}`, data)
      return response.data.data as Curso
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al actualizar curso')
    }
  }
  
async getOne(cursoId: string): Promise<Curso> {
  try {
    const response = await apiClient.get<CursoResponse>(`/cursos/${cursoId}`)
    return response.data.data as Curso
  } catch (error: any) {
    throw new Error(error.response?.data?.error || 'Error al obtener curso')
  }
}

  /**
   * Eliminar un curso
   */
  async delete(id: string): Promise<void> {
    try {
      await apiClient.delete(`/cursos/${id}`)
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al eliminar curso')
    }
  }

  /**
   * Asignar o remover profesor jefe a un curso
   */
  async asignarProfesorJefe(id: string, data: AsignarProfesorJefeDTO): Promise<Curso> {
    try {
      const response = await apiClient.put<CursoResponse>(`/cursos/${id}/profesor-jefe`, data)
      return response.data.data as Curso
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al asignar profesor jefe')
    }
  }

  /**
   * Obtener cursos donde el profesor autenticado es profesor jefe
   */
  async getMisCursosComoProfesorJefe(): Promise<Curso[]> {
    try {
      const response = await apiClient.get<CursoResponse>('/cursos/mis-cursos-jefe')
      return Array.isArray(response.data.data) ? response.data.data : [response.data.data]
    } catch (error: any) {
      throw new Error(error.response?.data?.error || 'Error al obtener mis cursos como profesor jefe')
    }
  }
}

export default new CursoService()
