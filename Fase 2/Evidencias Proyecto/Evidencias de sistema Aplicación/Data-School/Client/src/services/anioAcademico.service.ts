import apiClient from "@/services/api.config";

export interface AnioAcademico {
  anio_id: number;
  anio: number;
  colegio_id: string;
  fecha_inicio: string;
  fecha_termino: string;
  primer_semestre_inicio: string | null;
  primer_semestre_fin: string | null;
  segundo_semestre_inicio: string | null;
  segundo_semestre_fin: string | null;
  vacaciones_invierno_inicio: string | null;
  vacaciones_invierno_fin: string | null;
  estado_activo: boolean | null;
  created_at: string | null;
  Colegio?: {
    colegio_id: string;
    nombre: string;
  };
}

export interface CreateAnioAcademicoDTO {
  colegio_id: string;
  anio: number;
  fecha_inicio: string;
  fecha_termino: string;
  primer_semestre_inicio?: string;
  primer_semestre_fin?: string;
  segundo_semestre_inicio?: string;
  segundo_semestre_fin?: string;
  vacaciones_invierno_inicio?: string;
  vacaciones_invierno_fin?: string;
}

export interface UpdateAnioAcademicoDTO {
  fecha_inicio?: string;
  fecha_termino?: string;
  primer_semestre_inicio?: string;
  primer_semestre_fin?: string;
  segundo_semestre_inicio?: string;
  segundo_semestre_fin?: string;
  vacaciones_invierno_inicio?: string;
  vacaciones_invierno_fin?: string;
  estado_activo?: boolean;
}

export interface PeriodoActual {
  anio_academico: AnioAcademico;
  periodo_actual: 'PRIMER_SEMESTRE' | 'VACACIONES_INVIERNO' | 'SEGUNDO_SEMESTRE' | 'FUERA_DE_PERIODO';
  fecha_actual: string;
}

class AnioAcademicoService {
  /**
   * Obtener todos los años académicos
   */
  async getAll(filters?: {
    colegio_id?: string;
    anio?: number;
    estado_activo?: boolean;
  }): Promise<AnioAcademico[]> {
    const response = await  apiClient.get('/anios-academicos', { params: filters });
    return response.data;
  }

  /**
   * Obtener año académico por ID
   */
  async getById(id: number): Promise<AnioAcademico> {
    const response = await  apiClient.get(`/anios-academicos/${id}`);
    return response.data;
  }

  /**
   * Obtener año académico activo de un colegio
   */
  async getActivo(colegioId: string): Promise<AnioAcademico> {
    const response = await  apiClient.get(`/anios-academicos/colegio/${colegioId}/activo`);
    return response.data;
  }

  /**
   * Obtener información del periodo actual
   */
  async getPeriodoActual(colegioId: string): Promise<PeriodoActual> {
    const response = await  apiClient.get(`/anios-academicos/colegio/${colegioId}/periodo-actual`);
    return response.data;
  }

  /**
   * Crear nuevo año académico
   */
  async create(data: CreateAnioAcademicoDTO): Promise<AnioAcademico> {
    const response = await  apiClient.post('/anios-academicos', data);
    return response.data;
  }

  /**
   * Actualizar año académico
   */
  async update(id: number, data: UpdateAnioAcademicoDTO): Promise<AnioAcademico> {
    const response = await  apiClient.put(`/anios-academicos/${id}`, data);
    return response.data;
  }

  /**
   * Activar año académico
   */
  async activate(id: number): Promise<AnioAcademico> {
    const response = await  apiClient.patch(`/anios-academicos/${id}/activar`);
    return response.data;
  }

  /**
   * Deshabilitar año académico
   */
  async disable(id: number): Promise<void> {
    await  apiClient.patch(`/anios-academicos/${id}/deshabilitar`);
  }

  /**
   * Eliminar año académico
   */
  async delete(id: number): Promise<void> {
    await  apiClient.delete(`/anios-academicos/${id}`);
  }
}

export default new AnioAcademicoService();
