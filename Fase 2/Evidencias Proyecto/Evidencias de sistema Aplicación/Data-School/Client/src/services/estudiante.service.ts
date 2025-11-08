import apiClient from './api.config';
import type {
  Estudiante,
  CreateEstudianteDTO,
  UpdateEstudianteDTO,
  UserQueryParams,
  MessageResponse
} from '@/types/users.types';

class EstudianteService {
  private readonly endpoint = '/estudiantes';

  /**
   * Obtener todos los estudiantes
   */
  async getAll(params?: UserQueryParams): Promise<Estudiante[]> {
    try {
      const response = await apiClient.get<Estudiante[]>(this.endpoint, { params });
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener la lista de estudiantes'
      );
    }
  }

  /**
   * Obtener estudiante por ID
   */
  async getById(id: string): Promise<Estudiante> {
    try {
      const response = await apiClient.get<Estudiante>(`${this.endpoint}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al obtener el estudiante'
      );
    }
  }

  /**
   * Crear nuevo estudiante
   */
  async create(data: CreateEstudianteDTO): Promise<Estudiante> {
    try {
      const response = await apiClient.post<Estudiante>(this.endpoint, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al crear el estudiante'
      );
    }
  }

  /**
   * Actualizar estudiante
   */
  async update(id: string, data: UpdateEstudianteDTO): Promise<Estudiante> {
    try {
      console.log('=== SERVICE DEBUG ===');
      console.log('ID estudiante:', id);
      console.log('Datos antes de enviar al backend:', JSON.stringify(data, null, 2));
      console.log('estado_activo:', data.estado_activo, 'tipo:', typeof data.estado_activo);
      
      const response = await apiClient.put<Estudiante>(`${this.endpoint}/${id}`, data);
      
      console.log('Respuesta del backend:', JSON.stringify(response.data, null, 2));
      console.log('estado_activo en respuesta:', response.data.estado_activo);
      console.log('=== FIN SERVICE DEBUG ===');
      
      return response.data;
    } catch (error: any) {
      console.error('Error en service.update:', error);
      throw new Error(
        error.response?.data?.message || 'Error al actualizar el estudiante'
      );
    }
  }

  /**
   * Deshabilitar estudiante (soft delete)
   */
  async disable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/disable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al deshabilitar el estudiante'
      );
    }
  }

  /**
   * Habilitar estudiante
   */
  async enable(id: string): Promise<MessageResponse> {
    try {
      const response = await apiClient.patch<MessageResponse>(`${this.endpoint}/${id}/enable`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Error al habilitar el estudiante'
      );
    }
  }
}

export default new EstudianteService();
