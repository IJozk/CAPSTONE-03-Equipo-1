import apiClient from './api.config';
import type { SurveyResponse } from '@/types/survey-template.types'

export interface EncuestaEstudiante {
  created_at: string
  estudiante_id: string
  fecha_respuesta: string | null
  id_encuesta: string
  respuesta_encuesta: SurveyResponse
}

export interface EncuestaConDetalles {
  encuesta_id: string
  titulo: string
  descripcion: string | null
  dirigida_a: 'ESTUDIANTES' | 'APODERADOS' | 'PROFESORES' | 'ADMINISTRATIVOS'
  fecha_inicio: string
  fecha_fin: string
  tipo_encuesta_id: number
  template_encuesta: any
  estado_activo: boolean
  ya_respondida: boolean
}

export interface CreateEncuestaEstudianteDto {
  id_encuesta: string
  estudiante_id: string
  respuesta_encuesta: SurveyResponse
  fecha_respuesta?: string
}

export interface UpdateEncuestaEstudianteDto {
  respuesta_encuesta?: SurveyResponse
  fecha_respuesta?: string
}

class EncuestaEstudianteService {
  private baseURL = '/encuesta-estudiante'

  /**
   * Obtener todas las respuestas de encuestas de un estudiante
   */
  async getByEstudiante(estudianteId: string): Promise<EncuestaEstudiante[]> {
    const response = await apiClient.get(`${this.baseURL}/estudiante/${estudianteId}`)
    return response.data
  }

  /**
   * Obtener encuestas pendientes para un estudiante
   */
  async getPendientes(estudianteId: string): Promise<EncuestaConDetalles[]> {
    const response = await apiClient.get(`${this.baseURL}/pendientes/${estudianteId}`)
    return response.data
  }

  /**
   * Obtener una respuesta específica
   */
  async getByEncuestaYEstudiante(
    encuestaId: string,
    estudianteId: string
  ): Promise<EncuestaEstudiante | null> {
    const response = await apiClient.get(
      `${this.baseURL}/encuesta/${encuestaId}/estudiante/${estudianteId}`
    )
    return response.data
  }

  /**
   * Crear respuesta de encuesta
   */
  async create(data: CreateEncuestaEstudianteDto): Promise<EncuestaEstudiante> {
    const response = await apiClient.post(this.baseURL, data)
    return response.data
  }

  /**
   * Actualizar respuesta de encuesta
   */
  async update(
    encuestaId: string,
    estudianteId: string,
    data: UpdateEncuestaEstudianteDto
  ): Promise<EncuestaEstudiante> {
    const response = await apiClient.put(
      `${this.baseURL}/encuesta/${encuestaId}/estudiante/${estudianteId}`,
      data
    )
    return response.data
  }

  /**
   * Eliminar respuesta de encuesta
   */
  async delete(encuestaId: string, estudianteId: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/encuesta/${encuestaId}/estudiante/${estudianteId}`)
  }

  /**
   * Verificar si un estudiante ya respondió una encuesta
   */
  async hasRespondido(encuestaId: string, estudianteId: string): Promise<boolean> {
    const response = await apiClient.get(
      `${this.baseURL}/has-respondido/${encuestaId}/${estudianteId}`
    )
    return response.data.respondida
  }
}

export default new EncuestaEstudianteService()
