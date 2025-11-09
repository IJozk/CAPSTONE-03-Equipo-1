/**
 * encuesta.service.ts
 * Servicio para manejar las peticiones API de encuestas
 *
 * Endpoints incluidos:
 * - GET /api/encuestas - Obtener todas las encuestas
 * - GET /api/encuestas/activas - Obtener encuestas activas
 * - GET /api/encuestas/:id - Obtener encuesta por ID
 * - GET /api/encuestas/:id/respuestas - Obtener respuestas de una encuesta
 * - GET /api/encuestas/:id/estadisticas - Obtener estadísticas de una encuesta
 * - POST /api/encuestas - Crear nueva encuesta
 * - PUT /api/encuestas/:id - Actualizar encuesta
 * - PATCH /api/encuestas/:id/estado - Cambiar estado de encuesta
 * - DELETE /api/encuestas/:id - Eliminar encuesta
 */

import apiClient from './api.config';

export interface TipoEncuesta {
  tipo_encuesta_id: number;
  nombre_tipo: string;
  descripcion?: string;
}

export interface Encuesta {
  encuesta_id: string; // UUID
  titulo: string;
  descripcion?: string;
  dirigida_a: 'ESTUDIANTES' | 'APODERADOS' | 'PROFESORES' | 'ADMINISTRATIVOS';
  fecha_inicio: string;
  fecha_fin: string;
  estado_activo: boolean;
  template_encuesta?: any; // JSON
  tipo_encuesta_id: number;
  created_at?: string;
  TipoEncuesta?: TipoEncuesta;
}

export interface RespuestaEncuesta {
  encuesta_id: string; // UUID
  estudiante_id: number;
  contenido: any; // JSON
  contestado_por?: number;
  contestada_correctemente?: boolean;
  contestado_en?: string;
  Estudiante?: {
    estudiante_id: number;
    nombre_completo: string;
  };
}

export interface EstadisticasEncuesta {
  encuesta_id: string; // UUID
  titulo: string;
  total_respuestas: number;
  respuestas_correctas: number;
  porcentaje_correctas: number;
  total_estudiantes_objetivo?: number;
}

export interface CreateEncuestaDto {
  titulo: string;
  descripcion?: string;
  dirigida_a: 'ESTUDIANTES' | 'APODERADOS' | 'PROFESORES' | 'ADMINISTRATIVOS';
  fecha_inicio: string;
  fecha_fin: string;
  estado_activo?: boolean;
  template_encuesta?: any;
  tipo_encuesta_id: number;
}

export interface UpdateEncuestaDto {
  titulo?: string;
  descripcion?: string;
  dirigida_a?: 'ESTUDIANTES' | 'APODERADOS' | 'PROFESORES' | 'ADMINISTRATIVOS';
  fecha_inicio?: string;
  fecha_fin?: string;
  estado_activo?: boolean;
  template_encuesta?: any;
  tipo_encuesta_id?: number;
}

class EncuestaService {
  /**
   * Obtiene todas las encuestas
   * GET /api/encuestas?activo={true|false}&dirigida_a={tipo}
   */
  async getAll(activo?: boolean, dirigidaA?: string): Promise<Encuesta[]> {
    const params = new URLSearchParams();
    if (activo !== undefined) params.append('activo', activo.toString());
    if (dirigidaA) params.append('dirigida_a', dirigidaA);

    const response = await apiClient.get<Encuesta[]>(
      `/encuestas?${params.toString()}`
    );
    return response.data;
  }

  /**
   * Obtiene encuestas activas (entre fecha_inicio y fecha_fin)
   * GET /api/encuestas/activas
   */
  async getActivas(): Promise<Encuesta[]> {
    const response = await apiClient.get<Encuesta[]>('/encuestas/activas');
    return response.data;
  }

  /**
   * Obtiene una encuesta por ID
   * GET /api/encuestas/:id
   */
  async getById(id: string): Promise<Encuesta> {
    const response = await apiClient.get<Encuesta>(`/encuestas/${id}`);
    return response.data;
  }

  /**
   * Obtiene las respuestas de una encuesta
   * GET /api/encuestas/:id/respuestas
   */
  async getRespuestas(id: string): Promise<RespuestaEncuesta[]> {
    const response = await apiClient.get<RespuestaEncuesta[]>(
      `/encuestas/${id}/respuestas`
    );
    return response.data;
  }

  /**
   * Obtiene estadísticas de una encuesta
   * GET /api/encuestas/:id/estadisticas
   */
  async getEstadisticas(id: string): Promise<EstadisticasEncuesta> {
    const response = await apiClient.get<EstadisticasEncuesta>(
      `/encuestas/${id}/estadisticas`
    );
    return response.data;
  }

  /**
   * Crea una nueva encuesta
   * POST /api/encuestas
   */
  async create(data: CreateEncuestaDto): Promise<Encuesta> {
    const response = await apiClient.post<Encuesta>('/encuestas', data);
    return response.data;
  }

  /**
   * Actualiza una encuesta
   * PUT /api/encuestas/:id
   */
  async update(id: string, data: UpdateEncuestaDto): Promise<Encuesta> {
    const response = await apiClient.put<Encuesta>(`/encuestas/${id}`, data);
    return response.data;
  }

  /**
   * Cambia el estado activo de una encuesta
   * PATCH /api/encuestas/:id/estado
   */
  async cambiarEstado(id: string, estadoActivo: boolean): Promise<Encuesta> {
    const response = await apiClient.patch<Encuesta>(
      `/encuestas/${id}/estado`,
      { estado_activo: estadoActivo }
    );
    return response.data;
  }

  /**
   * Elimina una encuesta
   * DELETE /api/encuestas/:id
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`/encuestas/${id}`);
  }
}

// Exportar instancia única del servicio
export default new EncuestaService();
