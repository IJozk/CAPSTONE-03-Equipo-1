import apiClient from './api.config';

export interface Matricula {
  matricula_id: string;
  estudiante_id: string;
  curso_id: string;
  tutor_titular_id: string;
  periodo: string;
  monto_matricula?: number;
  fecha_pago?: string;
  fecha_matricula: string;
  observaciones?: string;
  estado_matricula_id: number;
  created_at: string;
  updated_at: string;
}

export interface CreateMatriculaDTO {
  estudiante_id: string;
  curso_id: string;
  tutor_titular_id: string;
  periodo: string;
  monto_matricula?: number;
  fecha_pago?: string;
  observaciones?: string;
  estado_matricula_id?: number;
}

export interface UpdateMatriculaDTO {
  curso_id?: string;
  tutor_titular_id?: string;
  estado_matricula_id?: number;
  monto_matricula?: number;
  fecha_pago?: string;
  observaciones?: string;
}

export interface MatriculaQueryParams {
  periodo?: string;
  curso_id?: string;
  estado_matricula_id?: number;
}

class MatriculaService {
  private baseURL = '/matriculas';

  /**
   * Obtener todas las matrículas con filtros opcionales
   */
  async getAll(params?: MatriculaQueryParams): Promise<Matricula[]> {
    const response = await apiClient.get<Matricula[]>(this.baseURL, { params });
    return response.data;
  }

  /**
   * Obtener matrícula por ID
   */
  async getById(id: string): Promise<Matricula> {
    const response = await apiClient.get<Matricula>(`${this.baseURL}/${id}`);
    return response.data;
  }

  /**
   * Obtener matrículas de un estudiante
   */
  async getByEstudiante(estudianteId: string): Promise<Matricula[]> {
    const response = await apiClient.get<Matricula[]>(
      `${this.baseURL}/estudiante/${estudianteId}`
    );
    return response.data;
  }

  /**
   * Crear nueva matrícula
   */
  async create(data: CreateMatriculaDTO): Promise<Matricula> {
    const response = await apiClient.post<Matricula>(this.baseURL, data);
    return response.data;
  }

  /**
   * Actualizar matrícula
   */
  async update(id: string, data: UpdateMatriculaDTO): Promise<Matricula> {
    const response = await apiClient.put<Matricula>(`${this.baseURL}/${id}`, data);
    return response.data;
  }

  /**
   * Cambiar estado de matrícula
   */
  async changeStatus(id: string, estadoMatriculaId: number): Promise<Matricula> {
    const response = await apiClient.patch<Matricula>(
      `${this.baseURL}/${id}/status`,
      { estado_matricula_id: estadoMatriculaId }
    );
    return response.data;
  }

  /**
   * Eliminar matrícula
   */
  async delete(id: string): Promise<void> {
    await apiClient.delete(`${this.baseURL}/${id}`);
  }
}

export default new MatriculaService();
